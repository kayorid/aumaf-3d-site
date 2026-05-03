import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { CreateLeadSchema } from '@aumaf/shared'
import { requireAuth, requireRole } from '../middlewares/require-auth'
import * as leadService from '../services/lead.service'

const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', code: 'TOO_MANY_REQUESTS', message: 'Muitas tentativas — aguarde um momento' },
})

const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
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
    const { page, pageSize } = ListQuerySchema.parse(req.query)
    const result = await leadService.listLeads(page, pageSize)
    res.json({ status: 'ok', ...result })
  } catch (err) {
    next(err)
  }
})
