# Design — q2-blog-backoffice (Phase 1)

> HOW desta iteração: auth, dashboard, gestão de posts com IA multi-provedor.

**Linkado a**: [requirements.md](./requirements.md)
**Iteração**: Phase 1
**Última atualização**: 2026-05-03

---

## 1. Visão geral da solução

O backoffice da AUMAF 3D nesta iteração é um SPA React (`frontend-admin`) consumindo uma API REST do `backend` Express. A autenticação usa JWT em cookie httpOnly (sameSite=strict), validado em todas as rotas privadas via middleware. O admin único é seedado por variáveis de ambiente (`ADMIN_EMAIL`/`ADMIN_PASSWORD` com hash bcrypt cost 12).

A gestão de posts oferece CRUD completo (lista, criar, editar, publicar, deletar), com editor rich text TipTap. Imagens são enviadas para MinIO via presigned URL gerada pelo backend (cliente faz `PUT` direto no MinIO, evitando passar bytes pelo Express). O painel de IA permite gerar um rascunho a partir de um tema/prompt, com escolha de provedor (Anthropic, OpenAI ou Gemini) por requisição. O backend abstrai os 3 provedores atrás de uma interface única `AIProvider`, com seleção em runtime.

O dashboard exibe métricas em tempo real do banco — contagens de posts por status, leads dos últimos 30 dias, posts gerados por IA. Frontend usa TanStack Query para cache + revalidação automática. Roteamento por React Router v6 com loaders e guards de auth.

Fora desta iteração: UI de leads e settings, migração do blog público, CRUD de categorias, BullMQ assíncrono. Todos seguem em Phase 2 sem mudança de schema.

## 2. Arquitetura

### Diagrama de componentes

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (admin)                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ frontend-admin (React + Vite)                            │   │
│  │  ├── React Router v6 (com auth guards)                   │   │
│  │  ├── TanStack Query v5 (cache + revalidation)            │   │
│  │  ├── TipTap editor                                       │   │
│  │  ├── Radix UI + Tailwind                                 │   │
│  │  └── lib/api.ts (axios client com cookies)               │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS (cookies httpOnly)
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  backend (Express :3000)                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Middlewares globais: helmet, cors, hpp, rate-limit,      │   │
│  │ cookieParser, express.json, pino-http                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Rotas (/api/v1)                                          │   │
│  │  ├── /auth/{login,logout,me}                             │   │
│  │  ├── /posts (CRUD, requer auth)                          │   │
│  │  ├── /uploads/presign (gera URL para MinIO)              │   │
│  │  ├── /ai/generate-post (multi-provedor)                  │   │
│  │  ├── /metrics/dashboard (KPIs)                           │   │
│  │  └── /leads (POST público; GET admin — Phase 2 UI)       │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Services                                                 │   │
│  │  ├── auth.service (bcrypt + JWT)                         │   │
│  │  ├── post.service (CRUD, slug uniqueness)                │   │
│  │  ├── upload.service (S3 presigned URL via MinIO)         │   │
│  │  ├── ai.service ──> AIProvider (3 implementações)        │   │
│  │  └── metrics.service                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Prisma Client → PostgreSQL :5432                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────┘
          │            │            │
          ▼            ▼            ▼
   ┌────────────┐ ┌─────────┐ ┌─────────────┐
   │ PostgreSQL │ │ MinIO   │ │ AI APIs     │
   │   :5432    │ │  :9000  │ │ Anthropic   │
   │            │ │         │ │ OpenAI      │
   │            │ │         │ │ Gemini      │
   └────────────┘ └─────────┘ └─────────────┘
