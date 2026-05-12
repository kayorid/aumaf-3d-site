/**
 * Data Subject Requests (DSR) — art. 18 LGPD.
 *
 * Fluxo:
 *  1. Titular submete POST /v1/dsr/request -> status='pending_verification'
 *     + verificationToken (32 bytes hex, TTL 24h) + e-mail magic link.
 *  2. Titular clica no link -> GET /v1/dsr/verify?token=... -> status='open'.
 *  3. Admin atende em /admin/lgpd/solicitacoes (export PII / anonimizacao / nota).
 *
 * Anonimizacao: substitui name/email/phone do Lead por hash determinístico
 * SHA-256(value + LGPD_ANON_SALT). Preserva linhas para nao quebrar agregados
 * historicos e analytics.
 */
import crypto from 'node:crypto'
import { prisma } from '../lib/prisma'
import { logger } from '../config/logger'
import { env } from '../config/env'
import { sendEmail } from './email.service'
import type {
  CreateDsrRequestInput,
  DsrRequestDto,
  DsrRequestType,
  DsrStatus,
  UpdateDsrRequestInput,
} from '@aumaf/shared'

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000 // 24h

export interface DsrContext {
  ipHash: string | null
  userAgent: string | null
}

interface DbRow {
  id: string
  email: string
  fullName: string | null
  requestType: string
  description: string | null
  status: string
  verifiedAt: Date | null
  resolvedAt: Date | null
  resolutionNote: string | null
  createdAt: Date
  updatedAt: Date
}

