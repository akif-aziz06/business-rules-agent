import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: '315b4054d5b94e67b3fc702062393aab'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '544fb4d2372a48879f9456f8fb8df468'
                    }
                }
            }
        }
    }
}
