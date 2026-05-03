---
feature: frontend-public-uxa11y-seo-geo
status: implement
owner: kayoridolfi
created: 2026-05-03
---

# Requirements — Polimento UX, A11y, SEO e GEO do front-public

## Contexto e motivação

O `frontend-public` (Astro 5 + Tailwind, 13 páginas) já está visualmente pronto após a v6 (sticky-fix + navbar simplification + blog wider). Em paralelo a essa polidez visual, restam dívidas técnicas críticas em quatro frentes:

1. **Acessibilidade WCAG 2.2 AA** — contraste insuficiente, ausência de landmarks, formulários sem labels associadas, FAQ accordion sem ARIA, foco visível inconsistente, animações ignorando `prefers-reduced-motion`.
2. **SEO técnico/on-page** — zero schema.org JSON-LD, meta descriptions repetidas, OG images ausentes, sem `robots.txt`, anchor text genérico.
3. **GEO (Generative Engine Optimization)** — falta de NAP estruturado para LLMs, definições não diretas, dados quantitativos sem markup semântico, sem FAQPage / HowTo / BlogPosting schemas.
4. **UX e design** — espaçamento inconsistente, CTAs sem hierarquia clara, microcopy de erro ausente, posts longos sem ToC nem share múltiplo, estado vazio em filtros.

**Por que agora:** o site entra na fase de produção (Q3 — deploy). Essas correções precisam acontecer antes do deploy, pois (a) acessibilidade é não-negociável segundo a constitution, (b) SEO/GEO é o vetor primário de aquisição orgânica para uma empresa de impressão 3D em São Carlos competindo com São Paulo, (c) UX direta impacta taxa de conversão de orçamento.

## User stories

### US-1 — Visitante com leitor de tela
> Como visitante usando NVDA/VoiceOver, quero navegar pelas páginas do AUMAF 3D usando landmarks, atalhos de heading e ler perguntas/respostas do FAQ sem ficar perdido, para que eu consiga avaliar os serviços e contatar a empresa.

### US-2 — Visitante com baixa visão / preferência de movimento reduzido
> Como visitante com baixa visão (zoom 200%) ou que ativou "reduzir movimento" no SO, quero ler todos os textos com contraste mínimo de 4.5:1 e ver o site sem animações infinitas que distraem ou enjoam, para que eu consiga consumir o conteúdo confortavelmente.

### US-3 — Cliente em potencial preenchendo formulário
> Como cliente preenchendo o formulário de contato no celular com teclado nativo, quero que campos auto-preencham (nome, email, telefone), que erros sejam anunciados antes de tentar enviar, e que eu consiga anexar um arquivo via teclado, para que eu envie o orçamento sem fricção.

### US-4 — Engenheiro pesquisando "FDM vs SLA São Carlos" no Google
> Como engenheiro buscando processo ideal para meu projeto, quero achar o site da AUMAF 3D nos primeiros resultados com um snippet rico (rating, FAQ, breadcrumb), para que eu confie na empresa antes mesmo de clicar.

### US-5 — Engenheiro perguntando ao ChatGPT/Perplexity "quem faz peças em PEEK em São Carlos?"
> Como engenheiro perguntando a um LLM por fornecedor local, quero que o assistente cite "AUMAF 3D — São Carlos, SP — produz peças em PEEK, PA, PET-G CF15 e metal 316L (BASF Ultrafuse), com tolerância ±0.05mm" extraindo dados estruturados do site, para que eu encontre a empresa por canal de IA.

### US-6 — Lead lendo case completo da Fórmula SAE
> Como visitante lendo o post longo do case Fórmula SAE no celular, quero TL;DR no topo, índice navegável, tempo estimado de leitura, e botões para compartilhar no WhatsApp e LinkedIn, para que eu consiga entender o case rapidamente e mostrar a colegas.

### US-7 — Visitante mobile rolando o portfolio
> Como visitante mobile filtrando o portfolio por categoria, quero feedback visual imediato (contador de resultados, estado vazio quando não há), tap targets confortáveis (≥44px), para que eu não me frustre ao usar.

