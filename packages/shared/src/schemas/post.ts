import { z } from 'zod'

export const PostStatusSchema = z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'UNPUBLISHED'])
export type PostStatus = z.infer<typeof PostStatusSchema>

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const PostInputSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200).regex(slugRegex).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(1),
  coverImageUrl: z.string().url().optional().nullable(),
  categoryId: z.string().cuid().optional().nullable(),
  metaTitle: z.string().max(80).optional().nullable(),
  metaDescription: z.string().max(200).optional().nullable(),
  status: PostStatusSchema.default('DRAFT'),
  generatedByAi: z.boolean().default(false),
  readingTimeMin: z.number().int().min(1).max(60).optional().nullable(),
  featured: z.boolean().default(false),
  tags: z.array(z.string().min(1).max(40)).max(15).default([]),
})
export type PostInput = z.infer<typeof PostInputSchema>

export const CreatePostSchema = PostInputSchema
export type CreatePostInput = PostInput

export const UpdatePostSchema = PostInputSchema.partial().strict()
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>

export const PostListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: PostStatusSchema.optional(),
  search: z.string().optional(),
  categoryId: z.string().cuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  generatedByAi: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  sort: z.enum(['updatedAt', 'createdAt', 'publishedAt', 'title']).default('updatedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})
export type PostListQuery = z.infer<typeof PostListQuerySchema>

export const PostDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  content: z.string(),
  coverImageUrl: z.string().nullable(),
  status: PostStatusSchema,
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  generatedByAi: z.boolean(),
  publishedAt: z.string().nullable(),
  readingTimeMin: z.number().int().nullable(),
  featured: z.boolean(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  categoryId: z.string().nullable(),
  authorId: z.string().nullable(),
  category: z
    .object({ id: z.string(), name: z.string(), slug: z.string() })
    .nullable()
    .optional(),
  author: z.object({ id: z.string(), name: z.string() }).nullable().optional(),
})
export type PostDto = z.infer<typeof PostDtoSchema>

export const PostListResponseSchema = z.object({
  data: z.array(PostDtoSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})
export type PostListResponse = z.infer<typeof PostListResponseSchema>

// === Phase 2 — public read DTOs ===

export const PostPublicDtoSchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().nullable(),
  content: z.string(),
  coverImageUrl: z.string().nullable(),
  publishedAt: z.string(),
  readingTimeMin: z.number().int().nullable(),
  featured: z.boolean(),
  tags: z.array(z.string()),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  category: z.object({ name: z.string(), slug: z.string() }).nullable(),
  author: z.object({ name: z.string() }).nullable(),
  updatedAt: z.string(),
})
export type PostPublicDto = z.infer<typeof PostPublicDtoSchema>

export const PublicPostListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
  category: z.string().optional(),
  featured: z.coerce.boolean().optional(),
})
export type PublicPostListQuery = z.infer<typeof PublicPostListQuerySchema>

export const PublicPostListResponseSchema = z.object({
  data: z.array(PostPublicDtoSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})
export type PublicPostListResponse = z.infer<typeof PublicPostListResponseSchema>
