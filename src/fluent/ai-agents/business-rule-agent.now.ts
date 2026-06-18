import '@servicenow/sdk/global'
import { AiAgent } from '@servicenow/sdk/core'
import {
    parseRequirement,
    detectConflicts,
    validateTiming,
    generateScript,
} from '../../server/ai-agents/business-rule-agent'

export const businessRuleAgent = AiAgent({
    $id: Now.ID['business-rule-agent'],
    name: 'Business Rule Generator Agent',
    description: 'Converts plain-English business requirements into validated, platform-safe Business Rule records on sys_script. Enforces execution timing rules, conflict detection, and safety constraints before creating any record.',
    agentRole: 'You are a ServiceNow platform expert specializing in Business Rule authoring. You parse natural-language requirements, detect configuration conflicts, enforce platform safety rules, and generate syntactically correct, optimized Business Rules.',

    recordType: 'custom',
    agentDescriptor: 'created_by_build_agent',
    channel: 'nap_and_va',
    active: true,
    processingMessage: 'Analyzing your business requirement and generating a safe Business Rule...',
    postProcessingMessage: 'Business Rule created successfully. Review the record in sys_script.',

    // Controls who can invoke this agent.
    securityAcl: {
        $id: Now.ID['business-rule-agent-acl'],
        type: 'Specific role',
        roles: [
            '282bf1fac6112285017366cb5f867469', // itil
        ],
    },

    // Agent runs as the invoking user, restricted to the itil role.
    dataAccess: {
        roleList: ['282bf1fac6112285017366cb5f867469'],
    },

    versionDetails: [
        {
            name: 'V1',
            number: 1,
            state: 'published',
            instructions: `You are a Business Rule authoring agent. Execute the following steps in strict order. Do not skip steps or proceed past a failing step.

Step 1 — Parse Requirement:
Use the "Parse Requirement" tool to extract trigger_event (insert/update/delete), condition_filter, target_table, and automation_action from the user's input. If the requirement cannot be mapped to these fields, ask the user to clarify before continuing.

Step 2 — Detect Conflicts:
Use the "Detect Conflicts" tool with the target_table and trigger_event from Step 1. Report all conflicts to the user. If serious conflicts are found (Business Rules with the same timing and action), pause and ask the user to confirm before continuing.

Step 3 — Validate Timing & Safety:
Use the "Validate Timing & Safety" tool with the automation_action, parsed_requirement, and trigger_event. This tool selects before/after/async and enforces all safety rules. DO NOT proceed to Step 4 if errors_json is non-empty — surface the errors to the user and stop.

Step 4 — Generate Script Body:
Use the "Generate Script Body" tool with approved_timing, trigger_event, automation_action, target_table, and condition_filter from prior steps. The output validated_script is a self-contained IIFE with try/catch logging. Do not modify the script — pass it as-is to Step 5.

Step 5 — Create Business Rule:
Use the "Create Business Rule" tool to insert the record into sys_script. Map fields as follows:
  - name: a descriptive rule name the user provides or derive from the automation_action
  - collection: target_table from Step 1
  - when: approved_timing from Step 3
  - action_insert/action_update/action_delete: set the column matching trigger_event to true
  - filter_condition: condition_filter from Step 1
  - script: validated_script from Step 4
  - active: true

SAFETY CONSTRAINTS (non-negotiable):
- NEVER allow current.update() in before or after rule scripts.
- NEVER proceed with query action subscription without explicit user approval.
- ALWAYS use filterCondition — never embed condition guards inside the script body.
- The generated script MUST contain try/catch with gs.error() logging.
- NEVER use GlideRecord — only GlideRecordSecure is permitted.`,
        },
    ],

    tools: [
        // Tool 1 — Parse the natural language requirement into structured fields.
        {
            type: 'script',
            name: 'Parse Requirement',
            description: 'Extracts trigger_event (insert/update/delete), condition_filter, target_table, and automation_action from the user\'s natural-language business requirement.',
            active: true,
            recordType: 'custom',
            executionMode: 'autopilot',
            preMessage: 'Parsing your business requirement...',
            postMessage: 'Requirement parsed. Trigger, table, and action identified.',
            inputs: [
                {
                    name: 'requirement',
                    description: 'The full natural-language business requirement provided by the user.',
                    mandatory: true,
                },
            ],
            script: parseRequirement,
        },

        // Tool 2 — Sweep platform tables for existing configurations that may conflict.
        {
            type: 'script',
            name: 'Detect Conflicts',
            description: 'Sweeps active Business Rules, Flow Designer flows, UI Policies, Data Policies, and Client Scripts on the target table to identify potential conflicts before creating a new rule.',
            active: true,
            recordType: 'custom',
            executionMode: 'autopilot',
            preMessage: 'Checking for existing configurations that may conflict...',
            postMessage: 'Conflict sweep complete.',
            inputs: [
                {
                    name: 'target_table',
                    description: 'The ServiceNow table name to sweep for conflicts (e.g. incident).',
                    mandatory: true,
                },
                {
                    name: 'trigger_event',
                    description: 'The trigger event (insert, update, delete, or query).',
                    mandatory: true,
                },
            ],
            script: detectConflicts,
        },

        // Tool 3 — Select execution timing and enforce all platform safety rules.
        {
            type: 'script',
            name: 'Validate Timing & Safety',
            description: 'Selects the correct execution timing (before/after/async), redirects unsafe After-rule same-record modifications to Before, blocks current.update() in before/after context, and gates query-action subscriptions.',
            active: true,
            recordType: 'custom',
            executionMode: 'autopilot',
            preMessage: 'Selecting execution timing and validating safety rules...',
            postMessage: 'Timing approved and safety checks passed.',
            inputs: [
                {
                    name: 'automation_action',
                    description: 'The automation action extracted from the business requirement.',
                    mandatory: true,
                },
                {
                    name: 'parsed_requirement',
                    description: 'The original parsed requirement text, used for pattern matching.',
                    mandatory: false,
                },
                {
                    name: 'trigger_event',
                    description: 'The trigger event (insert, update, delete, or query).',
                    mandatory: true,
                },
            ],
            script: validateTiming,
        },

        // Tool 4 — Generate the JavaScript IIFE for the Business Rule script field.
        {
            type: 'script',
            name: 'Generate Script Body',
            description: 'Produces a self-contained JavaScript IIFE with try/catch and gs.error() logging, using the approved timing, trigger event, and automation action. Condition logic is placed in filterCondition, not the script body.',
            active: true,
            recordType: 'custom',
            executionMode: 'autopilot',
            preMessage: 'Generating the Business Rule script...',
            postMessage: 'Script generated and ready for deployment.',
            inputs: [
                {
                    name: 'automation_action',
                    description: 'The automation action to implement in the script.',
                    mandatory: true,
                },
                {
                    name: 'approved_timing',
                    description: 'Execution timing: before, after, or async.',
                    mandatory: true,
                },
                {
                    name: 'trigger_event',
                    description: 'The trigger event (insert, update, delete).',
                    mandatory: true,
                },
                {
                    name: 'target_table',
                    description: 'The target ServiceNow table.',
                    mandatory: true,
                },
                {
                    name: 'condition_filter',
                    description: 'Encoded filter condition for the Business Rule filterCondition field.',
                    mandatory: false,
                },
            ],
            script: generateScript,
        },

        // Tool 5 — Insert the validated Business Rule record into sys_script.
        {
            type: 'crud',
            name: 'Create Business Rule',
            description: 'Inserts the validated Business Rule into sys_script with the correct table, timing, trigger actions, filterCondition, and script body.',
            active: true,
            recordType: 'custom',
            executionMode: 'autopilot',
            preMessage: 'Creating the Business Rule record in sys_script...',
            postMessage: 'Business Rule created successfully.',
            inputs: {
                operationName: 'create',
                table: 'sys_script',
                inputFields: [
                    {
                        name: 'name',
                        description: 'Descriptive name for the Business Rule.',
                        mandatory: true,
                        mappedToColumn: 'name',
                        type: 'string',
                    },
                    {
                        name: 'collection',
                        description: 'Target table the Business Rule fires on (e.g. incident).',
                        mandatory: true,
                        mappedToColumn: 'collection',
                        type: 'string',
                    },
                    {
                        name: 'when',
                        description: 'Execution timing: before, after, or async.',
                        mandatory: true,
                        mappedToColumn: 'when',
                        type: 'string',
                    },
                    {
                        name: 'action_insert',
                        description: 'Set to true to fire on insert operations.',
                        mandatory: false,
                        mappedToColumn: 'action_insert',
                        type: 'string',
                    },
                    {
                        name: 'action_update',
                        description: 'Set to true to fire on update operations.',
                        mandatory: false,
                        mappedToColumn: 'action_update',
                        type: 'string',
                    },
                    {
                        name: 'action_delete',
                        description: 'Set to true to fire on delete operations.',
                        mandatory: false,
                        mappedToColumn: 'action_delete',
                        type: 'string',
                    },
                    {
                        name: 'filter_condition',
                        description: 'Encoded filter condition string (e.g. active=true^priority=1).',
                        mandatory: false,
                        mappedToColumn: 'filter_condition',
                        type: 'string',
                    },
                    {
                        name: 'script',
                        description: 'The validated JavaScript IIFE for the rule body.',
                        mandatory: true,
                        mappedToColumn: 'script',
                        type: 'string',
                    },
                    {
                        name: 'active',
                        description: 'Whether the rule should be active immediately.',
                        mandatory: false,
                        mappedToColumn: 'active',
                        type: 'string',
                    },
                ],
                returnFields: [
                    { name: 'sys_id' },
                    { name: 'name' },
                    { name: 'collection' },
                    { name: 'when' },
                ],
            },
        },
    ],
})
