# Google Reviews — Plano de Implementação

**Status:** ✅ Pronto para executar (aguardando go do Kayo)
**Criado:** 2026-05-09
**Branch sugerida:** `feat/google-reviews` (a partir de `master`)
**Decisão:** Featurable (proxy legal da Google Business Profile API) consumido via JSON no SSR do Astro, renderizado com componentes próprios no DS Cinematic Additive Manufacturing.

> ### ⚠️ Princípio inegociável: zero estilo Featurable no site
> Featurable é **APENAS fonte de dados** (JSON). **NÃO** carregar `<script>` do Featurable, **NÃO** usar iframe, **NÃO** importar CSS deles. Todo o visual é nosso: tokens do DS Cinematic Additive Manufacturing, fontes Pirulen, paleta laranja `primary-container`, glassmorphism `nav-glass`/`glass-panel`, tipografia `text-headline-*`/`text-label-caps`, espaçamentos `py-section`/`px-edge`. O site nunca deve "cheirar" Featurable — visualmente é indistinguível dos outros componentes do AUMAF 3D.

---

## 0. Contexto e dados confirmados

- **Place AUMAF 3D:** FID `0x94b8713868586eb9:0x86017404926c4521`, CID `9655082316416517921`.
- **Featurable widget:** `a12efbda-f40b-48fc-a8ff-724e904bee9d`.
- **Endpoint:** `https://featurable.com/api/v2/widgets/{WIDGET_ID}` (público, GET, sem auth).
- **Resumo agregado:** rating **4.8★**, **11 reviews totais**, 6 retornadas pela API.
- **Idioma:** API entrega `originalText` em pt-BR (usar este, ignorar `text` que vem traduzido).
- **Write review URL:** vem pronta em `widget.gbpLocationSummary.writeAReviewUri` — não precisamos compor à mão.

### Shape relevante da resposta
```ts
{
  success: true,
  widget: {
    uuid: string,
    config: { layout, language, ... },
    reviews: Array<{
      id: string,
      platform: 'gbp',
      author: { name: string, avatarUrl: string | null, profileUrl: string | null },
      title: string | null,
      text: string,            // tradução (ignorar)
      originalText: string,    // <- usar este (pt-BR)
      languageCode: string,
      rating: { value: number, max: number },
      publishedAt: string (ISO),
      url: string | null
    }>,
    gbpLocationSummary: {
      reviewsCount: number,    // total agregado (ex: 11)
      rating: number,          // 4.8
      writeAReviewUri: string  // link "deixe sua avaliação"
    }
  }
}
```

---

## 1. Princípios e decisões

| Decisão | Escolha | Motivo |
|---|---|---|
| Fonte de dados | Featurable (não scraping, não Places API direto) | Free, legal, bypassa setup do Google Cloud, mantém porta aberta pra migrar pra API oficial depois sem refazer componentes |
| Onde fetcha | SSR no Astro (não client) | Performance, SEO, evita CORS, esconde widget ID em build (não em runtime) |
| Cache | HTTP `Cache-Control: s-maxage=21600, stale-while-revalidate=86400` (6h fresh, 24h stale) + `fetch` com `cache: 'force-cache'` | Reduz chamadas externas; Featurable já cacheia mas backup |
| Idioma | `originalText` (pt-BR) | Site é pt-BR; texto traduzido fica robotizado |
| Filtro de rating | **Mostrar todas** (sem filtro por nota) | ToS Google: filtrar pode ser visto como manipulação. Hoje todas são 5★ mesmo |
| Quantidade home | 3 cards + CTA "ver todas" → /avaliacoes | Não competir com o carrossel de depoimentos custom existente |
| Quantidade footer | rating médio + 2 trechos rotativos curtos (CSS-only, `animation`) | Compacto, sem JS pesado |
| Quantidade /avaliacoes | Todas (6) + agregado + CTA | Página dedicada justifica completude |
| Fallback | Se fetch falhar → seção colapsa ou mostra só CTA "Ver no Google Maps" | Site nunca quebra por dependência externa |
| Hidratação | Tudo SSR estático; só carrossel de depoimentos do footer usa CSS animation | Zero JS adicional |
| Nome do menu | "Avaliações" | Termo PT-BR mais natural que "Reviews" ou "Depoimentos" (esse já existe na home) |

