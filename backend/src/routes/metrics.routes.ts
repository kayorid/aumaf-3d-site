import { Router } from 'express'
import { requireAuth } from '../middlewares/require-auth'
import { getDashboard } from '../services/metrics.service'

export const metricsRoutes = Router()

metricsRoutes.use(requireAuth)

metricsRoutes.get('/dashboard', async (_req, res, next) => {
  try {
    const metrics = await getDashboard()
    res.json({ status: 'ok', data: metrics })
  } catch (err) {
    next(err)
  }
})
