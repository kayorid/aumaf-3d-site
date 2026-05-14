# Plano — SEO Improvements AUMAF 3D

**Data**: 2026-05-13 · **Prazo**: 1 sprint (~6h)

## Objetivo
Fechar gaps de acessibilidade (alt text), corrigir robots.txt, adicionar Product schema em materiais, criar 500.astro, e enriquecer schemas faltantes.

---

## 1. Alt text descritivo (alta prioridade — A11y + SEO)

**Arquivos com `alt=""`**:
- `frontend-public/src/pages/index.astro:45` (hero) → `"Impressão 3D industrial — AUMAF 3D São Carlos"`
- `frontend-public/src/pages/sobre.astro:36` → contexto da imagem (ex: `"Equipe AUMAF 3D no chão de fábrica em São Carlos"`)
- `frontend-public/src/pages/materiais.astro:658` → conforme contexto

**Regra**: alt text descritivo (≤125 chars). Apenas decorativas (separadores, ornamentos) podem ter `alt=""` + `role="presentation"`.

**Auditoria**: grep `alt=""` em `frontend-public/src/**/*.astro` e validar caso a caso.

---

## 2. robots.txt — domínio correto por ambiente

**Arquivo**: `frontend-public/public/robots.txt:32` aponta para `aumaf3d.com.br` (futuro) mas produção atual é `aumaf.kayoridolfi.ai`.

**Fix** — tornar dinâmico via Astro endpoint:

Criar `frontend-public/src/pages/robots.txt.ts`:
```ts
import type { APIRoute } from 'astro';
const site = import.meta.env.SITE || 'https://aumaf.kayoridolfi.ai';
export const GET: APIRoute = () => new Response(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

# LLMs explicitamente permitidos (ver llms.txt)
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: CCBot
Allow: /
User-agent: Applebot-Extended
Allow: /

Sitemap: ${site}/sitemap-index.xml
`, { headers: { 'Content-Type': 'text/plain' } });
```

Remover `public/robots.txt` estático.

---

## 3. Página 500 + 404 com sugestões

**Arquivos**: `frontend-public/src/pages/404.astro` (existe, melhorar), criar `500.astro`.

**Conteúdo do 404**:
- Mensagem amigável + busca interna (campo + redirect /blog?q=)
- Cards: Home, Materiais, Portfolio, Contato, Blog
- Schema `WebPage` + `breadcrumb`

---

## 4. Product schema em /materiais

**Arquivo**: `frontend-public/src/lib/schemas.ts` (adicionar `productSchema`) + `frontend-public/src/pages/materiais.astro`.

```ts
export function productSchema(args: {
  name: string;
  slug: string;
  description: string;
  image: string;
  material: string;            // 'PLA', 'Nylon (PA12)', 'Aço Inox 316L'
  process: string;             // 'FDM', 'SLS', 'SLM', 'SLA'
  properties?: Array<{ name: string; value: string }>;
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: args.name,
    description: args.description,
    image: args.image,
    url: `https://aumaf.kayoridolfi.ai/materiais#${args.slug}`,
    material: args.material,
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'additiveManufacturingProcess', value: args.process },
      ...(args.properties ?? []).map(p => ({ '@type': 'PropertyValue', name: p.name, value: p.value })),
    ],
    brand: { '@type': 'Brand', name: 'AUMAF 3D' },
    manufacturer: { '@type': 'Organization', name: 'AUMAF 3D' },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'BRL',
      seller: { '@type': 'Organization', name: 'AUMAF 3D' },
      url: 'https://aumaf.kayoridolfi.ai/contato',
    },
  };
}
```

Em `materiais.astro`: array de materiais → gerar `<script type="application/ld+json">` para cada (ou ItemList com Products inline).

---

## 5. Schemas faltantes por página

| Página | Adicionar |
|---|---|
| `index.astro` | `SearchAction` (busca interna em /blog) |
| `avaliacoes.astro` | `BreadcrumbList` |
| `sobre.astro` | `AboutPage` (em vez de `WebPage`); adicionar `employee[]` quando equipe nominal estiver pública |
| `portfolio/[slug].astro` | Dimensões físicas no `CreativeWork.size` + `material` |
| Páginas legais | `dateModified` real (não hoje sempre) — manter em frontmatter |

---

## 6. Blog SSG (prerender)

**Arquivo**: `frontend-public/src/pages/blog/[slug].astro`.

**Fix**: usar `getStaticPaths()` para buscar todos posts publicados em build time + `export const prerender = true`. Posts rascunho/preview continuam SSR (rota separada `/blog/preview/[slug]`).

**Trigger de rebuild**: webhook do backend ao publicar post chama `/v1/cache/rebuild-blog` que dispara `npm run build` no container public (ou ISR via Astro 5 — verificar suporte do adapter Node).

Alternativa simples: manter SSR + Cache-Control `s-maxage=300` no Caddy.

---

## 7. Sitemap — lastmod real

**Arquivo**: `frontend-public/astro.config.ts` (integration sitemap).

**Fix**: usar `lastmod` real do post (`updatedAt`) em vez de `new Date()`:
```ts
sitemap({
  serialize: (item) => {
    if (item.url.includes('/blog/')) {
      // buscar updatedAt do post via API + cache
    }
    return item;
  }
})
```

---

## 8. hreflang (futuro multilíngue)

**Decisão**: incluir `<link rel="alternate" hreflang="pt-BR" href={canonical} />` em `SEO.astro` desde já. Sem custo, prepara para EN futuro.

---

## Critérios de aceitação

- [ ] 0 imagens com `alt=""` (exceto decorativas marcadas com `role="presentation"`)
- [ ] `robots.txt` em produção retorna domínio correto
- [ ] Schema Validator (validator.schema.org) verde para: home, /sobre, /materiais, /servicos, /blog/[slug], /faq, /avaliacoes
- [ ] Google Rich Results Test verde para FAQPage, LocalBusiness, Article, Product
- [ ] PageSpeed Insights: SEO ≥ 95
- [ ] 404 e 500 com links de retorno funcionais
