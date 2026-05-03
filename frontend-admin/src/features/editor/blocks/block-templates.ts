export interface BlockTemplate {
  id: string
  label: string
  icon: string
  html: string
}

export const BLOCK_TEMPLATES: BlockTemplate[] = [
  {
    id: 'specs-grid',
    label: 'Specs Grid (Dados do Projeto)',
    icon: '📊',
    html: `<div class="glass-panel rounded-sm p-6 my-8 border border-primary-container/15 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<span class="text-label-caps text-on-surface-variant uppercase tracking-[0.2em] block mb-4">Dados do Projeto</span>
<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
<div class="border-b border-white/8 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Label</span><span class="text-body-md text-on-surface font-medium">Valor</span></div>
<div class="border-b border-white/8 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Label</span><span class="text-body-md text-on-surface font-medium">Valor</span></div>
<div class="border-b border-white/8 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Label</span><span class="text-body-md text-on-surface font-medium">Valor</span></div>
</div>
</div>`,
  },
  {
    id: 'material-card',
    label: 'Material Card',
    icon: '🧪',
    html: `<div class="glass-panel rounded-sm p-5 border border-white/8 my-4">
<div class="flex items-start justify-between gap-4 mb-2">
<h3 class="text-body-lg font-bold text-white uppercase tracking-wide">Nome do Material</h3>
<span class="pill flex-shrink-0">Categoria</span>
</div>
<p class="text-body-md text-tertiary leading-relaxed mb-3">Descrição do material e suas características principais.</p>
<div class="flex flex-wrap gap-3 text-code-data text-[11px]">
<span class="text-primary-container">Propriedade: Valor</span>
<span class="text-on-surface-variant">Propriedade: Valor</span>
</div>
</div>`,
  },
  {
    id: 'comparison-table',
    label: 'Tabela Comparativa',
    icon: '⊞',
    html: `<div class="glass-panel rounded-sm overflow-hidden border border-primary-container/15 my-8">
<table class="w-full text-body-md">
<thead>
<tr class="bg-primary-container/10 border-b border-white/10">
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest">Critério</th>
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest">Opção A</th>
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest">Opção B</th>
</tr>
</thead>
<tbody>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface-variant">Critério 1</td><td class="px-4 py-3 text-on-surface">Valor</td><td class="px-4 py-3 text-on-surface">Valor</td></tr>
<tr><td class="px-4 py-3 text-on-surface-variant">Critério 2</td><td class="px-4 py-3 text-on-surface">Valor</td><td class="px-4 py-3 text-on-surface">Valor</td></tr>
</tbody>
</table>
</div>`,
  },
  {
    id: 'decision-flow',
    label: 'Decision Flow',
    icon: '↳',
    html: `<div class="glass-panel rounded-sm p-6 my-8 border border-primary-container/15 space-y-4 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<div class="flex gap-4 items-start">
<span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">1</span>
<div>
<p class="text-on-surface font-medium mb-1">Pergunta de decisão?</p>
<p class="text-tertiary text-body-md">→ <strong class="text-primary-container">Sim:</strong> Caminho A. → <strong class="text-on-surface">Não:</strong> Caminho B.</p>
</div>
</div>
<div class="flex gap-4 items-start">
<span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">2</span>
<div>
<p class="text-on-surface font-medium mb-1">Segunda pergunta?</p>
<p class="text-tertiary text-body-md">→ <strong class="text-primary-container">Sim:</strong> Resultado. → <strong class="text-on-surface">Não:</strong> Resultado.</p>
</div>
</div>
</div>`,
  },
  {
    id: 'quote-card',
    label: 'Citação Destacada',
    icon: '"',
    html: `<blockquote class="glass-panel border-l-2 border-primary-container p-6 my-8 rounded-sm relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<p class="text-body-lg text-on-surface italic leading-relaxed mb-3">"Escreva a citação aqui."</p>
<footer><cite class="text-label-caps text-primary-container uppercase tracking-[0.15em] not-italic">— Autor ou fonte</cite></footer>
</blockquote>`,
  },
  {
    id: 'info-card',
    label: 'Info Card',
    icon: '▢',
    html: `<div class="glass-panel rounded-sm p-5 border border-primary-container/20 relative overflow-hidden my-4">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<h3 class="text-body-lg font-bold text-white mb-2">Título do Card</h3>
<p class="text-body-md text-tertiary leading-relaxed">Conteúdo informativo do card.</p>
</div>`,
  },
  {
    id: 'cards-list',
    label: 'Lista de Cards',
    icon: '▤',
    html: `<div class="space-y-3 my-6">
<div class="glass-panel rounded-sm p-5 border border-white/8">
<h3 class="text-body-md font-bold text-white mb-2">Título do item</h3>
<p class="text-body-md text-tertiary leading-relaxed">Descrição do item.</p>
</div>
<div class="glass-panel rounded-sm p-5 border border-white/8">
<h3 class="text-body-md font-bold text-white mb-2">Título do item</h3>
<p class="text-body-md text-tertiary leading-relaxed">Descrição do item.</p>
</div>
</div>`,
  },
]
