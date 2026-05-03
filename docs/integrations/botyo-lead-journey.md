# Integração Botyo — Jornada de Leads

**Versão:** 1.0.0  
**Data:** 2026-05-03  
**Autor:** kayoridolfi.ai  
**Status:** Spec pronta para implementação

---

## Visão Geral

Quando um visitante preenche o formulário de contato no site AUMAF 3D, o backend dispara automaticamente uma chamada à API Botyo. O Botyo é responsável por:

1. Registrar o lead no seu próprio sistema (CRM/funil)
2. Enviar uma mensagem de boas-vindas via WhatsApp para o número do lead
3. Reportar o status da operação de volta para o backend AUMAF

Isso transforma todo lead captado no site em uma conversa WhatsApp ativa — aumentando a taxa de resposta e mantendo o CRM Botyo e o backoffice AUMAF sincronizados.

---

## Fluxo Completo

```
Visitante preenche form
        │
        ▼
POST /api/leads  (AUMAF backend)
  ├─ Salva lead no PostgreSQL  ←── status: pending
  ├─ Retorna 201 ao browser
  └─ Dispara (fire-and-forget) ──► POST {BOTYO_API_URL}/leads
                                          │
                               ┌──────────▼──────────────┐
                               │        Botyo              │
                               │  1. Registra lead        │
                               │  2. Envia WhatsApp       │
                               └──────────┬──────────────┘
                                          │
                          Resposta sync (imediata)
                          + Callback async (webhook)
                                          │
                               POST {AUMAF_WEBHOOK_URL}/api/leads/botyo-status
                                          │
                                          ▼
                               AUMAF atualiza botyoStatus no banco
```

### Estados do lead no AUMAF

| Status (`botyoStatus`) | Significado |
|---|---|
| `pending` | Aguardando envio ao Botyo |
| `sent` | Botyo recebeu e está processando |
| `whatsapp_sent` | WhatsApp enviado com sucesso |
| `whatsapp_delivered` | Mensagem entregue ao dispositivo |
| `whatsapp_read` | Lead leu a mensagem |
| `failed` | Botyo retornou erro ou timeout |
| `no_phone` | Lead não informou telefone — WhatsApp não enviado |

---

## Contrato da API Botyo (o que AUMAF chama)

### Endpoint: Registrar Lead

```
POST {BOTYO_BASE_URL}/leads
```

#### Headers

| Header | Valor |
|---|---|
| `Content-Type` | `application/json` |
| `Authorization` | `Bearer {BOTYO_API_KEY}` |
| `X-Client-Id` | `aumaf-3d` |
| `X-Idempotency-Key` | `{lead.id}` (cuid do banco AUMAF) |

> **X-Idempotency-Key**: garante que retentativas não criem leads duplicados no Botyo.

#### Request Body

```json
{
  "externalId": "cm4xyzabc123",
  "name": "João Silva",
  "email": "joao@empresa.com",
  "phone": "+5516999990000",
  "message": "Preciso de 50 peças em PLA para protótipo",
  "source": "site-aumaf-3d",
  "metadata": {
    "capturedAt": "2026-05-03T15:30:00.000Z",
    "callbackUrl": "https://aumaf-3d.com.br/api/leads/botyo-status"
  }
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `externalId` | string | sim | ID do lead no banco AUMAF (cuid) — chave de correlação |
| `name` | string | sim | Nome completo do lead |
| `email` | string | sim | E-mail do lead |
| `phone` | string | não | Telefone no formato E.164 (+55DDNNNNNNNNN) |
| `message` | string | não | Mensagem deixada no formulário |
| `source` | string | sim | Origem fixa: `"site-aumaf-3d"` |
| `metadata.capturedAt` | ISO 8601 | sim | Momento exato da captura no site |
| `metadata.callbackUrl` | string | sim | URL do webhook AUMAF para receber atualizações de status |

#### Resposta de Sucesso (202 Accepted)

```json
{
  "botyoLeadId": "botyo_lead_abc999",
  "externalId": "cm4xyzabc123",
  "whatsapp": {
    "willAttempt": true,
    "reason": null
  },
  "status": "queued"
}
```

> O Botyo retorna **202** (não 200) pois o envio do WhatsApp é assíncrono. O status final vem via callback.

| Campo | Tipo | Descrição |
|---|---|---|
| `botyoLeadId` | string | ID do lead no sistema Botyo — guardar no banco AUMAF |
| `externalId` | string | Eco do `externalId` enviado — para validação |
| `whatsapp.willAttempt` | boolean | `false` se `phone` ausente ou inválido |
| `whatsapp.reason` | string\|null | Motivo de não tentar (`"no_phone"`, `"invalid_format"`) |
| `status` | string | `queued` \| `skipped` |

#### Resposta de Erro

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Campo 'email' inválido",
  "field": "email"
}
```

