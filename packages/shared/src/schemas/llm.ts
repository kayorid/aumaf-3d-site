import { z } from 'zod'
import { AIProviderNameSchema } from './ai'
import { SecretFieldDtoSchema } from './integrations'

/**
 * Read DTO da configuração de provedores de LLM.
 * Cada provider tem uma chave (sensível, mascarada) + modelo padrão (opcional).
 * `defaultProvider` define qual usar quando nenhum é especificado na geração.
 */
export const LLMProviderConfigDtoSchema = z.object({
  provider: AIProviderNameSchema,
  apiKey: SecretFieldDtoSchema,
  model: z.string().nullable(),
  envFallback: z.boolean(),
})
export type LLMProviderConfigDto = z.infer<typeof LLMProviderConfigDtoSchema>

export const LLMConfigDtoSchema = z.object({
  defaultProvider: AIProviderNameSchema,
  providers: z.array(LLMProviderConfigDtoSchema),
})
export type LLMConfigDto = z.infer<typeof LLMConfigDtoSchema>

export const UpdateLLMConfigSchema = z
  .object({
    defaultProvider: AIProviderNameSchema.optional(),
    openaiApiKey: z.string().min(8).optional(),
    openaiModel: z.string().min(1).max(100).optional(),
    anthropicApiKey: z.string().min(8).optional(),
    anthropicModel: z.string().min(1).max(100).optional(),
    geminiApiKey: z.string().min(8).optional(),
    geminiModel: z.string().min(1).max(100).optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: 'Pelo menos um campo deve ser fornecido',
  })
export type UpdateLLMConfigInput = z.infer<typeof UpdateLLMConfigSchema>

export const TestLLMConnectionSchema = z.object({
  provider: AIProviderNameSchema,
  apiKey: z.string().min(8).optional(),
})
export type TestLLMConnectionInput = z.infer<typeof TestLLMConnectionSchema>

export const LLMTestResultSchema = z.object({
  ok: z.boolean(),
  message: z.string(),
  latencyMs: z.number(),
  model: z.string().nullable(),
})
export type LLMTestResult = z.infer<typeof LLMTestResultSchema>
