import { prisma } from '../lib/prisma'
import { httpErrors } from '../lib/http-error'
import { slugify } from '../lib/slug'
import { logger } from '../config/logger'
import type {
  CategoryDto,
  CategoryDtoWithCount,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@template/shared'

function toDto(c: { id: string; name: string; slug: string; createdAt: Date; updatedAt: Date }): CategoryDto {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }
}

export async function listCategories(): Promise<CategoryDto[]> {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  return categories.map(toDto)
}

export async function listCategoriesWithCount(): Promise<CategoryDtoWithCount[]> {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { posts: true } } },
  })
  return categories.map((c) => ({
    ...toDto(c),
    postCount: c._count.posts,
  }))
}

async function uniqueSlug(base: string, excludingId?: string): Promise<string> {
  let candidate = base
  let n = 2
  while (true) {
    const exists = await prisma.category.findUnique({ where: { slug: candidate } })
    if (!exists || exists.id === excludingId) return candidate
    candidate = `${base}-${n}`
    n += 1
    if (n > 1000) throw httpErrors.internal('Não foi possível gerar slug único de categoria')
  }
}

export async function createCategory(input: CreateCategoryInput): Promise<CategoryDto> {
  const baseSlug = slugify(input.slug ?? input.name)
  if (!baseSlug) throw httpErrors.unprocessable('INVALID_SLUG', 'Não foi possível gerar slug')
  const slug = await uniqueSlug(baseSlug)

  const created = await prisma.category.create({ data: { name: input.name, slug } })
  logger.info({ categoryId: created.id, slug: created.slug }, 'Category created')
  return toDto(created)
}

export async function updateCategory(id: string, patch: UpdateCategoryInput): Promise<CategoryDto> {
  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) throw httpErrors.notFound('Categoria não encontrada')

  let nextSlug: string | undefined
  if (patch.slug && patch.slug !== existing.slug) {
    nextSlug = await uniqueSlug(slugify(patch.slug), id)
  } else if (patch.name && !patch.slug && slugify(patch.name) !== existing.slug) {
    nextSlug = await uniqueSlug(slugify(patch.name), id)
  }

  const updated = await prisma.category.update({
    where: { id },
    data: {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(nextSlug !== undefined ? { slug: nextSlug } : {}),
    },
  })
  logger.info({ categoryId: id }, 'Category updated')
  return toDto(updated)
}

export async function deleteCategory(id: string): Promise<void> {
  const postCount = await prisma.post.count({ where: { categoryId: id } })
  if (postCount > 0) {
    throw httpErrors.conflict(
      'CATEGORY_HAS_POSTS',
      `Categoria tem ${postCount} post(s) vinculado(s). Reatribua os posts antes de excluir.`,
    )
  }
  await prisma.category.delete({ where: { id } })
  logger.info({ categoryId: id }, 'Category deleted')
}
