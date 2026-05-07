# Design — botyio-config-ui

> HOW desta feature. Como satisfazer cada critério de `requirements.md`.

**Linkado a**: [requirements.md](./requirements.md)
**Última atualização**: 2026-05-06

---

## 1. Visão geral da solução

A feature introduz uma camada de **gestão dinâmica de credenciais de integração** com criptografia em repouso. As 4 envs Botyio (`BOTYIO_BASE_URL`, `BOTYIO_API_KEY`, `BOTYIO_WEBHOOK_SECRET`, `BOTYIO_ENABLED`) deixam de ser fonte primária e passam a ser **fallback de bootstrap**: na primeira inicialização, se não houver registro no banco, o backend lê das envs, criptografa e persiste em `IntegrationSecret`. Dali em diante, o banco é a fonte da verdade.

A criptografia usa AES-256-GCM nativo do Node, com a master key vivendo em arquivo separado (`/etc/aumaf/master.key`, chmod 400, owner `deploy`) — fisicamente isolada do banco, atendendo R1. O backend recusa subir se a master key estiver ausente ou corrompida (R11).

A UI fica em `/integrations/botyio` (rota nova no admin), seguindo o design system Cinematic Additive Manufacturing. Valores sensíveis são **sempre mascarados** (`••••xxxx`); rotacionar = preencher novo valor + salvar (sem botão "revelar"). Um botão "Testar conexão" faz chamada real autenticada à API Botyio sem persistir.

Workers e o `botyio.service` consomem credenciais via um provider único (`getBotyioConfig()`) com cache em memória, invalidado por **Redis Pub/Sub** sempre que o admin salvar — garantindo que a próxima chamada use o valor novo sem restart e sem janela de inconsistência.

Todo PUT é registrado em log estruturado (Pino) com tag `audit:integration-secret`, contendo `userId`, `action`, `fieldsChanged` — **sem** os valores. Sentry recebe o mesmo evento.

## 2. Arquitetura

### Componentes envolvidos

```
┌─────────────────┐                           ┌──────────────────────┐
│ Admin (React)   │  ── PUT /integrations ──→ │ admin-integration    │
│ /integrations/  │  ── POST /test    ──────→ │ .routes.ts           │
│  botyio         │  ← GET (mascarado) ─────  │ (requireRole ADMIN)  │
└─────────────────┘                           └──────────┬───────────┘
                                                         │
                                              ┌──────────▼─────────────────┐
                                              │ integration-config.service │
                                              │  • get/set por (provider,  │
                                              │    key)                    │
                                              │  • cache in-memory + TTL   │
                                              │  • pub/sub invalidate      │
                                              └─┬────────────┬─────────────┘
                                                │            │
                                       ┌────────▼──┐    ┌────▼──────────┐
                                       │ crypto.ts │    │ Redis Pub/Sub │
                                       │ AES-256-  │    │ canal:        │
                                       │ GCM       │    │ integration-  │
                                       └─┬─────────┘    │ secret:       │
                                         │              │ invalidate    │
                                  reads master key      └──────┬────────┘
                                  /etc/aumaf/master.key        │
                                                               │
┌──────────────────────┐    consumes                  ┌────────▼─────────┐
│ botyio.service.ts    │ ─── getBotyioConfig() ────→  │ Worker:          │
│ syncLeadToBotyo      │                              │ botyio-lead-sync │
└──────┬───────────────┘                              └──────────────────┘
       │
       └─→ Prisma → integration_secrets (ciphertext + iv + authTag)
```

### Mudanças por camada

- **Frontend admin** (novos):
  - `features/integrations/pages/BotyioConfigPage.tsx`
  - `features/integrations/api/use-botyio-config.ts` (react-query)
  - `features/integrations/components/SecretField.tsx` (input mascarado)
  - `features/integrations/components/CallbackUrlField.tsx`
  - `features/integrations/components/DeliveriesTable.tsx`
  - Stories Storybook para `SecretField` e `CallbackUrlField`
  - Update em `routes.tsx` + sidebar do `AdminShell`

