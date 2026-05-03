---
feature: frontend-public-uxa11y-seo-geo
created: 2026-05-03
---

# Tasks — Implementação

Cada task tem critério de pronto observável. `[P]` = paralelizável. `[CHECKPOINT]` = parar e revisar antes de prosseguir.

## Fase 1 — Fundamentos (globais, afetam tudo)

- [x] **T1.1** — Criar `src/lib/company.ts` com NAP completo (constante `COMPANY`).
  - Pronto quando: arquivo existe, exporta tipo `as const`, importável de qualquer página.
- [x] **T1.2** — Criar `src/lib/schemas.ts` com funções `organizationSchema`, `localBusinessSchema`, `webSiteSchema`, `breadcrumbSchema`, `faqPageSchema`, `howToSchema`, `blogPostingSchema`, `serviceSchema`.
  - Pronto quando: cada função retorna objeto JSON-LD válido testado em validator.schema.org.
- [x] **T1.3** — Criar `src/components/SEO.astro` que recebe props (title, description, ogImage, schemas, breadcrumb, article) e emite `<head>` meta-tags + `<script type="application/ld+json">` com `@graph`.
  - Pronto quando: componente compila e ao usar em uma página produz HTML válido.
- [x] **T1.4** — Criar `src/components/Breadcrumb.astro`.
  - Pronto quando: render correto com `<nav aria-label="Trilha"><ol>...</ol></nav>`.
- [x] **T1.5** — Refatorar `src/layouts/Base.astro`: 
  - Adicionar skip-link.
  - Envolver `<slot />` em `<main id="main-content" tabindex="-1">`.
  - Substituir meta-tags inline por `<SEO>`.
  - Injetar Organization+LocalBusiness+WebSite no `@graph` global.
  - Adicionar `&display=swap` em URL do Material Symbols.
  - Pronto quando: build passa, página mantém visual, view-source mostra `@graph` global.
- [x] **T1.6** — Atualizar `src/styles/global.css`:
  - Adicionar `:focus-visible` outline global.
  - Adicionar bloco `@media (prefers-reduced-motion: reduce)`.
  - Pronto quando: testar Tab manual mostra anel verde; DevTools com "Emulate reduce-motion" pausa animações.
- [x] **T1.7** — Criar `public/robots.txt` (conteúdo da seção D12 do design).
  - Pronto quando: `curl localhost:4321/robots.txt` retorna conteúdo correto após build.
- [x] **T1.8** — Criar `public/og/og-default.svg` (1200×630, branding AUMAF 3D, dark + verde).
  - Pronto quando: arquivo existe; abrir em browser renderiza.

**[CHECKPOINT]** Após Fase 1 — build + smoke test (Tab pelo site, DevTools accessibility audit baseline) antes de Fase 2.

## Fase 2 — Páginas institucionais

### /index.astro
- [x] **T2.1** — Substituir `text-white/{15,20,25,30,40}` por tokens conforme tabela D4. [P]
- [x] **T2.2** — Adicionar `aria-hidden="true"` em ícones decorativos `<span class="material-symbols-outlined">` ao lado de texto. [P]
- [x] **T2.3** — Refatorar listas de capacidades/indústrias/clientes em `<ul>` semântico (manter visual via grid). [P]
- [x] **T2.4** — Carrossel de depoimentos: adicionar `aria-live="polite"` no track e `aria-label` nos botões. [P]
- [x] **T2.5** — Atualizar headline hero com keywords (manter visual; adicionar subhead semântico se necessário) — primeira frase definidora.
- [x] **T2.6** — Trocar anchor text genérico ("Saiba Mais") por descritivos.
- [x] **T2.7** — Passar `description` única e `breadcrumb={[{name:'Home'}]}` ao `<Base>`.
  - Pronto quando: pagina compila, view-source mostra meta description única e WebPage schema.

### /sobre.astro
- [x] **T2.8** — Aplicar D4 (contraste). [P]
- [x] **T2.9** — Refatorar Missão/Visão/Valores em `<dl>` semântico. [P]
- [x] **T2.10** — Adicionar `<time datetime="2022">` em "Desde 2022 em produção".
- [x] **T2.11** — Adicionar AboutPage schema + breadcrumb.
- [x] **T2.12** — Remover SVG decorativo invisível (opacity 0.04) do hero — economia de bytes.

### /servicos.astro
- [x] **T2.13** — Aplicar D4. [P]
- [x] **T2.14** — Envolver pills de specs em `<ul role="list">`. [P]
- [x] **T2.15** — Adicionar Service schema (array de 4 serviços) + HowTo schema na seção "Como Funciona" + FAQ schema implícito + breadcrumb.
- [x] **T2.16** — Padronizar CTAs primário/secundário; CTA principal único e claro.

### /contato.astro
- [x] **T2.17** — Aplicar D4. [P]
- [x] **T2.18** — Refatorar TODO o formulário conforme D9 (label/for, autocomplete, aria-describedby, aria-invalid, role=alert errors, aria-busy submit, file upload com label visível ou sr-only).
- [x] **T2.19** — Adicionar fieldset/legend para grupos lógicos (Dados Pessoais, Sobre o Projeto).
- [x] **T2.20** — Pills "Tipo de Projeto" como `role="radiogroup"` + `role="radio"` + `aria-checked`.
- [x] **T2.21** — Validação JS: erro inline + sucesso com foco em `#form-success`.
- [x] **T2.22** — ContactPage schema + LocalBusiness ContactPoint + breadcrumb.

