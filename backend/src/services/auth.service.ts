// auth.service.ts — login, JWT, perfil, senha
import bcrypt from 'bcrypt'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { httpErrors } from '../lib/http-error'
import { env } from '../config/env'
import { logger } from '../config/logger'
import type { AuthUser, UserRole, ProfileDto, UpdateProfileInput } from '@template/shared'

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

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

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

export async function getProfile(userId: string): Promise<ProfileDto> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw httpErrors.notFound('Usuário não encontrado')
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    mustChangePassword: user.mustChangePassword,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  }
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<ProfileDto> {
  // Email único
  if (input.email) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } })
    if (existing && existing.id !== userId) {
      throw httpErrors.conflict('EMAIL_IN_USE', 'Este email já está em uso por outro usuário')
    }
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
    },
  })
  logger.info({ userId }, 'Profile updated')
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    mustChangePassword: user.mustChangePassword,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  }
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw httpErrors.notFound('Usuário não encontrado')
  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) throw httpErrors.unauthorized('Senha atual incorreta')
  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed, mustChangePassword: false },
  })
  logger.info({ userId }, 'Password changed')
}
