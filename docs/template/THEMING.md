# Theming — Criar e ajustar temas

O design system é dirigido por **CSS variables**. O Tailwind do `frontend-public` e do `frontend-admin` mapeia tokens para `rgb(var(--color-*) / <alpha-value>)`, o que significa que trocar um tema é trocar um único `@import`.

---

## Anatomia de um tema

Um tema é um arquivo `.css` em `frontend-public/src/styles/themes/`. Cada tema define o mesmo set de variáveis:

```css
:root {
  /* Surfaces (fundos, em ordem de elevação) */
  --color-background: <r> <g> <b>;
  --color-surface: <r> <g> <b>;
  --color-surface-dim: ...;
  --color-surface-low: ...;
  --color-surface-base: ...;
  --color-surface-high: ...;
  --color-surface-highest: ...;
  --color-surface-variant: ...;

  /* Brand (cor de destaque + estados) */
  --color-primary: <r> <g> <b>;
  --color-primary-container: ...;
  --color-primary-dim: ...;
  --color-primary-fixed: ...;
  --color-on-primary: ...;

  /* Foreground (textos sobre fundos) */
  --color-on-surface: ...;
  --color-on-surface-variant: ...;
  --color-tertiary: ...;
  --color-tertiary-container: ...;
  --color-outline: ...;
  --color-outline-variant: ...;

  /* States */
  --color-error: ...;
  --color-error-container: ...;

  /* Effects (sombras de glow + glass) */
  --shadow-glow: ...;
  --shadow-glow-lg: ...;
  --shadow-glow-sm: ...;
  --shadow-glass: ...;

  /* Gradients de marca */
  --gradient-radial-brand: ...;
  --gradient-grid: ...;

  /* Typography */
  --font-sans: "...", sans-serif;
  --font-display: "...", sans-serif;

  /* Radii */
  --radius-default: <px>;
  --radius-sm: <px>;
  --radius-md: <px>;
  --radius-lg: <px>;
}
```

> **Formato das cores:** os valores são triplas RGB separadas por espaços (sem `rgb(...)`). Isso permite que o Tailwind aplique opacidade via `rgb(var(...) / <alpha-value>)`. Use o conversor que preferir (e.g. https://rgbacolorpicker.com/).

---

## Temas fornecidos

| Tema | Arquivo | Vibe |
|---|---|---|
| **industrial-green** | `themes/industrial-green.css` | Preto + verde neon. Origem AUMAF 3D. Cantos sharp (1-2px). Glow intenso. |
| **ocean-blue** | `themes/ocean-blue.css` | Corporate / SaaS. Azul-marinho + ciano. Cantos médios (6-14px). |
| **warm-boutique** | `themes/warm-boutique.css` | Lifestyle / boutique. **Light theme** creme + terracota. Cantos grandes (12-24px). Sem glow. |

---

## Trocar de tema

```css
/* frontend-public/src/styles/global.css — primeira linha */
@import './themes/ocean-blue.css';
```

```css
/* frontend-admin/src/index.css — primeira linha */
@import '../../frontend-public/src/styles/themes/ocean-blue.css';
```

Ambos os arquivos precisam estar sincronizados, senão o admin e o público vão divergir visualmente.

---

## Criar um tema novo

```bash
cp frontend-public/src/styles/themes/industrial-green.css \
   frontend-public/src/styles/themes/<meu-tema>.css
```

Edite as variáveis. Algumas dicas:

- **Contraste WCAG.** Mantenha ≥ 4.5:1 para texto regular (`on-surface` × `background`). Verifique em https://webaim.org/resources/contrastchecker/.
- **Surface ramp.** As superfícies (`surface-dim` → `surface-highest`) devem ser uma escala progressiva — não use a mesma luminância em níveis adjacentes.
- **`on-primary`.** Deve ter contraste forte com `primary-container` (foco em legibilidade dos CTAs).
- **`outline-variant`.** Use uma cor sutil — geralmente 10-15% da `primary` ou um cinza muito escuro.
- **Fontes.** Se trocar `--font-sans` / `--font-display`, garanta que a face está carregada via `@import url(...)` no `global.css` ou `@font-face` local. Pirulen é específica do legado AUMAF — pode remover livremente.

Para light themes:

- Use valores claros nas surfaces (>240 em RGB).
- Inverta `on-surface` para tons escuros (<60 em RGB).
- Remova ou neutralize as `--shadow-glow-*` (que não fazem sentido em fundo claro).
- Ajuste `--gradient-grid` para opacidade mais baixa.

---

## Tokens que **não** são CSS variables

Alguns valores permanecem em Tailwind direto e devem ser ajustados em `tailwind.config.ts` se você quiser variar entre marcas:

- **Spacing** (`margin`, `gutter`, `section-gap`, `stack-*`)
- **Font sizes / line heights** (escala tipográfica)
- **Keyframes e animations** (pulses, marquee, scan-line, etc.)
- **Backdrop blurs** (`glass`, `nav`)

Esses tokens são bastante "design system" e raramente precisam mudar entre marcas — costumam fazer parte do DNA do template.

---

## Testar visualmente

```bash
npm run dev:public
# abra http://localhost:4321 e navegue pelas páginas
```

```bash
cd frontend-admin && npm run storybook
# Storybook em http://localhost:6006 — ver Foundation/Tokens
```

A página `Foundation/Tokens` no Storybook é um catálogo vivo dos tokens — útil para validar contraste, escala tipográfica, raios e sombras antes de propagar a mudança.
