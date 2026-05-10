import type { RequestHandler } from 'express'
import { verifyToken, getUserById } from '../services/auth.service'
import { httpErrors } from '../lib/http-error'
import { prisma } from '../lib/prisma'
import {
  resolvePermissions,
  type Action,
  type Feature,
  type Permission,
} from '../lib/permissions'
import type { AuthUser, UserRole } from '@aumaf/shared'

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser & { permissions?: Set<Permission> }
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

    const overrides = await prisma.userPermission.findMany({ where: { userId: user.id } })
    const permissions = resolvePermissions(user.role, overrides)

    req.user = { ...user, permissions }
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

export function requirePermission(feature: Feature, action: Action): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(httpErrors.unauthorized())
    const key = `${feature}:${action}` as Permission
    if (!req.user.permissions?.has(key)) {
      return next(httpErrors.forbidden(`Permissão insuficiente: requer ${key}`))
    }
    next()
  }
}
