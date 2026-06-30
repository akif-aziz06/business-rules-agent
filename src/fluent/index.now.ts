/**
 * Fluent entry point for Business Rule Generator
 * Scope: x_1896745_brule
 *
 * Artifacts deployed (all vanilla PDI compatible — no enterprise plugins required):
 *   - ConflictDetector      ScriptInclude (sys_script_include)
 *   - BusinessRuleValidator ScriptInclude (sys_script_include)
 *   - Business Rule API     RestApi       (sys_ws_definition / sys_ws_operation)
 *   - Business Rule Generator widget + page (sp_widget / sp_page) — /sp?id=business_rule_generator
 */

export { conflictDetector } from './script-includes/conflict-detector.now'
export { businessRuleValidator } from './script-includes/business-rule-validator.now'
export { businessRuleAgent } from './ai-agents/business-rule-agent.now'
export { businessRuleWidget, businessRulePage } from './service-portal/business-rule-generator.now'
export { anthropicApiKey, llmModel } from './properties/llm-config.now'
