import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
  CreateLeadSchema,
  LeadFilterQuerySchema,
  CreateLeadNoteSchema,
  UpdateLeadNoteSchema,
  BulkDeleteLeadsSchema,
} from '@template/shared'
import { requireAuth, requireRole } from '../middlewares/require-auth'
import { httpErrors } from '../lib/http-error'
import * as leadService from '../services/lead.service'

const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', code: 'TOO_MANY_REQUESTS', message: 'Muitas tentativas — aguarde um momento' },
})

export const leadRoutes = Router()

leadRoutes.post('/', publicLimiter, async (req, res, next) => {
  try {
    const input = CreateLeadSchema.parse(req.body)
    const lead = await leadService.createLead(input)
    res.status(201).json({ status: 'ok', data: lead })
  } catch (err) {
    next(err)
  }
})

leadRoutes.get('/', requireAuth, requireRole('ADMIN', 'MARKETING'), async (req, res, next) => {
  try {
    const query = LeadFilterQuerySchema.parse(req.query)
    const result = await leadService.listLeads(query.page, query.pageSize, {
      from: query.from,
      to: query.to,
      source: query.source,
      q: query.q,
    })
    res.json({ status: 'ok', ...result })
  } catch (err) {
    next(err)
  }
})

leadRoutes.get('/sources', requireAuth, requireRole('ADMIN', 'MARKETING'), async (_req, res, next) => {
  try {
    const sources = await leadService.listLeadSources()
    res.json({ status: 'ok', data: sources })
  } catch (err) {
    next(err)
  }
})

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

leadRoutes.get('/export.csv', requireAuth, requireRole('ADMIN', 'MARKETING'), async (req, res, next) => {
  try {
    // pageSize/page ignorados na export, mas valida tipos dos filtros
    const query = LeadFilterQuerySchema.parse(req.query)
    const items = await leadService.listAllLeadsForExport({
      from: query.from,
      to: query.to,
      source: query.source,
      q: query.q,
    })

    const header = ['Nome', 'Email', 'Telefone', 'Mensagem', 'Fonte', 'Recebido em']
    const rows = items.map((l) =>
      [
        l.name,
        l.email,
        l.phone ?? '',
        (l.message ?? '').replace(/\r?\n/g, ' '),
        l.source ?? '',
        new Date(l.createdAt).toLocaleString('pt-BR'),
      ].map(escapeCsv).join(','),
    )
    const csv = '﻿' + [header.map(escapeCsv).join(','), ...rows].join('\r\n')

    const filename = `aumaf-leads-${new Date().toISOString().slice(0, 10)}.csv`
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(csv)
  } catch (err) {
    next(err)
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Detalhe + soft delete + notas
// ─────────────────────────────────────────────────────────────────────────────

leadRoutes.get('/:id', requireAuth, requireRole('ADMIN', 'MARKETING'), async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(req.params.id)
    res.json({ status: 'ok', data: lead })
  } catch (err) {
    next(err)
  }
})

leadRoutes.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    if (!req.user) throw httpErrors.unauthorized()
    await leadService.softDeleteLead(req.params.id, req.user.id)
    res.json({ status: 'ok' })
  } catch (err) {
    next(err)
  }
})

leadRoutes.post('/bulk-delete', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    if (!req.user) throw httpErrors.unauthorized()
    const input = BulkDeleteLeadsSchema.parse(req.body)
    const result = await leadService.softDeleteLeadsBulk(input.ids, req.user.id)
    res.json({ status: 'ok', data: result })
  } catch (err) {
    next(err)
  }
})

leadRoutes.post('/:id/notes', requireAuth, requireRole('ADMIN', 'MARKETING'), async (req, res, next) => {
  try {
    if (!req.user) throw httpErrors.unauthorized()
    const input = CreateLeadNoteSchema.parse(req.body)
    const note = await leadService.addLeadNote(req.params.id, req.user.id, input.body)
    res.status(201).json({ status: 'ok', data: note })
  } catch (err) {
    next(err)
  }
})

leadRoutes.patch('/:id/notes/:noteId', requireAuth, requireRole('ADMIN', 'MARKETING'), async (req, res, next) => {
  try {
    if (!req.user) throw httpErrors.unauthorized()
    const input = UpdateLeadNoteSchema.parse(req.body)
    const note = await leadService.updateLeadNote(
      req.params.noteId,
      req.user.id,
      req.user.role === 'ADMIN',
      input.body,
    )
    res.json({ status: 'ok', data: note })
  } catch (err) {
    next(err)
  }
})

leadRoutes.delete('/:id/notes/:noteId', requireAuth, requireRole('ADMIN', 'MARKETING'), async (req, res, next) => {
  try {
    if (!req.user) throw httpErrors.unauthorized()
    await leadService.deleteLeadNote(req.params.noteId, req.user.id, req.user.role === 'ADMIN')
    res.json({ status: 'ok' })
  } catch (err) {
    next(err)
  }
})
