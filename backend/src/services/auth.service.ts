import bcrypt from 'bcrypt'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { httpErrors } from '../lib/http-error'
import { env } from '../config/env'
import { logger } from '../config/logger'
import type { AuthUser, UserRole } from '@aumaf/shared'

export interface JwtPayload {
  sub: string
  email: string
  role: UserRole
}

export async function login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !user.active) {
    logger.warn({ email }, 'Login failed: user not found or inactive')
    throw httpErrors.unauthorized('Credenciais inválidas')
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    logger.warn({ userId: user.id }, 'Login failed: bad password')
    throw httpErrors.unauthorized('Credenciais inválidas')
  }

  const token = signToken({ sub: user.id, email: user.email, role: user.role as UserRole })

  logger.info({ userId: user.id, email: user.email }, 'Login successful')

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
    },
  }
}

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] }
  return jwt.sign(payload, env.JWT_SECRET, options)
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload
  } catch {
    throw httpErrors.unauthorized('Sessão inválida ou expirada')
  }
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user || !user.active) return null
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
  }
}
