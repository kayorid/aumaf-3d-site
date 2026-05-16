---
name: analytics-tagging
description: Use SEMPRE que estiver criando ou editando um CTA, botão, link de navegação, card de conteúdo, formulário, modal ou nova página no frontend-public ou no frontend-admin da AUMAF 3D. Garante que o evento será capturado pelo pipeline de analytics próprio (POST /v1/analytics/collect). Acione também quando o usuário falar "novo botão", "novo CTA", "novo form", "novo modal", "nova página", "novo card", "tracking", "tagueamento", "analytics".
---

# Analytics Tagging — AUMAF 3D

Esta skill garante que **nenhuma interação importante do site fique fora do analytics próprio**. Toda vez que você adicionar um CTA, link, formulário, modal ou página, **você é responsável por taguear**.

## Pipeline em uma frase

```
[browser data-track] → POST /v1/analytics/collect (sendBeacon) → BullMQ ingest → PostgreSQL raw
                                                                              → cron roll-up → tabelas agregadas → dashboard /analytics
```

Detalhes completos: `docs/plans/2026-05-12-analytics-layer-design.md`.

## Como taguear (90% dos casos)

Adicione `data-track="<event_name>"` ao elemento que dispara a interação. O SDK captura cliques globalmente via event delegation — você não precisa importar nada.

```html
<a
  href="/contato"
  data-track="cta_quote_hero"
  data-track-location="navbar"
>Pedir orçamento</a>
```

Atributos extras `data-track-*` viram `properties` do evento (kebab → camelCase):
- `data-track-location="navbar"` → `properties.location = 'navbar'`
- `data-track-slug="x"` → `properties.slug = 'x'`

## Como taguear formulários

Adicione `data-track-form` ao `<form>`:

```html
<form id="contact-form" data-track-form="contact_form">…</form>
```

O SDK dispara automaticamente:
- `form_start` — primeiro focus em campo
- `form_submit` — submit do formulário

Para `form_error`, chame manualmente:

```ts
import { track } from '@aumaf/analytics-sdk'
track('form_error', 'contact_form', { field: 'email', reason: 'invalid' })
```

## Como taguear modais

```ts
import { track } from '@aumaf/analytics-sdk'
function openMaterialModal(slug: string) {
  track('modal_open', 'material_modal', { material: slug })
  // ...
}
```

## Identificar lead (server-side correlação)

Quando o lead é criado no `/contato`, dispare `identify` para correlacionar a sessão:

```ts
import { identify } from '@aumaf/analytics-sdk'
// após resposta 201 do POST /v1/leads
identify({ leadId: response.data.id })
```

## Checklist obrigatório ao criar feature nova

```
□ Os botões/links/cards têm data-track="<nome_do_evento>"?
□ O nome do evento está no catálogo em packages/shared/src/schemas/analytics.ts?
  → Se não, adicione em ANALYTICS_EVENT_NAMES (manter sort alfabético por bloco).
□ Forms têm data-track-form="<nome>"?
□ Modais disparam track('modal_open', ...) na abertura?
□ Lead criado dispara identify({ leadId })?
□ Se for métrica nova de funil → atualizar funnel "lead_conversion" em
  backend/src/services/analytics-rollup.service.ts (funnelSteps).
□ Se for KPI/card novo no dashboard → adicionar em
  frontend-admin/src/features/analytics/pages/AnalyticsPage.tsx.
□ Rodar npm run typecheck nos workspaces afetados.
```

## Catálogo de tipos canônicos

`ANALYTICS_EVENT_TYPES` (vivem em `@aumaf/shared/schemas/analytics`):

| Tipo | Quando usar |
|---|---|
| `pageview` | Automático — não disparar manualmente |
| `click` | Cliques em CTA/card/link tagueado |
| `scroll` | Automático (25/50/75/100%) |
| `engagement` | Automático (time-on-page milestones) |
| `form_start` / `form_submit` / `form_error` | Formulários |
| `modal_open` / `modal_close` | Modais e drawers |
| `download` | Click em link de arquivo (.pdf, .stl, .step) |
| `outbound` | Automático — clicks em hosts diferentes |
| `identify` | Pós-criação de lead |
| `custom` | Eventos ad-hoc — preferir tipos acima |

## Catálogo de nomes (atual)

Veja `ANALYTICS_EVENT_NAMES` em `packages/shared/src/schemas/analytics.ts`. Resumo:

- CTAs: `cta_whatsapp_fab`, `cta_whatsapp_header`, `cta_whatsapp_footer`, `cta_quote_hero`, `cta_quote_material`, `cta_quote_portfolio`
- Navegação: `nav_link`, `footer_link`
- Conteúdo: `portfolio_card`, `blog_post_card`, `review_card`, `instagram_post`, `social_link`
- Engajamento: `depth`, `time_on_page`
- Form: `contact_form`
- Modais: `material_modal`, `portfolio_modal`

**Se o nome que você precisa não está aqui, ADICIONE no catálogo antes de usar.** Strings cruas em `data-track` são aceitas, mas não aparecem no dashboard com nome amigável e quebram detecção de cliques pelo audit script.

## Auditoria manual

Para checar CTAs sem tagging em todo o repo:

```bash
scripts/analytics-audit.sh
```

Para checar um arquivo específico (também roda no hook PostToolUse):

```bash
scripts/analytics-tagging-check.sh frontend-public/src/pages/index.astro
```

## Anti-padrões

| Ruim | Bom |
|---|---|
| `<a href="/contato">Falar</a>` (sem tag) | `<a href="/contato" data-track="cta_quote_hero">Falar</a>` |
| `data-track="botao verde"` (string crua, com espaço) | `data-track="cta_quote_hero"` (do catálogo, snake_case) |
| `track('clique_botao', null)` | `track('click', 'cta_quote_hero', { location: 'hero' })` |
| Forms sem `data-track-form` | Forms sempre com nome (auto-track start/submit) |
| Tag duplicada em wrapper E criança | Tague o elemento clicável raiz, uma vez só |

## Quando NÃO taguear

- Elementos puramente decorativos (ícones aria-hidden, separadores)
- Links em rodapé legais (privacidade, termos) — não são CTAs
- Botões internos do admin que não geram métrica de negócio (paginação, sort)
