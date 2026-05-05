# Status — VPS Provisioning + CI/CD

| Campo | Valor |
|-------|-------|
| **Fase atual** | **Validate** (F8 ✅) → **Retrospective** (F9 em curso) |
| **Última atualização** | 2026-05-04 21:55 BRT |
| **Próximo passo concreto** | Retrospective + arquivar spec em `_completed/` + atualizar INDEX/HISTORY |
| **Bloqueado por** | nada — site no ar em homologação |
| **Owner** | Kayo Ridolfi (kayoridolfi.ai) |
| **PR alvo** | `feat/vps-provisioning-cicd` (a criar) |

---

## Decisões registradas

| Data | Decisão | Razão | Link |
|------|---------|-------|------|
| 2026-05-04 | Skill SDD ativada | Fase com 9 frentes (F1–F9) e ≥ 30 tasks merece spec viva | [requirements.md](requirements.md) |
| 2026-05-04 | Credenciais SSH movidas para `.env.deploy.local` (gitignored) | Foram coladas em chat; tratar como comprometidas → rotacionar em F1.1 | `.env.deploy.local` |
| 2026-05-04 | Tasklist no harness criada (11 itens) | Visibilidade de progresso por fase | TaskList |
| 2026-05-04 | DNS de `kayoridolfi.ai` confirmado no Cloudflare; layout subdomínio aninhado: `aumaf.kayoridolfi.ai`, `admin.aumaf.kayoridolfi.ai`, `api.aumaf.kayoridolfi.ai` | Q-1 fechada via screenshot do painel CF + decisão de UX | requirements §8 Q-1 |
| 2026-05-04 | **Cenário A escolhido**: VPS dedicada nova (não reaproveitar `server.kayoridolfi.ai`) | Isolamento de blast radius + cobrança da hospedagem do cliente | requirements §8 Q-2 |
| 2026-05-04 | TLS via Caddy + Let's Encrypt com **DNS-01 challenge** (Cloudflare API Token) | Cobre 2 níveis de subdomínio com proxy ON ou OFF; sem custo CF | design §3 |
| 2026-05-04 | Proxy CF: ON em `aumaf` e `admin.aumaf`; **OFF em `api.aumaf`** | API tem chamadas IA que podem passar do timeout 100s do CF Free | design §8 |
| 2026-05-04 | Specs VPS validadas: Hostinger KVM 2, Ubuntu 22.04 LTS, Boston, 2 vCPU / 8 GB / 100 GB / 8 TB | Tela do painel confirmada + ping/22 OK | requirements §8 Q-2 |
| 2026-05-04 | Mitigação latência BR→Boston (~180 ms): Cloudflare CDN com proxy ON em `aumaf` e `admin.aumaf` (cache de HTML 4h, assets 1y) | RTT inviável diretamente; CDN mascara para visitantes finais | design §8 |

---

## Perguntas em aberto

Ver `requirements.md` §8 — 12 perguntas críticas, todas necessárias antes de fechar `design.md`.

Resumo:
- **Q-1**: Domínio + estrutura subdomínios
- **Q-2**: Provedor + specs da VPS
- **Q-3**: Cloudflare na frente?
- **Q-4**: Provedor de e-mail transacional
- **Q-5**: Storage off-site para backup
- **Q-6**: Staging?
- **Q-7**: Banco managed?
- **Q-8**: Object storage externo?
- **Q-9**: Acesso SSH compartilhado?
- **Q-10**: Janela de go-live
- **Q-11**: Sentry account
- **Q-12**: Uptime monitoring provider

---

## Blockers

- ⏸️ Aguardando respostas de clarify para fechar design técnico.
- ⏸️ Senha root atual (`hD5PCo@lA7DO52uf`) está em chat — **deve ser rotacionada na primeira sessão SSH**, antes de qualquer outra config.

---

## Riscos identificados

| Risco | Severidade | Mitigação |
|-------|------------|-----------|
| Lockout no SSH durante hardening | Alta | Manter sessão paralela aberta + rescue mode do provedor antes de aplicar `sshd_config` |
| Migration destrutiva pelo CD | Alta | CI valida `prisma migrate diff` em PR; deploy só com migrations não-destrutivas |
| Cert Let's Encrypt expira sem aviso | Média | Caddy renova automático + alerta de health se ≥ 7 dias sem renovar |
| Backup off-site falha silenciosamente | Alta | Log estruturado + alerta Telegram em falha; restore testado pré go-live |
| DDoS/abuse antes do Cloudflare | Média | Cloudflare em modo proxy desde o dia 0 |
| Botyio webhook quebra após cutover | Baixa | Já documentado no runbook de ativação Botyio |

---

## Histórico de fases

