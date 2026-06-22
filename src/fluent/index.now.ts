/**
 * Fluent entry point for Business Rule Generator
 * Scope: x_1896745_test
 *
 * Artifacts deployed (all vanilla PDI compatible — no enterprise plugins required):
 *   - ConflictDetector      ScriptInclude (sys_script_include)
 *   - BusinessRuleValidator ScriptInclude (sys_script_include)
 *   - Business Rule API     RestApi       (sys_ws_definition / sys_ws_operation)
 */

export { conflictDetector } from './script-includes/conflict-detector.now'
export { businessRuleValidator } from './script-includes/business-rule-validator.now'
export { businessRuleAgent } from './ai-agents/business-rule-agent.now'
