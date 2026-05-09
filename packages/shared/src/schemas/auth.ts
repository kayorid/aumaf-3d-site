import { z } from 'zod'

export const UserRoleSchema = z.enum(['ADMIN', 'EDITOR', 'MARKETING'])
export type UserRole = z.infer<typeof UserRoleSchema>

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
export type LoginInput = z.infer<typeof LoginSchema>

export const AuthUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
})
export type AuthUser = z.infer<typeof AuthUserSchema>

export const ProfileDtoSchema = AuthUserSchema.extend({
  phone: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  mustChangePassword: z.boolean().optional(),
  lastLoginAt: z.string().nullable().optional(),
})
export type ProfileDto = z.infer<typeof ProfileDtoSchema>

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(8).max(20).nullable().optional(),
})
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'A confirmação não confere',
  })
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
