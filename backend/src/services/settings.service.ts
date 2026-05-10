import { prisma } from '../lib/prisma'
import { logger } from '../config/logger'
import type { UpdateSettingsInput, SettingsDto } from '@aumaf/shared'

const SINGLETON_ID = 'default'

function toDto(s: Awaited<ReturnType<typeof prisma.setting.findUnique>>): SettingsDto {
  if (!s) {
    // fallback: nunca deve ocorrer pós-seed
    return {
      siteName: 'AUMAF 3D',
      siteDescription: null,
      contactEmail: null,
      contactPhone: null,
      whatsappNumber: null,
      botyoWebhookUrl: null,
      ga4MeasurementId: null,
      clarityProjectId: null,
      facebookPixelId: null,
      gtmContainerId: null,
      customHeadScripts: null,
      customBodyScripts: null,
      updatedAt: new Date().toISOString(),
    }
  }
  return {
    siteName: s.siteName,
    siteDescription: s.siteDescription,
    contactEmail: s.contactEmail,
    contactPhone: s.contactPhone,
    whatsappNumber: s.whatsappNumber,
    botyoWebhookUrl: s.botyoWebhookUrl,
    ga4MeasurementId: s.ga4MeasurementId,
    clarityProjectId: s.clarityProjectId,
    facebookPixelId: s.facebookPixelId,
    gtmContainerId: s.gtmContainerId,
    customHeadScripts: s.customHeadScripts,
    customBodyScripts: s.customBodyScripts,
    updatedAt: s.updatedAt.toISOString(),
  }
}

export async function getSettings(): Promise<SettingsDto> {
  const s = await prisma.setting.findUnique({ where: { id: SINGLETON_ID } })
  return toDto(s)
}

export async function updateSettings(input: UpdateSettingsInput): Promise<SettingsDto> {
  const data: Record<string, string | null> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue
    data[key] = value === '' ? null : (value as string | null)
  }

  const updated = await prisma.setting.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, siteName: 'AUMAF 3D', ...data },
    update: data,
  })
  logger.info({ keys: Object.keys(data) }, 'Settings updated')
  return toDto(updated)
}
