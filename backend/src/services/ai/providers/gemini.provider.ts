import { GoogleGenAI } from '@google/genai'
import { env } from '../../../config/env'
import { httpErrors } from '../../../lib/http-error'
import { SYSTEM_PROMPT_PT_BR, buildUserPrompt } from '../prompts/blog-post.prompt'
import { parseProviderJson } from '../parse-output'
import type { AIProvider, ProviderInput, ProviderOutput } from '../provider.interface'

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini' as const
  readonly defaultModel = env.GEMINI_MODEL

  private client: GoogleGenAI | null = null

  private getClient(): GoogleGenAI {
    if (!env.GEMINI_API_KEY) {
      throw httpErrors.badRequest('AI_KEY_MISSING', 'GEMINI_API_KEY não configurada')
    }
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
    }
    return this.client
  }

  async generatePost(input: ProviderInput): Promise<ProviderOutput> {
    const client = this.getClient()
    const userPrompt = buildUserPrompt(input)

    let response
    try {
      response = await client.models.generateContent({
        model: this.defaultModel,
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
      model: this.defaultModel,
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
      },
    }
  }
}