| Código HTTP | `error` | Quando |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Dados inválidos |
| 401 | `UNAUTHORIZED` | API key ausente ou inválida |
| 409 | `DUPLICATE_IDEMPOTENCY_KEY` | Lead já registrado (idempotência) — ignorar |
| 422 | `UNPROCESSABLE` | Regra de negócio (ex: número bloqueado) |
| 429 | `RATE_LIMITED` | Throttle atingido — deve retentar com backoff |
| 5xx | `BOTYO_ERROR` | Erro interno Botyo — retentar |

---

## Contrato do Webhook AUMAF (o que Botyo chama de volta)

### Endpoint: Receber Status

```
POST /api/leads/botyo-status
```

> Este endpoint já deve existir no backend AUMAF antes da ativação.

#### Headers enviados pelo Botyo

| Header | Valor |
|---|---|
| `Content-Type` | `application/json` |
| `X-Botyo-Signature` | HMAC-SHA256 do body (ver abaixo) |
| `X-Botyo-Event` | Tipo de evento |
| `X-Botyo-Delivery-Id` | UUID único do evento |

#### Validação da Assinatura (HMAC-SHA256)

```typescript
import { createHmac } from 'crypto'

function verifyBotyoSignature(rawBody: Buffer, signature: string, secret: string): boolean {
  const expected = 'sha256=' + createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  return expected === signature
}
```

> O `secret` é o `BOTYO_WEBHOOK_SECRET` configurado nas variáveis de ambiente.
> **Rejeitar qualquer request sem assinatura válida com 401.**

#### Payload de Callback

```json
{
  "event": "whatsapp.sent",
  "deliveryId": "uuid-da-entrega",
  "botyoLeadId": "botyo_lead_abc999",
  "externalId": "cm4xyzabc123",
  "occurredAt": "2026-05-03T15:30:45.000Z",
  "whatsapp": {
    "messageId": "wamid.abc123",
    "to": "+5516999990000",
    "status": "sent"
  }
}
```

#### Tipos de Evento (`X-Botyo-Event`)

| Evento | Significado | `botyoStatus` resultante |
|---|---|---|
| `lead.registered` | Lead salvo no Botyo | `sent` |
| `whatsapp.queued` | Mensagem na fila de envio | `sent` |
| `whatsapp.sent` | Enviado pela API do WhatsApp | `whatsapp_sent` |
| `whatsapp.delivered` | Entregue no dispositivo | `whatsapp_delivered` |
| `whatsapp.read` | Lead abriu a mensagem | `whatsapp_read` |
| `whatsapp.failed` | Falha no envio | `failed` |
| `lead.failed` | Falha geral no processamento | `failed` |

#### Resposta esperada pelo Botyo

```json
{ "received": true }
```

> Responder **200** para qualquer evento reconhecido, mesmo que já processado (idempotência).
> Responder **400** apenas para payload malformado.
> O Botyo retentará eventos com qualquer resposta **não 2xx** (até 5 vezes com backoff exponencial).

---

## Template da Mensagem WhatsApp

O Botyo enviará a mensagem usando um **template pré-aprovado** na Meta. Abaixo o texto sugerido para cadastro:

```
Olá, {{name}}! 👋

Recebemos sua mensagem na AUMAF 3D e já estamos analisando sua solicitação.

Em breve nossa equipe entrará em contato para entender melhor suas necessidades de impressão 3D.

_Mensagem automática — AUMAF 3D, São Carlos/SP_
```

> **Ação necessária:** O template deve ser criado e aprovado no painel Meta Business antes da ativação.
> Template name sugerido: `aumaf3d_lead_welcome`

---

## Alterações no Schema AUMAF (Prisma)

Adicionar os campos de rastreamento Botyo ao modelo `Lead`:

