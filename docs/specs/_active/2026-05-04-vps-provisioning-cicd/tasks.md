# Tasks — VPS Provisioning + CI/CD

> **Estado**: 🟡 esqueleto. Detalhamento final após `design.md` ser fechado (pós-clarify).
>
> Cada fase tem **checkpoint humano** explícito antes de avançar para a próxima. Tarefas marcadas `[P]` podem ir para subagentes em paralelo (mesmo arquivo intocado).

---

## F0 — Pré-requisitos (já feito)
- [x] Skill SDD ativada
- [x] `.env.deploy.local` salvo + gitignored
- [x] `.gitignore` reforçado com `.env.deploy*`
- [x] TaskList do harness com 11 fases

---

## F1 — Hardening do servidor [CHECKPOINT antes de F2]

### F1.1 — Conexão inicial e rotação de senha
- [ ] Conectar `ssh root@2.24.72.8` (porta 22, senha temporária)
- [ ] `passwd` — trocar senha root, salvar em gerenciador de senhas pessoal
- [ ] Atualizar `.env.deploy.local` removendo `SSH_ROOT_PASSWORD`

### F1.2 — Sistema base
- [ ] `apt update && apt full-upgrade -y`
- [ ] `timedatectl set-timezone America/Sao_Paulo`
- [ ] `hostnamectl set-hostname aumaf-prod`
- [ ] Instalar: `chrony curl wget vim git ufw fail2ban htop tmux ca-certificates gnupg`
- [ ] Swap 4 GB se RAM ≤ 4 GB

### F1.3 — Usuário deploy + chave SSH
- [ ] Criar usuário `deploy` com home + shell bash + sudo NOPASSWD
- [ ] No laptop local: `ssh-keygen -t ed25519 -f ~/.ssh/aumaf_deploy_ed25519 -C "deploy@aumaf-prod"`
- [ ] `ssh-copy-id -i ~/.ssh/aumaf_deploy_ed25519.pub deploy@2.24.72.8`
- [ ] Atualizar `~/.ssh/config` local com alias `aumaf-prod`
- [ ] Atualizar `.env.deploy.local` com novo usuário + caminho da chave

### F1.4 — sshd hardening [CHECKPOINT — manter sessão paralela aberta]
- [ ] Em **sessão de teste paralela** (terminal separado), abrir `ssh deploy@aumaf-prod` e validar
- [ ] Editar `/etc/ssh/sshd_config.d/00-aumaf.conf` com Port custom + PermitRootLogin no + PasswordAuthentication no + AllowUsers deploy
- [ ] `sshd -t` validar sintaxe
- [ ] `systemctl reload sshd` (não restart — preserva sessões existentes)
- [ ] Em **terceira sessão**, testar conectividade na porta nova
- [ ] Só fechar sessão original após validação verde

### F1.5 — Firewall
- [ ] `ufw default deny incoming` + `ufw default allow outgoing`
- [ ] `ufw allow <PORTA-CUSTOM>/tcp` (SSH)
- [ ] `ufw allow 80/tcp && ufw allow 443/tcp`
- [ ] (se Q-3 = Cloudflare) restringir 80/443 a IPs Cloudflare via `ufw allow proto tcp from <CF-IP> to any port 443`
- [ ] `ufw enable`
- [ ] `nmap` externo — confirmar só 3 portas abertas

### F1.6 — fail2ban + unattended-upgrades
- [ ] `/etc/fail2ban/jail.local` com jails sshd e sshd-ddos
- [ ] Alerta email/Telegram em ban (opcional)
- [ ] `dpkg-reconfigure -plow unattended-upgrades`
- [ ] `/etc/apt/apt.conf.d/50unattended-upgrades` — security-only

### F1.7 — Validação F1 [CHECKPOINT humano]
- [ ] `lynis audit system` — capturar score baseline
- [ ] Documentar configs em `deploy/scripts/bootstrap-server.sh` (idempotente, reproduzível)
- [ ] Confirmar com usuário antes de F2

