# Política de Segurança

A AUMAF 3D leva segurança a sério. Esta política descreve como reportar vulnerabilidades e o que esperamos em troca.

## Reportar uma vulnerabilidade

**Não abra issues públicas para vulnerabilidades.** Em vez disso:

- E-mail: **felipe@aumaf3d.com.br** (Encarregado de Dados — Luiz Felipe Risse)
- Backup: **contato@aumaf3d.com.br** (operações)

Inclua quando possível:

- Descrição do problema e impacto potencial
- Passo a passo de reprodução
- Versão / commit / URL afetados
- Eventual PoC (proof-of-concept) — sem causar dano a dados reais

Resposta inicial em até **3 dias úteis**. Correção e disclosure coordenado dentro do que for razoável conforme a severidade.

## Escopo

Cobertos por esta política:

- `https://aumaf3d.com.br` e subdomínios em produção
- Código deste repositório (`backend`, `frontend-public`, `frontend-admin`, `packages/*`, `deploy/`)
- Pipeline de CI/CD (`.github/workflows/`)

Fora de escopo:

- Vendors de terceiros (Hostinger, Cloudflare, Featurable, Behold, Botyio, OpenAI/Anthropic/Gemini) — reporte diretamente ao fornecedor.
- Ataques que exijam acesso físico ao servidor ou comprometimento de credenciais já vazadas.
- Engenharia social contra colaboradores.

## Postura de defesa

Decisões de segurança e camadas de defesa em profundidade estão documentadas em:

- [ADR-004 — Segurança em camadas](docs/decisions/ADR-004-security-defense-in-depth.md)
- [ADR-002 — Cifragem de credenciais de integrações](docs/decisions/ADR-002-integration-secrets-encryption.md)
- Runbooks: [`production-incident.md`](docs/runbooks/production-incident.md), [`integration-secrets-master-key.md`](docs/runbooks/integration-secrets-master-key.md)

Controles principais:

- HTML de usuário/banco sanitizado por `renderPostContent()` (sanitize-html)
- Autorização por CASL + ownership check via `assertCan*()`
- JWT em cookie httpOnly com `SameSite=Lax` + flags `Secure` em prod
- Redaction de PII/secrets em logs (`backend/src/config/logger.ts:REDACT_PATHS`)
- `npm audit --audit-level=high` obrigatório no CI
- Eventos analytics restritos a whitelist (`ANALYTICS_EVENT_NAMES`)
- LGPD: Consent Mode v2, retenção automática via worker BullMQ, fluxo DSR completo

## Disclosure coordenado

Pedimos que você:

1. Dê tempo razoável para correção antes de divulgar publicamente.
2. Não acesse, modifique ou exfiltre dados além do mínimo necessário para demonstrar a vulnerabilidade.
3. Não execute DoS, spam, ataques de força bruta em produção ou interfira com a operação do serviço.

Em troca, comprometemo-nos a:

- Responder rapidamente e manter você informado do andamento.
- Creditá-lo publicamente na correção, se desejar.
- Não tomar ações legais contra pesquisas feitas de boa-fé dentro deste escopo.

## LGPD

Para questões relacionadas a tratamento de dados pessoais (não vulnerabilidades), o canal oficial é o mesmo do Encarregado: **felipe@aumaf3d.com.br**. Fluxo DSR público: `/preferencias-de-cookies` e formulário de solicitação interno em produção. Runbook operacional em [`docs/runbooks/lgpd-operations.md`](docs/runbooks/lgpd-operations.md).
