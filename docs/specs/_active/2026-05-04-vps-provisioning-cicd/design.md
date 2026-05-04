# Design — VPS Provisioning + CI/CD

> **Estado**: 🟡 esqueleto — preenchimento condicional após `clarify` (`requirements.md` §8)
>
> Este documento descreve o **HOW técnico** apenas após as 12 perguntas estarem respondidas. As seções abaixo são placeholders com a topologia recomendada que servirá de base, ajustável conforme respostas.

---

## 1. Topologia recomendada (rascunho)

```
                                 ┌──────────────────┐
                                 │   Cloudflare     │   (CDN + DDoS + WAF + DNS)
                                 │   Free Plan      │
                                 └────────┬─────────┘
                                          │ TLS 1.3 (orig pull)
                                          ▼
                              ┌───────────────────────┐
                              │   VPS  2.24.72.8      │
                              │   Ubuntu 22.04 LTS    │   ← UFW (22-custom, 80, 443)
                              │   2 vCPU / 4 GB / 80G │      fail2ban
                              │                       │      unattended-upgrades
                              │  ┌─────────────────┐  │
                              │  │  Caddy 2 (host) │  │   ← Reverse proxy + auto-TLS
                              │  └────────┬────────┘  │      HTTP/2 + Brotli
                              │           │ docker_net (bridge)
                              │   ┌───────┴────────┐  │
                              │   │                │  │
                              │   ▼                ▼  │
                              │ frontend-public  frontend-admin (estático /admin)
                              │   (Astro SSR)    (nginx-static)
                              │                       │
                              │   ▼ /api            │
                              │ backend (Express)     │
                              │   + workers BullMQ    │
                              │       │     │         │
                              │       ▼     ▼         │
                              │  postgres  redis  minio (volumes)
                              └───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │  Off-site backup      │   (Cloudflare R2 ou Backblaze B2)
                              │  pg_dump + minio      │
                              └───────────────────────┘
```

---

## 2. Hardening (F1)

A preencher após Q-2 (provedor / SO confirmado).

Itens canônicos:
- `apt update && apt full-upgrade -y`
- Timezone (`America/Sao_Paulo`), hostname, NTP (chrony)
- Swap 4 GB se RAM ≤ 4 GB
- Usuário `deploy` com sudo + grupo `docker`
- Chave SSH ed25519 gerada localmente; pública copiada via `ssh-copy-id` em sessão paralela
- `/etc/ssh/sshd_config.d/00-aumaf.conf`:
  - `Port <CUSTOM>` (Q-clarify, default 2222)
  - `PermitRootLogin no`
  - `PasswordAuthentication no`
  - `PubkeyAuthentication yes`
  - `AllowUsers deploy`
  - `MaxAuthTries 3`, `LoginGraceTime 20`
- UFW: deny incoming default; allow `<CUSTOM>/tcp`, 80/tcp, 443/tcp; allow Cloudflare IPs only para 80/443 quando Q-3 = sim
- fail2ban com jails `sshd`, `sshd-ddos`
- `unattended-upgrades` ativado, security-only, sem reboot automático em horário comercial
- Auditoria: `lynis audit system` baseline (não bloqueante)

**Validação F1**: cliente externo conecta apenas em porta nova com chave; `nmap` confirma só 80/443 + porta-SSH abertos.

---

## 3. Stack base (F2)

A preencher após Q-3 (Cloudflare?).

- Docker Engine via repo oficial (`get.docker.com`) + plugin compose v2
- Daemon config: `log-driver=json-file`, `max-size=50m`, `max-file=5`, `live-restore=true`
- Caddy 2 instalado nativo (apt) — fora de container, mais simples para auto-TLS
- Caddyfile com 3 sites virtuais (mapeados a Q-1)
- TLS via Let's Encrypt; resolver DNS-01 se Cloudflare API token disponível, senão HTTP-01

---

## 4. Containerização (F3)

### 4.1 Dockerfiles

- **backend/Dockerfile** — multi-stage:
  1. `node:18-alpine AS deps` → `npm ci --omit=dev`
  2. `node:18-alpine AS build` → tsc + Prisma generate
  3. `node:18-alpine AS runtime` → copy dist + node_modules; user `node`; `HEALTHCHECK` em `/health`
- **frontend-public/Dockerfile**:
  - SSG: `node:18-alpine AS build` → `npm run build` → output servido por `caddy:alpine` ou nginx
  - SSR (modo atual): runtime Node, similar ao backend, com `HOST=0.0.0.0 PORT=4321`
- **frontend-admin/Dockerfile** — apenas estático: build Vite → `nginx:alpine` com config restrita

### 4.2 docker-compose.production.yml

- Network `aumaf_internal` (não exposta externamente)
- Caddy fora de container OU container expondo 80/443 — decidido após Q-3
- `restart: unless-stopped` em todos
- `mem_limit` por serviço (Postgres 1G, backend 512M, frontends 256M)
- Tag de imagem **sempre** `<sha>` em produção, nunca `latest`

### 4.3 Migrations Prisma

- Job dedicado `backend-migrate` (one-shot) que roda `prisma migrate deploy` antes de subir backend principal.
- Falha aborta deploy.

---

## 5. CI/CD (F4)

A preencher após Q-2 (provedor).

### 5.1 Workflows

- `.github/workflows/ci.yml` — em PR e push para `master`:
  - `setup-node` v20 LTS
  - `npm ci` + cache
  - `npm run lint` + `npm run typecheck` + `npm run test` (Jest BE + Vitest admin) + `npm run build`
  - Playwright headless contra build local
