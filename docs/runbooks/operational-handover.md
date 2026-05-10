# Operational Handover — AUMAF 3D

Documento de operação após entrega. Cobre saúde, backups, troubleshooting e rotação de segredos. Deploy específico de provider (Vercel/Railway/Fly) é tratado em runbook próprio quando o provider for fixado.

## Visão de processos

```
┌──────────────────────────────┐
│  Backend Node (mesmo binário) │
│  ─────────────────────────    │
│  • Express HTTP :3000          │
│  • Worker lead-notification    │
│  • Worker post-publish-cache   │
│  • Pino logger (JSON em prod)  │
└──────────┬────────────────────┘
           │
   ┌───────┴───────┬──────────┬──────────┐
   ▼               ▼          ▼          ▼
PostgreSQL 16   Redis 7    MinIO/S3   SMTP* (opcional)
```
\* Se `EMAIL_TRANSPORT=smtp` e `EMAIL_SMTP_HOST` configurado.

## Health monitoring

### Endpoint canônico

`GET /health` retorna:

```json
{
  "status": "ok",
  "timestamp": "2026-05-03T15:30:00.000Z",
  "uptimeSec": 3600,
  "services": {
    "db":    { "status": "up", "latencyMs": 8 },
    "redis": { "status": "up", "latencyMs": 2 },
    "queues": {
      "lead-notification":  { "status": "active", "waiting": 0, "active": 0, "failed": 0 },
      "post-publish-cache": { "status": "active", "waiting": 0, "active": 0, "failed": 0 }
    }
  }
}
```

- **200** quando tudo up
- **503** com mesmo schema quando qualquer serviço degraded

### Configuração em uptime monitors

Use HTTP check em `/health` esperando status 200. Alarme se 503 por > 2min.

### Smoke test manual

```bash
bash scripts/smoke-test.sh
```

## Backup do PostgreSQL

### Diário (agendado)

```bash
pg_dump $DATABASE_URL --format=custom --file="aumaf-$(date -u +%Y%m%d).dump"
aws s3 cp aumaf-$(date -u +%Y%m%d).dump s3://aumaf-backups/
```

Retenção sugerida: 30 dias diários + 12 mensais.

### Restore

```bash
pg_restore --clean --if-exists --no-owner -d $DATABASE_URL aumaf-YYYYMMDD.dump
```

### MinIO/S3 (uploads de imagens)

Bucket `aumaf-blog-images` deve ter versionamento ativo em produção. Restauração é via console S3 — recuperação por versão.

