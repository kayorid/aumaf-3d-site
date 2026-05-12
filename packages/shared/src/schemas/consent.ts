import { z } from 'zod'

/**
 * Categorias de consentimento conforme a Política de Cookies.
 * `necessary` é sempre true (cookies estritamente necessários — base legal
 * legítimo interesse / execução de contrato).
 */
export const ConsentCategoriesSchema = z.object({
  necessary: z.literal(true),
  functional: z.boolean(),
  analytics: z.boolean(),
  marketing: z.boolean(),
})
export type ConsentCategories = z.infer<typeof ConsentCategoriesSchema>

export const ConsentSourceSchema = z.enum([
  'banner_accept_all',
  'banner_reject_optional',
  'banner_custom',
  'preferences_page',
])
export type ConsentSource = z.infer<typeof ConsentSourceSchema>

export const CreateConsentLogSchema = z.object({
  categories: ConsentCategoriesSchema,
  policyVersion: z.string().min(1).max(20),
  source: ConsentSourceSchema,
  userIdHash: z.string().max(128).optional(),
})
export type CreateConsentLogInput = z.infer<typeof CreateConsentLogSchema>