```prisma
model Lead {
  id              String    @id @default(cuid())
  name            String
  email           String
  phone           String?
  message         String?
  source          String?
  createdAt       DateTime  @default(now())

  // Campos Botyo (adicionados na integração)
  botyoLeadId     String?
  botyoStatus     String?   @default("pending")
  botyoQueuedAt   DateTime?
  botyoSentAt     DateTime?
  botyoFailReason String?

  @@map("leads")
}
```

**Migration sugerida:**

```bash
cd backend && npx prisma migrate dev --name add_botyo_fields_to_lead
```

---

## Variáveis de Ambiente

Adicionar ao `backend/.env` e `backend/.env.example`:

```env
# Botyo Integration
BOTYO_BASE_URL=https://api.botyo.com.br/v1
BOTYO_API_KEY=sk_live_xxxxxxxxxxxxxx
BOTYO_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxx
BOTYO_ENABLED=true
```

| Variável | Obrigatória | Descrição |
|---|---|---|
| `BOTYO_BASE_URL` | sim | URL base da API Botyo |
| `BOTYO_API_KEY` | sim | Chave de autenticação (Bearer) |
| `BOTYO_WEBHOOK_SECRET` | sim | Segredo para validar callbacks HMAC |
| `BOTYO_ENABLED` | não | Feature flag — `false` desabilita sem remover código |

---

## Lógica de Retry no AUMAF

A chamada ao Botyo deve ser **fire-and-forget** na rota `POST /leads` — não bloquear a resposta ao usuário. Usar BullMQ para retentativas:

```
Queue: botyo-lead-sync
Job payload: { leadId, attempt: 1 }
Retries: 3
Backoff: exponential (1s, 4s, 16s)
```

**Fluxo do worker:**

1. Buscar lead pelo `leadId` (verificar se já tem `botyoLeadId` — skip se sim)
2. Chamar `POST {BOTYO_BASE_URL}/leads`
3. Se **202**: atualizar `botyoLeadId`, `botyoStatus: 'sent'`, `botyoQueuedAt`
4. Se **409** (duplicata): marcar como `sent` sem erro
5. Se **429/5xx**: lançar erro para o BullMQ retentar
6. Se **400/401/422**: marcar `botyoStatus: 'failed'`, `botyoFailReason`, não retentar

---

## Implementação no Backend AUMAF

### Arquivos a criar/alterar

```
backend/src/
├── services/
│   └── botyo.service.ts          # cliente HTTP + lógica de sync
├── workers/
│   └── botyo-lead-sync.worker.ts # BullMQ worker
├── routes/
│   └── lead.routes.ts            # ADICIONAR: POST /botyo-status
└── config/
    └── env.ts                    # ADICIONAR: variáveis Botyo
```

### Esqueleto do `botyo.service.ts`

```typescript
export interface BotyoLeadPayload {
  externalId: string
  name: string
  email: string
  phone?: string
  message?: string
  source: string
  metadata: {
    capturedAt: string
    callbackUrl: string
  }
}

export interface BotyoLeadResponse {
  botyoLeadId: string
  externalId: string
  whatsapp: { willAttempt: boolean; reason: string | null }
  status: 'queued' | 'skipped'
}

export async function syncLeadToBotyo(lead: Lead): Promise<BotyoLeadResponse>

export async function handleBotyoCallback(event: BotyoCallbackPayload): Promise<void>
```

---

## Checklist de Ativação

- [ ] Schema Prisma atualizado com campos Botyo + migration aplicada
- [ ] Variáveis de ambiente configuradas em staging e produção
- [ ] Endpoint `POST /api/leads/botyo-status` implementado com validação HMAC
- [ ] Worker BullMQ `botyo-lead-sync` registrado no servidor
- [ ] Template WhatsApp criado e aprovado na Meta Business
- [ ] URL do webhook configurada no painel Botyo: `https://aumaf-3d.com.br/api/leads/botyo-status`
- [ ] Teste de ponta a ponta em staging com número real
- [ ] Variável `BOTYO_ENABLED=true` ativada em produção

---

## Notas de Segurança

- A `BOTYO_API_KEY` **nunca** deve ser logada — mascarar nos logs de debug
- O endpoint `/api/leads/botyo-status` **não requer auth JWT** (vem do Botyo), mas **obriga** assinatura HMAC
- Logar apenas `externalId` e `botyoLeadId` nos logs — não logar `phone` ou `email` em claro
- Configurar `botyoWebhookUrl` nas Settings do admin como fallback configurável (já existe o campo no `Setting`)
