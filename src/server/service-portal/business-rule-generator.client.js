function controller($http) {
    // Client controller for the Business Rule Generator widget.
    //
    // Flow: POST the plain-English requirement to the scoped Scripted REST API
    //   POST /api/x_1896745_brule/business_rule_agent/generate
    // which returns a *proposal* (it does not persist anything). The proposal is
    // rendered in an editable "BR Details" tab for review. Only when the admin
    // clicks "Create Business Rule" is the record written to sys_script via the
    // platform Table API (which runs as the logged-in user, no scoped-app write
    // restriction). Same-origin $http carries the session + CSRF token.
    var c = this

    c.requirement = ''
    c.name = '' // entered upfront with the requirement; the single source of truth
    c.nameFromAI = false // true when c.name holds an AI suggestion, not user input
    c.loading = false
    c.saving = false
    c.proposal = null // editable BR Details
    c.warnings = []
    c.blockingWarnings = [] // unresolved_reference / unverified_table — gate Create
    c.ackBlocking = false // reviewer acknowledged the blocking warnings
    c.activateOnCreate = false // unchecked = create the rule inactive (draft); safer default
    c.created = null // populated after successful persist
    c.error = null
    c.violations = []
    c.needsInput = null // vague-prompt clarification message
    c.tableInvalid = false
    c.dupe = null // { changed: bool, sys_id: string }

    // ---- Step 1: generate the proposal --------------------------------------
    c.generate = function () {
        if (!c.requirement || c.loading) {
            return
        }
        // A leftover AI-suggested name from a PRIOR requirement must not seed the
        // new request — clear it so the server suggests a name for THIS one. A
        // name the user typed themselves is kept.
        if (c.nameFromAI) {
            c.name = ''
            c.nameFromAI = false
        }
        c.loading = true
        c.proposal = null
        c.created = null
        c.error = null
        c.violations = []
        c.needsInput = null
        c.warnings = []
        c.blockingWarnings = []
        c.ackBlocking = false
        c.activateOnCreate = false
        c.tableInvalid = false
        c.dupe = null

        $http
            .post('/api/x_1896745_brule/business_rule_agent/generate', { requirement: c.requirement, name: c.name })
            .then(
                function (resp) {
                    var body = (resp && resp.data) || {}
                    var d = body.result || body

                    if (d.needs_input) {
                        c.needsInput = d.message || 'Please provide more detail.'
                        c.loading = false
                        return
                    }
                    if (!d.success || !d.proposal) {
                        c.error = d.error || 'Unexpected response from the generator'
                        c.violations = d.violations || []
                        c.loading = false
                        return
                    }

                    c.proposal = d.proposal
                    c.warnings = (d.meta && d.meta.warnings) || []
                    // Blocking issues require explicit reviewer acknowledgment
                    // before Create: an unresolved reference or an unverified
                    // table is unsafe to persist silently. Everything else warns.
                    c.blockingWarnings = c.warnings.filter(function (w) {
                        return w && !w.resolved && (w.issue === 'unresolved_reference' || w.issue === 'unverified_table')
                    })
                    c.ackBlocking = false
                    c.tableInvalid = c.proposal.table_exists === false
                    c.loading = false
                    // If the user left the name blank, adopt the AI's suggestion
                    // and mark it as AI-sourced so a later generate() won't reuse
                    // it for a different requirement.
                    if (!c.name.trim()) {
                        c.name = c.proposal.name || ''
                        c.nameFromAI = true
                    }
                    // Now that the table is known, check the name for a duplicate.
                    c.onNameChange()
                },
                function (err) {
                    var body = (err && err.data) || {}
                    var d = body.result || body
                    c.error = d.error || 'Request failed (HTTP ' + (err && err.status) + ')'
                    c.violations = d.violations || []
                    c.loading = false
                }
            )
    }

    // ---- Table validation vs sys_db_object ----------------------------------
    c.onTableChange = function () {
        var t = (c.proposal.table || '').trim()
        c.dupe = null // table change invalidates any prior duplicate check
        if (!t) {
            c.tableInvalid = true
            return
        }
        $http
            .get('/api/now/table/sys_db_object?sysparm_limit=1&sysparm_fields=name&sysparm_query=name=' + encodeURIComponent(t))
            .then(
                function (resp) {
                    var rows = (resp && resp.data && resp.data.result) || []
                    c.tableInvalid = rows.length === 0
                    if (!c.tableInvalid) {
                        c.checkDuplicate()
                    }
                },
                function () {
                    // On a lookup failure, don't hard-block the user.
                    c.tableInvalid = false
                }
            )
    }

    // ---- Duplicate-name handling --------------------------------------------
    // Fired when the USER edits the name field (ng-change) — the name is now
    // user-owned, so clear the AI-sourced flag before re-checking duplicates.
    c.onNameEdit = function () {
        c.nameFromAI = false
        c.onNameChange()
    }

    c.onNameChange = function () {
        c.dupe = null
        c.checkDuplicate()
    }

    c.checkDuplicate = function () {
        // The check needs the AI-resolved table, so it only runs after a proposal
        // exists. Editing the name upfront (before Generate) is a no-op here.
        if (!c.proposal) {
            return
        }
        var name = (c.name || '').trim()
        var table = (c.proposal.table || '').trim()
        if (!name || !table || c.tableInvalid) {
            return
        }
        var q = 'name=' + name + '^collection=' + table
        $http
            .get('/api/now/table/sys_script?sysparm_limit=1&sysparm_fields=sys_id,description&sysparm_query=' + encodeURIComponent(q))
            .then(function (resp) {
                var rows = (resp && resp.data && resp.data.result) || []
                if (!rows.length) {
                    c.dupe = null
                    return
                }
                var existing = rows[0]
                // exact = same name AND same requirement → an identical copy; ask
                // the user to change the name or the requirement (block create).
                // Otherwise the requirement differs → offer Overwrite / Rename.
                var sameReq = (existing.description || '').trim() === (c.requirement || '').trim()
                c.dupe = { exact: sameReq, sys_id: existing.sys_id, resolved: false }
            })
    }

    // Exact duplicate — user chose to change the NAME. Suggest a distinct name
    // (they can edit further); the ng-change re-check clears the block once unique.
    c.changeName = function () {
        var base = (c.name || '').trim()
        var m = base.match(/_v(\d+)$/)
        c.name = m ? base.replace(/_v\d+$/, '_v' + (parseInt(m[1], 10) + 1)) : base + '_v2'
        c.nameFromAI = false // a deliberately-distinct name is now user-owned
        c.onNameChange()
    }

    // Exact duplicate — user chose to change the REQUIREMENT. Return to the input
    // so they can reword it and regenerate (the name is kept).
    c.changeRequirement = function () {
        c.proposal = null
        c.dupe = null
        c.created = null
    }

    c.overwrite = function () {
        // Confirm() will PUT to the existing record instead of POSTing a new one.
        if (c.dupe) {
            c.dupe.resolved = true // unblock the Create button; retain sys_id for PUT
            c.dupe.overwrite = true
        }
        c.confirm()
    }

    c.rename = function () {
        // Clear the duplicate state so the user can edit the Name field freely;
        // re-checks run automatically via ng-change on the Name input.
        c.dupe = null
    }

    // ---- Set-field-value row editing ----------------------------------------
    c.addSetValue = function () {
        c.proposal.actions.set_values.push({ field: '', value: '' })
    }
    c.removeSetValue = function (i) {
        c.proposal.actions.set_values.splice(i, 1)
    }

    // ---- Build the sys_script record from the edited proposal ---------------
    function buildRecord(p) {
        var useScript = !!p.use_script
        var setValues = (p.actions && p.actions.set_values) || []
        // Business Rule "Set field values" are stored in the `template` field as
        // an encoded name=value list joined by ^.
        var template = useScript
            ? ''
            : setValues
                  .filter(function (v) {
                      return (v.field || '').trim()
                  })
                  .map(function (v) {
                      return v.field.trim() + '=' + (v.value || '')
                  })
                  .join('^')

        var addMessage = !useScript && !!p.actions.add_message
        var abortAction = !useScript && !!p.actions.abort_action

        return {
            name: (c.name || '').trim(),
            collection: (p.table || '').trim(),
            when: p.when,
            action_insert: p.operations.insert ? 'true' : 'false',
            action_update: p.operations.update ? 'true' : 'false',
            action_delete: p.operations.delete ? 'true' : 'false',
            action_query: p.operations.query ? 'true' : 'false',
            filter_condition: p.condition || '',
            role_conditions: p.role_conditions || '',
            advanced: useScript ? 'true' : 'false',
            script: useScript ? p.script || '' : '',
            template: template,
            add_message: addMessage ? 'true' : 'false',
            message: addMessage ? p.actions.message || '' : '',
            abort_action: abortAction ? 'true' : 'false',
            active: c.activateOnCreate ? 'true' : 'false',
            // Store the source requirement so future duplicate checks can detect
            // whether the requirement behind a same-named rule has changed.
            description: c.requirement || '',
        }
    }

    // ---- Step 2: persist on confirm -----------------------------------------
    c.confirm = function () {
        var p = c.proposal
        if (!p || c.saving) {
            return
        }
        if (!(c.name || '').trim()) {
            c.error = 'Name is mandatory.'
            return
        }
        if (c.tableInvalid) {
            c.error = 'Table does not exist.'
            return
        }
        // Blocking warnings (unresolved reference / unverified table) must be
        // explicitly acknowledged before persisting — never silently created.
        if (c.blockingWarnings.length && !c.ackBlocking) {
            c.error = 'Acknowledge the blocking warning(s) before creating this rule.'
            return
        }
        // If a conflicting rule still needs a decision, wait for the user to
        // resolve it (change name/requirement, or Overwrite/Rename).
        if (c.dupe && !c.dupe.resolved) {
            return
        }

        c.saving = true
        c.error = null
        var record = buildRecord(p)

        var req
        if (c.dupe && c.dupe.overwrite && c.dupe.sys_id) {
            req = $http.put('/api/now/table/sys_script/' + c.dupe.sys_id, record)
        } else {
            req = $http.post('/api/now/table/sys_script', record)
        }

        req.then(
            function (cr) {
                var rec = (cr && cr.data && cr.data.result) || {}
                var ops = []
                if (p.operations.insert) ops.push('Insert')
                if (p.operations.update) ops.push('Update')
                if (p.operations.delete) ops.push('Delete')
                if (p.operations.query) ops.push('Query')
                c.created = {
                    sys_id: rec.sys_id || (c.dupe && c.dupe.sys_id) || '',
                    name: record.name,
                    table: record.collection,
                    operations: ops.join(', '),
                    when: record.when,
                    condition: record.filter_condition,
                }
                c.proposal = null
                c.saving = false
            },
            function (cerr) {
                var cd = (cerr && cerr.data) || {}
                var e = cd.error || {}
                c.error =
                    e.message ||
                    e.detail ||
                    'Could not create the Business Rule (HTTP ' + (cerr && cerr.status) + '). You need create access on sys_script.'
                c.saving = false
            }
        )
    }
}
