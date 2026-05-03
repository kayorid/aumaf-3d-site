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
