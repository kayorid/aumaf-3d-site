import { z } from 'zod'

export const CreateLeadSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20).optional(),
  message: z.string().max(1000).optional(),
  source: z.string().max(100).optional(),
})
export type CreateLeadInput = z.infer<typeof CreateLeadSchema>
