import type { LegacyPost } from '../types'

export const post: LegacyPost = {
  slug: 'slm-sls-sla-fdm-qual-tecnologia-escolher',
  title: 'SLM, SLS, SLA ou FDM: Qual Tecnologia de Impressão 3D Escolher',
  excerpt:
    'As quatro principais tecnologias de manufatura aditiva industrial — SLM, SLS, SLA e FDM — explicadas sem jargão: como funcionam, que materiais aceitam, custo, precisão e quando cada uma é a escolha certa.',
  metaTitle: 'SLM vs SLS vs SLA vs FDM: Guia Comparativo Completo — AUMAF 3D',
  metaDescription:
    'Comparativo técnico entre SLM, SLS, SLA e FDM: princípio físico, materiais, precisão, custo e aplicações ideais. Decisão estruturada por tipo de peça.',
  category: 'Guia Técnico',
  publishedAt: new Date('2026-05-16T12:30:00Z'),
  readingTimeMin: 12,
  featured: true,
  tags: ['slm', 'sls', 'sla', 'fdm', 'comparativo', 'manufatura-aditiva', 'impressao-3d-industrial'],
  coverImage: {
    localPath: 'frontend-public/public/images/blog-cover-slm-sls-sla-fdm.webp',
    filename: 'blog-cover-slm-sls-sla-fdm.webp',
  },
  content: `Existe uma confusão recorrente quando se fala em impressão 3D industrial: tratar todas as tecnologias como variantes do mesmo processo. Não são. **SLM, SLS, SLA e FDM são quatro famílias com princípios físicos distintos**, cada uma com materiais, custos, precisões e geometrias adequadas próprias. Escolher errado significa peças que rachar sob carga, ferramental que custa o triplo do necessário, ou prazos triplicados porque a tecnologia escolhida é mais lenta que a alternativa óbvia.

Este guia trata as quatro tecnologias como o que elas são — ferramentas diferentes para problemas diferentes — e termina com um framework de decisão em 4 perguntas que cobre 90% dos projetos industriais.

## Visão geral das quatro tecnologias

<div class="glass-panel rounded-sm overflow-hidden border border-primary-container/15 my-8 relative">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<table class="w-full text-body-md">
<thead>
<tr class="bg-primary-container/10 border-b border-white/10">
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest">Tecnologia</th>
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest">Sigla</th>
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest">Princípio</th>
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest">Material</th>
</tr>
</thead>
<tbody>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface font-medium">FDM</td><td class="px-4 py-3 text-on-surface-variant">Fused Deposition Modeling</td><td class="px-4 py-3 text-on-surface-variant">Extrusão de filamento aquecido</td><td class="px-4 py-3 text-on-surface-variant">Termoplástico (PLA, PA, ABS, PC, TPU)</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface font-medium">SLA</td><td class="px-4 py-3 text-on-surface-variant">Stereolithography</td><td class="px-4 py-3 text-on-surface-variant">Cura UV de resina líquida por laser</td><td class="px-4 py-3 text-on-surface-variant">Resina fotopolimérica</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface font-medium">SLS</td><td class="px-4 py-3 text-on-surface-variant">Selective Laser Sintering</td><td class="px-4 py-3 text-on-surface-variant">Sinterização de pó polimérico por laser CO₂</td><td class="px-4 py-3 text-on-surface-variant">Pó de Nylon (PA12, PA11)</td></tr>
<tr><td class="px-4 py-3 text-on-surface font-medium">SLM</td><td class="px-4 py-3 text-on-surface-variant">Selective Laser Melting</td><td class="px-4 py-3 text-on-surface-variant">Fusão completa de pó metálico por laser de fibra</td><td class="px-4 py-3 text-on-surface-variant">Pó metálico (Aço Inox 316L, alumínio, titânio)</td></tr>
</tbody>
</table>
</div>

A diferença fundamental entre SLS e SLM merece destaque: ambos usam laser para consolidar pó camada por camada, mas SLS **sinteriza** (funde parcialmente as partículas, criando uma estrutura porosa controlada) enquanto SLM **funde completamente** (líquido total, resultando em peça densa equivalente à fundida). Essa diferença explica por que SLM serve apenas para metais (precisa de alta potência) e por que peças SLM têm propriedades mecânicas comparáveis a peças forjadas.

## FDM — Fused Deposition Modeling

### Como funciona

Um bico aquecido (180-400°C dependendo do material) extruda filamento termoplástico em camadas de 0,1 a 0,3mm de altura. A peça cresce camada por camada sobre uma mesa aquecida. **É o processo mais difundido na impressão 3D industrial** por uma razão prática: a maior variedade de materiais com o menor custo unitário.

### Vantagens

- **Variedade de materiais excepcional:** desde PLA simples até materiais técnicos como PA-CF15 (Nylon + fibra de carbono), Policarbonato (PC), TPU flexível, ASA resistente a UV.
- **Custo unitário baixo:** filamento custa frações de centavos por grama vs. resinas e pós.
- **Peças funcionais grandes:** volumes de impressão de até 600×600×600mm em equipamentos industriais.
- **Pós-processamento mínimo:** retirar suportes, eventualmente lixar. Sem solvente, sem cura UV, sem despoeiramento.

### Limitações

- **Anisotropia mecânica significativa:** a peça é até 30% menos resistente no eixo Z (entre camadas) do que no plano XY. Projetar pensando na orientação de impressão é obrigatório para peças sob carga.
- **Acabamento superficial com linhas visíveis:** camadas de 0,2mm são perceptíveis ao toque. Para superfícies funcionais lisas, é preciso lixar ou usar SLA.
- **Necessidade de suportes:** peças com grandes balanços (>45°) precisam de estruturas de suporte que deixam marcas na remoção.

### Quando escolher FDM

Componentes funcionais com requisitos mecânicos definidos, protótipos que serão testados sob carga, peças de reposição em material técnico (PA, PC, PEEK quando disponível), produção de pequenas séries (1-50 unidades) onde custo de material é fator determinante. **A escolha padrão para 70% dos projetos industriais.**

## SLA — Stereolithography

### Como funciona

Um laser UV (geralmente 405nm) cura resina fotopolimérica líquida camada por camada com precisão de 25 a 100 micrômetros. A peça é construída de cabeça para baixo — a plataforma sobe do tanque de resina conforme as camadas curam. Após a impressão, a peça passa por **pós-cura UV** em câmara para atingir propriedades mecânicas finais.

### Vantagens

- **Acabamento superficial incomparável:** superfícies lisas comparáveis à injeção plástica, sem pós-processamento extensivo.
- **Precisão dimensional excelente:** ±0,025-0,05mm. Recursos sub-milimétricos (textos, roscas M2) saem nítidos.
- **Variedade de resinas técnicas:** flexíveis (Flexible), de alta temperatura (High Temp, até 238°C HDT), resistentes ao impacto (Tough), biocompatíveis (Class IIa para uso médico dental).
- **Geometrias complexas com detalhamento fino:** ideal para joalheria, padrões de fundição, modelos médicos dentais.

### Limitações

- **Resinas têm propriedades mecânicas inferiores aos termoplásticos:** mais frágeis, menos resistentes a impacto, deterioram sob UV ao longo do tempo (não usar em aplicações externas sem coating).
- **Custo por cm³ significativamente maior que filamento FDM:** resina técnica custa 5-15× mais que filamento equivalente.
- **Pós-processamento extensivo:** lavagem com IPA (álcool isopropílico), remoção de suportes finos com cuidado para não marcar, pós-cura UV obrigatória.
- **Volume de impressão menor:** equipamentos industriais SLA típicos ficam em torno de 600×600×400mm.

### Quando escolher SLA

Modelos de apresentação e marketing onde o visual importa, jigs e fixtures de inspeção dimensional que precisam de precisão sub-décimo de milímetro, padrões de fundição (lost-wax casting), componentes ópticos transparentes, modelos médicos e dentais. **Não escolher SLA para peças funcionais sob carga ou exposição UV prolongada.**

## SLS — Selective Laser Sintering

### Como funciona

Um laser CO₂ sinteriza pó de Nylon (PA12 principalmente, PA11 quando precisa de mais flexibilidade) camada por camada dentro de uma câmara aquecida a 165-175°C. **A grande sacada do SLS: o próprio pó não-sinterizado sustenta a peça durante a impressão.** Não há necessidade de estruturas de suporte. Após a impressão, a câmara esfria e as peças são extraídas do "bolo" de pó.

### Vantagens

- **Liberdade geométrica total:** canais internos, cavidades fechadas, lattices, mecanismos articulados impressos em uma única operação (dobradiças funcionais, correntes, encaixes snap-fit).
- **Isotropia mecânica:** propriedades muito mais uniformes em todas as direções do que o FDM. O Nylon SLS comporta-se mecanicamente próximo de uma peça injetada.
- **Eficiência em séries médias:** dezenas de peças podem ser empilhadas verticalmente dentro do volume de build. Para lotes de 20-200 unidades, o custo unitário frequentemente bate FDM e SLA.
- **Acabamento granulado fino e uniforme:** textura matte característica, dimensionalmente estável, pintável.

### Limitações

- **Cor restrita:** branco/cinza natural do PA12. Tingimento (dyeing) pós-processo oferece preto, vermelho, azul — mas variabilidade de cor entre lotes.
- **Variedade de materiais menor que FDM:** Nylon e variantes (PA12, PA11, PA12 + fibra de vidro, PA12 + fibra de carbono, TPU SLS). Sem termoplásticos de altíssima temperatura.
- **Custo de pó:** material virgem + pó reciclável da câmara anterior. Custo por kg é 3-5× maior que filamento PA equivalente.
- **Acabamento poroso:** superfície absorve líquidos e sujeira. Para aplicações com fluidos, é preciso selar (verniz, infiltração).

### Quando escolher SLS

Peças com geometria complexa interna (dutos, canais de resfriamento, manifolds), produção de médias séries (20-200 unidades) onde o custo fixo é diluído, componentes em Nylon PA12 que precisam de isotropia mecânica, montagens com articulações impressas integradas. **A escolha técnica certa quando geometria importa mais do que custo unitário em escala.**

## SLM — Selective Laser Melting

### Como funciona

Um laser de fibra de alta potência (200-1000W) funde completamente pó metálico camada por camada dentro de uma câmara com atmosfera inerte (argônio ou nitrogênio para prevenir oxidação). Cada camada tem 20-60μm. A peça resultante tem **densidade superior a 99,5%** — equivalente a peças fundidas em qualidade metalúrgica.

Após a impressão, a peça passa por: alívio de tensões térmicas (tratamento térmico em forno), remoção da plataforma de build (corte com serra ou EDM), remoção de suportes (mecânica ou usinagem), HIP (Hot Isostatic Pressing) quando aplicação exige porosidade próxima de zero, e usinagem final dos diâmetros funcionais e roscas.

### Vantagens

- **Geometrias impossíveis na usinagem convencional:** canais internos de resfriamento que seguem a geometria da peça, estruturas em lattice topologicamente otimizadas para razão peso/resistência, consolidação de assemblies em peça única.
- **Materiais metálicos de engenharia:** Aço Inox 316L (corrosão), Aço Maraging (alta resistência), Alumínio AlSi10Mg (leveza), Titânio Ti-6Al-4V (aeronáutico), Inconel 718 (alta temperatura).
- **Propriedades mecânicas comparáveis a forjados:** após HIP, peças SLM atingem 95-105% das propriedades da peça forjada equivalente.
- **Sem ferramental:** mesma vantagem das outras tecnologias aditivas — viabilidade econômica para 1 peça.

### Limitações

- **Custo significativamente maior que outras tecnologias:** equipamento de R$ 2-5M+, pó metálico de R$ 200-2.000/kg, ciclo total (impressão + pós-processo) de dias.
- **Volume de impressão restrito:** equipamentos típicos têm câmaras de 250×250×300mm a 500×280×850mm.
- **Pós-processamento complexo e obrigatório:** alívio térmico, remoção de suportes, usinagem dos diâmetros funcionais — uma peça SLM "como sai" da máquina raramente é o produto final.
- **Pegada superficial áspera nas regiões com suporte:** Ra típico de 6-12μm bruto, exige usinagem para superfícies funcionais.

### Quando escolher SLM

Componentes metálicos com geometria que justifica o processo (lattices, canais conformais, consolidação de assemblies), peças únicas ou pequenas séries de metal onde usinagem CNC seria proibitivamente cara, substituição de peças metálicas obsoletas, componentes leves com requisitos de razão peso/resistência exigentes. **A escolha quando o problema obriga metal e a geometria justifica.**

## Custo comparativo: ordens de grandeza

Para uma peça funcional padrão (volume típico ~50cm³, 1 unidade) — valores são ordens de grandeza, não cotações:

<div class="glass-panel rounded-sm overflow-hidden border border-primary-container/15 my-8 relative">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<table class="w-full text-body-md">
<thead>
<tr class="bg-primary-container/10 border-b border-white/10">
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest">Tecnologia</th>
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest">Faixa de preço/peça</th>
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest">Tempo total típico</th>
</tr>
</thead>
<tbody>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface">FDM (PA12)</td><td class="px-4 py-3 text-on-surface-variant">R$ 80 — R$ 400</td><td class="px-4 py-3 text-on-surface-variant">1-3 dias</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface">SLA (resina técnica)</td><td class="px-4 py-3 text-on-surface-variant">R$ 200 — R$ 900</td><td class="px-4 py-3 text-on-surface-variant">2-4 dias</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface">SLS (Nylon PA12)</td><td class="px-4 py-3 text-on-surface-variant">R$ 350 — R$ 1.200</td><td class="px-4 py-3 text-on-surface-variant">3-5 dias</td></tr>
<tr><td class="px-4 py-3 text-on-surface">SLM (Aço Inox 316L)</td><td class="px-4 py-3 text-on-surface-variant">R$ 2.500 — R$ 12.000+</td><td class="px-4 py-3 text-on-surface-variant">5-10 dias</td></tr>
</tbody>
</table>
</div>

A diferença entre R$ 100 e R$ 10.000 não é "marketing" — é trabalho real: pó metálico custa 100× mais que filamento, ciclo de impressão SLM é 10× mais lento, pós-processamento é obrigatório e extensivo. Quando metal é necessário, é necessário. Mas escolher SLM quando FDM resolveria é desperdício.

## Framework de decisão em 4 perguntas

<div class="glass-panel rounded-sm p-6 my-8 border border-primary-container/15 space-y-5 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<div class="flex gap-4 items-start"><span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">1</span><div><p class="text-on-surface font-medium mb-1">A peça precisa ser de metal?</p><p class="text-tertiary text-body-md">→ <strong class="text-primary-container">Sim:</strong> SLM (ou usinagem CNC se geometria é simples). → <strong class="text-on-surface">Não:</strong> passe para a próxima pergunta.</p></div></div>
<div class="flex gap-4 items-start"><span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">2</span><div><p class="text-on-surface font-medium mb-1">O acabamento superficial é crítico (apresentação, fitting de alta precisão, ótica)?</p><p class="text-tertiary text-body-md">→ <strong class="text-primary-container">Sim:</strong> SLA. → <strong class="text-on-surface">Não:</strong> passe para a próxima pergunta.</p></div></div>
<div class="flex gap-4 items-start"><span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">3</span><div><p class="text-on-surface font-medium mb-1">A peça tem geometria interna complexa OU será produzida em série acima de 20 unidades?</p><p class="text-tertiary text-body-md">→ <strong class="text-primary-container">Sim:</strong> SLS. → <strong class="text-on-surface">Não:</strong> passe para a próxima pergunta.</p></div></div>
<div class="flex gap-4 items-start"><span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">4</span><div><p class="text-on-surface font-medium mb-1">Padrão para o restante</p><p class="text-tertiary text-body-md">→ <strong class="text-primary-container">FDM</strong> — escolha default para peças funcionais com flexibilidade de material e custo unitário acessível.</p></div></div>
</div>

## Casos onde duas tecnologias competem

Algumas zonas de fronteira merecem atenção:

**FDM (PA-CF15) vs. SLS (PA12):** ambos servem peças funcionais em Nylon. FDM ganha em custo unitário e tempo para 1-5 peças. SLS ganha em isotropia mecânica, geometria complexa e séries acima de 20 unidades.

**SLA vs. SLS para protótipos de validação:** SLA dá acabamento melhor mas é frágil. SLS é mais robusto mas tem textura matte característica. Para protótipo de marketing, SLA. Para protótipo funcional de teste, SLS.

**SLM vs. usinagem CNC para metal:** SLM ganha quando há lattice, canal interno conformal, ou peça única. CNC ganha em volume, simplicidade geométrica, e acabamento superficial bruto.

## Conclusão

A indústria 3D sofre de uma compulsão por novidade. Toda apresentação de fornecedor mostra o último material exótico, a peça mais geométrica, o caso de uso mais espetacular. Na operação diária, **70% dos projetos industriais são bem resolvidos por FDM em material técnico padrão**. Os outros 30% se distribuem entre SLA, SLS e SLM conforme requisitos específicos de superfície, geometria ou material.

A AUMAF 3D opera as quatro tecnologias na sede em São Carlos – SP, com equipe técnica de modelagem, engenharia reversa e pós-processamento. Para discutir qual processo é o certo para sua peça, <a href="/contato?ref=blog-tecnologias-3d" class="text-primary-container hover:underline">envie os requisitos pelo formulário</a> ou explore <a href="/servicos" class="text-primary-container hover:underline">os serviços oferecidos</a>.

---

**Leitura complementar:**
- <a href="/blog/processo-impressao-3d-slm-passo-a-passo" class="text-primary-container hover:underline">Como funciona o processo SLM passo a passo</a>
- <a href="/blog/impressao-3d-metalica-quando-slm-melhor-escolha" class="text-primary-container hover:underline">Quando SLM é a melhor escolha</a>
- <a href="/materiais" class="text-primary-container hover:underline">Catálogo completo de materiais</a>
- <a href="/glossario" class="text-primary-container hover:underline">Glossário técnico de manufatura aditiva</a>
`,
}