- **Backend** (novos):
  - `lib/crypto.ts` — AES-256-GCM, `loadMasterKey()`, `encryptValue`/`decryptValue`
  - `services/integration-config.service.ts` — get/set + cache + pub/sub
  - `routes/admin-integration.routes.ts` — `GET`/`PUT`/`POST test`/`GET deliveries`
  - `lib/integration-bootstrap.ts` — seed inicial a partir de envs
  - `lib/redis-pubsub.ts` — wrapper sobre o cliente Redis já existente

- **Backend** (alterados):
  - `services/botyio.service.ts` — substituir leitura direta de `env.BOTYIO_*` por `getBotyioConfig()`
  - `workers/botyio-lead-sync.worker.ts` — idem
  - `app.ts` ou `server.ts` — registrar bootstrap + subscriber pub/sub no startup
  - `config/env.ts` — `BOTYIO_*` viram opcionais com flag de fallback; nova `MASTER_KEY_PATH` (default `/etc/aumaf/master.key`) e `MASTER_ENCRYPTION_KEY` (apenas dev/test, base64)

- **Banco de dados**:
  - Nova tabela `integration_secrets` (ver §3)

- **Shared** (`@aumaf/shared`):
  - Schemas Zod: `BotyioConfigDto`, `UpdateBotyioConfigInput`, `BotyioTestResult`, `IntegrationSecretAuditEntry`

- **Infra**:
  - `docker-compose.production.yml`: montar `/etc/aumaf/master.key:/etc/aumaf/master.key:ro` no serviço backend
  - Runbook `vps-deploy`: gerar master key (`openssl rand -out /etc/aumaf/master.key 32 && chmod 400`)

## 3. Modelo de dados

### Mudanças no schema

```prisma
model IntegrationSecret {
  id          String   @id @default(cuid())
  provider    String   // "botyio" (futuro: "ga4", "pixel", "smtp", etc.)
  key         String   // "API_KEY" | "WEBHOOK_SECRET" | "BASE_URL" | "ENABLED"
  ciphertext  Bytes
  iv          Bytes    // 12 bytes (GCM padrão)
  authTag     Bytes    // 16 bytes
  isSensitive Boolean  @default(true)  // se true, mask na resposta GET
  lastFour    String?  // só populado quando isSensitive=true (ex: "ax9k")
  updatedBy   String?  // userId (relação solta — ADMIN é singleton hoje)
  updatedAt   DateTime @updatedAt
  createdAt   DateTime @default(now())

  @@unique([provider, key])
  @@index([provider])
  @@map("integration_secrets")
}
```

### Migrations necessárias

- **Migration `add_integration_secrets`**: cria tabela. Não-destrutiva, idempotente. Online (sem downtime).
- Não há backfill SQL: o seed inicial roda em runtime no boot do backend (`integration-bootstrap.ts`), lendo das envs já existentes.

## 4. Contratos de API

Todas autenticadas com JWT em cookie httpOnly + `requireRole('ADMIN')`. Prefixo `/api/v1/admin/integrations`.

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/botyio` | Retorna config atual (com máscara nos sensíveis) |
| PUT | `/botyio` | Atualiza um ou mais campos. Campos omitidos não mudam. |
| POST | `/botyio/test` | Testa conexão com a API Botyio. Não persiste. |
| GET | `/botyio/deliveries?limit=10` | Últimos N webhooks recebidos |

### Schemas (em `packages/shared/src/schemas/integrations.ts`)

```typescript
// Read DTO — nunca contém valores em claro
export const BotyioConfigDtoSchema = z.object({
  enabled: z.boolean(),
  baseUrl: z.string().url(),
  apiKey: z.object({
    masked: z.string(),         // "••••xxxx"
    isSet: z.boolean(),
    updatedAt: z.string().nullable(),
    updatedBy: z.string().nullable(),
  }),
  webhookSecret: z.object({
    masked: z.string(),
    isSet: z.boolean(),
    updatedAt: z.string().nullable(),
    updatedBy: z.string().nullable(),
  }),
  callbackUrl: z.string().url(),  // derivado do BACKEND_URL no servidor
});

// Update — campos opcionais; ausência = não alterar
export const UpdateBotyioConfigSchema = z.object({
  enabled: z.boolean().optional(),
  baseUrl: z.string().url().optional(),
  apiKey: z.string().min(8).optional(),
  webhookSecret: z.string().min(8).optional(),
});

