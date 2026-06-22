/**
 * Business Rule Generator — Scripted REST API
 *
 * Replaces the previous AiAgent (sn_aia_agent) definition, which required the
 * "Now Assist AI Agents" enterprise plugin (unavailable on PDIs).
 *
 * This RestApi (sys_ws_definition) is 100% native to all ServiceNow instances
 * including free Personal Developer Instances. No paid plugins required.
 *
 * Endpoint:
 *   POST https://<instance>/api/x_1896745_test/business_rule_agent/generate
 *   Content-Type: application/json
 *   Body: { "requirement": "<plain-English rule description>", "name": "<optional rule name>" }
 *
 * The route handler orchestrates all 5 pipeline steps:
 *   1. Parse requirement   → trigger_event, target_table, condition_filter, automation_action
 *   2. Detect conflicts    → sweeps sys_script, sys_hub_flow, sys_ui_policy, sys_data_policy2
 *   3. Validate timing     → selects before/after/async, enforces safety rules
 *   4. Generate script     → self-contained IIFE with try/catch + gs.error() logging
 *   5. Insert record       → GlideRecordSecure.insert() into sys_script
 */
import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'
import { process } from '../../server/ai-agents/business-rule-orchestrator'

export const businessRuleAgent = RestApi({
    $id: Now.ID['business-rule-api'],
    name: 'Business Rule Generator API',
    serviceId: 'business_rule_agent',
    shortDescription: 'Converts plain-English requirements into validated, platform-safe Business Rule records on sys_script without any enterprise plugin dependency.',
    consumes: 'application/json',
    active: true,

    routes: [
        {
            $id: Now.ID['business-rule-api-generate'],
            name: 'generate',
            method: 'POST',
            path: '/generate',
            shortDescription: 'Parse, validate, generate, and insert a Business Rule from a plain-English requirement.',
            authentication: true,
            authorization: false,
            script: process,
        },
    ],
})