## Critérios de aceitação (EARS)

### Acessibilidade

- **AC-A11Y-1** — Quando o usuário pressiona `Tab` na primeira interação com qualquer página, então um link "Pular para o conteúdo" recebe foco e direciona para `<main id="main-content">`.
- **AC-A11Y-2** — Onde houver texto sobre fundo `#000000` ou `surface-dim`/`surface-low`, o contraste calculado atende ≥ 4.5:1 (texto normal) ou ≥ 3:1 (texto ≥ 18pt/14pt-bold), validado por amostragem com WebAIM Contrast Checker.
- **AC-A11Y-3** — Toda página possui exatamente um `<h1>` e hierarquia de headings sem pulos (`<h2>` segue `<h1>`, `<h3>` segue `<h2>`), validado por inspeção manual de DOM.
- **AC-A11Y-4** — Toda página renderiza um landmark `<main id="main-content">` envolvendo o conteúdo principal (entre Navbar e Footer).
- **AC-A11Y-5** — No formulário `/contato`, quando o leitor de tela é usado, então cada `<input>` é anunciado com seu label associado (`<label for="X">` + `id="X"`), com `autocomplete` apropriado, e erros de validação são anunciados via `role="alert"`/`aria-live="polite"`.
- **AC-A11Y-6** — No FAQ (`/faq`), cada pergunta é um `<button aria-expanded="true|false" aria-controls="panel-N">` controlando `<div id="panel-N" role="region">` cujo `hidden` é alternado e cujo `aria-expanded` é atualizado por JS.
- **AC-A11Y-7** — Quando o usuário ativa `prefers-reduced-motion: reduce`, todas as animações infinitas (`marquee`, `pulse-dot`, `scan-line`, `float`, `drift`, `glow-pulse`, `rotate-slow`) ficam pausadas ou de duração ≥ 5s, validado em DevTools rendering.
- **AC-A11Y-8** — Todo elemento focável recebe outline visível com contraste ≥ 3:1 contra o fundo via `:focus-visible` (anel verde `primary-container` 2px com offset 2px).
- **AC-A11Y-9** — Ícones-only em botões/links possuem `aria-label` descritivo; ícones decorativos ao lado de texto possuem `aria-hidden="true"`.
- **AC-A11Y-10** — Links com `target="_blank"` possuem `rel="noopener noreferrer"` e indicam "abre em nova aba" via `aria-label` ou ícone visível com `aria-label`.
- **AC-A11Y-11** — Tabelas (case Fórmula SAE, FDM vs SLA vs SLS) usam `<table>` semântica com `<caption>`, `<thead>`, `<tbody>` e `<th scope="col">`.

### SEO

- **AC-SEO-1** — Toda página possui `<title>` único, `<meta name="description">` único e relevante (50–160 chars), e `<link rel="canonical">` correto.
- **AC-SEO-2** — Toda página possui `og:image` definido (default: `/og/og-default.png` 1200×630; específico por página quando relevante).
- **AC-SEO-3** — Existe `/robots.txt` em `public/` permitindo todos os user-agents e referenciando `sitemap-index.xml`.
- **AC-SEO-4** — Schema.org JSON-LD inserido por página: `Organization` + `LocalBusiness` (global), `Service` (`/servicos`), `AboutPage` (`/sobre`), `ContactPage` + `LocalBusiness` com `ContactPoint` (`/contato`), `CollectionPage` + `ItemList` (`/portfolio`, `/materiais`, `/blog`), `FAQPage` (`/faq`), `BlogPosting` + `BreadcrumbList` (cada post de blog).
- **AC-SEO-5** — Toda página de detalhe (posts, futuras páginas internas) possui `<nav aria-label="Trilha">` com `<ol>` semântico e schema `BreadcrumbList` correspondente.
- **AC-SEO-6** — Anchor text de links internos é descritivo (não "saiba mais" / "clique aqui"); revisão obrigatória para textos genéricos.
- **AC-SEO-7** — Sitemap (`sitemap-index.xml`) inclui todas as 13 páginas atuais (já gerado por `@astrojs/sitemap`).

