# Q3 Foundation — Tasks

> Cada task tem critério de pronto observável. Tag `[P]` indica paralelizável.

## Fase 1 — BullMQ Foundation

- [ ] **T1.1** `lib/redis.ts` — IORedis singleton com `createIORedis()` que aplica `maxRetriesPerRequest=null` (exigido por BullMQ workers) e log de eventos `connect/error/close`. **Pronto:** `import { redis } from './lib/redis'` retorna client conectado e `redis.ping()` retorna `PONG`.
- [ ] **T1.2** `lib/queue.ts` — exports `createQueue<T>(name)` e `createWorker<T>(name, processor, opts)`. Defaults: `attempts: 3`, `backoff exponential`, `removeOnComplete: 50`, `removeOnFail: 100`. **Pronto:** unit test cria queue, enfileira job, worker processa.
- [ ] **T1.3** `workers/index.ts` — registry `registerWorker(name, worker)`, `bootWorkers()` e `shutdownWorkers(timeoutMs)`. **Pronto:** server.ts chama bootWorkers; logs mostram cada worker pronto.
- [ ] **T1.4** Atualizar `server.ts` — chamar `bootWorkers()` após Express listen; SIGTERM/SIGINT chamam `shutdownWorkers()` antes de fechar HTTP. **Pronto:** `kill -TERM <pid>` faz graceful shutdown sem leak.

## Fase 2 — Workers

- [ ] **T2.1** `services/email.service.ts` — interface `EmailMessage` + função `send(msg)`. Transport selecionado por env: `console` (dev), `smtp` (prod com `EMAIL_SMTP_HOST` set), `stub` (prod sem SMTP, log warn). **Pronto:** unit test cobre os 3 transports.
- [ ] **T2.2** `workers/lead-notification.worker.ts` — processa job `{leadId}`, busca lead, formata email, chama `emailService.send`. Fail visível no log Pino. **Pronto:** Jest test com lead mock + email mock.
- [ ] **T2.3** Hook `lead.service.createLead` — após salvar, `leadNotificationQueue.add('notify', {leadId: lead.id})`. **Pronto:** integration test cria lead → job enfileirado.
- [ ] **T2.4** `workers/post-publish.worker.ts` — processa job `{postId, slug}`, chama `fetch` para `/blog` e `/blog/:slug`. Erro vira log warn (não falha). **Pronto:** Jest test com fetch mock.
- [ ] **T2.5** Hook `post.service.publishPost` — após DRAFT→PUBLISHED, enfileirar. **Pronto:** publishPost test verifica enqueue.

## Fase 3 — Health & Shutdown

- [ ] **T3.1** `routes/health.routes.ts` — GET `/health` agrega DB ping + Redis ping + counts BullMQ. **Pronto:** curl /health retorna JSON 200.
- [ ] **T3.2** Erro em qualquer service → 503 com mesmo schema. **Pronto:** unit test com mock falhando.
- [ ] **T3.3** Atualizar `app.ts` para registrar `/health` antes de auth middleware. **Pronto:** /health acessível sem JWT.

## Fase 4 — Tests Backend [P]

- [ ] **T4.1** Adicionar `ioredis-mock` ao backend devDeps. **Pronto:** `npm i` ok.
- [ ] **T4.2** Test queue factory + worker básico. **Pronto:** Jest verde.
- [ ] **T4.3** Test lead-notification worker E2E (in-memory). **Pronto:** Jest verde.
- [ ] **T4.4** Test post-publish worker com fetch mock. **Pronto:** Jest verde.
- [ ] **T4.5** Test health endpoint (mock prisma + redis). **Pronto:** Jest verde.

## Fase 5 — Storybook

- [ ] **T5.1** `.storybook/preview.tsx` — wrapper que importa Tailwind, aplica classes do `body` admin (`bg-bg-deep text-text-strong`), fonts. Background dark default no parameters. **Pronto:** `storybook dev` mostra UI no tema correto.
- [ ] **T5.2** `.storybook/main.ts` — addons: docs, a11y, vitest. Stories glob `src/**/*.stories.@(ts|tsx|mdx)`. **Pronto:** Storybook reconhece stories.
- [ ] **T5.3** `[P]` Stories `Button` — variants (default, secondary, destructive, ghost), sizes, states (loading, disabled). **Pronto:** docs page com matrix.
- [ ] **T5.4** `[P]` Stories `Input`, `Label`, `Textarea`. **Pronto:** docs page.
- [ ] **T5.5** `[P]` Stories `Select`, `Dialog`, `Card`, `Badge`. **Pronto:** docs page.
- [ ] **T5.6** `[P]` Stories `KpiCard` (do dashboard) — variants com/sem trend. **Pronto:** docs page.
- [ ] **T5.7** `[P]` Stories `BlockPreview` — uma por tipo (HeroBlock, FeatureBlock, etc.). **Pronto:** docs page.
- [ ] **T5.8** `[P]` Story `Foundation/Tokens` — paleta, tipografia, spacing. **Pronto:** página visual completa.

