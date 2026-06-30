import { gs, GlideRecordSecure } from '@servicenow/glide'
// Namespaced platform APIs must be imported from their namespace subpath in
// module context — a bare `sn_ws.RESTMessageV2` throws "sn_ws is not defined".
import { RESTMessageV2 } from '@servicenow/glide/sn_ws'

// Table keywords used by parseRequirement to identify the target ServiceNow table.
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

/**
 * Tool 1 — Parse Requirement
 * Extracts trigger_event, condition_filter, automation_action, and target_table
 * from the user's natural-language business requirement.
 */
export function parseRequirement(inputs: Record<string, string>) {
    try {
        const raw = String(inputs.requirement || '').trim()
        const text = raw.toLowerCase()

        // Determine trigger event from keywords. Stems use \w* so inflected
        // forms match too (created/creating, deleted/removed, searched/queried).
        let triggerEvent = 'update'
        if (/\b(insert\w*|creat\w*|add(?:ed|ing|s)?|new\s+record|submit\w*)\b/.test(text)) {
            triggerEvent = 'insert'
        } else if (/\b(delet\w*|remov\w*|destroy\w*)\b/.test(text)) {
            triggerEvent = 'delete'
        } else if (/\b(quer\w*|read|fetch\w*|search\w*|lookup\w*)\b/.test(text)) {
            triggerEvent = 'query'
        }

        // Identify target table from known keywords.
        let targetTable = 'incident'
        for (const keyword of Object.keys(TABLE_MAP)) {
            if (text.includes(keyword)) {
                targetTable = TABLE_MAP[keyword]
                break
            }
        }

        // Extract a simple condition hint (default to active records).
        let conditionFilter = 'active=true'
        const stateMatch = text.match(/state\s*(?:is|=|equals?)\s*['"]?(\w+)['"]?/)
        if (stateMatch) {
            conditionFilter = 'state=' + stateMatch[1]
        } else if (/priorit[yi]\s*(?:is|=)?\s*(?:high|1|critical)/i.test(text)) {
            conditionFilter = 'priority=1'
        }

        // Extract the automation action — text after common action markers.
        const actionMatch = raw.match(/(?:then|should|must|will|to)\s+(.+?)(?:[.!]|$)/i)
        const automationAction = actionMatch ? actionMatch[1].trim() : raw

        return {
            success: true,
            trigger_event: triggerEvent,
            condition_filter: conditionFilter,
            automation_action: automationAction,
            target_table: targetTable,
            parsed_requirement: raw,
        }
    } catch (e) {
        gs.error('x_1896745_brule.parseRequirement: ' + String(e))
        return { success: false, error: String(e) }
    }
}

/**
 * Tool 2 — Detect Conflicts
 * Sweeps sys_script, sys_hub_flow, sys_ui_policy, sys_data_policy2, and
 * sys_script_client for existing configurations that might conflict with the
 * new Business Rule. Uses GlideRecordSecure for all queries.
 */
export function detectConflicts(inputs: Record<string, string>) {
    try {
        const targetTable = String(inputs.target_table || '')
        const triggerEvent = String(inputs.trigger_event || '')
        const conflicts: Array<{ type: string; name: string; table: string; detail?: string }> = []

        // Active Business Rules on the target table.
        const brGr = new GlideRecordSecure('sys_script')
        brGr.addQuery('collection', targetTable)
        brGr.addQuery('active', true)
        brGr.query()
        while (brGr.next()) {
            conflicts.push({
                type: 'business_rule',
                name: String(brGr.getValue('name')),
                table: targetTable,
                detail: 'when=' + String(brGr.getValue('when')),
            })
        }

        // Flow Designer flows — broad sweep (no direct table column on sys_hub_flow).
        const flowGr = new GlideRecordSecure('sys_hub_flow')
        flowGr.addQuery('active', true)
        flowGr.setLimit(50)
        flowGr.query()
        while (flowGr.next()) {
            conflicts.push({
                type: 'flow',
                name: String(flowGr.getValue('name')),
                table: 'platform-wide',
            })
        }

        // UI Policies on the target table.
        // Cast to 'string' so TypeScript does not enforce the fetched field-key schema,
        // which did not include 'table_name' for this table on this instance.
        const uiGr = new GlideRecordSecure('sys_ui_policy' as string)
        uiGr.addQuery('table_name', targetTable)
        uiGr.addQuery('active', true)
        uiGr.query()
        while (uiGr.next()) {
            conflicts.push({
                type: 'ui_policy',
                name: String(uiGr.getValue('short_description')),
                table: targetTable,
            })
        }

        // Data Policies on the target table.
        // Same cast — fetched schema for sys_data_policy2 omits 'table_name' and 'name'.
        const dpGr = new GlideRecordSecure('sys_data_policy2' as string)
        dpGr.addQuery('table_name', targetTable)
        dpGr.addQuery('active', true)
        dpGr.query()
        while (dpGr.next()) {
            conflicts.push({
                type: 'data_policy',
                name: String(dpGr.getValue('name')),
                table: targetTable,
            })
        }

        // Client Scripts on the target table.
        const csGr = new GlideRecordSecure('sys_script_client')
        csGr.addQuery('table', targetTable)
        csGr.addQuery('active', true)
        csGr.query()
        while (csGr.next()) {
            conflicts.push({
                type: 'client_script',
                name: String(csGr.getValue('name')),
                table: targetTable,
                detail: 'script_type=' + String(csGr.getValue('type')),
            })
        }

        return {
            success: true,
            target_table: targetTable,
            trigger_event: triggerEvent,
            conflict_count: conflicts.length,
            clear: conflicts.length === 0,
            conflicts_json: JSON.stringify(conflicts),
        }
    } catch (e) {
        gs.error('x_1896745_brule.detectConflicts: ' + String(e))
        return { success: false, error: String(e) }
    }
}

/**
 * Tool 3 — Validate Timing & Safety
 * Selects the correct execution timing (before/after/async), enforces
 * the After-rule same-record redirect, blocks current.update() in
 * before/after context, and gates query-action subscriptions.
 */
export function validateTiming(inputs: Record<string, string>) {
    try {
        const automationAction = String(inputs.automation_action || '')
        const requirementText = String(inputs.parsed_requirement || inputs.requirement || automationAction).toLowerCase()
        const triggerAction = String(inputs.trigger_event || 'update')

        let timing = 'after'
        let rationale = ''
        const warnings: string[] = []
        const errors: string[] = []

        // Execution timing decision matrix (mirrors arch.md table).
        if (/validat|abort if|before save|set field on insert|prevent|block|reject/i.test(requirementText)) {
            timing = 'before'
            rationale = 'Data validation or abort operations must run before the record is saved'
        } else if (/external|third.party|integration|rest\s|soap|webhook|heavy processing|background/i.test(requirementText)) {
            timing = 'async'
            rationale = 'Third-party integrations or heavy processing must not block the UI thread'
        } else if (/modify same record|update same record|same.record.*after/i.test(requirementText)) {
            // After-rule same-record modification → redirect to Before with warning.
            timing = 'before'
            rationale = 'Redirected from After: modifying the same record in an After rule causes an extra database write'
            warnings.push('PLATFORM RISK: After-rule same-record modification. Converted to Before rule to eliminate extra DB write.')
        } else {
            timing = 'after'
            rationale = 'Notifications, logging, or related record creation run after the record is saved with its final state'
        }

        // Block explicit current.update() mentions — forbidden in before/after context.
        if (/current\.update\s*\(/.test(requirementText) && (timing === 'before' || timing === 'after')) {
            errors.push(
                'SAFETY: current.update() is not permitted in ' + timing + ' rules — causes recursive execution loops. ' +
                'Use direct field assignment in a Before rule, or move the update to an Async rule targeting a separate GlideRecord.'
            )
        }

        // Block query action — fires on every table read, must be explicitly confirmed.
        if (triggerAction === 'query') {
            errors.push('SAFETY: query action fires on every GlideRecord.query() call on this table. Explicit user confirmation is required before proceeding.')
        }

        return {
            success: errors.length === 0,
            approved_timing: timing,
            rationale,
            trigger_event: triggerAction,
            automation_action: automationAction,
            warnings_json: JSON.stringify(warnings),
            errors_json: JSON.stringify(errors),
        }
    } catch (e) {
        gs.error('x_1896745_brule.validateTiming: ' + String(e))
        return { success: false, error: String(e) }
    }
}

/**
 * Tool 4 — Generate Script Body
 * Produces a self-contained IIFE with try/catch and gs.error() logging.
 * Condition logic goes in filterCondition (not in the script body).
 * Never emits current.update() — callers should redirect to Before if
 * same-record modification is needed.
 */
export function generateScript(inputs: Record<string, string>) {
    try {
        const triggerEvent = String(inputs.trigger_event || 'update')
        const automationAction = String(inputs.automation_action || '')
        const targetTable = String(inputs.target_table || 'task')
        const timing = String(inputs.approved_timing || 'after')
        const conditionFilter = String(inputs.condition_filter || 'active=true')
        const actionLower = automationAction.toLowerCase()

        let innerLogic: string

        if (/set\s+field|field\s+value|assign/i.test(actionLower)) {
            innerLogic = [
                '        // Set field value — replace field_name and target_value with actual values.',
                "        current.setValue('field_name', 'target_value');",
            ].join('\n')
        } else if (/notif|email|alert/i.test(actionLower)) {
            innerLogic = [
                '        // Emit a platform event to trigger a notification.',
                "        gs.eventQueue('x_1896745_brule.rule_notification', current, current.getValue('assigned_to'), '');",
            ].join('\n')
        } else if (/creat|insert.*record|new.*record/i.test(actionLower)) {
            innerLogic = [
                '        // Create a related record on insert/update.',
                "        var related = new GlideRecordSecure('task');",
                '        related.initialize();',
                "        related.setValue('parent', current.getUniqueValue());",
                "        related.setValue('short_description', 'Auto-created by Business Rule: ' + current.getDisplayValue());",
                '        related.insert();',
            ].join('\n')
        } else if (/validat|prevent|abort|reject/i.test(actionLower)) {
            innerLogic = [
                '        // Validate and abort the operation if the condition is not met.',
                "        if (!current.getValue('required_field')) {",
                "            gs.addErrorMessage('Validation failed: required_field must be populated.');",
                '            current.setAbortAction(true);',
                '        }',
            ].join('\n')
        } else if (/log|audit|track/i.test(actionLower)) {
            innerLogic = [
                '        // Audit log — record the business event.',
                `        gs.info('x_1896745_brule: Rule triggered on ${targetTable}, record=' + current.getUniqueValue());`,
            ].join('\n')
        } else {
            // Generic placeholder — the LLM layer will refine with the specific action.
            innerLogic = [
                '        // TODO: Implement — ' + automationAction,
                '        // current and previous are available as platform globals.',
                "        // Use GlideRecordSecure (not GlideRecord) for any embedded queries.",
                "        // Never call current.update() in a before or after rule.",
            ].join('\n')
        }

        const validatedScript = [
            '(function() {',
            '    try {',
            innerLogic,
            '    } catch (e) {',
            "        gs.error('x_1896745_brule.generated_rule: ' + String(e));",
            '    }',
            '})();',
        ].join('\n')

        return {
            success: true,
            validated_script: validatedScript,
            approved_timing: timing,
            trigger_event: triggerEvent,
            target_table: targetTable,
            filter_condition: conditionFilter,
        }
    } catch (e) {
        gs.error('x_1896745_brule.generateScript: ' + String(e))
        return { success: false, error: String(e) }
    }
}

/**
 * Safety gate for any generated script body — independent of how it was produced.
 * Mirrors the non-negotiable platform rule: no current.update() in before/after.
 */
function isScriptSafe(script: string, timing: string): boolean {
    if (!script || !script.trim()) return false
    if ((timing === 'before' || timing === 'after') && /current\s*\.\s*update\s*\(/.test(script)) return false
    return true
}

/**
 * LLM-assisted Script Generation (optional).
 * Calls the Anthropic Messages API via RESTMessageV2 to produce a tailored
 * Business Rule script body. The execution timing and condition are fixed by
 * the deterministic pipeline (the validator stays the safety gate); the LLM
 * only fills the script. Returns { success: false } whenever the LLM is
 * disabled, unconfigured, errors, or returns an unsafe script — the caller
 * then falls back to the heuristic generateScript().
 */
export function generateScriptWithLLM(inputs: Record<string, string>) {
    try {
        // LLM generation is enabled simply by setting the api key property.
        const apiKey = String(gs.getProperty('x_1896745_brule.anthropic_api_key', '')).trim()
        if (!apiKey) {
            return { success: false, reason: 'no_key' }
        }

        const model = String(gs.getProperty('x_1896745_brule.llm_model', 'claude-haiku-4-5')) || 'claude-haiku-4-5'
        const triggerEvent = String(inputs.trigger_event || 'update')
        const targetTable = String(inputs.target_table || 'task')
        const timing = String(inputs.approved_timing || 'after')
        const conditionFilter = String(inputs.condition_filter || '')
        const requirement = String(inputs.requirement || inputs.automation_action || '')

        const system = [
            'You generate ONLY the server-side JavaScript body for a ServiceNow Business Rule (sys_script).',
            'Non-negotiable platform safety rules:',
            '- The execution timing is fixed by the caller; do not change it.',
            '- NEVER call current.update() in a before or after rule — it causes infinite recursive execution loops. In before rules assign fields in memory with current.setValue(...); the platform commits automatically once the rule completes.',
            '- After rules must never modify the current record; they may only insert/update OTHER tables.',
            '- Use GlideRecordSecure (never GlideRecord) for any embedded queries.',
            '- Wrap the whole body in a self-contained IIFE with try/catch that logs failures via gs.error(). current and previous are available as platform globals.',
            'Return ONLY minified JSON of the exact form {"script":"<the full IIFE as a single JSON-escaped string>"} — no markdown fences, no prose.',
        ].join('\n')

        const user = [
            'Requirement: ' + requirement,
            'Target table (collection): ' + targetTable,
            'Trigger event: ' + triggerEvent,
            'Execution timing (when): ' + timing,
            'Condition filter (already set on the rule — do not re-check it in the script): ' + (conditionFilter || '(none)'),
            'Write the Business Rule script body.',
        ].join('\n')

        const requestBody = {
            model: model,
            max_tokens: 2048,
            system: system,
            messages: [{ role: 'user', content: user }],
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
            gs.error('x_1896745_brule.generateScriptWithLLM: HTTP ' + status + ' ' + respBody.slice(0, 500))
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

        let scriptObj: any
        try {
            scriptObj = JSON.parse(text)
        } catch (_) {
            scriptObj = { script: text }
        }
        const script = String((scriptObj && scriptObj.script) || '')

        if (!isScriptSafe(script, timing)) {
            gs.error('x_1896745_brule.generateScriptWithLLM: generated script failed the safety gate — falling back to heuristic')
            return { success: false, reason: 'unsafe' }
        }

        return {
            success: true,
            validated_script: script,
            approved_timing: timing,
            trigger_event: triggerEvent,
            target_table: targetTable,
            filter_condition: conditionFilter,
            generated_by: 'llm',
        }
    } catch (e) {
        gs.error('x_1896745_brule.generateScriptWithLLM: ' + String(e))
        return { success: false, reason: 'exception' }
    }
}

/**
 * REST API route handler — POST /api/x_1896745_brule/business_rule_agent/generate
 *
 * Self-contained (no cross-module imports) so the ServiceNow runtime module
 * loader resolves it from a single sys_module record. Orchestrates the
 * pipeline: parse → detect conflicts → validate timing/safety → generate
 * script → return the validated Business Rule definition. The record itself is
 * persisted client-side via the platform Table API (the scoped app may not
 * write to the global sys_script table).
 */
export function process(request: any, response: any): void {
    try {
        // --- Parse Request Body ---
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

        // --- Step 1: Parse Requirement ---
        const parsed: any = parseRequirement({ requirement })
        if (!parsed.success) {
            response.setStatus(422)
            response.setBody({ step: 'parse', error: String(parsed.error || 'Requirement could not be parsed') })
            return
        }

        // --- Step 2: Detect Conflicts (informational — does not block insertion) ---
        const conflictResult: any = detectConflicts({
            target_table: String(parsed.target_table),
            trigger_event: String(parsed.trigger_event),
        })

        // --- Step 3: Validate Timing & Safety Rules ---
        const timingResult: any = validateTiming({
            automation_action: String(parsed.automation_action),
            parsed_requirement: String(parsed.parsed_requirement),
            trigger_event: String(parsed.trigger_event),
        })

        let safetyErrors: string[] = []
        try { safetyErrors = JSON.parse(String(timingResult.errors_json || '[]')) } catch (_) { safetyErrors = [] }

        if (!timingResult.success || safetyErrors.length > 0) {
            response.setStatus(422)
            response.setBody({
                step: 'validate',
                error: 'Safety validation blocked rule creation — resolve violations before retrying',
                violations: safetyErrors,
                timing_attempted: String(timingResult.approved_timing),
            })
            return
        }

        // --- Step 4: Generate Business Rule Script Body ---
        // Try the LLM first; fall back to the deterministic heuristic whenever
        // the LLM is disabled, unconfigured, errors, or returns an unsafe script.
        let generatedBy = 'llm'
        let scriptResult: any = generateScriptWithLLM({
            trigger_event: String(parsed.trigger_event),
            automation_action: String(parsed.automation_action),
            target_table: String(parsed.target_table),
            approved_timing: String(timingResult.approved_timing),
            condition_filter: String(parsed.condition_filter),
            requirement: requirement,
        })
        if (!scriptResult || !scriptResult.success) {
            generatedBy = 'heuristic'
            scriptResult = generateScript({
                trigger_event: String(parsed.trigger_event),
                automation_action: String(parsed.automation_action),
                target_table: String(parsed.target_table),
                approved_timing: String(timingResult.approved_timing),
                condition_filter: String(parsed.condition_filter),
            })
        }

        if (!scriptResult.success) {
            response.setStatus(500)
            response.setBody({ step: 'generate', error: String(scriptResult.error || 'Script generation failed') })
            return
        }

        // --- Step 5: Build the validated Business Rule definition ---
        // A scoped app cannot insert into the global sys_script table
        // (create_access = false), so the record is persisted client-side via
        // the platform Table API as the logged-in user. Here we only assemble
        // and return the fully validated field payload (string-typed for the
        // Table API) plus a display summary.
        const ruleName = String(body.name || 'BR_' + String(parsed.target_table) + '_' + String(parsed.trigger_event) + '_auto')
        const tEvent = String(parsed.trigger_event)

        let warnings: string[] = []
        try { warnings = JSON.parse(String(timingResult.warnings_json || '[]')) } catch (_) { warnings = [] }

        response.setStatus(200)
        response.setBody({
            success: true,
            ready: true,
            record: {
                name: ruleName,
                collection: String(parsed.target_table),
                when: String(timingResult.approved_timing),
                action_insert: tEvent === 'insert' ? 'true' : 'false',
                action_update: tEvent === 'update' ? 'true' : 'false',
                action_delete: tEvent === 'delete' ? 'true' : 'false',
                filter_condition: String(parsed.condition_filter),
                script: String(scriptResult.validated_script),
                active: 'true',
            },
            summary: {
                name: ruleName,
                table: String(parsed.target_table),
                timing: String(timingResult.approved_timing),
                trigger_event: tEvent,
                filter_condition: String(parsed.condition_filter),
                conflict_count: Number(conflictResult.conflict_count) || 0,
                generated_by: generatedBy,
                warnings,
            },
        })
    } catch (e) {
        gs.error('x_1896745_brule.BusinessRuleOrchestrator: ' + String(e))
        response.setStatus(500)
        response.setBody({ error: String(e) })
    }
}
