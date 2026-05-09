/**
 * Migration script: extrai conteúdo dos 6 posts estáticos do frontend-public
 * e popula o banco via Prisma. Idempotente — re-rodar não duplica.
 *
 * Uso: npm run migrate:posts (no backend) ou
 *      npx tsx scripts/migrate-posts/index.ts
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PutObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3'
import fs from 'node:fs/promises'
import path from 'node:path'
import { s3 } from '../../src/lib/s3-client'
import { env } from '../../src/config/env'
import { slugify } from '../../src/lib/slug'
import type { LegacyPost, LegacyPostCoverImage } from './types'

import { post as p1 } from './posts/01-fdm-vs-sla-vs-sls'
import { post as p2 } from './posts/02-guia-materiais-impressao-3d'
import { post as p3 } from './posts/03-formula-sae-case-study-completo'
import { post as p4 } from './posts/04-engenharia-reversa-passo-a-passo'
import { post as p5 } from './posts/05-formula-sae-usp-sao-carlos'
import { post as p6 } from './posts/06-construtora-arabe-edificio-mais-alto'

const POSTS: LegacyPost[] = [p1, p2, p3, p4, p5, p6]

const prisma = new PrismaClient()

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..')

async function ensureBucket(): Promise<void> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }))
  } catch {
    console.log(`Criando bucket ${env.S3_BUCKET}...`)
    await s3.send(new CreateBucketCommand({ Bucket: env.S3_BUCKET }))
  }
}

const uploadCache = new Map<string, string>()

async function uploadCover(cover: LegacyPostCoverImage): Promise<string> {
  if (uploadCache.has(cover.filename)) return uploadCache.get(cover.filename)!

  // Se a imagem já está em frontend-public/public/images/, usa caminho relativo:
  // ela é servida diretamente como asset estático pelo site público, sem precisar
  // do MinIO (cuja rota /media/ não é exposta pelo Caddy em produção).
  const PUBLIC_IMAGES_PREFIX = 'frontend-public/public/images/'
  if (cover.localPath.startsWith(PUBLIC_IMAGES_PREFIX)) {
    const publicUrl = `/images/${cover.filename}`
    uploadCache.set(cover.filename, publicUrl)
    console.log(`  ↪ Imagem ${cover.filename} → ${publicUrl} (servida pelo site público)`)
    return publicUrl
  }

  const filePath = path.resolve(REPO_ROOT, cover.localPath)
  const body = await fs.readFile(filePath)
  const key = `migrated/${cover.filename}`
  const ext = path.extname(cover.filename).toLowerCase()
  const contentType =
    ext === '.avif'
      ? 'image/avif'
      : ext === '.webp'
        ? 'image/webp'
        : ext === '.png'
          ? 'image/png'
          : 'image/jpeg'

  await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  )

  const publicUrl = `${env.S3_PUBLIC_URL.replace(/\/$/, '')}/${env.S3_BUCKET}/${key}`
  uploadCache.set(cover.filename, publicUrl)
  console.log(`  ↑ Imagem ${cover.filename} → ${publicUrl}`)
  return publicUrl
}

async function getOrCreateCategory(name: string): Promise<string> {
  const slug = slugify(name)
  const cat = await prisma.category.upsert({
    where: { slug },
    create: { name, slug },
    update: {},
  })
  return cat.id
}

async function getAdminId(): Promise<string> {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) throw new Error('Nenhum admin encontrado — rode npm run prisma:seed primeiro')
  return admin.id
}

async function migratePost(post: LegacyPost, adminId: string): Promise<void> {
  const categoryId = await getOrCreateCategory(post.category)
  const coverImageUrl = post.coverImage ? await uploadCover(post.coverImage) : null

  const data = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl,
    status: 'PUBLISHED' as const,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    publishedAt: post.publishedAt,
    readingTimeMin: post.readingTimeMin,
    featured: post.featured,
    tags: post.tags,
    categoryId,
    authorId: adminId,
    generatedByAi: false,
  }

  await prisma.post.upsert({
    where: { slug: post.slug },
    create: data,
    update: data,
  })

  console.log(`  ✓ ${post.slug} (${post.category}, ${post.readingTimeMin}min, featured=${post.featured})`)
}

async function main() {
  console.log('🔧 Migração de posts estáticos → banco\n')

  await ensureBucket()
  const adminId = await getAdminId()
  console.log(`✓ Admin: ${adminId}\n`)

  console.log(`📚 Migrando ${POSTS.length} posts:`)
  for (const post of POSTS) {
    await migratePost(post, adminId)
  }

  const total = await prisma.post.count()
  console.log(`\n✅ Migração concluída. Total de posts no banco: ${total}`)
}

main()
  .catch((err) => {
    console.error('❌ Migração falhou:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
