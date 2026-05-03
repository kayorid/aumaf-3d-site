import { env } from '../../config/env'
import { logger } from '../../config/logger'
import { httpErrors } from '../../lib/http-error'
import { AnthropicProvider } from './providers/anthropic.provider'
import { OpenAIProvider } from './providers/openai.provider'
import { GeminiProvider } from './providers/gemini.provider'
import type { AIProvider } from './provider.interface'
import type { AIProviderName, GeneratePostInput, GeneratePostOutput } from '@aumaf/shared'

const providers: Record<AIProviderName, AIProvider> = {
  anthropic: new AnthropicProvider(),
  openai: new OpenAIProvider(),
  gemini: new GeminiProvider(),
}

export function getProvider(requested?: AIProviderName): AIProvider {
  const name = requested ?? env.AI_PROVIDER
  const provider = providers[name]
  if (!provider) throw httpErrors.badRequest('INVALID_AI_PROVIDER', `Provedor desconhecido: ${name}`)
  return provider
}

export async function generatePost(input: GeneratePostInput): Promise<GeneratePostOutput> {
  const provider = getProvider(input.provider)
  const start = Date.now()

  try {
    const output = await provider.generatePost({
      topic: input.topic,
      keywords: input.keywords,
      tone: input.tone,
      targetWordCount: input.targetWordCount,
    })
    const latencyMs = Date.now() - start

    logger.info(
      {
        provider: provider.name,
        model: output.model,
        inputTokens: output.usage.inputTokens,
        outputTokens: output.usage.outputTokens,
        latencyMs,
        topic: input.topic.slice(0, 80),
      },
      'AI post generated',
    )

    return {
      ...output,
      provider: provider.name,
      latencyMs,
    }
  } catch (err) {
    const latencyMs = Date.now() - start
    logger.warn(
      { provider: provider.name, latencyMs, err: (err as Error).message },
      'AI generation failed',
    )
    throw err
  }
}
