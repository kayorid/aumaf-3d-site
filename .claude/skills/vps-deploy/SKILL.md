---
name: vps-deploy
description: Use quando o usuário pedir para fazer deploy, atualizar produção, rodar migrate/seed na VPS, debugar incidente em produção, ou alterar config do servidor da AUMAF 3D. Cobre operações em `2.24.72.8` (Hostinger Ubuntu 22.04) — SSH como `deploy` com chave `~/.ssh/aumaf_deploy_ed25519`, Docker Compose em `/srv/aumaf/compose/`, env em `/srv/aumaf/env/.env.production` (chmod 600), Caddy nativo em `/etc/caddy/Caddyfile`. Acione também quando ele falar "ssh prod", "subir o site", "rodar seed em prod", "ver logs de prod", "rollback".
---

# VPS Deploy — AUMAF 3D (operações de produção)

Esta skill é o playbook canônico para qualquer operação em produção da AUMAF 3D. Antes de tocar no servidor, **sempre** ler a fase relevante abaixo. Sem exceção.

## Ambiente

| Recurso | Valor |
|---|---|
| Host | `2.24.72.8` (Hostinger KVM 2 / Boston / Ubuntu 22.04) |
| User SSH | `deploy` com chave `~/.ssh/aumaf_deploy_ed25519` (porta 22) |
| User root | bloqueado para SSH (rescue só via painel Hostinger) |
| Compose | `/srv/aumaf/compose/docker-compose.production.yml` |
| Env | `/srv/aumaf/env/.env.production` (chmod 600 owner=deploy) |
| Caddy | nativo, `/etc/caddy/Caddyfile`, logs em `/var/log/caddy/` |
| URLs (homologação) | `https://aumaf.kayoridolfi.ai`, `https://admin-aumaf.kayoridolfi.ai`, `https://api-aumaf.kayoridolfi.ai` |

Toda operação roda como `deploy` + `sudo` (NOPASSWD configurado). NUNCA logar como root.

```bash
# Forma canônica
ssh -i ~/.ssh/aumaf_deploy_ed25519 deploy@2.24.72.8

# Ou via heredoc para batch
ssh -i ~/.ssh/aumaf_deploy_ed25519 -o BatchMode=yes deploy@2.24.72.8 'sudo -n bash -s' <<'EOF'
... comandos ...
EOF
```

## Fluxos canônicos

### 1. Deploy de código novo (caminho normal)

Não fazer manualmente. **Sempre** via merge de PR em `master` → CD do GitHub Actions cuida:

1. PR com CI verde
2. Merge em `master`
3. `.github/workflows/cd.yml` dispara automaticamente:
   - Build & push 3 imagens GHCR (`ghcr.io/kayorid/aumaf-3d-site/{backend,frontend-public,frontend-admin}:<sha>`)
   - `rsync deploy/` para `/srv/aumaf/compose/`
   - `docker compose pull` + `backend-migrate run` + `up -d --remove-orphans`
   - Smoke `curl /health`

**Tempo total**: 5–8 min. Acompanhar em `gh run watch <id>`.

### 2. Rodar `prisma migrate deploy` manual

O job `backend-migrate` do compose já roda no CD. Manual só em caso especial:

```bash
ssh -i ~/.ssh/aumaf_deploy_ed25519 deploy@2.24.72.8 \
  'sudo docker compose -f /srv/aumaf/compose/docker-compose.production.yml \
    --env-file /srv/aumaf/env/.env.production \
    run --rm backend-migrate'
```

### 3. Rodar `seed` ou `migrate-posts` (1ª vez ou re-seed)

O image runtime **não inclui tsx** (só prod deps). Caminhos:

**Forma A — `npx -y tsx` (instala temporário, ~10s)**:
```bash
ssh -i ~/.ssh/aumaf_deploy_ed25519 deploy@2.24.72.8 \
  'sudo docker exec aumaf-prod-backend-1 \
    sh -c "cd /app/backend && npx -y tsx prisma/seed.ts"'
```

**Forma B — migrate-posts precisa de imagens estáticas**:

O script `scripts/migrate-posts/index.ts` lê arquivos de `/app/frontend-public/public/images/` (caminho do monorepo dev). Em produção, o container backend não tem essa pasta.

