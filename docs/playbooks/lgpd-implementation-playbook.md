# Playbook — Implementação de Conformidade LGPD

> Documentação técnica genérica para replicar a stack LGPD em qualquer site/SaaS com backend Node.js + Postgres + frontend SPA/SSR. Cobre da camada legal (políticas) até infraestrutura (retenção, anonimização, DSR, consent gating).
>
> Base legal: **Lei nº 13.709/2018 (LGPD)**, art. 7º (bases legais), art. 8º (consentimento), art. 9º (informação ao titular), art. 18 (direitos do titular), art. 46 (segurança).

---

## 0. Visão geral da arquitetura

A implementação tem **6 fases (A–F)** que podem ser executadas em paralelo após a fase A estar fechada:

| Fase | Camada | Entregável | Dependências |
|---|---|---|---|
| **A** | Legal/Docs | 3 políticas públicas + 4 docs operacionais | — |
| **B** | Frontend | Banner de consent (3 ações + modal de categorias) | A |
| **C** | Frontend | Loader consent-aware (Google Consent Mode v2 gating) | B |
| **D** | Backend | Endpoints `POST /v1/consent` + tabela `consent_logs` | A |
| **E** | Backend | DSR (Data Subject Requests — art. 18) + UI admin | A, D |
| **F** | Backend | Worker de retenção (anonimização + purga) | D, E |

**Stack assumida no playbook:**
- Backend: Node.js + Express + Prisma + PostgreSQL + BullMQ/Redis
- Frontend público: Astro/Next/SSR ou SPA — qualquer um que rode JS no browser
- Admin: React + Vite (para UI das solicitações DSR)
- Schemas compartilhados via package `@yourorg/shared` (Zod)

**Filosofia:**
- Consent **opt-in real**: nada de scripts de terceiros injetados antes do "Aceitar"
- **Dark patterns proibidos** (ANPD): "Aceitar / Recusar / Personalizar" têm peso visual equivalente
- **Audit trail imutável**: toda escolha de consent gera linha em `consent_logs` com IP **hasheado** (não bruto)
- **Sem PII em logs**: salt server-side aplicado a IP/email antes de persistir
- **Retenção automática**: worker noturno anonimiza/purga conforme política

---

## 1. Fase A — Camada Legal e Documentação

### 1.1 Estrutura de pastas

```
docs/
├── legal/                          # PÚBLICO — renderizado no site
│   ├── politica-de-privacidade.md
│   ├── politica-de-cookies.md
│   └── termos-de-uso.md
└── compliance/                     # INTERNO — não publicar
    ├── ropa.md                     # Registro Operações Tratamento (art. 37)
    ├── lia-analytics.md            # Legitimate Interest Assessment
    ├── incident-response.md        # Plano de resposta a incidentes (art. 48)
    └── dpa-checklist.md            # Data Processing Agreement com fornecedores
```

### 1.2 Política de Privacidade — seções obrigatórias

```markdown
# Política de Privacidade

**Versão:** 1.0 — vigente a partir de YYYY-MM-DD
**Controlador:** [Razão social, CNPJ, endereço]
**Encarregado (DPO):** [Nome] — [email] — [telefone opcional]

## 1. Dados que coletamos
| Dado | Origem | Finalidade | Base legal |
|---|---|---|---|
| Nome, e-mail, telefone | Formulário de contato | Atendimento comercial | Execução de contrato pré-contratual (art. 7º, V) |
| Cookies analíticos | Navegação | Métricas agregadas | Consentimento (art. 7º, I) |
| IP + User Agent | Servidor | Segurança, anti-fraude | Legítimo interesse (art. 7º, IX) |

## 2. Como tratamos
[Pipelines, infraestrutura, criptografia em trânsito (TLS) e em repouso, controles de acesso]

## 3. Com quem compartilhamos
| Operador | País | Finalidade | Garantia |
|---|---|---|---|
| Google Analytics 4 | EUA | Métricas | DPA + IP anonimization |
| ... | | | |

## 4. Por quanto tempo (retenção)
- Leads ativos: 5 anos após último contato (prescrição CC art. 206)
- Eventos analytics: 12 meses (anonimização após)
- Consent logs: 5 anos (prova legal)
- DSR resolvidas: 5 anos

## 5. Direitos do titular (art. 18)
Detalha os 9 direitos + canal: `/lgpd/solicitar` ou e-mail do DPO.
Prazo de resposta: 15 dias úteis.

## 6. Encarregado (DPO)
[Dados de contato]

## 7. Transferência internacional
Lista países de destino + cláusulas-padrão.

## 8. Cookies
Link para `/politica-de-cookies`.

## 9. Alterações
Histórico versionado.
```

