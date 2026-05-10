import { z } from 'zod'

export const CreateLeadSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(8).max(20).optional(),
  message: z.string().max(2000).optional(),
  source: z.string().max(100).optional(),
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
  utmTerm: z.string().max(200).optional(),
  utmContent: z.string().max(200).optional(),
  referrer: z.string().max(500).optional(),
  landingPage: z.string().max(500).optional(),
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
  utmSource: z.string().nullable().optional(),
  utmMedium: z.string().nullable().optional(),
  utmCampaign: z.string().nullable().optional(),
  utmTerm: z.string().nullable().optional(),
  utmContent: z.string().nullable().optional(),
  referrer: z.string().nullable().optional(),
  landingPage: z.string().nullable().optional(),
  botyoStatus: z.string().nullable().optional(),
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

export const LeadNoteDtoSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  authorId: z.string(),
  authorName: z.string().nullable(),
  body: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type LeadNoteDto = z.infer<typeof LeadNoteDtoSchema>

export const LeadDetailDtoSchema = LeadDtoSchema.extend({
  notes: z.array(LeadNoteDtoSchema),
})
export type LeadDetailDto = z.infer<typeof LeadDetailDtoSchema>

export const CreateLeadNoteSchema = z.object({
  body: z.string().min(1).max(5000),
})
export type CreateLeadNoteInput = z.infer<typeof CreateLeadNoteSchema>

export const UpdateLeadNoteSchema = z.object({
  body: z.string().min(1).max(5000),
})
export type UpdateLeadNoteInput = z.infer<typeof UpdateLeadNoteSchema>

export const BulkDeleteLeadsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
})
export type BulkDeleteLeadsInput = z.infer<typeof BulkDeleteLeadsSchema>

export const BulkDeleteLeadsResultSchema = z.object({
  deleted: z.number().int().min(0),
})
export type BulkDeleteLeadsResult = z.infer<typeof BulkDeleteLeadsResultSchema>

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
