# Bundle baseline — frontend-public · 2026-05-14

> Snapshot inicial do bundle do site público. Use como referência ao avaliar regressões.

## Como reproduzir

```bash
cd frontend-public
BUNDLE_AUDIT=1 npm run build
# Treemap interativo abre em: dist/stats.html
```

O bundle visualizer só liga com `BUNDLE_AUDIT=1` — CI e Docker rodam build padrão sem custo extra.

## JS por chunk (gzip-equivalente da pasta `dist/client/_astro/`)

| Chunk | Tamanho (disco) | Propósito |
|---|---|---|
| `web-vitals.*.js` | 8.0K | Coleta de LCP/CLS/FID/INP — instrumentação obrigatória |
| `materiais.astro_astro_type_script_*.js` | 8.0K | Modal/filtros da página /materiais |
| `index.*.js` | 8.0K | Counters animados + carrossel reviews da home |
| `contato.astro_astro_type_script_*.js` | 8.0K | Form de contato + analytics SDK |
| `preload-helper.*.js` | 4.0K | Vite preload runtime |
| `page.*.js` | 4.0K | Astro page router |
| `Base.astro_astro_type_script_*.js` | 4.0K | IntersectionObserver global + reveal animations |
| **Total JS** | **~168 KB** (sem gzip, todos os chunks somados) | |

**Observação**: o site é majoritariamente HTML/CSS — JS é pequeno e bem fragmentado por página, sem chunks dominantes. Não há quick wins óbvios de remoção.

## Imagens

| Pasta | Tamanho |
|---|---|
| `dist/client/images/` | **4.8 MB** (webp + alguns avif) |

Imagens dominam o bundle (28× o JS). Próximos passos para reduzir:

1. Migrar capas de blog e cards de portfolio para `<Image>` do Astro (gera srcset + AVIF).
2. Auditar `bg-*.webp` (heros): garantir compressão Q80 e largura máx 1920px.
3. `og/` images: verificar se algum PNG pode virar WebP.

## Top oportunidades (a partir do treemap)

Abra `dist/stats.html` em browser local. Identifique candidatos:

- [ ] Algum chunk > 30 KB? Investigar por imports pesados.
- [ ] Múltiplas cópias da mesma lib? Dedupe via vite resolve.
- [ ] CSS por página excessivo? Considerar `inlineStylesheets: 'never'`.

## Histórico

| Data | Total JS | Total imagens | Nota |
|---|---|---|---|
| 2026-05-14 | 168 KB | 4.8 MB | baseline pós audit 2026-05-13 |
