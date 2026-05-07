# ADR-002 — Criptografia em repouso para credenciais de integração

**Status**: Aceito
**Data**: 2026-05-06
**Autores**: Kayo Ridolfi (kayoridolfi.ai), Claude (Opus 4.7)
**Substitui**: —
**Linkado a**: `docs/specs/_active/2026-05-06-botyio-config-ui/`

## Contexto

A integração Botyio (PR #7) introduziu 4 envs sensíveis em `/srv/aumaf/env/.env.production` (`BOTYIO_API_KEY`, `BOTYIO_WEBHOOK_SECRET`, `BOTYIO_BASE_URL`, `BOTYIO_ENABLED`). Para rotacionar, ativar/desativar ou trocar o ambiente, o operador precisa de SSH + edit + restart. A AUMAF (cliente final) não tem autonomia operacional, e não há trilha de auditoria das mudanças.

A feature `botyio-config-ui` exige que essas credenciais virem dinâmicas via UI no backoffice **sem reduzir o nível de segurança atual**.

## Decisão

1. **Criptografia em repouso com AES-256-GCM nativo** (`node:crypto`), sem nova dependência. GCM provê confidencialidade + integridade (authTag). IV de 12 bytes randomizado por valor.

2. **Master key em arquivo separado** `/etc/aumaf/master.key` (32 bytes binários, `chmod 400`, owner `deploy:deploy`), montada como volume read-only no container backend (`/etc/aumaf/master.key:/etc/aumaf/master.key:ro`). **Não** vive no `.env` nem no banco — atende defesa em profundidade: vazar o `.env.production` ou um backup do DB isoladamente não é suficiente para decifrar.

3. **Modelo de dados genérico** — tabela `integration_secrets(provider, key, ciphertext, iv, authTag, isSensitive, lastFour, updatedBy, updatedAt)`. Evita N tabelas para N integrações; estrutura reusável para GA4/Pixel/SMTP futuros sem nova migration.

4. **Mascaramento absoluto na UI**. A API admin `GET /admin/integrations/botyio` retorna apenas máscara `••••xxxx` + metadados (`updatedAt`, `updatedBy`). **Sem botão "revelar"**: se o admin perdeu a chave, rotaciona na Botyio. Reduz superfície de leak via screenshot/screen-share.

5. **Cache + Pub/Sub Redis** para invalidação. Service mantém cache em memória (TTL 30s); cada `setSecret` publica em `integration-secret:invalidate`, todos os subscribers (workers, segundo backend instance) limpam cache local. Latência ≈ 0 e zero janela de inconsistência.

6. **Fallback de bootstrap**. Na primeira inicialização, se uma row não existe em `integration_secrets`, o backend lê o env correspondente, criptografa e persiste. Após isso, DB é fonte da verdade. Permite rollback sem ruptura.

7. **Auditoria via Pino + Sentry** com tag estruturada `audit:integration-secret`, gravando `userId`, `action`, `fieldsChanged` — **nunca** os valores. Sem tabela `audit_log` dedicada (YAGNI até haver demanda formal de retenção).

8. **Pino redaction** configurado para `apiKey`, `webhookSecret`, `plaintext`, `ciphertext`, `MASTER_ENCRYPTION_KEY`, `req.headers["x-api-key"]`, `req.headers["x-botyo-signature"]`, prevenindo leak via log estruturado.

## Alternativas consideradas

| Opção | Veredito |
|-------|----------|
| Master key no `.env.production` | ❌ — mesmo escopo de blast radius do ciphertext |
| AWS KMS / GCP KMS | ❌ — over-engineering para single-VPS (custo, latência, dep nova) |
| HashiCorp Vault | ❌ — infra inteira nova só para gerir 4 segredos |
| libsodium secretbox | ❌ — dep nova; ChaCha20 não traz benefício relevante aqui |
| Tabela específica `BotyioConfig` | ❌ — N tabelas para N integrações |
| Botão "revelar valor" temporário | ❌ — risco de leak em screen-share/screenshot supera ergonomia |
| Tabela `audit_log` dedicada | ❌ — YAGNI; Pino + Sentry já cobrem e a constituição §4 já manda log estruturado |
| TTL curto (60s) para invalidação | ❌ — janela de inconsistência inaceitável quando há rotação |

## Consequências

### Positivas
- AUMAF passa a rotacionar credenciais via UI em < 2 min (vs ~15 min via SSH)
- 100% das mudanças auditadas (Pino + Sentry)
- Zero downtime na rotação (Pub/Sub invalida cache imediatamente)
- Defesa em profundidade: vazar DB **OU** master key (separadamente) não compromete dados

### Negativas / dívidas aceitas
- **Backups do banco passam a conter material sensível (ciphertext + IVs)**. Sem a master key, não decifra — mas backups precisam ser tratados com mesmo cuidado que o `.env.production`. Documentado em `docs/runbooks/production-restore.md`.
- **Provisionamento da VPS ganha um passo manual** (gerar master key antes do primeiro boot). Documentado no skill `vps-deploy`.
- **Perda da master key = perda das credenciais** (precisam ser regeneradas na Botyio). Mitigação: backup criptografado da master key off-server.
- **Rotação da master key requer migration** (re-cifrar todas as rows com a nova chave). Não automatizado nesta feature; runbook para escrever quando for necessário.

## Referências

- `backend/src/lib/crypto.ts`
- `backend/src/services/integration-config.service.ts`
- `backend/src/lib/integration-bootstrap.ts`
- `backend/src/lib/redis-pubsub.ts`
- `frontend-admin/src/features/integrations/`
- Migration `backend/prisma/migrations/20260506233552_add_integration_secrets/`
- Spec: `docs/specs/_active/2026-05-06-botyio-config-ui/`
