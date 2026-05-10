import type { Job } from 'bullmq'
import { prisma } from '../lib/prisma'
import { logger } from '../config/logger'
import { env } from '../config/env'
import { createQueue, createWorker } from '../lib/queue'
import { sendEmail } from '../services/email.service'
import { registerWorker } from './index'

export interface LeadNotificationJobData {
  leadId: string
}

export const LEAD_NOTIFICATION_QUEUE = 'lead-notification'

export const leadNotificationQueue = createQueue<LeadNotificationJobData>(LEAD_NOTIFICATION_QUEUE)

function formatLeadEmailText(lead: {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  source: string | null
  createdAt: Date
}): string {
  return [
    `Você recebeu um novo lead pelo site AUMAF 3D.`,
    ``,
    `Nome:     ${lead.name}`,
    `E-mail:   ${lead.email}`,
    `Telefone: ${lead.phone ?? '(não informado)'}`,
    `Origem:   ${lead.source ?? '(não informada)'}`,
    `Quando:   ${lead.createdAt.toISOString()}`,
    ``,
    `Mensagem:`,
    lead.message ?? '(sem mensagem)',
    ``,
    `--`,
    `ID do lead: ${lead.id}`,
    `Acesse o backoffice para responder.`,
  ].join('\n')
}

export async function processLeadNotification(job: Job<LeadNotificationJobData>): Promise<void> {
  const { leadId } = job.data

  if (!env.ADMIN_NOTIFICATION_EMAIL) {
    logger.warn(
      { jobId: job.id, leadId },
      'ADMIN_NOTIFICATION_EMAIL not configured — skipping notification (no retry)',
    )
    return
  }

  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) {
    logger.warn({ jobId: job.id, leadId }, 'Lead not found — skipping notification')
    return
  }

  await sendEmail({
    to: env.ADMIN_NOTIFICATION_EMAIL,
    subject: `[AUMAF 3D] Novo lead: ${lead.name}`,
    text: formatLeadEmailText(lead),
    replyTo: lead.email,
  })

  logger.info({ jobId: job.id, leadId }, 'Lead notification dispatched')
}

const worker = createWorker<LeadNotificationJobData>(LEAD_NOTIFICATION_QUEUE, processLeadNotification, {
  concurrency: 3,
  autorun: false,
})

registerWorker({
  name: LEAD_NOTIFICATION_QUEUE,
  worker,
  queue: leadNotificationQueue,
})

export async function enqueueLeadNotification(leadId: string): Promise<void> {
  await leadNotificationQueue.add('notify', { leadId }, { jobId: `lead-${leadId}` })
}
