# Tasks — q2-blog-backoffice (Phase 1)

> Quebra executável de [design.md](./design.md). Marque com `[P]` tarefas paralelizáveis e `[CHECKPOINT]` aquelas que exigem revisão humana antes de prosseguir.

**Linkado a**: [design.md](./design.md)
**Iteração**: Phase 1
**Última atualização**: 2026-05-03

---

## 🚫 Restrição absoluta desta iteração

**Nenhuma task abaixo pode tocar arquivos de `frontend-public/`.** Estamos construindo o backoffice (`backend/` + `frontend-admin/` + `packages/shared/`). A migração do blog público para consumir API é Phase 2.

---

## Convenções

- `[P]` — paralelizável (não toca arquivos pendentes de outra task)
- `[CHECKPOINT]` — para e pede revisão humana antes de prosseguir
- `(<arquivo>)` — arquivo principal tocado
- `→ R<N>` — qual critério EARS de requirements.md a task satisfaz
- Cada task tem **critério de pronto observável**

---

## F1 — Fundação backend (config, errors, schemas Zod compartilhados)

- [ ] **T1.1** — Criar módulo de tipos de erro HTTP padronizados (`backend/src/lib/http-error.ts`)
  - Pronto: classe `HttpError(status, code, message)` exportada; serializa para JSON `{status, code, message}`
- [ ] **T1.2** — Middleware de tratamento de erro centralizado (`backend/src/middlewares/error-handler.ts`)
  - Pronto: `HttpError` retorna o status correto; outros erros retornam 500 sem stack em prod; log Pino estruturado
- [ ] **T1.3** — Middleware `validate(schema)` que parseia `req.body`/`req.query`/`req.params` com Zod (`backend/src/middlewares/validate.ts`)
  - Pronto: 422 ao falhar; payload validado fica em `req.validated`
- [ ] **T1.4** [P] — Atualizar env schema com novas vars (`backend/src/config/env.ts`)
  - Pronto: Zod valida `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AI_PROVIDER`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `MINIO_*`, `BACKEND_URL`; falhar em boot se obrigatórias ausentes
- [ ] **T1.5** [P] — Criar Prisma client singleton (`backend/src/lib/prisma.ts`)
  - Pronto: instância única exportada; logs de query em dev
- [ ] **T1.6** [P] — Criar schemas Zod compartilhados (`packages/shared/src/schemas/{auth,post,upload,ai,lead,metrics}.schemas.ts`)
  - Pronto: 6 arquivos de schema + reexport em `packages/shared/src/index.ts`; `npm run build` no shared sem erros
- [ ] **T1.7** [P] — Atualizar `backend/.env.example` com todas as novas vars
  - Pronto: arquivo lista todas as 10+ vars com comentários explicativos
- [ ] **T1.8** [CHECKPOINT] — Revisar fundação antes de auth

## F2 — Auth (login/logout/me + seed admin)

- [ ] **T2.1** — Implementar `auth.service` (`backend/src/services/auth.service.ts`)
  - Funções: `login(email, password)`, `verifyToken(token)`, `signToken(user)`
  - Pronto: bcrypt.compare para validar; jwt.sign com `JWT_SECRET` e `expiresIn=7d`; teste unitário cobre senha correta/incorreta/user inexistente (resposta genérica em todos os 2 últimos casos)
- [ ] **T2.2** — Middleware `requireAuth` que valida cookie `aumaf_session` e popula `req.user` (`backend/src/middlewares/require-auth.ts`)
  - Pronto: cookie ausente → 401 `UNAUTHORIZED`; token inválido/expirado → 401; sucesso → `req.user = { id, email, role }`
- [ ] **T2.3** — Rotas `/api/v1/auth/{login,logout,me}` (`backend/src/routes/auth.routes.ts` + `backend/src/controllers/auth.controller.ts`) → R5, R6, R7
  - Pronto: login seta cookie httpOnly+sameSite=strict+secure(prod); logout limpa cookie; me retorna `AuthUser` validado pelo schema
