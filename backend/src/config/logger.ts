import pino from 'pino'
import { env } from './env'

export const logger = pino(
  env.LOG_FORMAT === 'text'
    ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
    : {}
)
