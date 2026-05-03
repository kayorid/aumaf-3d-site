import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { loginHandler, logoutHandler, meHandler } from '../controllers/auth.controller'
import { requireAuth } from '../middlewares/require-auth'

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', code: 'TOO_MANY_REQUESTS', message: 'Muitas tentativas — aguarde alguns minutos' },
})

export const authRoutes = Router()

authRoutes.post('/login', loginLimiter, loginHandler)
authRoutes.post('/logout', logoutHandler)
authRoutes.get('/me', requireAuth, meHandler)
