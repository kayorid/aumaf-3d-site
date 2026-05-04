# Runbook — Ativação Botyio em Produção

**Pré-requisitos:**
- VPS com backend AUMAF 3D rodando, acessível via HTTPS no domínio público (ex: `https://aumaf-3d.com.br`)
- Source `siteaumaf3d` criada no painel Botyio (já feito — ver screenshot na sessão de 2026-05-03)
- Acesso SSH à VPS
- Credenciais Botyio em mãos (API Key + Webhook Secret)

**Tempo estimado:** 20–30 min (incluindo teste E2E)

---

## Resumo do que vai acontecer

1. Aplicar migration nova no banco de produção (campos UTM + Botyio + tabela `BotyoWebhookDelivery`)
2. Setar 4 variáveis de ambiente novas no servidor
3. Reiniciar o backend
4. No painel Botyio: trocar o callback URL de `webhook.site/...` para `https://<seu-dominio>/api/v1/leads/botyio-status`
5. Disparar um lead real do formulário de contato com seu próprio número
6. Verificar: lead no banco com `botyoStatus`, WhatsApp recebido, status atualizado nos webhooks

---

## Passo 1 — Pull do código mais recente

```bash
ssh <usuario>@<vps-host>
cd /caminho/para/aumaf-3d-site
git pull origin master
# Confirma que o último merge é o PR #7 (Botyio): commit 8075442 ou posterior
git log --oneline -3
```

## Passo 2 — Instalar dependências novas

```bash
# libphonenumber-js foi adicionado no PR #7
cd /caminho/para/aumaf-3d-site
npm install
# Ou, se usa apenas o workspace backend:
cd backend && npm install
```

## Passo 3 — Aplicar a migration no banco de produção

```bash
cd backend
npx prisma migrate deploy
# Esperado: "Applying migration 20260503205737_add_botyio_utm_fields"
```

**Verificação:**
```bash
npx prisma studio  # Abrir browser e confirmar que Lead tem campos botyoStatus, utmSource, etc.
# OU via psql:
psql $DATABASE_URL -c "\d leads" | grep -E "utm|botyo"
psql $DATABASE_URL -c "\d botyo_webhook_deliveries"
```

## Passo 4 — Configurar variáveis de ambiente

Edite o `.env` de produção (ou o sistema de secrets do seu provider):

```env
# Botyio — WhatsApp lead integration
BOTYIO_BASE_URL=https://api.botyio.com
BOTYIO_API_KEY=<api-key-do-painel-botyio>
BOTYIO_WEBHOOK_SECRET=<webhook-secret-do-painel-botyio>
BOTYIO_ENABLED=true
```

> ⚠️ As credenciais reais foram mostradas uma única vez no painel Botyio (ver screenshot da sessão 2026-05-03). Elas estão fora deste runbook por segurança.

**Verificação rápida:**
```bash
# No diretório do backend, com o .env carregado:
node -e "require('dotenv').config(); console.log({
  enabled: process.env.BOTYIO_ENABLED,
  hasKey: !!process.env.BOTYIO_API_KEY,
  hasSecret: !!process.env.BOTYIO_WEBHOOK_SECRET,
  base: process.env.BOTYIO_BASE_URL,
})"
# Esperado: { enabled: 'true', hasKey: true, hasSecret: true, base: 'https://api.botyio.com' }
```

## Passo 5 — Reiniciar o backend

Depende do gerenciador de processo. Exemplos:

```bash
# PM2
pm2 restart aumaf-backend

# systemd
sudo systemctl restart aumaf-backend

# Docker Compose
docker compose restart backend
```

**Verificação:**
```bash
curl https://<seu-dominio>/health
# Esperado: status 200 com services.db / services.redis / services.queues incluindo botyio-lead-sync
```

## Passo 6 — Trocar o callback URL no painel Botyio

1. Login: `https://app.botyio.com/lead-capture/sources`
2. Abrir source **"Site AUMAF 3D"** (slug: `siteaumaf3d`)
3. Aba **Webhooks** (ou **Configuração**, dependendo da versão)
4. Trocar callback URL atual (`https://webhook.site/501bffb6-...`) por:
   ```
   https://<seu-dominio>/api/v1/leads/botyio-status
   ```
5. Salvar

> Sem HTTPS válido o Botyio pode rejeitar o callback. Confirme que o domínio tem certificado TLS antes deste passo.

## Passo 7 — Teste E2E com lead real

1. Abrir `https://<seu-dominio>/contato` num browser
2. Preencher o formulário com **seu próprio número WhatsApp** (formato qualquer — o backend normaliza E.164)
3. Submit

**O que deve acontecer (em sequência, 5–30 segundos):**

