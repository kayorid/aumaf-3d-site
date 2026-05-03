# Q3 Foundation — Requirements

**Slug:** `2026-05-03-q3-foundation`
**Iteração:** Q3 (sem 5–6) — fundações pré-deploy
**Início:** 2026-05-03
**Estado:** specify → clarify → plan → tasks → implement (em curso)
**Owner:** kayoridolfi.ai

---

## Visão de Negócio

Após Q1 (site público) e Q2 (backoffice + blog), o projeto AUMAF 3D precisa **fechar fundações operacionais** antes do deploy de produção e da integração com Botyo. Esta iteração entrega a infraestrutura de filas (para futuras integrações assíncronas), a biblioteca de componentes documentada (Storybook), e a cobertura de testes que sustenta entrega segura.

**Fora desta iteração:** deploy em produção e integração efetiva com Botyo (ambos dependem de credenciais externas que ainda não estão disponíveis — Botyo está em construção pela contraparte).

## User Stories

### US-1 — Fila assíncrona pronta para produção
> Como **operador da plataforma**, quero que ações longas (notificação de leads, warm-up de cache) executem **fora do request HTTP**, para que o usuário tenha resposta imediata e o sistema fique resiliente a picos.

### US-2 — Notificação automática de novos leads
> Como **administrador AUMAF**, quero ser notificado automaticamente toda vez que um novo lead chega pelo site, para que nenhuma oportunidade comercial passe despercebida.

### US-3 — Cache do blog quente após publicação
> Como **leitor do blog público**, quero que posts recém-publicados estejam **disponíveis imediatamente** sem latência de cold-start de SSR, para uma experiência fluida.

### US-4 — Componentes documentados e testáveis
> Como **freelancer entregando o projeto**, quero **Storybook** com todos os componentes do admin documentados, para que manutenção futura (R$150/mês) seja barata e onboarding de qualquer pessoa seja rápido.

### US-5 — Cobertura de testes de fluxos críticos
> Como **dono do projeto (AUMAF)**, quero que os fluxos críticos (login, criar/publicar post, capturar lead, editar bloco WYSIWYG) sejam **testados automaticamente**, para que regressões em manutenções futuras sejam detectadas antes do deploy.

### US-6 — Smoke test e handover
> Como **mantenedor pós-entrega**, quero um **script único** que verifica saúde de todos os serviços e documentação operacional clara, para que troubleshooting seja determinístico.

---

## Critérios de Aceitação (EARS)

### R1 — BullMQ Foundation
**Quando** o backend inicia, **então** ele conecta ao Redis e inicializa todos os workers registrados em paralelo, registrando logs estruturados de cada worker pronto.

### R2 — Redis client compartilhado
**Onde** o backend faz qualquer interação com Redis, **então** ele usa um **único cliente IORedis singleton** importado de `lib/redis.ts`, para evitar conexões duplicadas.

### R3 — Queue factory padronizada
**Quando** um worker é criado, **então** ele usa o helper `createWorker` que aplica defaults consistentes (concurrency, attempts, backoff exponencial, removeOnComplete) e logger Pino estruturado.

### R4 — Lead notification worker
**Quando** um lead é criado via `POST /api/leads`, **então** o backend enfileira um job na queue `lead-notification` que (a) envia email/notificação ao admin, (b) loga estrutuadamente e (c) responde 201 ao cliente **sem aguardar** o job (fire-and-forget).

### R5 — Email service multi-transport
**Onde** `NODE_ENV=development`, **então** o email service usa transport **console** (loga payload formatado). **Onde** `EMAIL_SMTP_HOST` está configurado em produção, **então** usa SMTP real. **Se** ambos ausentes em produção, **então** usa transport stub que apenas loga em warn.

### R6 — Post publish cache warm-up
**Quando** um post muda de DRAFT para PUBLISHED, **então** o backend enfileira job `post-publish-cache` que faz GET no site público (`{FRONTEND_PUBLIC_URL}/blog/{slug}` e `/blog`) para aquecer o SSR, com retry 3x e backoff exponencial.

### R7 — Graceful shutdown
**Quando** o processo recebe SIGTERM ou SIGINT, **então** o backend (a) para de aceitar novos requests, (b) finaliza jobs em flight nos workers (com timeout 10s), (c) fecha conexões Redis e Prisma, (d) sai com código 0.

### R8 — Health check robusto
**Quando** o cliente chama `GET /health`, **então** o backend retorna 200 com `{ status: 'ok', services: { db: 'up', redis: 'up', queues: { 'lead-notification': 'active', 'post-publish-cache': 'active' } } }`. Se qualquer dependência estiver down, retorna 503 com detalhes.