```

### Mudanças por camada

- **Decisão de formato (D11-D13, 2026-05-03)**: posts são persistidos em **Markdown (CommonMark + GFM)**, não HTML. Editor é dual-mode (Tiptap Visual + textarea Código), com conversores caseiros `markdownToHtml`/`htmlToMarkdown` (sem `marked`/`turndown`). Preview no admin via `react-markdown` + `remark-gfm` + `rehype-highlight`. IA gera Markdown direto (mais natural para os 3 provedores). `SanitizedHtml` omitido (sem HTML legado). CASL omitido (1 admin único — check direto de role suficiente).
- **Frontend admin**: estrutura de pastas `features/{auth,posts,dashboard,media,ai,editor}`, rotas, layout, todas as páginas listadas em §6
- **Backend**: novos diretórios `routes/`, `controllers/`, `services/`, `middlewares/`, `lib/`, `services/ai/providers/`
- **Banco de dados**: nenhuma alteração no schema Prisma desta iteração — todos os modelos necessários já existem
- **Infra**: bucket MinIO `aumaf-blog-images` criado no boot do backend (idempotente); novas env vars (`JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AI_PROVIDER`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`)
- **Pacote `@aumaf/shared`**: schemas Zod compartilhados para Post, Login, GeneratePost, etc.

## 3. Modelo de dados

### Sem mudanças no schema Prisma

Todos os modelos necessários já existem (`User`, `Category`, `Post`, `Lead`, `Setting`). A única operação de banco no boot é o seed:

- **Seed admin**: cria 1 usuário com `role=ADMIN`, `email=$ADMIN_EMAIL`, `password=bcrypt($ADMIN_PASSWORD, 12)` se não existir
- **Seed categorias**: 4 categorias iniciais — `Engenharia` (engenharia), `Materiais` (materiais), `Cases` (cases), `Tutorial` (tutorial)
- **Seed posts**: opcional — apenas para popular o banco e testar a listagem do admin. **Não toca em nenhum arquivo de `frontend-public/`** — apenas lê o conteúdo dos `.astro` e insere registros no DB. Os arquivos do site público continuam intactos servindo o blog até a Phase 2.

### Migrations necessárias

Nenhuma. O schema existente cobre toda a Phase 1.

## 4. Contratos de API

### Convenções

- Prefixo: `/api/v1`
- Auth: cookie `aumaf_session` (JWT httpOnly, sameSite=strict, max-age 7d)
- Erros padronizados:
  ```json
  { "status": "error", "code": "INVALID_CREDENTIALS", "message": "..." }
  ```
- Sucesso simples:
  ```json
  { "status": "ok", "data": { ... } }
  ```

### Endpoints

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/v1/auth/login` | Login com e-mail/senha; seta cookie | público |
| POST | `/api/v1/auth/logout` | Invalida cookie | autenticado |
| GET | `/api/v1/auth/me` | Retorna usuário atual | autenticado |
| GET | `/api/v1/posts` | Lista posts (paginado, filtros) | autenticado |
| GET | `/api/v1/posts/:id` | Busca post por id | autenticado |
| POST | `/api/v1/posts` | Cria post | autenticado (ADMIN/EDITOR) |
| PATCH | `/api/v1/posts/:id` | Atualiza post | autenticado (ADMIN/EDITOR) |
| DELETE | `/api/v1/posts/:id` | Deleta post | autenticado (ADMIN) |
| POST | `/api/v1/posts/:id/publish` | Publica post (status=PUBLISHED, publishedAt=now) | autenticado (ADMIN) |
| POST | `/api/v1/posts/:id/unpublish` | Despublica (status=DRAFT) | autenticado (ADMIN) |
| GET | `/api/v1/categories` | Lista categorias | autenticado |
| POST | `/api/v1/uploads/presign` | Gera presigned URL para upload no MinIO | autenticado |
| POST | `/api/v1/ai/generate-post` | Gera rascunho de post com IA | autenticado |
| GET | `/api/v1/metrics/dashboard` | KPIs e listas do dashboard | autenticado |
| POST | `/api/v1/leads` | Cria lead (do form do site público) | público (rate-limited) |
| GET | `/api/v1/leads` | Lista leads (Phase 2 UI usará) | autenticado (ADMIN) |

### Schemas Zod (em `@aumaf/shared`)

Todos os schemas são exportados de `packages/shared/src/schemas/` e importados pelo backend (validação de entrada) e pelo frontend (tipagem + validação de form).

```typescript
// auth.schemas.ts
export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
export const AuthUser = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'EDITOR', 'MARKETING']),
})

