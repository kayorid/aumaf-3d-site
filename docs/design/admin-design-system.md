# Design System AUMAF 3D — Aplicado ao Backoffice

> **Regra absoluta**: o `frontend-admin` segue o **mesmo design system** do `frontend-public` — *Cinematic Additive Manufacturing*. Toda nova tela, componente ou ajuste no admin deve consultar este documento + `plano-design-completo.md`. **Sem exceções, sem variantes "modernas" ou "neutras" para o admin.**

**Última atualização**: 2026-05-03 (Q2 Phase 1 — login redesenhado)
**Referência canônica**: [`plano-design-completo.md`](./plano-design-completo.md) (1033 linhas — design system completo)
**Aplicação no admin**: este documento

---

## 1. Princípios não negociáveis

| Princípio | Aplicação no admin |
|-----------|-------------------|
| Fundo preto absoluto (`#000000`) | `body` e telas full-page (login, error, loading) |
| Verde neon **apenas em ação/status** | CTAs, status pills, indicadores online, links ativos. Nunca em texto corrido ou decoração genérica |
| Tipografia **única**: Space Grotesk + Pirulen para logo | Sem Inter, Roboto, Geist, etc. |
| Cantos **sharp** por padrão (`rounded-sm`/`DEFAULT 2px`) | Botões de ação, inputs, badges. `rounded-lg` (8px) só em cards grandes |
| **Uppercase + tracking-[0.2em]** em labels e meta | Section numbers (`/ 01`), labels de form, status pills, breadcrumbs |
| Glass-panel com backdrop-blur | Modals, drawers, navbar transparente sobre conteúdo |
| Atmospheric green glows | Telas full-page hero (login, dashboard se aplicável), nunca em listings densas |
| Tech-grid de fundo (opacity 0.4) | Backgrounds de tela cheia |
| Material Symbols Outlined | Ícones do site público; no admin usamos Lucide React por bundle, mas **estilo idêntico** (outline, peso fino) |

## 2. Tokens (já aplicados em `tailwind.config.ts` do admin)

### Cores

| Token | Hex | Uso |
|-------|-----|-----|
| `bg-background` | `#000000` | Fundo global |
| `bg-surface` | `#131313` | Superfície padrão |
| `bg-surface-dim` | `#0e0e0e` | Inputs e recesses |
| `bg-surface-low` | `#1c1b1b` | Cards e seções alternadas |
| `bg-surface-base` | `#201f1f` | Containers internos |
| `bg-surface-high` | `#2a2a2a` | Glass panel fill, hover de dropdowns |
| `bg-surface-highest` | `#353534` | Bordas, hover states |
| `text-on-surface` | `#e5e2e1` | Texto principal (warm off-white) |
| `text-on-surface-variant` | `#becab6` | Labels, metadados, hint text |
| `text-tertiary` | `#cdcaca` | Corpo de texto secundário |
| `text-on-primary` | `#013a00` | Texto sobre botão verde |
| `bg-primary-container` | `#61c54f` | CTAs, status dots, glow base |
| `bg-primary-dim` | `#78dd64` | Hover em botões verdes |
| `text-primary` (alias 400) | `#7ce268` | Links ativos, gradient base |
| `text-error` (alias `danger-400`) | `#ffb4ab` | Mensagens de erro |
| `border-white/8` ou `border/0.10` | translúcido | Separadores subtis |

### Tipografia

| Classe | Tamanho | Uso |
|--------|---------|-----|
| `text-display-xl` | clamp(48–72px) | Heros (login, landing) |
| `text-display-lg` | clamp(36–56px) | Section heroes |
| `text-headline-lg` | clamp(28–40px) | Títulos de página (Dashboard, Posts, etc.) |
| `text-headline-md` | clamp(20–24px) | Títulos de card |
| `text-body-lg` | 18px | Body emphatic |
| `text-body-md` | 16px | Body padrão |
| `text-label-caps` | 11px / tracking-[0.2em] / UPPERCASE | Labels, badges, section numbers |
| `text-code-data` | 13px / tracking-[0.05em] / mono | Slugs, IDs, datas técnicas |
| `font-pirulen` | Pirulen | **Apenas** para o lockup "AUMAF 3D" |

**Regras tipográficas:**
- Títulos de seção (h1, h2 de página) **sempre em UPPERCASE**
- Labels de form **uppercase + tracking-[0.2em]**
- Body em mixed case com `text-on-surface` (não branco puro `#fff`, exceto headlines com `text-glow-white`)

