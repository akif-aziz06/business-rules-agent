# Architecture

## System Overview

The Business Rule AI Agent is a ServiceNow-native application that accepts a natural-language business requirement from a user and autonomously produces a validated, platform-safe Business Rule record (`sys_script`) on the target instance.

It is implemented entirely within the ServiceNow platform using:
- **Now SDK v4.7.2 (Fluent)** for artifact definitions
- **ServiceNow AI Agent (`sn_aia_agent`)** as the orchestration layer
- **Script Includes** for reusable server-side validation and conflict detection logic

---

## Component Map

```
┌─────────────────────────────────────────────────────────┐
│                  Now Assist Panel (UI)                   │
│         User types natural language requirement          │
└───────────────────────┬─────────────────────────────────┘
                        │ invokes
                        ▼
┌─────────────────────────────────────────────────────────┐
│            AI Agent: Business Rule Generator            │
│              (sn_aia_agent, AiAgent Fluent)             │
│                                                         │
│  Tool 1: Parse Requirement          [script tool]       │
│  Tool 2: Detect Conflicts           [script tool]       │
│  Tool 3: Validate Timing & Safety   [script tool]       │
│  Tool 4: Generate Script Body       [script tool]       │
│  Tool 5: Create Business Rule       [crud tool]         │
└────┬────────────────────────┬────────────────────────── ┘
     │ calls                  │ writes
     ▼                        ▼
┌────────────────┐    ┌───────────────────────────────────┐
│ Script Include │    │  sys_script (Business Rule table) │
│ conflict-      │    │  - name, table, when, action      │
│ detector       │    │  - filterCondition, script        │
│                │    │  - active = true                  │
│ Script Include │    └───────────────────────────────────┘
│ business-rule- │
│ validator      │
└────────────────┘
```

---

## Decision: Single Agent, Not Agentic Workflow

All five tools operate on the same capability type (platform configuration read + `sys_script` write). The SDK guidance is clear: multiple tools of the same capability type on one agent → single `AiAgent`. A workflow would add overhead with no benefit here.

The agent uses `executionMode: 'autopilot'` on all tools so the full pipeline runs without prompting the user for each step.

---

## Data Flow

```
NL Input
  │
  ▼
Tool 1 — Parse Requirement
  ├── Extracts: trigger_event (insert/update/delete/query)
  ├── Extracts: condition_filter (business condition)
  └── Extracts: automation_action (what to do)
  │
  ▼
Tool 2 — Detect Conflicts
  ├── Reads: sys_script (active Business Rules on target table)
  ├── Reads: sys_hub_flow (Flow Designer flows)
  ├── Reads: sys_ui_policy (UI Policies)
  ├── Reads: sys_data_policy2 (Data Policies)
  ├── Reads: sys_script_client (Client Scripts)
  └── Returns: conflict list or CLEAR signal
  │
  ▼
Tool 3 — Validate Timing & Safety
  ├── Selects: before / after / async based on action type
  ├── Blocks: current.update() in before/after context
  ├── Warns: After-rule same-record modification → redirects to Before
  └── Returns: approved_timing + warnings[]
  │
  ▼
Tool 4 — Generate Script Body
  ├── Produces: self-contained JavaScript handler (IIFE)
  ├── Includes: try/catch with gs.error() logging
  ├── Uses: condition_filter in filterCondition (not script body)
  └── Returns: validated_script_string
  │
  ▼
Tool 5 — Create Business Rule (CRUD)
  ├── Table: sys_script
  ├── Fields: name, table, when, action[], filterCondition, script, active
  └── Returns: created record number/sys_id
```

---

## ServiceNow Tables

| Table | Role |
|---|---|
| `sn_aia_agent` | Stores the AI Agent record (deployed by SDK) |
| `sys_script` | Target output — Business Rule records |
| `sys_hub_flow` | Read during conflict sweep (Flow Designer) |
| `sys_ui_policy` | Read during conflict sweep (UI Policies) |
| `sys_data_policy2` | Read during conflict sweep (Data Policies) |
| `sys_script_client` | Read during conflict sweep (Client Scripts) |
| `sys_script_include` | Conflict Detector and Validator Script Includes |

---

## Security Model

```
securityAcl.type = 'Specific role'
roles: [itil (282bf1fac6112285017366cb5f867469)]

runAsUser: not set
dataAccess.roleMap: ['itil']   → agent runs as invoking user, restricted to itil role
```

The agent reads platform configuration tables (requires `itil` read access) and creates `sys_script` records (requires admin or `script_writer` access in production — review ACLs before go-live).

---

## Fluent File Layout (planned)

```
src/fluent/
  index.now.ts                              ← re-exports all artifacts
  ai-agents/
    business-rule-agent.now.ts             ← AiAgent definition
  script-includes/
    conflict-detector.now.ts               ← ScriptInclude: conflict sweep
    business-rule-validator.now.ts         ← ScriptInclude: safety checks

src/server/
  ai-agents/
    business-rule-agent.ts                 ← agent tool scripts (script tool bodies)
  script-includes/
    conflict-detector.ts                   ← conflict detection logic
    business-rule-validator.ts             ← timing/safety validation logic
  tsconfig.json
```

---

## Execution Timing Decision Matrix

| Requirement Pattern | Assigned `when` | Rationale |
|---|---|---|
| "validate before save", "abort if…", "set field on insert" | `before` | Modifies `current` pre-save; no separate GR update needed |
| "notify after close", "log when state changes", "create child record" | `after` | Needs final saved state; touches related records only |
| "send to external system", "run heavy processing" | `async` | Must not block UI; third-party calls |
| "modify same record after update" | `before` (with warning) | After-rule same-record modification causes extra DB write; redirect to Before |

---

## Safety Constraints

These are platform safety rules enforced in `business-rule-validator.ts` before any Business Rule is created:

1. **Recursion prevention** — scripts must never call `current.update()` in `before` or `after` context
2. **Query action gate** — `query` action subscription requires explicit user confirmation (fires on every table read)
3. **Condition-first** — filters go in `filterCondition`, not as `if` guards inside the script body
4. **Exception logging** — all generated scripts wrap logic in try/catch with `gs.error()`
5. **GlideRecordSecure** — conflict-detection server scripts use `GlideRecordSecure`, never `GlideRecord`
6. **Async for integrations** — any third-party REST call must use `async` timing
