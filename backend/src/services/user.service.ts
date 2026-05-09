import bcrypt from 'bcrypt'
import { randomBytes } from 'crypto'
import { prisma } from '../lib/prisma'
import { logger } from '../config/logger'
import { httpErrors } from '../lib/http-error'
import { isValidPermission } from '../lib/permissions'
import type {
  UserDto,
  UserDetailDto,
  CreateUserInput,
  UpdateUserInput,
  PermissionOverride,
  UserRole,
} from '@aumaf/shared'

function toDto(user: {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  phone: string | null
  avatarUrl: string | null
  mustChangePassword: boolean
  lastLoginAt: Date | null
  createdAt: Date
}): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    active: user.active,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    mustChangePassword: user.mustChangePassword,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  }
}

export async function listUsers(): Promise<UserDto[]> {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
  return users.map(toDto)
}

export async function getUserDetail(id: string): Promise<UserDetailDto> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { permissions: true },
  })
  if (!user) throw httpErrors.notFound('Usuário não encontrado')
  return {
    ...toDto(user),
    permissions: user.permissions.map((p) => ({
      feature: p.feature,
      action: p.action as 'view' | 'edit',
      granted: p.granted,
    })),
  }
}

function generateTempPassword(): string {
  // 12 chars: alfa+num seguros, sem ambíguos.
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const buf = randomBytes(12)
  let out = ''
  for (let i = 0; i < 12; i++) out += charset[buf[i] % charset.length]
  return out
}

export interface CreateUserResult {
  user: UserDto
  temporaryPassword?: string
}

export async function createUser(input: CreateUserInput): Promise<CreateUserResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) throw httpErrors.conflict('EMAIL_IN_USE', 'Este email já está em uso')

  validatePermissions(input.permissions)

  const tempPassword = input.password ?? generateTempPassword()
  const hashed = await bcrypt.hash(tempPassword, 10)

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      role: input.role,
      active: input.active ?? true,
      phone: input.phone ?? null,
      password: hashed,
      mustChangePassword: !input.password, // se admin não forneceu senha, força troca
      permissions: {
        create: input.permissions.map((p) => ({
          feature: p.feature,
          action: p.action,
          granted: p.granted,
        })),
      },
    },
  })

  logger.info({ userId: user.id, role: user.role }, 'User created')

  return {
    user: toDto(user),
    ...(input.password ? {} : { temporaryPassword: tempPassword }),
  }
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
  actingUserId: string,
): Promise<UserDto> {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw httpErrors.notFound('Usuário não encontrado')

  // Anti-lockout: o usuário não pode rebaixar a si mesmo
  if (id === actingUserId && input.role && input.role !== user.role && input.role !== 'ADMIN') {
    throw httpErrors.badRequest(
      'SELF_DEMOTION',
      'Você não pode rebaixar seu próprio papel — peça a outro administrador.',
    )
  }
  // Last admin protection
  if (input.role && user.role === 'ADMIN' && input.role !== 'ADMIN') {
    await ensureAnotherActiveAdmin(id)
  }
  if (input.active === false && user.role === 'ADMIN') {
    await ensureAnotherActiveAdmin(id)
  }

  if (input.email && input.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } })
    if (existing && existing.id !== id) {
      throw httpErrors.conflict('EMAIL_IN_USE', 'Este email já está em uso')
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
    },
  })
  logger.info({ userId: id, changes: input }, 'User updated')
  return toDto(updated)
}

export async function deleteUser(id: string, actingUserId: string): Promise<void> {
  if (id === actingUserId) {
    throw httpErrors.badRequest('SELF_DELETE', 'Você não pode excluir a si mesmo')
  }
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw httpErrors.notFound('Usuário não encontrado')
  if (user.role === 'ADMIN') {
    await ensureAnotherActiveAdmin(id)
  }
  await prisma.user.update({ where: { id }, data: { active: false } })
  logger.info({ userId: id, actingUserId }, 'User soft-deactivated')
}

export async function resetUserPassword(id: string): Promise<{ temporaryPassword: string }> {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw httpErrors.notFound('Usuário não encontrado')
  const temp = generateTempPassword()
  const hashed = await bcrypt.hash(temp, 10)
  await prisma.user.update({
    where: { id },
    data: { password: hashed, mustChangePassword: true },
  })
  logger.info({ userId: id }, 'User password reset')
  return { temporaryPassword: temp }
}

export async function setUserPermissions(
  id: string,
  permissions: PermissionOverride[],
  actingUserId: string,
): Promise<UserDetailDto> {
  validatePermissions(permissions)
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw httpErrors.notFound('Usuário não encontrado')

  // Anti-lockout: ao editar a si mesmo, não pode revogar users:edit
  if (id === actingUserId) {
    const blocking = permissions.find(
      (p) => p.feature === 'users' && p.action === 'edit' && p.granted === false,
    )
    if (blocking) {
      throw httpErrors.badRequest(
        'SELF_LOCKOUT',
        'Você não pode revogar a sua própria permissão de editar usuários.',
      )
    }
  }

  await prisma.$transaction([
    prisma.userPermission.deleteMany({ where: { userId: id } }),
    prisma.userPermission.createMany({
      data: permissions.map((p) => ({
        userId: id,
        feature: p.feature,
        action: p.action,
        granted: p.granted,
      })),
    }),
  ])

  logger.info({ userId: id, count: permissions.length }, 'User permissions replaced')
  return getUserDetail(id)
}

async function ensureAnotherActiveAdmin(excludeUserId: string): Promise<void> {
  const others = await prisma.user.count({
    where: { role: 'ADMIN', active: true, id: { not: excludeUserId } },
  })
  if (others === 0) {
    throw httpErrors.badRequest(
      'LAST_ADMIN',
      'Não é possível remover o último administrador ativo do sistema.',
    )
  }
}

function validatePermissions(permissions: PermissionOverride[]) {
  for (const p of permissions) {
    if (!isValidPermission(`${p.feature}:${p.action}`)) {
      throw httpErrors.badRequest(
        'INVALID_PERMISSION',
        `Permissão inválida: ${p.feature}:${p.action}`,
      )
    }
  }
}