// post.schemas.ts
export const PostStatus = z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'UNPUBLISHED'])
export const PostInput = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().max(300).optional().nullable(),
  content: z.string().min(1),
  coverImageUrl: z.string().url().optional().nullable(),
  metaTitle: z.string().max(60).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  status: PostStatus.default('DRAFT'),
  generatedByAi: z.boolean().default(false),
  categoryId: z.string().cuid().optional().nullable(),
})
export const PostListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: PostStatus.optional(),
  search: z.string().optional(),
  categoryId: z.string().cuid().optional(),
})

// upload.schemas.ts
export const PresignInput = z.object({
  filename: z.string().min(1),
  contentType: z.enum(['image/png', 'image/jpeg', 'image/webp', 'image/avif']),
  size: z.number().int().min(1).max(10 * 1024 * 1024), // 10 MB
})
export const PresignOutput = z.object({
  uploadUrl: z.string().url(),
  publicUrl: z.string().url(),
  key: z.string(),
  expiresIn: z.number(),
})

// ai.schemas.ts
export const AIProvider = z.enum(['anthropic', 'openai', 'gemini'])
export const GeneratePostInput = z.object({
  topic: z.string().min(5).max(500),
  keywords: z.array(z.string()).max(10).optional(),
  tone: z.enum(['técnico', 'didático', 'comercial']).default('didático'),
  targetWordCount: z.number().int().min(300).max(3000).default(1200),
  provider: AIProvider.optional(), // se omitido, usa AI_PROVIDER do .env
})
export const GeneratePostOutput = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  content: z.string(), // HTML pronto para TipTap
  metaTitle: z.string(),
  metaDescription: z.string(),
  suggestedCategorySlug: z.string().optional(),
  provider: AIProvider,
  model: z.string(),
  usage: z.object({
    inputTokens: z.number(),
    outputTokens: z.number(),
    estimatedCostUsd: z.number().optional(),
  }),
  latencyMs: z.number(),
})

// lead.schemas.ts
export const LeadInput = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().max(2000).optional(),
  source: z.string().optional(), // 'contato', 'orcamento', etc.
})

// metrics.schemas.ts
export const DashboardMetrics = z.object({
  postsPublished: z.number(),
  postsDraft: z.number(),
  leadsLast30d: z.number(),
  postsByAi: z.number(),
  recentPosts: z.array(z.object({
    id: z.string(),
    title: z.string(),
    status: PostStatus,
    updatedAt: z.string(),
  })),
  recentLeads: z.array(z.object({
    id: z.string(),
    name: z.string(),
    contactMasked: z.string(),
    source: z.string().nullable(),
    createdAt: z.string(),
  })),
})
```

## 5. Camada de IA — multi-provedor

### Interface comum

```typescript
// backend/src/services/ai/provider.interface.ts
export interface AIProvider {
  readonly name: 'anthropic' | 'openai' | 'gemini'
  readonly defaultModel: string
  generatePost(input: GeneratePostInput): Promise<GeneratePostOutput>
}
```

### Implementações

```
backend/src/services/ai/
├── ai.service.ts             # facade — escolhe provider pelo env ou input
├── provider.interface.ts
├── prompts/
│   └── blog-post.prompt.ts   # system prompt longo (cacheável)
└── providers/
    ├── anthropic.provider.ts # @anthropic-ai/sdk
    ├── openai.provider.ts    # openai
    └── gemini.provider.ts    # @google/genai
