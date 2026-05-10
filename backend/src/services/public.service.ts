import { prisma } from '../lib/prisma'
import { httpErrors } from '../lib/http-error'
import type {
  PostPublicDto,
  PublicPostListQuery,
  PublicPostListResponse,
  PublicSettingsDto,
} from '@template/shared'

function toPublicDto(post: {
  slug: string
  title: string
  excerpt: string | null
  content: string
  coverImageUrl: string | null
  publishedAt: Date | null
  readingTimeMin: number | null
  featured: boolean
  tags: string[]
  metaTitle: string | null
  metaDescription: string | null
  updatedAt: Date
  category: { name: string; slug: string } | null
  author: { name: string } | null
}): PostPublicDto {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl: post.coverImageUrl,
    publishedAt: (post.publishedAt ?? post.updatedAt).toISOString(),
    readingTimeMin: post.readingTimeMin,
    featured: post.featured,
    tags: post.tags,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    category: post.category,
    author: post.author,
    updatedAt: post.updatedAt.toISOString(),
  }
}

export async function listPublicPosts(query: PublicPostListQuery): Promise<PublicPostListResponse> {
  const { page, pageSize, category, featured } = query

  const where = {
    status: 'PUBLISHED' as const,
    publishedAt: { lte: new Date() },
    ...(category ? { category: { slug: category } } : {}),
    ...(featured !== undefined ? { featured } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        coverImageUrl: true,
        publishedAt: true,
        readingTimeMin: true,
        featured: true,
        tags: true,
        metaTitle: true,
        metaDescription: true,
        updatedAt: true,
        category: { select: { name: true, slug: true } },
        author: { select: { name: true } },
      },
    }),
    prisma.post.count({ where }),
  ])

  return {
    data: items.map(toPublicDto),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  }
}

export async function getPublicPostBySlug(slug: string): Promise<PostPublicDto> {
  const post = await prisma.post.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
    },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      coverImageUrl: true,
      publishedAt: true,
      readingTimeMin: true,
      featured: true,
      tags: true,
      metaTitle: true,
      metaDescription: true,
      updatedAt: true,
      category: { select: { name: true, slug: true } },
      author: { select: { name: true } },
    },
  })

  if (!post) throw httpErrors.notFound('Post não encontrado')

  return toPublicDto(post)
}

export async function listPublicSlugs(): Promise<string[]> {
  const items = await prisma.post.findMany({
    where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
    select: { slug: true },
  })
  return items.map((i) => i.slug)
}

export async function getPublicSettings(): Promise<PublicSettingsDto> {
  const setting = await prisma.setting.findFirst({ where: { id: 'default' } })
  return {
    ga4MeasurementId: setting?.ga4MeasurementId ?? null,
    clarityProjectId: setting?.clarityProjectId ?? null,
    facebookPixelId: setting?.facebookPixelId ?? null,
    gtmContainerId: setting?.gtmContainerId ?? null,
    customHeadScripts: setting?.customHeadScripts ?? null,
    customBodyScripts: setting?.customBodyScripts ?? null,
  }
}
