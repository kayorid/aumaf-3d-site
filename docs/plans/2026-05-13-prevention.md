# Plano — Prevenção de erros recorrentes AUMAF 3D

**Data**: 2026-05-13 · **Origem**: pergunta do Kayo — "como podemos evitar de cometer esses mesmos erros".

## Diagnóstico

A auditoria revelou padrões recorrentes:

| Padrão observado | Exemplos encontrados |
|---|---|
| Renderização de HTML externo sem sanitização | `render-post.ts` (XSS via Marked), `lgpd/verificar.astro` (innerHTML), `BlockPreview.tsx` admin |
| Mutação de recurso sem ownership check | `/v1/media/:id` PATCH/DELETE |
| Logs com PII em casos de erro | logger sem `email`/`password` em REDACT_PATHS |
| Catálogo desalinhado com realidade | 8 eventos analytics canônicos sem disparo + 3 disparos sem schema |
| Conteúdo estático que vira "desatualizado" silenciosamente | `llms.txt` mantendo PEEK/Ultem após PR #51 de remoção |
| Dependências transitivas com CVE | `tar`/`fast-uri`/`fast-xml-builder` |
| Decisões one-off não documentadas | bug `await worker.run()` PR #47 sem ADR de "patterns proibidos" |

Causa raiz comum: **ausência de guardrails automatizados** — confiamos demais em revisão humana de PRs e em memória da equipe.

## Estratégia em 5 camadas

```
┌─ 5. Auditoria periódica  (revisão minuciosa trimestral, este documento)
├─ 4. Code review          (ADR-004 como checklist obrigatório no PR)
├─ 3. CI gates             (audit + grep + schema validators)
├─ 2. Lint / type system   (regras locais + Zod)
└─ 1. Runtime guards       (DOMPurify, assertCanMutate, redact, rate limit)
```

Cada camada deve falhar fechado quando possível.

---

## Implementado nesta auditoria

### Camada 1 — Runtime guards

- `frontend-public/src/lib/render-post.ts` — DOMPurify com allowlist conservadora.
- `backend/src/services/media.service.ts` — `assertCanMutateMedia()`.
- `backend/src/config/logger.ts` — REDACT_PATHS expandido.
- `backend/src/services/analytics-track.service.ts` — `serverTrack()` sem PII em `properties`.
- `backend/src/services/analytics-ingest.service.ts` — `detectLlmBot()` isola tráfego de crawlers.

### Camada 3 — CI gates

- `.github/workflows/ci.yml` — 3 steps novos:
  - `npm audit --audit-level=high` (continue-on-error inicial)
  - Grep XSS — falha se encontrar `set:html={...content/html...}` fora de `renderPostContent`
  - Grep PII em logs — falha se encontrar `logger.X({email|password|cpf|cnpj|...: ...})`

### Camada 4 — Code review

- `docs/decisions/ADR-004-security-defense-in-depth.md` — checklist canônico de 8 padrões obrigatórios.

---

## Backlog de prevenção (planejar p/ sprints seguintes)

### Curto prazo (1-2 sprints)

- **ESLint rule custom** — `aumaf/no-unsafe-set-html` que detecta `set:html={expr}` quando `expr` não passa por `renderPostContent` ou `DOMPurify.sanitize`. Substitui o grep step do CI por análise AST mais robusta.
- **Husky pre-commit** — rodar typecheck + lint + audit nos arquivos staged antes de commitar (não bloqueia commit; aviso). Baixa fricção, alto valor.
- **Promover CI gates para blocking** — `npm audit high`, grep XSS, grep PII. Hoje continue-on-error; depois de zerar a contagem inicial, virar required check no branch protection.
- **Schema validator de analytics** — script que cruza `ANALYTICS_EVENT_NAMES` com `grep -r 'data-track=' frontend-public/src`. Falha se há disparo sem schema ou schema sem disparo (warn, não block).

### Médio prazo (1-3 meses)

- **Helmet em produção** — `helmet({ contentSecurityPolicy: false })` no Express + CSP no Caddy (report-only por 1 semana → enforce). Cobre HSTS, X-Frame-Options, X-Content-Type-Options coerentes mesmo se Caddy for trocado.
- **Rate limiter por email** no `/auth/login` — 5 tentativas/5 min, lockout temporário, evento `auth.failed_attempt` no audit log.
- **Captcha** (Cloudflare Turnstile) em `/contato`, `/lgpd/direitos` e `/auth/login`. Mitiga spam + brute-force sem fricção visível ao usuário legítimo.
- **2FA TOTP** para roles `ADMIN` — rollout em 3 etapas: (a) opcional self-service, (b) e-mail de incentivo a 2 admins-piloto, (c) obrigatório.
- **Audit log estruturado** — tabela `audit_logs` com `userId, action, resourceType, resourceId, ip, ua, metadata, createdAt`. Middleware Express + UI `/admin/auditoria` (admin-only, 90d retenção).

### Longo prazo (próximo trimestre)

- **Rotação automática de secrets** — `JWT_SECRET`, `LGPD_ANON_SALT`, `MASTER_ENCRYPTION_KEY` com rotação trimestral via script + backup em 1Password rotacionado.
- **Backup off-site** do `MASTER_ENCRYPTION_KEY` (perda = perda de todos os segredos Botyio/LLM cifrados).
- **Partição PostgreSQL** para `analytics_events` por mês — manutenção via worker mensal que cria próxima + drop da com 13m+.
- **Dependabot / Renovate** — PR semanal automático para CVEs e dependências defasadas. Auto-merge para patches; humano para minors/majors.
- **SBOM** (`syft`) — gerado no CI, anexado ao release, consultável quando aparecer CVE nova.
- **Pentest externo** — uma vez antes de migrar domínio para `aumaf3d.com.br`.

---

## Workflow para "como saber se está prevenindo"

A cada **auditoria minuciosa trimestral**:

1. Re-rodar a auditoria minuciosa (5 dimensões em paralelo — usar como template os 5 agents desta sessão).
2. Comparar contagem por severidade contra a baseline desta auditoria.
3. **Métricas alvo**:
   - CRÍTICO: sempre 0.
   - ALTO: ≤ 3 (cair de 12 para ≤ 3 até Q3/2026).
   - Tempo médio de fix: CVE HIGH < 7 dias, vulnerabilidade exploitable < 24h.
4. Atualizar este plano com novos padrões aprendidos.
5. Promover guardas de continue-on-error para blocking quando viáveis.

---

## Anti-padrões explicitamente proibidos (vai para CLAUDE.md)

1. `set:html` com expressão não-sanitizada no front-public.
2. PATCH/DELETE em recurso de usuário sem `assertCan*()`.
3. `logger.X` com campo PII direto.
4. `await worker.run()` no `bootWorkers()` (bloqueia o boot; usar `autorun: false` + scheduler).
5. Eventos analytics disparados sem entrada em `ANALYTICS_EVENT_NAMES`.
6. PII em `analytics_events.properties` (use `leadId`).
7. Secrets em variáveis de ambiente sem mirror em arquivo persistente para systemd (incidente Caddy 2026-05-13).
8. `npm audit fix --force` em main sem teste de regressão completo (semver-major silencioso).
