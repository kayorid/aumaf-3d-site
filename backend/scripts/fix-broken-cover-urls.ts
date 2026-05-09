/**
 * Repara coverImageUrl de posts que apontam para o MinIO via rota /media/
 * (que não é exposta pelo Caddy em produção, retornando 404).
 *
 * Detecta filenames que existem em frontend-public/public/images/ e troca
 * para o caminho relativo /images/<filename>, idempotente.
 *
 * Uso: npx tsx backend/scripts/fix-broken-cover-urls.ts
 */
import { PrismaClient } from '@prisma/client'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const prisma = new PrismaClient()
const REPO_ROOT = path.resolve(__dirname, '..', '..')
const PUBLIC_IMAGES_DIR = path.join(REPO_ROOT, 'frontend-public', 'public', 'images')

async function imageExistsInPublic(filename: string): Promise<boolean> {
  try {
    await fs.access(path.join(PUBLIC_IMAGES_DIR, filename))
    return true
  } catch {
    return false
  }
}

async function main() {
  const broken = await prisma.post.findMany({
    where: { coverImageUrl: { contains: '/media/' } },
    select: { id: true, slug: true, coverImageUrl: true },
  })

  if (broken.length === 0) {
    console.log('Nenhum post com coverImageUrl quebrado. Nada a fazer.')
    return
  }

  console.log(`Encontrados ${broken.length} posts com coverImageUrl em /media/:`)
  let fixed = 0
  for (const post of broken) {
    const filename = path.basename(post.coverImageUrl ?? '')
    const exists = await imageExistsInPublic(filename)
    if (!exists) {
      console.log(`  ⚠ ${post.slug}: ${filename} não existe em frontend-public/public/images/ — pulando`)
      continue
    }
    const newUrl = `/images/${filename}`
    await prisma.post.update({ where: { id: post.id }, data: { coverImageUrl: newUrl } })
    console.log(`  ✓ ${post.slug}: → ${newUrl}`)
    fixed++
  }
  console.log(`\nConcluído. ${fixed}/${broken.length} posts atualizados.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