export const BotyioTestResultSchema = z.object({
  ok: z.boolean(),
  status: z.number().nullable(),
  message: z.string(),
  latencyMs: z.number(),
});
```

## 5. Mapeamento Requirements → Design

| Critério | Componente/arquivo responsável | Notas |
|----------|--------------------------------|-------|
| R1 (criptografia em repouso, key separada) | `lib/crypto.ts` + `/etc/aumaf/master.key` | AES-256-GCM. Master key fora do DB e fora do `.env`. |
| R2 (mascaramento) | `integration-config.service.ts` `toDto()` | Sempre `••••${lastFour}` quando `isSensitive=true`. |
| R3 (save criptografa + invalida cache) | `routes/admin-integration.routes.ts` PUT | Encrypt → upsert → publish `integration-secret:invalidate`. |
| R4 (enabled=false bloqueia worker) | `botyio.service.ts` (já existe lógica `BOTYIO_ENABLED`) | Refatora para ler do provider. |
| R5 (testar sem persistir) | `POST /botyio/test` | Aceita `apiKey` opcional no body; se ausente, usa o salvo. |
| R6 (callback URL exibida) | `CallbackUrlField.tsx` | `${env.BACKEND_URL}/api/v1/leads/botyio-status`. Renderizado pelo backend no GET. |
| R7 (últimas 10 deliveries) | `GET /botyio/deliveries` | `prisma.botyoWebhookDelivery.findMany({orderBy:receivedAt desc, take:limit})`. |
| R8 (DB precedência) | `getBotyioConfig()` lê DB primeiro | Fallback para env só se DB vazio. |
| R9 (bootstrap de env → DB) | `integration-bootstrap.ts` no `server.ts` | Idempotente: só semeia se row não existir. |
| R10 (403 não-ADMIN) | `requireRole('ADMIN')` middleware existente | Aplica nas 4 rotas. |
| R11 (falha explícita sem master key) | `loadMasterKey()` em boot | `process.exit(1)` com log claro. |
| R12 (erro de teste sem stack trace) | Handler do POST test | Captura erro, retorna `{ok:false, message: msg sanitizado}`. |
| R13 (GET nunca retorna plaintext) | `toDto()` | Tipo de retorno não inclui campo de valor cru — só máscara. |
| R14 (logs sem plaintext) | Pino redaction config + revisão manual | Adicionar `apiKey`, `webhookSecret`, `ciphertext` ao redaction. |
| R15 (audit log) | Middleware ou wrapper no PUT | Log estruturado `{ tag: 'audit:integration-secret', userId, action, fields }`. |

## 6. Integrações externas

| Serviço | Propósito | Custo | Limites |
|---------|-----------|-------|---------|
| Botyio API | "Testar conexão" via endpoint leve (HEAD ou GET `/v1/health` se existir) | já contratado | rate limit deles — usar timeout 5s |
| Redis | Pub/Sub para invalidar cache | já na stack | sem custo extra |

## 7. Boundaries (harness anti-drift)

### ✅ Always (obrigatórios nesta feature)
- Criptografar **todos** os valores antes de gravar em `integration_secrets` (mesmo `BASE_URL` e `enabled`, por uniformidade e integridade GCM)
- Mascarar `API_KEY` e `WEBHOOK_SECRET` em todas as respostas HTTP
- Adicionar redaction Pino para `apiKey`, `webhookSecret`, `plaintext`, `ciphertext`
- Publicar invalidate no Redis após cada PUT bem-sucedido
- Cobertura Playwright do fluxo "rotacionar chave → próximo lead usa chave nova"
- Story Storybook para cada componente UI novo (constituição §3)

### ⚠️ Ask first (exigem confirmação)
- Migrations Prisma (constituição §4) — confirmar antes de `migrate dev`
- Adição de dependência runtime — usar apenas `node:crypto` nativo, **sem** novas deps

### 🚫 Never (proibidos)
- Nunca retornar plaintext de `apiKey`/`webhookSecret` em resposta HTTP
- Nunca logar plaintext de credenciais (mesmo em DEBUG)
- Nunca persistir master key em `.env` ou no banco
- Nunca commitar conteúdo real de `master.key`
- Nunca botão "revelar valor" — segurança > ergonomia (decisão Q6)
- Nunca desabilitar redaction Pino com `--no-redact` ou similar

## 8. Alternativas consideradas

| Opção | Prós | Contras | Veredito |
|-------|------|---------|----------|
| AES-256-GCM nativo (escolhido) | Sem dep nova; padrão; integridade incluída | Requer cuidado manual com IV único | ✅ Q1 |
| libsodium secretbox | API mais difícil de errar | Dep nova; ChaCha20 não traz benefício real | ❌ |
| AWS KMS / GCP KMS | Gestão de chaves automática | Dependência externa, custo, latência | ❌ over-engineering p/ single-VPS |
| Master key no `.env` | Simples | Mesma localização do ciphertext (DB) compromete defesa em profundidade | ❌ Q2 |
| Master key em arquivo (escolhido) | Separação física do ciphertext | Um passo extra no provisioning | ✅ Q2 |
| Vault HashiCorp | Estado-da-arte | Infra nova inteira | ❌ over |
| Tabela específica `BotyioConfig` | Mais simples no curto prazo | Cria N tabelas para N integrações | ❌ Q3 |
| Tabela genérica `IntegrationSecret` (escolhida) | Reuso futuro sem migration | Schema um pouco mais abstrato | ✅ Q3 |
| Botão "revelar" temporário | Ergonomia no debug | Risco de leak via screen-share/screenshot | ❌ Q6 |
| Tabela `audit_log` dedicada | Retenção formal | YAGNI — Pino + Sentry já cobrem | ❌ Q7 |
| TTL curto (60s) p/ invalidate cache | Sem dep | Janela de inconsistência | ❌ Q8 |
| Pub/Sub Redis (escolhido) | Latência ≈ 0; Redis já está | Acoplamento ao Redis (já é dep) | ✅ Q8 |

## 9. Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Perda da master key (arquivo deletado/corrompido) | baixa | catastrófico (todas creds inacessíveis) | Backup criptografado da master key off-server; runbook de rotação documentado |
| Race condition entre invalidate Redis e nova request | média | baixo (1 request com cache stale) | TTL secundário 30s como rede de segurança |
| Backup do DB exposto | baixa | alto (ciphertext + IVs vazam, mas sem master key não decifra) | Hardening de backup já documentado em `production-restore.md` |
| Admin se confunde e digita placeholder no campo | média | baixo | Front diferencia "manter atual" (vazio) de "novo valor" (não-vazio) com placeholder explícito |
| `loadMasterKey` falha em dev/test silenciosamente | média | médio (testes passam por engano) | Em `NODE_ENV=test`, gerar key efêmera in-memory; em `production`, exigir arquivo |
| Webhook callback aponta para domínio antigo após troca | média | alto (leads não chegam) | UI mostra a URL atual lida do `BACKEND_URL` real do servidor; admin avisa Botyio para atualizar |

## 10. Plano de rollout

- [ ] Sem feature flag: a feature substitui o caminho atual ao subir (envs viram fallback)
- [ ] Rollout: deploy direto em homologação (`aumaf.kayoridolfi.ai`) — não há tráfego de produção real ainda
- [ ] Métricas a monitorar:
  - Logs de `audit:integration-secret` aparecem após cada save
  - Taxa de sucesso do worker `botyio-lead-sync` permanece estável após deploy
  - Endpoint `/health` continua 200
- [ ] Plano de rollback:
  1. Se a leitura do banco falhar e o fallback de env não estiver presente, restaurar envs no `.env.production`
  2. `docker compose restart backend`
  3. Migration é não-destrutiva — pode permanecer aplicada sem efeito

## 11. Validation gate (pós-design)

- [x] Cada critério EARS está mapeado para um componente (§5)
- [x] Componentes "se sobram" foram cortados (descartado: tabela audit_log dedicada, botão revelar, KMS externo)
- [x] Dependências externas validadas (Redis + Botyio API já existentes)
- [x] Plano de rollback concreto (envs como fallback intacto)
- [x] Boundaries cobrem cenários sensíveis (redaction, no-revelar, master-key separação)

## 12. Links

- Requirements: [requirements.md](./requirements.md)
- Spec relacionada (PR #7 Botyio): `docs/runbooks/botyio-activation.md`
- Constitution: `docs/specs/constitution.md`
- ADR sugerido (criar na implementação): `docs/decisions/ADR-XXX-integration-secrets-encryption.md`
