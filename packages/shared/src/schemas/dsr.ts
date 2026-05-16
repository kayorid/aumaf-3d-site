import { z } from 'zod'

/**
 * Tipos de solicitação previstos no art. 18 da LGPD.
 */
export const DsrRequestTypeSchema = z.enum([
  'access',
  'correction',
  'anonymization',
  'deletion',
  'portability',
  'revocation',
  'info_share',
  'info_no_consent',
  'review_automated',
])
export type DsrRequestType = z.infer<typeof DsrRequestTypeSchema>

export const DsrStatusSchema = z.enum([
  'pending_verification',
  'open',
  'in_progress',
  'completed',
  'rejected',
])
export type DsrStatus = z.infer<typeof DsrStatusSchema>

export const CreateDsrRequestSchema = z.object({
  email: z.string().email().max(200),
  fullName: z.string().min(2).max(200).optional(),
  requestType: DsrRequestTypeSchema,
  description: z.string().max(2000).optional(),
})
export type CreateDsrRequestInput = z.infer<typeof CreateDsrRequestSchema>

export const UpdateDsrRequestSchema = z.object({
  status: DsrStatusSchema.optional(),
  resolutionNote: z.string().max(4000).optional(),
})
export type UpdateDsrRequestInput = z.infer<typeof UpdateDsrRequestSchema>

export const DsrRequestDtoSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string().nullable(),
  requestType: DsrRequestTypeSchema,
  description: z.string().nullable(),
  status: DsrStatusSchema,
  verifiedAt: z.string().nullable(),
  resolvedAt: z.string().nullable(),
  resolutionNote: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type DsrRequestDto = z.infer<typeof DsrRequestDtoSchema>

export const DsrListResponseSchema = z.object({
  data: z.array(DsrRequestDtoSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})
export type DsrListResponse = z.infer<typeof DsrListResponseSchema>