```

### Seleção de provedor

```typescript
function getProvider(requested?: 'anthropic' | 'openai' | 'gemini'): AIProvider {
  const choice = requested ?? env.AI_PROVIDER
  switch (choice) {
    case 'anthropic': return new AnthropicProvider()
    case 'openai':    return new OpenAIProvider()
    case 'gemini':    return new GeminiProvider()
    default: throw new HttpError(400, 'INVALID_AI_PROVIDER', `Unknown provider: ${choice}`)
  }
}
```

### Modelos default por provedor

| Provedor | Modelo default | Por quê |
|----------|----------------|---------|
| anthropic | `claude-sonnet-4-6` | Melhor qualidade pt-BR; prompt caching no system prompt longo |
| openai | `gpt-4o-mini` | Rápido + barato; suficiente para SEO blog post |
| gemini | `gemini-2.0-flash-exp` | Rápido + grátis no tier inicial; suporta JSON mode |

Cada provider expõe seu modelo via env (ex: `ANTHROPIC_MODEL`) com fallback ao default.

### System prompt (compartilhado)

Vai em `prompts/blog-post.prompt.ts` — string longa (~2000 tokens) com:
- Identidade da AUMAF 3D (impressão 3D profissional, São Carlos – SP)
- Regras de SEO/GEO em pt-BR
- Estrutura desejada (H1, lead, H2 seções, conclusão com CTA WhatsApp)
- Tom (técnico/didático/comercial conforme input)
- Restrições (não inventar dados; sempre citar quando especulativo)
- Output: JSON estrito com `title`, `slug`, `excerpt`, `content` (HTML), `metaTitle`, `metaDescription`, `suggestedCategorySlug`

Para Anthropic, esse prompt vai com `cache_control: { type: 'ephemeral' }` para reduzir custo de geração recorrente.

### Tratamento de erros

- Timeout de 90s por requisição (cliente HTTP de cada SDK)
- Retry: zero (deixa o usuário re-tentar manualmente para evitar duplo custo)
- Rate limit excedido → erro 429 propagado com mensagem amigável
- API key inválida → erro 502 com mensagem genérica (não vazar config)
- Logs estruturados Pino: `{ provider, model, inputTokens, outputTokens, latencyMs, costUsd }` por requisição

## 6. Frontend admin — estrutura e rotas

### Estrutura de pastas

```
frontend-admin/src/
├── App.tsx                     # router root
├── main.tsx                    # bootstrap (QueryClient, Router)
├── routes.tsx                  # definição de rotas
├── lib/
│   ├── api.ts                  # axios instance com baseURL + withCredentials
│   ├── query-client.ts         # TanStack Query config
│   └── utils.ts                # helpers (cn, dates, masks)
├── components/
│   ├── ui/                     # primitivos Radix + Tailwind (Button, Input, Dialog, etc.)
│   └── layout/
│       ├── AdminShell.tsx      # sidebar + topbar wrapper
│       ├── Sidebar.tsx
│       └── Topbar.tsx
├── features/
│   ├── auth/
│   │   ├── api/                # useLogin, useLogout, useMe (TanStack Query)
│   │   ├── components/         # LoginForm, AuthGuard
│   │   └── pages/LoginPage.tsx
│   ├── dashboard/
│   │   ├── api/useMetrics.ts
│   │   ├── components/         # KpiCard, RecentPostsList, RecentLeadsList
│   │   └── pages/DashboardPage.tsx
│   ├── posts/
│   │   ├── api/                # usePosts, usePost, useCreatePost, useUpdatePost, etc.
│   │   ├── components/         # PostsTable, PostStatusBadge, PostFilters, SlugInput
│   │   └── pages/
│   │       ├── PostsListPage.tsx
│   │       └── PostEditorPage.tsx
│   ├── editor/
│   │   ├── TiptapEditor.tsx    # componente reutilizável
│   │   ├── extensions/         # imagem com upload, link, etc.
│   │   └── MediaPickerDialog.tsx
│   └── ai/
│       ├── api/useGeneratePost.ts
│       ├── components/AIPanel.tsx  # dropdown provedor + textarea + botão
│       └── prompts.ts          # presets de tema (opcional)
└── stores/
    └── auth.store.ts           # Zustand para estado leve do user (cache do /me)
