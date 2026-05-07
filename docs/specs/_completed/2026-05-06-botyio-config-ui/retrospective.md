# Retrospective — botyio-config-ui

**Período:** 2026-05-06 (uma sessão, ~3h elapsed)
**Branch:** `feat/botyio-config-ui`
**Status final:** entregue (lotes 1–6 fechados)

---

## O que entregamos

Migração das 4 envs Botyio (`API_KEY`, `WEBHOOK_SECRET`, `BASE_URL`, `ENABLED`) para gestão dinâmica e auditada via `/integrations/botyio` no backoffice, com:

- **Cripto**: AES-256-GCM nativo + master key separada do banco (`/etc/aumaf/master.key`)
- **Backend**: novo modelo `IntegrationSecret`, `integration-config.service` com cache + Redis Pub/Sub, 4 rotas admin (`GET/PUT/POST test/GET deliveries`), redaction Pino
- **Frontend admin**: página `/integrations/botyio` com toggle, SecretField mascarado (sem revelar), CallbackUrl com copy, tabela de últimas entregas, "Testar conexão"
- **Ops**: docker-compose monta master key read-only; runbook completo de provisioning/rotação/recovery; ADR-002

**Cobertura de testes:**

- Backend: 14 suítes / 97 testes Jest (28 novos)
- Frontend admin: 8 arquivos / 45 testes Vitest (10 novos)
- Storybook: 3 stories novas
- Playwright: 1 spec criada (execução manual pendente)

## O que correu bem

- **SDD pagou**: o checkpoint humano após `clarify` capturou a divergência sobre "callback URL editável" antes de codar — Q6 (sem botão revelar) e Q2 (master key em arquivo) saíram do design alinhadas, sem retrabalho.
- **Tabela genérica `IntegrationSecret`** desbloqueia GA4/Pixel/SMTP futuros sem nova migration — vale como ADR.
- **Pub/Sub Redis** para invalidação de cache: zero janela de inconsistência entre instâncias do backend e workers.
- **Mascaramento absoluto + redaction Pino**: triple-defesa contra leak (UI nunca mostra, log nunca emite, response nunca contém plaintext).
- **Bootstrap idempotente** evitou cenário de "primeira deploy não tem credencial" — env vira fallback automático.
- **Os tests primeiro** descobriram problemas que teria perdido tempo depois: o teste de roundtrip de cripto pegou a primeira versão que não setava authTag corretamente; o teste "NUNCA retorna plaintext" forçou refactor do DTO.

## O que faria diferente

- **Resolver hang de Redis em testes mais cedo**: vários runs do `botyio-webhook.test.ts` ficaram pendurados antes de eu perceber que era handle de IORedis aberto. `--forceExit` resolve mas mascara causa raiz. Um futuro PR poderia mockar `lib/redis` no setup global de Jest.
- **Mais cobertura de erro no service**: faltou um teste explícito do cenário "decryptValue falha ao mudar master key" — só temos integração indireta via `loadMasterKey` errar.
- **Documentar mais cedo o fluxo de rotação de master key**: o runbook saiu no fim, mas idealmente seria escrito junto com o design para forçar pensar no failure mode.

## Descobertas inesperadas

- A spec original previa "ranqueamento de secrets sensíveis vs não-sensíveis" — na prática, criptografar tudo (mesmo `BASE_URL` e `ENABLED`) trouxe uniformidade sem custo, e `isSensitive` virou só metadado para mascaramento na UI.
- O webhook secret também precisava virar dinâmico — não estava na spec inicial mas seguiu naturalmente do refactor do `getBotyioConfig`. Bom catch acidental.
- Existem hangs de Jest com Redis abertos em vários testes pré-existentes (não só nos novos). Worth investigar em outro momento.

## Hotfixes aplicados após o merge da feature (mesmo dia)

A feature foi entregue em **3 PRs sucessivos** porque o deploy real expôs problemas que os testes locais não pegaram:

