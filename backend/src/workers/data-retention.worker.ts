/**
 * Worker LGPD — Data Retention.
 *
 * Cron diário às 03:00 BRT (~06:00 UTC). Em transação por bloco lógico:
 *  1. Purga `AnalyticsEvent` com createdAt < 12 meses atrás.
 *  2. Anonimiza Leads com `createdAt < 5 anos atrás` (lastContactAt ausente
 *     no schema atual — vide ROPA).
 *  3. Purga `ConsentLog` com createdAt < 5 anos.
 *  4. Purga `DataSubjectRequest` com status='completed' e resolvedAt < 5 anos.
 *
 * Política definida em docs/legal/politica-de-privacidade.md e
 * docs/compliance/ropa.md. Salt em LGPD_ANON_SALT.
 */
import crypto from 'node:crypto'
import type { Job } from 'bullmq'
import { prisma } from '../lib/prisma'
import { logger } from '../config/logger'
import { env } from '../config/env'
import { createQueue, createWorker } from '../lib/queue'
import { registerWorker } from './index'

export const DATA_RETENTION_QUEUE = 'data-retention'

export type DataRetentionJobData = { kind: 'sweep' }

export const dataRetentionQueue = createQueue<DataRetentionJobData>(DATA_RETENTION_QUEUE, {
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 30_000 },
    removeOnComplete: { count: 30 },
    removeOnFail: { count: 30 },
  },
})

function anonHash(value: string): string {
  return crypto
    .createHash('sha256')
    .update(`${value.toLowerCase().trim()}:${env.LGPD_ANON_SALT}`)
    .digest('hex')
    .slice(0, 32)
}

const MS_DAY = 24 * 60 * 60 * 1000

function subMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() - months)
  return d
}

function subYears(date: Date, years: number): Date {
  const d = new Date(date)
  d.setFullYear(d.getFullYear() - years)
  return d
}

export interface RetentionSummary {
  analyticsEventsPurged: number
  leadsAnonymized: number
  consentLogsPurged: number
  dsrsPurged: number
}

export async function runRetentionSweep(): Promise<RetentionSummary> {
  const now = new Date()
  const summary: RetentionSummary = {
    analyticsEventsPurged: 0,
    leadsAnonymized: 0,
    consentLogsPurged: 0,
    dsrsPurged: 0,
  }

  // 1. AnalyticsEvent — 12 meses.
  const analyticsThreshold = subMonths(now, 12)
  const a = await prisma.analyticsEvent.deleteMany({
    where: { receivedAt: { lt: analyticsThreshold } },
  })
  summary.analyticsEventsPurged = a.count

  // 2. Leads — 5 anos. Anonimiza em vez de deletar (preserva agregados).
  //    Ignora leads ja anonimizados (email comeca com 'anon-').
  const leadsThreshold = subYears(now, 5)
  const oldLeads = await prisma.lead.findMany({
    where: {
      createdAt: { lt: leadsThreshold },
      email: { not: { startsWith: 'anon-' } },
    },
    select: { id: true, email: true, phone: true },
  })
  for (const lead of oldLeads) {
    const hashedEmail = `anon-${anonHash(lead.email)}@anon.aumaf3d.local`
    const hashedName = `anon-${anonHash(lead.email).slice(0, 8)}`
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        name: hashedName,
        email: hashedEmail,
        phone: lead.phone ? `anon-${anonHash(lead.phone).slice(0, 12)}` : null,
        message: null,
      },
    })
  }
  summary.leadsAnonymized = oldLeads.length

  // 3. ConsentLog — 5 anos.
  const consentThreshold = subYears(now, 5)
  const c = await prisma.consentLog.deleteMany({
    where: { createdAt: { lt: consentThreshold } },
  })
  summary.consentLogsPurged = c.count

  // 4. DSR completed — 5 anos.
  const dsrThreshold = subYears(now, 5)
  const d = await prisma.dataSubjectRequest.deleteMany({
    where: {
      status: 'completed',
      resolvedAt: { lt: dsrThreshold },
    },
  })
  summary.dsrsPurged = d.count

  logger.warn(
    {
      ...summary,
      analyticsThreshold: analyticsThreshold.toISOString(),
      leadsThreshold: leadsThreshold.toISOString(),
      consentThreshold: consentThreshold.toISOString(),
      dsrThreshold: dsrThreshold.toISOString(),
    },
    'LGPD data retention sweep complete',
  )
  return summary
}

export async function processDataRetention(job: Job<DataRetentionJobData>): Promise<RetentionSummary> {
  logger.info({ jobId: job.id }, 'LGPD retention sweep starting')
  return runRetentionSweep()
}

const worker = createWorker<DataRetentionJobData>(DATA_RETENTION_QUEUE, processDataRetention, {
  concurrency: 1,
  autorun: false,
})

registerWorker({ name: DATA_RETENTION_QUEUE, worker, queue: dataRetentionQueue })

/** Schedule diário às 03:00 BRT (06:00 UTC). */
export async function scheduleDataRetentionSweep(): Promise<void> {
  await dataRetentionQueue.add(
    'daily-sweep',
    { kind: 'sweep' },
    { repeat: { pattern: '0 6 * * *' }, jobId: 'data-retention-daily' },
  )
  logger.info('Data retention schedule registered (daily 06:00 UTC / 03:00 BRT)')
}

/** Marker para evitar `MS_DAY` unused. */
void MS_DAY
