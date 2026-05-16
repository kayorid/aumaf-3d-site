# Tasks — instagram-feed

**Slug**: `2026-05-10-instagram-feed`
**Vinculado a**: `requirements.md`, `design.md`
**Última atualização**: 2026-05-10 — arquitetura simplificada para frontend-only.

---

## Status visual

```
Phase 0 — Setup externo (Kayo)         🔴 BLOQUEADO  (precisa FEED_ID da Behold)
Phase 1 — Implementação frontend       ✅ FEITO
Phase 2 — Wiring env / Docker / CI     ✅ FEITO
Phase 3 — Validação local              ✅ FEITO (typecheck + build verdes)
Phase 4 — Deploy produção              🟡 PRONTO     (espera Phase 0)
Phase 5 — Retrospective                ⏳ PENDENTE
```

---

## Phase 0 — Setup externo (Kayo) ⚠️

### IG-001 🔒 Confirmar tipo da conta `@aumaf3d` ⏳
- Instagram → Configurações → Conta. Deve ser **Business** ou **Creator**.
- Se for Personal, mudar para Profissional → Empresa (mantém posts/seguidores).
- **AC**: confirmado por escrito antes de IG-002.

### IG-002 🔒 Criar conta Behold.so + conectar `@aumaf3d` ⏳
- https://behold.so → criar conta (login Kayo intermediário).
- Conectar Instagram via OAuth — requer admin da página FB vinculada.
- Selecionar `@aumaf3d`; copiar `FEED_ID`.
- **AC**: `curl https://feeds.behold.so/{FEED_ID}` retorna JSON com posts.

### IG-003 Documentar credenciais ⏳
- 1Password: nota "aumaf3d / behold.so" com `FEED_ID`, email/senha intermediários, URL do dashboard.

---

## Phase 1 — Implementação frontend ✅

### IG-010 ✅ Criar `frontend-public/src/lib/instagram.ts`
- `getInstagramFeed()` + `truncateCaption()` + `formatPostDate()`.
- Cache em memória TTL 1h (mesmo padrão `google-reviews.ts`).
- Timeout fetch 3s.
- Filtra `IMAGE | CAROUSEL_ALBUM`, descarta sem thumbnail, ordena por `timestamp DESC`, top 8.
- Aceita 2 formatos de payload Behold (defensivo).
- Fallback silencioso (retorna `null` em qualquer falha).

### IG-011 ✅ Criar `frontend-public/src/components/instagram/InstagramFeed.astro`
- Prop `variant: 'home' | 'contato'` para reuso entre páginas.
- Header com eyebrow + título + descrição + botão "Seguir @aumaf3d" (SVG inline).
- Grid 4×2 desktop / snap 2.5 mobile (CSS scoped, sem dependência Tailwind plugin).
- Badge `collections` em carousels.
- Overlay com caption + hint "Ver no Instagram" (hover desktop; sempre visível mobile).
- `prefers-reduced-motion` respeitado.
- Renderiza zero markup se `posts.length === 0`.

### IG-012 ✅ Inserir `<InstagramFeed variant="home" />` em `index.astro`
- Posicionado entre `<ReviewsHomeWidget />` e a seção CTA final.

### IG-013 ✅ Inserir `<InstagramFeed variant="contato" />` em `contato.astro`
- Posicionado após o `</form>` e antes da seção "WhatsApp direto".

---

## Phase 2 — Wiring de configuração ✅

### IG-020 ✅ Adicionar `PUBLIC_BEHOLD_FEED_ID` em `frontend-public/.env.example`
- Vazio por padrão, com comentário explicativo.

### IG-021 ✅ Atualizar `deploy/Dockerfile.frontend-public`
- `ARG PUBLIC_BEHOLD_FEED_ID=` (default vazio) + `ENV` correspondente no stage `build`.
- Default vazio garante que o build não quebra se o secret não estiver configurado.

### IG-022 ✅ Atualizar `.github/workflows/cd.yml`
- Adicionado `PUBLIC_BEHOLD_FEED_ID=${{ secrets.PUBLIC_BEHOLD_FEED_ID }}` aos `build-args` do step `Build & push frontend-public`.
- **Pendente externo**: criar o secret no GitHub quando o FEED_ID estiver pronto:
  ```bash
  gh secret set PUBLIC_BEHOLD_FEED_ID --body "<uuid-da-behold>"
  ```

---

## Phase 3 — Validação local ✅