```

### Rotas

| Path | Componente | Auth | Notas |
|------|-----------|------|-------|
| `/login` | `LoginPage` | público | Redirect para `/` se já logado |
| `/` | redirect → `/dashboard` | — | — |
| `/dashboard` | `DashboardPage` | requer | Home com métricas |
| `/posts` | `PostsListPage` | requer | Tabela com filtros + busca |
| `/posts/new` | `PostEditorPage` | requer | Editor vazio |
| `/posts/:id` | `PostEditorPage` | requer | Editor com post carregado |
| `*` | `NotFoundPage` | — | Fallback |

### Layout (AdminShell)

- Sidebar fixa à esquerda (240px desktop; drawer no mobile): Dashboard, Posts, Mídia (placeholder Phase 2), Leads (placeholder Phase 2), Settings (placeholder Phase 2)
- Topbar: nome do site + nome do user + dropdown logout
- Main: `<Outlet />` do React Router
- Tema: dark por padrão (constituição do projeto)

### Editor de post

- TipTap com extensões: `StarterKit`, `Image` (custom para upload via MinIO), `Link`, `Placeholder`, `Heading`, `BulletList`, `OrderedList`, `Blockquote`, `CodeBlock`
- Toolbar fixa no topo do editor com botões para cada extensão
- Botão "Inserir imagem" abre `MediaPickerDialog` que permite drag-and-drop de 1 imagem por vez; backend gera presigned URL; cliente faz `PUT` direto no MinIO; URL pública é inserida no editor
- Sidebar do editor: campos `title`, `slug` (auto-gerado, editável), `excerpt`, `coverImage`, `category`, `metaTitle`, `metaDescription`, `status`
- Botões na topbar do editor: `Salvar rascunho`, `Publicar`, `Despublicar`, `Excluir`
- Indicador de salvamento (R12): badge "salvo / salvando / erro" no canto da topbar do editor
- Auto-save desabilitado nesta iteração (apenas salvamento manual; mudanças não salvas avisam ao sair via beforeunload)

### Painel de IA

- Componente lateral colapsável no `PostEditorPage` (não bloqueia o editor)
- Campos: provedor (dropdown: Padrão/Anthropic/OpenAI/Gemini), tema (textarea), keywords (input com chips), tom (radio), tamanho alvo (slider 300-3000)
- Botão "Gerar rascunho"
- Loading state com timer (mostrar "Gerando há Xs..." até 90s)
- Em sucesso: confirma "Substituir conteúdo atual?" (se houver conteúdo) ou insere direto. Marca campos `title`, `excerpt`, `metaTitle`, `metaDescription` se vazios. Marca `generatedByAi=true` no estado local.
- Em erro: toast com mensagem + botão "Tentar novamente"

## 7. Mapeamento Requirements → Design

| Critério | Componente/arquivo responsável | Notas |
|----------|--------------------------------|-------|
| R5 (redirect login) | `frontend-admin/src/features/auth/components/AuthGuard.tsx` + React Router loader | useMe; se 401, navigate('/login') |
| R6 (login) | `backend/src/services/auth.service.ts` + `LoginPage` | bcrypt.compare + jwt.sign + Set-Cookie httpOnly |
| R7 (msg genérica) | `auth.service` retorna sempre `INVALID_CREDENTIALS` sem distinguir email/senha | — |
| R8 (criar post) | `backend/src/services/post.service.ts:create` + `PostEditorPage` (modo new) | slug auto via slugify + uniqueness check |
| R9 (rascunho persiste) | `post.service.ts` + `Post.status=DRAFT` no DB | sem `publishedAt` |
| R10 (publicar) | `POST /posts/:id/publish` → `status=PUBLISHED, publishedAt=now()` | invalida cache TanStack Query do `/posts` e `/metrics/dashboard` |
| R11 (upload MinIO) | `backend/src/services/upload.service.ts` (S3 presigner) + `MediaPickerDialog` | cliente faz PUT direto |
| R12 (status save) | `usePostMutation` + badge "Salvando..." na topbar do editor | TanStack Query `isPending`/`isSuccess`/`isError` |
| R13 (oferecer IA) | `AIPanel` no `PostEditorPage` | sempre visível |
| R14 (inserir rascunho) | `useGeneratePost` mutation + insert no editor TipTap | `editor.commands.setContent(html)` |
| R15 (erro IA) | mutation `onError` + toast | conteúdo do editor permanece intacto |
| R16 (escolha provedor) | `AIPanel` dropdown + `provider` no input → `ai.service.getProvider()` | — |
| R17 (log IA) | `pino` log no `ai.service.generatePost` | inclui `latencyMs`, `usage`, `model` |
| R18 (4 KPIs) | `metrics.service.getDashboard()` + `KpiCard` x4 | queries Prisma `count()` |
| R19 (5 posts recentes) | `metrics.service` + `RecentPostsList` | `findMany({ orderBy: updatedAt desc, take: 5 })` |
| R20 (5 leads recentes) | `metrics.service` + `RecentLeadsList` | `findMany({ orderBy: createdAt desc, take: 5 })`, máscara em `contactMasked` |

## 8. Integrações externas

| Serviço | Propósito | Custo | Limites |
|---------|-----------|-------|---------|
| Anthropic API | Geração de post (default) | ~$0.003-0.015 / post (Sonnet 4.6 + cache) | 50 req/min tier 1 |
| OpenAI API | Geração de post (alt.) | ~$0.001-0.005 / post (gpt-4o-mini) | 500 req/min tier 1 |
| Google Gemini API | Geração de post (alt.) | grátis no free tier (15 req/min) | upgrade pago se exceder |
| MinIO local | Storage de imagens em dev | grátis | sem limite local |
| AWS S3 (futuro) | Storage de imagens em prod | ~$0.023/GB/mês | depende do volume |

Toda chave de API fica em `.env` do backend, nunca exposta ao frontend. Frontend só conhece as **opções** de provedor (string), não as keys.

## 9. Boundaries (harness anti-drift)

### ✅ Always (obrigatórios nesta feature)
- JWT sempre em cookie `httpOnly`, `sameSite=strict`, `secure` em produção
- Toda rota privada do backend valida o token via middleware antes de qualquer lógica
- Validação de input via Zod schema antes de tocar service/DB
- Toda criação/edição/publicação/deleção de post emite log Pino estruturado
- Mutations de post invalidam queries `['posts']` e `['metrics', 'dashboard']` no TanStack Query
- Senhas com bcrypt cost 12 (nunca menos, nunca em texto plano)
- Slug de post sempre validado regex `/^[a-z0-9-]+$/` e único (sufixo numérico se duplicado)
- API keys de IA em `.env` apenas — nunca commitadas, nunca expostas ao frontend

### ⚠️ Ask first (exigem confirmação)
- Mudar valor default de `AI_PROVIDER` em produção
- Aumentar `JWT_EXPIRES_IN` além de 7 dias
- Reduzir cost de bcrypt abaixo de 12
- Adicionar quarto provedor de IA (LangChain, Vercel AI SDK, etc.)
- Permitir upload de imagens > 10 MB

### 🚫 Never (proibidos)
- **Nunca alterar arquivos de `frontend-public/`** nesta iteração — estamos focados exclusivamente no backoffice. Toda mudança em template público fica para Phase 2 quando migrar `/blog` para consumir API.
- Nunca armazenar senha em texto plano
- Nunca usar `localStorage` para JWT ou dados de sessão
- Nunca expor stack trace ao cliente em produção
- Nunca chamar provedor de IA sem timeout
- Nunca registrar PII em logs (e-mail, telefone em texto plano — usar máscara)
- Nunca fazer DELETE em post sem confirmação humana no UI
- Nunca commitar `.env` ou chaves
- Nunca usar `prisma migrate reset` sem aprovação humana

## 10. Alternativas consideradas

| Decisão | Opção A (escolhida) | Opção B (rejeitada) | Veredito |
|---------|--------------------|--------------------|----------|
| Editor rich text | TipTap | Lexical | TipTap mais maduro, melhor doc de imagem com upload custom |
| Routing admin | React Router v6 | TanStack Router | RR é padrão consolidado; TanStack Router melhor mas mais novo |
| Data fetching | TanStack Query v5 | SWR | TQ tem mutations + invalidation mais explícitos |
| Upload | Presigned URL → MinIO direto | Bytes via Express | Presigned é padrão S3; tira carga do Express; escala melhor |
| IA: sync vs. async | Síncrono com timeout 90s | BullMQ desde já | Sync é simples para MVP; modelos novos entregam em <40s; BullMQ vira Phase 2 se crescer |
| Multi-provedor | Interface custom | Vercel AI SDK | Interface custom mantém zero overhead e controle total; AI SDK fica para Phase 2 se quisermos streaming |
| Auth state no front | Zustand store + TanStack Query | Apenas TanStack Query | Zustand permite acesso síncrono ao user fora de hooks (logger, headers); TQ ainda é fonte da verdade |
| Workflow de aprovação | 2 estados (Draft/Published) | 3 (com PENDING_REVIEW) | Q2 tem 1 admin único; revisão = humano editar antes de publicar |

## 11. Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Provedor de IA fora do ar (timeout/rate limit) | média | médio | Multi-provedor permite fallback manual; mensagem clara ao usuário |
| Bug em slug uniqueness causa colisão | baixa | médio | Teste unitário cobrindo geração de `-2`, `-3`; lock pessimista no DB se necessário |
| MinIO não inicia ou bucket não existe | baixa | alto | Boot do backend cria bucket idempotente; healthcheck no `/api/health` checa MinIO |
| Custo de geração IA descontrolado | baixa | médio | Log estruturado de custo por requisição; limite de geração por user/dia (Phase 2) |
| Cookie cross-origin não funciona em dev | média | alto | CORS já permite credentials; `withCredentials: true` no axios; testar early |
| TipTap content quebra ao salvar | baixa | alto | Schema Zod do `content` aceita string; testes de integração com HTML real do TipTap |
| Cliente esquece senha do admin único | baixa | alto | Documentar em runbook como rodar seed novamente com nova senha (Phase 2 traz "esqueci senha") |

## 12. Plano de rollout

- **Sem feature flag** nesta iteração — backoffice é nova superfície
- Rollout: deploy direto após validação local + Playwright passar
- Métricas a monitorar pós-deploy:
  - Tempo de login p95
  - Taxa de erro nas geração de IA (por provedor)
  - Custo total de IA por dia
  - Tamanho do bucket MinIO/S3
- Plano de rollback: reverter commit; sem migration nova, banco não é afetado

## 13. Validation gate (pós-design)

- [x] Cada critério EARS está mapeado para um componente (ver §7)
- [x] Componentes não-essenciais cortados (UI de leads/settings/CRUD categoria foram para Phase 2)
- [x] Dependências externas validadas — todas as 3 SDKs de IA têm tier free/baixo custo
- [x] Plano de rollback concreto — revert simples sem migration
- [x] Boundaries cobrem cenários sensíveis (auth, upload, IA)

## 14. Links

- Requirements: [requirements.md](./requirements.md)
- Tasks: [tasks.md](./tasks.md)
- Constitution: [../../constitution.md](../../constitution.md)
- ADR-001 stack: `docs/decisions/ADR-001-stack.md`
