# Status — instagram-feed

**Slug**: `2026-05-10-instagram-feed`
**Iniciado**: 2026-05-10
**Última atualização**: 2026-05-10 20:20 GMT-3
**Estado atual**: `implementation-complete` — código pronto e validado em build local; aguardando apenas `FEED_ID` da Behold + secret no GitHub.

---

## Pipeline SDD

- [x] **constitution** — herdada de `docs/specs/constitution.md`
- [x] **specify** — `requirements.md`
- [x] **clarify** — 4 decisões fechadas (conta intermediária, home+contato, 8 posts, tipo de conta a confirmar)
- [x] **plan** — `design.md` (revisado para frontend-only)
- [x] **tasks** — `tasks.md`
- [x] **implement** — Phase 1+2+3 completas
- [ ] **validate** — pendente Phase 0 (FEED_ID) + smoke produção
- [ ] **retrospective** — pendente fechamento

## O que foi entregue nesta sessão

1. **`frontend-public/src/lib/instagram.ts`** — service com fetch Behold + cache memória TTL 1h + helpers, mesmo padrão do `google-reviews.ts`.
2. **`frontend-public/src/components/instagram/InstagramFeed.astro`** — componente único parametrizado por `variant: 'home' | 'contato'`, grid responsivo, fallback silencioso.
3. **Pontos de inserção**:
   - `index.astro` linha ~1240, entre Reviews e CTA final.
   - `contato.astro` linha ~343, após o form e antes do bloco "WhatsApp direto".
4. **Wiring de env**:
   - `frontend-public/.env.example` com `PUBLIC_BEHOLD_FEED_ID=` + comentário.
   - `deploy/Dockerfile.frontend-public` com `ARG`/`ENV` (default vazio, build não quebra).
   - `.github/workflows/cd.yml` com `build-args` puxando `secrets.PUBLIC_BEHOLD_FEED_ID`.
5. **Validações locais**:
   - Typecheck Astro: 42 arquivos, 0 errors / 0 warnings.
   - Build: 7s, todas as 30+ rotas geradas.
   - HTML sem FEED_ID: zero `<section>` Instagram renderizada (degradação silenciosa confirmada).
   - Bundle JS público mantido em 2.25 KB / 1.01 KB gzipped — zero regressão.

## Decisões importantes durante a execução

| # | Decisão | Por quê |
|---|---------|---------|
| Rev-1 | **Drop do backend service planejado em D1 original** | Google Reviews já roda exatamente o mesmo padrão (frontend cache in-memory) em produção; adicionar Redis no backend duplicava infra para zero ganho real em 1 instância. Trocar para Redis no futuro é diff de ~10 linhas. |
| Rev-2 | **Componente único parametrizado vs dois componentes** | `variant` prop reduz duplicação e mantém visual consistente entre os 2 pontos de inserção. |
| Rev-3 | **CSS scoped no `<style>` vs Tailwind utility-first** | Grid + snap mobile exigiam media queries cirúrgicas que ficariam ilegíveis com classes Tailwind aninhadas; CSS scoped (~1.2 KB) é mais auditável aqui. |
| Rev-4 | **Default vazio em ARG do Dockerfile** | Garante que o build do CI não quebre mesmo se o secret ainda não tiver sido cadastrado no GitHub — feature degrada silenciosamente até o secret existir. |

## Bloqueios atuais

- 🔴 **IG-001 + IG-002** (Kayo): confirmar tipo de conta `@aumaf3d` + criar conta Behold.so + colher `FEED_ID`.
- 🟡 **IG-040** (Kayo): cadastrar secret `PUBLIC_BEHOLD_FEED_ID` no GitHub via `gh secret set`.

Depois disso, basta abrir PR e merge.

## Próxima ação

Kayo executa Phase 0 (IG-001 → IG-003) e Phase 4 (IG-040 → IG-043). Total ~30 min humanos + tempo de pipeline CD.

## Referências cruzadas

- Roadmap original: `docs/plans/2026-05-09-roadmap-instagram-feed.md`
- Padrão de integração externa (mesma régua): `frontend-public/src/lib/google-reviews.ts`
- Memória de releases recentes: `release_20260510_mobile_ux_and_quote_flow.md`, `release_20260509_polish_iter*.md`
- Pegadinha `PUBLIC_*` build-arg: `fix_botyio_test_and_public_api_url.md`