### 1.3 Política de Cookies — tabela canônica

```markdown
## Categorias

| Categoria | Status default | Pode ser desabilitada? | Base legal |
|---|---|---|---|
| Necessários | Sempre on | Não | Legítimo interesse |
| Funcionais | Off | Sim | Consentimento |
| Analíticos | Off | Sim | Consentimento |
| Marketing | Off | Sim | Consentimento |

## Cookies por categoria

| Nome | Provedor | Validade | Finalidade | Categoria |
|---|---|---|---|---|
| `session_id` | Próprio | Sessão | Login | Necessário |
| `your_consent_v1` | Próprio | 12 meses | Lembrar escolha | Necessário |
| `_ga`, `_ga_*` | Google | 2 anos | Analytics | Analítico |
| `_clck`, `_clsk` | Microsoft Clarity | 1 ano | Heatmaps | Analítico |
| `_fbp` | Meta | 90 dias | Remarketing | Marketing |
```

### 1.4 ROPA (`docs/compliance/ropa.md`)

Para **cada processo** de tratamento, registrar:
- ID do processo, área responsável
- Categorias de titulares (clientes, leads, funcionários)
- Categorias de dados (identificação, contato, transação, comportamento)
- Finalidades específicas
- Base legal (art. 7º)
- Operadores envolvidos
- Prazo de retenção
- Medidas de segurança

### 1.5 LIA (Legitimate Interest Assessment)

Para cada uso de **legítimo interesse** (art. 7º, IX), preencher:
1. **Necessity test**: o tratamento é necessário para o interesse?
2. **Balancing test**: o interesse legítimo se sobrepõe aos direitos do titular?
3. **Safeguards**: quais medidas mitigam o impacto (anonimização, opt-out, minimização)?

Exemplo: analytics agregado anônimo → LIA aprovado se IP for hasheado e não houver fingerprinting.

### 1.6 Incident Response Plan

Mínimo da ANPD (art. 48 — comunicação em "prazo razoável"):
1. Detecção (logs, alertas, denúncia)
2. Contenção (revogar credencial, isolar serviço)
3. Avaliação de impacto (dados expostos, nº de titulares)
4. **Notificação ANPD em até 72h** se houver risco relevante
5. Notificação aos titulares se afetados
6. Post-mortem + correção sistêmica

---

## 2. Fase B — Banner de Consentimento (Frontend)

### 2.1 Princípios de design (anti-dark-pattern)

- **3 ações, mesmo peso visual**: "Aceitar todos" / "Recusar não essenciais" / "Personalizar"
- O CTA "Recusar" **nunca** pode ser menor, cinza ou escondido
- "Personalizar" abre modal granular com 4 categorias (necessários sempre-on)
- Banner não bloqueia conteúdo (não é cookie wall) — é um aside fixo no rodapé
- Reabertura: expor função global `window.reopenConsent()` para link no rodapé

### 2.2 Modelo de dados — localStorage

```ts
// Chave: `<app>_consent_v1`
{
  necessary: true,           // sempre true
  functional: boolean,
  analytics: boolean,
  marketing: boolean,
  version: "1.0",            // versão da política aceita
  timestamp: "2026-05-12T..."
}
```

**Versionamento**: se `version` diferir do `POLICY_VERSION` atual, o banner reabre automaticamente (re-consent).

### 2.3 Estrutura HTML (extrair do `CookieConsent.astro`)

```html
<aside id="consent" role="dialog" aria-modal="false">
  <div class="banner">
    <p>Texto curto + link para Política de Cookies</p>
    <button id="reject">Recusar não essenciais</button>
    <button id="customize">Personalizar</button>
    <button id="accept">Aceitar todos</button>
  </div>

  <div id="modal" role="dialog" aria-modal="true">
    <header>Personalizar consentimento <button id="close">×</button></header>
    <!-- 4 toggles: necessary (locked), functional, analytics, marketing -->
    <footer>
      <button id="modal-reject">Recusar não essenciais</button>
      <button id="modal-save">Salvar escolhas</button>
    </footer>
  </div>
</aside>
```

