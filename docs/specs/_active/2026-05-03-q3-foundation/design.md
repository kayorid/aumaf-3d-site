# Q3 Foundation — Design Técnico

## Visão Arquitetural

```
              ┌─────────────────────────────────────┐
              │           Backend AUMAF              │
              │                                       │
   POST /leads│  ┌────────────┐    ┌──────────────┐  │
   ──────────►│  │ controllers├───►│   services   │  │
              │  └────────────┘    └──────┬───────┘  │
              │                            │           │
              │       ┌────────────────────┴───────┐  │
              │       ▼                            ▼  │
              │  ┌──────────┐               ┌────────┐│
              │  │ Postgres │               │ BullMQ ││ ──► Redis
              │  │ (Prisma) │               │ Queue  ││
              │  └──────────┘               └───┬────┘│
              │                                  │     │
              │  ┌──────────────────────────────┴────┐│
              │  │  Workers (mesmo processo node)    ││
              │  │  • lead-notification              ││ ──► Email transport
              │  │  • post-publish-cache             ││ ──► HTTP GET site público
              │  └────────────────────────────────────┘│
              └─────────────────────────────────────────┘
```

**Decisão:** Workers no **mesmo processo** do servidor Express por enquanto (single-binary). Ganho operacional > overhead de isolamento — adequado a 1 servidor pequeno em prod inicial. Migração para processo separado é trivial (mover `bootWorkers` para outro entry).

---

## Estrutura de Arquivos

### Backend

```
backend/src/
├── lib/
│   ├── redis.ts            # NOVO — IORedis singleton + helpers
│   └── queue.ts            # NOVO — createQueue, createWorker (factories)
├── workers/
│   ├── index.ts            # NOVO — registry: bootWorkers, shutdownWorkers
│   ├── lead-notification.worker.ts  # NOVO
│   └── post-publish.worker.ts       # NOVO
├── services/
│   ├── email.service.ts    # NOVO — transport console/smtp/stub
│   ├── lead.service.ts     # MOD — enfileirar job ao criar
│   └── post.service.ts     # MOD — enfileirar job ao publicar
├── routes/
│   └── health.routes.ts    # NOVO — GET /health
├── config/
│   └── env.ts              # MOD — adicionar EMAIL_*, ADMIN_NOTIFICATION_EMAIL
├── app.ts                  # MOD — registrar /health
└── server.ts               # MOD — bootWorkers + graceful shutdown
```

### Frontend Admin

```
frontend-admin/
├── .storybook/
│   ├── main.ts             # MOD — addons completos
│   └── preview.tsx         # MOD — wrapper Cinematic + a11y + Tailwind import
├── e2e/
│   ├── smoke.spec.ts       # já existe (login)
│   ├── posts.spec.ts       # NOVO — criar/editar/publicar
│   ├── leads.spec.ts       # NOVO — listar leads + máscara
│   └── wysiwyg.spec.ts     # NOVO — bloco DS via modal
└── src/
    ├── components/ui/*.stories.tsx       # NOVO — UI base
    ├── features/posts/components/*.stories.tsx  # NOVO — BlockPreview
    └── stories/Foundation.tokens.stories.tsx    # NOVO — design tokens
```

---

## Modelo de Dados

**Sem** mudanças no schema Prisma nesta iteração (campos Botyo ficam para spec própria quando a API existir).

---

## Contratos

### Queue: `lead-notification`

```typescript
// Job data
interface LeadNotificationJob {
  leadId: string
}

// Worker action
async function processLeadNotification(job: Job<LeadNotificationJob>) {
  const lead = await prisma.lead.findUniqueOrThrow({ where: { id: job.data.leadId } })
  await emailService.send({
    to: env.ADMIN_NOTIFICATION_EMAIL,
    subject: `Novo lead: ${lead.name}`,
    text: formatLeadEmailText(lead),
  })
}

// Defaults
{ attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: 50, removeOnFail: 100 }
```

### Queue: `post-publish-cache`