**[CHECKPOINT]** Após Fase 2 — build + lighthouse de uma das páginas para validar ganho.

## Fase 3 — Listagens e blog

### /portfolio.astro
- [x] **T3.1** — Aplicar D4. [P]
- [x] **T3.2** — Filter pills com `role="radiogroup"` + `aria-checked` + contador `aria-live`. [P]
- [x] **T3.3** — Adicionar estado vazio `#empty-state` com CTA "solicitar peça customizada".
- [x] **T3.4** — Substituir alt-text genéricos em SVGs por `alt=""` (decorativos) ou descritivos.
- [x] **T3.5** — CollectionPage + ItemList schema + breadcrumb.

### /materiais.astro
- [x] **T3.6** — Aplicar D4. [P]
- [x] **T3.7** — Filter pills idem T3.2. [P]
- [x] **T3.8** — Trocar grid de specs por `<dl>` ou `<table>` semântica.
- [x] **T3.9** — CollectionPage + ItemList schema + breadcrumb.

### /faq.astro
- [x] **T3.10** — Refatorar accordion conforme D7 (button + aria-expanded + aria-controls + role=region + hidden). 
- [x] **T3.11** — Filter pills idem T3.2. [P]
- [x] **T3.12** — Toggle "Abrir/fechar todos" reflete em ARIA + estado.
- [x] **T3.13** — FAQPage schema + breadcrumb (D10).
- [x] **T3.14** — Adicionar pergunta sobre cobertura geográfica (Brasil + retirada São Carlos).

### /blog/index.astro
- [x] **T3.15** — Aplicar D4. [P]
- [x] **T3.16** — Cards de post como `<article>` com `<h3>` e `<time datetime>`.
- [x] **T3.17** — `loading="lazy"` + aspect-ratio reservado em imagens.
- [x] **T3.18** — CollectionPage + ItemList(BlogPosting) + breadcrumb.

### /blog/[slug].astro + 4 posts
- [x] **T3.19** — Aplicar D4 nos 5 arquivos. [P]
- [x] **T3.20** — Adicionar `<Breadcrumb items=[{name:'Blog', url:'/blog'}, {name: post.title}]/>` no topo.
- [x] **T3.21** — TL;DR card antes do conteúdo principal (opcional para posts curtos).
- [x] **T3.22** — Table of Contents sticky desktop com anchors a `id` dos `h2`.
- [x] **T3.23** — Cluster de share buttons (WhatsApp + LinkedIn + X + Copy link) com `aria-label` e copy-link JS.
- [x] **T3.24** — `<time datetime>` em data + autor card simples ("Equipe AUMAF 3D" + logo).
- [x] **T3.25** — Refatorar tabelas (case SAE, FDM vs SLA vs SLS) para `<table>` semântica com caption/thead/scope.
- [x] **T3.26** — BlogPosting + BreadcrumbList schema; HowTo onde aplicável (engenharia-reversa, fdm-vs-sla-vs-sls, guia-materiais).
- [x] **T3.27** — Imagens com width/height/aspect-ratio + lazy.

## Fase 4 — Componentes globais (Navbar, Footer)

- [x] **T4.1** — Navbar: `aria-current="page"` no link ativo (atualmente só visual).
- [x] **T4.2** — Navbar: focus trap no drawer mobile + Esc para fechar (D18).
- [x] **T4.3** — Navbar: `<nav aria-label="Principal">` no `<header>`.
- [x] **T4.4** — Footer: aplicar D4. Substituir `text-white/25`, `text-white/30` em `address`/copyright/links secundários.
- [x] **T4.5** — Footer: NAP completo via `COMPANY` const (DRY).
- [x] **T4.6** — Footer: link "Desenvolvido por kayoridolfi.ai" com `aria-label="kayoridolfi.ai (abre em nova aba)"`.

## Fase 5 — Validação

- [x] **T5.1** — `cd frontend-public && npm run build` — sem erros novos.
- [x] **T5.2** — `cd frontend-public && npm run typecheck` (`astro check`) — sem erros novos.
- [x] **T5.3** — Inspeção visual de cada página em DevTools (mobile 375px + desktop 1440px).
- [x] **T5.4** — Inspeção `dist/sitemap-index.xml` — confirma 13 URLs.
- [x] **T5.5** — Validar 1 página representativa de cada schema no validator.schema.org.
- [x] **T5.6** — Tab pelo site inteiro: skip-link visível, foco em ordem lógica, drawer fecha com Esc.
- [x] **T5.7** — Atualizar `status.md` para fase `validate` e depois `retrospective`.
- [x] **T5.8** — Commit final com mensagem padrão do projeto.

## Notas de execução

- Ordem das fases respeita dependências: F1 cria primitivas (`SEO`, `Breadcrumb`, `schemas`, `COMPANY`) usadas em F2/F3; F4 limpa componentes globais; F5 valida.
- Tasks `[P]` dentro de uma mesma página podem ser feitas em batch num único Edit.
- Cada arquivo `.astro` é editado uma vez (idealmente), agregando todas as mudanças daquela página.
- Manter visual idêntico — nenhuma mudança visual além de microcopy.
