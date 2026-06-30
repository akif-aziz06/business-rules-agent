function controller($http) {
    // Client controller for the Business Rule Generator widget. Posts the
    // plain-English requirement to the scoped Scripted REST API
    //   POST /api/x_1896745_brule/business_rule_agent/generate
    // and renders the created Business Rule (or any validation violations).
    // Same-origin $http carries the session + CSRF token automatically.
    var c = this

    c.requirement = ''
    c.name = ''
    c.loading = false
    c.result = null
    c.error = null
    c.violations = []

    c.generate = function () {
        if (!c.requirement || c.loading) {
            return
        }
        c.loading = true
        c.result = null
        c.error = null
        c.violations = []

        // Step 1 — validate + generate the Business Rule definition (server).
        $http
            .post('/api/x_1896745_brule/business_rule_agent/generate', {
                requirement: c.requirement,
                name: c.name,
            })
            .then(
                function (resp) {
                    // Scripted REST API wraps the body in a `result` envelope.
                    var body = (resp && resp.data) || {}
                    var d = body.result || body
                    if (!d.success || !d.record) {
                        c.error = d.error || 'Unexpected response from the generator'
                        c.violations = d.violations || []
                        c.loading = false
                        return
                    }
                    persist(d)
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

    // Step 2 — persist the validated record through the platform Table API,
    // which runs as the logged-in user (no scoped-app write restriction).
    function persist(d) {
        $http.post('/api/now/table/sys_script', d.record).then(
            function (cr) {
                var rec = (cr && cr.data && cr.data.result) || {}
                var s = d.summary || {}
                c.result = {
                    sys_id: rec.sys_id || '',
                    name: s.name,
                    table: s.table,
                    trigger_event: s.trigger_event,
                    timing: s.timing,
                    filter_condition: s.filter_condition,
                    conflict_count: s.conflict_count,
                    generated_by: s.generated_by,
                    warnings: s.warnings || [],
                }
                c.loading = false
            },
            function (cerr) {
                var cd = (cerr && cerr.data) || {}
                var e = cd.error || {}
                c.error =
                    e.message ||
                    e.detail ||
                    'Could not create the Business Rule (HTTP ' + (cerr && cerr.status) + '). You need create access on sys_script.'
                c.loading = false
            }
        )
    }
}