### 2.4 Lógica do banner (resumido)

```ts
const STORAGE_KEY = 'app_consent_v1'
const POLICY_VERSION = '1.0'

function shouldShow() {
  const stored = readStored()
  return !stored || stored.version !== POLICY_VERSION
}

function persist(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...state, version: POLICY_VERSION, timestamp: new Date().toISOString()
  }))
  window.dispatchEvent(new CustomEvent('app:consent', { detail: state }))
}

async function sendToBackend(state, source) {
  // best-effort — UX nunca trava
  try {
    await fetch(`${API_URL}/api/v1/consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: state, policyVersion: POLICY_VERSION, source }),
      keepalive: true,  // permite envio durante page unload
    })
  } catch {}
}

function acceptAll() {
  const state = { necessary: true, functional: true, analytics: true, marketing: true }
  persist(state); sendToBackend(state, 'banner_accept_all'); close()
}
function rejectOptional() {
  const state = { necessary: true, functional: false, analytics: false, marketing: false }
  persist(state); sendToBackend(state, 'banner_reject_optional'); close()
}
function saveCustom() {
  const state = readModalState()
  persist(state); sendToBackend(state, 'banner_custom'); close()
}
```

**Detalhes críticos:**
- `keepalive: true` no fetch — garante POST mesmo se usuário fechar a aba
- `dispatchEvent('app:consent')` — loader de scripts terceiros escuta
- `try/catch` em volta de tudo — banner nunca pode quebrar a navegação
- Categorias necessárias sempre `true` na payload — não permitir cliente forjar `necessary: false`

---

## 3. Fase C — Loader de Scripts Terceiros (Consent-Aware)

### 3.1 Princípio: zero-injection antes do consent

GA4, Clarity, Meta Pixel, GTM **não devem aparecer no DOM** até que o titular aceite a categoria correspondente.

### 3.2 Google Consent Mode v2 — default denied

No `<head>` da página, **ANTES** de qualquer script de tracking:

```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500
  });
</script>
```

Isso garante que mesmo se um script GA4 for carregado mais tarde, ele honra o consent default `denied` até receber `update`.

### 3.3 Loader (extrair do `third-party-loader.ts`)

```ts
interface PublicSettings {
  gtmContainerId: string | null
  ga4MeasurementId: string | null
  clarityProjectId: string | null
  facebookPixelId: string | null
}

interface Categories {
  necessary: true
  functional: boolean
  analytics: boolean
  marketing: boolean
}

function readConsent(): Categories | null {
  try {
    const raw = localStorage.getItem('app_consent_v1')
    if (!raw) return null
    const p = JSON.parse(raw)
    return {
      necessary: true,
      functional: !!p.functional,
      analytics: !!p.analytics,
      marketing: !!p.marketing,
    }
  } catch { return null }
}

function applyConsent(categories: Categories) {
  // 1. Promover flags do Consent Mode v2
  window.gtag?.('consent', 'update', {
    analytics_storage: categories.analytics ? 'granted' : 'denied',
    ad_storage: categories.marketing ? 'granted' : 'denied',
    ad_user_data: categories.marketing ? 'granted' : 'denied',
    ad_personalization: categories.marketing ? 'granted' : 'denied',
    functionality_storage: categories.functional ? 'granted' : 'denied',
    security_storage: 'granted',
  })

  // 2. Injetar scripts conforme categoria
  if (categories.analytics) {
    if (settings.gtmContainerId) loadGtm(settings.gtmContainerId)
    else if (settings.ga4MeasurementId) loadGa4(settings.ga4MeasurementId)
    if (settings.clarityProjectId) loadClarity(settings.clarityProjectId)
  }
  if (categories.marketing && settings.facebookPixelId) {
    loadFacebookPixel(settings.facebookPixelId)
  }
}

// Boot: aplica consent gravado
const initial = readConsent()
if (initial) applyConsent(initial)

// Listener para mudanças via banner
window.addEventListener('app:consent', (ev) => {
  applyConsent(ev.detail)
})
```

### 3.4 Carregadores individuais (idempotentes)

Cada `loadXxx()` checa `window.__appLoaded.xxx` para evitar dupla injeção:

```ts
function loadGa4(measurementId: string) {
  if (window.__appLoaded?.ga4) return
  window.__appLoaded = { ...window.__appLoaded, ga4: true }
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
  document.head.appendChild(s)
  window.gtag?.('js', new Date())
  window.gtag?.('config', measurementId, { anonymize_ip: true })
}
```

**Padrões equivalentes para:**
- GTM → `https://www.googletagmanager.com/gtm.js?id=`
- Clarity → `https://www.clarity.ms/tag/`
- Meta Pixel → `https://connect.facebook.net/en_US/fbevents.js`