### PR #16 — `fix(deploy): force-recreate no CD + corrigir owner master key`
1. **Bug do CD: `up -d` silent skip.** O step `Deploy on server` era um heredoc gigante de ~30 linhas. Ele terminou silenciosamente após `MIGRATIONS_OK` no deploy do PR #15 — sem rodar `up -d`, sem smoke interno. Resultado: backend continuou rodando imagem antiga em prod até detecção manual. **Fix**: refatorado em 6 sub-steps GHA menores e legíveis (Pull / Run migrations / Recreate services / **Verify image SHA matches** / Smoke interno / Prune). Adicionado `--force-recreate` em `up -d` + novo gate `Verify image SHA matches` que aborta o deploy se o container não estiver rodando a imagem esperada.
2. **EACCES no boot da master key.** O container backend roda como user não-root `app` (uid 100, gid 101 — descoberto via `docker inspect`). O runbook recomendava `chown deploy:deploy` (uid 1001 do host), mas esse uid não existe dentro do container — backend recebe `EACCES: permission denied` ao abrir `/etc/aumaf/master.key` e morre com `[FATAL] master key indisponível em produção` (R11). **Fix**: `chown 100:101`. Atualizado runbook, ADR-002, skill `vps-deploy` §5b e comentário em `docker-compose.production.yml`.

### PR #17 — `fix(cd): smoke público tolerante a warm-up de force-recreate`
3. **Smoke público falhou pós-`--force-recreate`.** Como o force-recreate reinicia os 3 serviços simultaneamente (warm-up de TLS + Astro SSR cold start + Cloudflare cache priming), ~30s. Smoke anterior tinha 3 tentativas × 5s = 15s tolerância — insuficiente. **Fix**: sleep inicial 8s + 8 tentativas × 8s = ~72s tolerância.

**Lição arquitetural**: heredocs SSH gigantes em GHA workflows mascaram falhas. Sub-steps menores são essenciais para observabilidade.

## Pendências operacionais (apenas dependências externas — não bloqueiam)

1. **Cadastrar `API_KEY` e `WEBHOOK_SECRET` via UI** em https://admin-aumaf.kayoridolfi.ai/integrations/botyio (depende das credenciais reais da Botyio)
2. **Backup off-server da master key** (GPG → 1Password, passphrase só do Kayo)
3. **Avisar Botyio** para trocar `callback_url` do Source para `https://api-aumaf.kayoridolfi.ai/api/v1/leads/botyio-status`
4. **Rodar Playwright E2E** com infra completa (`frontend-admin/e2e/integrations.spec.ts`)
5. **Backups do banco** passam a conter ciphertext — atualizar runbook `production-restore.md` para enfatizar sensibilidade (PR futuro pequeno)

## Métricas pós-feature (ver `status.md`)

| Métrica | Linha de base | Meta | Observado |
|---------|---------------|------|-----------|
| Tempo p/ rotacionar credencial | ~15 min (SSH) | < 2 min (UI) | A medir em prod (estimativa: 30s no flow ideal) |
| Trilha de auditoria | 0% | 100% | ✅ 100% via `tag:audit:integration-secret` |
| SSH para mudar config Botyio | 100% | 0% | ✅ 0% (DB tem precedência sobre env) |

## Aprendizados a propagar

- ✏️ Atualizar `constitution.md` §4 (Segurança) para incluir: "Credenciais de integrações vivem criptografadas em repouso (AES-256-GCM); master key em arquivo separado, nunca em `.env` ou DB."
- 📚 Padrão `IntegrationSecret(provider, key)` deve ser reusado para futuras integrações (GA4, Pixel, SMTP). Documentar como ADR pattern.
- 🧪 Para próximas features que envolverem Redis, criar mock global no `jest.setup.ts` para evitar hangs.

## Links

- ADR: `docs/decisions/ADR-002-integration-secrets-encryption.md`
- Runbook master key: `docs/runbooks/integration-secrets-master-key.md`
- Runbook Botyio (atualizado): `docs/runbooks/botyio-activation.md`
- Skill `vps-deploy` §5b: `.claude/skills/vps-deploy/SKILL.md`
