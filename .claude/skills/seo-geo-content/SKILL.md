---
name: seo-geo-content
description: Use SEMPRE ao criar ou modificar uma página pública nova, landing por setor, FAQ, guia HowTo, post de blog, glossário, catálogo de materiais, seção de conteúdo institucional ou qualquer outra superfície indexável do frontend-public da AUMAF 3D. Garante schema JSON-LD correto, extração para src/data, exposição como .md cru para LLMs, entrada em llms.txt, preload de bg hero, e link no Footer/Navbar quando aplicável. Acione também quando o usuário falar "nova página", "nova landing", "novo guia", "novo setor/indústria", "novo material", "novo termo no glossário", "novo post", "atualizar FAQ", "schema rich results", "indexar", "GEO", "LLM citation".
---

# SEO + GEO Content — AUMAF 3D

Esta skill é o **playbook obrigatório** para qualquer mudança em conteúdo público. Sem essa disciplina, conteúdo bem escrito fica invisível para Google + LLMs.

Plano-mestre que motivou esta skill: `docs/plans/2026-05-14-maximize-organic-presence.md`.
Auditoria-base: `docs/plans/2026-05-13-*.md`.

## Filosofia

Cada peça de conteúdo deve servir **três audiências simultaneamente**:

1. **Usuário humano** — UI rica em `.astro` com tipografia/CSS do Design System.
2. **Google Search** — JSON-LD em `<head>` com schema.org adequado (Product, FAQPage, HowTo, Service, Person, DefinedTerm, BlogPosting).
3. **LLMs (Claude, GPT, Perplexity, Gemini)** — markdown cru exposto em `/X.md` + entrada em `llms.txt`.

Atender os 3 ao mesmo tempo exige disciplina: **dado canônico em um lugar só** (`src/data/*.ts`), múltiplos renderizadores.

## Decisão rápida: que schema usar

| Tipo de conteúdo | Schema canônico | Factory em `src/lib/schemas.ts` |
|---|---|---|
| Produto/material vendável | `Product` | `productSchema()` |
| Pessoa (equipe) | `Person` | `teamMembersSchema()` |
| Tutorial passo-a-passo | `HowTo` | `howToSchema()` |
| Serviço por setor | `Service` | `serviceSchema()` |
| Página de perguntas | `FAQPage` | `faqPageSchema()` |
| Termo técnico (glossário) | `DefinedTermSet` | `definedTermSetSchema()` |
| Post de blog | `BlogPosting` | `blogPostingSchema()` |
| Landing/coleção | `CollectionPage` + `ItemList` | `webPageSchema()` + `itemListSchema()` |
| Empresa (Org+Local) | `Organization` + `LocalBusiness` | já em todo Base via `defaultGraph` |
| Caminho navegacional | `BreadcrumbList` | `breadcrumbSchema()` |

Faltou schema na lista? **Crie nova factory em `src/lib/schemas.ts` antes de usar inline.**

## Checklist obrigatório ao adicionar conteúdo novo

Antes de marcar a tarefa como concluída, **todos os itens aplicáveis** devem estar feitos.

### A. Dados canônicos
- [ ] O array de conteúdo está em `frontend-public/src/data/<nome>.ts` (não inline no `.astro`)?
- [ ] Tipos `interface` exportados?
- [ ] Pages importam dali (não duplicam)?

