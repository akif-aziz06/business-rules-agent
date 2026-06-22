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
                    'business-rule-agent': {
                        table: 'sn_aia_agent'
                        id: 'ea5cdb3258424d589f43c959eba6f1bd'
                        deleted: true
                    }
                    'business-rule-agent-acl': {
                        table: 'sys_security_acl'
                        id: '85133e66a80a4264b4d35ebb6119bb22'
                        deleted: true
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
                    'src_server_ai-agents_business-rule-agent_ts': {
                        table: 'sys_module'
                        id: '77ccf6888fae4ad982e3950cc76e8526'
                    }
                    'src_server_ai-agents_business-rule-orchestrator_ts': {
                        table: 'sys_module'
                        id: 'f9a8b4e7ef5a4edcae3e8e073db3dd8e'
                    }
                    'src_server_script-includes_business-rule-validator_js': {
                        table: 'sys_module'
                        id: 'bd50f22075794135b0ceba64c4e8620e'
                    }
                    'src_server_script-includes_conflict-detector_js': {
                        table: 'sys_module'
                        id: '939b1492eda34354ac26ad6a3f381a87'
                    }
                }
                composite: [
                    {
                        table: 'sn_aia_agent_tool_m2m'
                        id: '069014cad5014532828f1b1b96b5da30'
                        deleted: true
                        key: {
                            agent: 'ea5cdb3258424d589f43c959eba6f1bd'
                            tool: 'badd81edf7984bef8bc05bb5062eb890'
                        }
                    },
                    {
                        table: 'sn_aia_tool'
                        id: '06ea9c4b0c94438c9978cea78ca083fb'
                        deleted: true
                        key: {
                            name: 'Parse Requirement'
                        }
                    },
                    {
                        table: 'sn_aia_agent_tool_m2m'
                        id: '17ad15e4a1864c62a7397eb75a974651'
                        deleted: true
                        key: {
                            agent: 'ea5cdb3258424d589f43c959eba6f1bd'
                            tool: '06ea9c4b0c94438c9978cea78ca083fb'
                        }
                    },
                    {
                        table: 'sn_aia_tool'
                        id: '40fed985a6a24b29909f9bb06eff8d98'
                        deleted: true
                        key: {
                            name: 'Create Business Rule'
                        }
                    },
                    {
                        table: 'sn_aia_tool'
                        id: '44374c6efe2944b69cab69258dafbdb7'
                        deleted: true
                        key: {
                            name: 'Detect Conflicts'
                        }
                    },
                    {
                        table: 'sn_aia_tool'
                        id: '468f5c867f8741159cbee5a8457bd93b'
                        deleted: true
                        key: {
                            name: 'Generate Script Body'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '4b166e40fbfb43ffb6763080c5acfb22'
                        deleted: true
                        key: {
                            sys_security_acl: '85133e66a80a4264b4d35ebb6119bb22'
                            sys_user_role: '282bf1fac6112285017366cb5f867469'
                        }
                    },
                    {
                        table: 'sn_aia_agent_tool_m2m'
                        id: '8097c323ee4b40279359a24747d2536e'
                        deleted: true
                        key: {
                            agent: 'ea5cdb3258424d589f43c959eba6f1bd'
                            tool: '468f5c867f8741159cbee5a8457bd93b'
                        }
                    },
                    {
                        table: 'sn_aia_agent_config'
                        id: '9cba78f9f7764b27829e454121103c9c'
                        deleted: true
                        key: {
                            agent: 'ea5cdb3258424d589f43c959eba6f1bd'
                        }
                    },
                    {
                        table: 'sys_agent_access_role_configuration'
                        id: 'b6b9799e135e4d5794421a9e19d069ad'
                        deleted: true
                        key: {
                            agent: 'ea5cdb3258424d589f43c959eba6f1bd'
                        }
                    },
                    {
                        table: 'sn_aia_tool'
                        id: 'badd81edf7984bef8bc05bb5062eb890'
                        deleted: true
                        key: {
                            name: 'Validate Timing & Safety'
                        }
                    },
                    {
                        table: 'sn_aia_version'
                        id: 'be42aa2ac2ce4732a93ccb6cadb96a47'
                        deleted: true
                        key: {
                            target_id: 'ea5cdb3258424d589f43c959eba6f1bd'
                            version_name: 'V1'
                        }
                    },
                    {
                        table: 'sn_aia_agent_tool_m2m'
                        id: 'ccf85c2954774a979b75f1a891741211'
                        deleted: true
                        key: {
                            agent: 'ea5cdb3258424d589f43c959eba6f1bd'
                            tool: '40fed985a6a24b29909f9bb06eff8d98'
                        }
                    },
                    {
                        table: 'sn_aia_agent_tool_m2m'
                        id: 'eeafd0c3d55540ac82cdfdac7e68f240'
                        deleted: true
                        key: {
                            agent: 'ea5cdb3258424d589f43c959eba6f1bd'
                            tool: '44374c6efe2944b69cab69258dafbdb7'
                        }
                    },
                ]
            }
        }
    }
}
