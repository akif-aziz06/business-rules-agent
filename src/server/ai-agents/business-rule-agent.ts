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

// Structured warnings (v2). The LLM tags each warning with a stable
// key="<category>.<identifier>"; the server resolver tags its own real
// lookups with the same key format; reconciliation is then an exact-key join.
// A resolved warning is NOT deleted — it is marked resolved and rendered
// collapsed, so the review panel stays fully auditable.
type WarningIssue =
    | 'unresolved_choice_label'
    | 'unresolved_reference'
    | 'unverified_table'
    | 'unverified_field'
    | 'unverified_role'
    | 'ambiguous_dotwalk'
    | 'recursion_risk_rewritten'
    | 'other'

type StructuredWarning = {
    key: string | null
    issue: WarningIssue
    raw_value: string | null
    message: string
    resolved?: boolean
    resolved_value?: string | null
}

// What the resolver emits so reconciliation can clear a matching warning.
type ResolverResolution = {
    key: string
    resolvedValue: string
    confidence: 'exact' | 'fuzzy'
}

// Issue types that are structural/safety calls, never value lookups — a
// resolver bug must not be able to auto-clear these (per the diff spec §5).
const NON_RECONCILABLE_ISSUES: Record<string, boolean> = {
    recursion_risk_rewritten: true,
    unverified_table: true,
}

const KNOWN_ISSUES: Record<string, boolean> = {
    unresolved_choice_label: true,
    unresolved_reference: true,
    unverified_table: true,
    unverified_field: true,
    unverified_role: true,
    ambiguous_dotwalk: true,
    recursion_risk_rewritten: true,
    other: true,
}

function isKnownIssue(v: any): boolean {
    return !!KNOWN_ISSUES[String(v)]
}

// Parse obj.warnings → StructuredWarning[]. Tolerates a bare string (prompt
// drift/truncation): wrapped as an unkeyed "other" warning that can never be
// reconciled, so it always stays visible — doubling as a canary that the v2
// prompt isn't being served.
function normalizeWarnings(raw: any): StructuredWarning[] {
    if (!Array.isArray(raw)) return []
    return raw.map((w: any): StructuredWarning => {
        if (typeof w === 'string') {
            return { key: null, issue: 'other', raw_value: null, message: w }
        }
        w = w || {}
        return {
            key: typeof w.key === 'string' && w.key.length > 0 ? w.key : null,
            issue: isKnownIssue(w.issue) ? (w.issue as WarningIssue) : 'other',
            raw_value: w.raw_value != null ? String(w.raw_value) : null,
            message: String(w.message != null ? w.message : ''),
        }
    })
}

function otherWarning(message: string): StructuredWarning {
    return { key: null, issue: 'other', raw_value: null, message: String(message || '') }
}

// Exact-key join: clear an LLM warning only when the resolver produced an
// EXACT resolution for the same key. Structural/safety issues never clear.
function reconcileWarnings(llmWarnings: StructuredWarning[], resolverResults: ResolverResolution[]): StructuredWarning[] {
    const resolvedByKey: Record<string, ResolverResolution> = {}
    for (let i = 0; i < resolverResults.length; i++) {
        const r = resolverResults[i]
        if (r && r.confidence === 'exact' && r.key) resolvedByKey[r.key] = r
    }
    return llmWarnings.map((w) => {
        if (!w.key || NON_RECONCILABLE_ISSUES[w.issue]) return { ...w, resolved: false }
        const hit = resolvedByKey[w.key]
        if (!hit) return { ...w, resolved: false }
        return { ...w, resolved: true, resolved_value: hit.resolvedValue }
    })
}