### R9 — Storybook tematizado
**Quando** o desenvolvedor roda `npm run storybook`, **então** o Storybook abre em :6006 com **tema escuro Cinematic Additive Manufacturing** aplicado por default (background, fontes, tokens), addon-a11y ativo e Tailwind funcionando.

### R10 — Stories de componentes UI base
**Onde** existe componente em `src/components/ui/`, **então** existe `*.stories.tsx` cobrindo: variants, estados (default, hover, disabled, loading), e exemplo combinado. Cobertura mínima: Button, Input, Label, Textarea, Select, Card, Badge, Dialog, KpiCard.

### R11 — Stories de blocos do design system
**Onde** existe template de bloco no editor (HeroBlock, FeatureBlock, etc.), **então** existe story renderizando cada bloco com props variados, e uma story "playground" que combina todos.

### R12 — Página de tokens
**Onde** existe `docs/design/admin-design-system.md`, **então** existe story `Foundation/Tokens` que exibe paleta, tipografia e spacing extraídos de `tailwind.config.js`, para que designers e devs vejam tokens vivos.

### R13 — E2E posts
**Quando** o admin loga, cria post em Markdown, publica, **então** o post fica disponível em `GET /blog/{slug}` no site público com status 200.

### R14 — E2E leads
**Quando** um lead é criado pelo formulário público (POST `/api/leads`), **então** ele aparece na lista de leads do admin (`/leads`) com máscara correta (`***@dominio.com`).

### R15 — E2E WYSIWYG
**Quando** o admin abre um post existente, insere um bloco do menu "Inserir Bloco", edita seus campos no modal, salva, **então** o conteúdo persiste em Markdown corretamente e o block-preview reflete a edição.

### R16 — Vitest cobertura de hooks
**Onde** existe hook em `src/features/*/api/`, **então** existe teste Vitest com MSW mockando endpoint, validando happy path e erro.

### R17 — Jest cobertura de queue
**Onde** existe worker em `backend/src/workers/`, **então** existe teste Jest com mock de Redis (`ioredis-mock`) validando: enqueue, processamento de job, retry em falha, dead letter após max attempts.

### R18 — Smoke test script
**Quando** o operador roda `bash scripts/smoke-test.sh`, **então** o script verifica: backend `/health` (200), public `/` (200), admin login (auth + dashboard 200), MinIO buckets, DB migrations aplicadas. Sai com código != 0 se qualquer check falhar.

### R19 — Runbook operacional
**Onde** existe `docs/runbooks/`, **então** ele contém: `local-development.md` (subir stack do zero), `operational-handover.md` (rodar/manter em prod básico, troubleshooting, backups, rotação de chaves).

---

## Fora de Escopo (explícito)

- 🚫 Deploy em provider de produção (Vercel/Railway/Fly) — depende de decisão da AUMAF
- 🚫 Integração efetiva com Botyo — API ainda em construção pela contraparte
- 🚫 SMTP/email provider real — usaremos transport console em dev e stub log em prod (substituível depois)
- 🚫 Worker BullMQ específico do Botyo — quando a API estiver pronta, nova spec
- 🚫 Migrations destrutivas — todas as alterações são aditivas

## Boundaries

### ✅ Always
- Workers BullMQ devem registrar logs estruturados Pino com `{queue, jobId, attempts}`
- Senhas e secrets nunca aparecem em logs (mascarar email/phone)
- Toda mutação dispara invalidação dos jobs/cache pertinentes
- Stories Storybook devem usar componentes reais (não mocks visuais)

### ⚠️ Ask first
- Adicionar dependência nova fora do que já está no `package.json`
- Mudar contrato de API existente
- Tocar em `frontend-public/` (escopo bloqueado por iteração anterior)

### 🚫 Never
- `--no-verify` em commits
- Workers fazendo I/O síncrono em volume (sempre usar throttle/concurrency)
- Storybook stories que dependem de backend rodando (mock via MSW se necessário)
- Multi-tenancy ou `tenantId` em qualquer nova entidade

---

## Clarifications

| Pergunta | Resposta |
|----------|----------|
| Email transport real em prod? | Não nesta iteração — transport console (dev) + stub log (prod). SMTP fica para iteração de produção. |
| Botyo nesta iteração? | **Não.** Apenas a fundação BullMQ que será reusada. |
| Storybook deve cobrir Astro público? | **Não** — escopo é apenas frontend-admin (regra `frontend-public/` bloqueado). |
| Cobertura Vitest mínima? | Não fixar % — focar em hooks de api e components críticos (BlockPreview, MarkdownEditor, KpiCard). |
| Testes de carga? | Fora de escopo — manter para iteração de prod. |
| Storage transactional outbox? | Não — fire-and-forget é aceitável agora; outbox vira ADR se Botyo exigir. |
