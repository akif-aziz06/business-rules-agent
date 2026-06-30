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
                    'brg-col': {
                        table: 'sp_column'
                        id: '4d42bf2985154eed849f15b1a102a611'
                    }
                    'brg-container': {
                        table: 'sp_container'
                        id: '869395d6645f46f480a0df38369742c9'
                    }
                    'brg-instance': {
                        table: 'sp_instance'
                        id: '5f52645fd0974d69ad55c2a8f996b70b'
                    }
                    'brg-row': {
                        table: 'sp_row'
                        id: '2a2db17de35f4d39bba9e4443a780e54'
                    }
                    'brg-widget': {
                        table: 'sp_widget'
                        id: '286a524800144aa6badf9be289e36c2d'
                    }
                    'business-rule-api': {
                        table: 'sys_ws_definition'
                        id: 'a6b30d14c6754c5da612c8ed1b49696c'
                    }
                    'business-rule-api-generate': {
                        table: 'sys_ws_operation'
                        id: '46c42b57b5f84ffe942f5b1f8b87a73a'
                    }
                    'business-rule-validator-si': {
                        table: 'sys_script_include'
                        id: '9dff37be9ac148479dc6ee511696366d'
                    }
                    'conflict-detector-si': {
                        table: 'sys_script_include'
                        id: '05a405eb690942b18bf7d12c57b52d58'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '544fb4d2372a48879f9456f8fb8df468'
                    }
                    'prop-anthropic-key': {
                        table: 'sys_properties'
                        id: 'd349fd27bbff4ce69acdfb947afb2dae'
                    }
                    'prop-llm-enabled': {
                        table: 'sys_properties'
                        id: 'a5d79b06e1484560a740edb6f53fcc49'
                        deleted: true
                    }
                    'prop-llm-model': {
                        table: 'sys_properties'
                        id: 'e3790b16530240688205a5408ab17d5f'
                    }
                    'src_server_ai-agents_business-rule-agent_ts': {
                        table: 'sys_module'
                        id: '77ccf6888fae4ad982e3950cc76e8526'
                    }
                    'src_server_ai-agents_business-rule-orchestrator_ts': {
                        table: 'sys_module'
                        id: 'f9a8b4e7ef5a4edcae3e8e073db3dd8e'
                        deleted: true
                    }
                    'src_server_script-includes_business-rule-validator_js': {
                        table: 'sys_module'
                        id: 'bd50f22075794135b0ceba64c4e8620e'
                    }
                    'src_server_script-includes_conflict-detector_js': {
                        table: 'sys_module'
                        id: '939b1492eda34354ac26ad6a3f381a87'
                    }
                    'src_server_service-portal_business-rule-generator_client_js': {
                        table: 'sys_module'
                        id: 'cbcef98193454e71a7def67274ac5a74'
                    }
                }
                composite: [
                    {
                        table: 'sp_page'
                        id: '4c09091717e54125ae05ea145f6abfd4'
                        key: {
                            id: 'business_rule_generator'
                        }
                    },
                ]
            }
        }
    }
}
