import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const conflictDetector = ScriptInclude({
    $id: Now.ID['conflict-detector-si'],
    name: 'ConflictDetector',
    description: 'Sweeps sys_script, sys_hub_flow, sys_ui_policy, sys_data_policy2, and sys_script_client for configurations that conflict with a new Business Rule.',
    active: true,
    accessibleFrom: 'package_private',
    apiName: 'x_1896745_brule.ConflictDetector',
    script: Now.include('../../server/script-includes/conflict-detector.js'),
})
