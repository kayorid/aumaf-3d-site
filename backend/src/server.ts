import { createServer } from 'http'
import { createTerminus } from '@godaddy/terminus'
import { createApp } from './app'
import { env } from './config/env'
import { logger } from './config/logger'
import { ensureBucket } from './services/upload.service'
import { prisma } from './lib/prisma'

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
    healthChecks: { '/health': async () => {} },
    onSignal: async () => {
      logger.info('Server shutting down...')
      await prisma.$disconnect()
    },
  })

  server.listen(env.PORT, () => {
    logger.info(`Backend running on http://localhost:${env.PORT}`)
  })
}

main().catch((err) => {
  logger.error(err)
  process.exit(1)
})
