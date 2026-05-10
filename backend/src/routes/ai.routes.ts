import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { GeneratePostInputSchema } from '@template/shared'
import { requireAuth } from '../middlewares/require-auth'
import { generatePost } from '../services/ai/ai.service'

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', code: 'AI_RATE_LIMIT', message: 'Muitas gerações — aguarde um minuto' },
})

export const aiRoutes = Router()

aiRoutes.use(requireAuth)

aiRoutes.post('/generate-post', aiLimiter, async (req, res, next) => {
  try {
    const input = GeneratePostInputSchema.parse(req.body)
    const result = await generatePost(input)
    res.json({ status: 'ok', data: result })
  } catch (err) {
    next(err)
  }
})
