import { z } from 'zod'

export const PostStatusSchema = z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'UNPUBLISHED'])
export type PostStatus = z.infer<typeof PostStatusSchema>

export const CreatePostSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  coverImageUrl: z.string().url().optional(),
  categoryId: z.string().cuid().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  publishedAt: z.coerce.date().optional(),
  status: PostStatusSchema.default('DRAFT'),
})
export type CreatePostInput = z.infer<typeof CreatePostSchema>

export const UpdatePostSchema = CreatePostSchema.partial()
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>

export const GeneratePostSchema = z.object({
  topic: z.string().min(5).max(200),
  keywords: z.array(z.string()).max(10).optional(),
  tone: z.enum(['technical', 'educational', 'commercial']).default('educational'),
})
export type GeneratePostInput = z.infer<typeof GeneratePostSchema>
