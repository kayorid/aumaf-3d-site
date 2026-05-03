import { prisma } from '../lib/prisma'
import { logger } from '../config/logger'
import { maskEmail, maskPhone } from '../lib/mask'
import type { CreateLeadInput, LeadDto, LeadMaskedDto } from '@aumaf/shared'

function toDto(lead: Awaited<ReturnType<typeof prisma.lead.findUnique>>): LeadDto {
  if (!lead) throw new Error('lead null')
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    message: lead.message,
    source: lead.source,
    createdAt: lead.createdAt.toISOString(),
  }
}

export function maskLead(lead: { id: string; name: string; email: string; phone: string | null; source: string | null; createdAt: Date }): LeadMaskedDto {
  const contact = lead.phone ? maskPhone(lead.phone) : maskEmail(lead.email)
  return {
    id: lead.id,
    name: lead.name,
    contactMasked: contact,
    source: lead.source,
    createdAt: lead.createdAt.toISOString(),
  }
}

export async function createLead(input: CreateLeadInput): Promise<LeadDto> {
  const lead = await prisma.lead.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      message: input.message ?? null,
      source: input.source ?? null,
    },
  })
  logger.info({ leadId: lead.id, source: lead.source }, 'Lead created')
  return toDto(lead)
}

export async function listLeads(page: number, pageSize: number) {
  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.count(),
  ])
  return {
    data: items.map(toDto),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  }
}

export async function countLeadsLast30Days(): Promise<number> {
  const since = new Date()
  since.setDate(since.getDate() - 30)
  return prisma.lead.count({ where: { createdAt: { gte: since } } })
}

export async function listRecentLeadsMasked(take = 5): Promise<LeadMaskedDto[]> {
  const items = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take,
  })
  return items.map(maskLead)
}
