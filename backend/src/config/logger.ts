import pino from 'pino'
import { env } from './env'

const REDACT_PATHS = [
  'apiKey',
  'webhookSecret',
  'plaintext',
  'ciphertext',
  'masterKey',
  'MASTER_ENCRYPTION_KEY',
  '*.apiKey',
  '*.webhookSecret',
  '*.plaintext',
  '*.ciphertext',
  'req.headers["x-api-key"]',
  'req.headers["x-botyo-signature"]',
  'config.apiKey',
  'config.webhookSecret',
]

export const logger = pino({
  redact: { paths: REDACT_PATHS, censor: '[Redacted]' },
  ...(env.LOG_FORMAT === 'text'
    ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
    : {}),
})
