import Anthropic from '@anthropic-ai/sdk'
import { env } from '../../../config/env'
import { httpErrors } from '../../../lib/http-error'
import { SYSTEM_PROMPT_PT_BR, buildUserPrompt } from '../prompts/blog-post.prompt'
import { parseProviderJson } from '../parse-output'
import type { AIProvider, ProviderCredentials, ProviderInput, ProviderOutput } from '../provider.interface'

export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic' as const
  readonly defaultModel = env.ANTHROPIC_MODEL

  async generatePost(input: ProviderInput, creds?: ProviderCredentials): Promise<ProviderOutput> {
    const apiKey = creds?.apiKey || env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw httpErrors.badRequest('AI_KEY_MISSING', 'ANTHROPIC_API_KEY não configurada (use Settings → Integrações → IA)')
    }
    const model = creds?.model || this.defaultModel
    const client = new Anthropic({ apiKey, timeout: 90_000 })
    const userPrompt = buildUserPrompt(input)

    let response: Awaited<ReturnType<typeof client.messages.create>>
    try {
      response = await client.messages.create({
        model,
        max_tokens: 8000,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT_PT_BR,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: userPrompt }],
      })
    } catch (err) {
      const message = (err as Error).message ?? 'Erro desconhecido'
      throw httpErrors.badGateway('AI_PROVIDER_ERROR', `Anthropic: ${message}`)
    }

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw httpErrors.badGateway('AI_NO_TEXT', 'Anthropic retornou sem bloco de texto')
    }

    const parsed = parseProviderJson(textBlock.text, 'anthropic')

    return {
      ...parsed,
      model: response.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    }
  }
}
