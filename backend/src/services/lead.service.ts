import { prisma } from '../lib/prisma'
import { logger } from '../config/logger'
import { httpErrors } from '../lib/http-error'
import { maskEmail, maskPhone } from '../lib/mask'
import { enqueueLeadNotification } from '../workers/lead-notification.worker'
import { enqueueBotyioLeadSync } from '../workers/botyio-lead-sync.worker'
import type {
  CreateLeadInput,
  LeadDto,
  LeadMaskedDto,
  LeadDetailDto,
  LeadNoteDto,
} from '@template/shared'

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
    utmSource: lead.utmSource,
    utmMedium: lead.utmMedium,
    utmCampaign: lead.utmCampaign,
    utmTerm: lead.utmTerm,
    utmContent: lead.utmContent,
    referrer: lead.referrer,
    landingPage: lead.landingPage,
    botyoStatus: lead.botyoStatus,
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
      utmSource: input.utmSource ?? null,
      utmMedium: input.utmMedium ?? null,
      utmCampaign: input.utmCampaign ?? null,
      utmTerm: input.utmTerm ?? null,
      utmContent: input.utmContent ?? null,
      referrer: input.referrer ?? null,
      landingPage: input.landingPage ?? null,
    },
  })
  logger.info({ leadId: lead.id, source: lead.source }, 'Lead created')

  try {
    await enqueueLeadNotification(lead.id)
  } catch (err) {
    logger.error({ err, leadId: lead.id }, 'Failed to enqueue lead notification — lead persisted anyway')
  }

  try {
    await enqueueBotyioLeadSync(lead.id)
  } catch (err) {
    logger.error({ err, leadId: lead.id }, 'Failed to enqueue Botyio sync — lead persisted anyway')
  }

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
    deletedAt: null,
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
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take,
  })
  return items.map(maskLead)
}

function noteToDto(note: {
  id: string
  leadId: string
  authorId: string
  body: string
  createdAt: Date
  updatedAt: Date
  author?: { name: string } | null
}): LeadNoteDto {
  return {
    id: note.id,
    leadId: note.leadId,
    authorId: note.authorId,
    authorName: note.author?.name ?? null,
    body: note.body,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  }
}

export async function getLeadById(id: string): Promise<LeadDetailDto> {
  const lead = await prisma.lead.findFirst({
    where: { id, deletedAt: null },
    include: {
      notes: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!lead) throw httpErrors.notFound('Lead não encontrado')
  return {
    ...toDto(lead),
    notes: lead.notes.map(noteToDto),
  }
}

export async function softDeleteLead(id: string, userId: string): Promise<void> {
  const result = await prisma.lead.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date(), deletedBy: userId },
  })
  if (result.count === 0) throw httpErrors.notFound('Lead não encontrado')
  logger.info({ leadId: id, userId }, 'Lead soft-deleted')
}

export async function softDeleteLeadsBulk(
  ids: string[],
  userId: string,
): Promise<{ deleted: number }> {
  if (ids.length === 0) return { deleted: 0 }
  const unique = Array.from(new Set(ids))
  const result = await prisma.lead.updateMany({
    where: { id: { in: unique }, deletedAt: null },
    data: { deletedAt: new Date(), deletedBy: userId },
  })
  logger.info({ requested: unique.length, deleted: result.count, userId }, 'Leads bulk soft-deleted')
  return { deleted: result.count }
}

export async function addLeadNote(leadId: string, authorId: string, body: string): Promise<LeadNoteDto> {
  const lead = await prisma.lead.findFirst({ where: { id: leadId, deletedAt: null }, select: { id: true } })
  if (!lead) throw httpErrors.notFound('Lead não encontrado')
  const note = await prisma.leadNote.create({
    data: { leadId, authorId, body },
    include: { author: { select: { name: true } } },
  })
  logger.info({ noteId: note.id, leadId, authorId }, 'Lead note created')
  return noteToDto(note)
}

export async function updateLeadNote(
  noteId: string,
  userId: string,
  isAdmin: boolean,
  body: string,
): Promise<LeadNoteDto> {
  const note = await prisma.leadNote.findUnique({ where: { id: noteId } })
  if (!note) throw httpErrors.notFound('Anotação não encontrada')
  if (!isAdmin && note.authorId !== userId) {
    throw httpErrors.forbidden('Apenas o autor ou um administrador pode editar esta anotação')
  }
  const updated = await prisma.leadNote.update({
    where: { id: noteId },
    data: { body },
    include: { author: { select: { name: true } } },
  })
  return noteToDto(updated)
}

export async function deleteLeadNote(noteId: string, userId: string, isAdmin: boolean): Promise<void> {
  const note = await prisma.leadNote.findUnique({ where: { id: noteId } })
  if (!note) throw httpErrors.notFound('Anotação não encontrada')
  if (!isAdmin && note.authorId !== userId) {
    throw httpErrors.forbidden('Apenas o autor ou um administrador pode excluir esta anotação')
  }
  await prisma.leadNote.delete({ where: { id: noteId } })
  logger.info({ noteId, userId }, 'Lead note deleted')
}