---

## 2. Branch + arquivos

### 2.1 Branch
```bash
git checkout master
git pull
git checkout -b feat/google-reviews
```

⚠️ **NÃO** sair da branch atual (`ui/styled-select-and-model-picker`) que tem trabalho paralelo do Kayo.

### 2.2 Arquivos NOVOS (zero risco de conflito)

| Caminho | Responsabilidade |
|---|---|
| `frontend-public/src/lib/google-reviews.ts` | `fetchReviews()` — fetch + parse + types + fallback. Exporta `ReviewsData` e `getReviews()` async. |
| `frontend-public/src/components/reviews/ReviewCard.astro` | Card individual: avatar (ou inicial), nome, estrelas, data relativa pt-BR, texto truncado em ~220ch + "ler mais" → permalink ou Maps. |
| `frontend-public/src/components/reviews/ReviewStars.astro` | Renderiza 5 estrelas (sólidas/contornadas). Reutilizado em todos os contextos. |
| `frontend-public/src/components/reviews/ReviewsHomeWidget.astro` | Seção home: header (rating médio grande + total + "Avaliações Google"), 3 cards em grid responsivo, CTA "Ver todas" → /avaliacoes + CTA secundário "Avalie no Google" → writeAReviewUri. |
| `frontend-public/src/components/reviews/ReviewsFooterWidget.astro` | Bloco footer compacto: ⭐4.8 · 11 avaliações · trecho rotativo (CSS animation) · link "Ver no Google". |
| `frontend-public/src/pages/avaliacoes.astro` | Página completa: hero curto (rating + total + CTA write), grid completo, seção "como deixar uma avaliação" (passo a passo curto + screenshot opcional do Maps), CTA final. |

### 2.3 Arquivos EDITADOS (aditivo, mínimo)

| Caminho | Mudança | Linha aprox |
|---|---|---|
| `frontend-public/src/components/Navbar.astro` | Adicionar `{ href: '/avaliacoes', label: 'Avaliações' }` no array `links` (entre Sobre e Blog) | 11 |
| `frontend-public/src/components/Footer.astro` | (a) adicionar `/avaliacoes` no array `links` (entre Sobre e Contato). (b) Em uma das colunas (ou nova linha acima do bottom-bar) renderizar `<ReviewsFooterWidget />`. | 12 e ~125 |
| `frontend-public/src/pages/index.astro` | Importar e inserir `<ReviewsHomeWidget />` **entre o carrossel de depoimentos (linha 693) e a seção CTA final (linha 861)**. Justificativa: depoimentos atuais são custom escolhidos; Google Reviews complementa com prova social externa verificável. | 1–25 (import) e ~860 |

> Edits usarão `Edit` com contexto largo (≥3 linhas antes/depois) pra não conflitar com mudanças paralelas.

---

## 3. Tipos e contrato (`google-reviews.ts`)

```ts
export interface Review {
  id: string
  authorName: string
  authorAvatar: string | null
  rating: number              // 1..5
  text: string                // originalText
  publishedAt: string         // ISO
  permalink: string | null    // url do Featurable, se existir
}

export interface ReviewsData {
  rating: number              // 4.8
  totalCount: number          // 11
  reviews: Review[]
  writeReviewUrl: string
  placeUrl: string            // link do Google Maps (composto via CID)
}

export async function getReviews(): Promise<ReviewsData | null>
```

- Endpoint hardcoded em `import.meta.env.PUBLIC_FEATURABLE_WIDGET_ID` com fallback para o UUID conhecido (não é segredo, é público).
- Em caso de erro: log via `console.warn` + retorna `null` (componentes tratam null como "esconder seção" ou mostrar fallback).
- Timeout de 5s no fetch (AbortController).
- `cache: 'force-cache'` + revalidate via timestamp em memory (build time só pega 1x).

---

## 4. Estilo visual — DS Cinematic Additive Manufacturing

### 4.1 Tokens já existentes que vamos usar
- `bg-background`, `bg-surface-dim`, `bg-surface-low` — backgrounds
- `text-on-surface`, `text-on-surface-variant`, `text-tertiary`, `text-primary-container` (laranja)
- `border-white/8`, `border-white/20`
- `nav-glass`, `glass-panel`, `glass-panel-strong` — vidro
- `font-pirulen` — display titles
- `text-label-caps`, `text-headline-md`, `text-headline-lg`
- `glow-effect`, `section-glow-top`, `section-glow-bottom`
- `px-edge`, `py-section`, `max-w-[1600px]`
- `material-symbols-outlined` — ícones (`star`, `arrow_outward`, `format_quote`, `verified`)

