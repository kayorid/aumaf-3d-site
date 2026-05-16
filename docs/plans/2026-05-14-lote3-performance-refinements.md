# Lote 3 — Refinos de performance (1 PR, ~4h)

**Origem**: audit 2026-05-13 entregou web-vitals lib + Caddy cache + zstd. Faltam refinos de Critical Rendering Path que afetam LCP/CLS direto.

## 3.1 — Preload de fontes críticas (~30min)

**Por quê**: 3 fontes externas no `<head>` (Pirulen local, Material Symbols Google, Space Grotesk Google). Pirulen é usada no logo (above-the-fold, LCP candidate). Sem preload, fonte chega ~500ms após HTML parse → FOIT visível.

**Implementação** (`frontend-public/src/layouts/Base.astro`):

```html
<!-- Pirulen — logo above-the-fold -->
<link rel="preload" href="/fonts/pirulen.otf" as="font" type="font/otf" crossorigin>

<!-- Material Symbols + Space Grotesk: preconnect existe; adicionar preload de woff2 específico
     se Google retornar URL estável. Caso contrário, preconnect já basta. -->
```

Validar que `/fonts/pirulen.otf` existe no public/ — se não, fazer download e adicionar.

**Aceitação**:
- [ ] WebPageTest mostra fonte iniciando download em <100ms
- [ ] LCP cai >200ms na home (medido via /analytics web_vital)

---

## 3.2 — `fetchpriority="high"` em heros (~1h)

**Por quê**: Astro/Lighthouse premia LCP image com `fetchpriority="high"` (Chrome 102+). Ajuda priorizar download da imagem hero contra outras imagens.

**Aplicar em**:
- `index.astro:43-52` — `hero-bg-hexmesh.webp` (já tem `fetchpriority="high"` ✓)
- `sobre.astro:34-42` — `sobre-hero-hexmesh.webp` (verificar/adicionar)
- `servicos.astro` — hero bg
- `materiais.astro` — hero bg
- `portfolio.astro` — hero bg
- `faq.astro` — hero bg
- `avaliacoes.astro` — hero bg
- `contato.astro` — hero bg
- `glossario.astro` — adicionar bg + fetchpriority

**Pattern canônico**:
```astro
<img
  src="/images/hero-bg-<page>.webp"
  alt=""
  aria-hidden="true"
  width="1584"
  height="672"
  loading="eager"
  decoding="async"
  fetchpriority="high"
  class="absolute inset-0 ..."
/>
```

**Aceitação**:
- [ ] Todas 8 páginas de landing com fetchpriority="high" no hero
- [ ] LCP p75 cai (medir 7 dias depois via dashboard /analytics)

---

## 3.3 — `<Image>` do Astro para conteúdo abaixo do fold (~1.5h)

**Por quê**: `@astrojs/image` gera variantes responsive (srcset) + AVIF automático. Reduz peso em ~30% vs webp único.

**Aplicar em**:
- Cards de portfolio (`/portfolio/<slug>.astro`)
- Cards de materiais (`/materiais.astro` cards)
- Imagens de blog (`/blog/[slug].astro` cover + inline)
- Imagens de equipe (`/sobre.astro`)

**Pattern**:
```astro
---
import { Image } from 'astro:assets'
import heroImg from '../assets/team/marcos.webp'
---
<Image
  src={heroImg}
  alt="Marcos Vinicius Ninelli Martins — Diretor de Operações"
  widths={[400, 800, 1200]}
  sizes="(max-width: 768px) 400px, (max-width: 1200px) 800px, 1200px"
  format="avif"
/>
```

**Pré-requisito**: mover imagens estáticas de `public/images/` para `src/assets/` para Astro processar.

**Aceitação**:
- [ ] 4 contextos migrados (portfolio, materiais, blog, equipe)
- [ ] PageSpeed Insights mobile mostra redução de "Properly size images" warning
- [ ] Bundle de imagens cai ≥ 20%

---

## 3.4 — Bundle audit baseline (~30min)

**Por quê**: nunca medimos. Pode haver duplicação ou imports pesados desnecessários.

**Implementação**:
```bash
cd frontend-public
npm i -D rollup-plugin-visualizer
```

Em `astro.config.ts`:
```ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  vite: {
    plugins: [
      visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
      }),
    ],
  },
})
```

Rodar `npm run build` → abrir `dist/stats.html` localmente → identificar top 5 maiores chunks → criar issues para refactor.

**Aceitação**:
- [ ] Baseline documentado em `docs/perf/bundle-baseline-2026-05-14.md`
- [ ] Top 5 issues criados (issues GitHub ou items neste plano)

---

## 3.5 — Service Worker básico (futuro — não neste lote)

PWA offline + cache de imagens. Spec separada em Lote 4 ou sprint própria.

---

## Aceitação do Lote 3

- [ ] Build local verde
- [ ] PageSpeed Insights mobile (home) ≥ 92 (antes/depois documentados)
- [ ] LCP p75 medido (baseline + meta)
- [ ] Bundle baseline arquivado
- [ ] Smoke test prod