---

## F2 — Stack base (Docker + Caddy)

### F2.1 — Docker Engine
- [ ] Instalar Docker via `get.docker.com`
- [ ] Adicionar `deploy` ao grupo `docker`
- [ ] Plugin compose v2 (`docker-compose-plugin`)
- [ ] `/etc/docker/daemon.json`: log-driver json-file, max-size 50m, max-file 5, live-restore true
- [ ] `systemctl restart docker`

### F2.2 — Caddy 2
- [ ] Instalar Caddy via repo oficial (apt)
- [ ] Caddyfile inicial (placeholder até DNS apontar)
- [ ] (se Q-3 = Cloudflare) Cloudflare API token em `/etc/caddy/cloudflare.env` (chmod 600)
- [ ] `systemctl enable --now caddy`
- [ ] Smoke: `curl -fI https://<dominio>` (após DNS) ou IP direto

### F2.3 — Diretórios + permissões
- [ ] `/srv/aumaf/{compose,env,backups,letsencrypt}` com owner `deploy`
- [ ] `git clone` do repo em `/srv/aumaf/repo` (somente arquivos de deploy + Caddyfile rastreados; código vem via imagens GHCR)

### F2.4 — Validação F2 [CHECKPOINT]
- [ ] `docker --version`, `docker compose version`, `caddy version`
- [ ] Caddy serve página placeholder com TLS válido

---

## F3 — Containerização

### F3.1 — Dockerfiles [P]
- [ ] `backend/Dockerfile` multi-stage; build local OK; imagem ≤ 250 MB
- [ ] `frontend-public/Dockerfile` (SSR Astro); imagem otimizada
- [ ] `frontend-admin/Dockerfile` (Vite static + nginx); imagem ≤ 50 MB

### F3.2 — docker-compose.production.yml
- [ ] Serviços: backend, frontend-public, frontend-admin, postgres, redis, minio (ou só clientes se Q-7/Q-8 externos)
- [ ] Network `aumaf_internal`; sem portas publicadas exceto Caddy upstream
- [ ] Volumes nomeados; healthchecks; restart unless-stopped; mem_limit

### F3.3 — Migrations job
- [ ] Service `backend-migrate` one-shot rodando `prisma migrate deploy`
- [ ] Falha aborta deploy

### F3.4 — Build local + smoke
- [ ] `docker compose -f deploy/docker-compose.production.yml --env-file .env.production up -d` em laptop
- [ ] Healthchecks verdes em < 90 s
- [ ] `curl http://localhost/health` retorna 200

---

## F4 — CI/CD GitHub Actions

### F4.1 — Workflow CI [P]
- [ ] `.github/workflows/ci.yml` rodando em todo PR + push master
- [ ] Branch protection em master exigindo CI verde
- [ ] Cache npm + buildx layer cache

### F4.2 — Workflow CD
- [ ] `.github/workflows/cd.yml` em push para master
- [ ] Build & push 3 imagens GHCR com tag `<sha>` + `latest`
- [ ] Step de deploy SSH executando `deploy/scripts/deploy.sh`
- [ ] Smoke pós-deploy

### F4.3 — Secrets do GitHub
- [ ] Chave SSH `deploy` adicionada como `SSH_PRIVATE_KEY`
- [ ] `SSH_HOST`, `SSH_USER`, `SSH_PORT`
- [ ] `GHCR_TOKEN` (PAT)
- [ ] Sentry DSNs (3)
- [ ] (Q-3) Cloudflare API token
- [ ] (Q-4) Resend/Mailgun API key
- [ ] (Q-5) R2/B2 credentials

### F4.4 — Rollback
- [ ] `Makefile.production` com `make rollback TAG=<sha>`
- [ ] Testar rollback contra deploy anterior

### F4.5 — Validação F4 [CHECKPOINT]
- [ ] PR de teste → CI verde
- [ ] Merge → CD executa ponta-a-ponta → site responde

---