function toDto(row: DbRow): DsrRequestDto {
  return {
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    requestType: row.requestType as DsrRequestType,
    description: row.description,
    status: row.status as DsrStatus,
    verifiedAt: row.verifiedAt?.toISOString() ?? null,
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    resolutionNote: row.resolutionNote,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

function anonHash(value: string): string {
  return crypto
    .createHash('sha256')
    .update(`${value.toLowerCase().trim()}:${env.LGPD_ANON_SALT}`)
    .digest('hex')
    .slice(0, 32)
}

const REQUEST_TYPE_LABELS: Record<DsrRequestType, string> = {
  access: 'Confirmação e acesso aos dados',
  correction: 'Correção de dados',
  anonymization: 'Anonimização, bloqueio ou eliminação',
  deletion: 'Eliminação de dados tratados com consentimento',
  portability: 'Portabilidade de dados',
  revocation: 'Revogação de consentimento',
  info_share: 'Informação sobre compartilhamento',
  info_no_consent: 'Informação sobre não fornecer consentimento',
  review_automated: 'Revisão de decisões automatizadas',
}

export async function createDsrRequest(
  input: CreateDsrRequestInput,
  ctx: DsrContext,
): Promise<DsrRequestDto> {
  const token = generateToken()
  const row = await prisma.dataSubjectRequest.create({
    data: {
      email: input.email.toLowerCase().trim(),
      fullName: input.fullName ?? null,
      requestType: input.requestType,
      description: input.description ?? null,
      status: 'pending_verification',
      verificationToken: token,
      ipHash: ctx.ipHash,
      userAgent: ctx.userAgent,
    },
  })

  try {
    const verifyUrl = `${env.FRONTEND_PUBLIC_URL.replace(/\/$/, '')}/lgpd/verificar?token=${encodeURIComponent(token)}`
    const label = REQUEST_TYPE_LABELS[input.requestType] ?? input.requestType
    await sendEmail({
      to: row.email,
      subject: 'Verifique sua solicitação de direitos LGPD — AUMAF 3D',
      text: [
        `Olá${row.fullName ? ', ' + row.fullName : ''}.`,
        '',
        `Recebemos sua solicitação LGPD do tipo: ${label}.`,
        '',
        `Para confirmar que é você, clique no link abaixo (válido por 24 horas):`,
        verifyUrl,
        '',
        'Após a verificação, sua solicitação entra em nossa fila de atendimento.',
        'Atendemos em até 15 dias úteis, conforme a Lei nº 13.709/2018.',
        '',
        'Se você não fez essa solicitação, ignore este e-mail.',
        '',
        '— AUMAF 3D — Encarregado de Dados: Luiz Felipe Lampa Risse (felipe@aumaf3d.com.br)',
      ].join('\n'),
    })
  } catch (err) {
    logger.error({ err, dsrId: row.id }, 'DSR verification e-mail failed — request persisted anyway')
  }

  logger.info({ dsrId: row.id, requestType: input.requestType }, 'DSR request created')
  return toDto(row)
}

export async function verifyDsrToken(token: string): Promise<DsrRequestDto | null> {
  const row = await prisma.dataSubjectRequest.findUnique({ where: { verificationToken: token } })
  if (!row) return null
  const ageMs = Date.now() - row.createdAt.getTime()
  if (ageMs > VERIFICATION_TTL_MS) return null
  if (row.status !== 'pending_verification') {
    return toDto(row)
  }
  const updated = await prisma.dataSubjectRequest.update({
    where: { id: row.id },
    data: { status: 'open', verifiedAt: new Date(), verificationToken: null },
  })
  logger.info({ dsrId: updated.id }, 'DSR request verified')
  return toDto(updated)
}

export interface ListDsrParams {
  status?: DsrStatus
  page?: number
  pageSize?: number
}

export async function listDsrRequests(params: ListDsrParams = {}) {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 25))
  const where = params.status ? { status: params.status } : {}
  const [total, rows] = await Promise.all([
    prisma.dataSubjectRequest.count({ where }),
    prisma.dataSubjectRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])
  return {
    data: rows.map(toDto),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

export async function getDsrRequest(id: string): Promise<DsrRequestDto | null> {
  const row = await prisma.dataSubjectRequest.findUnique({ where: { id } })
  return row ? toDto(row) : null
}

export async function updateDsrRequest(
  id: string,
  input: UpdateDsrRequestInput,
): Promise<DsrRequestDto | null> {
  const data: Record<string, unknown> = {}
  if (input.status !== undefined) {
    data.status = input.status
    if (input.status === 'completed' || input.status === 'rejected') {
      data.resolvedAt = new Date()
    }
  }
  if (input.resolutionNote !== undefined) data.resolutionNote = input.resolutionNote
  const row = await prisma.dataSubjectRequest.update({ where: { id }, data })
  logger.info({ dsrId: id, status: row.status }, 'DSR request updated')
  return toDto(row)
}

export async function exportPiiByEmail(email: string) {
  const normalized = email.toLowerCase().trim()
  const [leads, consents, dsrs] = await Promise.all([
    prisma.lead.findMany({
      where: { email: normalized },
      include: { notes: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.consentLog.findMany({
      where: { userIdHash: anonHash(normalized) },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.dataSubjectRequest.findMany({
      where: { email: normalized },
      orderBy: { createdAt: 'desc' },
    }),
  ])
  return {
    exportedAt: new Date().toISOString(),
    subject: { email: normalized },
    leads: leads.map((l) => ({
      id: l.id,
      name: l.name,
      email: l.email,
      phone: l.phone,
      message: l.message,
      source: l.source,
      createdAt: l.createdAt.toISOString(),
      utm: {
        source: l.utmSource,
        medium: l.utmMedium,
        campaign: l.utmCampaign,
        term: l.utmTerm,
        content: l.utmContent,
      },
      referrer: l.referrer,
      landingPage: l.landingPage,
      marketingConsent: l.marketingConsent,
      notes: l.notes.map((n) => ({
        id: n.id,
        body: n.body,
        createdAt: n.createdAt.toISOString(),
        authorId: n.authorId,
      })),
    })),
    consentLogs: consents.map((c) => ({
      id: c.id,
      categories: c.categories,
      policyVersion: c.policyVersion,
      source: c.source,
      createdAt: c.createdAt.toISOString(),
    })),
    dataSubjectRequests: dsrs.map(toDto),
  }
}

export async function anonymizeByEmail(email: string): Promise<{ leadsAnonymized: number }> {
  const normalized = email.toLowerCase().trim()
  const hashedEmail = `anon-${anonHash(normalized)}@anon.aumaf3d.local`
  const hashedName = `anon-${anonHash(normalized).slice(0, 8)}`

  const leads = await prisma.lead.findMany({ where: { email: normalized }, select: { id: true, phone: true } })

  for (const lead of leads) {
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

  logger.warn(
    { email: normalized, leadsAnonymized: leads.length },
    'PII anonymized by DSR request',
  )
  return { leadsAnonymized: leads.length }
}
