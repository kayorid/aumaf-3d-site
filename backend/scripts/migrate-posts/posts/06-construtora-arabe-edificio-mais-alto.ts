import type { LegacyPost } from '../types'

export const post: LegacyPost = {
  slug: 'construtora-arabe-edificio-mais-alto',
  title: 'Construtora Árabe Lança Edifício Impresso em 3D Mais Alto do Mundo',
  excerpt:
    'A construtora saudita Dar Al Arkan, em parceria com a Cobod, concluiu em Riyadh o edifício impresso em 3D mais alto do mundo: uma vila de 9,9 metros com 345 m², construída em 26 dias, com nanotecnologia refletora de calor reduzindo a carga térmica em até 40%.',
  metaTitle: 'Edifício 3D Mais Alto do Mundo: Construção Aditiva em Riyadh — AUMAF 3D',
  metaDescription:
    'A vila impressa em 3D mais alta do mundo foi concluída em Riyadh: 9,9 m, 345 m², 26 dias, 99% materiais locais. Análise de como a construção aditiva está transformando o setor.',
  category: 'Inovação',
  publishedAt: new Date('2023-10-07T12:00:00Z'),
  readingTimeMin: 6,
  featured: false,
  tags: ['construcao-3d', 'concreto', 'cobod', 'arabia-saudita', 'inovacao', 'manufatura-aditiva'],
  coverImage: {
    localPath: 'frontend-public/public/images/blog-cover-construtora-arabe.webp',
    filename: 'blog-cover-construtora-arabe.webp',
  },
  content: `A manufatura aditiva passou décadas associada a peças pequenas e médias — protótipos, componentes industriais, modelos médicos. Mas a tecnologia escalou. Em **Riyadh, capital da Arábia Saudita**, foi recentemente concluído o **edifício impresso em 3D mais alto do mundo**: uma vila de três andares com 9,9 metros de altura e 345 m² de área, impressa em concreto camada por camada — em apenas 26 dias.

O projeto, conduzido pela construtora saudita **Dar Al Arkan** em parceria com a empresa dinamarquesa **Cobod**, é mais do que recorde de altura. É uma demonstração concreta de que a manufatura aditiva está mudando o vocabulário do que é possível na construção civil — com implicações que vão muito além da estética arquitetônica.

## Os números do projeto

<div class="glass-panel rounded-sm overflow-hidden border border-primary-container/15 my-8 relative">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<table class="w-full text-body-md">
<thead>
<tr class="bg-primary-container/10 border-b border-white/10">
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest">Métrica</th>
<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest">Valor</th>
</tr>
</thead>
<tbody>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface-variant">Altura</td><td class="px-4 py-3 text-on-surface">9,9 metros (3 andares)</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface-variant">Área construída</td><td class="px-4 py-3 text-on-surface">345 m²</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface-variant">Tempo de impressão</td><td class="px-4 py-3 text-on-surface">26 dias</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface-variant">Materiais locais</td><td class="px-4 py-3 text-on-surface">99% (concreto especial Cemex + Cobod D.fab)</td></tr>
<tr class="border-b border-white/5"><td class="px-4 py-3 text-on-surface-variant">Equipamento</td><td class="px-4 py-3 text-on-surface">Impressora 3D de pórtico Cobod</td></tr>
<tr><td class="px-4 py-3 text-on-surface-variant">Redução de carga térmica</td><td class="px-4 py-3 text-on-surface">Até 40% (pintura com nanotecnologia refletora)</td></tr>
</tbody>
</table>
</div>

A vila está em **plena conformidade com os códigos de construção sauditas** — um detalhe técnico importante, porque demonstra que a impressão 3D não está mais em território "experimental" sob o ponto de vista regulatório.

## A tecnologia: impressão 3D de concreto

Diferente da impressão 3D de termoplásticos, a impressão 3D de concreto opera em outra escala — mas o princípio físico é o mesmo: **deposição controlada de material camada por camada, seguindo modelo CAD, sem necessidade de formas tradicionais**.

### Equipamento

A Cobod BOD2 (e similares) é uma impressora de pórtico — estrutura retangular grande sobre trilhos, com uma cabeça extrusora que se move nos 3 eixos depositando concreto. A escala é dimensionada para construções residenciais e comerciais: máquinas típicas cobrem áreas de 12×27×9 m até variantes maiores.

### Material

O concreto usado em impressão 3D não é o convencional. Ele precisa atender três requisitos simultâneos, frequentemente conflitantes:

<div class="glass-panel rounded-sm p-6 my-8 border border-primary-container/15 space-y-4 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<div><p class="text-on-surface font-medium mb-1">Bombeável</p><p class="text-tertiary text-body-md text-sm">Fluído o suficiente para ser bombeado por mangueiras até a cabeça extrusora sem entupir.</p></div>
<div><p class="text-on-surface font-medium mb-1">Extrudível</p><p class="text-tertiary text-body-md text-sm">Sai do bico em filete contínuo e bem definido, mantendo a forma.</p></div>
<div><p class="text-on-surface font-medium mb-1">Construível (buildable)</p><p class="text-tertiary text-body-md text-sm">Endurece rápido o suficiente para suportar o peso das camadas superiores sem deformar.</p></div>
</div>

A solução **D.fab**, desenvolvida pela parceria Cemex + Cobod, é uma das mais bem documentadas comercialmente. Ela permite uso de **99% de materiais locais e econômicos** — fator decisivo em escala industrial.

### Processo de construção

O processo simplificado:

1. **Modelagem CAD** da casa/edifício em software arquitetônico padrão (Revit, AutoCAD).
2. **Slicing** do modelo em camadas de ~2-5 cm para impressão de concreto.
3. **Bombeamento e extrusão** das paredes, camada por camada, com a impressora se movimentando segundo o caminho gerado.
4. **Inserção manual** de reforço estrutural (vigas, vergalhões) em regiões pré-definidas no projeto, conforme regulamentação local.
5. **Acabamento convencional** — instalação de portas, janelas, sistemas hidráulicos, elétricos, pintura.

A impressão em si toma a fração mais visível do tempo, mas a obra continua com instalações tradicionais.

## Por que esse projeto importa

### Velocidade de construção

Construir uma casa de 345 m² em 26 dias é um marco. Construção convencional similar leva 6-12 meses. Essa **compressão de prazo** muda economias do setor: capital fica menos tempo imobilizado, financiamento custa menos, e em emergências habitacionais (refugiados, desastres) a impressão 3D viabiliza resposta rápida.

### Redução de mão de obra

A impressão substitui parte significativa do trabalho braçal de pedreiros e formas. Não elimina o trabalho — instalações continuam manuais, e a operação da impressora exige equipe técnica — mas redistribui mão de obra de tarefas físicas para tarefas técnicas qualificadas.

### Liberdade arquitetônica

Curvas, paredes orgânicas, geometrias não-retangulares — que custam caro em construção convencional por exigirem formas customizadas — saem **gratuitamente** na impressão 3D. O mesmo equipamento que faz uma parede reta faz uma parede curva sem custo adicional.

### Sustentabilidade material

A impressão 3D usa concreto **apenas onde a estrutura exige**, com paredes ocas estrategicamente. Isso reduz consumo de material significativamente — relevantísimo em um setor que responde por ~8% das emissões globais de CO₂.

### Estratégia nacional saudita

A Arábia Saudita tem meta de **70% de propriedade da casa pelos sauditas até 2030** (Vision 2030). Para isso, precisa construir milhões de unidades em prazo curto e custo controlado. A impressão 3D é candidata óbvia para apoiar esse objetivo em escala.

## O que vem por aí

A vila em Riyadh é a confirmação de que **construção aditiva saiu do território "demonstração" para "viável comercialmente"**. Outros projetos similares já estão em desenvolvimento globalmente: bairros inteiros impressos no México, projetos habitacionais nos EUA, prédios comerciais na China. A combinação **construção sob demanda + materiais locais + arquitetura customizada** redefine o ambiente construído de uma forma que ainda estamos começando a entender.

## Como isso se conecta com a AUMAF 3D

A AUMAF 3D opera em **outra escala** da manufatura aditiva — peças industriais em metal (SLM), termoplásticos (FDM/SLS) e resinas (SLA). Não fabricamos casas. Mas a evolução da tecnologia em escala arquitetônica reforça a tendência que vemos diariamente em escala industrial: **manufatura aditiva está virando ferramenta de produção, não apenas prototipagem**.

Para projetos industriais, oferecemos peças funcionais sob demanda, engenharia reversa, modelagem 3D especializada — desde unidades únicas até pequenas séries — com sede em São Carlos – SP. Para discutir um projeto, <a href="/contato?ref=blog-construtora-arabe" class="text-primary-container hover:underline">envie pelo formulário</a> ou explore o <a href="/servicos" class="text-primary-container hover:underline">portfólio de serviços</a>.

---

**Leitura complementar:**
- <a href="/blog/slm-sls-sla-fdm-qual-tecnologia-escolher" class="text-primary-container hover:underline">SLM vs SLS vs SLA vs FDM: qual escolher</a>
- <a href="/blog/manufatura-aditiva-reduz-downtime-industrial" class="text-primary-container hover:underline">Como manufatura aditiva reduz downtime industrial</a>
- <a href="/blog/impressao-3d-na-ciencia" class="text-primary-container hover:underline">Impressão 3D na ciência</a>
- <a href="/glossario" class="text-primary-container hover:underline">Glossário técnico</a>
`,
}