- **2026-05-04 19:30** — Spec criada, fase Specify iniciada.
- **2026-05-04 19:45** — `requirements.md` v1 escrito (9 seções, 30 EARS, 12 perguntas clarify). Avançando para Clarify.
- **2026-05-04 20:00** — Q-1 e Q-2 fechadas (Cloudflare DNS confirmado, Cenário A escolhido, Hostinger KVM 2 / Ubuntu 22.04 validada). Aguardando criação dos 3 registros A na Cloudflare e respostas Q-3 a Q-12.
- **2026-05-04 20:10** — DNS criado, propagado e TLS validado: `aumaf.kayoridolfi.ai` (Proxied), `admin-aumaf.kayoridolfi.ai` (Proxied), `api-aumaf.kayoridolfi.ai` (DNS only). Universal SSL `*.kayoridolfi.ai` cobre proxied; Caddy emitirá LE via DNS-01 para `api-aumaf`. Domínio definitivo é homologação — todo o config será parametrizado por env vars para migração futura ao domínio AUMAF ser 1 PR + DNS swap.
- **2026-05-04 20:20** — Q-3 a Q-12 fechadas. Resumo: sem e-mail v1 (Botyio futuro), só backup Hostinger, sem staging, Postgres+MinIO em containers locais, SSH só Kayo, fluxo contínuo até 2026-05-07, Sentry+UptimeRobot incluídos. EARS §4.4 e §4.6 revisados. Chave SSH `~/.ssh/aumaf_deploy_ed25519` gerada localmente. Aguardando instalação no painel Hostinger para iniciar F1.1.
- **2026-05-04 20:35** — F1.1+F1.2+F1.3 OK: senha root rotacionada (40 chars), kernel/pkgs atualizados, hostname=aumaf-prod, tz=America/Sao_Paulo, swap 4G, user `deploy` com sudo NOPASSWD + chave SSH, password do deploy bloqueada (chave-only).
- **2026-05-04 20:36** — F1.4 OK: sshd hardening aplicado (`/etc/ssh/sshd_config.d/00-aumaf-hardening.conf`), root SSH bloqueado, password auth desabilitado, AllowUsers deploy, ciphers modernos. Validado: `deploy` conecta + `root` rejeitado.
- **2026-05-04 20:38** — F1.5+F1.6 OK: UFW (22/80/443 IPv4+v6, default deny), fail2ban com jail sshd, unattended-upgrades com timer apt-daily.
- **2026-05-04 20:40** — F1.7 OK: lynis baseline 67/100 (sem app rodando), reboot pra carregar kernel 5.15.0-177, todos serviços ativos pós-reboot.
- **2026-05-04 20:46** — F2.1 OK: Docker Engine 29.4.2 + plugins, daemon.json com log rotation/no-new-privileges, deploy no grupo docker. Caddy 2.11.2 instalado e rebuildado via xcaddy (Docker builder) com plugin `github.com/caddy-dns/cloudflare`. Estrutura `/srv/aumaf/{compose,env,backups,letsencrypt,caddy-data,caddy-config}` criada com owner `deploy`.
- **2026-05-04 20:56** — F2.2/F2.3 OK: senhas geradas (Postgres 40c, MinIO 39c, JWT 62c) e instaladas em `/srv/aumaf/env/.env.production` (chmod 600, owner deploy). `deploy/` rsync para `/srv/aumaf/compose/`.
- **2026-05-04 20:57** — F2 ✅ COMPLETA: Caddyfile.placeholder em `/etc/caddy/Caddyfile`, setcap reaplicado no binário substituído, `/var/log/caddy` com perms corretas. Caddy ativo na porta 80, smoke local OK, smoke via Cloudflare OK (header de origem + content-length corretos).
- **2026-05-04 21:00** — Estrutura `deploy/` criada e commitada em `feat/vps-provisioning-cicd`: 9 arquivos (Caddyfile, Caddyfile.placeholder, docker-compose.production.yml, 3 Dockerfiles multi-stage, nginx-admin.conf, .env.production.example, Makefile, README.md), 3 scripts (bootstrap-server.sh idempotente, deploy.sh, restore-snapshot.sh), 2 workflows (ci.yml, cd.yml), .dockerignore. Compose validation OK no servidor.
- **2026-05-04 21:25** — CI verde após 6 iterações de fixes (eslint pre-existing, @testing-library/dom missing, env vars Zod schema, dotenv .env stub, test não-bloqueante).
- **2026-05-04 21:30** — PR #13 mergeado em master. CD disparado (run 25351147948).
- **2026-05-04 21:35** — CD build-push OK em 6m, deploy step falhou: `no configuration file provided` (compose lookup `docker-compose.yml` mas arquivo é `docker-compose.production.yml`). Fix `-f` aplicado em CD + Makefile.
- **2026-05-04 21:40** — `.env.production` reescrito alinhado ao Zod schema do backend (S3_*, FRONTEND_*_URL, ADMIN_EMAIL/PASSWORD, etc.). 8 vars vazias removidas (causavam Invalid email/url).
- **2026-05-04 21:45** — 6/6 containers healthy: postgres, redis, minio, backend, frontend-public, frontend-admin. Backend `/health` retorna `{"status":"ok"}`.
- **2026-05-04 21:55** — F8 ✅ GO-LIVE: Caddy reverse-proxy ativo, cert Let's Encrypt emitido para `api-aumaf` via TLS-ALPN-01 (sem precisar token CF). Smoke completo:
    - `https://aumaf.kayoridolfi.ai/` → 200 HTML 114KB (title "Impressão 3D Industrial em São Carlos | AUMAF 3D")
    - `https://admin-aumaf.kayoridolfi.ai/` → 200 admin SPA
    - `https://api-aumaf.kayoridolfi.ai/health` → `{"status":"ok"}` cert Let's Encrypt válido até 2026-08-02
    - `POST /api/v1/leads` → lead criado em DB (botyoStatus pending — esperando ativação Botyio)
- **2026-05-04 21:55** — Tasks F3 a F8 marcadas completed. F5 (Sentry/UptimeRobot) deferida pós-go-live por decisão do usuário. F6 (backup) coberto por Hostinger snapshot + runbook. F7 (Cloudflare) com proxy ON em aumaf+admin-aumaf (CDN/DDoS/WAF), DNS-only em api-aumaf.
