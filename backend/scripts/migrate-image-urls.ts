/**
 * Migra URLs de imagens (Post.coverImageUrl + MediaAsset.url) do formato
 * presigned/MinIO direto antigo para o novo proxy público do backend.
 *
 *   ANTES: http://minio:9000/aumaf-blog-images/posts/<key>
 *          http://localhost:9000/aumaf-blog-images/posts/<key>
 *          https://minio.exemplo/aumaf-blog-images/posts/<key>
 *   DEPOIS: <BACKEND_URL>/api/v1/files/posts/<key>
 *
 * É idempotente: URLs que já apontam para /api/v1/files/ são preservadas.
 *
 * Uso (local):  npx tsx backend/scripts/migrate-image-urls.ts
 * Uso (prod):   docker compose run --rm backend node dist/scripts/migrate-image-urls.js
 *               (após build) — ou tsx via ts-node se disponível.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const BACKEND_URL = (process.env.BACKEND_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const BUCKET = process.env.S3_BUCKET ?? 'aumaf-blog-images'
const NEW_PREFIX = `${BACKEND_URL}/api/v1/files/`
// Captura qualquer URL no formato <scheme>://<host>[:port]/<bucket>/<key>
const OLD_RE = new RegExp(`^https?://[^/]+/${BUCKET}/(.+?)(\\?.*)?$`)

function rewrite(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.includes('/api/v1/files/')) return url // já migrado
  const m = OLD_RE.exec(url)
  if (!m) return url // formato desconhecido — preserva
  const key = m[1]
  return `${NEW_PREFIX}${key}`
}

async function main() {
  console.log(`Migrando URLs para prefixo: ${NEW_PREFIX}`)
  console.log(`Bucket esperado: ${BUCKET}\n`)

  // Posts
  const posts = await prisma.post.findMany({
    where: { coverImageUrl: { not: null } },
    select: { id: true, slug: true, coverImageUrl: true },
  })
  let postsUpdated = 0
  for (const p of posts) {
    const next = rewrite(p.coverImageUrl)
    if (next && next !== p.coverImageUrl) {
      await prisma.post.update({ where: { id: p.id }, data: { coverImageUrl: next } })
      console.log(`  ✓ post ${p.slug}: ${p.coverImageUrl} → ${next}`)
      postsUpdated++
    }
  }
  console.log(`Posts: ${postsUpdated}/${posts.length} atualizados\n`)

  // MediaAssets
  const media = await prisma.mediaAsset.findMany({
    select: { id: true, key: true, url: true },
  })
  let mediaUpdated = 0
  for (const m of media) {
    const next = rewrite(m.url)
    if (next && next !== m.url) {
      await prisma.mediaAsset.update({ where: { id: m.id }, data: { url: next } })
      console.log(`  ✓ media ${m.key}: ${m.url} → ${next}`)
      mediaUpdated++
    }
  }
  console.log(`Media: ${mediaUpdated}/${media.length} atualizados`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
