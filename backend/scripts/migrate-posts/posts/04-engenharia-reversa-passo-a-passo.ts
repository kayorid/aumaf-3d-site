import type { LegacyPost } from '../types'

export const post: LegacyPost = {
  slug: 'engenharia-reversa-passo-a-passo',
  title: 'Engenharia Reversa Passo a Passo: Como Replicar uma Peça Sem o Projeto Original',
  excerpt:
    'Do scanner 3D ao controle dimensional final — um guia técnico completo sobre o processo de engenharia reversa para replicar peças descontinuadas, sem documentação técnica, usando impressão 3D industrial.',
  metaTitle: 'Engenharia Reversa Passo a Passo — AUMAF 3D',
  metaDescription:
    'Processo completo de engenharia reversa industrial: scanner 3D, nuvem de pontos, CAD paramétrico, FAI e impressão 3D para replicar peças descontinuadas.',
  category: 'Engenharia',
  publishedAt: new Date('2026-05-01T09:00:00Z'),
  readingTimeMin: 7,
  featured: false,
  tags: ['engenharia-reversa', 'scanner-3d', 'cad', 'fai', 'pa12'],
  coverImage: null,
  content: `Toda fábrica tem uma gaveta com peças que ninguém sabe de onde vieram. O fornecedor original faliu. O equipamento foi importado sem documentação técnica. A peça foi fabricada internamente décadas atrás e os desenhos foram perdidos. Ou simplesmente foi descontinuada pelo fabricante, e o estoque de reposição acabou.

Nesses cenários, a engenharia reversa é o caminho. Com scanner 3D, CAD paramétrico e impressão 3D industrial, é possível replicar com precisão uma peça funcional — frequentemente melhorando propriedades em relação ao original — sem nenhum desenho técnico de partida.

Este guia descreve o processo completo que utilizamos na AUMAF 3D, passo a passo, com critérios técnicos em cada etapa.

## <span class="text-primary-container">01 —</span> Avaliação da Peça Original

A avaliação inicial determina a viabilidade e o escopo do trabalho. Quatro questões definem a estratégia:

<div class="space-y-3 my-6">
<div class="glass-panel rounded-sm p-5 border border-white/8">
<h3 class="text-body-md font-bold text-white mb-2">Estado físico da peça</h3>
<p class="text-body-md text-tertiary leading-relaxed">A peça está íntegra ou danificada? Deformações, corrosão, desgaste superficial ou fratura comprometem a digitalização e exigem tratamento especial antes do scan — ou inferência dimensional a partir de features não danificadas.</p>
</div>
<div class="glass-panel rounded-sm p-5 border border-white/8">
<h3 class="text-body-md font-bold text-white mb-2">Funcionalidade crítica</h3>
<p class="text-body-md text-tertiary leading-relaxed">Qual a função da peça no sistema? Interface de montagem, transferência de carga, vedação, guia cinemático? A função crítica define quais dimensões têm tolerância apertada e quais são nominais.</p>
</div>
<div class="glass-panel rounded-sm p-5 border border-white/8">
<h3 class="text-body-md font-bold text-white mb-2">Tolerâncias necessárias</h3>
<p class="text-body-md text-tertiary leading-relaxed">Identificamos as interfaces dimensionais críticas — furos de montagem, faces de assentamento, pinos de alinhamento. São as dimensões que precisarão de verificação independente do scanner.</p>
</div>
<div class="glass-panel rounded-sm p-5 border border-white/8">
<h3 class="text-body-md font-bold text-white mb-2">Identificação do material original</h3>
<p class="text-body-md text-tertiary leading-relaxed">Teste de chama, dureza Shore, aparência da fratura, comportamento ao desgaste, densidade. A identificação correta do material original orienta a seleção do equivalente imprimível.</p>
</div>
</div>

## <span class="text-primary-container">02 —</span> Digitalização 3D

A digitalização converte a peça física em uma nuvem de pontos ou malha 3D. A escolha da tecnologia de scan impacta diretamente a precisão do modelo gerado.

<div class="grid sm:grid-cols-3 gap-4 my-6">
<div class="glass-panel rounded-sm p-4 border border-primary-container/40">
<div class="flex items-center justify-between gap-2 mb-2">
<h3 class="text-body-md font-bold text-white">Luz Estruturada</h3>
<span class="pill-green text-[9px]">Padrão</span>
</div>
<p class="text-code-data text-primary-container mb-2">±0.02–0.05mm</p>
<p class="text-body-md text-tertiary text-sm leading-snug">Peças estáticas, detalhamento fino, geometria orgânica complexa. Padrão na AUMAF 3D.</p>
</div>
<div class="glass-panel rounded-sm p-4 border border-white/8">
<div class="flex items-center justify-between gap-2 mb-2">
<h3 class="text-body-md font-bold text-white">Scanner de Contato (CMM)</h3>
</div>
<p class="text-code-data text-primary-container mb-2">±0.005mm</p>
<p class="text-body-md text-tertiary text-sm leading-snug">Medição de tolerâncias críticas em features específicas. Complementa o scan de luz estruturada.</p>
</div>
<div class="glass-panel rounded-sm p-4 border border-white/8">
<div class="flex items-center justify-between gap-2 mb-2">
<h3 class="text-body-md font-bold text-white">Fotogrametria</h3>
</div>
<p class="text-code-data text-primary-container mb-2">±0.1–0.5mm</p>
<p class="text-body-md text-tertiary text-sm leading-snug">Peças grandes, geometria simples, orçamento limitado. Não adequado para tolerâncias apertadas.</p>
</div>
</div>

Nosso scanner de luz estruturada opera com precisão de **±0.02mm** em peças de até 300mm na maior dimensão. Para peças maiores, realizamos scans sobrepostos com alinhamento por targets fiduciais, mantendo a precisão global abaixo de ±0.05mm.

## <span class="text-primary-container">03 —</span> Processamento da Nuvem de Pontos

A nuvem de pontos bruta do scanner raramente está pronta para impressão. O processamento passa por etapas sequenciais:

<div class="space-y-2 my-6">
<div class="flex gap-4 items-start">
<span class="flex-shrink-0 w-7 h-7 rounded-sm bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container text-code-data font-bold text-[11px]">01</span>
<div>
<p class="text-on-surface font-medium mb-1">Limpeza e filtragem</p>
<p class="text-body-md text-tertiary leading-relaxed">Remoção de ruído, pontos outliers e artefatos de scan. Superfícies reflexivas (metais polidos) frequentemente precisam de tratamento especial ou aplicação de spray matte temporário antes do scan.</p>
</div>
</div>
<div class="flex gap-4 items-start">
<span class="flex-shrink-0 w-7 h-7 rounded-sm bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container text-code-data font-bold text-[11px]">02</span>
<div>
<p class="text-on-surface font-medium mb-1">Meshing</p>
<p class="text-body-md text-tertiary leading-relaxed">Conversão da nuvem em malha triangulada (STL/OBJ). Parâmetros de resolução da malha são calibrados para o nível de detalhamento necessário — malha densa demais gera arquivos não tratáveis, malha esparsa demais perde features.</p>
</div>
</div>
<div class="flex gap-4 items-start">
<span class="flex-shrink-0 w-7 h-7 rounded-sm bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container text-code-data font-bold text-[11px]">03</span>
<div>
<p class="text-on-surface font-medium mb-1">Reconstrução paramétrica em CAD</p>
<p class="text-body-md text-tertiary leading-relaxed">O passo mais crítico: a malha é usada como referência para reconstrução de um modelo CAD paramétrico nativo (Fusion 360 ou SolidWorks). Features geométricas são identificadas — planos, cilindros, esferas, chanfros — e modeladas com dimensões nominais limpas. O resultado é um modelo editável, não apenas uma malha.</p>
</div>
</div>
<div class="flex gap-4 items-start">
<span class="flex-shrink-0 w-7 h-7 rounded-sm bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container text-code-data font-bold text-[11px]">04</span>
<div>
<p class="text-on-surface font-medium mb-1">DfAM</p>
<p class="text-body-md text-tertiary leading-relaxed">Com o modelo paramétrico em mãos, aplicamos princípios de Design for Additive Manufacturing: remoção de restrições de usinagem (ângulos de saída desnecessários, espessuras mínimas de molde), adição de suportes autoportantes, otimização de orientação de impressão.</p>
</div>
</div>
</div>

## <span class="text-primary-container">04 —</span> Seleção de Material e Processo

A seleção do material para a réplica não é um mapeamento direto — é uma análise de equivalência funcional. O objetivo não é usar o mesmo material, mas sim um material que atenda aos mesmos requisitos funcionais na aplicação.

Fatores considerados na seleção:

<div class="grid sm:grid-cols-2 gap-3 my-6">
<div class="glass-panel rounded-sm p-4 border border-white/8">
<h3 class="text-body-md font-bold text-white mb-2">Temperatura de serviço</h3>
<p class="text-body-md text-tertiary text-sm leading-snug">A peça fica próxima de fonte de calor? Qual a temperatura máxima esperada? Define o piso de temperatura de serviço do material.</p>
</div>
<div class="glass-panel rounded-sm p-4 border border-white/8">
<h3 class="text-body-md font-bold text-white mb-2">Regime de carga</h3>
<p class="text-body-md text-tertiary text-sm leading-snug">Carga estática, dinâmica, impacto ou fadiga? Determina se a resistência à tração, ao impacto ou ao desgaste é prioritária.</p>
</div>
<div class="glass-panel rounded-sm p-4 border border-white/8">
<h3 class="text-body-md font-bold text-white mb-2">Ambiente químico</h3>
<p class="text-body-md text-tertiary text-sm leading-snug">Contato com óleos, solventes, ácidos, UV? Determina resistência química e estabilidade dimensional em longo prazo.</p>
</div>
<div class="glass-panel rounded-sm p-4 border border-white/8">
<h3 class="text-body-md font-bold text-white mb-2">Dilatação térmica</h3>
<p class="text-body-md text-tertiary text-sm leading-snug">Interfaces de encaixe com metais têm dilatação diferencial. O material impresso deve ter CTE (coeficiente de expansão térmica) compatível com o do componente acoplado.</p>
</div>
</div>

## <span class="text-primary-container">05 —</span> Impressão e Controle Dimensional

A First Article Inspection (FAI) é o protocolo de controle dimensional aplicado à primeira peça de cada lote. Não liberamos peças de engenharia reversa sem FAI documentado.

<div class="glass-panel rounded-sm p-6 my-6 border border-primary-container/15 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<span class="text-label-caps text-on-surface-variant uppercase tracking-[0.2em] block mb-4">Protocolo FAI — AUMAF 3D</span>
<div class="space-y-3">
<div class="flex gap-4 border-b border-white/5 pb-3"><span class="text-primary-container text-body-md font-medium flex-shrink-0 w-52">Paquímetro digital (±0.01mm)</span><span class="text-tertiary text-body-md">Dimensões lineares, diâmetros externos, profundidades</span></div>
<div class="flex gap-4 border-b border-white/5 pb-3"><span class="text-primary-container text-body-md font-medium flex-shrink-0 w-52">Micrômetro (±0.001mm)</span><span class="text-tertiary text-body-md">Interfaces críticas de tolerância apertada</span></div>
<div class="flex gap-4 border-b border-white/5 pb-3"><span class="text-primary-container text-body-md font-medium flex-shrink-0 w-52">Comparação scan vs. CAD</span><span class="text-tertiary text-body-md">Mapa de desvios colorimétrico para identificar desvios geométricos globais</span></div>
<div class="flex gap-4 border-b border-white/5 pb-3"><span class="text-primary-container text-body-md font-medium flex-shrink-0 w-52">CMM (quando necessário)</span><span class="text-tertiary text-body-md">Tolerâncias GD&T em peças de alta precisão — disponível sob contratação</span></div>
</div>
</div>

## <span class="text-primary-container">06 —</span> Validação Funcional

Controle dimensional aprovado não é suficiente — a peça precisa ser validada no contexto de uso real. A validação funcional segue uma sequência:

<div class="space-y-3 my-6">
<div class="flex gap-4 items-start"><span class="flex-shrink-0 text-primary-container text-code-data font-bold">01</span><p class="text-body-md text-tertiary leading-relaxed">Teste de montagem: encaixe nos componentes adjacentes sem força excessiva nem folga perceptível.</p></div>
<div class="flex gap-4 items-start"><span class="flex-shrink-0 text-primary-container text-code-data font-bold">02</span><p class="text-body-md text-tertiary leading-relaxed">Teste sob carga estática: aplicação da carga de serviço esperada por tempo mínimo de 24h — observação de deformação permanente ou fluência.</p></div>
<div class="flex gap-4 items-start"><span class="flex-shrink-0 text-primary-container text-code-data font-bold">03</span><p class="text-body-md text-tertiary leading-relaxed">Ajustes finos: se a primeira peça aprovada dimensionalmente apresentar interferência na montagem, o modelo CAD é ajustado no offset necessário (tipicamente 0.05–0.1mm nos diâmetros de encaixe) e nova FAI é realizada.</p></div>
</div>

## Caso Real: Peça Descontinuada em PA12

<div class="glass-panel rounded-sm p-6 my-8 border border-primary-container/15 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<p class="text-label-caps text-on-surface-variant uppercase tracking-[0.2em] block mb-4">Caso Anônimo — Indústria de Automação</p>
<p class="text-body-lg text-tertiary leading-relaxed mb-4">Um cliente industrial nos trouxe um guia de correia de uma linha de automação, fabricado originalmente em ABS injetado por um fornecedor descontinuado. A peça estava fraturada e o cliente mantinha estoque de 2 unidades sobressalentes — suficientes para alguns meses de produção.</p>
<p class="text-body-lg text-tertiary leading-relaxed mb-4">Após avaliação, identificamos que o ABS original apresentava limitações para a aplicação: temperatura de operação próxima de 75°C (limite do ABS) e desgaste superficial acelerado pelo contato repetitivo com a correia.</p>
<p class="text-body-lg text-tertiary leading-relaxed mb-4">Solução: replicar em <strong class="text-on-surface">PA12 via FDM</strong>. O Nylon PA12 tem temperatura de serviço de 100°C (25°C de margem adicional), resistência ao desgaste significativamente superior ao ABS, e baixo coeficiente de atrito com a correia — reduzindo o desgaste progressivo.</p>
<p class="text-body-lg text-on-surface leading-relaxed font-medium">Resultado: a réplica em PA12 superou o desempenho do original em ABS — vida útil estimada 2× maior, com eliminação do risco de fratura frágil a temperatura elevada.</p>
</div>

## Quando a Engenharia Reversa NÃO é a Solução

A engenharia reversa tem limitações importantes que devem ser avaliadas antes de iniciar o processo:

<div class="space-y-3 my-6">
<div class="flex gap-4 items-start">
<span class="flex-shrink-0 w-2 h-2 rounded-full bg-white/30 mt-2"></span>
<div>
<p class="text-on-surface font-medium mb-1">Peças com propriedades dependentes de processo de fabricação específico</p>
<p class="text-body-md text-tertiary leading-relaxed">Engrenagens metálicas temperadas, molas de aço, peças forjadas — as propriedades mecânicas são resultado do processo de manufatura, não apenas da geometria. Um substituto em polímero não replicará a resistência à fadiga de um aço forjado.</p>
</div>
</div>
<div class="flex gap-4 items-start">
<span class="flex-shrink-0 w-2 h-2 rounded-full bg-white/30 mt-2"></span>
<div>
<p class="text-on-surface font-medium mb-1">Geometrias com tolerâncias abaixo de ±0.02mm</p>
<p class="text-body-md text-tertiary leading-relaxed">Abaixo desse limiar, o processo FDM não oferece repetibilidade adequada sem pós-usinagem. Para tolerâncias muito apertadas, considere a engenharia reversa para geração do modelo CAD + usinagem CNC da peça final.</p>
</div>
</div>
<div class="flex gap-4 items-start">
<span class="flex-shrink-0 w-2 h-2 rounded-full bg-white/30 mt-2"></span>
<div>
<p class="text-on-surface font-medium mb-1">Peças de segurança crítica sem documentação de qualificação</p>
<p class="text-body-md text-tertiary leading-relaxed">Componentes que, em caso de falha, colocam vidas em risco (ex: sistemas de freio, estruturas de aeronave) requerem qualificação formal que vai além do escopo de uma réplica por engenharia reversa.</p>
</div>
</div>
</div>
`,
}
