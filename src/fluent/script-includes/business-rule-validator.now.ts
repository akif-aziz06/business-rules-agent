import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const businessRuleValidator = ScriptInclude({
    $id: Now.ID['business-rule-validator-si'],
    name: 'BusinessRuleValidator',
    description: 'Enforces platform safety rules: timing selection (before/after/async), blocks current.update() in before/after context, gates query-action subscriptions, and validates try/catch logging.',
    active: true,
    accessibleFrom: 'package_private',
    apiName: 'x_1896745_test.BusinessRuleValidator',
    script: Now.include('../../server/script-includes/business-rule-validator.js'),
})