### IG-030 ✅ Typecheck frontend-public
- `cd frontend-public && npm run typecheck`
- Resultado: **0 errors, 0 warnings, 0 hints** (42 arquivos).

### IG-031 ✅ Build frontend-public sem FEED_ID
- `cd frontend-public && npm run build`
- Resultado: build completo em ~7s.
- **Verificado**: `dist/client/index.html` e `dist/client/contato/index.html` NÃO contêm `<section class="ig-feed...">` — apenas o CSS scoped (degradação silenciosa funcionando).
- **Bundle JS público inalterado**: `page.js` permaneceu em 2.25 KB / 1.01 KB gzipped — zero regressão.

### IG-032 Smoke manual com FEED_ID real (pendente)
- Necessário após Phase 0 estar concluída.
- Passos:
  1. `echo "PUBLIC_BEHOLD_FEED_ID=<uuid>" >> frontend-public/.env`
  2. `cd frontend-public && npm run dev`
  3. Abrir http://localhost:4321/ — ver seção Instagram com 8 thumbs.
  4. Abrir http://localhost:4321/contato — idem.
  5. DevTools Network filtrado por `behold` → **0 hits** (fetch acontece SSR-side).
  6. Hover em thumb desktop → overlay aparece.
  7. Resize <768px → scroll horizontal snap, ~2.5 cards visíveis.
  8. Click → abre permalink Instagram em nova aba.

---

## Phase 4 — Deploy produção 🟡

### IG-040 🔒 Cadastrar secret no GitHub (Kayo) ⏳
```bash
gh secret set PUBLIC_BEHOLD_FEED_ID --body "<uuid-da-behold>"
```
- **AC**: `gh secret list | grep BEHOLD` mostra a entrada.

### IG-041 Abrir PR `feat/instagram-feed` ⏳
- Branch a partir de master.
- Body com checklist + screenshots locais.
- CI verde antes do merge.

### IG-042 Merge + CD ⏳
- Merge em master → workflow CD dispara automaticamente.
- Steps esperados: build 3 imagens GHCR → SSH deploy → smoke `/health`.
- **AC**: pipeline verde end-to-end.

### IG-043 Smoke pós-deploy ⏳
- `curl https://aumaf.kayoridolfi.ai/ | grep -c "ig-grid__item"` → 8.
- Abrir produção:
  - https://aumaf.kayoridolfi.ai/ (deve ter Instagram entre Reviews e CTA)
  - https://aumaf.kayoridolfi.ai/contato (deve ter Instagram após o form)
- DevTools Network produção, filtro `behold` → 0 matches.
- DevTools Network produção, filtro `cdninstagram|fbcdn` → 8 imagens carregando.
- Screenshot dos 2 templates salvo em `docs/specs/_active/2026-05-10-instagram-feed/screenshots/`.

---

## Phase 5 — Fechamento ⏳

### IG-050 Mover plano original
```bash
mv docs/plans/2026-05-09-roadmap-instagram-feed.md docs/plans/_completed/
```

### IG-051 Escrever `retrospective.md`
- O que funcionou, surpresas, follow-ups.

### IG-052 Mover spec para `_completed/`
```bash
mv docs/specs/_active/2026-05-10-instagram-feed docs/specs/_completed/
```

### IG-053 Atualizar `docs/specs/INDEX.md` + memória `MEMORY.md`
- Mover spec da seção "Em andamento" para "Recém concluídas".
- Criar memória `release_20260510_instagram_feed.md`.

---

## Follow-ups (não bloqueiam fechamento)

- 📌 Botão "Sincronizar agora" em `/admin/integrations` (Phase 2 opcional — invalidar cache em memória requer expor endpoint admin para o Astro, talvez via webhook).
- 📌 GA4 event `instagram_click` no `<a>` do thumbnail.
- 📌 Migrar conta Behold para AUMAF (trocar `FEED_ID`).
- 📌 Eventualmente, migrar para Graph API direto se Behold capotar — refator de `instagram.ts` apenas.
- 📌 Suporte a Reels com player próprio se AUMAF pedir.

---

## Ordem de execução restante

```
Phase 0 (Kayo manual) — IG-001 → IG-002 → IG-003
        ↓
Phase 4 (deploy)      — IG-040 → IG-041 → IG-042 → IG-043
        ↓
Phase 5 (fechamento)  — IG-050 → IG-051 → IG-052 → IG-053
```

Tudo que não dependia de credencial real está pronto. Quando o `FEED_ID` chegar, restam ~15 min de trabalho operacional + tempo de pipeline CI/CD.
