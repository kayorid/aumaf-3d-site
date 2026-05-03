import { z } from 'zod'

export const CreateLeadSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(8).max(20).optional(),
  message: z.string().max(2000).optional(),
  source: z.string().max(100).optional(),
})
export type CreateLeadInput = z.infer<typeof CreateLeadSchema>

export const LeadDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  message: z.string().nullable(),
  source: z.string().nullable(),
  createdAt: z.string(),
})
export type LeadDto = z.infer<typeof LeadDtoSchema>

export const LeadMaskedDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  contactMasked: z.string(),
  source: z.string().nullable(),
  createdAt: z.string(),
})
export type LeadMaskedDto = z.infer<typeof LeadMaskedDtoSchema>
