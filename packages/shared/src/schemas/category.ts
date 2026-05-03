import { z } from 'zod'

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const CategoryDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type CategoryDto = z.infer<typeof CategoryDtoSchema>

export const CategoryDtoWithCountSchema = CategoryDtoSchema.extend({
  postCount: z.number().int().nonnegative(),
})
export type CategoryDtoWithCount = z.infer<typeof CategoryDtoWithCountSchema>

export const CreateCategorySchema = z.object({
  name: z.string().min(2).max(60),
  slug: z.string().min(2).max(60).regex(slugRegex).optional(),
})
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>

export const UpdateCategorySchema = CreateCategorySchema.partial()
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>