- [ ] **T2.4** — Atualizar `seed.ts` para criar admin único (`backend/prisma/seed.ts`)
  - Pronto: lê `ADMIN_EMAIL` e `ADMIN_PASSWORD` do env; cria com bcrypt cost 12 se não existir; também cria 4 categorias iniciais (Engenharia, Materiais, Cases, Tutorial)
- [ ] **T2.5** — Wire das rotas no `app.ts` + healthcheck atualizado
  - Pronto: `app.use('/api/v1/auth', authRoutes)`; `/api/health` checa DB ping
- [ ] **T2.6** [P] — Teste de integração de auth (supertest) (`backend/src/routes/auth.routes.test.ts`)
  - Pronto: 4 testes — login OK / login fail / me sem cookie / me com cookie válido
- [ ] **T2.7** [CHECKPOINT] — Rodar `npm run dev` no backend e validar via curl que login funciona, cookie é setado, me retorna o user

## F3 — Posts CRUD + Categorias

- [ ] **T3.1** — Implementar `post.service` (`backend/src/services/post.service.ts`)
  - Funções: `list({page, pageSize, status, search, categoryId})`, `getById(id)`, `getBySlug(slug)`, `create(input)`, `update(id, patch)`, `delete(id)`, `publish(id)`, `unpublish(id)`, `generateUniqueSlug(title)`
  - Pronto: `generateUniqueSlug` cobre colisão com sufixo `-2`, `-3`, ...; testes unitários cobrem cada função (mínimo 8)
- [ ] **T3.2** [P] — Implementar `category.service` (`backend/src/services/category.service.ts`)
  - Pronto: `listAll()` retorna todas as categorias ordenadas por nome; teste unitário simples
- [ ] **T3.3** — Controllers + rotas de posts (`backend/src/controllers/post.controller.ts` + `backend/src/routes/post.routes.ts`) → R8, R9, R10
  - Pronto: 7 endpoints (list, get, create, patch, delete, publish, unpublish); todos atrás de `requireAuth`; `delete` exige `role=ADMIN` via CASL ou check direto; validação Zod em todos
- [ ] **T3.4** [P] — Rota `GET /api/v1/categories` (`backend/src/routes/category.routes.ts`)
  - Pronto: retorna lista de categorias; auth required
- [ ] **T3.5** — Wire das rotas em `app.ts`
  - Pronto: posts e categories montadas em `/api/v1`
- [ ] **T3.6** [P] — Testes de integração de posts (`backend/src/routes/post.routes.test.ts`)
  - Pronto: 6 testes — create / list filtro / publish / unpublish / delete sem auth (401) / slug duplicado gera sufixo
- [ ] **T3.7** [CHECKPOINT] — Validar via curl: criar post, listar, publicar, ver mudança no banco

## F4 — Upload via MinIO (presigned URLs)

- [ ] **T4.1** — Implementar `upload.service` com AWS SDK S3 apontando para MinIO (`backend/src/services/upload.service.ts`)
  - Funções: `ensureBucket()` (idempotente, cria `aumaf-blog-images` se não existir + define policy de leitura pública), `getPresignedPutUrl({filename, contentType})`, `getPublicUrl(key)`
  - Pronto: testes unitários mockando S3Client; chave gerada como `posts/<uuid>-<filename>`
- [ ] **T4.2** — Chamar `ensureBucket()` no boot do backend (`backend/src/server.ts`)
  - Pronto: log "MinIO bucket ready: aumaf-blog-images" no startup; falha de boot se não conseguir
- [ ] **T4.3** — Controller + rota `POST /api/v1/uploads/presign` → R11
  - Pronto: valida `PresignInput` (10 MB max, contentType whitelist); retorna `PresignOutput`; `requireAuth`
- [ ] **T4.4** [P] — Adicionar `MINIO_PUBLIC_URL` ao env e usar em `getPublicUrl` (para que o navegador acesse direto :9000 em dev)
  - Pronto: env documentada; URL retornada é `http://localhost:9000/aumaf-blog-images/<key>` em dev
- [ ] **T4.5** [CHECKPOINT] — Testar via curl: pedir presigned URL, fazer PUT com curl, baixar via URL pública

## F5 — Endpoint de Leads (POST público + GET admin)

