import type { LegacyPost } from '../types'

export const post: LegacyPost = {
  slug: 'fdm-vs-sla-vs-sls',
  title: 'FDM, SLA ou SLS? O Guia Definitivo para Escolher o Processo Certo',
  excerpt:
    'Entenda as diferenças reais entre FDM, SLA e SLS — custo, precisão, materiais e acabamento — e descubra qual processo é o certo para o seu projeto de impressão 3D industrial.',
  metaTitle: 'FDM, SLA ou SLS? Guia Definitivo — AUMAF 3D',
  metaDescription:
    'Comparativo técnico completo entre FDM, SLA e SLS: custo, precisão, materiais e quando usar cada processo de impressão 3D industrial.',
  category: 'Guia Técnico',
  publishedAt: new Date('2026-05-01T12:00:00Z'),
  readingTimeMin: 8,
  featured: true,
  tags: ['fdm', 'sla', 'sls', 'comparativo', 'impressao-3d-industrial'],
  coverImage: null,
  content: `Escolher o processo errado de impressão 3D pode custar caro — não apenas no orçamento da peça, mas em retrabalho, atrasos de projeto e frustração com resultados que não atendem à funcionalidade esperada. FDM, SLA e SLS são tecnologias radicalmente diferentes, cada uma com uma proposta de valor específica para aplicações industriais.

Este guia parte do que vemos na prática diária da AUMAF 3D: engenheiros chegam com projetos para os quais já definiram o processo antes de avaliar os requisitos reais da peça. O resultado frequente é uma peça tecnicamente viável, mas longe do ótimo. Vamos mudar isso.

## Comparativo: FDM × SLA × SLS

<div class="glass-panel rounded-sm overflow-hidden border border-primary-container/15 my-8 relative">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<table class="w-full text-body-md">
<thead>
<tr class="bg-primary-container/10 border-b border-white/10">
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest">Critério</th>
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest">FDM</th>
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest">SLA</th>
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest">SLS</th>
</tr>
</thead>
<tbody>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface-variant">Custo por peça</td><td class="px-4 py-3 text-on-surface">Baixo</td><td class="px-4 py-3 text-on-surface">Médio</td><td class="px-4 py-3 text-on-surface">Alto</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface-variant">Precisão dimensional</td><td class="px-4 py-3 text-on-surface">±0.1–0.3mm</td><td class="px-4 py-3 text-on-surface">±0.025–0.05mm</td><td class="px-4 py-3 text-on-surface">±0.1–0.2mm</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface-variant">Acabamento superficial</td><td class="px-4 py-3 text-on-surface">Linhas visíveis</td><td class="px-4 py-3 text-on-surface">Liso, 25μm</td><td class="px-4 py-3 text-on-surface">Granulado fino</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface-variant">Suporte necessário</td><td class="px-4 py-3 text-on-surface">Sim (remoção manual)</td><td class="px-4 py-3 text-on-surface">Sim (remoção manual)</td><td class="px-4 py-3 text-on-surface">Não (pó sustenta)</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface-variant">Gama de materiais</td><td class="px-4 py-3 text-on-surface">Muito ampla</td><td class="px-4 py-3 text-on-surface">Resinas variadas</td><td class="px-4 py-3 text-on-surface">Nylon, PA, TPU</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface-variant">Geometria complexa</td><td class="px-4 py-3 text-on-surface">Limitada por suporte</td><td class="px-4 py-3 text-on-surface">Boa com suportes finos</td><td class="px-4 py-3 text-on-surface">Excelente</td></tr>
<tr><td class="px-4 py-3 text-on-surface-variant">Velocidade (série)</td><td class="px-4 py-3 text-on-surface">Boa</td><td class="px-4 py-3 text-on-surface">Lenta</td><td class="px-4 py-3 text-on-surface">Excelente</td></tr>
</tbody>
</table>
</div>

## FDM — Fused Deposition Modeling

O FDM é o processo mais difundido na impressão 3D industrial por uma razão simples: versatilidade de materiais a custo acessível. Um bico aquecido deposita filamento termoplástico em camadas, construindo a peça por acúmulo de material. A chave do FDM industrial está na câmara aquecida e no controle preciso de temperatura, que permitem processar materiais técnicos de alto desempenho.

### Materiais disponíveis na AUMAF 3D (FDM)

<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
<div class="glass-panel rounded-sm p-3 border border-white/8"><span class="text-label-caps text-primary-container uppercase tracking-widest block text-[10px] mb-1">PA CF15</span><span class="text-body-md text-tertiary text-sm leading-snug">Nylon + 15% carbono, rigidez extrema, peso reduzido</span></div>
<div class="glass-panel rounded-sm p-3 border border-white/8"><span class="text-label-caps text-primary-container uppercase tracking-widest block text-[10px] mb-1">ABS</span><span class="text-body-md text-tertiary text-sm leading-snug">Resistência mecânica, temperatura até 80°C</span></div>
<div class="glass-panel rounded-sm p-3 border border-white/8"><span class="text-label-caps text-primary-container uppercase tracking-widest block text-[10px] mb-1">PC</span><span class="text-body-md text-tertiary text-sm leading-snug">Policarbonato, transparência, resistência a 120°C</span></div>
<div class="glass-panel rounded-sm p-3 border border-white/8"><span class="text-label-caps text-primary-container uppercase tracking-widest block text-[10px] mb-1">TPU</span><span class="text-body-md text-tertiary text-sm leading-snug">Flexível, absorção de impacto, grips e juntas</span></div>
<div class="glass-panel rounded-sm p-3 border border-white/8"><span class="text-label-caps text-primary-container uppercase tracking-widest block text-[10px] mb-1">PEEK</span><span class="text-body-md text-tertiary text-sm leading-snug">Alta performance, biocompatível, 250°C+</span></div>
<div class="glass-panel rounded-sm p-3 border border-white/8"><span class="text-label-caps text-primary-container uppercase tracking-widest block text-[10px] mb-1">316L</span><span class="text-body-md text-tertiary text-sm leading-snug">Metal via FDM (BASF Ultrafuse), sinterização posterior</span></div>
</div>

**Quando usar FDM:** peças funcionais com requisitos mecânicos, protótipos que serão testados sob carga, componentes em materiais técnicos (PA, PEEK, PC), produção de pequenas séries onde o custo de material é fator determinante.

**Limitações do FDM:** o acabamento superficial apresenta linhas de camada visíveis que podem exigir pós-processamento. A anisotropia entre eixos XY e Z é mais pronunciada do que no SLS. Geometrias com grandes volantos requerem estruturas de suporte que geram marcas na superfície de contato.

## SLA — Stereolithography

No SLA, um laser UV cura resina fotopolimérica líquida camada a camada com precisão de até 25 micrômetros. O resultado é um acabamento superficial incomparável no mundo da impressão 3D: superfícies completamente lisas que rivalizam com peças injetadas, sem pós-processamento extensivo.

**Quando usar SLA:** modelos de apresentação e marketing, jigs e fixtures de inspeção dimensional, padrões de fundição, componentes ópticos e peças que precisam de detalhamento fino (roscas M2, recursos sub-milimétricos).

**Limitações do SLA:** resinas fotopoliméricas são menos resistentes termicamente e mecanicamente do que termoplásticos de engenharia. A degradação UV ao longo do tempo é um fator real em aplicações externas. O custo de resina por cm³ é significativamente maior que o filamento FDM equivalente.

## SLS — Selective Laser Sintering

O SLS sinteriza pó de poliamida (Nylon PA12 ou variantes) com um laser CO₂. O diferencial mais importante: **não há necessidade de estruturas de suporte** — o pó não sinterizado sustenta a peça durante o processo. Isso libera a geometria completamente, permitindo canais internos, estruturas em lattice e encaixes impossíveis por outros métodos.

**Quando usar SLS:** peças com geometria complexa interna (dutos, canais de resfriamento), produção de médias séries onde o custo fixo é diluído, componentes em Nylon PA12 que precisam de isotropia mecânica, montagens com articulações impressas já integradas.

**Custo-benefício em séries:** o SLS tem custo de setup mais alto, mas permite empilhar dezenas de peças dentro do volume de build — reduzindo o custo unitário em séries acima de 20–30 peças. Para lotes maiores, o SLS frequentemente supera o FDM em custo por peça.

## Como Decidir em 3 Perguntas

<div class="glass-panel rounded-sm p-6 my-8 border border-primary-container/15 space-y-4 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<div class="flex gap-4 items-start">
<span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">1</span>
<div>
<p class="text-on-surface font-medium mb-1">O acabamento superficial é crítico para a funcionalidade ou apresentação?</p>
<p class="text-tertiary text-body-md">→ <strong class="text-primary-container">Sim:</strong> considere SLA. → <strong class="text-on-surface">Não:</strong> passe para a próxima pergunta.</p>
</div>
</div>
<div class="flex gap-4 items-start">
<span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">2</span>
<div>
<p class="text-on-surface font-medium mb-1">A peça tem geometria interna complexa (canais, cavidades) ou será produzida em série acima de 20 unidades?</p>
<p class="text-tertiary text-body-md">→ <strong class="text-primary-container">Sim:</strong> SLS é provavelmente o mais adequado. → <strong class="text-on-surface">Não:</strong> passe para a próxima pergunta.</p>
</div>
</div>
<div class="flex gap-4 items-start">
<span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">3</span>
<div>
<p class="text-on-surface font-medium mb-1">O material é fator determinante (PEEK, PC, metal, flexível, reforçado com fibra)?</p>
<p class="text-tertiary text-body-md">→ <strong class="text-primary-container">Sim:</strong> FDM industrial com câmara aquecida é o único processo que atende. → <strong class="text-on-surface">Não:</strong> FDM é a escolha padrão por custo e velocidade.</p>
</div>
</div>
</div>
`,
}
