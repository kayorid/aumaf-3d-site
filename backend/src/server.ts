import { createServer } from 'http'
import { createTerminus } from '@godaddy/terminus'
import { createApp } from './app'
import { env } from './config/env'
import { logger } from './config/logger'
import { ensureBucket } from './services/upload.service'
import { prisma } from './lib/prisma'
import { bootWorkers, shutdownWorkers } from './workers'
import { loadMasterKey } from './lib/crypto'
import { bootstrapIntegrationSecretsFromEnv } from './lib/integration-bootstrap'
import { ensurePubSubSubscribed } from './services/integration-config.service'
import { closePubSub } from './lib/redis-pubsub'
import './workers/register'

async function main() {
  // Cripto: derruba o processo se a master key estiver indisponível em produção
  loadMasterKey()

  try {
    await bootstrapIntegrationSecretsFromEnv()
  } catch (err) {
    logger.error({ err }, 'Bootstrap de integration secrets falhou — continuando')
  }

  try {
    await ensurePubSubSubscribed()
  } catch (err) {
    logger.error({ err }, 'Subscriber de invalidação Redis falhou — cache pode ficar stale')
  }

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
      await closePubSub()
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