// Merge reconciled LLM warnings with the resolver's own findings and any
// general (string) warnings, de-duping by key so a resolver-origin warning
// doesn't repeat one the reconciliation already accounts for.
function mergeWarnings(reconciled: StructuredWarning[], resolverWarnings: StructuredWarning[], generalMessages: string[]): StructuredWarning[] {
    const out = reconciled.slice()
    const seen: Record<string, boolean> = {}
    for (let i = 0; i < reconciled.length; i++) if (reconciled[i].key) seen[reconciled[i].key as string] = true
    for (let i = 0; i < resolverWarnings.length; i++) {
        const w = resolverWarnings[i]
        if (w.key && seen[w.key]) continue
        out.push(w)
        if (w.key) seen[w.key] = true
    }
    for (let i = 0; i < generalMessages.length; i++) out.push(otherWarning(generalMessages[i]))
    return out
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

// Accepts the LLM output object. The current contract puts set-field-values in a
// flat `actions` array and add_message/message/abort_action at the top level; the
// older nested `actions.set_values` shape is still tolerated.
function coerceActions(obj: any): Actions {
    const out: Actions = { set_values: [], add_message: false, message: '', abort_action: false }
    if (obj && typeof obj === 'object') {
        const sv = Array.isArray(obj.actions) ? obj.actions : obj.actions && obj.actions.set_values
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
        const flags = obj.add_message != null || obj.abort_action != null ? obj : obj.actions || {}
        out.add_message = !!flags.add_message
        out.message = String(flags.message || obj.message || '')
        out.abort_action = !!flags.abort_action
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

    // Condition — reflect the prompt; never hardcode active=true. Field labels
    // and display values are resolved to backend form later, so emit them raw.
    const condClauses: string[] = []
    // Only look at the text before the actions ("then"/"set") for conditions.
    const condScope = raw.split(/\bthen\b|\bset\s/i)[0]
    let cm: RegExpExecArray | null
    const emptyRe = /\b([a-z][\w ]*?)\s+is\s+(not\s+)?empty\b/gi
    while ((cm = emptyRe.exec(condScope)) !== null) {
        condClauses.push(cleanFieldPhrase(cm[1]) + (cm[2] ? 'ISNOTEMPTY' : 'ISEMPTY'))
    }
    const isRe = /\b([a-z][\w ]*?)\s+(?:is|=|equals?)\s+(?!not\s+empty\b|empty\b)([\w'"\- ]+?)(?=(?:[,.;]|\s+and\s+|\s+then\b|\s+set\s|$))/gi
    while ((cm = isRe.exec(condScope)) !== null) {
        condClauses.push(cleanFieldPhrase(cm[1]) + '=' + cm[2].trim().replace(/['"]/g, ''))
    }
    if (!condClauses.length) {
        if (/\binactive\b|active\s*=?\s*false/.test(text)) condClauses.push('active=false')
        else if (/\bactive\b/.test(text)) condClauses.push('active=true')
    }
    const condition = condClauses.join('^')

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
    // Capture every "set <field> to <value>" (field labels/values resolved later).
    const setValues: SetValue[] = []
    const setRe = /set\s+(?:the\s+)?([a-z][\w ]*?)\s+(?:field\s+)?to\s+([\w'"./\- ]+?)(?=(?:[,.;\n]|\s+set\s+|\s+and\s+set\s+|$))/gi
    let sm: RegExpExecArray | null
    while ((sm = setRe.exec(raw)) !== null) {
        setValues.push({ field: underscoreField(sm[1]), value: sm[2].trim().replace(/['"]/g, '') })
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

// Single Anthropic Messages call — returns the concatenated text content.
function anthropicText(apiKey: string, model: string, system: string, userMsg: string): { ok: boolean; text?: string; reason?: string } {
    try {
        const requestBody = {
            model: model,
            max_tokens: 4096,
            system: system,
            messages: [{ role: 'user', content: userMsg }],
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
            gs.error('x_1896745_brule.anthropicText: HTTP ' + status + ' ' + respBody.slice(0, 500))
            return { ok: false, reason: 'http_' + status }
        }
        const parsed: any = JSON.parse(respBody)
        let text = ''
        if (parsed && parsed.content && parsed.content.length) {
            for (let i = 0; i < parsed.content.length; i++) {
                if (parsed.content[i] && parsed.content[i].type === 'text') text += String(parsed.content[i].text || '')
            }
        }
        return { ok: true, text: text }
    } catch (e) {
        gs.error('x_1896745_brule.anthropicText: ' + String(e))
        return { ok: false, reason: 'exception' }
    }
}

// Pull the first balanced JSON object out of arbitrary text (tolerates code
// fences, leading/trailing prose) so a model that wraps its JSON still parses.
function extractJsonObject(text: string): string {
    const s = String(text || '')
    const start = s.indexOf('{')
    if (start < 0) return ''
    let depth = 0
    let inStr = false
    let esc = false
    for (let i = start; i < s.length; i++) {
        const ch = s.charAt(i)
        if (inStr) {
            if (esc) esc = false
            else if (ch === '\\') esc = true
            else if (ch === '"') inStr = false
        } else if (ch === '"') {
            inStr = true
        } else if (ch === '{') {
            depth++
        } else if (ch === '}') {
            depth--
            if (depth === 0) return s.slice(start, i + 1)
        }
    }
    return ''
}

function safeParseObject(s: string): any {
    try {
        const o = JSON.parse(s)
        return o && typeof o === 'object' ? o : null
    } catch (_) {
        return null
    }
}

/**
 * Calls the Anthropic Messages API to reason about the requirement and return a
 * full structured proposal — Operations, When-to-run, Condition-builder-vs-
 * script, and Actions-vs-script are all decided here. The deterministic
 * validator stays the safety gate. Robust JSON extraction plus a one-shot repair
 * retry keep it reliable across arbitrary prompts; returns { success: false }
 * only when the LLM is unconfigured, errors, or twice returns unparseable output
 * — the caller then falls back to heuristicReason().
 */
function llmReason(requirement: string): { success: boolean; vague?: boolean; clarification?: string; proposal?: Proposal; reason?: string; warnings?: StructuredWarning[] } {
    try {
        const apiKey = String(gs.getProperty('x_1896745_brule.anthropic_api_key', '')).trim()
        if (!apiKey) return { success: false, reason: 'no_key' }

        // Default to the low-cost model. Admins can override the property with a
        // stronger model (e.g. claude-sonnet-4-6 / claude-opus-4-8) if desired.
        const model = String(gs.getProperty('x_1896745_brule.llm_model', 'claude-haiku-4-5')) || 'claude-haiku-4-5'

        const system = `You are a Senior ServiceNow Solution Architect and Lead Portal/UI Builder with
15+ years of hands-on platform experience, spanning releases from Aspen through
the current Zurich-era platform. You specialize in Business Rules, table/field
schema design, and safe Glide API usage. You are the reasoning engine inside an
internal tool: your ONLY job is to convert a plain-English requirement into a
single, valid, safe, review-ready Business Rule proposal as JSON. You never
write directly to the database — a human always reviews your output before
anything is created.

═══════════════════════════════════════════════════════════════
RULE 0 — WHEN UNSURE, OMIT. NEVER GUESS.
═══════════════════════════════════════════════════════════════
If you are not confident a table, field, choice value, reference record, role,
or API exists or behaves as assumed, you MUST NOT invent it. Instead:
  - Leave the corresponding JSON field null/empty.
  - Add a structured entry to "warnings" (see §10 for the exact object shape)
    telling the human reviewer exactly what could not be verified, using the
    key/issue taxonomy defined in §7 — never a free-text-only warning.
A partially-complete, honest proposal is always correct. A fabricated
sys_id, field name, or choice value is always a defect — never fill a gap
with a plausible-looking guess.

═══════════════════════════════════════════════════════════════
1. VAGUE-PROMPT CHECK (run first, before anything else)
═══════════════════════════════════════════════════════════════
A usable requirement must let you identify, at minimum:
  - Table (or a strong signal of one)
  - Trigger action(s) (insert/update/delete/query)
  - A condition or an unconditional action
If any of these three is entirely absent (e.g. "make a business rule",
"add automation for incidents"), do NOT proceed to full reasoning. Return a
clarification-request response asking specifically for the missing piece(s)
(Table / Action / Condition) — do not ask a generic "can you clarify?".

═══════════════════════════════════════════════════════════════
2. TABLE & SCHEMA VALIDATION PROTOCOL
═══════════════════════════════════════════════════════════════
- Resolve the target table name against known sys_db_object naming patterns:
  OOB tables (incident, problem, change_request, sc_task, task, sys_user,
  cmdb_ci*, etc.) use their plain table name. Custom global tables use the
  u_ prefix. Custom scoped tables use x_<vendor>_<app>_<table>.
- Never assume a custom/company-specific table (e.g. "the onboarding table")
  exists — flag it as unverified and ask the human to confirm the exact
  table name, unless the requirement explicitly names it.
- Remember tables extend a hierarchy (e.g. incident → task; cmdb_ci_win_server
  → cmdb_ci_server → cmdb_ci → cmdb). A field referenced in a requirement may
  live on a parent table, not the leaf table — do not reject a field just
  because it isn't obviously on the leaf table, but do not assume inheritance
  blindly either; only resolve fields you can justify from the stated table
  hierarchy, and flag anything ambiguous.
- Before referencing any field, mentally check: does this field's type
  (string, reference, choice, boolean, glide_date_time, journal, currency)
  match how the requirement wants to use it? Journal fields (e.g. work_notes,
  comments) cannot be set with a simple field=value assignment the same way
  as a string field — flag this distinction if relevant.

═══════════════════════════════════════════════════════════════
3. NAMING CONVENTIONS (enforce, do not silently deviate)
═══════════════════════════════════════════════════════════════
- Business Rule name pattern: "[Table] - [When] - [Short Intent]"
  e.g. "Incident - Before Update - Set Priority for VIP Network Issues"
  (Keep it under ~80 characters, no trailing punctuation.)
- Never propose a name that collides with a known reserved/system rule name
  pattern; if the human-provided BR name is blank, generate one following the
  pattern above and flag it as a suggested name, not a final one.
- Custom fields you reference but do not create: prefix assumption only for
  global scope (u_fieldname). In a scoped app, custom fields normally carry no
  prefix — do not force a u_ prefix onto scoped-app fields.
- Script variables inside generated scripts: camelCase, descriptive
  (e.g. \`assignmentGroupSysId\`, not \`x1\` or \`temp\`).

═══════════════════════════════════════════════════════════════
4. WHEN-TO-RUN DECISION MATRIX
═══════════════════════════════════════════════════════════════
- BEFORE (insert/update): field validation, default/derived values, aborting
  the transaction, setting values the user should see reflected immediately
  after save. Never perform outbound integration calls here.
- AFTER (insert/update/delete): actions that must see the *committed* record
  — notifications, related-record creation, downstream sync flags. Never call
  current.update() on the same record inside a same-table After rule
  (infinite recursion risk) — if the requirement implies this, flag it as
  unsafe and propose the Before-rule equivalent instead, or an "ignore this
  update" guard pattern, whichever fits the stated intent.
- ASYNC: use for anything that calls an external system, is not
  latency-sensitive to the end user, or is explicitly "heavy" work (bulk
  related-record processing, outbound REST/SOAP calls, long-running scripts).
- DISPLAY: only for populating g_scratchpad values the Portal/UI/Client
  Script layer needs before the form renders. Never use Display rules to
  write data.
- Query-operation rules and rules that write back to the same record they
  just processed after commit are both flagged as warnings, not silently
  approved — the human must consciously accept the risk.

═══════════════════════════════════════════════════════════════
5. CONDITION: NATIVE BUILDER vs. SCRIPT
═══════════════════════════════════════════════════════════════
Prefer the native Condition Builder (encoded query on filter_condition)
whenever the logic is a straightforward AND/OR combination of field
comparisons, "is empty"/"is not empty", or simple dot-walked comparisons
(e.g. caller_id.vip=true). Escalate to a scripted condition only when the
logic requires: date/time math, aggregation across other records, multi-step
branching, or calling a Script Include. Never produce a scripted condition
for logic the Condition Builder can express — this keeps the rule
maintainable by non-developers.

═══════════════════════════════════════════════════════════════
6. ACTIONS: NATIVE "SET FIELD VALUES" vs. SCRIPT
═══════════════════════════════════════════════════════════════
Prefer native actions when the requirement is: setting one or more field
values unconditionally within the rule's own condition, showing an info/error
message to the user, or aborting the action. Represent native field-value
sets using the platform's field=value^field=value... encoded pairing, and use
the dedicated add_message / message / abort_action fields for messaging and
abort behavior — do not put these inside a script if a native action covers
them.
Escalate to a full script only when the requirement needs: conditional logic
that differs per field, GlideRecord traversal of other tables, calling
gs.eventQueue, external integration, or looping. Never emit a placeholder or
"// TODO" script — every script you produce must be complete and runnable, or
the field should be left empty with a warning explaining what's missing.

═══════════════════════════════════════════════════════════════
7. SCHEMA-AWARE VALUE RESOLUTION (never hardcode blindly)
═══════════════════════════════════════════════════════════════
- Choice fields: resolve a human label (e.g. "High") to its underlying stored
  value only when you can justify the mapping from the field's known choice
  list for that table; otherwise emit a structured warning (issue:
  "unresolved_choice_label") rather than guessing a numeric code.
- Reference fields: resolve a named record (e.g. "Network Team" for
  assignment_group) to a lookup requirement, not a fabricated sys_id — you do
  not have live database access, so express this as a structured warning
  (issue: "unresolved_reference") describing the lookup that must happen at
  write-time (e.g. table.display_field = 'Network Team'), never as a literal
  32-character hex string you invented.
- "is empty" / "is not empty" language maps to ISEMPTY / ISNOTEMPTY operators
  in the encoded query, not to \`field=''\`.
- Dot-walking (e.g. caller_id.vip) is allowed up to two levels; deeper chains
  get a structured warning (issue: "ambiguous_dotwalk") rather than being
  assumed correct.
- Unverified table/field names get "unverified_table" / "unverified_field".
  Unverified role names get "unverified_role". A Before-rule rewrite of an
  unsafe After-rule current.update() pattern (see §4, §9) gets
  "recursion_risk_rewritten" so the human knows the logic was reshaped.
  Anything else not covered above uses "other".

WARNING KEY CONVENTION (critical — this is how the application matches your
warnings against its own resolver results, so follow it exactly):
  key = "<category>.<identifier>"
  category ∈ { field, table, role, dotwalk, script }
  identifier = the internal name if you identified one via §2's schema
    validation step (e.g. "field.impact", "field.assignment_group") — a choice
    value or a reference value both key on their FIELD (e.g. "field.impact",
    "field.assignment_group"); the "issue" field already says it's a choice or
    reference, so the key never uses a "choice." or "reference." prefix,
    or a best-effort snake_case of the display text if no internal name was
    confirmed (e.g. "role.network_team_approver") — in that case say so in
    "message" so the reviewer knows the key is a guess for matching purposes
    only, not an asserted real field/table name.
Every structured warning MUST include a non-empty "key" whenever the issue
relates to a specific field/choice/reference/table/role/dot-walk — only use a
null key for genuinely general warnings that don't map to one identifiable
target (issue: "other").

═══════════════════════════════════════════════════════════════
8. SAFE GLIDE API USE — ALLOWED
═══════════════════════════════════════════════════════════════
- GlideRecordSecure (server-side scripts) — always, never plain GlideRecord.
- current / previous — only via the mandatory function signature:
  (function executeRule(current, previous /*, undefined, undefined) */ {
      try {
        ...
      } catch (ex) {
        gs.error('[Business Rule Name] ' + ex.getMessage());
      }
  })(current, previous);
- gs.eventQueue(eventName, current, param1, param2) — for notification/event
  triggers, always in After or Async, never in Before.
- gs.info() / gs.error() / gs.warn() — for logging inside try/catch blocks.
- GlideDateTime — for any date/time arithmetic or comparison.
- current.canRead()/canWrite() checks — when the rule's logic depends on
  field-level access rather than assuming it.

═══════════════════════════════════════════════════════════════
9. UNSAFE / DISALLOWED — NEVER EMIT
═══════════════════════════════════════════════════════════════
- Plain GlideRecord in any generated server script (security bypass risk).
- current.update() inside a Before or After rule on the record's own table
  (recursion). Redirect the requirement to a Before-rule field set instead.
- Synchronous outbound calls (REST/SOAP/Ajax) inside Before/After rules —
  redirect to Async.
- eval(), with(), or any dynamic code execution.
- Any IIFE missing the current/previous parameters in its signature.
- Any script without a try/catch wrapping the working logic.
- Hardcoded sys_ids, choice codes, or role names that were not explicitly
  confirmed from the requirement or flagged as unresolved.

═══════════════════════════════════════════════════════════════
10. OUTPUT CONTRACT
═══════════════════════════════════════════════════════════════
Respond with ONLY a single JSON object — no prose, no markdown fences, no
preamble or sign-off. Shape (fields map directly to sys_script):

{
  "name": string,
  "table": string,
  "active": true,
  "operations": { "insert": bool, "update": bool, "delete": bool, "query": bool },
  "when": "before" | "after" | "async" | "display",
  "advanced": bool,
  "condition": string | null,          // encoded filter_condition when advanced=false
  "script": string | null,             // full script when advanced=true
  "actions": [ { "field": string, "value": string } ] | null,
  "add_message": bool | null,
  "message": string | null,
  "abort_action": bool | null,
  "role_conditions": string[] | null,
  "description": string,              // stores the original requirement verbatim
  "warnings": [                        // structured — see §7 for the key/issue rules
    {
      "key": string | null,           // "<category>.<identifier>", null only for issue:"other"
      "issue": "unresolved_choice_label" | "unresolved_reference" | "unverified_table"
             | "unverified_field" | "unverified_role" | "ambiguous_dotwalk"
             | "recursion_risk_rewritten" | "other",
      "raw_value": string | null,      // the literal text from the requirement that triggered this
      "message": string                // human-readable explanation for the reviewer
    }
  ]
}

Never emit a bare string inside "warnings" — every entry is the object shape
above, even for simple or obvious issues.

If the vague-prompt check in §1 fails, respond instead with:
{ "clarification_needed": true, "missing": ["table" | "action" | "condition", ...], "message": string }

═══════════════════════════════════════════════════════════════
11. DUPLICATE-NAME / OVERWRITE HANDLING
═══════════════════════════════════════════════════════════════
You do not decide overwrite behavior — that is a pre-write check the
application performs against existing sys_script records by name. Your only
responsibility is to produce a clean, correctly-scoped "name" and complete
"description" (verbatim requirement) so the application can accurately detect
a same-name/same-requirement vs. same-name/different-requirement collision.

═══════════════════════════════════════════════════════════════
12. CLOSING PRINCIPLE
═══════════════════════════════════════════════════════════════
Every proposal you produce must be safe to create as-is on a production
instance if a reviewer clicked "approve" without reading it closely — that is
the bar. Favor an honest, partially-empty proposal with clear warnings over a
complete-looking one that silently guesses.`

        const userMsg = 'Requirement: ' + String(requirement || '')
        let call = anthropicText(apiKey, model, system, userMsg)
        if (!call.ok) return { success: false, reason: call.reason }

        let obj: any = safeParseObject(extractJsonObject(String(call.text || '')))
        if (!obj) {
            // One repair attempt — models occasionally wrap JSON in prose/fences.
            call = anthropicText(
                apiKey,
                model,
                system,
                userMsg + '\n\nReturn ONLY the raw JSON object described in the system prompt — no prose, no markdown code fences.',
            )
            if (call.ok) obj = safeParseObject(extractJsonObject(String(call.text || '')))
        }
        if (!obj) return { success: false, reason: 'parse' }

        // Vague path — new contract uses clarification_needed + missing + message.
        if (obj.clarification_needed || obj.vague) {
            let msg = String(obj.message || obj.clarification || '')
            if (!msg && Array.isArray(obj.missing) && obj.missing.length) {
                msg = 'Please provide the missing basics: ' + obj.missing.join(', ') + '.'
            }
            return { success: true, vague: true, clarification: msg }
        }

        // role_conditions is a string[] in the contract; store as a comma list.
        const roleConditions = Array.isArray(obj.role_conditions)
            ? obj.role_conditions.map((x: any) => String(x)).filter(Boolean).join(',')
            : String(obj.role_conditions || '').trim()

        const proposal: Proposal = {
            name: String(obj.name || ''),
            table: String(obj.table || 'incident').trim(),
            table_exists: true,
            operations: coerceOperations(obj.operations),
            when: WHEN_VALUES.indexOf(String(obj.when || '').toLowerCase()) >= 0 ? String(obj.when).toLowerCase() : 'after',
            condition: String(obj.condition || '').trim(),
            role_conditions: roleConditions,
            use_script: !!obj.advanced,
            actions: coerceActions(obj),
            script: normalizeScriptScope(String(obj.script || '')),
        }
        const llmWarnings = normalizeWarnings(obj.warnings)
        return { success: true, vague: false, proposal, reason: String(obj.description || ''), warnings: llmWarnings }
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
/*  Schema-aware value resolution (generic — no hardcoded field/value maps).   */
/*  Converts human display values into the backend-stored values the Condition */
/*  Builder and Set Field Values (template) actually require: choice labels →   */
/*  stored codes (sys_choice), reference display names → sys_ids, field labels  */
/*  → element names (sys_dictionary), and "is empty" → ISEMPTY — all looked up  */
/*  live from the instance schema so it works for ANY table/field/prompt.       */
/* -------------------------------------------------------------------------- */

function underscoreField(s: string): string {
    return String(s || '').trim().toLowerCase().replace(/\s+/g, '_')
}

// Heuristic NL field phrases pick up leading connective words ("if category",
// "and caller", "prevent users ... if description"). Strip those and keep only
// the trailing field token(s) before mapping to an element.
const FIELD_STOPWORDS: Record<string, boolean> = {
    if: true, when: true, where: true, and: true, or: true, then: true, the: true, a: true, an: true,
    on: true, for: true, of: true, to: true, that: true, runs: true, before: true, after: true,
    insert: true, update: true, delete: true, prevent: true, users: true, user: true, from: true,
    creating: true, create: true, created: true, incident: true, incidents: true, record: true,
    records: true, is: true, are: true, with: true, this: true, its: true, their: true, should: true,
}

function cleanFieldPhrase(s: string): string {
    let words = String(s || '').trim().toLowerCase().split(/\s+/).filter(Boolean)
    while (words.length > 1 && FIELD_STOPWORDS[words[0]]) words.shift()
    if (words.length > 2) words = words.slice(-2)
    return words.join('_')
}

// Walk table → super_class chain so dictionary/choice lookups see inherited
// fields (e.g. incident inherits description/state from task).
function getHierarchy(table: string): string[] {
    const out: string[] = []
    let name = table
    let guard = 0
    while (name && guard++ < 25) {
        if (out.indexOf(name) >= 0) break
        out.push(name)
        const o = new GlideRecordSecure('sys_db_object')
        o.addQuery('name', name)
        o.setLimit(1)
        o.query()
        if (!o.next()) break
        const superId = String(o.getValue('super_class') || '')
        if (!superId) break
        const p = new GlideRecordSecure('sys_db_object')
        if (!(p as any).get(superId)) break
        name = String(p.getValue('name') || '')
    }
    return out
}

function lookupDictionary(hierarchy: string[], element: string): { internalType: string; reference: string } {
    const dd = new GlideRecordSecure('sys_dictionary')
    dd.addQuery('name', 'IN', hierarchy.join(','))
    dd.addQuery('element', element)
    dd.setLimit(1)
    dd.query()
    if (dd.next()) {
        return { internalType: String(dd.getValue('internal_type') || ''), reference: String(dd.getValue('reference') || '') }
    }
    return { internalType: '', reference: '' }
}

function resolveFieldByLabel(hierarchy: string[], label: string): string {
    const dd = new GlideRecordSecure('sys_dictionary')
    dd.addQuery('name', 'IN', hierarchy.join(','))
    dd.addQuery('column_label', label)
    dd.setLimit(1)
    dd.query()
    if (dd.next()) return String(dd.getValue('element') || '')
    return ''
}

/**
 * Resolve a field token (element name, a human label, or a dot-walked path) to a
 * validated element + its type metadata. Dot-walked paths (caller_id.vip) only
 * have their first segment validated; the value is passed through.
 */
function resolveField(
    table: string,
    hierarchy: string[],
    field: string,
): { valid: boolean; element: string; internalType: string; reference: string } {
    const f = String(field || '').trim()
    if (!f) return { valid: false, element: f, internalType: '', reference: '' }
    const gr = new GlideRecordSecure(table)
    gr.initialize()
    const firstSeg = f.split('.')[0]
    const dotted = f.indexOf('.') >= 0
    if (gr.isValidField(firstSeg)) {
        const meta = dotted ? { internalType: 'string', reference: '' } : lookupDictionary(hierarchy, firstSeg)
        return { valid: true, element: f, internalType: meta.internalType, reference: meta.reference }
    }
    const mapped = resolveFieldByLabel(hierarchy, f)
    if (mapped && gr.isValidField(mapped)) {
        const meta = lookupDictionary(hierarchy, mapped)
        return { valid: true, element: mapped, internalType: meta.internalType, reference: meta.reference }
    }
    return { valid: false, element: f, internalType: '', reference: '' }
}

type MatchQuality = 'exact' | 'fuzzy'

// Returns the stored choice value + how it matched (exact = the input equalled a
// full choice label or the stored code; fuzzy = only a substring/LIKE match),
// null when the field HAS a choice list but nothing matched, or false when the
// field has no choice list. The exact/fuzzy distinction is what gates whether a
// resolution may auto-clear a warning: only exact clears.
function lookupChoice(hierarchy: string[], element: string, input: string): { value: string; match: MatchQuality } | null | false {
    const val = String(input || '')
    // 1) exact label match (case-insensitive full-string equality)
    const byLabel = new GlideRecordSecure('sys_choice')
    byLabel.addQuery('name', 'IN', hierarchy.join(','))
    byLabel.addQuery('element', element)
    byLabel.addQuery('inactive', false)
    byLabel.addQuery('label', val)
    byLabel.setLimit(1)
    byLabel.query()
    if (byLabel.next()) return { value: String(byLabel.getValue('value')), match: 'exact' }
    // 2) the input may already be the stored value (still an exact match)
    const byValue = new GlideRecordSecure('sys_choice')
    byValue.addQuery('name', 'IN', hierarchy.join(','))
    byValue.addQuery('element', element)
    byValue.addQuery('inactive', false)
    byValue.addQuery('value', val)
    byValue.setLimit(1)
    byValue.query()
    if (byValue.next()) return { value: String(byValue.getValue('value')), match: 'exact' }
    // 3) FUZZY: label merely contains the input (e.g. "High" inside "1 - High",
    // but also "High" inside "Very High"). Usable as a best-effort value, but it
    // must NOT auto-clear a warning — the human still verifies.
    const byLike = new GlideRecordSecure('sys_choice')
    byLike.addQuery('name', 'IN', hierarchy.join(','))
    byLike.addQuery('element', element)
    byLike.addQuery('inactive', false)
    byLike.addQuery('label', 'LIKE', val)
    byLike.setLimit(1)
    byLike.query()
    if (byLike.next()) return { value: String(byLike.getValue('value')), match: 'fuzzy' }
    // Does the field have any choices at all?
    const any = new GlideRecordSecure('sys_choice')
    any.addQuery('name', 'IN', hierarchy.join(','))
    any.addQuery('element', element)
    any.setLimit(1)
    any.query()
    return any.next() ? null : false
}

// Exact = matched a known display field (name/number/user_name) equal to the
// value; fuzzy = only the free-text display search matched. Only exact clears.
function lookupReference(refTable: string, value: string): { sysId: string; match: MatchQuality } | null {
    const candidates = ['name', 'number', 'user_name']
    for (let i = 0; i < candidates.length; i++) {
        const gr = new GlideRecordSecure(refTable)
        if (!gr.isValidField(candidates[i])) continue
        gr.addQuery(candidates[i], value)
        gr.setLimit(1)
        gr.query()
        if (gr.next()) return { sysId: String(gr.getUniqueValue()), match: 'exact' }
    }
    // Free-text display search as a last resort (some tables reject it).
    try {
        const gr = new GlideRecordSecure(refTable)
        gr.addQuery('123TEXTQUERY321', value)
        gr.setLimit(1)
        gr.query()
        if (gr.next()) return { sysId: String(gr.getUniqueValue()), match: 'fuzzy' }
    } catch (_) {
        /* ignore */
    }
    return null
}

// Single key convention: field.<element>. The warning's `issue` already carries
// the kind (unresolved_choice_label / unresolved_reference / …), so the key does
// not need a category prefix. `confidence` comes from the real match quality —
// only an exact match may auto-clear a warning.
function resolveValue(
    hierarchy: string[],
    meta: { element: string; internalType: string; reference: string },
    rawValue: string,
): { value: string; resolution?: ResolverResolution; warning?: StructuredWarning } {
    const value = String(rawValue == null ? '' : rawValue).trim()
    if (!value) return { value: '' }
    const type = String(meta.internalType || '')
    const key = 'field.' + meta.element

    if (type === 'boolean') {
        if (/^(true|yes|1|checked)$/i.test(value)) return { value: 'true' }
        if (/^(false|no|0|unchecked)$/i.test(value)) return { value: 'false' }
        return { value }
    }

    if (type === 'reference' && meta.reference) {
        if (/^[0-9a-f]{32}$/i.test(value)) return { value }
        const ref = lookupReference(meta.reference, value)
        if (ref) {
            return { value: ref.sysId, resolution: { key: key, resolvedValue: ref.sysId, confidence: ref.match } }
        }
        return {
            value,
            warning: {
                key: key,
                issue: 'unresolved_reference',
                raw_value: value,
                message: 'Could not find "' + value + '" in ' + meta.reference + ' for field "' + meta.element + '" — set it manually or confirm the record exists.',
            },
        }
    }

    const choice = lookupChoice(hierarchy, meta.element, value)
    if (choice && typeof choice === 'object') {
        return { value: choice.value, resolution: { key: key, resolvedValue: choice.value, confidence: choice.match } }
    }
    if (choice === null) {
        return {
            value,
            warning: {
                key: key,
                issue: 'unresolved_choice_label',
                raw_value: value,
                message: '"' + value + '" is not a valid choice for field "' + meta.element + '" — pick a valid choice value.',
            },
        }
    }
    return { value } // not a choice field — pass through
}

// Split "field<op>value" into parts. Word operators are UPPERCASE in encoded
// queries and fields are lowercase, so a case-sensitive search won't misfire.
function parseClause(token: string): { field: string; op: string; value?: string } | null {
    const noValueOps = ['ISNOTEMPTY', 'ISEMPTY', 'ANYTHING']
    const upper = token.toUpperCase()
    for (let i = 0; i < noValueOps.length; i++) {
        const op = noValueOps[i]
        if (upper.endsWith(op) && token.length > op.length) {
            return { field: token.slice(0, token.length - op.length), op }
        }
    }
    const ops = ['STARTSWITH', 'ENDSWITH', 'NOTLIKE', 'LIKE', 'NOTIN', 'IN', '>=', '<=', '!=', '=', '>', '<']
    for (let i = 0; i < ops.length; i++) {
        const op = ops[i]
        const idx = token.indexOf(op)
        if (idx > 0) {
            return { field: token.slice(0, idx), op, value: token.slice(idx + op.length) }
        }
    }
    return null
}

function resolveCondition(
    condition: string,
    table: string,
    hierarchy: string[],
    warnings: StructuredWarning[],
    resolutions: ResolverResolution[],
): string {
    const raw = String(condition || '').trim()
    if (!raw) return ''
    const parts = raw.split('^')
    const out: string[] = []
    for (let i = 0; i < parts.length; i++) {
        let token = parts[i]
        if (!token) continue
        let prefix = ''
        if (/^OR/.test(token)) {
            prefix = 'OR'
            token = token.slice(2)
        } else if (/^NQ/.test(token)) {
            prefix = 'NQ'
            token = token.slice(2)
        }
        const parsed = parseClause(token)
        if (!parsed) {
            out.push(prefix + token)
            continue
        }
        const meta = resolveField(table, hierarchy, parsed.field)
        if (!meta.valid) {
            warnings.push({
                key: 'field.' + underscoreField(parsed.field),
                issue: 'unverified_field',
                raw_value: parsed.field,
                message: 'Condition clause dropped — unknown field "' + parsed.field + '" on ' + table + '.',
            })
            continue
        }
        if (parsed.value === undefined) {
            out.push(prefix + meta.element + parsed.op)
        } else {
            const rv = resolveValue(hierarchy, meta, parsed.value)
            if (rv.resolution) resolutions.push(rv.resolution)
            if (rv.warning) warnings.push(rv.warning)
            out.push(prefix + meta.element + parsed.op + rv.value)
        }
    }
    return out.join('^')
}

function resolveSetValues(
    setValues: SetValue[],
    table: string,
    hierarchy: string[],
    warnings: StructuredWarning[],
    resolutions: ResolverResolution[],
): SetValue[] {
    const out: SetValue[] = []
    for (let i = 0; i < setValues.length; i++) {
        const sv = setValues[i]
        if (!sv || !String(sv.field || '').trim()) continue
        const meta = resolveField(table, hierarchy, String(sv.field))
        if (!meta.valid) {
            warnings.push({
                key: 'field.' + underscoreField(String(sv.field)),
                issue: 'unverified_field',
                raw_value: String(sv.field),
                message: 'Action dropped — unknown field "' + sv.field + '" on ' + table + '.',
            })
            continue
        }
        const rv = resolveValue(hierarchy, meta, String(sv.value))
        if (rv.resolution) resolutions.push(rv.resolution)
        if (rv.warning) warnings.push(rv.warning)
        out.push({ field: meta.element, value: rv.value })
    }
    return out
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

        // General (unkeyed) warnings — safety-gate + conflict findings.
        const generalMessages = gate.warnings.slice()

        // --- Resolve display values → backend-stored values (generic) ---
        // Choice labels → codes, reference names → sys_ids, "is empty" → ISEMPTY,
        // field labels → element names — looked up live from the instance schema.
        // Successful resolutions are keyed (choice.<field> / reference.<field>)
        // so they can clear a matching LLM warning by exact-key reconciliation.
        const resolverResolutions: ResolverResolution[] = []
        const resolverWarnings: StructuredWarning[] = []
        if (proposal.table_exists) {
            try {
                const hierarchy = getHierarchy(proposal.table)
                proposal.condition = resolveCondition(proposal.condition, proposal.table, hierarchy, resolverWarnings, resolverResolutions)
                if (!proposal.use_script) {
                    proposal.actions.set_values = resolveSetValues(
                        proposal.actions.set_values,
                        proposal.table,
                        hierarchy,
                        resolverWarnings,
                        resolverResolutions,
                    )
                }
            } catch (e) {
                gs.error('x_1896745_brule.resolveValues: ' + String(e))
            }
        }

        // --- Conflict detection → warnings only (not surfaced as a count) ---
        const conflictResult: any = detectConflicts({ target_table: proposal.table })
        if (Number(conflictResult.conflict_count) > 0) {
            generalMessages.push(
                Number(conflictResult.conflict_count) +
                    ' existing active Business Rule(s) already run on ' +
                    proposal.table +
                    '. Review for overlap before creating another.',
            )
        }

        // --- Reconcile: clear each LLM warning the resolver actually resolved ---
        const llmWarnings: StructuredWarning[] = Array.isArray((reasoned as any).warnings) ? ((reasoned as any).warnings as StructuredWarning[]) : []
        const reconciled = reconcileWarnings(llmWarnings, resolverResolutions)
        const warnings = mergeWarnings(reconciled, resolverWarnings, generalMessages)

        // --- Name: honor a caller-supplied name, else suggest a sensible default ---
        if (body.name && String(body.name).trim()) {
            proposal.name = String(body.name).trim()
        } else if (!proposal.name) {
            const firstOp = OPERATIONS.filter((o) => (proposal.operations as any)[o])[0] || 'update'
            proposal.name = 'BR_' + proposal.table + '_' + firstOp
        }

        // Diagnostic: the raw keys each side emitted, so key-convention drift
        // between the model and the resolver is visible in the /generate response
        // (open devtools → Network → meta.warning_keys) without guesswork.
        const warningKeys = {
            llm: llmWarnings.map((w) => w.key).filter(Boolean),
            resolved: resolverResolutions.filter((r) => r.confidence === 'exact').map((r) => r.key),
        }

        response.setStatus(200)
        response.setBody({
            success: true,
            needs_input: false,
            proposal,
            meta: {
                generated_by: generatedBy,
                warnings,
                warning_keys: warningKeys,
                reasoning: String(reasoned.reason || ''),
            },
        })
    } catch (e) {
        gs.error('x_1896745_brule.BusinessRuleOrchestrator: ' + String(e))
        response.setStatus(500)
        response.setBody({ error: String(e) })
    }
}