Workaround testado e funcional:
```bash
# 1. Copiar imagens do laptop -> container backend (como root)
cd /Users/.../aumaf-3d-site
tar czf - -C frontend-public/public images | \
  ssh -i ~/.ssh/aumaf_deploy_ed25519 deploy@2.24.72.8 \
    'sudo docker exec -u root -i aumaf-prod-backend-1 sh -c \
      "mkdir -p /app/frontend-public/public && cd /app/frontend-public/public && tar xzf -"'

# 2. Rodar script
ssh -i ~/.ssh/aumaf_deploy_ed25519 deploy@2.24.72.8 \
  'sudo docker exec aumaf-prod-backend-1 \
    sh -c "cd /app/backend && npx -y tsx scripts/migrate-posts/index.ts"'
```

### 4. Logs / status / debug

```bash
# Status agregado
ssh deploy@2.24.72.8 'sudo make -C /srv/aumaf/compose status'

# Logs últimas 100 linhas, follow
ssh deploy@2.24.72.8 'sudo make -C /srv/aumaf/compose logs'

# Logs de um serviço específico
ssh deploy@2.24.72.8 'sudo docker logs aumaf-prod-backend-1 --tail 50 -f'

# Caddy
ssh deploy@2.24.72.8 'sudo journalctl -u caddy -n 50 -f'
ssh deploy@2.24.72.8 'sudo tail -f /var/log/caddy/aumaf-public.log'
```

### 5. Atualizar `.env.production`

⚠️ **Mudança em env.production exige `--force-recreate`** (Compose `restart` não relê env_file).

```bash
ssh deploy@2.24.72.8 'sudo -n bash -s' <<'EOF'
# Editar (sed para uma var específica)
sudo sed -i 's|^VAR=.*|VAR=novo_valor|' /srv/aumaf/env/.env.production

# Recreate o serviço afetado
cd /srv/aumaf/compose
sudo docker compose -f docker-compose.production.yml --env-file /srv/aumaf/env/.env.production \
  up -d --force-recreate --no-deps backend
EOF
```

⚠️ **Vars em Zod schema do backend NÃO podem ficar vazias se forem `email()` ou `url()`** — Zod rejeita `''` (não considera optional). Solução: REMOVER a linha em vez de deixar `VAR=`.

### 5b. Provisionar / verificar master key de integration secrets

A partir de 2026-05-06 (ADR-002), o backend exige `/etc/aumaf/master.key` para decifrar `integration_secrets` (Botyio API key, webhook secret, etc.). Sem o arquivo, **o backend recusa subir em produção**.

```bash
# 1ª vez (provisioning):
ssh deploy@2.24.72.8 'sudo install -d -m 0755 -o deploy -g deploy /etc/aumaf && \
  sudo openssl rand -out /etc/aumaf/master.key 32 && \
  sudo chown deploy:deploy /etc/aumaf/master.key && \
  sudo chmod 400 /etc/aumaf/master.key'

# Verificação (deve retornar permissão 400 e tamanho 32 bytes):
ssh deploy@2.24.72.8 'ls -la /etc/aumaf/master.key && stat -c "%s bytes" /etc/aumaf/master.key'

# Backup off-server obrigatório (cifra com GPG e salva em 1Password):
ssh deploy@2.24.72.8 'sudo gpg --symmetric --cipher-algo AES256 -o /tmp/master-aumaf.key.gpg /etc/aumaf/master.key'
scp deploy@2.24.72.8:/tmp/master-aumaf.key.gpg ~/Downloads/  # mover para 1Password e deletar daqui
```

⚠️ **Sem backup off-server, perda da master key = perda das credenciais Botyio em DB**. Recuperação só por re-cadastro na origem.

Runbook completo: `docs/runbooks/integration-secrets-master-key.md`.

### 6. Rollback de versão

```bash
# Encontrar SHA anterior
git log --oneline master | head -5

# Aplicar
ssh deploy@2.24.72.8 'sudo make -C /srv/aumaf/compose rollback TAG=<sha>'
```

Tempo: < 2 min. Não destrói volumes (postgres/redis/minio mantêm dados).

### 7. Reload Caddy (config change sem downtime)

```bash
# Validar antes (sintaxe)
ssh deploy@2.24.72.8 'sudo caddy validate --config /etc/caddy/Caddyfile'

# Reload (preserva conexões existentes)
ssh deploy@2.24.72.8 'sudo systemctl reload caddy'
```

⚠️ Se `reload` falhar com `permission denied` em `/var/log/caddy/*.log`, é causa conhecida: os log files foram criados como `root` antes do hardening do daemon. Fix:
```bash
ssh deploy@2.24.72.8 'sudo rm /var/log/caddy/*.log && sudo chown -R caddy:caddy /var/log/caddy && sudo systemctl restart caddy'
```

### 8. Force restart Caddy

