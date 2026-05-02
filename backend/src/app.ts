import express, { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import hpp from 'hpp'
import { pinoHttp } from 'pino-http'
import { env } from './config/env'
import { logger } from './config/logger'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({
    origin: [env.FRONTEND_ADMIN_URL, env.FRONTEND_PUBLIC_URL],
    credentials: true,
  }))
  app.use(hpp())
  app.use(cookieParser())
  app.use(express.json({ limit: '5mb' }))
  app.use(pinoHttp({ logger }))

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.use((_req, res) => {
    res.status(404).json({ status: 'error', message: 'Not found' })
  })

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(err)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  })

  return app
}
