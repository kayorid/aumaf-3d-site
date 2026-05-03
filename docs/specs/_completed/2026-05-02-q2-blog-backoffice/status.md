# Status — q2-blog-backoffice

**Fase atual**: validate (Phase 2 implementada)
**Iteração**: Phase 1 ✅ entregue · **Phase 2 ✅ A+B+C entregues · D postergada para Q3**
**Branch ativa**: `feat/admin-q2-phase2-migration-blog-dynamic`
**Última atualização**: 2026-05-03 13:50
**Próximo passo concreto**: smoke test manual no admin + abrir PR com checklist de validação
**Spec da Phase 2**: `./phase-2/{requirements,design,tasks}.md`

## Phase 2 — entregue
- **A**: schema (readingTimeMin/featured/tags + 2 índices), endpoints públicos com cache+ETag, seed expandido (7 categorias), script `migrate:posts` idempotente, 6 posts migrados com fidelidade visual integral, Tailwind safelist
- **B**: Astro 5 prerender por página, src/lib/api.ts + render-post.ts (marked html:true), /blog/* dinâmicos, sitemap dinâmico (16 páginas em build, 6 do blog), Base.astro emite GA4/GTM/Clarity/Pixel/customScripts vindos das Settings
- **C**: backend leads filter+CSV+sources, settings GET/PATCH, categories CRUD (409 com posts vinculados), auto-save endpoint; admin Sidebar 6 itens, rotas /admin/{leads,settings,categories}, useAutoSave hook (5s debounce, pausa após 3 falhas)
- **D** (opcional): BullMQ assíncrono e Storybook stories postergados para Q3

## Status técnico
- typecheck monorepo: 5/5 verde (0 errors, 0 warnings)
- frontend-public build: 16 páginas em ~3s
- frontend-admin build: dist limpo (1.45MB JS / 35KB CSS)
- 4 commits sequenciais na branch (Setup, A, B, C)

---

## Decisões registradas

| Data | Decisão | Razão |
|------|---------|-------|
| 2026-05-02 | Spec SDD iniciada para Q2 | Adoção do processo Spec-Driven Development |
| 2026-05-03 | Spec dividida em **Phase 1** + Phase 2 | Entrega faseada |
| 2026-05-03 | **IA multi-provedor** (Anthropic+OpenAI+Gemini) com interface comum | Flexibilidade sem complexidade |
| 2026-05-03 | Geração IA **síncrona** com timeout 90s | Modelos modernos entregam <40s; BullMQ vai p/ Phase 2 |
| 2026-05-03 | Workflow **2 estados** (DRAFT/PUBLISHED); PENDING_REVIEW dormente | 1 admin único; aprovação = humano revisar rascunho IA |
| 2026-05-03 | TipTap dual-mode (Visual+Code) persistindo **Markdown** | Portátil, IA gera Markdown direto, diff-friendly |
| 2026-05-03 | Conversores `markdownToHtml`/`htmlToMarkdown` caseiros | Bundle menor, comportamento previsível, schema Tiptap controlado |
| 2026-05-03 | `react-markdown` + `remark-gfm` + `rehype-highlight` para preview | Padrão de mercado, GFM completo, syntax highlighting |
| 2026-05-03 | `SanitizedHtml` **omitido** | Sem HTML legado no AUMAF |
| 2026-05-03 | CASL **omitido** | 1 admin único — check direto de role suficiente |
| 2026-05-03 | React Router v6 + TanStack Query v5 + Zustand | Stack maduro |
| 2026-05-03 | Upload via **presigned URL** direto no MinIO | Tira carga do Express |
| 2026-05-03 | Dashboard **DB-only** | Sem dependência externa para go-live |
| 2026-05-03 | **Proibido tocar `frontend-public/`** nesta iteração | Foco no backoffice |

## Perguntas em aberto

- ~~Provedor IA?~~ Multi-provedor, padrão Anthropic
- ~~Workflow aprovação?~~ 2 estados na UI
- ~~Upload múltiplo?~~ 1 por vez, ilimitados por post
- [ ] Substituir senha admin antes de prod? (atual: `AumafAdmin2026!` em `.env`)
- [ ] Preencher chaves de API (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`) — admin sem nenhuma key vai falhar a geração IA com erro 400 explicativo

## Blockers

- Nenhum

## Descobertas (fora de escopo)

- Form `contato.astro` do site público já submete dados — endpoint `POST /leads` incluído nesta iteração para evitar leads perdidos
- Botão Radix Slot exigia tratamento especial para combinar `loading` + `asChild` (resolvido em `components/ui/button.tsx`)

---

## Validation log

| Critério | Evidência | Status |
|----------|-----------|--------|
| R5 (redirect login) | Playwright `redireciona / para /login` ✓ | ✅ |
| R6 (login) | Playwright `login com credenciais corretas` + curl manual ✓ | ✅ |
| R7 (msg genérica) | Playwright `senha errada → "Credenciais inválidas"` ✓ | ✅ |
| R8 (criar post Markdown) | curl create + service test slug uniqueness | ✅ |
| R9 (rascunho persiste) | Service `createPost` com status DRAFT, sem `publishedAt` | ✅ |
| R10 (publicar) | curl `/posts/:id/publish` → status PUBLISHED + publishedAt | ✅ |
| R11 (upload MinIO) | `ensureBucket` no boot ✓ + `presignUpload` com 10MB max | ✅ |
| R12 (status save) | Badge "Salvando.../Salvo/Erro" no PostEditorPage | ✅ |
| R13-R15 (IA UI) | AIPanel + useGeneratePost com timeout 95s + tratamento de erro | ✅ |
| R16 (multi-provedor) | 3 providers (Anthropic, OpenAI, Gemini) atrás de interface comum + dropdown UI | ✅ |
| R17 (log IA) | `pino.info` em `ai.service` com provider/model/tokens/latência | ✅ |
| R18 (4 KPIs) | DashboardPage com 4 KpiCards (publicados, draft, leads30d, IA) | ✅ |
| R19 (5 posts recentes) | RecentPostsList ordenado por updatedAt desc | ✅ |
| R20 (5 leads recentes) | RecentLeadsList com máscara aplicada (maskEmail/maskPhone) | ✅ |

**Build**: ✅ typecheck monorepo (5/5), build monorepo (4/4), Jest backend (12/12), Vitest admin (14/14), Playwright (3/3)

## Métricas pós-feature (a coletar com uso real)

| Métrica | Linha de base | Meta | Observado |
|---------|---------------|------|-----------|
| Tempo médio criação post (manual) | ~2h | ~30min com IA | TBD |
| Custo médio por geração (Anthropic) | — | < $0.02 | TBD |
| Tempo de boot do backend | — | < 2s | ~1s ✅ |
| p95 login | — | < 200ms | TBD |

---

## Histórico de fase

| Data | Fase entrada | Quem | Notas |
|------|--------------|------|-------|
| 2026-05-02 22:15 | specify | Kayo + Claude | kickoff Q2 |
| 2026-05-03 11:35 | clarify → plan → tasks | Kayo + Claude | Phase 1 trimada; design + tasks completos |
| 2026-05-03 11:50 | implement | Claude | Implementação completa F1-F15 |
| 2026-05-03 12:20 | validate | Claude | Build + typecheck + tests verdes; aguardando teste manual UI |
