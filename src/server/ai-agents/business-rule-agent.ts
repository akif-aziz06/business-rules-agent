import { gs, GlideRecordSecure } from '@servicenow/glide'
// Namespaced platform APIs must be imported from their namespace subpath in
// module context — a bare `sn_ws.RESTMessageV2` throws "sn_ws is not defined".
import { RESTMessageV2 } from '@servicenow/glide/sn_ws'

// Table keywords used by the heuristic reasoner to identify the target table.
const TABLE_MAP: Record<string, string> = {
    incident: 'incident',
    change: 'change_request',
    problem: 'problem',
    task: 'task',
    request: 'sc_request',
    catalog: 'sc_req_item',
    user: 'sys_user',
    asset: 'alm_asset',
    cmdb: 'cmdb_ci',
    ci: 'cmdb_ci',
    case: 'sn_customerservice_case',
    hr: 'sn_hr_core_case',
}

const OPERATIONS = ['insert', 'update', 'delete', 'query']
const WHEN_VALUES = ['before', 'after', 'async', 'display']

// The canonical shape every reasoner (LLM or heuristic) resolves to and the UI
// renders as the editable BR Details tab.
type Operations = { insert: boolean; update: boolean; delete: boolean; query: boolean }
type SetValue = { field: string; value: string }
type Actions = { set_values: SetValue[]; add_message: boolean; message: string; abort_action: boolean }
type Proposal = {
    name: string
    table: string
    table_exists: boolean
    operations: Operations
    when: string
    condition: string
    role_conditions: string
    use_script: boolean
    actions: Actions
    script: string
}

/* -------------------------------------------------------------------------- */
/*  Coercion helpers — normalize loose LLM/heuristic output into the schema.   */
/* -------------------------------------------------------------------------- */

function coerceOperations(ops: any): Operations {
    const out: Operations = { insert: false, update: false, delete: false, query: false }
    if (Array.isArray(ops)) {
        ops.forEach((o) => {
            const k = String(o).toLowerCase()
            if (k in out) (out as any)[k] = true
        })
    } else if (ops && typeof ops === 'object') {
        OPERATIONS.forEach((k) => {
            ;(out as any)[k] = !!ops[k]
        })
    }
    // Never emit a rule that fires on nothing — default to record lifecycle events.
    if (!out.insert && !out.update && !out.delete && !out.query) {
        out.insert = true
        out.update = true
    }
    return out
}

function coerceActions(a: any): Actions {
    const out: Actions = { set_values: [], add_message: false, message: '', abort_action: false }
    if (a && typeof a === 'object') {
        const sv = a.set_values
        if (Array.isArray(sv)) {
            sv.forEach((row: any) => {
                if (row && (row.field || row.name)) {
                    out.set_values.push({
                        field: String(row.field || row.name),
                        value: String(row.value != null ? row.value : ''),
                    })
                }
            })
        }
        out.add_message = !!a.add_message
        out.message = String(a.message || '')
        out.abort_action = !!a.abort_action
    }
    return out
}

/**
 * Ensure a self-invoking Business Rule body preserves the platform-injected
 * `current`/`previous` globals inside its scope. A param-less IIFE that
 * references current/previous resolves them as undefined — this rewrites the
 * signature (and its invocation) to pass them in explicitly.
 */
function normalizeScriptScope(script: string): string {
    let s = String(script || '').trim()
    if (!s) return s
    const usesCP = /\bcurrent\b|\bprevious\b/.test(s)
    if (usesCP && /\(\s*function\s*\(\s*\)/.test(s)) {
        s = s.replace(/\(\s*function\s*\(\s*\)/, '(function(current, previous)')
        // Fix the invocation tail: `})();` / `})()` → `})(current, previous);`
        s = s.replace(/\}\s*\)\s*\(\s*\)\s*;?\s*$/, '})(current, previous);')
    }
    return s
}

/* -------------------------------------------------------------------------- */
/*  Heuristic script builder — used when scripting is required but no LLM      */
/*  script is available. Always passes current/previous into the IIFE.          */
/* -------------------------------------------------------------------------- */

