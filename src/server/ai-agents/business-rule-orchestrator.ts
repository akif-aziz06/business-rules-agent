import { gs, GlideRecordSecure } from '@servicenow/glide'
import {
    parseRequirement,
    detectConflicts,
    validateTiming,
    generateScript,
} from './business-rule-agent'

/**
 * REST API route handler — POST /api/x_1896745_test/business_rule_agent/generate
 *
 * Orchestrates all 5 pipeline steps:
 *   1. Parse natural-language requirement
 *   2. Detect configuration conflicts (informational, non-blocking)
 *   3. Validate execution timing and enforce safety rules
 *   4. Generate the Business Rule script body (IIFE with try/catch)
 *   5. Insert the validated record into sys_script via GlideRecordSecure
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
        const scriptResult: any = generateScript({
            trigger_event: String(parsed.trigger_event),
            automation_action: String(parsed.automation_action),
            target_table: String(parsed.target_table),
            approved_timing: String(timingResult.approved_timing),
            condition_filter: String(parsed.condition_filter),
        })

        if (!scriptResult.success) {
            response.setStatus(500)
            response.setBody({ step: 'generate', error: String(scriptResult.error || 'Script generation failed') })
            return
        }

        // --- Step 5: Insert Validated Business Rule into sys_script ---
        const ruleName = String(body.name || 'BR_' + String(parsed.target_table) + '_' + String(parsed.trigger_event) + '_auto')
        const tEvent = String(parsed.trigger_event)

        const gr = new GlideRecordSecure('sys_script')
        gr.initialize()
        gr.setValue('name', ruleName)
        gr.setValue('collection', String(parsed.target_table))
        gr.setValue('when', String(timingResult.approved_timing))
        gr.setValue('action_insert', Boolean(tEvent === 'insert'))
        gr.setValue('action_update', Boolean(tEvent === 'update'))
        gr.setValue('action_delete', Boolean(tEvent === 'delete'))
        gr.setValue('filter_condition', String(parsed.condition_filter))
        gr.setValue('script', String(scriptResult.validated_script))
        gr.setValue('active', Boolean(true))

        const sysId = gr.insert()
        if (!sysId) {
            response.setStatus(500)
            response.setBody({
                step: 'insert',
                error: 'GlideRecordSecure.insert() returned null — verify ACLs allow the caller to create Business Rules on sys_script',
            })
            return
        }

        let warnings: string[] = []
        try { warnings = JSON.parse(String(timingResult.warnings_json || '[]')) } catch (_) { warnings = [] }

        response.setStatus(201)
        response.setBody({
            success: true,
            sys_id: String(sysId),
            name: ruleName,
            table: String(parsed.target_table),
            timing: String(timingResult.approved_timing),
            trigger_event: tEvent,
            filter_condition: String(parsed.condition_filter),
            conflict_count: Number(conflictResult.conflict_count) || 0,
            warnings,
        })
    } catch (e) {
        gs.error('x_1896745_test.BusinessRuleOrchestrator: ' + String(e))
        response.setStatus(500)
        response.setBody({ error: String(e) })
    }
}
