# Backend — AUMAF 3D API

## Comandos

```bash
npm run dev          # tsx watch src/server.ts → :3000
npm run build        # tsc
npm run test         # jest
npm run lint         # eslint
npm run typecheck    # tsc --noEmit

npx prisma migrate dev   # nova migration
npx prisma studio        # UI do banco → :5555
npx prisma db seed       # seed inicial
```

## Estrutura

```
backend/src/
├── server.ts        # entry point — Express listen + bootWorkers
├── app.ts           # Express app factory (registra /health)
├── config/          # env vars validados com Zod (env.ts) + Pino (logger.ts)
├── lib/
│   ├── prisma.ts        # singleton Prisma
│   ├── redis.ts         # singleton IORedis (maxRetriesPerRequest=null)
│   ├── queue.ts         # createQueue / createWorker (factories BullMQ)
│   ├── http-error.ts
│   ├── slug.ts / mask.ts / s3-client.ts
├── workers/
│   ├── index.ts                       # registry: bootWorkers/shutdownWorkers
│   ├── register.ts                    # side-effect imports dos workers
│   ├── lead-notification.worker.ts    # email ao admin via BullMQ
│   └── post-publish.worker.ts         # cache warm-up Astro SSR
├── routes/health.routes.ts            # /health agregado (DB+Redis+queues)
├── services/
│   ├── email.service.ts               # transports: console/smtp/stub
│   ├── lead.service.ts                # createLead enfileira notificação
│   ├── post.service.ts                # publish enfileira warmup + IndexNow ping
│   ├── indexnow.service.ts            # push para Bing/Yandex/Seznam/Naver (best-effort)
│   └── ...
└── controllers/...
```

## BullMQ — operação

- Workers no **mesmo processo Express** (single-binary). Para escalar: separar entry e usar `bootWorkers` em outro processo.
- Health: `GET /health` → 200 com counts ou 503 com detalhes do serviço down.
- Graceful shutdown: SIGTERM/SIGINT → `shutdownWorkers(10s)` → Prisma disconnect → exit.
- Adicionar worker novo: criar `*.worker.ts` chamando `registerWorker(...)` e import em `workers/register.ts`. Nada mais.

## Variáveis de Ambiente
Ver `backend/.env.example`. Obrigatórias: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `MINIO_*`.

Opcionais úteis:
- `INDEXNOW_KEY` (32 chars hex) — ativa o ping IndexNow no `publishPost`. Sem ela, o serviço loga `debug` e segue. Mesma chave precisa estar em `PUBLIC_INDEXNOW_KEY` do frontend-public para expor `/<KEY>.txt`.
- `INDEXNOW_HOST` — opcional; default deriva de `PUBLIC_BLOG_BASE_URL`.
- `LGPD_ANON_SALT` — 32+ chars aleatórios para hash determinístico de PII (worker de retenção).

## Padrões
- Rotas em `src/routes/`, controllers em `src/controllers/`, serviços em `src/services/`
- Validação de input com schemas Zod de `@aumaf/shared`
- Erros HTTP via middleware centralizado
- Logs com Pino (JSON em prod, pretty em dev)
- Rate limiting ativo via `express-rate-limit`