---

## 4. Fase D — Endpoint de Consent (Backend)

### 4.1 Schema Prisma — `ConsentLog`

```prisma
model ConsentLog {
  id            String   @id @default(cuid())
  userIdHash    String?              // hash do email se logado (NUNCA email plano)
  ipHash        String               // SHA-256(ip + IP_SALT)
  userAgent     String?
  categories    Json                 // { necessary, functional, analytics, marketing }
  policyVersion String               // "1.0"
  source        String               // "banner_accept_all" | "banner_reject_optional" | "banner_custom"
  createdAt     DateTime @default(now())

  @@index([createdAt])
  @@index([userIdHash])
  @@map("consent_logs")
}
```

**Por que essas escolhas?**
- `Json` em `categories`: permite adicionar categorias novas sem migration
- `ipHash` + `userIdHash` em vez de valores brutos: evita PII em audit log
- Sem FK para `User`: log de consent precisa sobreviver à exclusão do usuário (prova legal)
- Index em `userIdHash`: necessário para export DSR

### 4.2 Schema Zod compartilhado

```ts
// packages/shared/src/schemas/consent.ts
import { z } from 'zod'

export const CategoriesSchema = z.object({
  necessary: z.literal(true),
  functional: z.boolean(),
  analytics: z.boolean(),
  marketing: z.boolean(),
}).strict()

export const CreateConsentLogSchema = z.object({
  userIdHash: z.string().optional(),
  categories: CategoriesSchema,
  policyVersion: z.string().min(1).max(20),
  source: z.enum(['banner_accept_all', 'banner_reject_optional', 'banner_custom']),
}).strict()

export type CreateConsentLogInput = z.infer<typeof CreateConsentLogSchema>
```

### 4.3 Hash de IP (server-side)

```ts
// backend/src/lib/ip-hash.ts
import crypto from 'node:crypto'
import { env } from '../config/env'

export function hashIp(ip: string): string {
  return crypto
    .createHash('sha256')
    .update(`${ip}:${env.IP_HASH_SALT}`)
    .digest('hex')
    .slice(0, 32)
}

export function extractIp(req: { headers: Record<string, string|string[]>; ip?: string }): string | null {
  // Atrás de proxy/CDN — confiar no header configurado
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string') return fwd.split(',')[0].trim()
  return req.ip ?? null
}
```

**`IP_HASH_SALT`**: gerado uma vez via `openssl rand -hex 32`, armazenado em variável de ambiente (chmod 600 em produção). **Nunca commitar.**

### 4.4 Service + Route

```ts
// services/consent.service.ts
export async function recordConsent(input: CreateConsentLogInput, ctx: { ipHash: string; userAgent: string | null }) {
  return prisma.consentLog.create({
    data: {
      ipHash: ctx.ipHash,
      userAgent: ctx.userAgent,
      userIdHash: input.userIdHash ?? null,
      categories: input.categories,
      policyVersion: input.policyVersion,
      source: input.source,
    },
    select: { id: true },
  })
}

// routes/consent.routes.ts
const consentLimiter = rateLimit({ windowMs: 60_000, max: 10 })

consentRoutes.post('/', consentLimiter, async (req, res, next) => {
  try {
    const input = CreateConsentLogSchema.parse(req.body)
    const rawIp = extractIp(req)
    const result = await recordConsent(input, {
      ipHash: rawIp ? hashIp(rawIp) : 'unknown',
      userAgent: req.headers['user-agent'] ?? null,
    })
    res.status(201).json({ status: 'ok', data: result })
  } catch (err) { next(err) }
})
```

**Rate limit**: 10/min/IP — protege contra flood enquanto permite re-consent legítimo.

---

## 5. Fase E — DSR (Direitos do Titular, art. 18)

### 5.1 Os 9 direitos a suportar

