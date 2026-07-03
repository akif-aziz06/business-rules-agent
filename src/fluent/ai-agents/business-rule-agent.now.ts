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
 *   POST https://<instance>/api/x_1896745_brule/business_rule_agent/generate
 *   Content-Type: application/json
 *   Body: { "requirement": "<plain-English rule description>", "name": "<optional rule name>" }
 *
 * The route handler returns a *proposal* for human review — it does not persist
 * anything. Pipeline:
 *   1. Vague check       → halts and asks for Table/Action/Condition if incomplete
 *   2. LLM reasoning     → operations, when-to-run, condition-vs-script, actions-vs-script
 *                          (deterministic heuristic reasoner as fallback)
 *   3. Safety gate       → enforces no current.update() in before/after, current/previous scope
 *   4. Table + conflicts → validates target vs sys_db_object; surfaces overlaps as warnings
 *   5. Return proposal   → the editable BR Details payload; the record is written
 *                          client-side via the Table API only after admin confirmation
 */
import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'
import { process } from '../../server/ai-agents/business-rule-agent'

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
