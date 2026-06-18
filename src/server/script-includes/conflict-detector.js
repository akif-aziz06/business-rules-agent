// ConflictDetector — sweeps platform configuration tables for rule/flow conflicts.
// Called as a Script Include: new x_1896745_test.ConflictDetector().detect(table, event)
var ConflictDetector = Class.create();
ConflictDetector.prototype = {
    initialize: function() {},

    detect: function(tableName, triggerEvent) {
        var result = { conflicts: [], clear: true };
        try {
            var found = [];
            found = found.concat(this._sweepBusinessRules(tableName, triggerEvent));
            found = found.concat(this._sweepFlows());
            found = found.concat(this._sweepUiPolicies(tableName));
            found = found.concat(this._sweepDataPolicies(tableName));
            found = found.concat(this._sweepClientScripts(tableName));
            result.conflicts = found;
            result.clear = found.length === 0;
        } catch (e) {
            gs.error('x_1896745_test.ConflictDetector.detect: ' + String(e));
            result.error = String(e);
        }
        return result;
    },

    _sweepBusinessRules: function(tableName, triggerEvent) {
        var conflicts = [];
        var gr = new GlideRecordSecure('sys_script');
        gr.addQuery('collection', tableName);
        gr.addQuery('active', true);
        gr.query();
        while (gr.next()) {
            conflicts.push({
                type: 'business_rule',
                name: gr.getValue('name'),
                when: gr.getValue('when'),
                table: tableName
            });
        }
        return conflicts;
    },

    // Broad sweep — Flow Designer flows lack a direct table column on sys_hub_flow.
    _sweepFlows: function() {
        var conflicts = [];
        var gr = new GlideRecordSecure('sys_hub_flow');
        gr.addQuery('active', true);
        gr.setLimit(50);
        gr.query();
        while (gr.next()) {
            conflicts.push({
                type: 'flow',
                name: gr.getValue('name'),
                table: 'platform-wide'
            });
        }
        return conflicts;
    },

    _sweepUiPolicies: function(tableName) {
        var conflicts = [];
        var gr = new GlideRecordSecure('sys_ui_policy');
        gr.addQuery('table_name', tableName);
        gr.addQuery('active', true);
        gr.query();
        while (gr.next()) {
            conflicts.push({
                type: 'ui_policy',
                name: gr.getValue('short_description'),
                table: tableName
            });
        }
        return conflicts;
    },

    _sweepDataPolicies: function(tableName) {
        var conflicts = [];
        var gr = new GlideRecordSecure('sys_data_policy2');
        gr.addQuery('table_name', tableName);
        gr.addQuery('active', true);
        gr.query();
        while (gr.next()) {
            conflicts.push({
                type: 'data_policy',
                name: gr.getValue('name'),
                table: tableName
            });
        }
        return conflicts;
    },

    _sweepClientScripts: function(tableName) {
        var conflicts = [];
        var gr = new GlideRecordSecure('sys_script_client');
        gr.addQuery('table', tableName);
        gr.addQuery('active', true);
        gr.query();
        while (gr.next()) {
            conflicts.push({
                type: 'client_script',
                name: gr.getValue('name'),
                script_type: gr.getValue('type'),
                table: tableName
            });
        }
        return conflicts;
    },

    type: 'ConflictDetector'
};
