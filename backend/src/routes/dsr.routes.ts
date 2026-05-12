import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { CreateDsrRequestSchema, UpdateDsrRequestSchema } from '@aumaf/shared'
import {
  anonymizeByEmail,
  createDsrRequest,
  exportPiiByEmail,
  getDsrRequest,
  listDsrRequests,
  updateDsrRequest,
  verifyDsrToken,
} from '../services/dsr.service'
import { hashIp, extractIp } from '../lib/ip-hash'
import { requireAuth, requirePermission } from '../middlewares/require-auth'
import { env } from '../config/env'
import { httpErrors } from '../lib/http-error'
import type { DsrStatus } from '@aumaf/shared'

const publicLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', code: 'TOO_MANY_REQUESTS', message: 'Muitas solicitações — aguarde uma hora' },
})

const verifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
})

export const dsrRoutes = Router()

/**
 * POST /api/v1/dsr/request — público.
 * LGPD-DEFER: captcha real (Turnstile) será adicionado em sprint pós-deploy.
 * Por ora: rate-limit 5/h por IP + opcional LGPD_FORM_SECRET via header.
 */
dsrRoutes.post('/request', publicLimiter, async (req, res, next) => {
  try {
    if (env.LGPD_FORM_SECRET) {
      const supplied = req.header('x-lgpd-form-secret')
      if (supplied !== env.LGPD_FORM_SECRET) {
        throw httpErrors.forbidden('Verificação anti-bot falhou')
      }
    }
    const input = CreateDsrRequestSchema.parse(req.body)
    const rawIp = extractIp(req as unknown as Parameters<typeof extractIp>[0])
    const dto = await createDsrRequest(input, {
      ipHash: rawIp ? hashIp(rawIp) : null,
      userAgent: (req.headers['user-agent'] as string | undefined) ?? null,
    })
    res.status(201).json({ status: 'ok', data: { id: dto.id, status: dto.status } })
  } catch (err) {
    next(err)
  }
})

dsrRoutes.get('/verify', verifyLimiter, async (req, res, next) => {
  try {
    const token = String(req.query.token ?? '').trim()
    if (!token) throw httpErrors.badRequest('TOKEN_MISSING', 'Token ausente')
    const dto = await verifyDsrToken(token)
    if (!dto) throw httpErrors.badRequest('TOKEN_INVALID', 'Token inválido ou expirado')
    res.json({ status: 'ok', data: { id: dto.id, status: dto.status, verifiedAt: dto.verifiedAt } })
  } catch (err) {
    next(err)
  }
})

dsrRoutes.get('/requests', requireAuth, requirePermission('lgpd', 'view'), async (req, res, next) => {
  try {
    const status = req.query.status ? (String(req.query.status) as DsrStatus) : undefined
    const page = req.query.page ? Number(req.query.page) : 1
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 25
    const result = await listDsrRequests({ status, page, pageSize })
    res.json({ status: 'ok', ...result })
  } catch (err) {
    next(err)
  }
})

dsrRoutes.get('/requests/:id', requireAuth, requirePermission('lgpd', 'view'), async (req, res, next) => {
  try {
    const dto = await getDsrRequest(req.params.id!)
    if (!dto) throw httpErrors.notFound('Solicitação não encontrada')
    res.json({ status: 'ok', data: dto })
  } catch (err) {
    next(err)
  }
})

dsrRoutes.patch('/requests/:id', requireAuth, requirePermission('lgpd', 'edit'), async (req, res, next) => {
  try {
    const input = UpdateDsrRequestSchema.parse(req.body)
    const dto = await updateDsrRequest(req.params.id!, input)
    if (!dto) throw httpErrors.notFound('Solicitação não encontrada')
    res.json({ status: 'ok', data: dto })
  } catch (err) {
    next(err)
  }
})

dsrRoutes.get(
  '/requests/:id/export',
  requireAuth,
  requirePermission('lgpd', 'edit'),
  async (req, res, next) => {
    try {
      const dto = await getDsrRequest(req.params.id!)
      if (!dto) throw httpErrors.notFound('Solicitação não encontrada')
      const data = await exportPiiByEmail(dto.email)
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="dsr-${dto.id}.json"`)
      res.send(JSON.stringify(data, null, 2))
    } catch (err) {
      next(err)
    }
  },
)

dsrRoutes.post(
  '/requests/:id/anonymize',
  requireAuth,
  requirePermission('lgpd', 'edit'),
  async (req, res, next) => {
    try {
      const dto = await getDsrRequest(req.params.id!)
      if (!dto) throw httpErrors.notFound('Solicitação não encontrada')
      const result = await anonymizeByEmail(dto.email)
      await updateDsrRequest(dto.id, {
        status: 'completed',
        resolutionNote: `Anonimização executada — ${result.leadsAnonymized} lead(s) afetado(s).`,
      })
      res.json({ status: 'ok', data: result })
    } catch (err) {
      next(err)
    }
  },
)
