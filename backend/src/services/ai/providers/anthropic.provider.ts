import Anthropic from '@anthropic-ai/sdk'
import { env } from '../../../config/env'
import { httpErrors } from '../../../lib/http-error'
import { SYSTEM_PROMPT_PT_BR, buildUserPrompt } from '../prompts/blog-post.prompt'
import { parseProviderJson } from '../parse-output'
import type { AIProvider, ProviderInput, ProviderOutput } from '../provider.interface'

export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic' as const
  readonly defaultModel = env.ANTHROPIC_MODEL

  private client: Anthropic | null = null

  private getClient(): Anthropic {
    if (!env.ANTHROPIC_API_KEY) {
      throw httpErrors.badRequest('AI_KEY_MISSING', 'ANTHROPIC_API_KEY não configurada')
    }
    if (!this.client) {
      this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, timeout: 90_000 })
    }
    return this.client
  }

  async generatePost(input: ProviderInput): Promise<ProviderOutput> {
    const client = this.getClient()
    const userPrompt = buildUserPrompt(input)

    let response: Awaited<ReturnType<typeof client.messages.create>>
    try {
      response = await client.messages.create({
        model: this.defaultModel,
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
