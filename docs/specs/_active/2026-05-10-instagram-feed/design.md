# Design — instagram-feed

**Slug**: `2026-05-10-instagram-feed`
**Vinculado a**: `requirements.md`
**Última revisão**: 2026-05-10 (arquitetura simplificada para frontend-only).

---

## 1. Arquitetura (revisada — frontend-only)

```
┌─────────────────┐        ┌───────────────────────┐        ┌───────────────────────┐
│ Instagram       │ ─────► │ Behold.so (proxy)     │ ─────► │ Astro SSR (Node)       │
│ Graph API       │        │ feeds.behold.so/{ID}  │  HTTP  │ getInstagramFeed()     │
│ (real-time)     │        │ update ~1h            │   GET  │ TTL in-memory 1h       │
└─────────────────┘        └───────────────────────┘        └───────────┬───────────┘
                                                                        │
                                                                        ▼
                                                              ┌──────────────────┐
                                                              │ <InstagramFeed/> │
                                                              │ render no DS     │
                                                              └──────────────────┘
```

### Por que sem backend
- Google Reviews já roda exatamente nesse padrão em produção (`frontend-public/src/lib/google-reviews.ts`) — cache em memória do processo Astro com TTL.
- Zero código novo no backend → zero risco de regressão em rota pública existente.
- Deploy mais simples: apenas re-build do `frontend-public` com novo `--build-arg`.
- Quando precisarmos de cache compartilhado entre instâncias múltiplas (não é o caso hoje — 1 instância na VPS), trocar `let cached` por `redis.get/setex` é uma diff de ~10 linhas.

### Princípio inegociável
Behold.so é APENAS fonte JSON.
- Nenhum `<script>`, `<iframe>` ou `<link>` do behold.so no HTML final.
- Visual 100% no DS Cinematic Additive Manufacturing.

## 2. Decisões de design

### D1 — Behold.so vs Graph API direto
**Decisão**: Phase 1 usa Behold.so.
**Trade-off**: dependência de terceiro em troca de zero infra de auth/token. Layer de render desacoplado → migração futura é refator do `instagram.ts`, não do componente Astro.

### D2 — Cache in-memory 1h (não Redis)
**Decisão**: TTL 3600s no processo Astro, mesmo padrão de `google-reviews.ts`.
**Por quê**: 1 instância em produção, comportamento idêntico ao já validado. Se Behold falhar, serve o último snapshot bom (variável `cached?.data`).

### D3 — SSR puro (zero JS no client)
Componente Astro sem `client:*`. Mantém bundle público intacto (build atual: 2.25 KB no `page.js`, **não regrediu**).

### D4 — Grid 4×2 desktop / snap mobile
- Desktop ≥768px: `repeat(4, 1fr)` × 2 linhas.
- Mobile <768px: `grid-template-columns: repeat(8, 40vw)` + `grid-auto-flow: column` + `scroll-snap-type: x mandatory`. ~2.5 cards visíveis sem barra de scroll.
- Mesmo idioma do `ReviewsHomeWidget`.

### D5 — Click direto pro permalink
- `target="_blank" rel="noopener noreferrer"` em cada `<a>`.
- Sem lightbox (custaria JS + focus trap + ESC handler).
- Caption truncada serve como `aria-label` ou fallback `Publicação @aumaf3d em <data>`.

### D6 — Conta intermediária do Kayo no Behold
**Decisão**: Kayo cria a conta Behold com login próprio; conecta `@aumaf3d` como página gerenciada.
**Plano B**: se Kayo não for admin da página FB AUMAF, AUMAF cria a conta direto e nos passa o `FEED_ID`.

### D7 — Fallback silencioso
- `getInstagramFeed()` retorna `null` em qualquer erro / quando `PUBLIC_BEHOLD_FEED_ID` está vazio.
- Componente renderiza zero markup se `posts.length === 0`.
- Verificado em build: HTML gerado sem `FEED_ID` tem apenas o CSS scoped (sem `<section>` real), zero impacto perceptível.

### D8 — Filtrar VIDEO out
- Reels exigem player com hidratação JS; fora do escopo Phase 1.
- Mantém apenas `IMAGE` e `CAROUSEL_ALBUM`; carousel exibe a primeira imagem com badge `collections`.

### D9 — Variantes home / contato
- Mesmo componente, prop `variant: 'home' | 'contato'` ajusta background (`bg-background` vs `bg-surface-low`) e textos default.
- Reusa marca visual sem duplicar código.

## 3. Componentes implementados

### 3.1 `frontend-public/src/lib/instagram.ts`
- `getInstagramFeed(): Promise<InstagramFeedData | null>` — fetch + cache + fallback.
- `truncateCaption(text, max=100)` — quebra em palavra próxima do limite.
- `formatPostDate(iso)` — `dd/MM/yyyy` em `pt-BR`.
- Aceita payload Behold em duas formas (`{ posts: [...] }` ou array nu) — defensivo contra mudanças menores no schema deles.
- Filtra: `mediaType in {IMAGE, CAROUSEL_ALBUM}` + descarta posts sem thumbnail.
- Ordena por `timestamp DESC` e pega 8 mais recentes.

