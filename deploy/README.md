# deploy/ — produção AUMAF 3D

Esta pasta contém tudo o que vive **fora dos workspaces** mas é necessário para rodar o stack em produção.

## Estrutura

| Arquivo | Função |
|---|---|
| `Caddyfile` | Reverse proxy + TLS via DNS-01 Cloudflare (modo final, com token configurado) |
| `Caddyfile.placeholder` | HTTP-only, usado entre F2.4 e F2.5 enquanto o token CF não está disponível |
| `docker-compose.production.yml` | Orquestração: postgres + redis + minio + backend + frontend-public + frontend-admin + backend-migrate |
| `Dockerfile.backend` | Multi-stage Node 18 alpine para `@aumaf/backend` |
| `Dockerfile.frontend-public` | Multi-stage para Astro 5 SSR (`@astrojs/node` standalone) |
| `Dockerfile.frontend-admin` | Build Vite + servir estático com nginx-alpine |
| `nginx-admin.conf` | Config nginx para SPA admin (try_files + cache headers) |
| `.env.production.example` | Template de env vars; o real vive em `/srv/aumaf/env/.env.production` (chmod 600) |
| `Makefile` | Comandos padronizados (`make deploy`, `make rollback TAG=…`, `make logs`, etc.) |
| `scripts/bootstrap-server.sh` | Bootstrap idempotente do servidor (reproduzir F1+F2) |
| `scripts/deploy.sh` | Invocado pelo CD do GitHub Actions |
| `scripts/restore-snapshot.sh` | Restore destrutivo a partir de pg_dump local |

## Estrutura no servidor

```
/srv/aumaf/
├── compose/                # rsync do conteúdo desta pasta deploy/
│   ├── docker-compose.production.yml
│   ├── Dockerfile.*
│   ├── nginx-admin.conf
│   ├── Makefile
│   └── scripts/
├── env/
│   └── .env.production     # chmod 600 owner=deploy
├── backups/
│   └── manual/             # pg_dump on demand (make backup-snapshot)
├── caddy-data/             # CertMagic state (Let's Encrypt)
├── caddy-config/           # Caddy autosave config
└── letsencrypt/            # legacy, não usado (Caddy gerencia)
```

Caddy nativo lê de:
- `/etc/caddy/Caddyfile` (cópia simbólica ou rsync de `deploy/Caddyfile`)
- `/etc/caddy/cloudflare.env` (export `CLOUDFLARE_API_TOKEN=…`)

## Comandos chave (no servidor)

```bash
sudo make -C /srv/aumaf/compose deploy        # CI/CD usa o script
sudo make -C /srv/aumaf/compose rollback TAG=abc123
sudo make -C /srv/aumaf/compose logs
sudo make -C /srv/aumaf/compose status
sudo make -C /srv/aumaf/compose backup-snapshot
sudo make -C /srv/aumaf/compose caddy-test
sudo make -C /srv/aumaf/compose caddy-reload
```

## CI/CD

`.github/workflows/ci.yml` roda em PRs (lint + typecheck + test + build).
`.github/workflows/cd.yml` roda em push para `master` (build & push GHCR + SSH deploy).

Secrets necessários no repo (Settings → Secrets and variables → Actions):

| Secret | Valor |
|---|---|
| `SSH_PRIVATE_KEY` | conteúdo de `~/.ssh/aumaf_deploy_ed25519` (chave privada) |
| `SSH_HOST` | `2.24.72.8` |
| `SSH_PORT` | `22` |
| `SSH_USER` | `deploy` |
| `GHCR_TOKEN` | PAT com `read:packages` ou usar `GITHUB_TOKEN` direto |
| `CLOUDFLARE_API_TOKEN` | (opcional no CI; só usado pelo Caddy no servidor) |

## Migração futura para domínio AUMAF

Toda referência de domínio é via env var. Para migrar:

1. Adicionar 3 registros A em `aumaf3d.com.br` (ou domínio definitivo) apontando para o IP da VPS, com proxy adequado
2. Editar `/srv/aumaf/env/.env.production` substituindo todas as URLs `kayoridolfi.ai` → novo domínio
3. Editar `/etc/caddy/Caddyfile` substituindo os 3 hostnames
4. `sudo make caddy-reload` + `sudo make restart-backend`
5. Configurar redirect 301 do velho host para o novo (no Caddy ou Cloudflare)
6. Atualizar `BOTYIO_WEBHOOK_URL` no painel Botyio
