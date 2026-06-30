/**
 * Service Portal UI for the Business Rule Generator.
 *
 *   - SPWidget: a self-contained AngularJS widget (textarea + button + result
 *     panel) whose client controller POSTs the plain-English requirement to the
 *     scoped Scripted REST API and renders the created Business Rule.
 *   - SPPage:   hosts the widget; reachable at /sp?id=business_rule_generator
 *     on the instance's default Service Portal.
 *
 * No enterprise plugins required — pure Service Portal, available on every
 * instance including PDIs.
 */
import '@servicenow/sdk/global'
import { SPWidget, SPPage } from '@servicenow/sdk/core'

export const businessRuleWidget = SPWidget({
    $id: Now.ID['brg-widget'],
    name: 'Business Rule Generator',
    id: 'business_rule_generator_widget',
    category: 'custom',
    hasPreview: false,
    htmlTemplate: Now.include('../../server/service-portal/business-rule-generator.html'),
    clientScript: Now.include('../../server/service-portal/business-rule-generator.client.js'),
    customCss: Now.include('../../server/service-portal/business-rule-generator.scss'),
})

export const businessRulePage = SPPage({
    title: 'Business Rule Generator',
    pageId: 'business_rule_generator',
    category: 'custom',
    shortDescription: 'Generate platform-safe Business Rules from plain-English requirements.',
    containers: [
        {
            $id: Now.ID['brg-container'],
            name: 'Main',
            order: 1,
            rows: [
                {
                    $id: Now.ID['brg-row'],
                    order: 1,
                    columns: [
                        {
                            $id: Now.ID['brg-col'],
                            size: 12,
                            order: 1,
                            instances: [
                                {
                                    $id: Now.ID['brg-instance'],
                                    widget: businessRuleWidget,
                                    order: 1,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
})
