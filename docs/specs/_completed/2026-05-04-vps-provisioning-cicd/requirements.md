# VPS Provisioning + CI/CD — Requirements

> **Fase atual**: Specify → **Clarify** (aguardando respostas em §8)
> **Criada**: 2026-05-04
> **Constituição**: [`../../constitution.md`](../../constitution.md)
> **Provedor de produção**: VPS dedicada (host `2.24.72.8`) — provedor a confirmar
> **Branch alvo**: `master`

---

## 1. Visão geral (WHY)

O AUMAF 3D (Q1+Q2+Q3-foundation+Botyio+Imagens+UX/A11y) está 100 % funcional em `master` localmente, com 165 testes passando, build limpo e PR #12 mergeado (`42cf392`). Falta a etapa final: **colocar em produção** uma VPS provisionada pelo cliente, com qualidade adequada a um site institucional que captura leads (formulário público + WhatsApp via Botyio) e hospeda backoffice editorial.

Esta spec cobre a **fase única e final** que entrega:

1. **Servidor seguro** — hardening SSH, firewall, fail2ban, atualizações automáticas, banimento de root + senha.
2. **Stack containerizada** — Docker Compose orquestrando reverse proxy, backend, dois frontends, Postgres, Redis, MinIO/S3.
3. **CI/CD automatizado** — GitHub Actions buildando imagens, publicando no GHCR, e fazendo deploy via SSH em cada merge para `master`.
4. **Primeiro deploy real** — DNS apontado, TLS válido, smoke E2E em produção verde.
5. **Observabilidade** — Sentry + Pino estruturado + healthchecks + uptime monitoring + alertas.
6. **Performance** — Cloudflare na frente (CDN/DDoS/WAF), HTTP/2 + Brotli, cache headers, Lighthouse ≥ 90.
7. **Backup + DR** — pg_dump diário criptografado off-site, restore testado, runbook escrito.

Após esta fase, o projeto está **fechado contratualmente** — só restam manutenção (R$ 150/mês) e ativação Botyio (depende de credenciais externas).

---

## 2. Personas e cenários

### 2.1 Operador técnico (Kayo / kayoridolfi.ai)
- Conecta-se via SSH com chave para investigar incidentes / aplicar fixes urgentes
- Faz deploy via `git push origin master` — CI/CD cuida do resto
- Restaura backup em caso de desastre
- Recebe alerta de downtime no Telegram

### 2.2 Cliente AUMAF (admin do site)
- Acessa `https://admin.<dominio>` para editar posts, ver leads, configurar settings
- Não precisa entender Docker, SSH ou CI

### 2.3 Visitante final
- Abre `https://<dominio>` em mobile/desktop — TTFB < 300 ms
- Submete formulário de contato → lead persistido + e-mail ao admin
- Inicia chat WhatsApp via Botyio (quando ativado)
- Lê posts do blog (SSR, com cache Redis)

### 2.4 Bot/AI crawler
- GPTBot, Claude, Perplexity, Google-Extended têm acesso permitido (`robots.txt` já trata) e schemas estruturados (`@graph` já entregue)

---

## 3. User stories

| # | Como… | Quero… | Para… |
|---|-------|--------|-------|
| US-1 | Operador | conectar via SSH apenas com chave em porta custom | reduzir vetor de ataque por força bruta |
| US-2 | Operador | merge em `master` disparar deploy automático | reduzir toil manual e risco humano |
| US-3 | Operador | rollback para versão anterior em < 5 min via comando único | mitigar deploy ruim sem pânico |
| US-4 | Operador | receber alerta em ≤ 2 min de downtime | agir antes do cliente perceber |
| US-5 | Operador | restaurar banco a partir de backup off-site | sobreviver a perda da VPS |
| US-6 | Cliente | acessar admin com TLS válido sem aviso de browser | confiar na plataforma |
| US-7 | Visitante | carregar a home em < 1 s no 4G médio | ter boa experiência mesmo em conexão fraca |
| US-8 | Visitante | submeter formulário e receber confirmação imediata | saber que o pedido chegou |
| US-9 | Bot/AI | obter HTML estruturado e robots.txt limpo | indexar corretamente para search |