function buildScript(action: string, table: string): string {
    const actionLower = String(action || '').toLowerCase()
    let innerLogic: string

    if (/notif|email|alert/i.test(actionLower)) {
        innerLogic = [
            '        // Emit a platform event to trigger a notification.',
            "        gs.eventQueue('x_1896745_brule.rule_notification', current, current.getValue('assigned_to'), '');",
        ].join('\n')
    } else if (/creat|insert.*record|new.*record|related/i.test(actionLower)) {
        innerLogic = [
            '        // Create a related record.',
            "        var related = new GlideRecordSecure('task');",
            '        related.initialize();',
            "        related.setValue('parent', current.getUniqueValue());",
            "        related.setValue('short_description', 'Auto-created by Business Rule: ' + current.getDisplayValue());",
            '        related.insert();',
        ].join('\n')
    } else if (/log|audit|track/i.test(actionLower)) {
        innerLogic = [
            '        // Audit log — record the business event.',
            `        gs.info('x_1896745_brule: Rule triggered on ${table}, record=' + current.getUniqueValue());`,
        ].join('\n')
    } else {
        innerLogic = [
            '        // TODO: Implement — ' + String(action || '').replace(/\n/g, ' '),
            '        // current and previous are available in this scope.',
            '        // Use GlideRecordSecure (not GlideRecord) for any embedded queries.',
            '        // Never call current.update() in a before or after rule.',
        ].join('\n')
    }

    return [
        '(function(current, previous) {',
        '    try {',
        innerLogic,
        '    } catch (e) {',
        "        gs.error('x_1896745_brule.generated_rule: ' + String(e));",
        '    }',
        '})(current, previous);',
    ].join('\n')
}

/* -------------------------------------------------------------------------- */
/*  Vague-prompt interception                                                  */
/* -------------------------------------------------------------------------- */

/**
 * A requirement is "vague" when it lacks the minimum needed to build a rule:
 * a recognizable table context AND an action. e.g. "make a BR" is halted so the
 * agent can ask for Table, Action, and Condition before proceeding.
 */
function isVague(text: string): boolean {
    const t = String(text || '').toLowerCase().trim()
    if (!t || t.split(/\s+/).length < 4) return true
    const hasTable = Object.keys(TABLE_MAP).some((k) => t.includes(k)) || /\btable\b/.test(t)
    const hasAction =
        /\b(set|updat|creat|insert|delet|remov|notif|email|assign|validat|abort|prevent|reject|add|send|log|populat|calculat|restrict|copy|clear|flag)\w*/.test(
            t,
        )
    return !(hasTable && hasAction)
}

/* -------------------------------------------------------------------------- */
/*  Heuristic reasoner — structural fallback when the LLM is unavailable.       */
/* -------------------------------------------------------------------------- */

