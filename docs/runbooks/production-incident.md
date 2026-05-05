# Runbook — Incidentes em produção AUMAF 3D

## Severidades

| Sev | Definição | Tempo de resposta esperado |
|---|---|---|
| **SEV1** | Site público fora do ar (visitante não consegue acessar) | 15 min |
| **SEV2** | Função degradada (admin off, lead form off, blog não renderiza) | 1 h |
| **SEV3** | Erro intermitente, lentidão, alerta isolado | 4 h |

Alertas chegam via UptimeRobot (Telegram/email) e Sentry (Telegram/email para erros novos).

## Checklist inicial (qualquer SEV)

```bash
# 1. SSH
ssh -i ~/.ssh/aumaf_deploy_ed25519 deploy@2.24.72.8

# 2. status agregado
sudo make -C /srv/aumaf/compose status
sudo systemctl status caddy

# 3. healthcheck do backend
curl -fsS http://127.0.0.1:3000/health | jq .

# 4. logs recentes
sudo make -C /srv/aumaf/compose logs | tail -100

# 5. Sentry — issues últimos 30 min
# https://sentry.io/organizations/<org>/issues/?query=is:unresolved age:-30m

# 6. Cloudflare — analytics + bypass de cache se necessário
# https://dash.cloudflare.com/<account>/kayoridolfi.ai
```

## Cenário: site público fora (SEV1)

### Triagem rápida

```bash
# Caddy ativo?
sudo systemctl status caddy

# Containers ativos?
sudo docker ps

# Cloudflare reportando origin down?
# Dash CF → kayoridolfi.ai → Analytics → erros 5xx
```

### Caminhos

1. **Caddy fora**: `sudo systemctl restart caddy`. Se loop, ver `journalctl -u caddy -n 50`. Cert expirado? Token CF inválido?
2. **Container backend morto**: `sudo make restart-backend`. Se loop, `docker logs <container> --tail 100`. Possível: DB inacessível, env var faltando, exception fatal.
3. **Postgres caiu**: `docker logs aumaf-prod-postgres-1 --tail 50`. Disco cheio? `df -h`. Se sim, `docker image prune -af` libera; depois reiniciar postgres.
4. **VPS não responde a SSH**: usar **Browser Terminal** do painel Hostinger (login web) → diagnosticar local. Se kernel panic, painel oferece reboot.

### Rollback (último recurso)

```bash
# Encontrar SHA anterior funcional
git log --oneline master | head -5
# Aplicar
sudo make -C /srv/aumaf/compose rollback TAG=<sha>
```

## Cenário: admin não loga (SEV2)

```bash
# 1. Cookie domain bate?
# Browser DevTools → Application → Cookies → admin-aumaf.kayoridolfi.ai

# 2. JWT_SECRET trocou?
sudo cat /srv/aumaf/env/.env.production | grep JWT_SECRET
# Se trocou, todos os usuários logados são deslogados; é esperado.

# 3. Backend respondendo a /api/v1/auth/login?
curl -fsS -X POST https://api-aumaf.kayoridolfi.ai/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<email>","password":"<senha>"}' -i
```

## Cenário: lead form não envia (SEV2)

```bash
# 1. Backend POST /api/v1/leads responde?
curl -X POST https://api-aumaf.kayoridolfi.ai/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"smoke","phone":"+5516000000000","email":"smoke@test.local"}' -i

# 2. CORS bloqueando? Browser DevTools → Console
sudo grep CORS /srv/aumaf/env/.env.production

# 3. Worker BullMQ travado (notificação)?
# Email está em modo stub; não bloqueia persistência. Lead vai para DB mesmo.
```

## Cenário: deploy ruim acabou de subir (SEV1)

```bash
# Imediato — rollback para SHA anterior conhecido bom
sudo make -C /srv/aumaf/compose rollback TAG=<sha-anterior>

# Investigar pós-fato com logs
sudo make logs > /tmp/incident-$(date +%s).log
```

Reverter a PR ruim no GitHub (GH UI → "Revert" no merge) e aguardar CD do revert subir.

## Comunicação

- Cliente AUMAF: WhatsApp/email (Kayo é único contato)
- Dev (Kayo): Telegram do UptimeRobot/Sentry

## Pós-mortem (qualquer SEV1, SEV2 com > 30 min)

Criar entrada em `docs/specs/_active/<data>-incident-<slug>/` com:

- **Timeline** (UTC)
- **Causa raiz**
- **Impacto** (quantos visitantes / leads perdidos? Estimar)
- **Ações imediatas tomadas**
- **Ações preventivas** (PRs/configs a ajustar)