```ts
type DsrRequestType =
  | 'access'           // I — confirmação de tratamento + acesso
  | 'correction'       // III — correção
  | 'anonymization'    // IV — anonimização/bloqueio/eliminação
  | 'deletion'         // VI — eliminação de dados tratados c/ consentimento
  | 'portability'      // V — portabilidade
  | 'revocation'       // IX — revogação de consentimento
  | 'info_share'       // VII — informação de compartilhamento
  | 'info_no_consent'  // VIII — info sobre não fornecer consentimento
  | 'review_automated' // §1º art. 20 — revisão de decisões automatizadas
```

### 5.2 Schema Prisma — `DataSubjectRequest`

```prisma
model DataSubjectRequest {
  id                String    @id @default(cuid())
  email             String
  fullName          String?
  requestType       String                                  // ver DsrRequestType
  description       String?   @db.Text
  status            String    @default("pending_verification")
                                                            // pending_verification | open | in_progress | completed | rejected
  verificationToken String?   @unique
  verifiedAt        DateTime?
  resolvedAt        DateTime?
  resolutionNote    String?   @db.Text
  ipHash            String?
  userAgent         String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([email])
  @@index([status])
  @@index([createdAt])
  @@map("data_subject_requests")
}
```

### 5.3 Fluxo de verificação (magic link, TTL 24h)

```
[1] Titular preenche form em /lgpd/solicitar
    → POST /api/v1/dsr/request
    → Backend: cria DSR com status='pending_verification'
              gera verificationToken = randomBytes(32).hex
              envia e-mail com link /lgpd/verificar?token=<token>
    → 201 Created (não revela se e-mail existe — anti-enumeração)

[2] Titular clica no link (até 24h)
    → GET /api/v1/dsr/verify?token=<token>
    → Backend: valida idade <24h, marca status='open' + verifiedAt
              limpa verificationToken (uso único)

[3] Admin atende em /admin/lgpd/solicitacoes
    → GET /api/v1/dsr/requests       (lista paginada)
    → GET /api/v1/dsr/requests/:id   (detalhe)
    → GET /api/v1/dsr/requests/:id/export       (download JSON de PII)
    → POST /api/v1/dsr/requests/:id/anonymize   (executa anonimização)
    → PATCH /api/v1/dsr/requests/:id            (status + resolutionNote)
```

### 5.4 Geração de token

```ts
import crypto from 'node:crypto'
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')  // 64 chars hex
}

// Verificação
async function verifyDsrToken(token: string) {
  const row = await prisma.dataSubjectRequest.findUnique({ where: { verificationToken: token } })
  if (!row) return null
  if (Date.now() - row.createdAt.getTime() > VERIFICATION_TTL_MS) return null
  if (row.status !== 'pending_verification') return row // idempotente

  return prisma.dataSubjectRequest.update({
    where: { id: row.id },
    data: { status: 'open', verifiedAt: new Date(), verificationToken: null },
  })
}
```

### 5.5 Anonimização determinística

**Princípio**: substituir PII por hashes determinísticos em vez de **deletar a linha**. Mantém integridade de FKs e agregados históricos.

```ts
// LGPD_ANON_SALT — gerado uma vez por ambiente, NUNCA muda
// (mudar invalida idempotência: mesmo email → hashes diferentes ao longo do tempo)
function anonHash(value: string): string {
  return crypto
    .createHash('sha256')
    .update(`${value.toLowerCase().trim()}:${env.LGPD_ANON_SALT}`)
    .digest('hex')
    .slice(0, 32)
}

async function anonymizeByEmail(email: string) {
  const normalized = email.toLowerCase().trim()
  const hashedEmail = `anon-${anonHash(normalized)}@anon.your-domain.local`
  const hashedName = `anon-${anonHash(normalized).slice(0, 8)}`

  const leads = await prisma.lead.findMany({ where: { email: normalized } })

  for (const lead of leads) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        name: hashedName,
        email: hashedEmail,
        phone: lead.phone ? `anon-${anonHash(lead.phone).slice(0, 12)}` : null,
        message: null,         // mensagem livre = alto risco de PII embutida
      },
    })
  }
  return { leadsAnonymized: leads.length }
}
```

**Por que `anon-...@anon.your-domain.local`?**
- Mantém validação de e-mail no schema (formato válido)
- TLD `.local` nunca resolve DNS → nunca acidentalmente envia e-mail
- Prefix `anon-` facilita filtros e detecção de linhas anonimizadas

### 5.6 Export de PII (portabilidade — art. 18, V)

