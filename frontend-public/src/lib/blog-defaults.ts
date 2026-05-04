/**
 * Mapeamento determinístico categoria → capa default.
 * Usado quando `post.coverImageUrl` é nulo, garantindo que nenhum card de blog
 * fique sem imagem (evita layout shift e quebra do tom visual da listagem).
 *
 * Os slugs aqui devem espelhar o seed em `backend/prisma/seed.ts` (CATEGORIES).
 */

const DEFAULTS_BY_SLUG: Record<string, string> = {
  'guia-tecnico': '/images/blog-default-guia-tecnico.webp',
  'materiais':    '/images/blog-default-materiais.webp',
  'case-study':   '/images/blog-default-case-study.webp',
  'engenharia':   '/images/blog-default-engenharia.webp',
  'parceria':     '/images/blog-default-parceria.webp',
  'inovacao':     '/images/blog-default-inovacao.webp',
  'tutorial':     '/images/blog-default-tutorial.webp',
}

const FALLBACK = '/images/blog-default-fallback.webp'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Resolve a capa de um post, preferindo a imagem própria (`coverImageUrl`).
 * Aceita tanto categoria por slug ("case-study") quanto por nome ("Case Study").
 */
export function resolveCoverImage(
  coverImageUrl: string | null | undefined,
  category?: { slug?: string; name?: string } | string | null,
): string {
  if (coverImageUrl) return coverImageUrl
  return defaultByCategory(category)
}

export function defaultByCategory(
  category?: { slug?: string; name?: string } | string | null,
): string {
  if (!category) return FALLBACK
  const raw =
    typeof category === 'string'
      ? category
      : category.slug ?? (category.name ? slugify(category.name) : '')
  if (!raw) return FALLBACK
  const slug = slugify(raw)
  return DEFAULTS_BY_SLUG[slug] ?? FALLBACK
}
