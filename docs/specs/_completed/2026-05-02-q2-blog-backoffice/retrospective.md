# Retrospective — Q2 Blog Backoffice (Phase 1 + Phase 2)

**Período**: 2026-05-02 → 2026-05-03
**Branches mergeadas**: PR #2 (Phase 1, commit `98b50bb`) + PR #3 (Phase 2, commit `0694652`)
**Status final**: ✅ entregue e validado

## O que foi entregue

### Phase 1
- Backend: auth JWT cookie httpOnly, posts CRUD, leads, upload presigned MinIO, IA multi-provedor (Anthropic/OpenAI/Gemini), métricas
- Admin: Login, Dashboard (4 KPIs), PostsList, PostEditor com Tiptap dual-mode + IA
- 5 telas alinhadas ao DS Cinematic Additive Manufacturing
- MarkdownEditor dual-mode (Visual + Code) com converters caseiros (~450 linhas)

### Phase 2
- **Migração**: 6 posts estáticos `.astro` → banco com 100% de fidelidade visual (Markdown + HTML inline com classes do DS, Tailwind safelist robusto)
- **Blog dinâmico**: `/blog/index.astro` e `/blog/[slug].astro` consumindo API; 16 páginas no build
- **UIs admin**: Leads (filtros + CSV), Settings (3 tabs com regex), Categorias (CRUD com 409), Auto-save (5s debounce)
- **Etapa D postergada para Q3**: BullMQ assíncrono e Storybook stories

## O que funcionou bem

1. **Spec viva como ponto de verdade**: cada decisão foi registrada antes do código (constitution → requirements → design → tasks). Quando voltei aos arquivos da spec depois de 1 dia, o contexto estava completo — sem ambiguidade sobre escopo ou trade-offs.
2. **Faseamento P1 → P2 → Q3**: separar entregas em iterações de ~1 dia cada permitiu commits coerentes e PRs revisáveis (~2 mil linhas por PR em vez de 5+ mil).
3. **Markdown + HTML inline + Tailwind safelist** como estratégia de migração: preservou fidelidade visual integral dos 6 posts sem reinventar sistema de directives/MDX. Trade-off explícito (registrado em `phase-2/design.md` §3.1).
4. **Script de migração idempotente** com `upsert` por slug: rodar 2× não duplica; primeiro lote correto na primeira tentativa.
5. **Endpoints públicos com ETag + Cache-Control**: barato de implementar, abre caminho para CDN sem retrabalho.

## O que foi difícil / pontos de drift evitados

1. **Astro 5 unificou static/hybrid**: descobri tarde no build (após instalar `@astrojs/node@10`). Recuperação: instalar `@astrojs/node@9` (compatível Astro 5) e usar `prerender = true` por página em vez de `output: 'hybrid'`. Documentado nas pegadinhas para futuros projetos.
2. **PublicPostListQuery pageSize cap**: defini max=50 inicialmente; o `getStaticPaths` precisava puxar 100. Aumentei o cap. Lição: caps de paginação devem casar com o consumidor mais agressivo conhecido.
3. **`zodResolver` vs. `useForm` types**: necessário cast `as Resolver<TFormValues>`. Mantido isolado no `PostEditorPage` para não poluir o resto.
4. **`httpErrors.conflict(code, message)`**: assinatura inconsistente com o que escrevi de cabeça (`message, details`). Validado pelo typecheck na primeira tentativa.

## Decisões deliberadas que poderiam ter virado drift

- **Não usar MDX/diretivas remark customizadas** para componentes ricos — escolha pragmática registrada em `requirements.md` Phase 2 (Clarifications). Custou ~2-3 dias evitados; o trade-off é Tailwind safelist mais complexo, mas estável.
- **Não implementar BullMQ na Phase 2** — postergado para Q3 com nota explícita; o ciclo crítico (admin publica → blog reflete) já fecha sem isso.
- **Não tentar ISR custom no Astro 5** — assumi rebuild sob webhook do admin (Q3). Mais simples, mais previsível.

## Métricas pós-feature

| Métrica | Linha de base | Meta P2 | Observado |
|---------|--------------|---------|-----------|
| Posts no `/blog` público | 0 (hardcoded) | 6 (todos editáveis) | ✅ 6 |
| Tempo entre admin publicar e public refletir | ∞ (rebuild manual) | ≤ 60s (com webhook) | ⏳ Q3 (rebuild manual hoje) |
| Conteúdo perdido na migração | — | 0 | ✅ 0 (verificado: 29-33 ocorrências de classes DS por post no HTML output) |
| Build do site público | ~3.4s (Q1 v9) | sem regressão | ✅ ~3s |
| Bundle JS público | 2.25KB (Q1 v9) | sem regressão | ✅ 2.25KB |

## Lições reutilizáveis para futuros projetos

1. **Site público em Astro 5**: usar `output: 'static'` (default) + `prerender = true` por página. Não tente `output: 'hybrid'` — foi removido.
2. **Tailwind safelist em conteúdo dinâmico**: combinar tokens explícitos + patterns de regex. Padrões `(text|bg|border)-cor/(5|8|10|...)` cobrem opacidades sem listar tudo.
3. **Persistir Markdown + HTML inline**: trade-off vale a pena quando o conteúdo já existe com formatação rica e um sistema de diretivas custaria 2-3 dias.
4. **Migração executável > seed manual**: script com `upsert` é rastreável, idempotente e serve de teste do conversor.
5. **`@aumaf/shared` (Zod)** entre backend/admin/public elimina classes inteiras de bugs de DTO.

## Próximos passos (Q3)

- BullMQ assíncrono para IA + SSE/polling de progresso (R-P2-31, R-P2-32)
- Storybook stories dos primitivos do admin (R-P2-33, constituição §5)
- Botyo / WhatsApp (webhook + script flutuante)
- GA4/Clarity/Pixel/GTM IDs reais fornecidos pela AUMAF
- Deploy Hostinger KVM 1 + SSL
- QA cross-browser + Lighthouse final
- Webhook do admin para acionar rebuild do public na publicação (fecha métrica ≤60s)
- Logo SVG real no Navbar/Hero do público

## Boundaries respeitados (harness anti-drift)

- ✅ Preservação 100% do conteúdo dos 6 posts originais
- ✅ Migração idempotente (testada com rerun)
- ✅ Imagens reais do blog no MinIO (não em `frontend-public/public/`)
- ✅ Sem renomear slugs existentes (URLs preservadas)
- ✅ Settings com regex de validação por provedor
- ✅ Auto-save não muda status (não publica/despublica acidentalmente)
- ✅ Sem multi-tenancy
- ✅ JWT em cookie httpOnly (nunca localStorage)
- ✅ Markdown como formato canônico (não HTML)
- ✅ Storybook obrigatório mantido (stories dos novos primitivos pendentes Q3)