function heuristicReason(requirement: string): Proposal {
    const raw = String(requirement || '').trim()
    const text = raw.toLowerCase()

    // Operations — independent multi-select, not mutually exclusive.
    const operations: Operations = { insert: false, update: false, delete: false, query: false }
    if (/\b(insert\w*|creat\w*|add(?:ed|ing|s)?|new\s+record|submit\w*)\b/.test(text)) operations.insert = true
    if (/\b(updat\w*|modif\w*|chang\w*|edit\w*|reassign\w*)\b/.test(text)) operations.update = true
    if (/\b(delet\w*|remov\w*|destroy\w*)\b/.test(text)) operations.delete = true
    if (/\b(quer\w*|read|fetch\w*|search\w*|lookup\w*)\b/.test(text)) operations.query = true
    if (!operations.insert && !operations.update && !operations.delete && !operations.query) {
        operations.insert = true
        operations.update = true
    }

    // Target table.
    let table = 'incident'
    for (const keyword of Object.keys(TABLE_MAP)) {
        if (text.includes(keyword)) {
            table = TABLE_MAP[keyword]
            break
        }
    }

    // Condition — reflect the prompt; never hardcode active=true.
    let condition = ''
    const stateMatch = text.match(/state\s*(?:is|=|equals?)\s*['"]?(\w+)['"]?/)
    if (stateMatch) {
        condition = 'state=' + stateMatch[1]
    } else if (/priorit[yi]\s*(?:is|=)?\s*(?:high|1|critical)/.test(text)) {
        condition = 'priority=1'
    } else if (/\binactive\b|active\s*=?\s*false/.test(text)) {
        condition = 'active=false'
    } else if (/\bactive\b/.test(text)) {
        condition = 'active=true'
    }

    // Action phrase (text after common markers).
    const actionMatch = raw.match(/(?:then|should|must|will|to)\s+(.+?)(?:[.!]|$)/i)
    const action = actionMatch ? actionMatch[1].trim() : raw

    // When-to-run — dynamic; no hardcoded default.
    let when = 'after'
    if (/validat|abort|before\s+save|prevent|block|reject|mandatory|require|not\s+allow/.test(text)) {
        when = 'before'
    } else if (/external|third.?party|integrat|\brest\b|\bsoap\b|webhook|heavy|background|asynchronous|\basync\b/.test(text)) {
        when = 'async'
    } else if (/display|show\s+on\s+(?:the\s+)?form|on\s+the\s+form|form\s+load|read.?only\s+on\s+form/.test(text)) {
        when = 'display'
    } else {
        when = 'after'
    }

    // Role conditions — populate only when access/role limits are implied.
    let roleConditions = ''
    if (/\brole\b|\bpermission\b|only\s+.*\s+can\b|restrict/.test(text)) {
        const rm = text.match(/\b(admin|itil|catalog_admin|approver_user|sn_[a-z_]+)\b/)
        if (rm) roleConditions = rm[1]
    }

    // Actions vs. scripting — prefer native actions for simple set/message/abort.
    const setValues: SetValue[] = []
    const sm = raw.match(/set\s+(?:the\s+)?([a-z0-9_]+)\s+(?:field\s+)?to\s+([\w'". -]+?)(?:\.|,|;|$|\s+when\b|\s+if\b|\s+and\b)/i)
    if (sm) {
        setValues.push({ field: sm[1].toLowerCase(), value: sm[2].trim().replace(/['"]/g, '') })
    }

    let abortAction = false
    if (/\babort\b|\bprevent\b|\bblock\b|\breject\b|do\s+not\s+allow|not\s+allow/.test(text)) {
        abortAction = true
        when = 'before'
    }

    let addMessage = false
    let message = ''
    if (/\bmessage\b|error\s+message|warn\s+the\s+user|show\s+.*\s+message|display\s+.*\s+message/.test(text)) {
        addMessage = true
        message = 'Action processed by the Business Rule.'
    }

    const useScript = !(setValues.length > 0 || addMessage || abortAction)
    const script = useScript ? buildScript(action, table) : ''

    return {
        name: '',
        table,
        table_exists: true,
        operations,
        when,
        condition,
        role_conditions: roleConditions,
        use_script: useScript,
        actions: { set_values: setValues, add_message: addMessage, message, abort_action: abortAction },
        script,
    }
}

/* -------------------------------------------------------------------------- */
/*  LLM reasoner — structural reasoning over semantic intent (primary path).   */
/* -------------------------------------------------------------------------- */

/**
 * Calls the Anthropic Messages API to reason about the requirement and return a
 * full structured proposal — Operations, When-to-run, Condition-builder-vs-
 * script, and Actions-vs-script are all decided here. The deterministic
 * validator stays the safety gate. Returns { success: false } whenever the LLM
 * is disabled, unconfigured, errors, or returns unparseable output — the caller
 * then falls back to heuristicReason().
 */
function llmReason(requirement: string): { success: boolean; vague?: boolean; clarification?: string; proposal?: Proposal; reason?: string } {
    try {
        const apiKey = String(gs.getProperty('x_1896745_brule.anthropic_api_key', '')).trim()
        if (!apiKey) return { success: false, reason: 'no_key' }

        const model = String(gs.getProperty('x_1896745_brule.llm_model', 'claude-haiku-4-5')) || 'claude-haiku-4-5'

        const system = [
            'You are a ServiceNow Business Rule design engine. Reason about the SEMANTIC INTENT of a plain-English requirement — do not rely on explicit keywords — and produce the safest, most native Business Rule configuration for the sys_script table.',
            '',
            'Decide, by reasoning:',
            '1. Operations: which of insert/update/delete/query the automation applies to (any combination). Insert = new records, Update = changes, Delete = removals, Query = read access.',
            '2. when: the optimal hook point — "before" for data validation / submission aborts / setting fields on the same record; "after" for independent record tracking, notifications, or related-record creation; "async" for third-party integrations or heavy background work; "display" for preparing data for form display.',
            '3. Condition vs. script: put simple logical evaluations (state changes, field matching) in the encoded condition string for the native Condition Builder — do NOT embed simple conditions in the script body. Do NOT hardcode active=true; only set a condition the requirement actually implies.',
            '4. Actions vs. script: if the automation just sets field values, adds a message, or aborts, use native actions (use_script=false) instead of scripting. Reserve scripting (use_script=true) strictly for complex logic that cannot be done natively.',
            '',
            'When use_script is true, the script MUST:',
            '- Be a self-contained IIFE that passes current and previous into its signature: (function(current, previous){ try { ... } catch(e){ gs.error(...); } })(current, previous);',
            '- NEVER call current.update() in a before or after rule (causes infinite recursion). In before rules set fields in memory with current.setValue(...); the platform commits automatically.',
            '- After rules must never modify the current record; they may insert/update OTHER tables only.',
            '- Use GlideRecordSecure, never GlideRecord.',
            '',
            'If the requirement is too vague to build a rule (missing a table or an action, e.g. "make a BR"), set "vague": true and a short "clarification" asking for the minimum: Table, Action, Condition.',
            '',
            'Return ONLY minified JSON, no markdown, of exactly this shape:',
            '{"vague":false,"clarification":"","name":"","table":"<table_name>","operations":["insert"],"when":"after","condition":"","role_conditions":"","use_script":false,"actions":{"set_values":[{"field":"","value":""}],"add_message":false,"message":"","abort_action":false},"script":"","reasoning":""}',
        ].join('\n')

        const requestBody = {
            model: model,
            max_tokens: 2048,
            system: system,
            messages: [{ role: 'user', content: 'Requirement: ' + String(requirement || '') }],
        }

        const r = new RESTMessageV2()
        r.setEndpoint('https://api.anthropic.com/v1/messages')
        r.setHttpMethod('POST')
        r.setRequestHeader('x-api-key', apiKey)
        r.setRequestHeader('anthropic-version', '2023-06-01')
        r.setRequestHeader('content-type', 'application/json')
        r.setRequestBody(JSON.stringify(requestBody))

        const resp = r.execute()
        const status = resp.getStatusCode()
        const respBody = String(resp.getBody() || '')
        if (status !== 200) {
            gs.error('x_1896745_brule.llmReason: HTTP ' + status + ' ' + respBody.slice(0, 500))
            return { success: false, reason: 'http_' + status }
        }

        const parsed: any = JSON.parse(respBody)
        let text = ''
        if (parsed && parsed.content && parsed.content.length) {
            for (let i = 0; i < parsed.content.length; i++) {
                if (parsed.content[i] && parsed.content[i].type === 'text') {
                    text += String(parsed.content[i].text || '')
                }
            }
        }
        text = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()

        const obj: any = JSON.parse(text)
        if (obj && obj.vague) {
            return { success: true, vague: true, clarification: String(obj.clarification || '') }
        }

        const proposal: Proposal = {
            name: String(obj.name || ''),
            table: String(obj.table || 'incident').trim(),
            table_exists: true,
            operations: coerceOperations(obj.operations),
            when: WHEN_VALUES.indexOf(String(obj.when || '').toLowerCase()) >= 0 ? String(obj.when).toLowerCase() : 'after',
            condition: String(obj.condition || '').trim(),
            role_conditions: String(obj.role_conditions || '').trim(),
            use_script: !!obj.use_script,
            actions: coerceActions(obj.actions),
            script: normalizeScriptScope(String(obj.script || '')),
        }
        return { success: true, vague: false, proposal, reason: String(obj.reasoning || '') }
    } catch (e) {
        gs.error('x_1896745_brule.llmReason: ' + String(e))
        return { success: false, reason: 'exception' }
    }
}

/* -------------------------------------------------------------------------- */
/*  Safety-gate validator — the deterministic guardrail on any proposal.       */
/* -------------------------------------------------------------------------- */

/**
 * Enforces the non-negotiable platform safety rules on a proposal regardless of
 * how it was produced. Returns hard `errors` (block creation, HTTP 422) and
 * soft `warnings` (surfaced for review). Also repairs the script scope and, for
 * native-action proposals, guarantees a usable script fallback is absent.
 */
function validateProposal(p: Proposal): { errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    if (p.use_script) {
        p.script = normalizeScriptScope(p.script)
        if (!p.script.trim()) {
            // Scripting was chosen but no body supplied — leave a safe stub.
            p.script = buildScript('', p.table)
        }
        // Hard rule: no current.update() in before/after (recursive loops).
        if ((p.when === 'before' || p.when === 'after') && /current\s*\.\s*update\s*\(/.test(p.script)) {
            errors.push(
                'SAFETY: current.update() is not permitted in ' +
                    p.when +
                    ' rules — it causes recursive execution loops. Use current.setValue(...) in a Before rule, or move the write to an Async rule targeting a separate GlideRecord.',
            )
        }
        // Scope integrity: a wrapped body must resolve current/previous.
        if (/\(\s*function\s*\(\s*\)/.test(p.script) && /\bcurrent\b|\bprevious\b/.test(p.script)) {
            errors.push('SAFETY: generated script wraps current/previous in a scope that does not receive them — they would resolve as undefined at runtime.')
        }
    }

    // After-rule same-record modification → nudge toward Before.
    if (p.when === 'after' && !p.use_script && p.actions.set_values.length > 0) {
        warnings.push('PLATFORM RISK: setting fields on the current record in an After rule causes an extra DB write. A Before rule is usually correct for same-record changes.')
    }

    // Query operation fires on every table read — flag for explicit review.
    if (p.operations.query) {
        warnings.push('The Query operation fires on every read of this table. Confirm this is intended before creating the rule.')
    }

    return { errors, warnings }
}

/* -------------------------------------------------------------------------- */
/*  Table existence — validates the target against sys_db_object.              */
/* -------------------------------------------------------------------------- */

function tableExists(table: string): boolean {
    try {
        if (!table) return false
        const gr = new GlideRecordSecure('sys_db_object')
        gr.addQuery('name', table)
        gr.setLimit(1)
        gr.query()
        return gr.next()
    } catch (e) {
        // On a lookup failure, don't falsely report the table as missing.
        gs.error('x_1896745_brule.tableExists: ' + String(e))
        return true
    }
}

/* -------------------------------------------------------------------------- */
/*  Conflict detection — informational; surfaced as warnings only.             */
/* -------------------------------------------------------------------------- */

export function detectConflicts(inputs: Record<string, string>): any {
    try {
        const targetTable = String(inputs.target_table || '')
        const conflicts: Array<{ type: string; name: string; table: string }> = []

        const brGr = new GlideRecordSecure('sys_script')
        brGr.addQuery('collection', targetTable)
        brGr.addQuery('active', true)
        brGr.setLimit(50)
        brGr.query()
        while (brGr.next()) {
            conflicts.push({ type: 'business_rule', name: String(brGr.getValue('name')), table: targetTable })
        }

        return { success: true, conflict_count: conflicts.length, conflicts_json: JSON.stringify(conflicts) }
    } catch (e) {
        gs.error('x_1896745_brule.detectConflicts: ' + String(e))
        return { success: false, conflict_count: 0, error: String(e) }
    }
}

/* -------------------------------------------------------------------------- */
/*  REST route handler — POST /api/x_1896745_brule/business_rule_agent/generate */
/* -------------------------------------------------------------------------- */

/**
 * Self-contained (no cross-module imports) so the ServiceNow runtime module
 * loader resolves it from a single sys_module record.
 *
 * Returns a *proposal* for human review in the BR Details tab — it does NOT
 * persist anything. The client renders the proposal, lets the admin edit every
 * field, and only then writes the record via the platform Table API (the scoped
 * app may not write to the global sys_script table).
 *
 * Pipeline: vague check → LLM reasoning (heuristic fallback) → safety gate →
 * table-exists check → conflict warnings → return editable proposal.
 */
export function process(request: any, response: any): void {
    try {
        const rawBody = String((request.body && request.body.dataString) || '{}')
        let body: any = {}
        try {
            body = JSON.parse(rawBody)
        } catch (_) {
            response.setStatus(400)
            response.setBody({ error: 'Request body must be valid JSON' })
            return
        }

        const requirement = String(body.requirement || '').trim()
        if (!requirement) {
            response.setStatus(400)
            response.setBody({ error: '"requirement" is required in the request body' })
            return
        }

        // --- Vague-prompt interception (cheap heuristic gate before any LLM call) ---
        if (isVague(requirement)) {
            response.setStatus(200)
            response.setBody({
                success: true,
                needs_input: true,
                message:
                    'That requirement is too vague to build a safe Business Rule. Please provide the minimum basics: the Table, the Action, and the Condition (for example: "On the incident table, set priority to 1 when the category is network").',
            })
            return
        }

        // --- Reasoning: LLM first, deterministic heuristic as fallback ---
        let generatedBy = 'llm'
        let reasoned = llmReason(requirement)
        if (!reasoned.success) {
            generatedBy = 'heuristic'
            reasoned = { success: true, vague: false, proposal: heuristicReason(requirement) }
        }

        // The LLM may independently judge the prompt vague.
        if (reasoned.vague) {
            response.setStatus(200)
            response.setBody({
                success: true,
                needs_input: true,
                message:
                    reasoned.clarification ||
                    'That requirement is too vague. Please specify the Table, the Action, and the Condition.',
            })
            return
        }

        const proposal = reasoned.proposal as Proposal

        // --- Safety gate ---
        const gate = validateProposal(proposal)
        if (gate.errors.length > 0) {
            response.setStatus(422)
            response.setBody({
                success: false,
                error: 'Safety validation blocked this rule — resolve the violations before retrying.',
                violations: gate.errors,
            })
            return
        }

        // --- Table existence (validated against sys_db_object) ---
        proposal.table_exists = tableExists(proposal.table)

        // --- Conflict detection → warnings only (not surfaced as a count) ---
        const warnings = gate.warnings.slice()
        const conflictResult: any = detectConflicts({ target_table: proposal.table })
        if (Number(conflictResult.conflict_count) > 0) {
            warnings.push(
                Number(conflictResult.conflict_count) +
                    ' existing active Business Rule(s) already run on ' +
                    proposal.table +
                    '. Review for overlap before creating another.',
            )
        }

        // --- Name: honor a caller-supplied name, else suggest a sensible default ---
        if (body.name && String(body.name).trim()) {
            proposal.name = String(body.name).trim()
        } else if (!proposal.name) {
            const firstOp = OPERATIONS.filter((o) => (proposal.operations as any)[o])[0] || 'update'
            proposal.name = 'BR_' + proposal.table + '_' + firstOp
        }

        response.setStatus(200)
        response.setBody({
            success: true,
            needs_input: false,
            proposal,
            meta: {
                generated_by: generatedBy,
                warnings,
                reasoning: String(reasoned.reason || ''),
            },
        })
    } catch (e) {
        gs.error('x_1896745_brule.BusinessRuleOrchestrator: ' + String(e))
        response.setStatus(500)
        response.setBody({ error: String(e) })
    }
}
