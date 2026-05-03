import { createServer } from 'http'
import { createTerminus } from '@godaddy/terminus'
import { createApp } from './app'
import { env } from './config/env'
import { logger } from './config/logger'
import { ensureBucket } from './services/upload.service'
import { prisma } from './lib/prisma'
import { bootWorkers, shutdownWorkers } from './workers'
import './workers/register'

async function main() {
  try {
    await ensureBucket()
  } catch (err) {
    logger.error({ err }, 'Failed to ensure MinIO bucket — continuing anyway')
  }

  const app = createApp()
  const server = createServer(app)

  createTerminus(server, {
    signals: ['SIGINT', 'SIGTERM'],
    timeout: 15_000,
    healthChecks: { '/health': async () => ({ status: 'ok' }) },
    onSignal: async () => {
      logger.info('Server shutting down...')
      await shutdownWorkers()
      await prisma.$disconnect()
    },
    onShutdown: async () => {
      logger.info('Cleanup finished, server is shutting down')
    },
  })

  server.listen(env.PORT, async () => {
    logger.info(`Backend running on http://localhost:${env.PORT}`)
    try {
      await bootWorkers()
    } catch (err) {
      logger.error({ err }, 'Worker boot failed')
    }
  })
}

main().catch((err) => {
  logger.error(err)
  process.exit(1)
})
