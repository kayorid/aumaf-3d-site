import { z } from 'zod'

export const UpdateSettingsSchema = z.object({
  siteName: z.string().min(2).max(100).optional(),
  siteDescription: z.string().max(300).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),
  whatsappNumber: z.string().max(20).optional(),
  botyoWebhookUrl: z.string().url().optional(),
  ga4MeasurementId: z.string().optional(),
  clarityProjectId: z.string().optional(),
  facebookPixelId: z.string().optional(),
  gtmContainerId: z.string().optional(),
  customHeadScripts: z.string().optional(),
  customBodyScripts: z.string().optional(),
})
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>