- [ ] **T5.1** — Implementar `lead.service` (`backend/src/services/lead.service.ts`)
  - Funções: `create(input)`, `list({page, pageSize})`, `countLast30Days()`
  - Pronto: testes unitários cobrindo create + list + count
- [ ] **T5.2** — Rotas `POST /api/v1/leads` (público, rate limit estrito) e `GET /api/v1/leads` (auth) (`backend/src/routes/lead.routes.ts`)
  - Pronto: POST aceita `LeadInput` Zod; rate limit 10/min por IP no POST; GET retorna paginado autenticado
- [ ] **T5.3** [P] — Teste de integração — `lead.routes.test.ts`
  - Pronto: POST sucesso / POST validação / GET sem auth (401) / GET com auth

> **Nota**: a UI de listagem de leads no admin é Phase 2 — esta iteração só constrói o endpoint para que (a) o form do site público (já existente) tenha onde mandar dados, (b) o dashboard possa contar leads últimos 30 dias.

## F6 — IA multi-provedor

- [ ] **T6.1** — Definir interface e tipos (`backend/src/services/ai/provider.interface.ts` + `backend/src/services/ai/ai.types.ts`)
  - Pronto: `AIProvider` interface; tipos importados do `@aumaf/shared`
- [ ] **T6.2** — Escrever system prompt longo de blog SEO em pt-BR (`backend/src/services/ai/prompts/blog-post.prompt.ts`)
  - Pronto: ~1500 tokens cobrindo identidade AUMAF, regras SEO/GEO, estrutura, tom variável, output JSON estrito
- [ ] **T6.3** [P] — Implementar `AnthropicProvider` (`backend/src/services/ai/providers/anthropic.provider.ts`)
  - Pronto: usa `@anthropic-ai/sdk`; modelo `claude-sonnet-4-6` default; cache_control no system; parse JSON da resposta; retorna `GeneratePostOutput`; teste unitário com SDK mockado
- [ ] **T6.4** [P] — Implementar `OpenAIProvider` (`backend/src/services/ai/providers/openai.provider.ts`)
  - Pronto: usa `openai`; modelo `gpt-4o-mini` default; usa `response_format: { type: 'json_object' }`; teste mockado
- [ ] **T6.5** [P] — Implementar `GeminiProvider` (`backend/src/services/ai/providers/gemini.provider.ts`)
  - Pronto: usa `@google/genai`; modelo `gemini-2.0-flash-exp`; `generationConfig.responseMimeType: 'application/json'`; teste mockado
- [ ] **T6.6** — Implementar `ai.service` facade (`backend/src/services/ai/ai.service.ts`) → R16, R17
  - Pronto: `getProvider(requested?)` retorna a instância correta; `generatePost` chama provider, mede latência, loga estruturado, propaga erros como `HttpError`; timeout 90s wrap com `AbortController`
- [ ] **T6.7** — Controller + rota `POST /api/v1/ai/generate-post` → R13, R14, R15
  - Pronto: valida `GeneratePostInput`; `requireAuth`; retorna `GeneratePostOutput`; testes de erro (provider inválido, timeout simulado)
- [ ] **T6.8** [P] — Adicionar 3 SDKs aos `dependencies` do backend
  - Pronto: `@anthropic-ai/sdk`, `openai`, `@google/genai` instaladas; `npm install` sem erros
- [ ] **T6.9** [CHECKPOINT] — Testar geração com cada um dos 3 provedores via curl com tema de teste

## F7 — Métricas do dashboard

- [ ] **T7.1** — Implementar `metrics.service` (`backend/src/services/metrics.service.ts`) → R18, R19, R20
  - Funções: `getDashboard()` retorna `DashboardMetrics` (4 contagens + 5 posts + 5 leads)
  - Pronto: contagens via `prisma.post.count({ where })`; recentes via `findMany({ orderBy, take: 5 })`; máscara de email/telefone aplicada antes de retornar
- [ ] **T7.2** — Controller + rota `GET /api/v1/metrics/dashboard`
  - Pronto: `requireAuth`; cache opcional in-memory por 30s
