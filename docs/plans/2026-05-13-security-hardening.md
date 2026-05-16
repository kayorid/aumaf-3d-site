# Plano — Security Hardening AUMAF 3D

**Data**: 2026-05-13 · **Owner**: kayoridolfi.ai · **Prazo sugerido**: 2 sprints (1 lote urgente + 1 lote estrutural)

## Objetivo
Eliminar 3 vulnerabilidades críticas, fechar IDOR + XSS, adicionar 2FA, CSP, rate-limit por email, e endurecer dependências.

---

## LOTE 1 — Urgente (1 PR, ~4h)

### 1.1 XSS no blog público — Sanitizar Markdown→HTML
- **Arquivo**: `frontend-public/src/lib/render-post.ts:19-21`
- **Problema**: `marked` com `html:true` sem sanitização; rendered via `set:html` em `blog/[slug].astro:117`.
- **Fix**:
  ```bash
  cd frontend-public && npm i isomorphic-dompurify
  ```
  ```ts
  import DOMPurify from 'isomorphic-dompurify';
  export function renderPostContent(md: string) {
    const html = marked.parse(md, { gfm: true });
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['h1','h2','h3','h4','p','a','ul','ol','li','strong','em','code','pre','blockquote','img','figure','figcaption','table','thead','tbody','tr','th','td','br','hr'],
      ALLOWED_ATTR: ['href','target','rel','src','alt','title','class','id','loading','decoding','width','height'],
      ALLOWED_URI_REGEXP: /^(https?:\/\/|\/|#|mailto:)/i,
    });
  }
  ```
- **Teste**: caso `<script>alert(1)</script>` deve sumir; `<img onerror=...>` idem.

### 1.2 CVEs em dependências
- `tar` ≤7.5.10 (6 CVEs path traversal), `fast-uri` ≤3.1.1, `fast-xml-builder` ≤1.1.6.
- **Fix**: `npm audit fix` no root + `cd backend && npm audit fix` + revalidar `npm audit`.
- **Aceitação**: `npm audit --audit-level=high` retorna 0.

### 1.3 IDOR em `/v1/media/:id`
- **Arquivo**: `backend/src/routes/media.routes.ts:39-56`, `backend/src/services/media.service.ts:106,118`.
- **Fix** (`media.service.ts`):
  ```ts
  export async function updateMedia(id, input, userId) {
    const existing = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) throw httpErrors.notFound('Media not found');
    if (existing.createdById !== userId) throw httpErrors.forbidden();
    return prisma.mediaAsset.update({ where: { id }, data: input });
  }
  ```
- **Mesma lógica** para `deleteMedia`. Adicionar bypass para roles `ADMIN`.
- **Teste**: jest com 2 usuários — user B não consegue PATCH/DELETE asset do user A.

### 1.4 XSS em `/lgpd/verificar`
- **Arquivo**: `frontend-public/src/pages/lgpd/verificar.astro:50+`.
- **Fix**: substituir `innerHTML` por `textContent` em mensagens; manter `innerHTML` apenas para HTML estático sem interpolação.

### 1.5 Logs — redação de PII
- **Arquivo**: `backend/src/config/logger.ts:4-19`.
- **Fix**: adicionar a `REDACT_PATHS`:
  ```ts
  '*.password', '*.email', '*.cpf', '*.cnpj', 'req.headers.cookie', 'req.headers.authorization',
  '*.passwordHash', '*.token', '*.refreshToken'
  ```

---

## LOTE 2 — Estrutural (1 PR, ~12h)

### 2.1 Rate-limit por email no /auth/login (anti brute-force)
- **Arquivo**: `backend/src/app.ts:32-37`, `backend/src/routes/auth.routes.ts`.
- **Fix**: adicionar `express-rate-limit` por `req.body.email` em `/auth/login` — 5 tentativas/5min, bloqueio temporário.
- Adicionar colunas em `User`: `failedLoginAttempts INT DEFAULT 0`, `lockedUntil TIMESTAMP NULL`.
- Lógica em `auth.service.login()`: incrementa em falha, reseta em sucesso, retorna 423 (Locked) se `lockedUntil > now()`.

### 2.2 2FA (TOTP) para ADMIN
- Backend: `speakeasy` + tabela `user_totp_secrets` (encrypted).
- Endpoint `/v1/auth/totp/setup` (gera QR), `/v1/auth/totp/verify`, `/v1/auth/totp/disable`.
- Login flow: senha OK → se TOTP habilitado, retorna `{ requireTotp: true, totpToken }` (JWT de 5min, scope=`totp-pending`); cliente envia code → backend valida → emite JWT final.
- Admin UI: `/perfil/seguranca` com setup wizard.
- Forçar para roles `ADMIN`/`OWNER` (configurável via env `REQUIRE_TOTP_ROLES`).

### 2.3 CSP no Caddyfile
- **Arquivo**: `deploy/Caddyfile:15-22`.
- **Fix** (após validar com `report-only` em staging por 1 semana):
  ```caddy
  header {
    Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms https://connect.facebook.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com https://*.clarity.ms https://api.aumaf.kayoridolfi.ai; frame-src 'self' https://www.facebook.com; object-src 'none'; base-uri 'self'; form-action 'self';"
    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    X-Content-Type-Options "nosniff"
    X-Frame-Options "SAMEORIGIN"
    Referrer-Policy "strict-origin-when-cross-origin"
    Permissions-Policy "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  }
  ```
- Validar com `securityheaders.com` ≥ A.

### 2.4 Rotação de secrets em produção
- Rotar **JWT_SECRET** (invalida sessões — comunicar a Marcos/Felipe).
- Rotar **LGPD_ANON_SALT**: gerar `openssl rand -hex 32`, persistir em `/srv/aumaf/env/.env.production`, backup em 1Password.
- Rotar **MASTER_ENCRYPTION_KEY**: cuidado — precisa re-encrypt das credenciais Botyio/LLM (script `re-encrypt-secrets.ts`).
- Validar em `env.ts`: `NODE_ENV=production && !MASTER_KEY_PATH → throw`.

### 2.5 Audit log
- Tabela `audit_logs` (userId, action, resourceType, resourceId, ip, userAgent, metadata JSON, createdAt).
- Middleware Express que registra: login/logout, criação/edição/deleção de Post/Media/User/Lead/Settings.
- UI em `/admin/auditoria` (admin-only).
- Retenção: 90 dias (rotaciona via worker).

### 2.6 Sanitizar admin WYSIWYG
- **Arquivo**: `frontend-admin/src/features/editor/blocks/BlockPreview.tsx`.
- **Fix**: `DOMPurify.sanitize()` antes de `innerHTML`. Persistir HTML sanitizado, não raw.

---

## Critérios de aceitação globais

- [ ] `npm audit --audit-level=high` = 0 vulnerabilidades
- [ ] Test XSS no /blog/[slug] com payloads OWASP — todos sanitizados
- [ ] Jest: 2 testes IDOR (media + posts) passando
- [ ] `securityheaders.com` ≥ A em produção
- [ ] Lockout funciona após 5 tentativas falhas (jest + manual)
- [ ] TOTP funcional para 1 conta ADMIN piloto
- [ ] Smoke test passa: `./scripts/smoke-test.sh` 100%