```typescript
interface PostPublishJob {
  postId: string
  slug: string
}

async function processPostPublish(job: Job<PostPublishJob>) {
  const urls = [`${env.FRONTEND_PUBLIC_URL}/blog`, `${env.FRONTEND_PUBLIC_URL}/blog/${job.data.slug}`]
  await Promise.allSettled(urls.map((url) => fetch(url, { method: 'GET' })))
}

// Defaults
{ attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 30 }
```

### `GET /health`

```json
{
  "status": "ok",
  "uptime": 1234,
  "version": "0.0.1",
  "services": {
    "db": { "status": "up", "latencyMs": 8 },
    "redis": { "status": "up", "latencyMs": 2 },
    "queues": {
      "lead-notification": { "status": "active", "waiting": 0, "active": 0, "failed": 0 },
      "post-publish-cache": { "status": "active", "waiting": 0, "active": 0, "failed": 0 }
    }
  }
}
```

503 com mesmo schema se qualquer service != up.

---

## Decisões e Alternativas

| Decisão | Razão | Alternativa rejeitada |
|---------|-------|------------------------|
| Workers no mesmo processo Express | Ops simples; 1 servidor pequeno em prod inicial | Processo separado — overhead injustificado agora |
| `ioredis` singleton em `lib/redis.ts` | Evita reconexões; BullMQ permite passar connection | Connection nova por queue — desperdício |
| Email transport console em dev | Zero config para Kayo + visibilidade | Mailhog Docker — adiciona dependência |
| Stub log em prod sem SMTP | Ainda permite go-live; substituível depois | Falhar boot — bloqueia entrega |
| Cache warm-up por GET HTTP | Astro SSR aquece cache server-side | Webhook custom — complexidade desnecessária |
| Health agrega todas dependências | Endpoint único para load balancer/uptime | Múltiplos endpoints — dispersão |
| Storybook 10 (já instalado) | Já é a versão mais recente no projeto | Downgrade — perda de features |
| Stories como `.stories.tsx` ao lado do componente | Convenção React + colocation | Pasta `stories/` central — distância do código |
| Token story manual vs auto-gen | Speed > completude | tokens-extractor — mais infra |
| Playwright já configurado | Reuso direto | Cypress — troca de stack |

---

## Riscos & Mitigações

| Risco | Mitigação |
|-------|-----------|
| BullMQ requer Redis em todos os ambientes | `docker-compose` já provisiona; teste com `ioredis-mock` em Jest |
| Worker travando todo o processo se crashar | Wrapper try/catch + log + auto-restart por BullMQ; `concurrency: 1` por worker |
| Storybook quebrando build de prod | Tarefa Turbo separada (`storybook:build`) opcional; não roda em CI obrigatório |
| Tests E2E flake por timing | Usar `expect().toHaveURL()` com `timeout`; estado limpo entre tests |
| Cache warm-up em loop infinito | Ignora erros (`Promise.allSettled`); attempts=3 |
| Email transport stub silencia erros | Sempre logar warn em prod sem SMTP — visível no Pino |

---

## Validação Anti-Over-Engineering

Auditando o plano, removi:

- ❌ `outbox-pattern` (transactional) — fire-and-forget é aceitável neste volume; outbox aparece quando Botyo precisar de garantia hard
- ❌ Worker process separado — pode adicionar quando o servidor crescer
- ❌ Mailhog em docker-compose dev — console já dá visibilidade
- ❌ Métricas Prometheus do BullMQ — health endpoint cobre o que precisamos agora
- ❌ Story para cada variante de cada Tailwind class — agrupar em "playground"
- ❌ Cobertura Vitest 100% — foco no que tem lógica, não em renderers triviais

---

## Stack Específica

| Camada | Lib | Versão |
|--------|-----|--------|
| Filas | `bullmq` | 5.76.3 (já instalado) |
| Redis | `ioredis` | 5.10.1 (já instalado) |
| Test Redis mock | `ioredis-mock` | a adicionar (devDep backend) |
| Storybook | `storybook` + `@storybook/react-vite` | 10.3.5 (já instalado) |
| A11y | `@storybook/addon-a11y` | 10.3.5 (já instalado) |
| E2E | `@playwright/test` | 1.59.1 (já instalado) |
| Vitest | `vitest` + `@testing-library/react` + `msw` | já instalados |
