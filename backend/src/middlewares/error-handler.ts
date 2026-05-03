import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { HttpError } from '../lib/http-error'
import { logger } from '../config/logger'
import { env } from '../config/env'

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json(err.toJSON())
    return
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
      details: err.flatten(),
    })
    return
  }

  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error')

  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    ...(env.NODE_ENV !== 'production' ? { stack: (err as Error).stack } : {}),
  })
}
