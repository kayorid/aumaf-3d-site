import { z } from 'zod'

export const AIProviderNameSchema = z.enum(['anthropic', 'openai', 'gemini'])
export type AIProviderName = z.infer<typeof AIProviderNameSchema>

export const AIToneSchema = z.enum(['técnico', 'didático', 'comercial'])
export type AITone = z.infer<typeof AIToneSchema>

export const GeneratePostInputSchema = z.object({
  topic: z.string().min(5).max(500),
  keywords: z.array(z.string().min(1).max(50)).max(10).optional(),
  tone: AIToneSchema.default('didático'),
  targetWordCount: z.number().int().min(300).max(3000).default(1200),
  provider: AIProviderNameSchema.optional(),
})
export type GeneratePostInput = z.infer<typeof GeneratePostInputSchema>

export const GeneratePostOutputSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  content: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  suggestedCategorySlug: z.string().optional(),
  provider: AIProviderNameSchema,
  model: z.string(),
  usage: z.object({
    inputTokens: z.number(),
    outputTokens: z.number(),
    estimatedCostUsd: z.number().optional(),
  }),
  latencyMs: z.number(),
})
export type GeneratePostOutput = z.infer<typeof GeneratePostOutputSchema>
