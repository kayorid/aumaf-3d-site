import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { prisma } from '../lib/prisma'
import { s3 } from '../lib/s3-client'
import { env } from '../config/env'
import { logger } from '../config/logger'
import { httpErrors } from '../lib/http-error'
import type {
  MediaAssetDto,
  MediaListQuery,
  MediaListResponse,
  RegisterMediaInput,
  UpdateMediaInput,
} from '@template/shared'

function toDto(row: {
  id: string
  key: string
  url: string
  contentType: string
  size: number
  width: number | null
  height: number | null
  originalName: string
  alt: string | null
  createdById: string | null
  createdAt: Date
  createdBy?: { id: string; name: string } | null
}): MediaAssetDto {
  return {
    id: row.id,
    key: row.key,
    url: row.url,
    contentType: row.contentType,
    size: row.size,
    width: row.width,
    height: row.height,
    originalName: row.originalName,
    alt: row.alt,
    createdById: row.createdById,
    createdByName: row.createdBy?.name ?? null,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function registerMedia(
  input: RegisterMediaInput,
  userId: string | null,
): Promise<MediaAssetDto> {
  const created = await prisma.mediaAsset.upsert({
    where: { key: input.key },
    create: {
      key: input.key,
      url: input.url,
      contentType: input.contentType,
      size: input.size,
      width: input.width ?? null,
      height: input.height ?? null,
      originalName: input.originalName,
      alt: input.alt ?? null,
      createdById: userId,
    },
    update: {
      url: input.url,
      contentType: input.contentType,
      size: input.size,
      width: input.width ?? null,
      height: input.height ?? null,
      originalName: input.originalName,
    },
    include: { createdBy: { select: { id: true, name: true } } },
  })
  logger.info({ tag: 'audit:media', action: 'CREATE', id: created.id, userId }, 'media registered')
  return toDto(created)
}

export async function listMedia(query: MediaListQuery): Promise<MediaListResponse> {
  const { page, pageSize, search } = query
  const where = search
    ? {
        OR: [
          { originalName: { contains: search, mode: 'insensitive' as const } },
          { alt: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [total, items] = await Promise.all([
    prisma.mediaAsset.count({ where }),
    prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { createdBy: { select: { id: true, name: true } } },
    }),
  ])

  return {
    items: items.map(toDto),
    total,
    page,
    pageSize,
  }
}

export async function updateMedia(id: string, input: UpdateMediaInput): Promise<MediaAssetDto> {
  const exists = await prisma.mediaAsset.findUnique({ where: { id } })
  if (!exists) throw httpErrors.notFound('Mídia não encontrada')

  const updated = await prisma.mediaAsset.update({
    where: { id },
    data: { alt: input.alt ?? null },
    include: { createdBy: { select: { id: true, name: true } } },
  })
  return toDto(updated)
}

export async function deleteMedia(id: string, userId: string | null): Promise<void> {
  const exists = await prisma.mediaAsset.findUnique({ where: { id } })
  if (!exists) throw httpErrors.notFound('Mídia não encontrada')

  // best-effort delete no S3/MinIO; não falha se objeto sumiu
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: exists.key }))
  } catch (err) {
    logger.warn({ err, key: exists.key }, 'falha ao deletar objeto no S3 — registro removido mesmo assim')
  }
  await prisma.mediaAsset.delete({ where: { id } })
  logger.info({ tag: 'audit:media', action: 'DELETE', id, userId }, 'media deleted')
}
