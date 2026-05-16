import type { LegacyPost } from '../types'

export const post: LegacyPost = {
  slug: 'visita-biofabris-sls-biomedica',
  title: 'Visita ao BIOFABRIS: Como a Sinterização a Laser Está Transformando a Biofabricação',
  excerpt:
    'A AUMAF 3D visitou o BIOFABRIS — instituto de biofabricação da UNICAMP — para conhecer de perto as tecnologias de SLS aplicadas a próteses, órteses e substitutos biológicos. Veja o que aprendemos e como isso já está moldando nossa operação.',
  metaTitle: 'Visita ao BIOFABRIS: SLS na Biofabricação — AUMAF 3D',
  metaDescription:
    'Como a tecnologia SLS está sendo aplicada em biofabricação no BIOFABRIS/UNICAMP — próteses, órteses, scaffolds biomédicos. Visita técnica e impactos na operação AUMAF 3D.',
  category: 'Inovação',
  publishedAt: new Date('2026-05-16T15:00:00Z'),
  readingTimeMin: 6,
  featured: false,
  tags: ['sls', 'biofabricacao', 'biofabris', 'unicamp', 'biomedica', 'inovacao'],
  coverImage: {
    localPath: 'frontend-public/public/images/blog-cover-biofabris.webp',
    filename: 'blog-cover-biofabris.webp',
  },
  content: `Pesquisa aplicada e manufatura industrial frequentemente operam em ritmos diferentes — o instituto investiga, a empresa produz. Mas há momentos em que essas linhas se cruzam de forma fértil, e o resultado é tecnologia chegando ao mercado mais rápido. Foi exatamente esse o espírito da visita técnica que a AUMAF 3D fez recentemente ao **BIOFABRIS**, instituto de biofabricação da UNICAMP, a convite da EOS — fabricante alemã de equipamentos de manufatura aditiva.

Esse artigo registra o que aprendemos, com foco no que é tecnicamente relevante para clientes da AUMAF 3D que acompanham a evolução de processos como o SLS (Selective Laser Sintering) e suas aplicações fora do entendimento clássico de "prototipagem".

## O que é o BIOFABRIS

O BIOFABRIS é um **Instituto Nacional de Ciência e Tecnologia (INCT) em Biofabricação**, multidisciplinar, sediado no Campus de Engenharia Química da UNICAMP. A missão declarada do instituto é objetivamente desafiadora:

> "Obter dispositivos biomédicos (próteses e órteses ortopédicas) e substitutos biológicos para tecidos vivos ou órgãos humanos defeituosos ou faltantes."

Para isso, o instituto integra:

<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
<div class="glass-panel rounded-sm p-4 border border-white/8"><span class="text-label-caps text-primary-container uppercase tracking-widest block text-[10px] mb-2">Engenharia & Computação</span><span class="text-body-md text-tertiary text-sm leading-snug">Modelagem CAD especializada para anatomia, otimização topológica, simulação biomecânica.</span></div>
<div class="glass-panel rounded-sm p-4 border border-white/8"><span class="text-label-caps text-primary-container uppercase tracking-widest block text-[10px] mb-2">Biomateriais</span><span class="text-body-md text-tertiary text-sm leading-snug">Síntese e caracterização de polímeros biodegradáveis, cerâmicas bioativas, hidrogéis.</span></div>
<div class="glass-panel rounded-sm p-4 border border-white/8"><span class="text-label-caps text-primary-container uppercase tracking-widest block text-[10px] mb-2">Medicina & Odontologia</span><span class="text-body-md text-tertiary text-sm leading-snug">Aplicação clínica — protocolos cirúrgicos, casos reais, integração tecido-implante.</span></div>
<div class="glass-panel rounded-sm p-4 border border-white/8"><span class="text-label-caps text-primary-container uppercase tracking-widest block text-[10px] mb-2">Biologia & Bioengenharia</span><span class="text-body-md text-tertiary text-sm leading-snug">Cultura celular, bioimpressão, scaffolds para regeneração tecidual.</span></div>
</div>

Esse cruzamento de áreas é o que diferencia o instituto: não é apenas um laboratório de impressão 3D, é um centro onde a peça impressa é só uma etapa de uma cadeia que vai do design CAD à integração biológica.

## O que vimos: SLS na biofabricação

O foco da visita foi a tecnologia **SLS — Selective Laser Sintering**. Uma definição técnica clara que ouvimos no instituto:

> "Tecnologia de impressão 3D baseada em pó que usa um laser para fundir camadas de material em uma peça final."

Em aplicações biomédicas, o SLS é particularmente potente por três razões:

### 1. Geometria sem restrição de suporte

A vantagem clássica do SLS — o próprio pó sustenta a peça durante a impressão, eliminando suportes — é decisiva em biofabricação. Scaffolds (estruturas porosas que servem de "andaime" para crescimento celular) precisam de geometria interna **continuamente porosa e interconectada**. SLS resolve isso sem comprometer regiões internas com suportes inacessíveis.

### 2. Materiais compatíveis com aplicações de saúde

Polímeros como **PA12 (poliamida 12)** e suas variantes biocompatíveis são processáveis em SLS com propriedades mecânicas adequadas para órteses, dispositivos não-invasivos, gabaritos cirúrgicos e modelos anatômicos. Vale destacar: o uso em **implantes definitivos** exige certificações específicas (ANVISA RDC 751/2022, ISO 13485) que **a AUMAF 3D não atende** — é território de fornecedores certificados.

### 3. Personalização sem custo proibitivo

Cada peça biomédica é, por definição, única — anatomia varia por paciente. SLS suporta produção unitária sem ferramental, viabilizando dispositivos personalizados a custo industrialmente sustentável. Para o BIOFABRIS, isso significa pesquisar peças para casos reais; para um cliente AUMAF, significa órteses customizadas, gabaritos de furação anatômicos, e modelos pré-cirúrgicos sob medida.

## Por que a visita importou para nós

O BIOFABRIS opera em uma fronteira que combina o que sabemos fazer (SLS, modelagem, pós-processamento) com aplicações onde a régua de qualidade é radicalmente mais alta. Três aprendizados diretos:

<div class="glass-panel rounded-sm p-6 my-8 border border-primary-container/15 space-y-4 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<div class="flex gap-4 items-start"><span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">①</span><div><p class="text-on-surface font-medium mb-1">Caracterização sistemática de pó</p><p class="text-tertiary text-body-md text-sm">Em aplicações industriais, a maioria dos parâmetros vêm do fabricante do equipamento. Em pesquisa biomédica, cada lote de pó é caracterizado (granulometria, fluidez, comportamento térmico) antes do uso. Trazer parte dessa disciplina para a operação industrial melhora repetibilidade de peças críticas.</p></div></div>
<div class="flex gap-4 items-start"><span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">②</span><div><p class="text-on-surface font-medium mb-1">Documentação de processo end-to-end</p><p class="text-tertiary text-body-md text-sm">Pesquisa exige rastreabilidade total (qual lote de pó, quais parâmetros, qual ciclo térmico). Empresas que adotam essa rastreabilidade conseguem oferecer relatórios de produção que viram diferencial competitivo em projetos críticos.</p></div></div>
<div class="flex gap-4 items-start"><span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">③</span><div><p class="text-on-surface font-medium mb-1">Pós-processamento avançado</p><p class="text-tertiary text-body-md text-sm">Acabamentos especiais — tratamentos superficiais, selagem, esterilização — são padrão em biofabricação. Vários desses procedimentos têm aplicação direta em indústria (selar peças SLS para uso com fluido, por exemplo).</p></div></div>
</div>

## O que vem por aí

A visita gerou perspectivas concretas para a AUMAF 3D:

- **Parcerias técnicas em prototipagem científica:** apoio à pesquisa universitária com produção de peças sob especificação acadêmica.
- **Troca de conhecimentos sobre materiais SLS:** caracterização e aplicações de novos polímeros para uso final.
- **Expansão do portfólio em dispositivos médico-laboratoriais não-invasivos:** gabaritos, modelos anatômicos para estudo, dispositivos não-implantáveis — segmentos onde a AUMAF 3D pode atuar dentro do escopo regulatório apropriado.

Não vamos vender peças para implantes ortopédicos — isso continua sendo trabalho para fornecedores certificados ANVISA. Mas conseguimos absorver disciplina técnica que melhora **todas** as nossas operações industriais.

## Em resumo

A tecnologia SLS continua sendo uma das ferramentas mais versáteis da manufatura aditiva. Em pesquisa biomédica, ela viabiliza scaffolds e dispositivos personalizados; em indústria, viabiliza componentes complexos e séries pequenas com geometria livre. A AUMAF 3D opera SLS em PA12 e variantes na sede em São Carlos – SP.

Para discutir aplicações SLS em um projeto da sua operação — industrial, médico-laboratorial não-invasivo ou de pesquisa — <a href="/contato?ref=blog-biofabris" class="text-primary-container hover:underline">envie o pedido pelo formulário</a> ou conheça os <a href="/materiais" class="text-primary-container hover:underline">materiais SLS disponíveis</a>.

---

**Leitura complementar:**
- <a href="/blog/slm-sls-sla-fdm-qual-tecnologia-escolher" class="text-primary-container hover:underline">SLM vs SLS vs SLA vs FDM: qual escolher</a>
- <a href="/blog/impressao-3d-na-ciencia" class="text-primary-container hover:underline">Impressão 3D na ciência: do laboratório à indústria</a>
- <a href="/industrias/medica-odontologica" class="text-primary-container hover:underline">Indústria médica e odontológica</a>
- <a href="/industrias/educacao-pesquisa" class="text-primary-container hover:underline">Educação e pesquisa</a>
`,
}