### GEO (Generative Engine Optimization)

- **AC-GEO-1** — Cada página inicia com **uma frase definidora direta** mencionando empresa, atividade e localização (ex: hero da home explicita "AUMAF 3D — manufatura aditiva industrial em São Carlos, SP" semanticamente extraível).
- **AC-GEO-2** — NAP (Name/Address/Phone) é consistente em todas as menções (Footer, /contato, schema LocalBusiness) com endereço completo padronizado: `Alameda Sinlioku Tanaka, 202 — Parque Tecnológico Damha II — São Carlos/SP — 13565-261`.
- **AC-GEO-3** — Schema `LocalBusiness` inclui `geo` (`-21.9766, -47.9064`), `openingHoursSpecification` e `telephone` E.164.
- **AC-GEO-4** — Página `/faq` emite schema `FAQPage` com cada pergunta mapeada para `Question` + `acceptedAnswer/Answer`.
- **AC-GEO-5** — Seção "Como Funciona" em `/servicos` emite schema `HowTo` com `step` por etapa.
- **AC-GEO-6** — Posts de blog que são tutoriais (`engenharia-reversa-passo-a-passo`, `fdm-vs-sla-vs-sls`, `guia-materiais-impressao-3d`) emitem `HowTo` schema com etapas.
- **AC-GEO-7** — Datas (publicação/atualização) são marcadas com `<time datetime="YYYY-MM-DD">` e refletem em schema `datePublished`/`dateModified`.
- **AC-GEO-8** — Posts longos (>200 linhas) recebem TL;DR no topo (3–5 bullets) e Table of Contents (sticky em desktop) gerada a partir dos `h2`.
- **AC-GEO-9** — Listas técnicas (capacidades, materiais, indústrias) usam `<ul>`/`<li>` semânticos em vez de `<div class="grid">`.

### UX & Design

- **AC-UX-1** — CTAs primários (orçamento, contato) usam variante única visual em todo o site (bg `primary-container` + `glow-effect`); CTAs secundários usam variante única (border `white/20`).
- **AC-UX-2** — Páginas usam `pt-section` no início e `pb-section` no fim do `<main>`, com seções intermediárias em múltiplos consistentes; nenhum `py-14`/`py-16` solto onde `py-section` aplica.
- **AC-UX-3** — Formulário `/contato` mostra estado de erro/sucesso visível e anunciado, com `aria-busy="true"` no submit.
- **AC-UX-4** — Filtros (portfolio, materiais, faq) mostram contador de resultados (`X de Y exibidos`) atualizado via `aria-live="polite"`, e estado vazio quando 0 itens.
- **AC-UX-5** — Posts de blog incluem botões de compartilhamento (WhatsApp + LinkedIn + X + Copiar link) com `aria-label`.
- **AC-UX-6** — Tap targets de links inline em mobile têm pelo menos 44×44px (via padding implícito).
- **AC-UX-7** — Header mobile (drawer) tem `Esc` para fechar e foco preso enquanto aberto (focus trap).

### Performance / Boas práticas

- **AC-PERF-1** — Imagens em `<img>` possuem `width`, `height` (ou `aspect-ratio` no container) para evitar CLS.
- **AC-PERF-2** — Imagens fora da dobra possuem `loading="lazy"` e `decoding="async"`.
- **AC-PERF-3** — Material Symbols permanece via Google Fonts (manter para não quebrar) mas com `display=swap` explícito; futuro: subset.
- **AC-PERF-4** — `npm run build` no `frontend-public` conclui sem erros nem warnings novos; `npm run typecheck` (astro check) idem.

## Edge cases conhecidos

- **EC-1** — Filter `/portfolio` com 0 resultados precisa exibir mensagem amigável + CTA "solicitar peça customizada".
- **EC-2** — Formulário `/contato` precisa permitir envio sem arquivo (file é opcional) — não bloquear.
- **EC-3** — Usuário com JS desabilitado deve ver FAQ com todos os accordions abertos por default (progressive enhancement).
- **EC-4** — `sitemap-index.xml` ausente em produção quebra crawl — confirmar geração.
- **EC-5** — Schema JSON-LD inválido derruba rich snippet — usar Schema.org Validator antes do commit.
- **EC-6** — Mobile drawer aberto + scroll do body → confirmar que o body fica `overflow:hidden` (já implementado em Navbar.astro:119).

