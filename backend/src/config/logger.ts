import pino from 'pino'
import { env } from './env'

const REDACT_PATHS = [
  // Secrets / credenciais
  'apiKey',
  'webhookSecret',
  'plaintext',
  'ciphertext',
  'masterKey',
  'MASTER_ENCRYPTION_KEY',
  'password',
  'passwordHash',
  'token',
  'refreshToken',
  'accessToken',
  'totpSecret',
  'jwtSecret',
  // PII (LGPD)
  'cpf',
  'cnpj',
  'phone',
  // Wildcards aninhados
  '*.apiKey',
  '*.webhookSecret',
  '*.plaintext',
  '*.ciphertext',
  '*.password',
  '*.passwordHash',
  '*.token',
  '*.refreshToken',
  '*.totpSecret',
  '*.cpf',
  '*.cnpj',
  // Headers HTTP sensíveis
  'req.headers["x-api-key"]',
  'req.headers["x-botyo-signature"]',
  'req.headers.cookie',
  'req.headers.authorization',
  'req.body.password',
  'req.body.currentPassword',
  'req.body.newPassword',
  // Config objects
  'config.apiKey',
  'config.webhookSecret',
]

export const logger = pino({
  redact: { paths: REDACT_PATHS, censor: '[Redacted]' },
  ...(env.LOG_FORMAT === 'text'
    ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
    : {}),
})
