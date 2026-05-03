import type { Job } from 'bullmq'
import { prisma } from '../lib/prisma'
import { logger } from '../config/logger'
import { createQueue, createWorker } from '../lib/queue'
import { syncLeadToBotyo, BotyoRetryableError } from '../services/botyio.service'
import { registerWorker } from './index'

export interface BotyioLeadSyncJobData {
  leadId: string
}

export const BOTYIO_LEAD_SYNC_QUEUE = 'botyio-lead-sync'

export const botyioLeadSyncQueue = createQueue<BotyioLeadSyncJobData>(BOTYIO_LEAD_SYNC_QUEUE, {
  defaultJobOptions: {
    attempts: 4,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  },
})

export async function processBotyioLeadSync(job: Job<BotyioLeadSyncJobData>): Promise<void> {
  const { leadId } = job.data

  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) {
    logger.warn({ jobId: job.id, leadId }, 'Lead not found — skipping Botyio sync')
    return
  }

  if (lead.botyoLeadId) {
    logger.info({ jobId: job.id, leadId, botyoLeadId: lead.botyoLeadId }, 'Lead already synced — skip')
    return
  }

  try {
    await syncLeadToBotyo(lead)
  } catch (err) {
    if (err instanceof BotyoRetryableError) {
      // BullMQ vai retentar automaticamente
      throw err
    }
    logger.error({ jobId: job.id, leadId, err }, 'Botyio sync unexpected error')
    throw err
  }
}

const worker = createWorker<BotyioLeadSyncJobData>(BOTYIO_LEAD_SYNC_QUEUE, processBotyioLeadSync, {
  concurrency: 3,
  autorun: false,
})

registerWorker({
  name: BOTYIO_LEAD_SYNC_QUEUE,
  worker,
  queue: botyioLeadSyncQueue,
})

export async function enqueueBotyioLeadSync(leadId: string): Promise<void> {
  await botyioLeadSyncQueue.add('sync', { leadId }, { jobId: `botyio-sync-${leadId}` })
}
