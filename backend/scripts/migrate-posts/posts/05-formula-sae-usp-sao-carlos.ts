import type { LegacyPost } from '../types'

export const post: LegacyPost = {
  slug: 'formula-sae-usp-sao-carlos',
  title: 'Parceria de Sucesso: AUMAF 3D e Equipe de Fórmula SAE da USP São Carlos',
  excerpt:
    'A AUMAF 3D firmou parceria com a equipe de Fórmula SAE da USP São Carlos, fornecendo peças impressas em 3D — estruturais, aerodinâmicas e funcionais — que ajudam a equipe a inovar e competir com excelência.',
  metaTitle: 'Parceria AUMAF 3D × Fórmula SAE USP São Carlos — AUMAF 3D',
  metaDescription:
    'Como a AUMAF 3D apoia a equipe de Fórmula SAE da USP São Carlos com prototipagem rápida, materiais técnicos (PA-CF15, Nylon) e impressão de peças funcionais para competição.',
  category: 'Parceria',
  publishedAt: new Date('2024-06-26T12:00:00Z'),
  readingTimeMin: 5,
  featured: false,
  tags: ['sae', 'formula-sae', 'usp', 'sao-carlos', 'parceria', 'automotivo', 'pa-cf15'],
  coverImage: {
    localPath: 'frontend-public/public/images/blog-cover-sae-usp.webp',
    filename: 'blog-cover-sae-usp.webp',
  },
  content: `Competições universitárias de engenharia automotiva como a **Fórmula SAE** são laboratórios reais de inovação: estudantes projetam, fabricam e correm com veículos de competição em uma temporada anual, replicando em escala universitária os desafios de uma equipe profissional. Para chegar à pista com um carro competitivo, essas equipes precisam combinar engenharia de ponta, recursos limitados e prazos apertados — exatamente o tipo de cenário onde a manufatura aditiva mostra sua força.

É nesse contexto que nasceu a parceria entre a **AUMAF 3D** e a **equipe de Fórmula SAE da USP São Carlos**. Este artigo descreve como essa colaboração funciona, que tipos de peças foram entregues, e por que prototipagem rápida industrial é uma vantagem estratégica em competições universitárias de engenharia.

## A equipe de Fórmula SAE da USP São Carlos

A Equipe USP de Fórmula SAE é formada por alunos da Escola de Engenharia de São Carlos (EESC-USP), reunindo formandos em mecânica, mecatrônica, materiais, computação e administração. A cada temporada, a equipe constrói um protótipo de monoposto e participa de competições nacionais e internacionais, sendo avaliada em provas estáticas (design, custo, business plan) e dinâmicas (aceleração, autocross, endurance, eficiência energética).

O regulamento da SAE impõe restrições que tornam o projeto desafiador: peso mínimo, perfil de chassis, requisitos de segurança, limite de cilindrada — tudo isso obriga a equipe a otimizar **cada componente**. É aí que a impressão 3D entra como ferramenta de projeto, não como conveniência.

## O papel da AUMAF 3D na parceria

A colaboração com a Fórmula SAE USP São Carlos cobre três frentes:

<div class="glass-panel rounded-sm p-6 my-8 border border-primary-container/15 space-y-4 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<div class="flex gap-4 items-start"><span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">①</span><div><p class="text-on-surface font-medium mb-1">Expertise técnica e qualidade industrial</p><p class="text-tertiary text-body-md text-sm">Peças entregues no padrão de uma operação profissional — tolerâncias controladas, materiais certos, pós-processamento adequado. Isso libera a equipe para focar no projeto em vez de bater cabeça com problemas de manufatura.</p></div></div>
<div class="flex gap-4 items-start"><span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">②</span><div><p class="text-on-surface font-medium mb-1">Agilidade na produção de componentes complexos</p><p class="text-tertiary text-body-md text-sm">Em uma temporada de competição, prazos são curtos. A AUMAF 3D entrega protótipos funcionais em 24-72h e peças finais em poucos dias — ritmo compatível com a cadência de design iterativo da equipe.</p></div></div>
<div class="flex gap-4 items-start"><span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">③</span><div><p class="text-on-surface font-medium mb-1">Customização e flexibilidade de material</p><p class="text-tertiary text-body-md text-sm">Cada peça tem requisito próprio. A equipe escolhe entre PA-CF15 (rigidez próxima ao alumínio com 40% do peso), Nylon PA12 (isotropia mecânica via SLS), PETG (peças funcionais simples), TPU (vedações e amortecedores) — e a AUMAF 3D produz no processo adequado.</p></div></div>
</div>

## Tipos de peças entregues

A natureza das peças que a AUMAF 3D fabrica para a equipe varia conforme a temporada e o foco do projeto. Categorias típicas:

### Peças estruturais leves

Suportes de mangueira, brackets de chassis, montantes de instrumentação, suportes para sensores telemétricos — tudo onde **peso é restrição** mas resistência mecânica é necessária. Material padrão: **PA-CF15** (Nylon + 15% fibra de carbono picada), que combina rigidez ~7 GPa com densidade ~1,15 g/cm³.

### Componentes aerodinâmicos

Aerofólios, splitters, ductos de refrigeração, end-plates — peças onde geometria livre e iteração rápida importam. SLS em Nylon PA12 ou FDM em PA-CF15 conforme requisitos de superfície e carga.

### Peças funcionais

Engrenagens auxiliares, alojamentos de eletrônica, suportes de chicotes elétricos, conectores customizados — peças de uso final que aguentam vibração, calor da garagem e do circuito.

### Gabaritos de montagem

Jigs para soldagem de chassis, gabaritos de furação, fixtures de inspeção dimensional — ferramental que a equipe usa repetidamente durante a montagem, com geometria customizada para o veículo.

## Por que isso importa para a equipe

Em uma equipe universitária, recursos são escassos: dinheiro, tempo, e principalmente **tempo de engenharia**. Cada hora gasta tentando fabricar uma peça é uma hora não gasta otimizando o projeto do carro. A parceria com a AUMAF 3D resolve esse trade-off na origem:

- **Tempo liberado para engenharia:** a equipe entrega o CAD e recebe a peça funcional. Ciclo curto, sem distração com manufatura.
- **Acesso a materiais técnicos:** PA-CF15, SLS PA12 e outros materiais que seriam inviáveis para a equipe operar internamente (equipamento + know-how + custo de filamento).
- **Iteração rápida de design:** versionamento de peças entre dois testes de pista, com novas iterações em dias.
- **Backup operacional:** quando uma peça quebra em treino, a substituição sai rápido — não compromete o cronograma de competição.

## Por que isso importa para a AUMAF 3D

A parceria também é estratégica para nós:

- **Casos de uso reais de alta exigência:** veículo de competição estressa peças muito além do uso normal — aprendizados que voltam para a operação industrial.
- **Relacionamento com a próxima geração de engenheiros:** estudantes de hoje são os engenheiros e gerentes de manufatura de amanhã. Conhecer manufatura aditiva industrial pelo lado prático constrói familiaridade com a tecnologia.
- **Presença na comunidade técnica:** parcerias com universidades reforçam a posição da AUMAF 3D como referência técnica em manufatura aditiva industrial em São Carlos.

## Em resumo

A parceria AUMAF 3D × Fórmula SAE USP São Carlos demonstra na prática o valor da manufatura aditiva industrial em projetos onde **tempo, peso e iteração** são variáveis críticas. Para a equipe, é diferencial competitivo; para nós, é laboratório vivo de aplicações de ponta.

A AUMAF 3D apoia equipes universitárias, projetos de pesquisa e indústrias que precisam de prototipagem rápida + peças funcionais em materiais técnicos, com sede em São Carlos – SP. Para discutir uma parceria ou projeto, <a href="/contato?ref=blog-sae" class="text-primary-container hover:underline">envie pelo formulário</a> ou conheça os <a href="/industrias/educacao-pesquisa" class="text-primary-container hover:underline">serviços para educação e pesquisa</a>.

---

**Leitura complementar:**
- <a href="/blog/formula-sae-case-study-completo" class="text-primary-container hover:underline">Case Study: Fórmula SAE USP São Carlos — Do Arquivo à Pista</a>
- <a href="/blog/pa-cf15-levanta-tanque-12-toneladas" class="text-primary-container hover:underline">PA-CF15 sustenta 12 toneladas</a>
- <a href="/industrias/automotiva" class="text-primary-container hover:underline">Indústria automotiva</a>
- <a href="/industrias/educacao-pesquisa" class="text-primary-container hover:underline">Educação e pesquisa</a>
`,
}