| Tempo | Evento | Onde verificar |
|---|---|---|
| t+0s | Lead salvo no banco | `SELECT * FROM leads ORDER BY "createdAt" DESC LIMIT 1` — deve ter UTM se vier de URL com parâmetros |
| t+1s | Worker `botyio-lead-sync` chama API | Log do backend: `Lead synced to Botyio` com `botyoLeadId` |
| t+2s | `botyoStatus` no banco vira `'sent'` | Mesma query — coluna `botyoStatus`, `botyoLeadId`, `botyoQueuedAt` preenchidos |
| t+5s | WhatsApp recebido no seu número | "Olá <Seu Nome>! 👋 Recebemos sua mensagem..." vindo de `5516992863412` |
| t+5s a t+30s | Webhooks chegam: `whatsapp.sent` → `whatsapp.delivered` | Coluna `botyoStatus` evolui: `whatsapp_sent` → `whatsapp_delivered` + `botyoSentAt` preenchido |
| Quando você abrir a msg | Webhook `whatsapp.read` | Coluna `botyoStatus` vira `whatsapp_read` |

**Query de inspeção rápida:**

```sql
SELECT
  id,
  name,
  phone,
  "botyoLeadId",
  "botyoStatus",
  "botyoQueuedAt",
  "botyoSentAt",
  "botyoFailReason",
  "utmSource",
  "createdAt"
FROM leads
ORDER BY "createdAt" DESC
LIMIT 5;
```

**Confirmar que webhooks estão chegando:**

```sql
SELECT "deliveryId", event, "receivedAt"
FROM botyo_webhook_deliveries
ORDER BY "receivedAt" DESC
LIMIT 10;
```

## Passo 8 — Validar no painel Botyio

1. Abrir `https://app.botyio.com/lead-capture/intakes`
2. Filtrar por source `siteaumaf3d`
3. Confirmar que o lead apareceu com timeline completa: `RECEIVED` → `QUEUED` → `SENT` → `DELIVERED` (e `READ` se você abriu)
4. Verificar que o contato apareceu na coluna do board configurado (Configuração → Roteamento)

---

## Troubleshooting

### Sintoma: Lead criado mas `botyoStatus` continua `pending`
**Causa provável:** worker `botyio-lead-sync` não está rodando, ou Redis fora do ar.
**Diagnóstico:**
```bash
curl https://<seu-dominio>/health
# Confere services.queues — botyio-lead-sync deve aparecer com status active
```
Se não aparece: o worker não foi registrado. Confirmar que o backend foi reiniciado após o pull.

### Sintoma: `botyoStatus = 'failed'` com `botyoFailReason` começando com "401"
**Causa:** API Key inválida.
**Fix:** verificar `BOTYIO_API_KEY` no `.env` (sem espaços, prefixo `bty_lds_` correto).

### Sintoma: `botyoStatus = 'failed'` com `botyoFailReason` começando com "400"
**Causa:** payload rejeitado (provável: telefone fora do E.164 que o normalizador não conseguiu salvar).
**Fix:** logs do backend mostram `phone normalized` ou `phone invalid`. Se inválido, o lead é registrado mas WhatsApp não é enviado — comportamento correto.

### Sintoma: WhatsApp recebido mas `botyoStatus` no banco continua `sent` (não evolui para `whatsapp_sent/delivered/read`)
**Causa:** webhook do Botyio não está chegando no AUMAF.
**Diagnóstico:**
1. Painel Botyio → source → aba "Entregas" — vê se está tentando entregar e qual status HTTP volta
2. Se 401: HMAC inválido. Verificar `BOTYIO_WEBHOOK_SECRET` no `.env`
3. Se timeout/conn refused: domínio/porta não está exposta corretamente. Verificar firewall + reverse proxy
4. Se 400: body malformado. Logs do backend mostram detalhe

### Sintoma: HMAC sempre falha (401 mesmo com secret certo)
**Causa muito provável:** algum middleware/proxy reverso está modificando o body antes de chegar no Express.
**Fix:** confirmar que nginx/Caddy está com `proxy_request_buffering off` ou equivalente; o body precisa chegar **byte-a-byte** intacto para o HMAC bater.

### Rollback de emergência
Para desligar a integração sem fazer revert de código:
```env
BOTYIO_ENABLED=false
```
Reinicia o backend. Worker continua existindo mas não dispara fetch para o Botyio. Webhooks que chegarem ainda são processados (idempotente — pode reativar depois).

---

## Pós-ativação — recomendações

1. **Rotação de credenciais:** API Key e Webhook Secret foram compartilhados em chat na sessão de criação. Recomenda-se gerar novos no painel após confirmação de funcionamento (Botyio permite revogar o atual e gerar novo).
2. **Monitoramento:** adicionar alarme em uptime monitor para `botyoStatus = 'failed'` count > N por hora.
3. **Limpeza de testes:** `DELETE FROM leads WHERE source = 'site-contato' AND "botyoLeadId" IS NOT NULL AND "createdAt" < '<dia-do-teste>'` se houver leads de teste no banco.
4. **Retenção `botyo_webhook_deliveries`:** tabela cresce indefinidamente. Sugestão: rodar mensalmente `DELETE FROM botyo_webhook_deliveries WHERE "receivedAt" < NOW() - INTERVAL '90 days'`.
