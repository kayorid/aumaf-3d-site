import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import { EnumChangefreq } from 'sitemap'

export default defineConfig({
  site: 'https://aumaf3d.com.br',
  output: 'static',
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