### B. Schema JSON-LD
- [ ] Factory apropriada existe em `src/lib/schemas.ts` (criar se faltar)?
- [ ] Page monta `const schemas = [...]` e passa para `<Base schemas={schemas}>`?
- [ ] Para listagens, incluir `itemListSchema`?
- [ ] Para conteúdo dentro de outra coleção, incluir `breadcrumbSchema`?
- [ ] Verificar no [Rich Results Test](https://search.google.com/test/rich-results) pós-deploy.

### C. Markdown source para LLMs (se aplicável)
Aplicável quando o conteúdo é referencial/durável (FAQ, glossário, catálogo, guia, serviço, indústria). NÃO aplicável a posts de blog (mudam) ou páginas transacionais (contato).

- [ ] Atualizar `scripts/generate-llm-sources.ts` para incluir nova seção em `.md` apropriado, OU criar novo `.md` se for nova categoria.
- [ ] Rodar `npm run build:llm-sources` localmente para validar.
- [ ] Adicionar entrada em `public/llms.txt` na seção "Markdown sources".

### D. llms.txt (índice)
- [ ] Adicionar entrada na seção mais apropriada (Serviços, Indústrias, Guias HowTo, Conteúdo de referência).
- [ ] Se for categoria nova (ex: "Estudos de caso"), criar nova seção.

### E. LCP / Performance
- [ ] Se a página tem `background-image:url(...)` no hero, passar `preloadImage="/images/bg-X.webp"` para `<Base>`.
- [ ] Imagens above-the-fold com `loading="eager" decoding="async"`; abaixo do fold com `loading="lazy"`.

### F. Navegação
- [ ] Footer (`src/components/Footer.astro`): adicionar link no `navLinks` se for conteúdo de referência permanente.
- [ ] Navbar: adicionar só se for categoria principal (atualmente: Serviços, Materiais, Sobre, Portfolio, Blog, Contato).
- [ ] Sitemap: automático via file-based routing (verificar prioridade em `astro.config.ts` se precisar customizar).

### G. Analytics
- [ ] CTAs principais com `data-track="cta_X"` + `data-track-location="<page-slug>"` — ver skill `analytics-tagging`.
- [ ] CTAs com pré-preenchimento usam `?ref=<contexto-slug>` (ex: `?ref=industria-automotiva`).

### H. Internal linking
- [ ] Mínimo 2-3 links para outras páginas relevantes (materiais, serviços, glossário, FAQ).
- [ ] Conteúdo com 600+ palavras para evitar thin content em landings.

### I. Disclaimer (se aplicável)
- [ ] Áreas reguladas (médica, aeroespacial, financeira) precisam de disclaimer explícito sobre o que NÃO atendemos.

## Padrões consolidados (referência rápida)

### Adicionar landing por indústria
1. Editar `src/data/industrias.ts` (push em `industrias[]`).
2. `[slug].astro` é dinâmico — gera automaticamente.
3. Hub `/industrias` lista automaticamente.
4. Atualizar `llms.txt` (seção Indústrias atendidas).

### Adicionar guia HowTo
1. Editar `src/data/guias.ts` (push em `guias[]`).
2. `[slug].astro` gera automaticamente.
3. Atualizar `llms.txt` (seção Guias HowTo).

### Adicionar material novo
1. Editar `materials[]` em `src/pages/materiais.astro` (legado inline).
2. Adicionar entrada compacta em `scripts/generate-llm-sources.ts` (bloco `lista`).
3. Criar imagem `/images/mat-XX-<slug>.webp` 1:1.

### Adicionar termo no glossário
1. Editar `terms[]` em `src/data/glossario.ts`.
2. Rodar `npm run build:llm-sources` para regenerar `public/glossario.md`.

### Adicionar pergunta no FAQ
1. Editar grupo apropriado em `src/data/faqs.ts`.
2. `npm run build:llm-sources` regenera `public/faq.md`.

### Adicionar post de blog
- Não usa esta skill — vai pelo admin (`/admin/posts/new`) com IA assistida.
- Backend serviço dispara IndexNow ping automaticamente ao publicar (precisa `INDEXNOW_KEY` em prod).

## Anti-padrões — evite

- ❌ Criar `.astro` novo com array de dados inline (faz drift com `.md`).
- ❌ Embutir JSON-LD direto no template (`<script type="application/ld+json">{...}</script>`) — use factory.
- ❌ Adicionar conteúdo público sem entrada em `llms.txt`.
- ❌ Hero com bg CSS sem `preloadImage` (deteriora LCP).
- ❌ Mais de 1 H1 por página.
- ❌ Landing < 600 palavras (Google classifica como thin content).

## Pendência operacional (prod)

IndexNow só funciona com chave setada no VPS. Verificar antes de assumir que ping está ativo:

```bash
curl -I https://aumaf.kayoridolfi.ai/<KEY>.txt  # deve dar 200
```

Se 404, ver skill `vps-deploy` para setar `INDEXNOW_KEY` + `PUBLIC_INDEXNOW_KEY`.

## Métricas (validar trimestralmente)

- Páginas indexadas no Google Search Console
- Impressões/cliques GSC mês a mês
- Citação em LLMs (validação manual: perguntar ao Claude/GPT/Perplexity "impressão 3D em São Carlos")
- Backlinks dofollow (Ahrefs free tier)

Métricas-alvo em `docs/plans/2026-05-14-maximize-organic-presence.md`.