## F5 — Observabilidade

### F5.1 — Sentry
- [ ] 3 projetos criados (backend, frontend-public, frontend-admin)
- [ ] DSNs em secrets + env de produção
- [ ] Source maps upload no CD
- [ ] Smoke: forçar erro → aparece no Sentry

### F5.2 — Healthcheck público
- [ ] Caddy expõe `/health` ou `/_health` (sem auth)
- [ ] Retorna agregado DB/Redis/queues/MinIO

### F5.3 — Uptime monitoring
- [ ] Conta no provedor escolhido (Q-12)
- [ ] Monitor para `/`, `/admin`, `/api/health`
- [ ] Alertas: Telegram + e-mail

### F5.4 — Logs
- [ ] Validar rotação json-file
- [ ] Caddy access log → `/var/log/caddy/access.log` rotacionado por logrotate

---

## F6 — Backup + DR

### F6.1 — Script pg_dump
- [ ] `deploy/scripts/backup-db.sh` com pg_dump -Fc + gpg/age encrypt + upload S3
- [ ] Systemd timer `aumaf-backup.timer` rodando 03:00 UTC daily

### F6.2 — Sync MinIO (se Q-8 = local)
- [ ] `mc mirror` semanal off-site

### F6.3 — Restore runbook
- [ ] `docs/runbooks/production-backup-restore.md` com passos
- [ ] **Dry-run obrigatório** pré go-live: restaurar em staging/local e validar dados

---

## F7 — Performance + CDN

### F7.1 — Cloudflare (se Q-3 = sim)
- [ ] Adicionar zona; nameservers da Cloudflare
- [ ] DNS records: A `@`, `admin`, `api` → IP da VPS (proxy on)
- [ ] SSL: Full (strict)
- [ ] Auto HTTPS Rewrites + HSTS + Brotli + HTTP/3

### F7.2 — Caddy headers
- [ ] Cache-Control immutable para `/assets/*`
- [ ] CSP, X-Frame-Options, Referrer-Policy
- [ ] Brotli + gzip

### F7.3 — Redis cache no SSR
- [ ] Astro SSR com cache Redis 5 min para blog/index
- [ ] Invalidação em post-publish

### F7.4 — Lighthouse
- [ ] Lighthouse CI contra produção; Performance/A11y/SEO ≥ 90

---

## F8 — Primeiro deploy [CHECKPOINT antes de anunciar]

### F8.1 — Pré-flight
- [ ] DNS apontando + propagado (`dig` confirma)
- [ ] TLS válido em todas as URLs
- [ ] `/health` 200
- [ ] Login admin OK; criação de rascunho persiste; lead público gera notificação

### F8.2 — Smoke E2E em produção
- [ ] Playwright headless contra URL de produção
- [ ] Cobre: home, blog, post, lead form, admin login, draft create

### F8.3 — Checklist go-live
- [ ] Checklist em `docs/runbooks/production-deploy.md` 100 % verde

---

## F9 — Runbook + handover + retrospective

- [ ] `docs/runbooks/production-deploy.md`
- [ ] `docs/runbooks/production-incident.md`
- [ ] `docs/runbooks/production-backup-restore.md`
- [ ] `retrospective.md` com lições + métricas
- [ ] Mover spec para `_completed/`
- [ ] `INDEX.md` + `HISTORY.md` atualizados
- [ ] Cliente AUMAF recebe credencial admin + URL via canal seguro

---

## Resumo de checkpoints humanos

| # | Após | Verificar |
|---|------|-----------|
| ✋ | F1.4 | sshd reload sem lockout, validado em sessão paralela |
| ✋ | F1.7 | hardening completo, lynis baseline capturado |
| ✋ | F2.4 | Docker + Caddy operacionais, TLS placeholder válido |
| ✋ | F4.5 | CI/CD ponta-a-ponta verde |
| ✋ | F6.3 | Restore dry-run validado |
| ✋ | F8.3 | Go-live checklist 100 % antes de anunciar |
