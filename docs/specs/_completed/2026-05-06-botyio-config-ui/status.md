# Status — botyio-config-ui

**Fase atual**: validate (lotes 1–5 done)
**Última atualização**: 2026-05-06 21:10
**Próximo passo concreto**: rodar Playwright E2E com infra completa (`npm run dev` + `npx playwright test e2e/integrations.spec.ts`); depois code review e arquivar spec em `_completed/`.

### Pendências operacionais (registradas para não esquecer)

- 🔧 **Provisionar master key na VPS** (`/etc/aumaf/master.key`) antes do próximo deploy — se subir backend prod sem o arquivo, ele recusa boot. Comando exato em `docs/runbooks/integration-secrets-master-key.md` §1.
- 🔧 **Backup off-server da master key** (GPG → 1Password). Sem isso, perda de VPS = perda das credenciais.
- 🔧 **Avisar Botyio** para trocar `callback_url` do Source de `webhook.site/...` para `https://api.aumaf.kayoridolfi.ai/api/v1/leads/botyio-status` (segundo conversa de 2026-05-06).
- 🔧 **Rodar Playwright E2E** localmente (não rodado neste lote — requer backend+admin+infra de pé): `cd frontend-admin && npx playwright test e2e/integrations.spec.ts`.
- 🔧 **Code review (Lote 6)** ainda pendente.
- 📌 **Ainda não merged em master** — branch `feat/botyio-config-ui` aguarda PR.

---

## Decisões registradas

| Data | Decisão | Razão | Referência |
|------|---------|-------|------------|
| 2026-05-06 | Spec aberta para tornar credenciais Botyio editáveis pela UI sem perder segurança | Cliente AUMAF precisa autonomia para rotacionar/ativar sem SSH | conversa 2026-05-06 |

## Perguntas em aberto

- [ ] Aprovação humana das 9 clarificações em `requirements.md` §11 (Kayo)
- [ ] Confirmar que é aceitável armazenar ciphertext no DB de produção (backups passam a ter material sensível)

## Blockers

- Nenhum no momento — aguardando checkpoint humano para avançar para `plan`.

## Descobertas (fora de escopo planejado)

- A estrutura genérica `IntegrationSecret` viabiliza, no futuro, mover GA4/Pixel/SMTP para a mesma UI — registrar como backlog após esta entrega.

---

## Validation log (fase Validate — 2026-05-06)

| Critério | Evidência | Status |
|----------|-----------|--------|
| R1 (criptografia em repouso, key separada) | `lib/crypto.ts` AES-256-GCM + master key em `/etc/aumaf/master.key` montada read-only no compose; teste `crypto.test.ts` "encrypta e decifra roundtrip" | ✅ |
| R2 (mascaramento) | `integration-config.service.ts` `toSecretFieldDto()`; teste "getBotyioConfigDto NUNCA retorna plaintext (R13)" + admin-integration.test.ts "NUNCA retorna plaintext na resposta GET" | ✅ |
| R3 (save criptografa + invalida cache + audit) | `admin-integration.routes.ts` PUT + `setSecret` + `publishIntegrationInvalidate`; testes integration-config.service.test.ts "setSecret persiste ciphertext + invalida cache + publica pub/sub" e admin-integration.test.ts "atualiza enabled + apiKey, chama setBotyioField com userId" | ✅ |
| R4 (enabled=false bloqueia worker) | `botyio.service.ts` linha "if (!config.enabled) skip"; teste botyio.service.test.ts "retorna sem fazer fetch quando BOTYIO_ENABLED=false" | ✅ |
| R5 (testar sem persistir) | `admin-integration.routes.ts` POST /test; testes admin-integration.test.ts "NÃO persiste apiKey quando passada no body do test" + "faz fetch real à Botyio quando há apiKey no body" | ✅ |
| R6 (callback URL exibida) | `CallbackUrlField.tsx` + endpoint GET retorna `callbackUrl: "${BACKEND_URL}/api/v1/leads/botyio-status"`; teste `CallbackUrlField.test.tsx` + Playwright spec "navega ao menu Botyio e renderiza a página com Callback URL" | ✅ |
| R7 (últimas 10 deliveries) | `GET /botyio/deliveries`; teste admin-integration.test.ts "retorna últimas N entregas mapeadas" | ✅ |
| R8 (DB precedência) | `getBotyioConfig()` decryptIfPresent → fallback env; teste integration-config.service.test.ts "preferência DB sobre env quando ambos existem" | ✅ |
| R9 (bootstrap env→DB) | `lib/integration-bootstrap.ts` chamado no `server.ts` (idempotente, só semeia se row ausente) | ✅ |
| R10 (403 não-ADMIN) | `requireAuth + requireRole('ADMIN')` aplicado em router; testes admin-integration.test.ts "retorna 403 para usuário não-ADMIN" + "401 sem cookie" | ✅ |
| R11 (falha explícita sem master key) | `loadMasterKey()` em produção usa `process.exit(1)`; teste crypto.test.ts "rejeita master key com tamanho diferente de 32 bytes" e "rejeita authTag adulterada" | ✅ |
| R12 (erro de teste sanitizado) | `admin-integration.routes.ts` POST /test sanitiza msg (timeout/network) e captura raw.slice(0,80) | ✅ |
| R13 (GET nunca plaintext) | DTO type-level + serialização não inclui campo de valor; testes integration-config + admin-integration validam JSON.stringify ausência de plaintext + SecretField.test.tsx "NUNCA renderiza o valor cru salvo" | ✅ |
| R14 (logs sem plaintext) | `config/logger.ts` redact paths inclui apiKey, webhookSecret, plaintext, ciphertext, MASTER_ENCRYPTION_KEY, x-api-key, x-botyo-signature | ✅ |
| R15 (audit log) | `admin-integration.routes.ts` PUT loga `tag: audit:integration-secret` com userId, fieldsChanged, sem valores | ✅ |

