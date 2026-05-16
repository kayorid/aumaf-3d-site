import type { LegacyPost } from '../types'

export const post: LegacyPost = {
  slug: 'formula-sae-case-study-completo',
  title: 'Case Completo: Fórmula SAE USP São Carlos 2024 — Do Arquivo à Pista',
  excerpt:
    'Como a AUMAF 3D entregou 7 componentes críticos para o carro da Fórmula SAE USP São Carlos em 5 dias úteis — com tolerância ±0.05mm e aprovação no primeiro lote sem retrabalho.',
  metaTitle: 'Case Fórmula SAE USP São Carlos 2024 — AUMAF 3D',
  metaDescription:
    'Entrega de 7 peças impressas em 3D em 5 dias para a Fórmula SAE USP São Carlos: Nylon PA, PET-G CF15, tolerância ±0.05mm, aprovação no primeiro lote.',
  category: 'Case Study',
  publishedAt: new Date('2026-05-01T10:00:00Z'),
  readingTimeMin: 5,
  featured: false,
  tags: ['formula-sae', 'usp', 'motorsport', 'nylon-pa', 'pet-g-cf15', 'dfam'],
  coverImage: { localPath: 'frontend-public/public/images/SAE-formula.webp', filename: 'SAE-formula.webp' },
  content: `## O Que é Fórmula SAE

A Fórmula SAE é a principal competição de engenharia automotiva para estudantes universitários no mundo. Equipes projetam, constroem e competem com um carro de formula de corrida desde o zero, sendo avaliadas em quesitos de performance dinâmica, design de engenharia, análise de negócios e eficiência de custo. A USP São Carlos, reconhecida como uma das melhores escolas de engenharia do Brasil, participa regularmente com times de Engenharia Mecânica e Elétrica.

A exigência técnica da competição é real: os juízes são engenheiros da indústria automotiva. Peças que falham na pista eliminam a equipe. Peças fora de tolerância reprovam na inspeção técnica. Não há margem para componentes medianos.

## O Desafio

A equipe Fórmula SAE USP São Carlos chegou até a AUMAF 3D com um briefing direto e exigente: 7 componentes impressos em 3D, prazo de 5 dias úteis, tolerância dimensional de ±0.05mm nas interfaces críticas e peso minimizado em todas as peças.

<div class="glass-panel rounded-sm p-6 my-8 border border-primary-container/15 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<span class="text-label-caps text-on-surface-variant uppercase tracking-[0.2em] block mb-4">Dados do Projeto</span>
<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
<div class="border-b border-white/8 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Parceiro</span><span class="text-body-md text-on-surface font-medium">USP São Carlos — Eng. Mecânica</span></div>
<div class="border-b border-white/8 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Evento</span><span class="text-body-md text-on-surface font-medium">Fórmula SAE Brasil 2024</span></div>
<div class="border-b border-white/8 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Componentes</span><span class="text-body-md text-on-surface font-medium">7 peças distintas</span></div>
<div class="border-b border-white/8 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Tolerância crítica</span><span class="text-body-md text-on-surface font-medium">±0.05mm</span></div>
<div class="border-b border-white/8 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Prazo</span><span class="text-body-md text-on-surface font-medium">5 dias úteis</span></div>
<div class="border-b border-white/8 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Resultado</span><span class="text-body-md text-on-surface font-medium">Aprovação 1º lote</span></div>
</div>
</div>

## Diagnóstico Técnico por Peça

Antes de iniciar a produção, cada componente foi avaliado individualmente para identificar a criticidade dimensional, o regime de carga esperado e o material mais adequado. Não existe "receita universal" em peças para motorsport.

<div class="space-y-3 my-6">
<div class="glass-panel rounded-sm p-5 border border-white/8">
<div class="flex items-start justify-between gap-4 mb-2">
<h3 class="text-body-lg font-bold text-white">Suportes de Suspensão (×2)</h3>
<span class="text-code-data text-primary-container text-[10px] flex-shrink-0">Alta — carga dinâmica sob impacto</span>
</div>
<p class="text-body-md text-tertiary leading-relaxed">Peças submetidas a forças de compressão e cisalhamento durante curvas e frenagem. Requisito: resistência ao impacto elevada e tolerância dimensional nas interfaces com a geometria do chassi. Material selecionado: Nylon PA para absorção de impacto sem fratura frágil.</p>
</div>

<div class="glass-panel rounded-sm p-5 border border-white/8">
<div class="flex items-start justify-between gap-4 mb-2">
<h3 class="text-body-lg font-bold text-white">Guias de Cabo (×3)</h3>
<span class="text-code-data text-primary-container text-[10px] flex-shrink-0">Média — tolerância dimensional crítica</span>
</div>
<p class="text-body-md text-tertiary leading-relaxed">Componentes de roteamento do sistema elétrico. Geometria com canais de passagem de cabo com diâmetro controlado — variação de ±0.1mm inviabiliza a montagem. Processo: FDM com câmara aquecida para controle de contração do PA.</p>
</div>

<div class="glass-panel rounded-sm p-5 border border-white/8">
<div class="flex items-start justify-between gap-4 mb-2">
<h3 class="text-body-lg font-bold text-white">Defletores Aerodinâmicos (×2)</h3>
<span class="text-code-data text-primary-container text-[10px] flex-shrink-0">Média — relação rigidez/peso</span>
</div>
<p class="text-body-md text-tertiary leading-relaxed">Peças de área superficial grande e geometria curvada. Carga aerodinâmica gera flexão — rigidez específica (módulo/densidade) é o parâmetro de seleção. PET-G CF15 (PETG com 15% de fibra de carbono) entrega a relação ideal.</p>
</div>
</div>

## Solução por Material e Processo

<div class="grid sm:grid-cols-2 gap-4 my-6">
<div class="glass-panel rounded-sm p-5 border border-primary-container/20 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<span class="text-label-caps text-primary-container uppercase tracking-widest block text-[10px] mb-2">Suportes estruturais + Guias</span>
<h3 class="text-body-lg font-bold text-white mb-2">Nylon PA</h3>
<p class="text-body-md text-tertiary leading-relaxed">Alta resistência ao impacto, baixo coeficiente de atrito nas superfícies de deslizamento dos cabos, e comportamento dúctil que evita falha catastrófica sob carga de impacto. FDM com câmara aquecida a 60°C e perfil de temperatura calibrado para cristalização correta do PA.</p>
</div>
<div class="glass-panel rounded-sm p-5 border border-primary-container/20 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<span class="text-label-caps text-primary-container uppercase tracking-widest block text-[10px] mb-2">Defletores aerodinâmicos</span>
<h3 class="text-body-lg font-bold text-white mb-2">PET-G CF15</h3>
<p class="text-body-md text-tertiary leading-relaxed">PETG reforçado com 15% de fibra de carbono picada. Módulo de flexão ~30% superior ao PETG puro com densidade significativamente menor que alumínio usinado. Resultado: peças mais leves que a alternativa metálica, com rigidez adequada para o regime de carga aerodinâmica.</p>
</div>
</div>

## Especificações por Componente

<div class="glass-panel rounded-sm overflow-hidden border border-primary-container/15 my-6">
<table class="w-full text-body-md">
<thead>
<tr class="bg-primary-container/10 border-b border-white/10">
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest text-[10px]">Peça</th>
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest text-[10px]">Material</th>
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest text-[10px]">Processo</th>
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest text-[10px]">Tolerância</th>
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest text-[10px]">Prazo</th>
</tr>
</thead>
<tbody>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface">Suporte suspensão ×2</td><td class="px-4 py-3 text-primary-container font-medium">Nylon PA</td><td class="px-4 py-3 text-on-surface-variant">FDM câmara aq.</td><td class="px-4 py-3 text-on-surface">±0.05mm</td><td class="px-4 py-3 text-on-surface-variant">Dia 2</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface">Guias de cabo ×3</td><td class="px-4 py-3 text-primary-container font-medium">Nylon PA</td><td class="px-4 py-3 text-on-surface-variant">FDM câmara aq.</td><td class="px-4 py-3 text-on-surface">±0.05mm</td><td class="px-4 py-3 text-on-surface-variant">Dia 3</td></tr>
<tr><td class="px-4 py-3 text-on-surface">Defletor aero ×2</td><td class="px-4 py-3 text-primary-container font-medium">PET-G CF15</td><td class="px-4 py-3 text-on-surface-variant">FDM industrial</td><td class="px-4 py-3 text-on-surface">±0.1mm</td><td class="px-4 py-3 text-on-surface-variant">Dia 4</td></tr>
</tbody>
</table>
</div>

## Resultado

Todas as 7 peças foram entregues no quinto dia útil, dentro das tolerâncias especificadas, aprovadas pela equipe técnica da USP São Carlos sem necessidade de retrabalho em nenhum componente. A montagem do carro prosseguiu no cronograma planejado pela equipe.

O carro competiu na Fórmula SAE Brasil 2024 com todos os componentes AUMAF 3D instalados. Nenhuma falha de componente impresso foi registrada durante os eventos dinâmicos da competição.

<blockquote class="glass-panel border-l-2 border-primary-container p-6 my-8 rounded-sm relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<p class="text-headline-md font-light text-on-surface italic leading-relaxed mb-4">"A AUMAF 3D entregou dentro do prazo e com acabamento surpreendente. As peças encaixaram perfeitamente no primeiro teste de montagem."</p>
<cite class="text-label-caps text-primary-container uppercase tracking-[0.15em] not-italic">— Equipe Fórmula SAE USP São Carlos</cite>
</blockquote>

## O Que Aprendemos: DfAM em Motorsport Estudantil

Design for Additive Manufacturing (DfAM) é a prática de projetar peças que exploram as vantagens únicas da impressão 3D — em vez de simplesmente replicar peças projetadas para usinagem ou injeção. No contexto da Fórmula SAE, isso significou:

<div class="space-y-3 my-6">
<div class="flex gap-4 items-start">
<span class="flex-shrink-0 w-2 h-2 rounded-full bg-primary-container mt-2"></span>
<div>
<p class="text-on-surface font-medium mb-1">Orientação de impressão como parâmetro de projeto</p>
<p class="text-body-md text-tertiary leading-relaxed">Os suportes de suspensão foram orientados para que as camadas FDM ficassem perpendiculares à direção de carga principal, maximizando a resistência no eixo mais solicitado.</p>
</div>
</div>
<div class="flex gap-4 items-start">
<span class="flex-shrink-0 w-2 h-2 rounded-full bg-primary-container mt-2"></span>
<div>
<p class="text-on-surface font-medium mb-1">Integração de funções em peça única</p>
<p class="text-body-md text-tertiary leading-relaxed">Duas das guias de cabo foram redesenhadas para integrar funcionalidades que originalmente seriam 3 componentes distintos — reduzindo peso total e eliminando interfaces de montagem.</p>
</div>
</div>
<div class="flex gap-4 items-start">
<span class="flex-shrink-0 w-2 h-2 rounded-full bg-primary-container mt-2"></span>
<div>
<p class="text-on-surface font-medium mb-1">Infill calibrado por função</p>
<p class="text-body-md text-tertiary leading-relaxed">Defletores aerodinâmicos usaram infill em gyroid a 25% — estrutura interna que maximiza rigidez à flexão por unidade de massa, diferente do infill retilíneo padrão.</p>
</div>
</div>
</div>
`,
}