```ts
async function exportPiiByEmail(email: string) {
  const normalized = email.toLowerCase().trim()
  const [leads, consents, dsrs] = await Promise.all([
    prisma.lead.findMany({ where: { email: normalized }, include: { notes: true } }),
    prisma.consentLog.findMany({ where: { userIdHash: anonHash(normalized) } }),
    prisma.dataSubjectRequest.findMany({ where: { email: normalized } }),
  ])
  return {
    exportedAt: new Date().toISOString(),
    subject: { email: normalized },
    leads, consentLogs: consents, dataSubjectRequests: dsrs,
  }
}
```

Servido como download JSON via:
```ts
res.setHeader('Content-Type', 'application/json')
res.setHeader('Content-Disposition', `attachment; filename="dsr-${dto.id}.json"`)
res.send(JSON.stringify(data, null, 2))
```

### 5.7 Rate limits

```ts
const publicLimiter = rateLimit({ windowMs: 60*60*1000, max: 5 })   // 5/h/IP em POST
const verifyLimiter = rateLimit({ windowMs: 5*60*1000, max: 30 })   // 30/5min em GET
```

### 5.8 Anti-bot

- **Mínimo viável**: header opcional `x-lgpd-form-secret` validado contra env var
- **Recomendado**: Cloudflare Turnstile ou hCaptcha no form público
- **Avançado**: rate limit por fingerprint de browser

### 5.9 RBAC no admin

Gating com `requirePermission('lgpd', 'view'|'edit')`:
- `lgpd:view` → listar + ler detalhes
- `lgpd:edit` → export PII, executar anonimização, alterar status

---

## 6. Fase F — Worker de Retenção (BullMQ)

### 6.1 Política de retenção típica

| Tabela | Coluna de data | Cutoff | Ação |
|---|---|---|---|
| `analytics_events` | `receivedAt` | 12 meses | DELETE |
| `analytics_realtime` | `createdAt` | 7 dias | DELETE |
| `leads` (não-anonimizados) | `createdAt` + último contato | 5 anos | **anonimizar** (não deletar) |
| `consent_logs` | `createdAt` | 5 anos | DELETE |
| `data_subject_requests` (status=completed) | `resolvedAt` | 5 anos | DELETE |
| `audit_logs` | `createdAt` | 6 anos | DELETE |

### 6.2 Esqueleto do worker

```ts
// backend/src/workers/data-retention.worker.ts
import { Queue } from 'bullmq'
import { registerWorker } from '../lib/queue'
import { prisma } from '../lib/prisma'
import { logger } from '../config/logger'

const QUEUE = 'data-retention'
const DAY = 24 * 60 * 60 * 1000

const queue = new Queue(QUEUE, { connection: redisConnection })

// Repeatable job — diário às 03:00 BRT
export async function scheduleRetention() {
  await queue.add('run', {}, {
    repeat: { pattern: '0 3 * * *', tz: 'America/Sao_Paulo' },
    jobId: 'retention-daily',
  })
}

registerWorker(QUEUE, async () => {
  const now = Date.now()

  // 1. Analytics events > 12 meses
  const analyticsRes = await prisma.analyticsEvent.deleteMany({
    where: { receivedAt: { lt: new Date(now - 365 * DAY) } },
  })

  // 2. Realtime > 7 dias
  const realtimeRes = await prisma.analyticsRealtime.deleteMany({
    where: { createdAt: { lt: new Date(now - 7 * DAY) } },
  })

  // 3. Leads stale > 5 anos — anonimizar (NÃO deletar)
  const staleLeads = await prisma.lead.findMany({
    where: {
      createdAt: { lt: new Date(now - 5 * 365 * DAY) },
      email: { not: { startsWith: 'anon-' } },
    },
    select: { email: true },
  })
  const uniqueEmails = [...new Set(staleLeads.map(l => l.email))]
  for (const email of uniqueEmails) {
    await anonymizeByEmail(email)
  }

  // 4. Consent logs > 5 anos
  const consentRes = await prisma.consentLog.deleteMany({
    where: { createdAt: { lt: new Date(now - 5 * 365 * DAY) } },
  })

  // 5. DSR completed > 5 anos
  const dsrRes = await prisma.dataSubjectRequest.deleteMany({
    where: {
      status: { in: ['completed', 'rejected'] },
      resolvedAt: { lt: new Date(now - 5 * 365 * DAY) },
    },
  })

  logger.info({
    analytics: analyticsRes.count,
    realtime: realtimeRes.count,
    leadsAnonymized: uniqueEmails.length,
    consents: consentRes.count,
    dsr: dsrRes.count,
  }, 'Data retention sweep complete')
})
```

