import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { UpdateProfileSchema, ChangePasswordSchema } from '@aumaf/shared'
import { requireAuth } from '../middlewares/require-auth'
import { httpErrors } from '../lib/http-error'
import * as authService from '../services/auth.service'

const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', code: 'TOO_MANY_REQUESTS', message: 'Muitas tentativas — aguarde alguns minutos' },
})

export const meRoutes = Router()

meRoutes.get('/', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) throw httpErrors.unauthorized()
    const profile = await authService.getProfile(req.user.id)
    res.json({ status: 'ok', data: profile })
  } catch (err) {
    next(err)
  }
})

meRoutes.patch('/', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) throw httpErrors.unauthorized()
    const input = UpdateProfileSchema.parse(req.body)
    const profile = await authService.updateProfile(req.user.id, input)
    res.json({ status: 'ok', data: profile })
  } catch (err) {
    next(err)
  }
})

meRoutes.post('/password', requireAuth, passwordLimiter, async (req, res, next) => {
  try {
    if (!req.user) throw httpErrors.unauthorized()
    const input = ChangePasswordSchema.parse(req.body)
    await authService.changePassword(req.user.id, input.currentPassword, input.newPassword)
    res.json({ status: 'ok' })
  } catch (err) {
    next(err)
  }
})