- [ ] **T7.3** [P] — Teste unitário de máscara (`backend/src/lib/mask.ts`)
  - Pronto: `maskEmail('joao@x.com')` → `j***@x.com`; `maskPhone('11999998888')` → `(11) 9 ****-8888`
- [ ] **T7.4** [CHECKPOINT] — Validar dashboard endpoint via curl

## F8 — Frontend admin: fundação

- [ ] **T8.1** — Adicionar deps necessárias (`frontend-admin/package.json`)
  - `react-router-dom`, `@tanstack/react-query`, `@tanstack/react-query-devtools`, `axios`, `zustand`, `@aumaf/shared` (workspace), `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `slugify`, `date-fns`, `sonner` (toast), `lucide-react` (icons)
  - Pronto: `npm install` sem erros; `npm run typecheck` passa
- [ ] **T8.2** — Configurar QueryClient + Router providers em `main.tsx`
  - Pronto: app envolto por `<QueryClientProvider>` + `<RouterProvider>`; devtools só em dev
- [ ] **T8.3** [P] — Atualizar `lib/api.ts` (axios instance)
  - Pronto: `baseURL` do env (`VITE_API_URL`); `withCredentials: true`; interceptor de erro 401 → `auth.store.logout()` + redirect `/login`
- [ ] **T8.4** [P] — Criar `lib/query-client.ts` com defaults (staleTime, retry, refetchOnWindowFocus)
  - Pronto: defaults razoáveis (`staleTime: 30s`, `retry: 1`, `refetchOnWindowFocus: false`)
- [ ] **T8.5** [P] — Criar `stores/auth.store.ts` (Zustand)
  - Pronto: `{ user, setUser, clear }`; nada persistido (cookie é a verdade)
- [ ] **T8.6** [P] — Atualizar `tailwind.config.ts` para puxar tokens da paleta AUMAF (já em uso no público — copiar valores, não importar arquivos)
  - Pronto: cores `bg-black`, `primary` verde `#61c54f`, surfaces escuras; fonte Space Grotesk
- [ ] **T8.7** [CHECKPOINT] — App roda em :5174, mostra placeholder, sem erros no console

## F9 — Frontend admin: layout + auth

- [ ] **T9.1** — Implementar `AuthGuard` (`frontend-admin/src/features/auth/components/AuthGuard.tsx`) → R5
  - Pronto: usa `useMe()`; loading → spinner; 401 → `<Navigate to="/login" />`; sucesso → `<Outlet />`
- [ ] **T9.2** — Hooks de auth (`frontend-admin/src/features/auth/api/{useLogin,useLogout,useMe}.ts`)
  - Pronto: `useLogin` mutation chama `/auth/login`; `useMe` query chama `/auth/me` (staleTime grande); `useLogout` invalida `me` e redireciona
- [ ] **T9.3** — `LoginPage` (`frontend-admin/src/features/auth/pages/LoginPage.tsx`) → R5, R6, R7
  - Pronto: form com email + senha; Zod validation client-side; submit chama `useLogin`; erro genérico ao falhar; redirect `/dashboard` em sucesso; tela com identidade AUMAF (logo + paleta)
- [ ] **T9.4** [P] — `AdminShell` + `Sidebar` + `Topbar` (`frontend-admin/src/components/layout/`)
  - Pronto: sidebar com itens (Dashboard, Posts, Mídia[disabled], Leads[disabled], Settings[disabled]); topbar com nome user + dropdown Logout; responsivo (drawer mobile)
- [ ] **T9.5** — `routes.tsx` configurando todas as rotas com `AuthGuard` no shell
  - Pronto: estrutura: `/login` (público) | `/` (AuthGuard wrap AdminShell) → `/dashboard`, `/posts`, `/posts/new`, `/posts/:id`
- [ ] **T9.6** [P] — Componente `LoadingScreen` + `ErrorBoundary` global
  - Pronto: spinner centralizado para suspense; ErrorBoundary mostra mensagem amigável + botão "Recarregar"
- [ ] **T9.7** [CHECKPOINT] — Login completo funcional E2E manual: acessa `/`, é redirecionado para `/login`, loga, vê o shell, faz logout, volta para `/login`

## F10 — Frontend admin: Dashboard

