# Tasks — botyio-config-ui

**Linkado a**: [design.md](./design.md)
**Última atualização**: 2026-05-06

---

## Convenções

- `[P]` — paralelizável (não toca arquivos de outras tasks pendentes)
- `[CHECKPOINT]` — para e pede revisão humana
- `(<arquivo>)` — arquivo principal tocado
- `→ R*` — qual critério EARS a task satisfaz

---

## Lote 1 — Fundação (cripto + schema + shared)

- [x] **T1** — Criar branch `feat/botyio-config-ui` a partir de `master`
  - Pronto: branch criada, `npm install` ok, build local passa

- [x] **T2** — `lib/crypto.ts`: AES-256-GCM com `loadMasterKey()` (`backend/src/lib/crypto.ts`) → R1, R11
  - Lê `MASTER_KEY_PATH` (default `/etc/aumaf/master.key`); 32 bytes binários
  - Em `NODE_ENV=test`: gera key efêmera in-memory
  - Em `NODE_ENV=development`: aceita `MASTER_ENCRYPTION_KEY` (base64) como fallback se path não existir
  - Em `NODE_ENV=production`: arquivo obrigatório, sem fallback — `process.exit(1)` se ausente
  - API: `encryptValue(plaintext: string) → {ciphertext: Buffer, iv: Buffer, authTag: Buffer}` e `decryptValue({ciphertext, iv, authTag}) → string`
  - Pronto: 6 testes Jest verdes (roundtrip, IV único, authTag inválida, master key ausente em prod, fallback dev, key efêmera test)

- [x] **T3** [P] — Schema Prisma + migration (`backend/prisma/schema.prisma`) → R1
  - Modelo `IntegrationSecret` conforme design §3
  - Pronto: `npx prisma migrate dev --name add_integration_secrets` aplica sem erro; tipos regenerados

- [x] **T4** [P] — Schemas Zod compartilhados (`packages/shared/src/schemas/integrations.ts`) → R2, R5, R10
  - `BotyioConfigDtoSchema`, `UpdateBotyioConfigSchema`, `BotyioTestResultSchema`
  - Export em `packages/shared/src/index.ts`
  - Pronto: `tsc --noEmit` passa em todos os workspaces que importam

## Lote 2 — Service layer + bootstrap

- [x] **T5** — `integration-config.service.ts` (`backend/src/services/integration-config.service.ts`) → R3, R8, R9, R13
  - `getBotyioConfig(): Promise<{enabled, baseUrl, apiKey, webhookSecret}>` (valores em CLARO — uso interno apenas)
  - `getBotyioConfigDto(): Promise<BotyioConfigDto>` (com máscara — uso público)
  - `setSecret(provider, key, value, userId, isSensitive)`
  - Cache `Map<provider, {data, expiresAt}>` com TTL 30s
  - Métodos privados: `maskValue`, `extractLastFour`
  - Pronto: 8 testes Jest (cache hit/miss, TTL expira, mask correto, fallback env, persiste ciphertext)

- [x] **T6** — Redis pub/sub para invalidate (`backend/src/lib/redis-pubsub.ts`) → R3
  - Wrapper `publishInvalidate(provider)` e `subscribeInvalidate(handler)` no canal `integration-secret:invalidate`
  - Pronto: 2 testes integrados (publish dispara handler em outra instância do service)

- [x] **T7** [P] — Bootstrap inicial (`backend/src/lib/integration-bootstrap.ts`) → R9
  - Função `bootstrapBotyioFromEnv()`: para cada chave Botyio, se row não existe e env tem valor, criptografa e persiste
  - Idempotente; logado com tag `bootstrap:integration-secret`
  - Chamada em `server.ts` antes de `app.listen`
  - Pronto: 3 testes (sem env, com env, já populado = noop)

- [x] **T8** — Refatorar `botyio.service.ts` (`backend/src/services/botyio.service.ts`) → R4, R8
  - Substituir `env.BOTYIO_*` por `await getBotyioConfig()`
  - Subscriber pub/sub registrado no init do worker (limpa cache local)
  - Pronto: testes existentes do botyio.service continuam verdes; +1 teste novo "config alterada via DB é refletida na próxima chamada"

- [x] **T9** — Refatorar `botyio-lead-sync.worker.ts` para consumir provider + subscriber pub/sub → R4
  - Pronto: smoke test do worker passa

## Lote 3 — Routes + audit log

- [x] **T10** — Pino redaction config (`backend/src/config/logger.ts`) → R14
  - Adicionar `apiKey`, `webhookSecret`, `plaintext`, `ciphertext`, `*.apiKey`, `*.webhookSecret` ao redaction
  - Pronto: 1 teste que loga objeto com `apiKey: 'real-secret'` e verifica saída `[Redacted]`

- [x] **T11** — `admin-integration.routes.ts` (`backend/src/routes/admin-integration.routes.ts`) → R3, R5, R6, R7, R10, R12, R15
  - `GET /api/v1/admin/integrations/botyio` → `getBotyioConfigDto()` + `callbackUrl` derivado de `env.BACKEND_URL`
  - `PUT /api/v1/admin/integrations/botyio` → valida com Zod, chama `setSecret` para cada campo presente, publica invalidate, log de auditoria, retorna DTO atualizado
  - `POST /api/v1/admin/integrations/botyio/test` → fetch autenticado contra Botyio (timeout 5s), mensagem sanitizada, latência
  - `GET /api/v1/admin/integrations/botyio/deliveries?limit=10`
  - Todas com `requireAuth` + `requireRole('ADMIN')`
  - Pronto: 12 testes (200, 400 zod, 403 não-admin, 401 sem auth, mask na resposta, audit log emitido)

