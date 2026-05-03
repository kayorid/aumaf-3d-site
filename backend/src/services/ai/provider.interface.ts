import type { AIProviderName, GeneratePostInput, GeneratePostOutput } from '@aumaf/shared'

export type ProviderInput = Omit<GeneratePostInput, 'provider'>
export type ProviderOutput = Omit<GeneratePostOutput, 'provider' | 'latencyMs'>

export interface AIProvider {
  readonly name: AIProviderName
  readonly defaultModel: string
  generatePost(input: ProviderInput): Promise<ProviderOutput>
}