- [ ] **T10.1** — Hook `useMetrics` (`frontend-admin/src/features/dashboard/api/useMetrics.ts`)
  - Pronto: query `['metrics', 'dashboard']`; refetch a cada 60s
- [ ] **T10.2** — Componentes `KpiCard` + `RecentPostsList` + `RecentLeadsList` (`frontend-admin/src/features/dashboard/components/`)
  - Pronto: KpiCard com label, valor grande, ícone Lucide; lista vazia bem desenhada com mensagem ("Sem leads ainda" / "Crie seu primeiro post")
- [ ] **T10.3** — `DashboardPage` (`frontend-admin/src/features/dashboard/pages/DashboardPage.tsx`) → R18, R19, R20
  - Pronto: 4 KpiCards no topo (grid 4 col desktop, 2 mobile); 2 listas abaixo (grid 2 col desktop, stacked mobile); título "Olá, {user.name}"; loading skeleton enquanto fetch
- [ ] **T10.4** [CHECKPOINT] — Dashboard mostra dados reais do banco; navegar para edit de post via clique no item da lista

## F11 — Frontend admin: Posts CRUD

- [ ] **T11.1** — Hooks de posts (`frontend-admin/src/features/posts/api/{usePosts,usePost,useCreatePost,useUpdatePost,usePublishPost,useUnpublishPost,useDeletePost}.ts`)
  - Pronto: cada mutation invalida `['posts']` e `['metrics', 'dashboard']`; `usePosts` aceita filtros como params
- [ ] **T11.2** — `PostStatusBadge` + `PostFilters` (search debounced + status dropdown + categoria) (`frontend-admin/src/features/posts/components/`)
  - Pronto: badge com cores por status; filtros sincronizam com query params da URL
- [ ] **T11.3** — `PostsListPage` (`frontend-admin/src/features/posts/pages/PostsListPage.tsx`)
  - Pronto: tabela com colunas (Título, Categoria, Status, Atualizado em, Autor, Ações); ação "Editar" + "Excluir" com confirm; botão "Novo post" no topo direito; paginação
- [ ] **T11.4** — `SlugInput` (auto-gerado a partir do título via `slugify`, editável manualmente, indica disponibilidade) (`frontend-admin/src/features/posts/components/SlugInput.tsx`)
  - Pronto: ao digitar título e blur, slug é populado se vazio; pode ser sobrescrito manualmente
- [ ] **T11.5** [CHECKPOINT] — Listagem + filtros + delete funcionando

## F12 — Frontend admin: Editor TipTap + Upload

- [ ] **T12.1** — Componente `TiptapEditor` (`frontend-admin/src/features/editor/TiptapEditor.tsx`)
  - Pronto: editor com extensions configuradas; toolbar com botões (bold, italic, h2, h3, list, ordered list, quote, code, link, imagem); placeholder "Escreva o conteúdo do post..."
- [ ] **T12.2** — Hook `useUploadImage` que: pede presigned URL ao backend → faz `PUT` no MinIO → retorna URL pública (`frontend-admin/src/features/editor/useUploadImage.ts`)
  - Pronto: progress callback opcional; tratamento de erro com toast
- [ ] **T12.3** — `MediaPickerDialog` (`frontend-admin/src/features/editor/MediaPickerDialog.tsx`)
  - Pronto: modal com drag-and-drop + seletor de arquivo; mostra preview; botão "Inserir"; integrado com `useUploadImage`
- [ ] **T12.4** — Estender Image extension do TipTap para usar `MediaPickerDialog` ao clicar no botão de imagem da toolbar (`frontend-admin/src/features/editor/extensions/`)
  - Pronto: clicar em "imagem" abre o dialog; URL escolhida é inserida no editor
- [ ] **T12.5** — `PostEditorPage` (`frontend-admin/src/features/posts/pages/PostEditorPage.tsx`) → R8, R9, R10, R11, R12
  - Pronto: layout 2 colunas (editor à esquerda, sidebar de meta à direita); campos: title, slug, excerpt, coverImage (com preview + botão upload), category, metaTitle, metaDescription; botões topbar: Salvar rascunho, Publicar, Despublicar, Excluir; badge "salvo / salvando / erro"; warning ao sair com mudanças não salvas