---

## 4. Critérios de aceitação (EARS)

### 4.1 Segurança

- **EARS-S1**: **Quando** o servidor for provisionado pela primeira vez, o sistema **deverá** completar a fase F1 (hardening) **antes** de qualquer fase posterior — bloqueio explícito no checklist.
- **EARS-S2**: **Quando** o hardening estiver concluído, o servidor **deverá** rejeitar qualquer tentativa de login SSH por senha ou como root.
- **EARS-S3**: **Quando** uma porta diferente de 80, 443 e a porta SSH custom for sondada, o UFW **deverá** dropar a conexão.
- **EARS-S4**: **Se** 5 falhas de SSH vierem do mesmo IP em 10 min, **então** o fail2ban **deverá** banir o IP por ≥ 1 h.
- **EARS-S5**: **Quando** atualizações de segurança do SO estiverem disponíveis, o `unattended-upgrades` **deverá** aplicá-las diariamente sem intervenção.
- **EARS-S6**: **Onde** houver TLS, o certificado **deverá** ser válido (Let's Encrypt) com renovação automática ≥ 30 dias antes do vencimento.
- **EARS-S7**: **Onde** logs de aplicação ou de sistema forem gerados, nenhuma chave, token, senha, e-mail ou telefone em texto plano **deverá** aparecer.
- **EARS-S8**: **Onde** segredos de aplicação forem necessários, eles **deverão** viver em `.env.production` no servidor com `chmod 600 owner=deploy`.
- **EARS-S9**: **Quando** o servidor receber a primeira conexão pós-hardening, a senha root original **deverá** ter sido rotacionada e armazenada em gerenciador de senhas pessoal do operador (não em chat, não em arquivo do projeto).
- **EARS-S10**: **Onde** houver porta exposta publicamente (80/443/SSH-custom), nenhuma outra porta de aplicação (Postgres 5432, Redis 6379, MinIO 9000) **deverá** estar exposta na internet — todas no network Docker interno.

### 4.2 Containerização

- **EARS-C1**: **Quando** `docker compose -f docker-compose.production.yml up -d` for executado num servidor limpo, todos os serviços **deverão** subir e responder healthcheck OK em ≤ 90 s.
- **EARS-C2**: **Onde** uma imagem da aplicação for construída, ela **deverá** usar build multi-stage e a imagem final **deverá** ter ≤ 250 MB para o backend e ≤ 50 MB para os frontends estáticos.
- **EARS-C3**: **Onde** houver dado persistente (postgres, redis-AOF, minio), ele **deverá** viver em volume nomeado e sobreviver a `docker compose down`.
- **EARS-C4**: **Quando** um serviço falhar (crash), o Docker **deverá** reiniciá-lo automaticamente com `restart: unless-stopped`.
- **EARS-C5**: **Onde** o `docker-compose.production.yml` for editado, o `git diff` em produção **deverá** ser zero — produção espelha o repo, sem drift manual.

### 4.3 CI/CD

- **EARS-CI1**: **Quando** um PR for aberto contra `master`, o workflow CI **deverá** rodar lint + typecheck + test (Jest BE + Vitest admin) + build em ≤ 10 min.
- **EARS-CI2**: **Se** qualquer etapa do CI falhar, **então** o workflow **deverá** bloquear o merge (branch protection).
- **EARS-CI3**: **Quando** um commit for mergeado em `master`, o workflow CD **deverá** buildar 3 imagens (backend, frontend-public, frontend-admin), pushar para GHCR com tag `<sha>` + `latest`, e fazer deploy.
- **EARS-CI4**: **Onde** uma migration Prisma estiver pendente, ela **deverá** ser aplicada antes do restart do backend (job dedicado, falha aborta deploy).
- **EARS-CI5**: **Se** o deploy falhar, **então** o sistema **deverá** permanecer na versão anterior automaticamente (sem estado parcial).
- **EARS-CI6**: **Quando** o operador rodar `make rollback TAG=<sha>` no servidor, o sistema **deverá** voltar para essa versão em ≤ 5 min.
- **EARS-CI7**: **Onde** secrets forem usados pelo workflow (chave SSH, GHCR token, Sentry DSN), eles **deverão** viver em GitHub Secrets, nunca em arquivo committado.

### 4.4 Observabilidade

- **EARS-O1**: **Quando** uma exceção não tratada ocorrer no backend, ela **deverá** ser reportada ao Sentry com contexto (rota, user-id quando autenticado, payload sem PII).
- **EARS-O2**: **Quando** `/health` for consultado, ele **deverá** retornar JSON com status agregado (DB, Redis, queues, MinIO) em ≤ 500 ms.
- **EARS-O3**: **Se** o servidor ou um serviço crítico estiver indisponível por > 2 min, **então** o sistema de uptime monitoring **deverá** alertar via Telegram + e-mail.
- **EARS-O4**: **Onde** houver logs, eles **deverão** ser estruturados (Pino JSON), com retenção ≥ 7 dias e rotação automática (no máx. 100 MB/serviço).
- **EARS-O5**: **Onde** o Caddy fizer proxy, o access log **deverá** registrar IP-origem (via `X-Forwarded-For` Cloudflare), método, status, latência.
- **EARS-O6**: **Onde** a aplicação registrar lead/post-publish, um log INFO **deverá** ser emitido com ID do recurso e ator (sem PII).

### 4.5 Performance

- **EARS-P1**: **Quando** uma página estática do frontend público for servida, o TTFB **deverá** ser ≤ 300 ms (com cache Cloudflare quente) ou ≤ 800 ms (cache miss).
- **EARS-P2**: **Quando** um post de blog for renderizado SSR, p95 **deverá** ser ≤ 500 ms (com Redis cache de 5 min).
- **EARS-P3**: **Onde** assets estáticos forem servidos, eles **deverão** ter Brotli + `Cache-Control: public, max-age=31536000, immutable` (1 ano) para arquivos com hash no nome.
- **EARS-P4**: **Onde** o frontend público for testado por Lighthouse em produção (mobile, slow-4G), o score **deverá** ser ≥ 90 em Performance, Accessibility, Best Practices e SEO.
- **EARS-P5**: **Quando** o backend autenticado responder, p95 **deverá** ser ≤ 200 ms para endpoints simples (lista) e ≤ 500 ms para mutations.
- **EARS-P6**: **Onde** a Cloudflare for usada como proxy, HTTP/2 + HTTP/3 **deverão** estar habilitados, com TLS 1.3 mínimo.

### 4.6 Backup + DR (escopo reduzido — só Hostinger)

- **EARS-B1**: **Onde** houver banco de produção, o backup automático da Hostinger **deverá** estar ativado e cobrindo a VPS inteira diariamente.
- **EARS-B2**: **Antes do go-live**, o operador **deverá** validar no painel Hostinger que existe pelo menos 1 snapshot e documentar como restaurar (runbook).
- **EARS-B3**: **Quando** o operador rodar `make backup-snapshot` no servidor (manual), um `pg_dump -Fc` adicional **poderá** ser gerado em `/srv/aumaf/backups/manual/` antes de migrations destrutivas — opcional, sob demanda.
- **(removido)** Backup off-site criptografado, retenção custom, restore dry-run mensal — estavam previstos mas o usuário decidiu pelo backup nativo Hostinger; risco assumido (ver §6 fora de escopo + Q-5).

### 4.7 Primeiro deploy + smoke

- **EARS-D1**: **Quando** o DNS apontar para o servidor, `https://<dominio>`, `https://admin.<dominio>` e `https://api.<dominio>` (ou estrutura equivalente — ver §8) **deverão** responder com TLS válido e conteúdo correto.
- **EARS-D2**: **Quando** o smoke test E2E for executado em produção (Playwright headless), ele **deverá** cobrir: home pública carrega, blog renderiza um post real, lead público é submetido com sucesso, login admin funciona, criação de rascunho persiste.
- **EARS-D3**: **Onde** houver checklist de go-live, todos os 100 % dos itens **deverão** estar verdes antes do anúncio para o cliente.

---

## 5. Edge cases conhecidos

| Cenário | Tratamento esperado |
|---------|---------------------|
| Operador tranca-se fora do SSH (typo no `sshd_config`) | Provedor da VPS deve ter console de recuperação (rescue mode); F1 inclui validação **com sessão paralela aberta** antes de fechar a antiga |
| Disco da VPS cheio | Alerta de uso ≥ 80 % + log rotation; runbook de limpeza |
| Renovação Let's Encrypt falha | Caddy retry automático + alerta se ≥ 7 dias antes do vencimento sem renovar |
| Imagem GHCR corrompida / unauth | CD aborta; sistema permanece na versão atual |
| Migration Prisma destrutiva sem aprovação | Spec proíbe (boundary 🚫); CI valida `prisma migrate diff` em PR |
| DNS demora a propagar pós-cutover | Cloudflare pode ser pré-configurado em modo proxy antes do switch |
| Cloudflare bloqueia tráfego legítimo (false positive WAF) | Modo "managed challenges" + alerta + página de bypass para Botyio |
| Botyio webhook precisa IP fixo no Cloudflare | Documentar IP de saída; whitelist no Botyio se necessário |
| Backup off-site falha 7 dias seguidos | Alerta de severidade alta; backup local fallback |
| Servidor reiniciado (kernel update / panic) | Tudo sobe via Docker `restart: unless-stopped`; UFW + fail2ban + ssh persistem |

---

## 6. Fora de escopo

| Item | Razão |
|------|-------|
| Multi-region / multi-server | Tráfego esperado < 10 k visitas/mês; single VPS suficiente |
| Kubernetes / Nomad | Overkill; Docker Compose cobre |
| Blue-green deploy / canary | Rolling restart c/ healthcheck cobre o caso |
| CDN próprio (Bunny, Fastly) | Cloudflare grátis cobre + Workers se precisar futuro |
| WAF dedicado (Cloudflare Pro+) | Cloudflare Free WAF basics + fail2ban suficientes |
| IDS/IPS (Wazuh, Suricata) | Custo operacional > benefício para o porte |
| SSO além de JWT cookie | Já no escopo do Q2; não muda em prod |
| Staging environment dedicado | **Decisão pendente em §8 Q-6** — pode entrar como Phase 2 |
| Managed Postgres (Neon, Supabase) | **Decisão pendente em §8 Q-7** — preferência inicial é Postgres na VPS |
| Object Storage externo (R2, B2) | **Decisão pendente em §8 Q-8** — MinIO local cobre, R2 é upgrade barato |
| Email transacional via SMTP do servidor | **Decisão fechada (Q-4)**: sem e-mail na v1; notificação de leads vai via WhatsApp/Botyio quando ativado |
| Backup off-site (R2/B2 com pg_dump diário criptografado) | **Decisão fechada (Q-5)**: só backup nativo Hostinger; risco de erro humano > 1 dia assumido |
| Staging dedicado | **Decisão fechada (Q-6)**: trunk-based + CI verde + smoke pós-deploy |

---

## 7. Boundaries

### ✅ Always
- Toda mudança em produção passa por CI verde e merge em `master`.
- Toda credencial/segredo vive em GitHub Secrets ou `.env.production` (chmod 600 no servidor) — nunca em código.
- TLS sempre válido — sem `--insecure`, sem cert auto-assinado.
- Toda imagem Docker buildada referencia commit SHA específico no compose (não `latest`) em produção.
- Backup diário criptografado off-site é pré-requisito de go-live.
- `npm run typecheck` e `npm run lint` passam limpos antes de qualquer deploy.

### ⚠️ Ask first
- Alterar UFW para abrir porta nova.
- Alterar `sshd_config` em produção (risco de lockout).
- Aplicar migration Prisma destrutiva (DROP/ALTER coluna).
- Trocar provedor de qualquer serviço externo (Cloudflare, Sentry, GHCR).
- Mudar domínio/DNS (afeta SEO + cache + cert).
- Adicionar dependência runtime nova (afeta tamanho de imagem + superfície de ataque).
- Rodar `docker volume prune` ou qualquer operação destrutiva em produção.

### 🚫 Never
- Nunca commitar `.env*`, chave SSH, senha, token.
- Nunca usar `--no-verify`, `--force-with-lease` em `master`, `--no-gpg-sign`.
- Nunca expor Postgres / Redis / MinIO em porta pública.
- Nunca rodar `prisma migrate reset` em produção.
- Nunca permitir login SSH por senha após F1 concluída.
- Nunca rodar deploy fora do CD (sem auditoria).
- Nunca subir container em modo `--privileged` ou com `network_mode: host` para serviços de aplicação.
- Nunca armazenar PII (e-mail, telefone, nome) em logs.
- Nunca conceder acesso SSH a terceiros sem chave + sudo limitado + entrada no runbook.

---

## 8. Clarifications (em aberto — bloqueia avanço para Plan)

> Ordem aproximada de criticidade — tudo daqui é **necessário** para fechar `design.md`.

### Q-1 — Domínio definitivo e estrutura de subdomínios ✅ FECHADA
- **Domínio**: subdomínio do `kayoridolfi.ai` (**homologação/provisório**; migração para domínio AUMAF futura, fora desta spec)
- **DNS**: Cloudflare (já gerenciado pelo Kayo) — confirmado por screenshot do painel
- **Estrutura flat (1-level)**:
  - `aumaf.kayoridolfi.ai` → frontend público (Proxied)
  - `admin-aumaf.kayoridolfi.ai` → backoffice (Proxied)
  - `api-aumaf.kayoridolfi.ai` → backend API (DNS only — evita timeout 100s do CF Free na rota IA)
- **Por que flat e não aninhado**: Cloudflare Universal SSL Free só cobre 1 nível de subdomínio (`*.kayoridolfi.ai`). Aninhado exigiria ACM pago ($10/mês) ou Tunnel (refator IA→SSE).
- **TLS validado**: `*.kayoridolfi.ai` SAN cobre os 2 proxied. `api-aumaf` recebe Let's Encrypt do Caddy via DNS-01.
- **Cookie auth**: `Domain=admin-aumaf.kayoridolfi.ai` (strict, sem cross-subdomain). Admin→API usa BFF + `Authorization: Bearer`.
- **Migração futura para domínio AUMAF**: parametrização total via env vars (`PUBLIC_BASE_URL`, `ADMIN_BASE_URL`, `API_BASE_URL`, `CORS_ALLOWED_ORIGINS`, `BOTYIO_WEBHOOK_URL`); 301 redirects do Caddy; sem hardcode em código. Migração = 1 PR + DNS swap.

### Q-2 — Provedor da VPS + specs ✅ FECHADA (cenário A)
- **Decisão**: VPS dedicada nova para AUMAF, separada da stack pessoal `server.kayoridolfi.ai`
- **Provedor**: **Hostinger** (reverse DNS `srv1643738.hstgr.cloud`)
- **IP**: `2.24.72.8` (validado: ping OK, porta 22 acessível, reverse confirma Hostinger)
- **Plano**: KVM 2 — 2 vCPU / 8 GB RAM / 100 GB NVMe / 8 TB tráfego/mês
- **SO**: Ubuntu 22.04 LTS (suporte até 04/2027)
- **Localização**: Boston 2 (us-east) — RTT ~180 ms do BR; mitigado por Cloudflare CDN
- **Validade do plano**: 2027-05-04
- **Painel Hostinger oferece**: rescue mode (recuperação se travar SSH), reset de senha root, snapshot pago opcional (sugerido), gerenciamento de chave SSH (camada de recovery)
- **Por que separada**: isolamento de blast radius (incidente em Cal.com / NocoDB / n8n não afeta AUMAF) + clareza contratual (hospedagem custeada pelo projeto)
- **Recomendação V2 (futuro)**: avaliar migrar para Hostinger DC São Paulo se p99 ficar ruim — fora do escopo desta spec

### Q-2 — Provedor da VPS + specs
- IP `2.24.72.8` está hospedado em qual provedor? (Hetzner? Contabo? DigitalOcean? OVH? Outro?)
- Specs: RAM / vCPU / disco / banda?
- Localização (BR? EU? US?) — afeta latência para São Carlos/SP
- Tem console de recuperação (rescue mode) caso eu trave o SSH?
- SO atual? (Ubuntu 22.04? 24.04? Debian 12?)

### Q-3 — Cloudflare na frente? ✅ FECHADA
- **Sim**, plano Free. DNS já gerenciado pelo Kayo. Modo "Full (strict)" — Caddy+Let's Encrypt no origem.

### Q-4 — Estratégia de e-mail transacional ✅ FECHADA (DEFERIDA)
- **Decisão**: sem e-mail transacional na v1 da entrega.
- **Notificação de leads**: vai via WhatsApp através do Botyio (já mergeado em PR#7, aguardando ativação). Até a ativação, leads ficam em DB e admin vê em `/leads`.
- **Worker `lead-notification`**: mantido no código, dormente; ativado quando `BOTYIO_API_KEY` for configurado (fora desta spec).

### Q-5 — Backup off-site ✅ FECHADA
- **Decisão**: somente backup automático da Hostinger (snapshot do disco).
- **Risco assumido conscientemente**: snapshot é all-or-nothing; restaurar uma tabela específica exige restaurar a VPS toda. Não protege contra erro humano cuja janela é > 1 dia.
- **Fora de escopo**: pg_dump local diário, R2/B2, criptografia gpg/age. Pode entrar na manutenção R$150/mês se demanda surgir.

### Q-6 — Ambiente de staging? ✅ FECHADA
- **Decisão**: sem staging. Todo merge em `master` vai direto para produção (fluxo "trunk-based"); CI verde + smoke pós-deploy mitiga.

### Q-7 — Banco de dados ✅ FECHADA
- **Decisão**: Postgres 16 em container na VPS, com volume nomeado (`postgres_data`).

### Q-8 — Object storage ✅ FECHADA
- **Decisão**: MinIO em container separado na VPS, com volume nomeado (`minio_data`).

### Q-9 — Acesso SSH ✅ FECHADA
- **Decisão**: somente o Kayo. 1 usuário `deploy` com 1 chave SSH ed25519 (`~/.ssh/aumaf_deploy_ed25519`).
- **Cliente AUMAF**: somente acesso ao admin web (`https://admin-aumaf.kayoridolfi.ai`); credencial inicial entregue por canal seguro pós-go-live.

### Q-10 — Janela de manutenção e go-live ✅ FECHADA
- **Janela diária**: livre (homologação em subdomínio do `kayoridolfi.ai`, sem expectativa de uptime durante a fase). Posto janela formal (23h–05h BR) só quando migrar para domínio AUMAF.
- **Go-live target**: 2026-05-07 (quinta) em homologação.
- **Ritmo**: fluxo contínuo F1→F9 a partir de 2026-05-04.

### Q-11 — Sentry ✅ FECHADA
- **Decisão**: incluir na v1. Conta nova a criar (free tier 5k errors/mês).
- **Setup**: 3 projetos (backend, frontend-public, frontend-admin); DSNs em `.env.production` e GitHub Secrets.

### Q-12 — Uptime monitoring ✅ FECHADA
- **Decisão**: UptimeRobot (free 50 monitors, intervalo 5 min). Alertas para o e-mail pessoal do Kayo (configuração padrão); webhook Telegram opcional na F5.

---

## 9. Validação (Definição de pronto)

A spec está pronta para `_completed/` quando, em ordem:

1. Todos os critérios EARS de §4 têm evidência no `status.md` (log, screenshot, output de comando).
2. `https://<dominio>` retorna 200 com TLS válido + Lighthouse ≥ 90.
3. Smoke E2E passa em produção (Playwright contra URL pública).
4. Backup foi gerado, restaurado em ambiente local, integridade validada.
5. Runbooks de deploy / incidente / restore estão em `docs/runbooks/`.
6. CI/CD passou pelo menos uma vez ponta-a-ponta (PR → merge → deploy).
7. Cliente AUMAF recebeu credencial admin + URL.
8. `retrospective.md` escrito + spec movida para `_completed/`.
9. `INDEX.md` + `HISTORY.md` atualizados.
10. Senha root original do servidor descartada (rotacionada em F1).

---

**Próximo passo concreto**: usuário responde Q-1 a Q-12 → eu fecho `design.md` (HOW técnico) → checkpoint de revisão → `tasks.md` → executar.