### Suítes de teste (snapshot final)

- **Backend Jest**: 14 suítes / 97 testes verdes (incluindo 8 novos de crypto, 7 de integration-config.service, 13 de admin-integration.routes; 16 pré-existentes do botyio.service refatorados; 7 do botyio-webhook refatorados)
- **Frontend Vitest**: 8 arquivos / 45 testes verdes (incluindo 4 hooks use-botyio-config, 4 SecretField, 2 CallbackUrlField)
- **Playwright E2E**: spec `integrations.spec.ts` criada — execução manual pendente (requer infra rodando)
- **Storybook**: 3 stories novas (SecretField com 3 estados, CallbackUrlField com 2, DeliveriesTable com 3) — segue constituição §3

## Métricas pós-feature (preenchido na fase Retrospective)

| Métrica | Linha de base | Meta | Observado | Notas |
|---------|---------------|------|-----------|-------|
| Tempo p/ rotacionar credencial | ~15 min | < 2 min | — | — |

---

## Histórico de fase

| Data | Fase entrada | Quem | Notas |
|------|--------------|------|-------|
| 2026-05-06 | specify | Claude (Opus 4.7) | requirements.md preenchido |
| 2026-05-06 | clarify | Claude (Opus 4.7) | 9 clarificações com decisões propostas; aguardando Kayo |
| 2026-05-06 | plan | Claude (Opus 4.7) | design.md preenchido com mapeamento R→componente |
| 2026-05-06 | tasks | Claude (Opus 4.7) | 26 tasks em 6 lotes |
| 2026-05-06 21:00 | implement (lotes 1–3 done) | Claude (Opus 4.7) | Backend completo: 97/97 testes verdes (lib/crypto, integration-config.service, admin-integration.routes, refactor botyio.service e webhook). Migration `add_integration_secrets` aplicada em dev. |
| 2026-05-06 21:05 | implement (lote 4 done) | Claude (Opus 4.7) | Frontend admin: BotyioConfigPage + SecretField/CallbackUrlField/DeliveriesTable + 3 Storybook stories + 10 Vitest novos. Total Vitest: 45/45. Item de menu Botyio (06) no Sidebar; rota `/integrations/botyio`. |
| 2026-05-06 21:10 | validate (lote 5 done) | Claude (Opus 4.7) | Playwright spec criada; docker-compose monta master.key read-only; ADR-002 escrito; runbook integration-secrets-master-key.md; vps-deploy skill atualizado com 5b; runbook botyio-activation atualizado; .env.example atualizado. R1–R15 todos com evidência verde. |
