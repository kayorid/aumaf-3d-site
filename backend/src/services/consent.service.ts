import { prisma } from '../lib/prisma'
import { logger } from '../config/logger'
import type { CreateConsentLogInput } from '@aumaf/shared'

export interface RecordConsentContext {
  ipHash: string
  userAgent: string | null
}

export async function recordConsent(
  input: CreateConsentLogInput,
  ctx: RecordConsentContext,
): Promise<{ id: string }> {
  const row = await prisma.consentLog.create({
    data: {
      ipHash: ctx.ipHash,
      userAgent: ctx.userAgent,
      userIdHash: input.userIdHash ?? null,
      categories: input.categories,
      policyVersion: input.policyVersion,
      source: input.source,
    },
    select: { id: true },
  })
  logger.info(
    { consentId: row.id, source: input.source, policyVersion: input.policyVersion },
    'Consent recorded',
  )
  return row
}
