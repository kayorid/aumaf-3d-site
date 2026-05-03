import type { LegacyPost } from '../types'

export const post: LegacyPost = {
  slug: 'formula-sae-usp-sao-carlos',
  title: 'Parceria de Sucesso: AUMAF 3D e Equipe de Fórmula SAE da USP São Carlos',
  excerpt:
    'Peças estruturais e aerodinâmicas para o carro de competição da equipe de Engenharia Mecânica da USP São Carlos — um case de parceria entre indústria e academia.',
  metaTitle: 'AUMAF 3D × Fórmula SAE USP São Carlos — Parceria',
  metaDescription:
    'Case de parceria entre AUMAF 3D e equipe Fórmula SAE USP São Carlos: componentes em Nylon PA e PET-G CF15 para a Fórmula SAE Brasil 2024.',
  category: 'Parceria',
  publishedAt: new Date('2024-06-26T12:00:00Z'),
  readingTimeMin: 1,
  featured: false,
  tags: ['formula-sae', 'usp', 'parceria', 'motorsport'],
  coverImage: { localPath: 'frontend-public/public/images/SAE-formula.avif', filename: 'SAE-formula.avif' },
  content: `A AUMAF 3D firmou parceria com a equipe de Engenharia Mecânica da USP São Carlos para fornecimento de componentes de alta performance para o carro da Fórmula SAE 2024. O desafio: fabricar peças estruturais e aerodinâmicas com tolerância mínima, peso reduzido e prazo de entrega agressivo.

## O Desafio Técnico

Peças para competições automotivas estudantis precisam atender requisitos rigorosos de peso, resistência mecânica e tolerância dimensional. A equipe necessitava de suportes de suspensão, guias de cabo e elementos aerodinâmicos que fossem simultaneamente leves e resistentes — combinação que torna a impressão 3D industrial a escolha natural.

<div class="glass-panel rounded-sm p-6 my-8 border border-primary-container/15 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<span class="text-label-caps text-on-surface-variant uppercase tracking-[0.2em] block mb-4">Dados do Projeto</span>
<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
<div class="border-b border-white/12 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Parceiro</span><span class="text-body-md text-on-surface font-medium">USP São Carlos — Eng. Mecânica</span></div>
<div class="border-b border-white/12 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Evento</span><span class="text-body-md text-on-surface font-medium">Fórmula SAE Brasil 2024</span></div>
<div class="border-b border-white/12 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Materiais</span><span class="text-body-md text-on-surface font-medium">Nylon PA + PET-G CF15</span></div>
<div class="border-b border-white/12 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Aplicação</span><span class="text-body-md text-on-surface font-medium">Estrutural + Aerodinâmica</span></div>
<div class="border-b border-white/12 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Tolerância</span><span class="text-body-md text-on-surface font-medium">±0.05mm</span></div>
<div class="border-b border-white/12 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">Prazo</span><span class="text-body-md text-on-surface font-medium">5 dias úteis</span></div>
</div>
</div>

## Solução: Nylon PA e PET-G CF15

Para os suportes de suspensão e guias de cabo, utilizamos Nylon PA — material com alta resistência ao impacto e baixo coeficiente de atrito, ideal para componentes móveis. Para elementos aerodinâmicos, o PET-G CF15 (PETG reforçado com 15% de fibra de carbono picada) entregou a rigidez necessária com densidade significativamente inferior ao alumínio usinado.

O processo de manufatura utilizou nossas impressoras FDM de nível industrial com câmara aquecida, garantindo cristalização adequada do Nylon PA e adesão de camadas otimizada no PET-G CF15. Cada peça passou por controle dimensional com paquímetro digital antes de ser liberada.

## Resultado

As peças foram entregues dentro do prazo e aprovadas pela equipe técnica da USP São Carlos sem necessidade de retrabalho. O carro foi preparado e competiu na Fórmula SAE Brasil 2024, com os componentes AUMAF 3D contribuindo para uma montagem mais ágil e redução de peso total do veículo.

<blockquote class="glass-panel border-l-2 border-primary-container p-6 my-8 rounded-sm">
<p class="text-body-lg text-on-surface italic leading-relaxed mb-3">"A AUMAF 3D entregou dentro do prazo e com acabamento surpreendente. As peças encaixaram perfeitamente no primeiro teste de montagem."</p>
<footer><cite class="text-label-caps text-primary-container uppercase tracking-[0.15em] not-italic">— Equipe Fórmula SAE USP São Carlos</cite></footer>
</blockquote>
`,
}
