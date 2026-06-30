// BusinessRuleValidator — enforces platform safety rules before Business Rule creation.
// Called as a Script Include: new x_1896745_brule.BusinessRuleValidator().validate(...)
var BusinessRuleValidator = Class.create();
BusinessRuleValidator.prototype = {
    initialize: function() {},

    // Selects execution timing and redirects unsafe After-rule same-record patterns.
    selectTiming: function(automationAction, requirementText) {
        var result = { timing: 'after', rationale: '', warnings: [] };
        try {
            var text = String(requirementText || automationAction || '').toLowerCase();

            if (this._matches(text, ['validate', 'abort if', 'before save', 'set field on insert', 'prevent', 'block', 'reject'])) {
                result.timing = 'before';
                result.rationale = 'Data validation or abort operations must run before the record is saved';
            } else if (this._matches(text, ['external', 'third-party', 'third party', 'integration', 'rest', 'soap', 'webhook', 'heavy processing', 'background'])) {
                result.timing = 'async';
                result.rationale = 'Third-party integrations or heavy processing must not block the UI thread';
            } else if (this._matches(text, ['modify same record', 'update same record', 'same record after'])) {
                // After-rule same-record modification causes extra DB write — redirect to Before.
                result.timing = 'before';
                result.rationale = 'Redirected from After: modifying the same record in an After rule causes an extra database write. Using Before rule instead.';
                result.warnings.push('PLATFORM RISK: After-rule same-record modification detected. Redirected to Before rule to reduce database strain.');
            } else {
                result.timing = 'after';
                result.rationale = 'Notifications, logging, or related record operations run after the record is saved with final state';
            }
        } catch (e) {
            gs.error('x_1896745_brule.BusinessRuleValidator.selectTiming: ' + String(e));
            result.error = String(e);
        }
        return result;
    },

    // Validates the generated script body against all safety constraints.
    validate: function(scriptBody, timing, triggerAction) {
        var result = { valid: true, warnings: [], errors: [] };
        try {
            var body = String(scriptBody || '');
            var t = String(timing || '');
            var action = String(triggerAction || '');

            // Block current.update() in before/after — causes recursive execution loops.
            if ((t === 'before' || t === 'after') && body.indexOf('current.update(') > -1) {
                result.valid = false;
                result.errors.push('SAFETY: current.update() is forbidden in ' + t + ' rules — causes recursive execution loops');
            }

            // Block query action without explicit user confirmation.
            if (action === 'query') {
                result.valid = false;
                result.errors.push('SAFETY: query action fires on every table read. Explicit user confirmation is required before proceeding.');
            }

            // Require try/catch with gs.error() for exception logging.
            if (body.indexOf('try') === -1 || body.indexOf('catch') === -1) {
                result.valid = false;
                result.errors.push('SAFETY: Script must include a try/catch block with gs.error() logging');
            }

            if (body.indexOf('gs.error(') === -1) {
                result.warnings.push('RECOMMENDATION: No gs.error() call found in catch block. Add error logging for observability.');
            }

            // Block raw GlideRecord — only GlideRecordSecure is permitted.
            if (/new\s+GlideRecord\s*\(/.test(body)) {
                result.valid = false;
                result.errors.push('SAFETY: GlideRecord is not permitted — use GlideRecordSecure for all server queries');
            }

            // Warn if condition logic is inside the script body rather than filterCondition.
            if (/^if\s*\(/.test(body.trim())) {
                result.warnings.push('RECOMMENDATION: Top-level if-guard detected. Move condition to filterCondition field instead of script body.');
            }
        } catch (e) {
            gs.error('x_1896745_brule.BusinessRuleValidator.validate: ' + String(e));
            result.error = String(e);
        }
        return result;
    },

    _matches: function(text, patterns) {
        for (var i = 0; i < patterns.length; i++) {
            if (text.indexOf(patterns[i]) > -1) {
                return true;
            }
        }
        return false;
    },

    type: 'BusinessRuleValidator'
};
