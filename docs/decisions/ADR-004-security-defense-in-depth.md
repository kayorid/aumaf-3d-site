# ADR-004 — Defesa em profundidade: padrões obrigatórios

**Status**: Aceito · **Data**: 2026-05-13 · **Origem**: Auditoria minuciosa 2026-05-13

## Contexto

A auditoria de 2026-05-13 revelou 3 vulnerabilidades **críticas** (XSS via Marked sem DOMPurify, IDOR em `/v1/media/:id`, 3 CVEs HIGH em dependências transitivas) e várias **altas** (PII em logs, ausência de 2FA, salt default, falta de CSP). Todas previsíveis e evitáveis — não eram complexas. O padrão comum: **lapsos de revisão** em código que parece "simples" mas trafega entrada externa.

Este ADR formaliza as defesas mínimas que toda nova superfície de código deve respeitar — para que esse padrão de erro não se repita.

## Decisão

### 1. Renderização de HTML proveniente de banco/usuário — **DOMPurify obrigatório**

Toda string HTML/Markdown que chegue de:
- Banco de dados (posts, blocos do editor WYSIWYG, configurações, FAQ)
- Input de usuário (formulários, query params)
- Webhook externo (Botyio, LLMs)

**DEVE** passar por `DOMPurify.sanitize(...)` antes de ser entregue ao DOM/innerHTML/`set:html`. Allowlist conservadora — bloqueia `<script>`, `<iframe>`, `on*=`, `javascript:`, `style=` por padrão.

Single source of truth: `frontend-public/src/lib/render-post.ts` (`renderPostContent`).

**Detecção**: CI grep step em `ci.yml` que falha quando encontra `set:html={...content/html...}` fora desse helper.

### 2. Mutações de recurso — **ownership check obrigatório**

Toda rota PATCH/DELETE/PUT em recurso de usuário **DEVE** verificar `resource.createdById === req.user.id` (ou role privilegiada `ADMIN`) antes de aplicar a mudança.

Padrão canônico: `assertCanMutateMedia()` em `backend/src/services/media.service.ts`.

Falha = `403 Forbidden` + log `tag: 'audit:<resource>', action: 'FORBIDDEN'` para detecção de probing.

**Detecção**: code review humano — sem lint automatizado robusto (semântica). Compensar com testes de integração: cada rota PATCH/DELETE precisa de um teste "user B não consegue mutar recurso do user A".

### 3. Logs — **redact obrigatório de PII e secrets**

Lista canônica em `backend/src/config/logger.ts` (`REDACT_PATHS`):
- Secrets: `password`, `passwordHash`, `token`, `refreshToken`, `apiKey`, `webhookSecret`, `masterKey`, `totpSecret`, `jwtSecret`, `MASTER_ENCRYPTION_KEY`
- PII (LGPD): `cpf`, `cnpj`, `phone`, `email` (em corpo de erro)
- Headers: `cookie`, `authorization`, `x-api-key`, `x-botyo-signature`
- Body: `password`, `currentPassword`, `newPassword`

**Detecção**: CI grep step que falha em `logger.info/warn/error({campo_sensível: ...})` direto.

### 4. Dependências — **`npm audit --audit-level=high` blocking**

CVE HIGH+ não vai a produção. Quando aparecer:
1. Avaliar se há fix sem breaking change (`npm audit fix`).
2. Se for semver-major (`fix --force` quebra), abrir issue + documentar plano de migração.
3. Se for impossível upgrade rápido, justificar via comentário em `.security/audit-exceptions.md` com prazo.

**Detecção**: step `npm audit --audit-level=high` em CI (transição: hoje continue-on-error, promover a blocking quando contagem cair a zero).

### 5. Eventos analytics — **catálogo obrigatório em `@aumaf/shared`**

Qualquer novo evento disparado pelo SDK ou pelo backend **DEVE** estar em `packages/shared/src/schemas/analytics.ts`:`ANALYTICS_EVENT_NAMES`. Schema-first impede drift catálogo vs realidade (problema identificado: 8 eventos canônicos nunca disparados + 3 disparados sem schema).

**Detecção**: skill `analytics-tagging` (já existe) deve checar o catálogo antes de aprovar tagueamento novo. PR review: rejeitar `data-track="evento_novo"` sem entrada no schema.

### 6. PII em events — **proibido em `properties`**

`serverTrack()` e SDK client **nunca** devem persistir `email`, `phone`, `cpf`, `cnpj`, `name` em `properties` do AnalyticsEvent. Usar somente referências estáveis (`leadId`, `postId`, `userId`).

Justificativa: `analytics_events` pode crescer para milhões de linhas; um vazamento de cópia de banco expõe PII sem necessidade. Refs garantem que dados sensíveis sigam o ciclo de vida da tabela original (retenção LGPD via `pruneOldEvents`).

### 7. Cookies de autenticação — **httpOnly + Secure + SameSite=Lax**

JWT **nunca** em `localStorage`. Sempre em cookie httpOnly + secure (em produção) + sameSite=lax (compatível com OAuth callbacks). Tokens de password reset / DSR magic links: TTL ≤ 24h, single-use.

### 8. Validação de input — **Zod obrigatório em rotas Express**

Toda rota com body/query/params dinâmico **DEVE** validar via schema Zod de `@aumaf/shared` antes de chegar ao service. Schema com `.strict()` para impedir campos extras.

Exemplo canônico: `mediaRoutes.patch` valida com `UpdateMediaInputSchema.parse(req.body)`.

## Consequências

**Positivas**:
- Erros recorrentes (XSS, IDOR, PII em log) viram impossíveis de regredir sem desativar explicitamente um guard.
- Code review humano fica focado em decisões de design — guardas mecânicos cuidam de classes de bug previsíveis.
- Onboarding de novos contribuidores fica mais simples: regras são código, não tribal knowledge.

**Negativas / trade-offs**:
- CI um pouco mais lento (audit + grep steps adicionam ~30s).
- Falsos positivos do grep XSS exigem refactor ou comentário `// eslint-disable-next-line aumaf/no-unsafe-set-html — sanitized via X`.
- Manutenção do catálogo de analytics pode parecer overhead; pago pela qualidade dos dashboards.

## Itens estruturais ainda em backlog

Documentado em `docs/plans/2026-05-13-prevention.md`. Resumo:
- 2FA TOTP para roles `ADMIN` (rollout em fases).
- CSP em modo `report-only` por 1 semana antes de enforce.
- Partição PostgreSQL para `analytics_events`.
- Captcha (Turnstile) em formulários públicos.
- Backup off-site rotacionado de `MASTER_ENCRYPTION_KEY` e `LGPD_ANON_SALT`.

## Referências

- Plano de auditoria: `docs/plans/2026-05-13-audit-summary.md`
- Plano de prevenção: `docs/plans/2026-05-13-prevention.md`
- Plano de segurança: `docs/plans/2026-05-13-security-hardening.md`
- OWASP Top 10 (2021): A01 (Broken Access Control), A03 (Injection), A06 (Vulnerable Components), A09 (Logging Failures).
