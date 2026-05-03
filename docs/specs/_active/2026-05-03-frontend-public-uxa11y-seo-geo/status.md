---
feature: frontend-public-uxa11y-seo-geo
created: 2026-05-03
last_updated: 2026-05-03T12:07-03:00
---

# Status

**Fase atual:** validate (concluído) — pronto para fechamento

## Decisões

| Data | Decisão | Razão | Link |
|---|---|---|---|
| 2026-05-03 | Não migrar Material Symbols para self-host nesta fase | Ganho marginal; foco em a11y/SEO/GEO | design.md D20 |
| 2026-05-03 | OG image inicial em SVG (não PNG) | Evita pipeline binário; aceitável em redes modernas; PNG follow-up | design.md D13 |
| 2026-05-03 | Schema com pattern `@graph` único por página | Menos parser overhead, melhor para Google | design.md D1 |
| 2026-05-03 | Manter posts hardcoded em `.astro` | Migração para Content Collections é escopo Q2 | requirements.md US-Q4 |
| 2026-05-03 | Manter `text-white/X` decorativos com `aria-hidden` | Separadores `/` em Breadcrumb são decorativos; não são lidos por leitores de tela | global scan |

## Resultado da validação

- ✅ `npm run build` clean — 15 páginas geradas em ~4s
- ✅ `npm run typecheck` clean — 0 errors / 0 warnings (1 hint de tipos do Astro `set:html`, ignorável)
- ✅ `dist/sitemap-0.xml` — 15 URLs (13 institucionais + 2 stub do `[slug].astro`)
- ✅ Schema JSON-LD presente em todas as páginas via `@graph`
- ✅ Schemas específicos validados por inspeção:
  - `/faq`: 14 Question + 14 Answer + FAQPage + Organization + LocalBusiness + WebSite + WebPage + BreadcrumbList
  - `/servicos`: 4 Service + HowTo + 6 HowToSteps + ItemList + breadcrumb
  - `/blog/<post>`: BlogPosting + ImageObject + BreadcrumbList + Organization + LocalBusiness
  - `/portfolio`, `/materiais`: CollectionPage + ItemList + breadcrumb
- ✅ `public/robots.txt` criado (libera AI crawlers + sitemap pointer)
- ✅ `public/og/og-default.svg` criado (1200×630, branding AUMAF 3D)
- ✅ Skip-link, `<main id="main-content">`, `:focus-visible` global, `prefers-reduced-motion`
- ✅ Form `/contato` totalmente acessível: labels associadas, `autocomplete`, `aria-describedby`, `role="radiogroup"`/`radio` para tipos, `aria-busy` no submit, success com foco programático
- ✅ Accordion FAQ acessível: `aria-expanded` + `aria-controls` + `<region>` + `hidden` + ArrowKey navigation no filter
- ✅ Filter pills (portfolio, materiais, faq) como `radiogroup`/`radio` com `aria-checked` + setas de teclado + contador `aria-live`
- ✅ Breadcrumb estrutural em todas as páginas (component `Breadcrumb.astro` + schema `BreadcrumbList`)
- ✅ Posts de blog com `<time datetime>`, share cluster (WhatsApp + LinkedIn + X + copy link), Cover com `width`/`height`/`loading`/`decoding`/`fetchpriority`

## Perguntas em aberto

Nenhuma.

## Blockers

Nenhum.

## Próximo passo concreto

Mover para `_completed/`, escrever `retrospective.md`, atualizar `INDEX.md` e `HISTORY.md`.

## Pontos para follow-up futuro (fora desta fase)

- PNG export do OG image (atualmente SVG; algumas redes pode preferir PNG)
- Self-host de Material Symbols com subset (economia de ~80KB)
- Migrar posts de `.astro` para Content Collections (sincroniza com Q2 backoffice)
- Imagens OG por categoria de blog
- Dados quantitativos no formato `<data value>` (semântica adicional)
- Testes E2E com Playwright para o público (atualmente só no admin)