### 6.3 Pegadinhas

- **`receivedAt` vs `createdAt`**: tabelas de analytics frequentemente usam `receivedAt` (server timestamp). Use a coluna correta — usar `createdAt` em tabela que só tem `receivedAt` quebra o worker silenciosamente.
- **`await worker.run()` em BullMQ v5**: **NUNCA** await em `worker.run()` durante boot. O worker é background e bloqueia o startup. Apenas registrar o handler.
- **Idempotência**: rodar 2× no mesmo dia não deve causar dano — `deleteMany` é seguro, mas `anonymizeByEmail` filtra `email: { not: { startsWith: 'anon-' } }` para evitar re-hash.
- **Cron timezone**: usar `tz: 'America/Sao_Paulo'` em vez de UTC para evitar surpresa no horário de verão (não tem mais BR, mas operacionalmente 03:00 BRT é o esperado).

---

## 7. Variáveis de Ambiente

```bash
# Frontend público (Astro/Next — PUBLIC_*)
PUBLIC_API_URL=https://api.example.com
PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXX
PUBLIC_CLARITY_PROJECT_ID=xxxxxxxxx
PUBLIC_FB_PIXEL_ID=000000000000000
PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX

# Backend
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# LGPD-specific
IP_HASH_SALT=<openssl rand -hex 32>            # hash de IP em consent_logs
LGPD_ANON_SALT=<openssl rand -hex 32>          # hash determinístico em anonimização
LGPD_FORM_SECRET=<opcional, header anti-bot>
FRONTEND_PUBLIC_URL=https://example.com        # usado em magic links
DPO_EMAIL=dpo@example.com

# Mailer (para magic links DSR)
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM='"Example LGPD" <no-reply@example.com>'
```

**⚠️ Backup dos salts:** ambos `IP_HASH_SALT` e `LGPD_ANON_SALT` devem ser:
1. Gerados **uma vez** por ambiente (prod, staging)
2. Armazenados em gerenciador de segredos (1Password, AWS Secrets Manager)
3. **Nunca rotacionados** — rotação invalida toda anonimização passada
4. **Nunca commitados** — `.env.production` chmod 600

---

## 8. URLs/rotas públicas no site

```
GET /politica-de-privacidade
GET /politica-de-cookies
GET /termos-de-uso
GET /lgpd/solicitar              → form DSR
GET /lgpd/verificar?token=...    → confirma magic link
```

E o link permanente no rodapé:
```html
<a href="#" onclick="window.reopenConsent()">Gerenciar cookies</a>
```

---

## 9. Smoke test (E2E)

```bash
#!/usr/bin/env bash
# lgpd-smoke.sh
set -eu
BASE_URL=${BASE_URL:-https://example.com}
API_URL=${API_URL:-https://api.example.com}

echo "1. Páginas legais acessíveis"
for path in politica-de-privacidade politica-de-cookies termos-de-uso; do
  code=$(curl -sIo /dev/null -w "%{http_code}" "$BASE_URL/$path")
  [ "$code" = "200" ] || { echo "FAIL: /$path → $code"; exit 1; }
done

echo "2. POST /v1/consent (accept-all)"
curl -sf -X POST "$API_URL/api/v1/consent" \
  -H 'Content-Type: application/json' \
  -d '{"categories":{"necessary":true,"functional":true,"analytics":true,"marketing":true},"policyVersion":"1.0","source":"banner_accept_all"}' \
  | grep -q '"status":"ok"'

echo "3. POST /v1/dsr/request (rate limit OK)"
curl -sf -X POST "$API_URL/api/v1/dsr/request" \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","requestType":"access","description":"smoke test"}' \
  | grep -q '"status":"ok"'

echo "✅ LGPD smoke OK"
```

---

## 10. Checklist de adoção (copy-paste)

### Fase A — Legal
- [ ] Razão social + CNPJ + endereço identificados
- [ ] DPO nomeado (e-mail + telefone)
- [ ] Política de Privacidade redigida + revisada por advogado
- [ ] Política de Cookies com tabela canônica
- [ ] Termos de Uso (se houver área logada)
- [ ] ROPA preenchido para cada processo
- [ ] LIA preenchido para usos de legítimo interesse
- [ ] Incident Response Plan documentado
- [ ] DPA Checklist para cada operador (Google, Meta, MS, etc.)