### 3.2 `frontend-public/src/components/instagram/InstagramFeed.astro`
- Header: eyebrow + título + descrição + botão "Seguir @aumaf3d" com SVG inline do Instagram.
- Grid responsivo (CSS scoped, sem Tailwind plugin necessário).
- Badge `collections` (Material Symbols) no canto superior direito em carousels.
- Overlay com gradiente + caption truncada + hint "Ver no Instagram" (desktop hover).
- Mobile: overlay sempre visível com gradiente leve para legibilidade.
- Respeita `prefers-reduced-motion`.

### 3.3 Pontos de inserção
- `frontend-public/src/pages/index.astro` — entre `<ReviewsHomeWidget />` e o CTA final (linha ~1240).
- `frontend-public/src/pages/contato.astro` — entre o `</form>` e a seção "WhatsApp direto" (linha ~343).

## 4. Schema / Migrations

**Nenhuma**. Feature 100% stateless no client/SSR.

## 5. Variáveis de ambiente

| Var | Onde | Exemplo | Sensível |
|-----|------|---------|----------|
| `PUBLIC_BEHOLD_FEED_ID` | `frontend-public/.env` + Dockerfile build-arg + GH Actions secret | `1a2b3c4d-5e6f-...` | ❌ (público, equivale a username) |

Wired em:
- `frontend-public/.env.example` ✅
- `deploy/Dockerfile.frontend-public` (`ARG PUBLIC_BEHOLD_FEED_ID=` + `ENV`) ✅
- `.github/workflows/cd.yml` (`build-args:` + `${{ secrets.PUBLIC_BEHOLD_FEED_ID }}`) ✅

**Falta**: criar o secret no GitHub (`Settings → Secrets and variables → Actions → New repository secret`) com nome `PUBLIC_BEHOLD_FEED_ID` quando o ID estiver pronto.

## 6. Erros e fallbacks

| Cenário | Comportamento |
|---------|--------------|
| `PUBLIC_BEHOLD_FEED_ID` vazio | `getInstagramFeed()` retorna `null` sem logar; seção some |
| Behold.so 5xx / 4xx | `console.warn` + retorna cache anterior se houver; senão `null` |
| Timeout 3s | Idem |
| JSON malformado | Idem |
| `posts: []` após filtros | Lança erro interno → cai no catch → cache anterior ou `null` |

Princípio: **nunca mostrar mensagem de erro**; seção some silenciosamente.

## 7. Performance

- **HTML adicional**: ~700 bytes de CSS scoped quando vazio; ~6 KB com 8 posts.
- **JS adicional**: **0 bytes** (sem hidratação client).
- **Imagens**: thumbnail do Behold (`sizes.medium`, ~640px). Primeiras 4 com `loading="eager"`, restantes `lazy`. `width`/`height` explícitos para evitar CLS.
- **Build verificado em local** (2026-05-10 20:16): bundle JS `page.js` permaneceu em 2.25 KB / 1.01 KB gzipped — zero regressão.

## 8. Acessibilidade

- `<section aria-labelledby>` com `<h2 id>` correspondente.
- `<ul role="list">` (Tailwind/CSS reset zera o role implícito em alguns browsers).
- Cada `<a>` tem `aria-label` derivado da caption ou fallback com data.
- Foco visível via outline verde-neon (mesmo padrão do DS).
- Overlay decorativo via `pointer-events: none` — não rouba foco.
- `prefers-reduced-motion` cobre hover (transform + transição).

## 9. Deploy

1. Kayo executa Phase 0 (criar conta Behold + conectar `@aumaf3d` + copiar `FEED_ID`).
2. Cadastrar secret no GitHub:
   - `gh secret set PUBLIC_BEHOLD_FEED_ID --body "<uuid>"`
3. Abrir PR `feat/instagram-feed` → merge em master.
4. CD pipeline:
   - Build `frontend-public` Docker com `--build-arg PUBLIC_BEHOLD_FEED_ID=<secret>`.
   - Push GHCR + SSH deploy.
   - Smoke test passa.
5. Verificação:
   - `curl https://aumaf.kayoridolfi.ai/ | grep -o "ig-grid__item" | wc -l` → 8.
   - DevTools Network filtrado por `behold` → **zero matches** no client (fetch acontece SSR-side).
   - DevTools Network filtrado por `cdninstagram\|fbcdn` → 8 thumbnails (servidos pelo CDN do FB que o Behold referencia).

## 10. Rollback

- `git revert <merge-commit>` + CD redeploy automático.
- Hot-rollback sem revert: setar secret `PUBLIC_BEHOLD_FEED_ID` para string vazia → próximo build esconde a seção sem mudar código.
- Hot-rollback radical: remover `<InstagramFeed />` dos 2 templates Astro e push direto em master.

## 11. Observabilidade

- Logs SSR: `console.warn('[instagram] fetch falhou: ...')` quando Behold falha.
- Sem métrica custom no `/health` (Phase 2 opcional — não justifica para feature stateless single-source).
