# Requirements — botyio-config-ui

> Menu no backoffice para gestão segura e dinâmica das credenciais Botyio (API key, webhook secret, base URL, enabled flag).

**Slug**: `2026-05-06-botyio-config-ui`
**Início**: 2026-05-06
**Stakeholders**: Kayo Ridolfi (kayoridolfi.ai), AUMAF (cliente — operação)
**Status**: clarifying

---

## 1. Contexto e problema

Hoje as credenciais Botyio (`BOTYIO_API_KEY`, `BOTYIO_WEBHOOK_SECRET`, `BOTYIO_BASE_URL`, `BOTYIO_ENABLED`) vivem apenas em `/srv/aumaf/env/.env.production` (chmod 600, fora do git). Para rotacionar a chave, ativar/desativar a integração ou trocar de ambiente é necessário:
- Acesso SSH à VPS (`deploy@2.24.72.8`)
- Edição manual do `.env.production`
- Restart do backend via Docker Compose

Isso cria três problemas:
1. **Operacional**: AUMAF (cliente final) não consegue rotacionar credenciais sem intervenção do dev.
2. **Auditoria**: nenhum registro de quem trocou o quê e quando.
3. **Onboarding**: ativar Botyio em homologação exige roteiro SSH (PR #7 runbook), atrito alto.

A integração Botyio já está implementada e mergeada (PR #7). Falta só a camada de **gestão dinâmica** das credenciais.

## 2. Objetivo de negócio

- AUMAF (role ADMIN) consegue ativar, desativar e rotacionar credenciais Botyio direto pelo backoffice em < 2 min, sem SSH.
- 100% das alterações de credenciais ficam auditadas (quem, quando, o quê — sem expor o valor).
- Zero downtime na rotação (a próxima chamada à API Botyio já usa a credencial nova).

## 3. Personas afetadas

| Persona | Como esta feature afeta |
|---------|------------------------|
| AUMAF Admin (cliente) | Passa a configurar Botyio sem precisar do dev — autonomia operacional. |
| Kayo Ridolfi (dev) | Não precisa mais entrar via SSH para rotacionar segredo; ganha trilha de auditoria. |
| Lead final (visitante do site) | Indireto: integração mais resiliente a rotação de credenciais. |

## 4. User stories

- Como **Admin**, quero ver o estado atual da integração Botyio (ativa/inativa, última atualização, último teste de conexão) para saber se o lead capture está funcionando.
- Como **Admin**, quero atualizar a `API_KEY` e o `WEBHOOK_SECRET` da Botyio pela UI para rotacionar credenciais sem depender do dev.
- Como **Admin**, quero ativar/desativar a integração com um toggle para pausar o envio de leads em manutenção.
- Como **Admin**, quero ver a Callback URL pré-renderizada com botão "copiar" para colar no painel Botyio.
- Como **Admin**, quero clicar em "Testar conexão" para validar que as credenciais funcionam antes de salvar.
- Como **Admin**, quero ver os últimos N webhooks recebidos da Botyio (sucesso/falha) para diagnosticar problemas.
- Como **Dev/Auditor**, quero ver um log de quem alterou cada credencial e quando, para auditoria de segurança.

## 5. Critérios de aceitação (EARS)

### Comportamento principal

- **R1**: O sistema deve persistir as credenciais Botyio criptografadas em repouso (a chave de criptografia não pode estar na mesma localização que o ciphertext).
- **R2**: O sistema deve mascarar valores sensíveis (`API_KEY`, `WEBHOOK_SECRET`) na UI exibindo apenas os últimos 4 caracteres (ex: `••••xxxx`).
- **R3**: Quando o Admin salvar uma nova credencial, o sistema deve criptografá-la, persistir, registrar entrada de auditoria e invalidar o cache em memória do worker `botyio-lead-sync`.
- **R4**: Enquanto a integração estiver desativada (`enabled=false`), o sistema deve persistir leads normalmente mas não enfileirar `botyio-lead-sync`.
- **R5**: Quando o Admin clicar em "Testar conexão", o sistema deve fazer uma chamada autenticada à API Botyio e retornar status (ok/erro + mensagem) **sem persistir** a credencial testada.
- **R6**: O sistema deve exibir a Callback URL no formato `https://<api-domain>/api/v1/leads/botyio-status` com botão de cópia.
- **R7**: O sistema deve exibir os últimos 10 registros de `botyo_webhook_deliveries` (status, timestamp, leadId).

### Comportamento condicional

- **R8**: Onde existir credencial persistida no banco, o sistema deve ler do banco (DB tem precedência sobre `.env`).
- **R9**: Onde **não** existir credencial no banco, o sistema deve fazer fallback para a env var no primeiro boot (bootstrap), persistir criptografada e usar DB dali em diante.

### Comportamento de erro / segurança

- **R10**: Se um usuário não-ADMIN tentar acessar a rota de configuração, o sistema deve retornar 403.
- **R11**: Se o ciphertext falhar ao decifrar (chave de criptografia ausente, corrompida ou rotacionada incorretamente), o sistema deve falhar de forma explícita no boot do backend, **não** silenciosamente cair em fallback inseguro.
- **R12**: Se "Testar conexão" falhar, o sistema deve retornar a mensagem de erro da Botyio sem expor stack trace ou detalhes internos.
- **R13**: O sistema **nunca** deve retornar valores em texto claro na resposta da API de leitura — apenas máscara + metadados (atualizadoEm, atualizadoPor).
- **R14**: O sistema **nunca** deve logar valores sensíveis em texto claro (Pino + Sentry com redaction).
- **R15**: Quando o Admin atualizar uma credencial, o sistema deve registrar em `audit_log` (ou equivalente): timestamp, userId, ação (`UPDATE`/`ROTATE`/`TOGGLE_ENABLED`), campo afetado — **sem** o valor.

## 6. Edge cases conhecidos

- **Boot sem chave de criptografia**: backend deve recusar subir e logar erro claro (não tentar fallback em plaintext).
- **Rotação de master key**: requer migration de re-criptografia de todos os secrets — não automática nesta feature, documentada no runbook.
- **Concorrência**: dois admins editando simultaneamente — last-write-wins com aviso na UI ("alterado por X há Y segundos, recarregue").
- **Worker em execução com chave antiga**: invalidação de cache no save garante que o próximo job use a chave nova; jobs já em flight com a chave antiga falharão e serão retried com a nova.
- **Backup do banco**: passa a conter ciphertext — backups precisam ser tratados com a mesma sensibilidade do `.env` (documentar em runbook).

## 7. Fora de escopo (explícito)

- **Gestão de outras integrações** (GA4, Pixel, GTM, IA): a estrutura `IntegrationSecret` é genérica, mas só a UI de Botyio é entregue agora. Outras integrações ficam para feature posterior.
- **Rotação automática programada**: não há agendamento de rotação — ação manual do Admin.
- **Múltiplas credenciais por integração** (ex: dev/staging/prod no mesmo banco): single-environment por banco, alinhado com a stack atual sem multi-tenancy.
- **Versioning/rollback de credenciais**: alterar é destrutivo; não guardamos histórico de valores. O `audit_log` registra QUE mudou, não o valor anterior.
- **Permissão granular** (read-only vs read-write na config): só ADMIN pode ler/escrever. MARKETING não vê.

## 8. Métricas de sucesso

| Métrica | Linha de base atual | Meta pós-feature | Como medir |
|---------|---------------------|--------------------|------------|
| Tempo para rotacionar credencial | ~15 min (SSH + edit + restart) | < 2 min (UI) | Cronometragem manual no smoke |
| Chamadas SSH para mudar config Botyio | 100% | 0% | Log de comandos `vps-deploy` |
| Auditabilidade de mudança de credencial | 0 (nenhum registro) | 100% | Linhas em `audit_log` |

## 9. Suposições e dependências

- `MASTER_ENCRYPTION_KEY` será introduzida como nova env var (32 bytes random, base64), gerenciada exclusivamente pelo dev na VPS — nunca exposta na UI.
- Já existe a tabela `botyo_webhook_deliveries` (PR #7) — apenas lê.
- Frontend admin já tem padrão de Settings (memória `project_q2_phase2`) — esta UI segue o mesmo design system Cinematic Additive Manufacturing.
- Existe role ADMIN no schema atual (CASL) — sem mudança de modelo de auth.

## 10. Tags pendentes de clarificação

Resolvidas abaixo na seção 11.

---

## 11. Clarifications

| # | Pergunta | Opções | Decisão proposta | Razão |
|---|----------|--------|------------------|-------|
| Q1 | Algoritmo de criptografia? | (a) AES-256-GCM via `node:crypto` nativo, (b) `libsodium` (secretbox), (c) `@aws-crypto/client-node` | **(a) AES-256-GCM nativo** | Sem dep nova; ChaCha20 não traz benefício real aqui; AWS KMS seria over para single-VPS. |
| Q2 | Onde fica a master key? | (a) env var `MASTER_ENCRYPTION_KEY` em `.env.production`, (b) arquivo separado em `/etc/aumaf/master.key` chmod 400, (c) HashiCorp Vault | **(b) arquivo separado** chmod 400 owned `deploy:deploy`, lido no boot | Separa fisicamente do ciphertext (DB) — atende R1 melhor que (a); Vault é over-engineering. |
| Q3 | Modelo de dados? | (a) tabela genérica `IntegrationSecret(provider, key, ciphertext, iv, tag)`, (b) tabela específica `BotyioConfig(...)` | **(a) genérica** | Permite reuso futuro (GA4, Pixel) sem migration nova; chave composta `(provider, key)`. |
| Q4 | UI: card único ou wizard? | (a) card único `/admin/integrations/botyio`, (b) wizard multi-step | **(a) card único** | Só 4 campos + 2 botões; wizard é over. |
| Q5 | "Testar conexão" valida o quê? | (a) só formato da chave, (b) chamada autenticada real à API Botyio (HEAD/GET endpoint leve), (c) envio de lead fake | **(b) chamada real** a endpoint leve da Botyio | (a) é frágil; (c) polui dados reais. |
| Q6 | Mostrar valores em claro nunca, ou com "revelar" temporário? | (a) nunca mostrar, só máscara, (b) botão "revelar" com re-autenticação | **(a) nunca mostrar** | Princípio: se admin perdeu a chave, rotaciona — não recupera. Reduz superfície de leak via screenshot/screen-share. |
| Q7 | Audit log: tabela nova ou reaproveitar? | (a) tabela nova `audit_log`, (b) só log estruturado Pino + Sentry | **(b) Pino + Sentry com tag `audit:integration-secret`** | Constituição já manda log estruturado em mutations sensíveis; tabela nova só se houver demanda formal de retenção. |
| Q8 | Cache invalidation no worker? | (a) Pub/Sub Redis, (b) TTL curto (60s), (c) reload por evento BullMQ | **(a) Pub/Sub Redis** com canal `integration-secret:invalidate` | Latência ≈ 0; Redis já está na stack; TTL sofre janela de inconsistência. |
| Q9 | E2E test scope? | (a) só unit + Vitest, (b) + Playwright cobrindo fluxo "rotacionar chave → próximo lead usa chave nova" | **(b) Playwright completo** | Constituição: Playwright obrigatório para fluxo principal de cada entrega. |

## 12. Links

- Spec Botyio original (PR #7): `docs/specs/_completed/...` (a confirmar) + runbook `docs/runbooks/botyio-activation.md`
- ADR-001 (stack core): `docs/decisions/ADR-001-stack.md`
- Memória: `project_botyio_integration.md`
- Constitution: `docs/specs/constitution.md`
