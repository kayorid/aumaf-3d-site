import { GoogleGenAI } from '@google/genai'
import { env } from '../../../config/env'
import { httpErrors } from '../../../lib/http-error'
import { SYSTEM_PROMPT_PT_BR, buildUserPrompt } from '../prompts/blog-post.prompt'
import { parseProviderJson } from '../parse-output'
import type { AIProvider, ProviderCredentials, ProviderInput, ProviderOutput } from '../provider.interface'

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini' as const
  readonly defaultModel = env.GEMINI_MODEL

  async generatePost(input: ProviderInput, creds?: ProviderCredentials): Promise<ProviderOutput> {
    const apiKey = creds?.apiKey || env.GEMINI_API_KEY
    if (!apiKey) {
      throw httpErrors.badRequest('AI_KEY_MISSING', 'GEMINI_API_KEY não configurada (use Settings → Integrações → IA)')
    }
    const model = creds?.model || this.defaultModel
    const client = new GoogleGenAI({ apiKey })
    const userPrompt = buildUserPrompt(input)

    let response
    try {
      response = await client.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT_PT_BR,
          responseMimeType: 'application/json',
          maxOutputTokens: 8000,
        },
      })
    } catch (err) {
      const message = (err as Error).message ?? 'Erro desconhecido'
      throw httpErrors.badGateway('AI_PROVIDER_ERROR', `Gemini: ${message}`)
    }

    const text = response.text
    if (!text) throw httpErrors.badGateway('AI_NO_TEXT', 'Gemini retornou sem conteúdo')

    const parsed = parseProviderJson(text, 'gemini')

    return {
      ...parsed,
      model,
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
      },
    }
  }
}