### 4.2 ReviewCard
```
┌─────────────────────────────────────┐
│  [avatar]  Nome do autor            │
│            ★★★★★  · há 2 meses     │
│                                     │
│  "  Texto da review truncado em     │
│     ~220 caracteres com fade out    │
│     elegante na ponta...      "     │
│                                     │
│  [ ler completa  →  ]  (se truncou) │
└─────────────────────────────────────┘
```
- Container: `bg-surface-dim border border-white/8 rounded-sm p-6 hover:border-primary-container/40 transition-all`
- Aspas grandes laranjas em SVG decorativo no canto sup esq
- Avatar circular 40px; fallback: círculo com inicial em `bg-primary-container/20 text-primary-container`
- Estrelas: laranja (`text-primary-container`) preenchidas
- Data: `Intl.RelativeTimeFormat('pt-BR')` calculado SSR
- Permalink/url externa: `target="_blank" rel="noopener noreferrer"`

### 4.3 ReviewsHomeWidget
```
─────────────────  AVALIAÇÕES VERIFICADAS  ──────────────────
                                                              
        4.8 ★★★★★      Baseado em 11 avaliações no
        em 5 estrelas    Google Business Profile
                                                              
   ┌───────────┐  ┌───────────┐  ┌───────────┐
   │ review 1  │  │ review 2  │  │ review 3  │
   └───────────┘  └───────────┘  └───────────┘
                                                              
       [ Ver todas as avaliações  → ]   [ Avalie no Google ↗ ]
─────────────────────────────────────────────────────────────
```
- Section: `py-section bg-background relative` com `section-glow-top`
- Eyebrow: `text-label-caps text-primary-container uppercase tracking-[0.2em]`
- Headline: número grande (`text-7xl font-pirulen text-white`) + 5 estrelas + texto sub
- Grid cards: `grid grid-cols-1 md:grid-cols-3 gap-6`
- CTA primário: estilo igual "Solicitar Orçamento" da Navbar
- CTA secundário: outline `border-white/20 hover:border-primary-container`

### 4.4 ReviewsFooterWidget
```
─────────────────────────────────────────────────────────────
  ★★★★★  4.8 / 5     ·   11 avaliações verificadas no Google
  
  "Excelente serviço, qualidade de primeira..."  — Luiz F.
                                                  ↻ rotaciona
                                                  
                              [ Ver todas ]   [ ↗ Google ]
─────────────────────────────────────────────────────────────
```
- Position: nova linha **acima** do bottom-bar do footer (linha ~128 do Footer.astro)
- Background `bg-surface-low border-t border-white/8 py-6`
- Rotação CSS-only com `@keyframes` cíclico em 3 trechos curtos (8s cada)

### 4.5 /avaliacoes (página)
- Layout: `BaseLayout`
- Hero curto (não full-screen): mesmo header do home widget mas em escala maior
- Grid de TODAS as 6 reviews (sem truncate, ou truncate maior em 400ch)
- Seção "Como avaliar a AUMAF 3D no Google" — 3 passos numerados estilo das stats da home
- CTA final repetido
- SEO: meta tags próprias, `<meta name="robots" content="index, follow">`, breadcrumb, schema.org `LocalBusiness` + `AggregateRating`

---

## 5. SEO / Schema.org

