# Plano 1 — Revisão Visual do Site Público

**Status:** 🟡 Stand-by (rascunho inicial — discutir antes de iniciar)
**Criado:** 2026-05-09
**Escopo:** `frontend-public/` (Astro)

## Objetivo
Elevar o acabamento visual do site público com refinos de identidade, micro-interações e novas páginas de detalhe por material.

## Frentes de trabalho

### 1.1 Backgrounds e atmosfera
- Revisar gradientes/texturas em hero, seções intermediárias e CTA final.
- Avaliar uso de noise sutil, partículas leves, ou backdrops 3D estáticos coerentes com o DS Cinematic Additive Manufacturing.
- Garantir contraste AA/AAA e performance (CLS, LCP) em mobile.

### 1.2 Detalhes e troca de imagens
- Auditar imagens atuais (`/images/`, capas de blog, OG, ícones).
- Substituir imagens genéricas/placeholder por fotos reais da AUMAF (peças impressas, bancada, processo).
- Padronizar enquadramento, paleta e tratamento (grain, vinheta sutil).
- Revisar ícones soltos (lucide vs custom) — uniformizar família.

### 1.3 Micro-interações
- Hover states em cards de serviços/materiais (lift + glow sutil).
- Transições de página (View Transitions API do Astro).
- Reveal on scroll parametrizado (IntersectionObserver, sem libs pesadas).
- Cursor states em CTAs principais.
- Feedback tátil em formulário de contato (estados: idle/loading/success/error).

### 1.4 Páginas de detalhe por material
- Criar rota dinâmica `/materiais/[slug]` (ex.: `pla`, `petg`, `abs`, `resina`, `tpu`, `nylon`).
- Conteúdo por material: descrição, propriedades técnicas (tabela), aplicações ideais, limitações, exemplos de peças, CTA orçamento.
- Schema.org `Product` ou `Service` para SEO/GEO.
- Linkagem cruzada: home/serviços → detalhe; detalhe → blog posts relacionados.
- Index `/materiais` com grid comparativo.

## Saídas
- PR(s) por frente (provável: 2 — visual/micro-interações + páginas de material).
- Atualização de `docs/design/` com novos tokens/padrões adotados.
- Smoke test em prod após deploy.

## Pré-requisitos para destravar
- Definir lista canônica de materiais oferecidos (Kayo + AUMAF).
- Receber/produzir fotos reais de peças por material.
- Confirmar tom visual (mais técnico vs mais cinematográfico).

## Riscos
- Imagens reais podem demorar a chegar — preparar fallback elegante.
- Micro-interações em excesso podem comprometer LCP — orçar performance.
