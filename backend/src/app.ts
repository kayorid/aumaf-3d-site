import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import hpp from 'hpp'
import rateLimit from 'express-rate-limit'
import { pinoHttp } from 'pino-http'
import { env } from './config/env'
import { logger } from './config/logger'
import { errorHandler } from './middlewares/error-handler'
import { authRoutes } from './routes/auth.routes'
import { postRoutes } from './routes/post.routes'
import { categoryRoutes } from './routes/category.routes'
import { uploadRoutes } from './routes/upload.routes'
import { leadRoutes } from './routes/lead.routes'
import { aiRoutes } from './routes/ai.routes'
import { metricsRoutes } from './routes/metrics.routes'
import { prisma } from './lib/prisma'

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
})

export function createApp() {
  const app = express()

  app.set('trust proxy', 1)

  app.use(helmet())
  app.use(
    cors({
      origin: [env.FRONTEND_ADMIN_URL, env.FRONTEND_PUBLIC_URL],
      credentials: true,
    }),
  )
  app.use(hpp())
  app.use(globalLimiter)
  app.use(cookieParser())
  app.use(express.json({ limit: '5mb' }))
  app.use(pinoHttp({ logger }))

  app.get('/api/health', async (_req, res) => {
    let dbOk = false
    try {
      await prisma.$queryRaw`SELECT 1`
      dbOk = true
    } catch (err) {
      logger.error({ err }, 'Healthcheck DB failed')
    }
    res.json({
      status: dbOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: { database: dbOk },
    })
  })

  app.use('/api/v1/auth', authRoutes)
  app.use('/api/v1/posts', postRoutes)
  app.use('/api/v1/categories', categoryRoutes)
  app.use('/api/v1/uploads', uploadRoutes)
  app.use('/api/v1/leads', leadRoutes)
  app.use('/api/v1/ai', aiRoutes)
  app.use('/api/v1/metrics', metricsRoutes)

  app.use((_req, res) => {
    res.status(404).json({ status: 'error', code: 'NOT_FOUND', message: 'Not found' })
  })

  app.use(errorHandler)

  return app
}