Adicionar no `<head>` da `/avaliacoes` (e idealmente na home onde o widget aparece):

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "AUMAF 3D",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "11",
    "bestRating": "5"
  },
  "review": [/* mapeado das reviews */]
}
```

⚠️ Google rich results exigem `Review` com `author`, `reviewRating`, `reviewBody` — incluir todos.

---

## 6. Acessibilidade

- Estrelas: `aria-label="4.8 de 5 estrelas"` no container; estrelas individuais com `aria-hidden`
- Cards: estrutura semântica `<article>` com `<header>` (autor + rating)
- Datas: `<time datetime="ISO">há 2 meses</time>`
- Links externos: `aria-label` sufixado com "(abre em nova aba)"
- Carrossel do footer: `aria-live="polite"` na região rotativa
- Foco visível: `focus-visible:outline-2 focus-visible:outline-primary-container` (padrão do site)

---

## 7. Performance

- SSR estático → zero JS no client (exceto se decidirmos animar entrada)
- Avatares lazy: `loading="lazy"` + `decoding="async"` + `referrerpolicy="no-referrer"` (Google CDN bloqueia hotlink em alguns casos sem isso)
- Imagens dimensionadas (`width="40" height="40"`) pra evitar CLS
- Featurable cacheado por 6h via Cache-Control → 4 fetches/dia em prod

---

## 8. Plano de execução (ordem de commits)

1. **Lib + tipos:** `google-reviews.ts` + smoke test manual no terminal
2. **Stars + Card primitivos:** `ReviewStars.astro` + `ReviewCard.astro`
3. **Home widget:** `ReviewsHomeWidget.astro` + edit `index.astro`
4. **Página dedicada:** `pages/avaliacoes.astro`
5. **Footer widget:** `ReviewsFooterWidget.astro` + edit `Footer.astro`
6. **Nav link:** edit `Navbar.astro`
7. **SEO/Schema:** injeção de JSON-LD na home e /avaliacoes

Cada passo = commit atômico. Build local entre cada (`npm run build` no `frontend-public`).

---

## 9. Verificação antes de PR

```bash
cd frontend-public
npm run build           # passa sem erro
npm run dev             # smoke visual em /, /avaliacoes
# checklist manual:
# [ ] /avaliacoes renderiza com 6 reviews
# [ ] Home mostra 3 reviews + rating
# [ ] Footer mostra widget compacto
# [ ] Nav tem item "Avaliações" e ele fica ativo em /avaliacoes
# [ ] Mobile drawer mostra "Avaliações"
# [ ] Mobile breakpoint OK em todas as 3 superfícies
# [ ] Lighthouse: sem CLS novo, LCP estável
# [ ] Schema.org valida em https://validator.schema.org/
# [ ] Reviews em pt-BR (não as traduzidas)
# [ ] Fallback testado: alterar widget ID inválido → site não quebra
```

---

## 10. Deploy

- PR → CI (lint + typecheck + build)
- Squash merge em master após aprovação
- CD automático via skill `vps-deploy`
- Smoke prod:
  - `curl -s https://aumaf.kayoridolfi.ai/avaliacoes -o /dev/null -w "%{http_code}"` → 200
  - Visual: home mostra widget, footer mostra widget, /avaliacoes lista 6 reviews
- Memória de sessão: registrar PR + decisão Featurable

---

## 11. Pós-deploy / itens deferidos

- **Mais que 6 reviews:** Featurable parece limitar a 6 no plano free. Se virarmos 30+ reviews, considerar plano pago ou migrar pra Places API oficial (mantendo `getReviews()` como abstração — só troca a fonte).
- **Cache server-side em Redis:** se Featurable tiver instabilidade, migrar fetch pro backend e cachear no Redis (mesmo padrão do Botyio).
- **Auto-refresh:** se quisermos atualização ao vivo (ex: nova review aparecer no site em <6h), trocar `force-cache` por revalidate periódico ou webhook do Featurable.
- **Filtro de rating em UI:** se algum dia chegar review baixa que não queremos destacar mas precisamos manter por ToS, podemos ordenar por rating desc (sem filtrar) — discussão futura.
- **Instagram feed (Plano 3):** mesmo padrão (fetch SSR + cache + componente DS) — esta implementação serve de blueprint.

---

## 12. Pré-requisitos pra começar

✅ Widget ID Featurable em mãos
✅ Endpoint validado (curl OK)
✅ Estrutura DS mapeada
🟡 Confirmar com Kayo:
   - Posição do widget na home: **entre depoimentos custom (linha 693) e CTA final (linha 861)** — OK?
   - Posição do widget no footer: **linha acima do bottom-bar** ou dentro de uma das 3 colunas? Recomendação: linha própria acima do bottom-bar (mais respiro).
   - Página dedicada `/avaliacoes` ou só widgets na home+footer? Plano assume **sim, página dedicada**.
   - Rota dedicada vai pro menu principal ou só footer? Recomendação: **principal** entre Sobre e Blog.
