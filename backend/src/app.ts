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
import { meRoutes } from './routes/me.routes'
import { postRoutes } from './routes/post.routes'
import { categoryRoutes } from './routes/category.routes'
import { uploadRoutes } from './routes/upload.routes'
import { leadRoutes } from './routes/lead.routes'
import { aiRoutes } from './routes/ai.routes'
import { metricsRoutes } from './routes/metrics.routes'
import { publicRoutes } from './routes/public.routes'
import { settingsRoutes } from './routes/settings.routes'
import { healthRoutes } from './routes/health.routes'
import { botyioWebhookRoutes } from './routes/botyio-webhook.routes'
import { adminIntegrationRoutes } from './routes/admin-integration.routes'

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

  // Webhook Botyio: precisa de raw body para validação HMAC-SHA256.
  // DEVE ficar antes de express.json() — depois o body já estaria parseado.
  app.use(
    '/api/v1/leads/botyio-status',
    express.raw({ type: 'application/json', limit: '512kb' }),
    botyioWebhookRoutes,
  )

  app.use(express.json({ limit: '5mb' }))
  app.use(pinoHttp({ logger }))

  // Health endpoints (sem auth, antes das rotas de domínio).
  // Mantém /api/health legado como alias do novo /health agregado.
  app.use('/health', healthRoutes)
  app.use('/api/health', healthRoutes)

  app.use('/api/v1/public', publicRoutes)
  app.use('/api/v1/auth', authRoutes)
  app.use('/api/v1/me', meRoutes)
  app.use('/api/v1/posts', postRoutes)
  app.use('/api/v1/categories', categoryRoutes)
  app.use('/api/v1/uploads', uploadRoutes)
  app.use('/api/v1/leads', leadRoutes)
  app.use('/api/v1/ai', aiRoutes)
  app.use('/api/v1/metrics', metricsRoutes)
  app.use('/api/v1/settings', settingsRoutes)
  app.use('/api/v1/admin/integrations', adminIntegrationRoutes)

  app.use((_req, res) => {
    res.status(404).json({ status: 'error', code: 'NOT_FOUND', message: 'Not found' })
  })

  app.use(errorHandler)

  return app
}
