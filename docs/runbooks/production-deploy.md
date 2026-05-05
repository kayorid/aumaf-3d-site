# Runbook — Deploy de produção AUMAF 3D

## Visão geral

Site em homologação na VPS Hostinger `2.24.72.8` (Boston, Ubuntu 22.04 LTS).
URLs de homologação:

- `https://aumaf.kayoridolfi.ai` — site público (Astro 5 SSR)
- `https://admin-aumaf.kayoridolfi.ai` — backoffice (Vite/React static + nginx)
- `https://api-aumaf.kayoridolfi.ai` — API Express + workers BullMQ

Stack na VPS: **Caddy nativo** (reverse proxy + TLS via DNS-01 Cloudflare) → **Docker Compose** (`/srv/aumaf/compose/docker-compose.production.yml`) com 6 containers (postgres, redis, minio, backend, frontend-public, frontend-admin) + 1 job one-shot (`backend-migrate`).

## Deploy automático (caminho normal)

1. Faça merge de uma PR em `master` no GitHub.
2. O workflow `.github/workflows/cd.yml` dispara:
   - **Job `build-push`**: builda 3 imagens (`backend`, `frontend-public`, `frontend-admin`) e pusha para GHCR com tag `<commit-sha>` + `latest`.
   - **Job `deploy`**: SSH para a VPS via chave do secret `SSH_PRIVATE_KEY`, faz `rsync deploy/`, login GHCR, `docker compose pull` + `backend-migrate` + `up -d` + smoke `curl /health`.
3. Acompanhe via **Actions** no GitHub. Falha aborta sem afetar produção (containers atuais permanecem rodando até o `up -d` substituir).

Tempo total esperado: 5–8 min.

## Deploy manual (no servidor)

```bash
ssh -i ~/.ssh/aumaf_deploy_ed25519 deploy@2.24.72.8
sudo make -C /srv/aumaf/compose deploy
```

Equivale a: pull → migrate → up -d --remove-orphans → smoke.

## Rollback

```bash
sudo make -C /srv/aumaf/compose rollback TAG=<commit-sha-anterior>
```

Substitui as 3 imagens pelo SHA fornecido e faz `up -d`. Tempo < 2 min.

Encontrar SHA anterior:
- `git log --oneline master` no laptop
- ou no servidor: `docker image ls 'ghcr.io/kayorid/aumaf-3d-site/backend' --format '{{.Tag}}'` (mostra tags em cache local)

## Atualização de env vars

Edite `/srv/aumaf/env/.env.production` (chmod 600 owner=deploy) e:

```bash
sudo make -C /srv/aumaf/compose restart-backend
# para frontends é necessário pull + up
```

## Inspeção

```bash
sudo make -C /srv/aumaf/compose status   # ps + caddy
sudo make -C /srv/aumaf/compose logs     # tail -f --tail=100
sudo systemctl status caddy
sudo journalctl -u caddy -f
sudo tail -f /var/log/caddy/aumaf-public.log
sudo tail -f /var/log/caddy/aumaf-api.log
```

## Troubleshooting de deploy

| Sintoma | Diagnóstico | Fix |
|---|---|---|
| CD falha em `docker compose pull` | Token GHCR expirado | Verificar GitHub PAT `GHCR_TOKEN` se for secret; ou usar `GITHUB_TOKEN` automático |
| `backend-migrate` falha | Migration ruim | Rollback para SHA anterior; revisar diff Prisma; testar `prisma migrate diff` localmente |
| Backend não fica saudável | Env vars erradas, DB inacessível | `docker compose logs backend`; verificar `DATABASE_URL`, `REDIS_URL` |
| Caddy retorna 502 | Backend down ou crash loop | `make logs` → procurar exception; restart se transient |
| Cert TLS expira | Caddy não conseguiu renovar via DNS-01 | Verificar `CLOUDFLARE_API_TOKEN` em `/etc/caddy/cloudflare.env`; verificar permissões do token; reload Caddy |
| Disco cheio | Imagens antigas acumuladas | `docker image prune -af`; ajustar lifecycle do GHCR |
