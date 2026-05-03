import type { LegacyPost } from '../types'

export const post: LegacyPost = {
  slug: 'guia-materiais-impressao-3d',
  title: 'Guia Completo de Materiais: Como Escolher o Filamento Certo para Cada Aplicação',
  excerpt:
    'Da seleção de termoplásticos padrão a materiais de alta performance como PEEK e metal via FDM — um guia técnico completo para engenheiros que precisam tomar a decisão certa de material.',
  metaTitle: 'Guia Completo de Materiais para Impressão 3D — AUMAF 3D',
  metaDescription:
    'Catálogo técnico de materiais de impressão 3D: ABS, PET-G, Nylon PA12, PC, PA CF15, PEEK, TPU, 316L. Especificações, aplicações e quando usar cada um.',
  category: 'Materiais',
  publishedAt: new Date('2026-05-01T11:00:00Z'),
  readingTimeMin: 6,
  featured: false,
  tags: ['materiais', 'filamentos', 'peek', 'pa-cf15', '316l', 'tpu'],
  coverImage: null,
  content: `Quando engenheiros pensam em impressão 3D industrial, o primeiro questionamento costuma ser sobre o processo (FDM, SLA, SLS). Mas a decisão de material é frequentemente mais determinante para o sucesso da peça do que a tecnologia de impressão em si. Um PEEK processado corretamente supera um ABS de qualquer fornecedor em temperatura e biocompatibilidade — independente do equipamento usado.

Este guia cobre o portfólio de materiais disponíveis na AUMAF 3D, organizados por categoria, com especificações técnicas relevantes e orientação de aplicação para cada um.

## Categorias do Portfólio

<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
<a href="#termoplasticos" class="glass-panel rounded-sm p-4 border border-white/8 hover:border-primary-container/40 transition-all group"><span class="text-label-caps text-primary-container uppercase tracking-widest block text-[10px] mb-1">Termoplásticos Padrão</span><span class="text-body-md text-tertiary text-sm leading-snug">ABS, PET-G, Nylon PA12, PC</span></a>
<a href="#alta-performance" class="glass-panel rounded-sm p-4 border border-white/8 hover:border-primary-container/40 transition-all group"><span class="text-label-caps text-primary-container uppercase tracking-widest block text-[10px] mb-1">Alta Performance</span><span class="text-body-md text-tertiary text-sm leading-snug">PA CF15, PEEK, Tritan HT</span></a>
<a href="#flexiveis" class="glass-panel rounded-sm p-4 border border-white/8 hover:border-primary-container/40 transition-all group"><span class="text-label-caps text-primary-container uppercase tracking-widest block text-[10px] mb-1">Flexíveis</span><span class="text-body-md text-tertiary text-sm leading-snug">TPU 95A, Flex 85A</span></a>
<a href="#metal" class="glass-panel rounded-sm p-4 border border-white/8 hover:border-primary-container/40 transition-all group"><span class="text-label-caps text-primary-container uppercase tracking-widest block text-[10px] mb-1">Metal via FDM</span><span class="text-body-md text-tertiary text-sm leading-snug">BASF Ultrafuse 316L</span></a>
<a href="#resinas" class="glass-panel rounded-sm p-4 border border-white/8 hover:border-primary-container/40 transition-all group"><span class="text-label-caps text-primary-container uppercase tracking-widest block text-[10px] mb-1">Resinas SLA</span><span class="text-body-md text-tertiary text-sm leading-snug">Standard, Tough, Flexible</span></a>
<a href="#pos-sls" class="glass-panel rounded-sm p-4 border border-white/8 hover:border-primary-container/40 transition-all group"><span class="text-label-caps text-primary-container uppercase tracking-widest block text-[10px] mb-1">Pós SLS</span><span class="text-body-md text-tertiary text-sm leading-snug">PA12, PA12 GB, TPU</span></a>
</div>

<h2 id="termoplasticos">Termoplásticos Padrão</h2>

Os termoplásticos padrão cobrem a grande maioria das aplicações de prototipagem funcional e produção de peças de uso geral. São materiais bem documentados, com comportamento previsível e custo acessível.

<div class="space-y-4 my-6">
<div class="glass-panel rounded-sm p-5 border border-white/8">
<div class="flex items-start justify-between gap-4 mb-2">
<h3 class="text-body-lg font-bold text-white uppercase tracking-wide">ABS — Acrilonitrila Butadieno Estireno</h3>
<span class="pill flex-shrink-0">Versátil</span>
</div>
<p class="text-body-md text-tertiary leading-relaxed mb-3">Temperatura de serviço até 80°C, boa resistência mecânica e ao impacto, usinável e colável com acetona. Ideal para peças funcionais de uso geral, suportes, gabinetes, maquetes funcionais. Requer câmara fechada para reduzir warping em peças grandes.</p>
<div class="flex flex-wrap gap-3 text-code-data text-[11px]">
<span class="text-primary-container">Temp. serviço: 80°C</span>
<span class="text-on-surface-variant">Resistência impacto: média</span>
<span class="text-on-surface-variant">Pós-proc.: acetona, lixa</span>
</div>
</div>

<div class="glass-panel rounded-sm p-5 border border-white/8">
<div class="flex items-start justify-between gap-4 mb-2">
<h3 class="text-body-lg font-bold text-white uppercase tracking-wide">PET-G — Polietileno Tereftalato Glicol</h3>
<span class="pill flex-shrink-0">Popular</span>
</div>
<p class="text-body-md text-tertiary leading-relaxed mb-3">Excelente equilíbrio entre facilidade de impressão, translucidez e adesão entre camadas. Temperatura de serviço até 75°C, baixa contração — resistência ao warping superior ao ABS. Indicado para peças que precisam ser visualizadas internamente, recipientes, componentes com encaixes precisos.</p>
<div class="flex flex-wrap gap-3 text-code-data text-[11px]">
<span class="text-primary-container">Temp. serviço: 75°C</span>
<span class="text-on-surface-variant">Translucidez: alta</span>
<span class="text-on-surface-variant">Warping: muito baixo</span>
</div>
</div>

<div class="glass-panel rounded-sm p-5 border border-white/8">
<div class="flex items-start justify-between gap-4 mb-2">
<h3 class="text-body-lg font-bold text-white uppercase tracking-wide">Nylon PA12 — Poliamida 12</h3>
<span class="pill flex-shrink-0">Engenharia</span>
</div>
<p class="text-body-md text-tertiary leading-relaxed mb-3">Alta resistência ao impacto e à abrasão, baixo coeficiente de atrito — propriedades que tornam o PA12 o material de referência para componentes mecânicos com movimento relativo: engrenagens, guias, buchas, trilhos. Absorção de umidade requer armazenamento adequado do filamento.</p>
<div class="flex flex-wrap gap-3 text-code-data text-[11px]">
<span class="text-primary-container">Resistência abrasão: excelente</span>
<span class="text-on-surface-variant">Coef. atrito: baixo</span>
<span class="text-on-surface-variant">Temp. serviço: 100°C</span>
</div>
</div>

<div class="glass-panel rounded-sm p-5 border border-white/8">
<div class="flex items-start justify-between gap-4 mb-2">
<h3 class="text-body-lg font-bold text-white uppercase tracking-wide">PC — Policarbonato</h3>
<span class="pill flex-shrink-0">Alta Temp.</span>
</div>
<p class="text-body-md text-tertiary leading-relaxed mb-3">O termoplástico de maior resistência térmica da linha padrão — temperatura de serviço até 120°C. Transparência óptica que permite versões translúcidas para peças ópticas e de iluminação. Alta rigidez e resistência ao impacto. Exige temperatura de impressão acima de 270°C e câmara aquecida.</p>
<div class="flex flex-wrap gap-3 text-code-data text-[11px]">
<span class="text-primary-container">Temp. serviço: 120°C</span>
<span class="text-on-surface-variant">Transparência: alta</span>
<span class="text-on-surface-variant">Rigidez: muito alta</span>
</div>
</div>
</div>

<h2 id="alta-performance">Alta Performance</h2>

Materiais de alta performance são processados em equipamentos FDM com câmara aquecida acima de 60–70°C e bicos de temperatura ultra-alta (acima de 400°C para PEEK). São a fronteira onde a impressão 3D compete diretamente com usinagem CNC e injeção plástica em propriedades mecânicas.

<div class="space-y-4 my-6">
<div class="glass-panel rounded-sm p-5 border border-primary-container/20 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<div class="flex items-start justify-between gap-4 mb-2">
<h3 class="text-body-lg font-bold text-white uppercase tracking-wide">PA CF15 — Nylon com 15% Fibra de Carbono</h3>
<span class="pill-green flex-shrink-0">Destaque</span>
</div>
<p class="text-body-md text-tertiary leading-relaxed mb-3">O melhor custo-benefício em rigidez por peso no portfólio FDM. A fibra de carbono picada a 15% aumenta o módulo de elasticidade em ~60% em relação ao PA puro, com redução de 10–15% no peso da peça pela menor densidade do material. Indicado para estruturas aeroespaciais leves, componentes de automação, suportes e brackets estruturais.</p>
<div class="flex flex-wrap gap-3 text-code-data text-[11px]">
<span class="text-primary-container">Módulo: +60% vs PA puro</span>
<span class="text-on-surface-variant">Densidade: 1.10 g/cm³</span>
<span class="text-on-surface-variant">Temp. serviço: 110°C</span>
</div>
</div>

<div class="glass-panel rounded-sm p-5 border border-white/8">
<div class="flex items-start justify-between gap-4 mb-2">
<h3 class="text-body-lg font-bold text-white uppercase tracking-wide">PEEK — Poliéter Éter Cetona</h3>
<span class="pill flex-shrink-0">Aeroespacial</span>
</div>
<p class="text-body-md text-tertiary leading-relaxed mb-3">O topo da pirâmide dos termoplásticos de engenharia. Temperatura de uso contínuo acima de 250°C, biocompatível (ISO 10993), resistente a ácidos concentrados e hidrocarbonetos. Aplicações: implantes médicos, peças para motores, ambientes de alta temperatura, componentes aeroespaciais submetidos a cargas severas. Processamento exige bico a 400–450°C e câmara a 120°C.</p>
<div class="flex flex-wrap gap-3 text-code-data text-[11px]">
<span class="text-primary-container">Temp. contínua: 250°C+</span>
<span class="text-on-surface-variant">Biocompatível: ISO 10993</span>
<span class="text-on-surface-variant">Resistência química: excelente</span>
</div>
</div>

<div class="glass-panel rounded-sm p-5 border border-white/8">
<div class="flex items-start justify-between gap-4 mb-2">
<h3 class="text-body-lg font-bold text-white uppercase tracking-wide">Tritan HT — Alta Transparência Térmica</h3>
<span class="pill flex-shrink-0">Óptico</span>
</div>
<p class="text-body-md text-tertiary leading-relaxed mb-3">Copoliéster de alta performance desenvolvido pela Eastman. Transparência óptica excepcional mesmo após esterilização por autoclave a 121°C. Ideal para componentes médicos e laboratoriais que precisam de visibilidade do conteúdo a temperaturas de esterilização padrão. Excelente resistência hidrolítica — não amarela com exposição a água quente.</p>
<div class="flex flex-wrap gap-3 text-code-data text-[11px]">
<span class="text-primary-container">Temp. autoclave: 121°C</span>
<span class="text-on-surface-variant">Transparência: >90%</span>
<span class="text-on-surface-variant">BPA Free</span>
</div>
</div>
</div>

<h2 id="flexiveis">Materiais Flexíveis</h2>

Os elastômeros termoplásticos permitem imprimir peças com comportamento borrachoso — desde grips semi-rígidos até peças com elasticidade máxima. A dureza Shore A é o parâmetro principal para seleção.

<div class="grid sm:grid-cols-2 gap-4 my-6">
<div class="glass-panel rounded-sm p-5 border border-white/8">
<h3 class="text-body-lg font-bold text-white uppercase tracking-wide mb-2">TPU 95A</h3>
<p class="text-body-md text-tertiary leading-relaxed mb-3">Poliuretano termoplástico de dureza Shore 95A — o mais rígido da linha flexível. Boa resistência ao desgaste, óleo e abrasão. Indicado para juntas, vedações, solas, protetores de queda, peças de transmissão de torque com absorção de vibração.</p>
<span class="text-code-data text-primary-container text-[11px]">Shore 95A · Elongação: 500%</span>
</div>
<div class="glass-panel rounded-sm p-5 border border-white/8">
<h3 class="text-body-lg font-bold text-white uppercase tracking-wide mb-2">Flex 85A</h3>
<p class="text-body-md text-tertiary leading-relaxed mb-3">Flexibilidade máxima no portfólio FDM. Shore 85A permite deformação elástica significativa sem ruptura. Aplicações: protetores de cabos, borrachas de vedação complexas, modelos médicos de tecidos moles, grips ergonômicos, amortecedores personalizados.</p>
<span class="text-code-data text-primary-container text-[11px]">Shore 85A · Elongação: 700%</span>
</div>
</div>

<h2 id="metal">Metal via FDM — BASF Ultrafuse 316L</h2>

O Ultrafuse 316L da BASF é um filamento FDM composto por aço inoxidável 316L em matriz polimérica. A peça é impressa normalmente em FDM, passando por um processo de debinding (remoção do polímero) e sinterização posterior em forno a temperaturas acima de 1300°C.

<div class="glass-panel rounded-sm p-6 my-6 border border-primary-container/15 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<span class="text-label-caps text-on-surface-variant uppercase tracking-[0.2em] block mb-4">Especificações Técnicas — 316L Pós-Sinterização</span>
<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
<div class="border-b border-white/8 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Aço</span><span class="text-body-md text-on-surface font-medium">316L (ISO)</span></div>
<div class="border-b border-white/8 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Temperatura sinterização</span><span class="text-body-md text-on-surface font-medium">1300–1380°C</span></div>
<div class="border-b border-white/8 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Densidade</span><span class="text-body-md text-on-surface font-medium">>95% do teórico</span></div>
<div class="border-b border-white/8 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Resistência à tração</span><span class="text-body-md text-on-surface font-medium">~480 MPa</span></div>
<div class="border-b border-white/8 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Dureza</span><span class="text-body-md text-on-surface font-medium">~80 HRB</span></div>
<div class="border-b border-white/8 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Conformidade</span><span class="text-body-md text-on-surface font-medium">ASTM A276</span></div>
</div>
</div>

A grande vantagem do 316L via FDM é a liberdade geométrica impossível por usinagem — canais curvos internos, estruturas em lattice metálicas, peças com geometria orgânica. A contração de sinterização é de aproximadamente 15–20% em cada eixo e deve ser compensada no modelo CAD.

## Tabela Resumo de Seleção

<div class="glass-panel rounded-sm overflow-hidden border border-primary-container/15 my-8">
<table class="w-full text-body-md">
<thead>
<tr class="bg-primary-container/10 border-b border-white/10">
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest text-[10px]">Material</th>
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest text-[10px]">Temp. Serviço</th>
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest text-[10px]">Resistência</th>
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest text-[10px]">Custo</th>
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest text-[10px]">Aplicação Ideal</th>
</tr>
</thead>
<tbody>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-primary-container font-medium">ABS</td><td class="px-4 py-3 text-on-surface">80°C</td><td class="px-4 py-3 text-on-surface-variant">Média</td><td class="px-4 py-3 text-on-surface-variant">●○○○</td><td class="px-4 py-3 text-on-surface-variant text-sm">Peças funcionais gerais</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-primary-container font-medium">PET-G</td><td class="px-4 py-3 text-on-surface">75°C</td><td class="px-4 py-3 text-on-surface-variant">Média-Alta</td><td class="px-4 py-3 text-on-surface-variant">●○○○</td><td class="px-4 py-3 text-on-surface-variant text-sm">Peças com encaixes precisos</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-primary-container font-medium">Nylon PA12</td><td class="px-4 py-3 text-on-surface">100°C</td><td class="px-4 py-3 text-on-surface-variant">Alta</td><td class="px-4 py-3 text-on-surface-variant">●●○○</td><td class="px-4 py-3 text-on-surface-variant text-sm">Engrenagens, guias, buchas</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-primary-container font-medium">PC</td><td class="px-4 py-3 text-on-surface">120°C</td><td class="px-4 py-3 text-on-surface-variant">Muito Alta</td><td class="px-4 py-3 text-on-surface-variant">●●○○</td><td class="px-4 py-3 text-on-surface-variant text-sm">Alta temperatura, óptica</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-primary-container font-medium">PA CF15</td><td class="px-4 py-3 text-on-surface">110°C</td><td class="px-4 py-3 text-on-surface-variant">Muito Alta</td><td class="px-4 py-3 text-on-surface-variant">●●●○</td><td class="px-4 py-3 text-on-surface-variant text-sm">Estrutural leve</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-primary-container font-medium">PEEK</td><td class="px-4 py-3 text-on-surface">250°C+</td><td class="px-4 py-3 text-on-surface-variant">Extrema</td><td class="px-4 py-3 text-on-surface-variant">●●●●</td><td class="px-4 py-3 text-on-surface-variant text-sm">Aeroespacial, médico</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-primary-container font-medium">TPU 95A</td><td class="px-4 py-3 text-on-surface">80°C</td><td class="px-4 py-3 text-on-surface-variant">Flex. rígido</td><td class="px-4 py-3 text-on-surface-variant">●●○○</td><td class="px-4 py-3 text-on-surface-variant text-sm">Juntas, vedações</td></tr>
<tr><td class="px-4 py-3 text-primary-container font-medium">316L</td><td class="px-4 py-3 text-on-surface">800°C+</td><td class="px-4 py-3 text-on-surface-variant">Metálica</td><td class="px-4 py-3 text-on-surface-variant">●●●●</td><td class="px-4 py-3 text-on-surface-variant text-sm">Metal com geometria livre</td></tr>
</tbody>
</table>
</div>
`,
}