- [x] **T12** [P] — Registrar router em `app.ts` + boot do `server.ts` chama bootstrap + subscriber → R9, R11
  - `loadMasterKey()` chamado no topo do `server.ts`; se falhar em prod, `process.exit(1)`
  - Pronto: backend sobe limpo em dev e em prod-like

## Lote 4 — Frontend admin

- [x] **T13** [P] — Hook `useBotyioConfig` + `useUpdateBotyioConfig` + `useTestBotyio` + `useBotyioDeliveries` (`frontend-admin/src/features/integrations/api/use-botyio-config.ts`) → R2, R5, R7
  - Pronto: 4 testes Vitest (success, error, mutation invalida cache, test não invalida)

- [x] **T14** [P] — `SecretField.tsx` (`frontend-admin/src/features/integrations/components/SecretField.tsx`) → R2, R6
  - Props: `label`, `masked`, `isSet`, `updatedAt`, `onChange`, `placeholder?`
  - Estado: vazio = "manter atual"; preenchido = "será atualizado"
  - Helper text mostra `••••${lastFour}` + "Atualizado em DD/MM HH:mm por X"
  - Pronto: Story Storybook + 3 testes Vitest (estado vazio, preenchido, mostra mask)

- [x] **T15** [P] — `CallbackUrlField.tsx` (`frontend-admin/src/features/integrations/components/CallbackUrlField.tsx`) → R6
  - Read-only, com botão "Copiar" usando Clipboard API + toast
  - Pronto: Story Storybook + 1 teste Vitest (botão copia)

- [x] **T16** [P] — `DeliveriesTable.tsx` (`frontend-admin/src/features/integrations/components/DeliveriesTable.tsx`) → R7
  - Tabela com últimas 10 entregas: event, deliveryId truncado, recebido em
  - Pronto: Story Storybook (estado vazio + estado com 10 linhas)

- [x] **T17** — `BotyioConfigPage.tsx` (`frontend-admin/src/features/integrations/pages/BotyioConfigPage.tsx`) → R3, R4, R5, R6, R7
  - Seções: Status (toggle enabled), Configuração (BASE_URL + 2 SecretFields), Callback URL, Testar conexão, Histórico
  - react-hook-form + zod resolver
  - Pronto: roda local sem warning; visual alinhado com Settings page

- [x] **T18** — Registrar rota `/integrations/botyio` em `routes.tsx` + adicionar item de menu no `AdminShell` (sidebar)
  - Pronto: navegação funciona, item ativo destacado

## Lote 5 — Validação E2E + ops

- [x] **T19** [CHECKPOINT] — Revisar com Kayo o fluxo na UI antes do E2E
  - Pronto: aprovação verbal/textual

- [x] **T20** — Playwright E2E (`frontend-admin/tests/integrations.spec.ts`) → R3, R4, R5, R10
  - Login admin → /integrations/botyio
  - Toggle enabled → save → confirma persistência
  - Atualiza apiKey → submete lead público → verifica que worker usou nova chave (assertando contra mock Botyio ou inspecionando log estruturado)
  - Pronto: spec verde local

- [x] **T21** [P] — Atualizar `docker-compose.production.yml` para montar master key + atualizar `vps-deploy` skill
  - Volume: `/etc/aumaf/master.key:/etc/aumaf/master.key:ro`
  - Comando documentado de geração: `openssl rand -out /etc/aumaf/master.key 32 && chown deploy:deploy /etc/aumaf/master.key && chmod 400 /etc/aumaf/master.key`
  - Pronto: arquivo atualizado, runbook explicando provisioning

- [x] **T22** [P] — Criar ADR (`docs/decisions/ADR-002-integration-secrets-encryption.md`)
  - Decisões Q1, Q2, Q3, Q6 do requirements §11
  - Pronto: ADR commitado

- [x] **T23** — Atualizar `docs/runbooks/botyio-activation.md`: refletir que credenciais agora vão pela UI; envs viram fallback
  - Pronto: runbook atualizado

- [x] **T24** — Validation report em `status.md`: cada R1–R15 com evidência (teste, screenshot, log)
  - Pronto: tabela de validação preenchida com 100% verde

## Lote 6 — Fechamento

- [x] **T25** [CHECKPOINT] — Code review (skill `superpowers:requesting-code-review` ou PR)
  - Pronto: review aprovado

- [x] **T26** — Retrospective + mover spec para `_completed/` + atualizar `INDEX.md` e `HISTORY.md`

---

## Notas de execução

- T2 (cripto) é fundação: todas as outras dependem.
- Lote 1 deve fechar antes do Lote 2.
- Lote 3 + Lote 4 podem rodar parcialmente em paralelo após Lote 2 fechar.
- Lote 5 só após Lotes 3 e 4 verdes.
- Em qualquer task que descobrir scope creep, registrar em `status.md` "Descobertas" — **não** enxertar.
