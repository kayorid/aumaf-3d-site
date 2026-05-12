import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { CreateConsentLogSchema } from '@aumaf/shared'
import { recordConsent } from '../services/consent.service'
import { hashIp, extractIp } from '../lib/ip-hash'

const consentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', code: 'TOO_MANY_REQUESTS', message: 'Muitas tentativas — aguarde um momento' },
})

export const consentRoutes = Router()

consentRoutes.post('/', consentLimiter, async (req, res, next) => {
  try {
    const input = CreateConsentLogSchema.parse(req.body)
    const rawIp = extractIp(req as unknown as Parameters<typeof extractIp>[0])
    const result = await recordConsent(input, {
      ipHash: rawIp ? hashIp(rawIp) : 'unknown',
      userAgent: (req.headers['user-agent'] as string | undefined) ?? null,
    })
    res.status(201).json({ status: 'ok', data: result })
  } catch (err) {
    next(err)
  }
})
