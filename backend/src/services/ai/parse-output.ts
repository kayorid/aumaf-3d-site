import { z } from 'zod'
import { httpErrors } from '../../lib/http-error'

const RawOutputSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  suggestedCategorySlug: z.string().optional(),
})

export type RawOutput = z.infer<typeof RawOutputSchema>

export function parseProviderJson(raw: string, providerName: string): RawOutput {
  let text = raw.trim()

  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
  }

  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  if (firstBrace > 0) text = text.slice(firstBrace)
  if (lastBrace > 0 && lastBrace < text.length - 1) text = text.slice(0, lastBrace + 1)

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (err) {
    throw httpErrors.badGateway(
      'AI_PARSE_ERROR',
      `Resposta de ${providerName} não é JSON válido: ${(err as Error).message}`,
    )
  }

  const result = RawOutputSchema.safeParse(parsed)
  if (!result.success) {
    throw httpErrors.badGateway(
      'AI_SCHEMA_ERROR',
      `Resposta de ${providerName} não bate com o schema esperado`,
    )
  }
  return result.data
}
