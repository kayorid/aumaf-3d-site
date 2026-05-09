import { prisma } from '../lib/prisma'
import { slugify } from '../lib/slug'
import { httpErrors } from '../lib/http-error'
import { logger } from '../config/logger'
import { enqueuePostPublishWarmup } from '../workers/post-publish.worker'
import type { CreatePostInput, UpdatePostInput, PostListQuery, PostDto } from '@aumaf/shared'

async function safeEnqueueWarmup(postId: string, slug: string): Promise<void> {
  try {
    await enqueuePostPublishWarmup(postId, slug)
  } catch (err) {
    logger.error({ err, postId, slug }, 'Failed to enqueue post-publish warmup — post saved anyway')
  }
}

function toDto(post: Awaited<ReturnType<typeof prisma.post.findUnique>>): PostDto {
  if (!post) throw httpErrors.notFound('Post não encontrado')
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl: post.coverImageUrl,
    status: post.status,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    generatedByAi: post.generatedByAi,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    readingTimeMin: post.readingTimeMin,
    featured: post.featured,
    tags: post.tags,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    categoryId: post.categoryId,
    authorId: post.authorId,
  }
}

export async function generateUniqueSlug(title: string, currentSlug?: string): Promise<string> {
  const base = slugify(title)
  if (!base) throw httpErrors.unprocessable('INVALID_SLUG', 'Não foi possível gerar slug a partir do título')

  if (currentSlug === base) return base

  let candidate = base
  let n = 2
  while (true) {
    const exists = await prisma.post.findUnique({ where: { slug: candidate } })
    if (!exists) return candidate
    candidate = `${base}-${n}`
    n += 1
    if (n > 1000) throw httpErrors.internal('Não foi possível gerar slug único')
  }
}

export async function listPosts(query: PostListQuery) {
  const {
    page,
    pageSize,
    status,
    search,
    categoryId,
    dateFrom,
    dateTo,
    generatedByAi,
    featured,
    sort,
    order,
  } = query
  const dateField = sort === 'publishedAt' ? 'publishedAt' : 'updatedAt'
  const where = {
    ...(status ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(typeof generatedByAi === 'boolean' ? { generatedByAi } : {}),
    ...(typeof featured === 'boolean' ? { featured } : {}),
    ...(dateFrom || dateTo
      ? {
          [dateField]: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { excerpt: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }
  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { [sort]: order } as Record<string, 'asc' | 'desc'>,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true } },
      },
    }),
    prisma.post.count({ where }),
  ])

  return {
    data: items.map((p) => ({
      ...toDto(p),
      category: p.category,
      author: p.author,
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  }
}

export async function getPostById(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, name: true } },
    },
  })
  if (!post) throw httpErrors.notFound('Post não encontrado')
  return { ...toDto(post), category: post.category, author: post.author }
}

export async function createPost(input: CreatePostInput, authorId: string) {
  const slug = input.slug ? await generateUniqueSlug(input.slug) : await generateUniqueSlug(input.title)

  const data = {
    title: input.title,
    slug,
    excerpt: input.excerpt ?? null,
    content: input.content,
    coverImageUrl: input.coverImageUrl ?? null,
    metaTitle: input.metaTitle ?? null,
    metaDescription: input.metaDescription ?? null,
    status: input.status,
    generatedByAi: input.generatedByAi,
    readingTimeMin: input.readingTimeMin ?? null,
    featured: input.featured ?? false,
    tags: input.tags ?? [],
    categoryId: input.categoryId ?? null,
    authorId,
    ...(input.status === 'PUBLISHED' ? { publishedAt: new Date() } : {}),
  }

  const post = await prisma.post.create({ data })
  logger.info({ postId: post.id, slug: post.slug, status: post.status }, 'Post created')
  if (post.status === 'PUBLISHED') {
    await safeEnqueueWarmup(post.id, post.slug)
  }
  return toDto(post)
}

export async function updatePost(id: string, patch: UpdatePostInput) {
  const existing = await prisma.post.findUnique({ where: { id } })
  if (!existing) throw httpErrors.notFound('Post não encontrado')

  let nextSlug: string | undefined
  if (patch.slug && patch.slug !== existing.slug) {
    nextSlug = await generateUniqueSlug(patch.slug)
  } else if (patch.title && !patch.slug && slugify(patch.title) !== existing.slug) {
    nextSlug = undefined
  }

  const updated = await prisma.post.update({
    where: { id },
    data: {
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(nextSlug !== undefined ? { slug: nextSlug } : {}),
      ...(patch.excerpt !== undefined ? { excerpt: patch.excerpt } : {}),
      ...(patch.content !== undefined ? { content: patch.content } : {}),
      ...(patch.coverImageUrl !== undefined ? { coverImageUrl: patch.coverImageUrl } : {}),
      ...(patch.categoryId !== undefined ? { categoryId: patch.categoryId } : {}),
      ...(patch.metaTitle !== undefined ? { metaTitle: patch.metaTitle } : {}),
      ...(patch.metaDescription !== undefined ? { metaDescription: patch.metaDescription } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.generatedByAi !== undefined ? { generatedByAi: patch.generatedByAi } : {}),
      ...(patch.readingTimeMin !== undefined ? { readingTimeMin: patch.readingTimeMin } : {}),
      ...(patch.featured !== undefined ? { featured: patch.featured } : {}),
      ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
    },
  })
  logger.info({ postId: id }, 'Post updated')
  const wasNotPublished = existing.status !== 'PUBLISHED'
  if (updated.status === 'PUBLISHED' && (wasNotPublished || patch.slug)) {
    await safeEnqueueWarmup(updated.id, updated.slug)
  }
  return toDto(updated)
}

export async function deletePost(id: string) {
  await prisma.post.delete({ where: { id } })
  logger.info({ postId: id }, 'Post deleted')
}

export async function publishPost(id: string) {
  const post = await prisma.post.update({
    where: { id },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
  })
  logger.info({ postId: id }, 'Post published')
  await safeEnqueueWarmup(post.id, post.slug)
  return toDto(post)
}

export async function unpublishPost(id: string) {
  const post = await prisma.post.update({
    where: { id },
    data: { status: 'DRAFT' },
  })
  logger.info({ postId: id }, 'Post unpublished')
  return toDto(post)
}