## 3. Componentes obrigatórios

### Pills/Badges
```tsx
<span className="pill">Neutro</span>
<span className="pill-green">Online</span>
<span className="pill bg-primary-container text-on-primary border-primary-container">Ativo</span>
```
- Sempre `rounded-full`, `text-[11px]`, `uppercase`, `tracking-[0.2em]`
- `PostStatusBadge` no admin já segue esse padrão — usar sempre os mesmos estilos

### Status pill com dot pulsante (sistema online)
```tsx
<div className="flex items-center gap-3">
  <span className="w-2 h-2 rounded-full bg-primary-container dot-glow animate-pulse-dot" />
  <span className="text-[11px] uppercase tracking-[0.2em] text-primary-container">
    Sistema online
  </span>
</div>
```
- Uso: dashboard header, login, qualquer indicador de "vivo"

### Input underline (formulários minimal)
```tsx
<input className="input-underline" placeholder="EMAIL" />
```
- Uso obrigatório em telas hero (login)
- Em editores de conteúdo (PostEditor) pode usar `<Input>` com border (UX denser)

### CTA primário (verde + glow)
```tsx
<button className="bg-primary-container text-on-primary text-[11px] font-bold uppercase tracking-[0.2em]
                   px-8 py-4 rounded-sm glow-effect hover:bg-primary-dim hover:shadow-glow-lg
                   transition-all duration-300">
  Ação principal
</button>
```
- Sempre uppercase, sharp corners, glow-effect
- Em variantes menores (size sm/md): manter cor + glow, ajustar padding

### CTA secundário (outline)
```tsx
<button className="border border-white/20 text-on-surface text-[11px] font-bold uppercase
                   tracking-[0.2em] px-8 py-4 rounded-sm
                   hover:border-primary-container/50 hover:text-primary-container
                   transition-all duration-300">
  Ação secundária
</button>
```

### Section numbering ("/ 01 Autenticação")
```tsx
<div className="flex items-center gap-2">
  <span className="text-[11px] uppercase tracking-[0.2em] text-primary-container font-bold">/ 01</span>
  <span className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Autenticação</span>
</div>
```
- Uso: heroes de seção, headers de páginas, agrupamentos

### Glass panel (modals, drawers)
- Modals (Radix Dialog): `glass-panel-strong` no overlay/content
- Sidebars/drawers: `glass-panel`
- Topbar do admin: `nav-glass` (atualmente é `bg-background/80 backdrop-blur` — equivalente)

### Atmospheric glows (telas hero)
Aplicar em telas full-page (login, landings):
- 3 radial gradients verdes em posições assimétricas (canto superior, centro, canto inferior oposto)
- 1 orb focal lateral
- Linhas decorativas finas (1px com gradient e box-shadow verde sutil)
- Pontos pulsantes (2 a 3 com `animate-pulse-dot`)
- Tech-grid sob tudo com `opacity-40`

Ver implementação em `LoginPage.tsx` como referência.

### Logo "AUMAF 3D"
```tsx
<span className="font-pirulen text-[18px] text-white tracking-[0.06em]">AUMAF</span>
<span className="font-pirulen text-[18px] text-primary-container tracking-[0.06em] ml-1">3D</span>
```
- Pirulen é **a única exceção** ao "Space Grotesk único"
- Sempre AUMAF branco + 3D verde
- Em telas mobile: tamanho `[16px]`

## 4. Padrões de layout

### Telas full-page (login, error, loading)
- `min-h-screen` + `bg-background` + `relative overflow-hidden`
- Camadas (z-index crescente):
  1. Tech grid de fundo (`opacity-40`)
  2. 3 radial gradients atmosféricos
  3. Orb focal (lateral)
  4. Linhas decorativas + pontos pulsantes
  5. Conteúdo (`relative z-10`)
- Split layout 2 colunas em ≥lg: aside cinematográfico (esquerda) + form (direita)
- Em mobile: aside esconde, form ocupa tela toda com header reduzido

### Páginas internas (Dashboard, Posts, Editor)
- Sidebar fixa esquerda (`lg:pl-60` no main)
- Topbar sticky superior (`nav-glass`)
- Main com `px-6 py-8`
- Headers de página: título uppercase tracking-[-0.02em] + subtítulo `text-body-md text-on-surface-variant`
- Cards: `surface-card` (= `bg-surface-low border border-white/8 rounded-lg p-6`)

