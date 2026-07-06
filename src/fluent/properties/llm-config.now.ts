/**
 * System properties for LLM-assisted Business Rule script generation.
 *
 * The API key is an encrypted (password2) property — its definition ships with
 * the app, but the secret VALUE is set on the instance and never committed.
 * When `llm_enabled` is false or the key is empty, the pipeline falls back to
 * the built-in heuristic generator, so the app works with no key configured.
 */
import '@servicenow/sdk/global'
import { Property } from '@servicenow/sdk/core'

export const anthropicApiKey = Property({
    $id: Now.ID['prop-anthropic-key'],
    name: 'x_1896745_brule.anthropic_api_key',
    type: 'password2',
    isPrivate: true,
    description:
        'Anthropic API key for LLM-assisted Business Rule script generation. Set this on the instance; never commit a real value.',
})

// No declared `value`: a declared value is re-applied on every deploy and would
// clobber the admin's on-instance setting. The code's gs.getProperty() default
// supplies the model default (claude-haiku-4-5).
//
// There is intentionally NO separate enable toggle: LLM generation is ON when
// the api key property holds a value and OFF when it's empty. Setting the key is
// the activation; clearing it disables. (Avoids a boolean that deploys reset.)
export const llmModel = Property({
    $id: Now.ID['prop-llm-model'],
    name: 'x_1896745_brule.llm_model',
    type: 'string',
    description: 'Anthropic model id used for reasoning (default claude-haiku-4-5 for low cost; set claude-sonnet-4-6 or claude-opus-4-8 for higher reliability).',
})
