# AUMAF 3D — Plano de Polimento Visual v3/v4

> **Status:** ✅ ENTREGUE | **Data:** 2026-05-03 | **Commits:** `c2388ea`, `bd9d670`, `79a2ffb`

---

## Contexto

Após a entrega Q1 (10 páginas, build limpo), foram realizadas três rodadas de evolução visual do site público (`frontend-public`) sem breaking changes no backend ou admin.

---

## V3 — Scroll, Animações e Filtros (commits `c2388ea`, `bd9d670`)

### Componentes adicionados

| Elemento | Implementação |
|---|---|
| Ticker / marquee | Strip de rolagem contínua com capacidades da AUMAF |
| Scroll-reveal | `IntersectionObserver` via classes `.reveal-hidden` / `.reveal-visible` |
| Navbar slim | Fica 50% menor após 80px de scroll via classe `scrolled` |
| Indicador "Rolar" | Seta animada no hero principal |
| Filtro sticky todas as páginas | `position:sticky` + `MutationObserver` sincronizando `top` com navbar hide/show |

### Filtros sticky com navbar sync
Padrão aplicado em `/faq`, `/materiais` e `/portfolio`:
```js
const navbar = document.getElementById('navbar')
const filter = document.getElementById('...-filter')
new MutationObserver(() => {
  filter.style.top = navbar.classList.contains('-translate-y-full') ? '0px' : '80px'
}).observe(navbar, { attributes: true, attributeFilter: ['class'] })
```

---

## V4 — Glows, Texturas e UX (commit `79a2ffb`)

### Novas utilities CSS (`global.css`)

| Classe | Efeito |
|---|---|
| `.text-glow` | `text-shadow` verde neon triplo (12/30/65px) |
| `.text-glow-sm` | Versão reduzida para labels |
| `.text-glow-white` | Halo branco sutil em h1 |
| `.text-gradient-glow` | Gradient text + `filter:drop-shadow()` — necessário porque `text-shadow` não funciona com `-webkit-text-fill-color:transparent` |
| `.dot-glow` | `box-shadow` triplo para status pips |
| `.line-glow-bright` | Separador 1px com gradient e box-shadow verde |
| `.glow-intense` | Box-shadow reforçado para CTAs e FAB |
| `.bg-circuit` | SVG data URI — trilhas de circuito + vias |
| `.bg-diamond-grid` | Dois `linear-gradient` 45°/-45° formando losangos |
| `.bg-cross-hatch` | 4-layer gradient hachura cruzada |
| `.bg-hex-grid` | SVG hexagonal data URI |
| `.bg-diagonal-lines` | `repeating-linear-gradient` a -58° |

### Mudanças estruturais

**Container mais largo**
- `max-w-[1440px]` → `max-w-[1600px]` em todas as 10 páginas + Footer + Navbar
- `px-edge`: `px-6 md:px-10 lg:px-16` → `px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20`

**FAB Scroll-to-Top (`Base.astro`)**
```html
<button id="fab-top" class="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full 
  bg-primary-container ... opacity-0 pointer-events-none transition-all">
  <span class="material-symbols-outlined">arrow_upward</span>
</button>
```
Aparece após 400px de scroll. Smooth scroll ao clicar.

**Blog posts clicáveis (`/blog`)**
- Posts com `href` → `<a href>` com hover overlay
- Posts sem `href` → `<article>` com `opacity-60` + badge "Em breve"

**text-gradient-glow aplicado**
- `/contato` — "Agora."
- `/faq` — "Nós Respondemos."

**MutationObserver adicionado em `/materiais`** (estava faltando após refatoração do sticky filter)

---

## Build

Todas as versões entregues com `npm run build` passando sem erros:
- 15 páginas geradas (incluindo `/v2` e 4 blog posts técnicos)
- `sitemap-index.xml` atualizado automaticamente

---

## Pendências identificadas nesta sessão

- [ ] Imagens reais (aguardando cliente + geração pelos prompts em `docs/assets/image-prompts.md`)
- [ ] Logo SVG real integrado — assets disponíveis em `docs/assets/#LOGO AUMA/`
- [ ] Revisão mobile detalhada (375px / 390px / 430px)
- [ ] Merge seletivo V2 → original (Canvas 3D, contadores animados)
- [ ] Formulário de contato → endpoint backend (Q2)