### Espaçamentos
- Entre seções: `space-y-6` ou `space-y-8`
- Padding de cards: `p-5` (KPI) ou `p-6` (padrão)
- Gap em grids: `gap-4` (KPI cards) ou `gap-6` (cards maiores)

## 5. Animações permitidas

| Animação | Quando usar |
|----------|------------|
| `animate-pulse-dot` | Indicadores "vivo" (status pills, dots) |
| `animate-fade-in` | Aparição de cards/sections após load |
| `animate-fade-up` | Heroes ao montar (delay 100/250/380/500ms para sequência) |
| `glow-effect` em hover | Botões verdes principais |
| `transition-colors duration-200` | Hovers de links, items de menu |
| `transition-all duration-300` | Botões com transform/glow combinado |

**Proibido**: parallax pesado, animações que se repetem agressivamente em listings, springs exagerados, fade durante scroll em cards filtráveis (mesmo erro que o público teve em v6).

## 6. Acessibilidade (mesma régua do público — WCAG 2.2 AA)

- Foco visível: `:focus-visible { outline: 2px solid #61c54f; outline-offset: 2px }` (já aplicado globalmente)
- Inputs sempre com `<Label>` Radix associado
- Toda imagem decorativa: `aria-hidden`
- Botões só ícone: `aria-label`
- Modals (Dialog): `aria-modal`, focus trap, Esc fecha (Radix já entrega)
- Toast (sonner) configurado com `closeButton` para dispensar via teclado
- `prefers-reduced-motion`: já honrado no `index.css`

## 7. Quando criar uma nova tela ou componente

1. **Consulte primeiro**: `plano-design-completo.md` (catálogo completo) e este doc
2. **Reuse classes existentes**: `pill`, `glass-panel`, `glow-effect`, `bg-tech-grid`, `text-gradient-green`, `dot-glow`, `surface-card`, `input-underline`
3. **Imite uma tela existente do admin** que use o padrão correto (LoginPage, DashboardPage, PostEditorPage)
4. Em caso de dúvida: olhe a implementação equivalente no `frontend-public` — paleta, espaçamento, hierarquia tipográfica
5. **Nunca introduzir** uma nova fonte, biblioteca de UI (Material UI, Chakra, etc.), ou alterar tokens sem ADR

## 8. ❌ Anti-padrões — NÃO fazer no admin

- ❌ Cards com `bg-white` ou cinza claro (`bg-gray-50`)
- ❌ Tipografia Inter, Roboto, Geist, system-ui
- ❌ Botões com `rounded-md` (4px+) em CTAs principais — use `rounded-sm` (1px)
- ❌ Texto verde fora de status/CTA/link ativo
- ❌ Gradientes coloridos (azul→roxo, etc.)
- ❌ Decorações sem propósito (sombras coloridas, blur exagerado)
- ❌ Loading spinners genéricos do Radix/MUI — usar `Loader2` Lucide com `animate-spin` em verde
- ❌ Cantos `rounded-2xl`/`rounded-3xl`
- ❌ Tons de azul, exceto `info-400` (`#60a5fa`) em badges informativos raros

## 9. Checklist antes de PR

- [ ] Paleta apenas dos tokens do `tailwind.config.ts`
- [ ] Verde neon só em ação/status/link ativo
- [ ] Headlines uppercase + tracking ajustado
- [ ] Labels uppercase + tracking-[0.2em]
- [ ] CTAs com `glow-effect` quando primário
- [ ] Status indicators com `dot-glow` + `animate-pulse-dot`
- [ ] Foco visível verde em todos os interativos
- [ ] Sem `console.log`, `bg-white`, `font-mono` exagerado, fontes não permitidas
- [ ] Storybook story criada para componentes de UI novos (Constituição §5)

## 10. Referências cruzadas

- Tokens canônicos: `frontend-public/tailwind.config.ts` (origem) e `frontend-admin/tailwind.config.ts` (cópia ampliada com aliases)
- Utilities CSS: `frontend-public/src/styles/global.css` (catálogo) e `frontend-admin/src/index.css` (subset essencial)
- Constituição: `docs/specs/constitution.md` §7 (Design system)
- Memory: `~/.claude/projects/.../memory/project_design_system.md`
- Spec Q2 Phase 1: `docs/specs/_active/2026-05-02-q2-blog-backoffice/design.md`