## Fora de escopo

- ❌ Backend / backoffice (continuação separada na spec Q2).
- ❌ Reescrita do design visual (paleta, tipografia, layouts) — apenas correções cirúrgicas.
- ❌ Internacionalização (i18n) — site é mono-idioma pt-BR.
- ❌ Self-host de Material Symbols com subset — registrado como follow-up; ganho marginal vs custo agora.
- ❌ Migração para Astro Content Collections para os posts — atual é hardcoded em `.astro` e fica assim até a integração com backoffice (Q2).
- ❌ Testes E2E (Playwright) automáticos para o front-public — Playwright é obrigatório no `frontend-admin` (constitution); para o público, validação é manual + lighthouse.

## Boundaries (anti-drift)

### ✅ Always
- Corrigir contraste apenas trocando para tokens já existentes (`text-tertiary`, `text-on-surface`, `text-on-surface-variant`) ou aumentando opacidade (`white/70+`); nunca inventar nova cor sem revisar o design system.
- Manter o visual existente — toda mudança é semântica/aria/SEO/microcopy, não troca de layout.
- Atualizar `status.md` e `INDEX.md` ao mudar de fase.
- Validar cada schema JSON-LD em https://validator.schema.org antes de fechar a fase.

### ⚠️ Ask first
- Adicionar nova dependência npm (ex: `astro-seo`, biblioteca de schema).
- Mudança em design tokens (`tailwind.config.ts`) que afete múltiplas páginas além das corrigidas.
- Geração de imagens OG por IA (custo + asset binário no repo).

### 🚫 Never
- Remover Storybook ou Playwright (constitution).
- Adicionar `tenantId` em qualquer lugar (constitution).
- Commitar com `--no-verify` ou bypass de hooks.
- Mover JWT para localStorage (constitution).
- Quebrar overflow-x:clip do body (regra crítica do v6 — sticky depende disso).

## Clarifications (resolvidas durante a fase Specify)

**Q1**: Imagens OG por página devem ser geradas individualmente ou usamos uma única default?
**A1**: Default `/og/og-default.png` para todas as páginas institucionais. Para os 4 posts de blog atuais, gerar 4 imagens (ou reutilizar a SAE-formula.avif convertida para o post correspondente). Geração de novas imagens não-essencial — usar placeholder gerado via script/SVG por enquanto, com TODO documentado para imagens reais.

**Q2**: O `LocalBusiness` deve ser global no Base.astro ou apenas em `/contato`?
**A2**: Global no Base.astro (Organization + LocalBusiness mesclados, conhecido como pattern "@graph"). Crawlers e LLMs descobrem em qualquer URL.

**Q3**: Lat/long do parque tecnológico?
**A3**: -21.9766, -47.9064 (mencionado em sobre.astro:221 — confirmado).

**Q4**: Posts hardcoded em `.astro` ficam ou migram para Content Collections?
**A4**: Ficam. Migração entrará no escopo da Q2 (backoffice integration). Apenas adicionamos JSON-LD e melhorias acessíveis nos arquivos existentes.

**Q5**: Skip-link deve aparecer só ao focar (visualmente oculto até foco)?
**A5**: Sim. Padrão `sr-only focus:not-sr-only` com posicionamento absoluto top-left, fundo `surface-high` + texto `primary-container`.

**Q6**: Telefone E.164 confirmado?
**A6**: `+5516992863412` (já em uso no link `wa.me/5516992863412`).

**Q7**: Horário comercial?
**A7**: Segunda–Sexta, 08:00–18:00 (já no Footer). Schema `openingHoursSpecification` com `dayOfWeek: [Monday..Friday]`, `opens: "08:00"`, `closes: "18:00"`.