## Fase 6 — E2E [P]

- [ ] **T6.1** `e2e/posts.spec.ts` — login → criar post Markdown → publicar → buscar via API pública. **Pronto:** Playwright verde.
- [ ] **T6.2** `e2e/leads.spec.ts` — criar lead via POST /api/leads → admin lista → máscara aplicada. **Pronto:** Playwright verde.
- [ ] **T6.3** `e2e/wysiwyg.spec.ts` — abrir post → inserir bloco do menu → editar campos no modal → salvar → preview reflete. **Pronto:** Playwright verde.

## Fase 7 — Vitest [P]

- [ ] **T7.1** Test `useGeneratePost` hook com MSW. **Pronto:** Vitest verde.
- [ ] **T7.2** Test `useCreatePost`/`useUpdatePost` com MSW. **Pronto:** Vitest verde.
- [ ] **T7.3** Test `BlockPreview` rende corretamente cada tipo de bloco. **Pronto:** Vitest verde.
- [ ] **T7.4** Test `markdownToHtml`/`htmlToMarkdown` round-trip com blocos DS. **Pronto:** Vitest verde.
- [ ] **T7.5** Test `KpiCard` renderiza valores e formata trend. **Pronto:** Vitest verde.

## Fase 8 — Smoke + Docs

- [ ] **T8.1** `scripts/smoke-test.sh` — checks DB up, backend /health, public 200, admin login + dashboard. **Pronto:** `bash scripts/smoke-test.sh` retorna 0 com tudo de pé.
- [ ] **T8.2** `docs/runbooks/local-development.md` — setup zero-to-running. **Pronto:** roteiro coberto.
- [ ] **T8.3** `docs/runbooks/operational-handover.md` — backup, restore, rotação JWT, troubleshoot comum. **Pronto:** seções cobertas.
- [ ] **T8.4** Atualizar `CLAUDE.md` (root + backend + frontend-admin). **Pronto:** docs refletem novidades.
- [ ] **T8.5** `docs/specs/INDEX.md` — adicionar Q3 foundation. **Pronto:** índice atual.

## CHECKPOINT — pre-PR

- [ ] **CK1** `npm run typecheck` em todos workspaces — verde
- [ ] **CK2** `npm run build` — verde (turbo)
- [ ] **CK3** `npm run test` (jest+vitest) — verde
- [ ] **CK4** `npm run test:e2e` no admin — verde
- [ ] **CK5** `npm run build-storybook` — verde
- [ ] **CK6** `bash scripts/smoke-test.sh` com stack rodando — verde
- [ ] **CK7** push branch + PR aberto

---

## Mapeamento Tasks → Commits granulares

| Commit | Tasks |
|--------|-------|
| C1 — `docs(spec): kickoff Q3 foundation` | spec files |
| C2 — `feat(backend): BullMQ foundation (redis + queue + workers registry)` | T1.1–T1.4 |
| C3 — `feat(backend): lead-notification worker + email service` | T2.1–T2.3 |
| C4 — `feat(backend): post-publish cache warm-up worker` | T2.4–T2.5 |
| C5 — `feat(backend): health endpoint + graceful shutdown` | T3.1–T3.3 |
| C6 — `test(backend): Jest cobertura para queue/workers/health/email` | T4.1–T4.5 |
| C7 — `feat(admin): Storybook tematizado Cinematic + a11y` | T5.1–T5.2 |
| C8 — `feat(admin): stories componentes UI base` | T5.3–T5.6 |
| C9 — `feat(admin): stories BlockPreview + Foundation/Tokens` | T5.7–T5.8 |
| C10 — `test(e2e): cobertura Playwright posts/leads/wysiwyg` | T6.1–T6.3 |
| C11 — `test(admin): cobertura Vitest hooks/components/parsers` | T7.1–T7.5 |
| C12 — `chore(scripts+docs): smoke test + runbooks` | T8.1–T8.3 |
| C13 — `docs: CLAUDE.md + INDEX.md SDD` | T8.4–T8.5 |
