import type { Lead } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { logger } from '../config/logger'
import { normalizePhoneBR } from '../lib/phone'
import { getBotyioConfig } from './integration-config.service'

export class BotyoRetryableError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'BotyoRetryableError'
  }
}

interface BotyoSuccessData {
  id: string
  externalId: string | null
  status: 'queued' | 'skipped'
  whatsapp: { willAttempt: boolean; reason: string | null }
  links: { self: string }
}

interface BotyoErrorData {
  error?: string
  message?: string
}

function buildPayload(lead: Lead) {
  const phone = normalizePhoneBR(lead.phone ?? undefined)

  const variables: Record<string, string> = {
    name: lead.name,
    firstName: lead.name.split(' ')[0] ?? lead.name,
    message_preview: lead.message?.slice(0, 140) ?? '',
    utm_source: lead.utmSource ?? 'direct',
  }

  const metadata: Record<string, unknown> = {
    capturedAt: lead.createdAt.toISOString(),
    utm: {
      source: lead.utmSource ?? null,
      medium: lead.utmMedium ?? null,
      campaign: lead.utmCampaign ?? null,
      term: lead.utmTerm ?? null,
      content: lead.utmContent ?? null,
    },
    referrer: lead.referrer ?? null,
    landingPage: lead.landingPage ?? null,
  }

  // Botyio resolve o Source pela API key bound (boundLeadSourceId nos scopes da key);
  // mandar `source` no body viola o schema .strict() e retorna 400.
  // Preservamos lead.source nosso lado em metadata para auditoria.
  return {
    externalId: lead.id,
    name: lead.name,
    ...(lead.email ? { email: lead.email } : {}),
    ...(phone ? { phone } : {}),
    ...(lead.message ? { message: lead.message } : {}),
    variables,
    metadata: { ...metadata, internalSource: lead.source ?? null },
  }
}

export async function syncLeadToBotyo(lead: Lead): Promise<void> {
  const config = await getBotyioConfig()

  if (!config.enabled) {
    logger.debug({ leadId: lead.id }, 'Botyio disabled — skip sync')
    return
  }

  if (!config.apiKey) {
    logger.warn({ leadId: lead.id }, 'Botyio API key not set — skip sync')
    return
  }

  const payload = buildPayload(lead)

  let res: Response
  try {
    res = await fetch(`${config.baseUrl.replace(/\/$/, '')}/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,
        'X-Idempotency-Key': lead.id,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    })
  } catch (err) {
    throw new BotyoRetryableError(0, `Botyio network error: ${(err as Error).message}`)
  }

  if (res.status === 202 || res.status === 200) {
    const json = (await res.json()) as { data: BotyoSuccessData }
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        botyoLeadId: json.data.id,
        botyoStatus: 'sent',
        botyoQueuedAt: new Date(),
      },
    })
    logger.info(
      { leadId: lead.id, botyoLeadId: json.data.id, willAttemptWhatsapp: json.data.whatsapp.willAttempt },
      'Lead synced to Botyio',
    )
    return
  }

  // Idempotência: lead já existe no Botyio com outro payload
  if (res.status === 409) {
    logger.warn({ leadId: lead.id }, 'Botyio 409 conflict — lead already exists with different payload')
    await prisma.lead.update({
      where: { id: lead.id },
      data: { botyoStatus: 'failed', botyoFailReason: '409: payload conflict' },
    })
    return
  }

  if (res.status === 429 || res.status >= 500) {
    throw new BotyoRetryableError(res.status, `Botyio ${res.status}`)
  }

  // 4xx permanente
  const errText = await res.text().catch(() => '')
  const failReason = `${res.status}: ${errText.slice(0, 480)}`
  await prisma.lead.update({
    where: { id: lead.id },
    data: { botyoStatus: 'failed', botyoFailReason: failReason },
  })
  logger.error({ leadId: lead.id, status: res.status }, 'Botyio permanent error — lead marked failed')
}

// ── Webhook event handler ───────────────────────────────────────────────────

export type BotyoEventName =
  | 'lead.registered'
  | 'whatsapp.queued'
  | 'whatsapp.sent'
  | 'whatsapp.delivered'
  | 'whatsapp.read'
  | 'whatsapp.failed'
  | 'lead.failed'

export interface BotyoWebhookEvent {
  event: BotyoEventName
  deliveryId: string
  occurredAt: string
  lead: {
    id: string
    externalId: string
    status: string
  }
  errorReason?: string
}

const EVENT_TO_STATUS: Record<BotyoEventName, string> = {
  'lead.registered': 'sent',
  'whatsapp.queued': 'sent',
  'whatsapp.sent': 'whatsapp_sent',
  'whatsapp.delivered': 'whatsapp_delivered',
  'whatsapp.read': 'whatsapp_read',
  'whatsapp.failed': 'failed',
  'lead.failed': 'failed',
}

export async function applyBotyoEvent(event: BotyoWebhookEvent): Promise<void> {
  const newStatus = EVENT_TO_STATUS[event.event]
  if (!newStatus) {
    logger.warn({ event: event.event }, 'Unknown Botyio event — ignored')
    return
  }

  const data: Record<string, unknown> = { botyoStatus: newStatus }

  if (event.event === 'whatsapp.sent') {
    data.botyoSentAt = new Date(event.occurredAt)
  }

  if (newStatus === 'failed') {
    data.botyoFailReason = event.errorReason ?? `Botyio ${event.event}`
  }

  await prisma.lead.update({
    where: { id: event.lead.externalId },
    data,
  })

  logger.info(
    { botyoLeadId: event.lead.id, externalId: event.lead.externalId, event: event.event, newStatus },
    'Botyio event applied',
  )
}
