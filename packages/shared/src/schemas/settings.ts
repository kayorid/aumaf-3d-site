import { z } from 'zod'

const ga4Regex = /^G-[A-Z0-9]{8,12}$/
const gtmRegex = /^GTM-[A-Z0-9]{6,8}$/
const clarityRegex = /^[a-z0-9]{8,12}$/
const fbPixelRegex = /^\d{15,16}$/
const phoneRegex = /^\+?[1-9]\d{10,14}$/

const optionalNullable = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), schema.optional())

export const UpdateSettingsSchema = z.object({
  siteName: z.string().min(2).max(100).optional(),
  siteDescription: optionalNullable(z.string().max(300)),
  contactEmail: optionalNullable(z.string().email()),
  contactPhone: optionalNullable(z.string().max(20)),
  whatsappNumber: optionalNullable(z.string().regex(phoneRegex, 'Formato inválido — use +5516992863412')),
  botyoWebhookUrl: optionalNullable(z.string().url()),
  ga4MeasurementId: optionalNullable(z.string().regex(ga4Regex, 'GA4 deve começar com G-')),
  clarityProjectId: optionalNullable(z.string().regex(clarityRegex, 'Clarity ID inválido')),
  facebookPixelId: optionalNullable(z.string().regex(fbPixelRegex, 'Pixel ID deve ter 15-16 dígitos')),
  gtmContainerId: optionalNullable(z.string().regex(gtmRegex, 'GTM deve começar com GTM-')),
  customHeadScripts: optionalNullable(z.string().max(5000)),
  customBodyScripts: optionalNullable(z.string().max(5000)),
})
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>

export const SettingsDtoSchema = z.object({
  siteName: z.string(),
  siteDescription: z.string().nullable(),
  contactEmail: z.string().nullable(),
  contactPhone: z.string().nullable(),
  whatsappNumber: z.string().nullable(),
  botyoWebhookUrl: z.string().nullable(),
  ga4MeasurementId: z.string().nullable(),
  clarityProjectId: z.string().nullable(),
  facebookPixelId: z.string().nullable(),
  gtmContainerId: z.string().nullable(),
  customHeadScripts: z.string().nullable(),
  customBodyScripts: z.string().nullable(),
  updatedAt: z.string(),
})
export type SettingsDto = z.infer<typeof SettingsDtoSchema>

// Subset publicado para o frontend público (sem campos sensíveis como botyoWebhookUrl)
export const PublicSettingsDtoSchema = z.object({
  ga4MeasurementId: z.string().nullable(),
  clarityProjectId: z.string().nullable(),
  facebookPixelId: z.string().nullable(),
  gtmContainerId: z.string().nullable(),
  customHeadScripts: z.string().nullable(),
  customBodyScripts: z.string().nullable(),
})
export type PublicSettingsDto = z.infer<typeof PublicSettingsDtoSchema>
