import OpenAI from 'openai'
import { env } from '../../../config/env'
import { httpErrors } from '../../../lib/http-error'
import { SYSTEM_PROMPT_PT_BR, buildUserPrompt } from '../prompts/blog-post.prompt'
import { parseProviderJson } from '../parse-output'
import type { AIProvider, ProviderInput, ProviderOutput } from '../provider.interface'

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai' as const
  readonly defaultModel = env.OPENAI_MODEL

  private client: OpenAI | null = null

  private getClient(): OpenAI {
    if (!env.OPENAI_API_KEY) {
      throw httpErrors.badRequest('AI_KEY_MISSING', 'OPENAI_API_KEY não configurada')
    }
    if (!this.client) {
      this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: 90_000 })
    }
    return this.client
  }

  async generatePost(input: ProviderInput): Promise<ProviderOutput> {
    const client = this.getClient()
    const userPrompt = buildUserPrompt(input)

    let response: Awaited<ReturnType<typeof client.chat.completions.create>>
    try {
      response = await client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT_PT_BR },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 8000,
      })
    } catch (err) {
      const message = (err as Error).message ?? 'Erro desconhecido'
      throw httpErrors.badGateway('AI_PROVIDER_ERROR', `OpenAI: ${message}`)
    }

    const text = response.choices[0]?.message?.content
    if (!text) throw httpErrors.badGateway('AI_NO_TEXT', 'OpenAI retornou sem conteúdo')

    const parsed = parseProviderJson(text, 'openai')

    return {
      ...parsed,
      model: response.model,
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
    }
  }
}
