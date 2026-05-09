import OpenAI from 'openai'
import { env } from '../../../config/env'
import { httpErrors } from '../../../lib/http-error'
import { SYSTEM_PROMPT_PT_BR, buildUserPrompt } from '../prompts/blog-post.prompt'
import { parseProviderJson } from '../parse-output'
import type { AIProvider, ProviderCredentials, ProviderInput, ProviderOutput } from '../provider.interface'

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai' as const
  readonly defaultModel = env.OPENAI_MODEL

  async generatePost(input: ProviderInput, creds?: ProviderCredentials): Promise<ProviderOutput> {
    const apiKey = creds?.apiKey || env.OPENAI_API_KEY
    if (!apiKey) {
      throw httpErrors.badRequest('AI_KEY_MISSING', 'OPENAI_API_KEY não configurada (use Settings → Integrações → IA)')
    }
    const model = creds?.model || this.defaultModel
    const client = new OpenAI({ apiKey, timeout: 90_000 })
    const userPrompt = buildUserPrompt(input)

    let response: Awaited<ReturnType<typeof client.chat.completions.create>>
    try {
      response = await client.chat.completions.create({
        model,
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
