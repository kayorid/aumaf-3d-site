import { z } from 'zod'
import { UploadContentTypeSchema } from './upload'

export const MediaAssetDtoSchema = z.object({
  id: z.string(),
  key: z.string(),
  url: z.string().url(),
  contentType: z.string(),
  size: z.number().int().nonnegative(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  originalName: z.string(),
  alt: z.string().nullable(),
  createdById: z.string().nullable(),
  createdByName: z.string().nullable(),
  createdAt: z.string(),
})
export type MediaAssetDto = z.infer<typeof MediaAssetDtoSchema>

export const RegisterMediaInputSchema = z.object({
  key: z.string().min(1).max(500),
  url: z.string().url(),
  contentType: UploadContentTypeSchema,
  size: z.number().int().min(1).max(20 * 1024 * 1024),
  originalName: z.string().min(1).max(255),
  alt: z.string().max(300).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
})
export type RegisterMediaInput = z.infer<typeof RegisterMediaInputSchema>

export const UpdateMediaInputSchema = z.object({
  alt: z.string().max(300).nullable().optional(),
})
export type UpdateMediaInput = z.infer<typeof UpdateMediaInputSchema>

export const MediaListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(40),
  search: z.string().max(200).optional(),
})
export type MediaListQuery = z.infer<typeof MediaListQuerySchema>

export const MediaListResponseSchema = z.object({
  items: z.array(MediaAssetDtoSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
})
export type MediaListResponse = z.infer<typeof MediaListResponseSchema>
