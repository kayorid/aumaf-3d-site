import type { RequestHandler } from 'express'
import { verifyToken, getUserById } from '../services/auth.service'
import { httpErrors } from '../lib/http-error'
import type { AuthUser, UserRole } from '@aumaf/shared'

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser
  }
}

export const COOKIE_NAME = 'aumaf_session'

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME]
    if (!token) throw httpErrors.unauthorized('Sessão não encontrada')

    const payload = verifyToken(token)
    const user = await getUserById(payload.sub)
    if (!user) throw httpErrors.unauthorized('Usuário não encontrado')

    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

export function requireRole(...allowed: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(httpErrors.unauthorized())
    if (!allowed.includes(req.user.role)) {
      return next(httpErrors.forbidden('Permissão insuficiente'))
    }
    next()
  }
}