- `.github/workflows/cd.yml` — em push para `master`:
  - Login GHCR
  - Build & push 3 imagens com cache buildx + tag `<sha>` + `latest`
  - SSH para servidor (action `appleboy/ssh-action` ou raw OpenSSH)
  - No servidor: `git pull` (apenas compose file + Caddyfile), `docker compose pull`, `docker compose up -d --remove-orphans`, `docker image prune -af`
  - Smoke pós-deploy: `curl -f https://<dominio>/health`

### 5.2 Secrets do GitHub

- `SSH_PRIVATE_KEY` — chave do usuário `deploy`
- `SSH_HOST`, `SSH_USER=deploy`, `SSH_PORT`
- `GHCR_TOKEN` — PAT com `write:packages`
- `SENTRY_AUTH_TOKEN`, `SENTRY_DSN_BACKEND`, `SENTRY_DSN_PUBLIC`, `SENTRY_DSN_ADMIN`
- `CLOUDFLARE_API_TOKEN` (se Q-3 sim)
- Outros conforme Q-4 (Resend), Q-5 (R2/B2), Q-11 (Sentry)

### 5.3 Rollback

- `make rollback TAG=<sha>` em `Makefile.production` no servidor:
  - `docker compose pull` com override de tag
  - `docker compose up -d --no-deps backend frontend-public frontend-admin`
- Documentar no runbook + testar pré go-live.

---

## 6. Observabilidade (F5)

A preencher após Q-11 e Q-12.

- Sentry: 3 projetos (backend, frontend-public, frontend-admin); release = commit SHA; environment = production
- `/health` já existe (Q3 foundation): expor via Caddy `/health` (sem autenticação) ou `/_health`
- Healthchecks.io OU UptimeRobot OU BetterStack — escolha em Q-12
- Alertas: webhook Telegram + e-mail via Resend (reaproveita Q-4)
- Logs: docker-compose logs com `json-file` + rotação 50 MB × 5 arquivos por serviço; `journalctl` para Caddy

---

## 7. Backup + DR (F6)

A preencher após Q-5.

- Cron no servidor (não no container):
  - 03:00 UTC diário: `pg_dump -Fc` → gpg/age encrypt → upload S3-compat (R2 ou B2)
  - Domingo 04:00 UTC semanal: `mc mirror` MinIO → off-site
- Retenção: 7 daily + 4 weekly + 3 monthly (rotação no servidor + bucket lifecycle)
- Restore: runbook `docs/runbooks/production-backup-restore.md` com comandos exatos + validação
- Pré go-live: dry-run de restore em servidor staging ou local Docker

---

## 8. Performance + CDN (F7)

- Cloudflare Free com:
  - "Always Use HTTPS" on
  - "Automatic HTTPS Rewrites" on
  - "Brotli" on
  - "HTTP/3" on
  - Cache: edge cache TTL 4h para HTML, 1y para assets com hash
  - Page Rules: bypass cache para `/admin/*` e `/api/*`
  - SSL: Full (strict)
- Caddy:
  - HTTP/2 + HTTP/3 (server experimental_http3)
  - `encode br gzip` para text/*
  - `header /assets/* Cache-Control "public, max-age=31536000, immutable"`
- Astro SSR:
  - Cache de blog em Redis (TTL 5 min) — hook em post-publish para invalidar
- Lighthouse CI no GH Actions (não-bloqueante) contra preview de produção

---

## 9. Estrutura de arquivos do repo (a criar)

```
aumaf-3d-site/
├── deploy/
│   ├── docker-compose.production.yml
│   ├── Caddyfile
│   ├── Makefile          # rollback, logs, restart, restore, backup
│   ├── scripts/
│   │   ├── bootstrap-server.sh   # F1 idempotente
│   │   ├── backup-db.sh          # cronado via systemd timer
│   │   ├── restore-db.sh
│   │   └── deploy.sh             # invocado pelo CD
│   └── README.md
├── backend/Dockerfile (novo)
├── frontend-public/Dockerfile (novo)
├── frontend-admin/Dockerfile (novo)
├── .github/workflows/
│   ├── ci.yml
│   └── cd.yml
└── docs/runbooks/
    ├── production-deploy.md      (novo)
    ├── production-incident.md    (novo)
    └── production-backup-restore.md (novo)
```

---

## 10. Auditoria de over-engineering (validation gate)

Antes de fechar este design, validar:

- ❓ Caddy nativo vs. container — **decisão**: nativo (mais simples, menos um container) ✓
- ❓ Reverse proxy alternativo (Traefik, nginx) — **decisão**: Caddy (auto-TLS sem boilerplate) ✓
- ❓ Service mesh (Consul, Linkerd) — **descartado** (overkill) ✓
- ❓ K8s/Nomad — **descartado** (overkill) ✓
- ❓ Loki + Grafana stack — **descartado** para v1 (json-file rotation cobre); pode entrar como Phase 2 se demanda surgir ✓
- ❓ PgBouncer — **descartado** (tráfego baixo) ✓
- ❓ Certbot + nginx separado — **descartado** (Caddy faz nativo) ✓
- ❓ Multi-stage CD (build em runner separado) — **mantido** (boa prática)

---

## Pendências para fechar este documento

Toda seção tem 🟡 onde falta informação de Clarify. Quando todas resolvidas, este documento volta para revisão como `Plan Final` e segue para `tasks.md`.