**Arquitetura de uploads (PR #33):** desde 2026-05-09 o backend faz **proxy server-side**. MinIO permanece privado na rede Docker; o browser nunca fala com ele direto.

- `POST /api/v1/uploads/file` (auth) — recebe binário raw com `Content-Type: image/{png,jpeg,webp,avif}`, valida tipo/tamanho (≤10MB), faz `PutObject` server-side, retorna `{ key, publicUrl }`.
- `GET /api/v1/files/<key>` (público, sem auth) — streams do MinIO com `Cache-Control: public, max-age=31536000, immutable` + `X-Content-Type-Options: nosniff`. Restrito ao prefixo `posts/`.
- `POST /api/v1/uploads/presign` mantido para back-compat; o `publicUrl` retornado já usa o novo proxy.
- Migração de URLs antigas (formato `http://minio:9000/<bucket>/<key>`): `npx tsx backend/scripts/migrate-image-urls.ts`. Idempotente; reescreve `Post.coverImageUrl` e `MediaAsset.url`.

## Logs

Em produção `LOG_FORMAT=json`. Padrão Pino com campos:

```
{"level":30,"time":"2026-05-03T15:30:00.000Z","queue":"lead-notification","jobId":"lead-cm1","msg":"Job completed"}
```

Filtros úteis:

```bash
grep '"level":50' app.log | head      # erros
grep '"queue":"lead-notification"'    # jobs lead
grep 'Lead created'                    # criação de leads
```

## Rotação de segredos

| Segredo | Onde | Como rotacionar | Frequência |
|---------|------|-----------------|------------|
| `JWT_SECRET` | `backend/.env` | Trocar valor + reiniciar; **invalida todas as sessões** | A cada incidente, mín. anual |
| `ADMIN_PASSWORD` | `backend/.env` | Trocar + reiniciar; em prod, usar bcrypt hash via seed | A cada onboarding/offboarding |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` | provider | Criar novo par, atualizar `.env`, deletar antigo | Anual |
| `BOTYO_API_KEY` | painel Botyo | (futuro) | Por incidente |
| `EMAIL_SMTP_PASS` | provider | Painel SMTP | Anual |

## Troubleshooting

### `/health` retorna 503

1. Confira `services.*.status`. O campo down indica o serviço com problema.
2. Se `db.status=down`: Postgres parou? Network? `psql $DATABASE_URL -c 'SELECT 1'`.
3. Se `redis.status=down`: Redis parou? `redis-cli -u $REDIS_URL ping`.
4. Se queue `failed` alto: ver logs filtrando por `"queue":"<nome>"` e `"level":50`.

### Lead criado mas worker não disparou notificação

1. Verifique log: `Lead created` deve aparecer.
2. Logo depois: `Job completed { queue: 'lead-notification' }`.
3. Se ausente: ver `Job failed { queue: 'lead-notification' }` no log — geralmente:
   - `ADMIN_NOTIFICATION_EMAIL not configured`: configure em `.env`
   - `EMAIL_TRANSPORT=stub`: troque para `console` (dev) ou `smtp` (prod)
4. Manualmente reprocessar: ler queue Redis com `bullmq` UI ou via:
   ```bash
   redis-cli LRANGE bull:lead-notification:waiting 0 -1
   ```

### Cache warmup falhando

Job `post-publish-cache` espera `FRONTEND_PUBLIC_URL` ou `PUBLIC_BLOG_BASE_URL` apontando para o site público. Em produção, deve ser a URL HTTPS pública (não localhost).

Ignore falha eventual: o post está visível mesmo sem warmup; só fica com cold-start no primeiro acesso.

### Backend não inicia: "Invalid environment variables"

Pino imprime quais campos faltam. Compare com `backend/.env.example`. Comum esquecer:

- `JWT_SECRET` < 32 chars
- `S3_ENDPOINT` ou `S3_PUBLIC_URL` não-URL
- `ADMIN_EMAIL` não-email

### Graceful shutdown

`SIGTERM` ou `SIGINT` aciona:
1. Express para de aceitar novos requests
2. Workers terminam jobs em flight (timeout 10s cada)
3. Redis e Prisma desconectam
4. Processo sai com 0

Em containers, configure `stopSignal: SIGTERM` e `stopGracePeriodSeconds: 30`.

## Atualizações

- **Migrations**: sempre `prisma migrate deploy` antes de subir novo binário; nunca aplicar a partir de dev.
- **Hot upgrade**: rolling com 2+ replicas. Backend é stateless — não há estado em memória entre requests.
- **Workers em mesmo processo**: cada réplica processa jobs concorrentemente (BullMQ é redis-backed). Verificar `concurrency` por worker se necessário tunar.

## Custos esperados

| Serviço | Free tier | Custo típico mês 1 |
|---------|-----------|---------------------|
| Backend (Render free) | 750h/mês | $0 (sleep após 15min idle) |
| Postgres (Neon free) | 512 MB | $0 |
| Redis (Upstash free) | 10K commands/dia | $0 |
| S3 / R2 | 10 GB | $0 |
| Sentry | 5K eventos/mês | $0 |

Cap esperado em produção real (volumes baixos): ~R$ 100–200/mês total.

## Contatos

| Quando | Quem |
|--------|------|
| Incidente em produção | kayoridolfi.ai (kayocdi@gmail.com) |
| Conteúdo/posts | AUMAF (admin@aumaf.com.br) |
| Domínio/DNS | (a definir com AUMAF) |