⚠️ **Caddy custom build precisa de `setcap` re-aplicado se substituído**:
```bash
ssh deploy@2.24.72.8 'sudo setcap cap_net_bind_service=+ep /usr/bin/caddy'
```

### 9. Smoke completo pós-deploy

```bash
# Internas (dentro da VPS)
ssh deploy@2.24.72.8 'curl -fsS http://127.0.0.1:3000/health && \
  curl -sI http://127.0.0.1:4321/ | head -1 && \
  curl -sI http://127.0.0.1:5174/ | head -1'

# Externas (via Cloudflare / direto)
curl -sI https://aumaf.kayoridolfi.ai/
curl -sI https://admin-aumaf.kayoridolfi.ai/
curl -fsS https://api-aumaf.kayoridolfi.ai/health
```

### 10. Restore de backup (Hostinger snapshot)

Painel Hostinger → VPS `srv1643738` → "Backups e snapshots" → escolher data → "Restaurar".
VPS fica fora 5–15 min; após volta, validar smoke acima.

Para restore só do banco com pg_dump local: ver `docs/runbooks/production-restore.md`.

## ⚠️ Boundaries

### ✅ Always

- Operações como `deploy` + `sudo` (NOPASSWD)
- Validar Caddyfile antes de reload (`caddy validate`)
- Sempre usar `--force-recreate` quando env_file mudar
- Verificar `compose ps` healthy após qualquer mudança de container

### ⚠️ Ask first

- Qualquer migration Prisma destrutiva (DROP/ALTER coluna)
- Trocar provedor (Cloudflare → outro, Hostinger → outro)
- Mudar domínio de homologação para produção (envolve 1 PR + DNS swap)
- `docker volume prune` ou qualquer comando que apague dados
- Mudar Caddyfile (reload pode falhar e tirar tudo do ar)

### 🚫 Never

- Nunca SSH como root (porta 22 só `deploy`)
- Nunca colar token/senha em chat — usar SSH+install para `/etc/caddy/cloudflare.env` ou `.env.deploy.local`
- Nunca usar `--no-verify` em git
- Nunca rodar `prisma migrate reset` em produção
- Nunca expor Postgres/Redis/MinIO em porta pública (estão em `127.0.0.1` ou network interna)
- Nunca commitar `.env.production` ou `.env.deploy.local`

## Pegadinhas conhecidas (e fix testado)

| Sintoma | Causa | Fix |
|---|---|---|
| Caddy `permission denied` em `/var/log/caddy/*.log` | Log files criados como root antes do daemon `caddy` user assumir | `rm` + `chown -R caddy:caddy` + restart |
| Caddy custom binary não bind em :80 | `setcap` perdido após `cp` | `sudo setcap cap_net_bind_service=+ep /usr/bin/caddy` |
| Backend `Invalid environment variables` em loop | Vars vazias falhando `.email()` ou `.url()` ou nome desencontrado do Zod schema | Remover linha em vez de deixar vazia; alinhar nomes (S3_*, FRONTEND_*_URL) |
| `docker compose: no configuration file provided` | Compose busca `docker-compose.yml`; arquivo é `docker-compose.production.yml` | Sempre `-f docker-compose.production.yml` |
| Restart compose não relê env_file | Compose comportamento padrão | Usar `up -d --force-recreate --no-deps <service>` |
| `tsx: not found` no container | Image runtime tem só prod deps | `npx -y tsx` (~10s overhead) |
| `migrate-posts` falha em `frontend-public/public/images/...` | Caminho hard-coded do monorepo dev | Tar+docker cp pra container, ou refatorar script para usar URL fetch |
| Frontend-public SSR `fetch failed` | `PUBLIC_API_URL` apontando pra URL pública (loop CF) | Setar `PUBLIC_API_URL=http://backend:3000/api/v1` (interno) no .env.production |

## Referências

- Spec original: `docs/specs/_completed/2026-05-04-vps-provisioning-cicd/`
- Retrospective com lições: `docs/specs/_completed/2026-05-04-vps-provisioning-cicd/retrospective.md`
- Runbooks: `docs/runbooks/production-{deploy,incident,restore}.md`
- Bootstrap idempotente: `deploy/scripts/bootstrap-server.sh`
- CI/CD: `.github/workflows/{ci,cd}.yml`
- Compose: `deploy/docker-compose.production.yml` (rsync para `/srv/aumaf/compose/`)
- Caddyfile usado em homologação: `deploy/Caddyfile.homolog`
- Caddyfile final (com DNS-01 + token CF): `deploy/Caddyfile`
