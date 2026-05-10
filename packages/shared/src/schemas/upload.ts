import { z } from 'zod'

export const UploadContentTypeSchema = z.enum([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
])
export type UploadContentType = z.infer<typeof UploadContentTypeSchema>

export const PresignInputSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: UploadContentTypeSchema,
  size: z.number().int().min(1).max(10 * 1024 * 1024),
})
export type PresignInput = z.infer<typeof PresignInputSchema>

export const PresignOutputSchema = z.object({
  uploadUrl: z.string().url(),
  publicUrl: z.string().url(),
  key: z.string(),
  expiresIn: z.number(),
})
export type PresignOutput = z.infer<typeof PresignOutputSchema>

export const DirectUploadOutputSchema = z.object({
  key: z.string(),
  publicUrl: z.string().url(),
  contentType: UploadContentTypeSchema,
  size: z.number().int().min(1),
  originalName: z.string(),
})
export type DirectUploadOutput = z.infer<typeof DirectUploadOutputSchema>
