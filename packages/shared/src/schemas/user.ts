import { z } from 'zod'

export const UserRoleSchema = z.enum(['ADMIN', 'EDITOR', 'MARKETING'])
export type UserRole = z.infer<typeof UserRoleSchema>

export const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: UserRoleSchema,
})
export type CreateUserInput = z.infer<typeof CreateUserSchema>

export const UpdateUserSchema = CreateUserSchema.partial().omit({ password: true }).strict()
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
export type LoginInput = z.infer<typeof LoginSchema>
