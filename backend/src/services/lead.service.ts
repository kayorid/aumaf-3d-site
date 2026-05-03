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

export interface LeadFilters {
  from?: Date
  to?: Date
  source?: string
  q?: string
}

function buildLeadWhere(filters: LeadFilters) {
  return {
    ...(filters.from || filters.to
      ? {
          createdAt: {
            ...(filters.from ? { gte: filters.from } : {}),
            ...(filters.to ? { lte: filters.to } : {}),
          },
        }
      : {}),
    ...(filters.source ? { source: filters.source } : {}),
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: 'insensitive' as const } },
            { email: { contains: filters.q, mode: 'insensitive' as const } },
            { message: { contains: filters.q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }
}

export async function listLeads(page: number, pageSize: number, filters: LeadFilters = {}) {
  const where = buildLeadWhere(filters)
  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.count({ where }),
  ])
  return {
    data: items.map(toDto),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  }
}

export async function listAllLeadsForExport(filters: LeadFilters = {}): Promise<LeadDto[]> {
  const where = buildLeadWhere(filters)
  const items = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 10000, // limite de segurança
  })
  return items.map(toDto)
}

export async function listLeadSources(): Promise<string[]> {
  const rows = await prisma.lead.findMany({
    where: { source: { not: null } },
    select: { source: true },
    distinct: ['source'],
    orderBy: { source: 'asc' },
  })
  return rows.map((r) => r.source!).filter(Boolean)
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