- [ ] **T12.6** [CHECKPOINT] — Criar post completo do zero: título, conteúdo com formatação + imagem, categoria, capa, salvar como rascunho, publicar, ver no banco

## F13 — Frontend admin: Painel de IA

- [ ] **T13.1** — Hook `useGeneratePost` (`frontend-admin/src/features/ai/api/useGeneratePost.ts`)
  - Pronto: mutation com timeout 95s no axios; sem retry automático
- [ ] **T13.2** — `AIPanel` (`frontend-admin/src/features/ai/components/AIPanel.tsx`) → R13, R14, R15, R16
  - Pronto: dropdown provedor (Padrão/Anthropic/OpenAI/Gemini); textarea tema; chips keywords; radio tom; slider tamanho; botão "Gerar rascunho"; loading com timer "Gerando há Xs..."; toast de erro com botão retry; em sucesso: confirm "Substituir conteúdo?" se houver conteúdo; insere via `editor.commands.setContent(html)` e popula campos vazios (title, excerpt, metaTitle, metaDescription)
- [ ] **T13.3** — Integrar `AIPanel` no `PostEditorPage` como sidebar colapsável à direita
  - Pronto: panel pode ser colapsado/expandido; estado persiste em localStorage (apenas o aberto/fechado)
- [ ] **T13.4** [CHECKPOINT] — Gerar post com cada um dos 3 provedores e revisar/editar/publicar

## F14 — Storybook + Testes (constituição obrigatória)

- [ ] **T14.1** [P] — Stories para componentes UI já criados: `KpiCard`, `PostStatusBadge`, `LoginForm`
  - Pronto: 3+ stories rodando em `npm run storybook`
- [ ] **T14.2** [P] — Story para `TiptapEditor` com conteúdo de exemplo
  - Pronto: editor renderiza, toolbar funcional
- [ ] **T14.3** [P] — Teste Vitest para utils críticos: `slugify` wrapper, masks, formatadores de data
  - Pronto: 5+ testes unitários verdes
- [ ] **T14.4** — Playwright E2E: fluxo de login → criar post via IA → publicar (`frontend-admin/e2e/blog-flow.spec.ts`)
  - Pronto: spec verde local; mocka apenas a chamada do AI provider para não consumir crédito real
- [ ] **T14.5** [P] — Playwright E2E: tentar acessar `/dashboard` sem login → redireciona `/login`
  - Pronto: spec verde

## F15 — Validação final + retrospectiva

- [ ] **T15.1** — Rodar `npm run build` em todos os 4 workspaces
  - Pronto: zero erros
- [ ] **T15.2** — Rodar `npm run typecheck` no monorepo
  - Pronto: zero erros
- [ ] **T15.3** — Rodar `npm run lint` no monorepo
  - Pronto: zero warnings em código novo
- [ ] **T15.4** — Preencher tabela de validação no `status.md` mapeando cada R<N> para evidência (teste ou screenshot)
  - Pronto: todos os critérios de Phase 1 (R5-R20) marcados ✅
- [ ] **T15.5** [CHECKPOINT] — Demo manual: login → dashboard → criar post via IA → upload imagem → publicar → ver no listing
- [ ] **T15.6** — Atualizar `INDEX.md` e `HISTORY.md` com a entrega de Phase 1; manter spec ainda em `_active/` (Phase 2 reabre)
  - Pronto: índice mostra Phase 1 ✅, Phase 2 a iniciar
- [ ] **T15.7** — Commit final convencional `feat(backoffice): Phase 1 — auth, dashboard, posts CRUD, IA multi-provedor`

---

## Notas de execução

- Marque checkbox conforme concluir
- Tarefas `[P]` podem ir para subagentes paralelos quando vier a hora
- Em `[CHECKPOINT]`, **pare** e atualize `status.md` antes de prosseguir
- Se uma task descobrir necessidade fora de escopo desta iteração, registre em `status.md` (seção "Descobertas") e **continue** sem implementar
- **Nunca** tocar arquivos de `frontend-public/` — qualquer mudança no público é Phase 2
