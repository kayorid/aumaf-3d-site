import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import node from '@astrojs/node'
import { EnumChangefreq } from 'sitemap'
import { fetchPublicSlugs } from './src/lib/api'

// Em build time, busca slugs publicados para incluir no sitemap.
// Falha silenciosa se o backend não estiver disponível.
async function dynamicBlogPages(): Promise<string[]> {
  try {
    const slugs = await fetchPublicSlugs()
    return slugs.map((s) => `https://aumaf3d.com.br/blog/${s}`)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[sitemap] Falha ao buscar slugs do backend:', (err as Error).message)
    return []
  }
}

export default defineConfig({
  site: 'https://aumaf3d.com.br',
  // output: 'server' — todas as páginas são SSR por padrão.
  // Páginas estáticas (home, servicos etc.) marcadas com `export const prerender = true`.
  // Blog (/blog, /blog/[slug]) é SSR puro: cada F5 busca da API e reflete edições imediatamente.
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap({
      changefreq: EnumChangefreq.WEEKLY,
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes('/v2/'),
      customPages: await dynamicBlogPages(),
      serialize(item) {
        const url = item.url
        if (url === 'https://aumaf3d.com.br/') {
          return { ...item, priority: 1.0, changefreq: EnumChangefreq.WEEKLY }
        }
        if (url.includes('/contato') || url.includes('/servicos')) {
          return { ...item, priority: 0.9, changefreq: EnumChangefreq.MONTHLY }
        }
        if (url.includes('/blog/') && !url.endsWith('/blog/')) {
          return { ...item, priority: 0.8, changefreq: EnumChangefreq.MONTHLY }
        }
        if (url.endsWith('/blog/')) {
          return { ...item, priority: 0.85, changefreq: EnumChangefreq.WEEKLY }
        }
        if (url.includes('/portfolio') || url.includes('/materiais') || url.includes('/faq')) {
          return { ...item, priority: 0.75, changefreq: EnumChangefreq.MONTHLY }
        }
        return item
      },
    }),
  ],
  vite: {
    resolve: {
      alias: {
        '@aumaf/shared': '../packages/shared/src/index.ts',
      },
    },
    build: {
      cssMinify: 'lightningcss',
    },
  },
})
