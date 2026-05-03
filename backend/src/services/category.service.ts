import { prisma } from '../lib/prisma'
import type { CategoryDto } from '@aumaf/shared'

export async function listCategories(): Promise<CategoryDto[]> {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))
}
