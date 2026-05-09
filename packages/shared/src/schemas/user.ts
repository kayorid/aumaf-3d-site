import { z } from 'zod'
import { UserRoleSchema } from './auth'

export const PermissionOverrideSchema = z.object({
  feature: z.string(),
  action: z.enum(['view', 'edit']),
  granted: z.boolean(),
})
export type PermissionOverride = z.infer<typeof PermissionOverrideSchema>

export const UserDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  active: z.boolean(),
  phone: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  mustChangePassword: z.boolean(),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
})
export type UserDto = z.infer<typeof UserDtoSchema>

export const UserDetailDtoSchema = UserDtoSchema.extend({
  permissions: z.array(PermissionOverrideSchema),
})
export type UserDetailDto = z.infer<typeof UserDetailDtoSchema>

export const CreateUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  role: UserRoleSchema,
  password: z.string().min(8).max(72).optional(),
  active: z.boolean().default(true),
  phone: z.string().min(8).max(20).nullable().optional(),
  permissions: z.array(PermissionOverrideSchema).default([]),
})
export type CreateUserInput = z.infer<typeof CreateUserSchema>

export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().optional(),
  role: UserRoleSchema.optional(),
  active: z.boolean().optional(),
  phone: z.string().min(8).max(20).nullable().optional(),
})
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

export const SetUserPermissionsSchema = z.object({
  permissions: z.array(PermissionOverrideSchema),
})
export type SetUserPermissionsInput = z.infer<typeof SetUserPermissionsSchema>

export const ResetPasswordResponseSchema = z.object({
  temporaryPassword: z.string(),
})
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>

export const PermissionCatalogSchema = z.object({
  features: z.array(z.object({ id: z.string(), label: z.string() })),
  actions: z.array(z.enum(['view', 'edit'])),
  rolePresets: z.record(z.string(), z.array(z.string())),
})
export type PermissionCatalog = z.infer<typeof PermissionCatalogSchema>
