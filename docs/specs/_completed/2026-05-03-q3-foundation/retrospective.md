# Q3 Foundation — Retrospective

**Concluído em:** 2026-05-03
**PR:** [#6 — Q3 Foundation — BullMQ + Storybook + QA + Ops handover](https://github.com/kayorid/aumaf-3d-site/pull/6)
**Merge commit:** a34f709
**Commits granulares:** 14
**Duração:** ~2h (kickoff → merge)

---

## O que foi entregue

| Pilar | Status |
|-------|--------|
| BullMQ Foundation (redis singleton, queue/worker factories, registry, graceful shutdown) | ✅ |
| Worker `lead-notification` + email service (3 transports: console/smtp/stub) | ✅ |
| Worker `post-publish-cache` (warm-up SSR Astro) | ✅ |
| `GET /health` agregado (DB + Redis + queues) com 200/503 | ✅ |
| Storybook tematizado Cinematic + a11y + 9 stories files (UI + DS + Tokens) | ✅ |
| 36 testes Jest backend + 35 Vitest admin + 3 specs Playwright novos | ✅ |
| `scripts/smoke-test.sh` + 2 runbooks operacionais | ✅ |
| CLAUDE.md atualizado em 3 níveis + INDEX.md SDD | ✅ |

## O que ficou fora (intencional)

- 🚫 **Deploy em produção** — depende de decisão da AUMAF sobre provider (Vercel/Railway/Render). Spec separada quando o provider for fixado.
- 🚫 **Integração efetiva com Botyo** — API ainda em construção pela contraparte. Spec de contrato já redigida em `docs/integrations/botyo-lead-journey.md`. BullMQ entregue nesta iteração já viabiliza a futura worker `botyo-lead-sync` sem novas fundações.

## O que aprendi

### Wins
- **Bug real detectado pelos próprios testes**: `createQueue` em `lib/queue.ts` tinha ordem de spread errada (`...opts` sobrescrevia `defaultJobOptions` merged). Sem o teste de override de defaults isso teria ido para produção. Lesson: **escrever testes de comportamento contra-intuitivo paga** mesmo em utilities pequenas.
- **Side-effect import pattern em `workers/register.ts`** funcionou bem — adicionar worker = adicionar import; nenhum site adicional precisa editar.
- **Email transport `console` em dev** zerou a fricção: nada para configurar localmente, e o payload completo vai pro stdout do backend. Para o SMTP em prod fica lazy-import (não pesa devDeps).
- **Stories de tokens vivas** (Foundation/Tokens) — reusam classes Tailwind reais; qualquer mudança no `tailwind.config.ts` aparece automaticamente. Designers podem usar como referência sem depender de extração manual.

### Frictions
- **Vitest 4 é rigoroso com unhandled rejections** mesmo quando `useMutation` tem `onError` handler. Solução foi configurar `QueryCache`/`MutationCache` com `onError: () => {}` e usar `mutate(..., { onError })` ao invés de `mutateAsync`. Documentei em `test/test-utils.tsx`.
- **`gcTime: 0` no test client removia data invalidado antes da assertion** em `useMutation.onSuccess` que chama `setQueryData` + `invalidateQueries`. Fix: `gcTime: Infinity` no test.
- **Schema Zod compartilhado exigia `featured` + `tags`** em `CreatePostInput` — tests precisaram fornecer; tipagem do `@aumaf/shared` salvou na hora do typecheck.

## Decisões registradas (vão para futuras specs)

| Decisão | Razão | Substituível por |
|---------|-------|-------------------|
| Workers no mesmo processo Express | 1 servidor pequeno em prod inicial; ops simples | Processo separado quando volume justificar (mover `bootWorkers` para outro entry) |
| Cache warm-up por GET HTTP do site público | Astro SSR aquece cache server-side de graça | Webhook custom com payload ao invés de full GET |
| Email transport stub fallback em prod sem SMTP | Não bloqueia go-live | SMTP real configurado pela AUMAF quando necessário |
| Health endpoint canônico em `/health` + alias `/api/health` | Compat com chamadas legadas existentes | Remover alias quando confirmado que ninguém chama |
| Storybook só para `frontend-admin` | Regra absoluta: `frontend-public/` continua bloqueado por iteração | Stories Astro quando o site público pedir refactor |

## Próximos passos imediatos

1. **Aguardar API Botyo** — quando pronta, criar spec `botyo-integration` que consome a fundação BullMQ deste PR.
2. **Aguardar decisão de provider de deploy** — quando definida, criar spec `deploy-pipeline`.
3. **Trocar `ADMIN_PASSWORD`** antes do go-live (ainda hardcoded como `AumafAdmin2026!` no `.env`).
4. **Configurar SMTP real** em prod quando notificações forem para email real.

## Métricas

| Métrica | Valor |
|---------|-------|
| Arquivos criados | 38 |
| Arquivos modificados | 9 |
| Linhas adicionadas | ~3500 |
| Commits | 14 (granulares) |
| Tests adicionados | +71 (36 Jest + 35 Vitest) |
| Stories adicionadas | 9 arquivos (~30 stories) |
| E2E specs adicionados | 3 |
| Bugs encontrados pelos próprios testes | 1 (queue defaults override) |
