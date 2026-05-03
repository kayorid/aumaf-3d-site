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

export const LeadFilterQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  source: z.string().optional(),
  q: z.string().optional(),
})
export type LeadFilterQuery = z.infer<typeof LeadFilterQuerySchema>

export const LeadListResponseSchema = z.object({
  data: z.array(LeadDtoSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})
export type LeadListResponse = z.infer<typeof LeadListResponseSchema>