### Fase B — Banner
- [ ] Componente `CookieConsent` com 3 ações de peso equivalente
- [ ] Modal granular com 4 categorias
- [ ] Persistência em localStorage com `version` + `timestamp`
- [ ] Função global `window.reopenConsent()` exposta
- [ ] Link "Gerenciar cookies" no rodapé

### Fase C — Loader
- [ ] `gtag('consent','default',{... denied ...})` no `<head>`
- [ ] Loader escutando `app:consent` + boot via localStorage
- [ ] Cada script (GA4/Clarity/Pixel/GTM) com guard de dupla injeção
- [ ] Verificar no DevTools: nenhum request para `googletagmanager.com` antes do consent

### Fase D — Consent endpoint
- [ ] Tabela `consent_logs` criada
- [ ] `IP_HASH_SALT` gerado e em vault
- [ ] `POST /api/v1/consent` com Zod + rate limit
- [ ] Schema compartilhado em `@yourorg/shared`

### Fase E — DSR
- [ ] Tabela `data_subject_requests` criada
- [ ] `LGPD_ANON_SALT` gerado e em vault
- [ ] Endpoints público (request + verify) + admin (list/get/patch/export/anonymize)
- [ ] Página pública `/lgpd/solicitar` + `/lgpd/verificar`
- [ ] Admin `/lgpd/solicitacoes` com RBAC
- [ ] Email de magic link com TTL 24h

### Fase F — Retenção
- [ ] Worker BullMQ registrado com cron diário `0 3 * * *` America/Sao_Paulo
- [ ] Lógica de delete para analytics + consents + dsr resolvidos
- [ ] Lógica de **anonimização** (não delete) para leads stale
- [ ] Testes Jest cobrindo cada categoria de retenção
- [ ] `worker.run()` **não** awaited no boot

### Operação
- [ ] Smoke `lgpd-smoke.sh` rodando no CI/CD pós-deploy
- [ ] Ata de nomeação do DPO assinada e arquivada
- [ ] Backup dos salts em 2 gerenciadores de segredos
- [ ] Revisão jurídica das políticas pré-publicação

---

## 11. Pegadinhas conhecidas (do projeto AUMAF 3D)

1. **Salt rotation = perda de idempotência.** Rotacionar `LGPD_ANON_SALT` faz o mesmo e-mail virar 2 hashes distintos em momentos diferentes — o worker re-anonimiza linhas já anonimizadas. **Trate como chave master: gerar uma vez, backup em 1Password, nunca mudar.**

2. **BullMQ v5 + `await worker.run()`**: bloqueia o boot. O scheduler nunca é chamado, retenção nunca roda. Use apenas `registerWorker(...)`.

3. **Analytics events sem `createdAt`**: usar `receivedAt`. Tabelas `*_realtime` ou `*_events` raramente seguem o padrão Prisma default.

4. **`PUBLIC_API_URL` build-time vs runtime**: em Astro/Next, vars `PUBLIC_*` são embedded no build. Definir como **build-arg** no Dockerfile, não só env runtime.

5. **`og:image` SVG não renderiza no WhatsApp**: para páginas legais com SEO próprio, usar PNG 1200×630.

6. **CreateLeadSchema sem campos extras**: ao adicionar contexto ao lead (material, empresa, arquivo), embedar em `message` em vez de criar colunas novas — facilita anonimização (mata `message` zera tudo de uma vez).

7. **`keepalive: true` no fetch do consent**: garante POST mesmo durante page unload. Sem isso, ~5% dos consents do mobile se perdem.

8. **CNPJ obrigatório no rodapé** mesmo que invisível ao usuário comum — exigência da ANPD para identificação do controlador.

---

## 12. Referências

- [Lei nº 13.709/2018 — LGPD](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709.htm)
- [Guia ANPD — Tratamento de Dados Pessoais](https://www.gov.br/anpd/pt-br)
- [Google Consent Mode v2](https://developers.google.com/tag-platform/security/guides/consent)
- [WP29 Guidelines on Consent](https://ec.europa.eu/newsroom/article29/items/623051) (referência GDPR, aplicável por analogia)

---

**Versão deste playbook:** 1.0 — 2026-05-16
**Baseado em:** AUMAF 3D PR #42 (merge `feat/lgpd-compliance` → master, 2026-05-12)
