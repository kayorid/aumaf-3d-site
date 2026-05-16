import type { LegacyPost } from '../types'

export const post: LegacyPost = {
  slug: 'processo-impressao-3d-slm-passo-a-passo',
  title: 'Da Engenharia ao Metal: Como Funciona o Processo de Impressão 3D SLM',
  excerpt:
    'O fluxo completo da manufatura aditiva metálica passo a passo: preparação do modelo, atmosfera controlada, fusão a laser camada por camada, materiais utilizados e pós-processamento dimensional.',
  metaTitle: 'Processo de Impressão 3D SLM Passo a Passo — AUMAF 3D',
  metaDescription:
    'Como funciona o processo SLM: do fatiamento do CAD à inspeção final. Fusão a laser camada por camada, atmosfera inerte, materiais e pós-processamento metálico explicados.',
  category: 'Tecnologia',
  publishedAt: new Date('2026-05-16T14:00:00Z'),
  readingTimeMin: 11,
  featured: false,
  tags: ['slm', 'processo-slm', 'impressao-3d-metalica', 'manufatura-aditiva', 'aco-inox-316l'],
  coverImage: {
    localPath: 'frontend-public/public/images/blog-cover-processo-slm.webp',
    filename: 'blog-cover-processo-slm.webp',
  },
  content: `O processo SLM (Selective Laser Melting) é frequentemente apresentado como "imprimir metal em 3D" — uma simplificação que esconde a complexidade real. Por trás de cada peça metálica entregue há um fluxo industrial com **cinco etapas principais**, cada uma com decisões técnicas que afetam custo, prazo, propriedades mecânicas e acabamento final.

Este artigo descreve o processo SLM como ele acontece na operação industrial — não como animação de marketing, mas como sequência de operações reais com seus parâmetros, escolhas e cuidados. Útil para engenheiros de projeto que querem entender o que recebem ao especificar SLM, e para gerentes de manufatura avaliando viabilidade da tecnologia.

## Visão geral: as 5 etapas

<div class="glass-panel rounded-sm p-6 my-8 border border-primary-container/15 space-y-4 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<div class="flex gap-4 items-start"><span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">1</span><div><p class="text-on-surface font-medium">Preparação do modelo e fatiamento</p><p class="text-tertiary text-body-md text-sm">CAD → STL → orientação, suportes, parâmetros de processo, fatiamento em camadas micrométricas.</p></div></div>
<div class="flex gap-4 items-start"><span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">2</span><div><p class="text-on-surface font-medium">Atmosfera controlada</p><p class="text-tertiary text-body-md text-sm">Purga da câmara com gás inerte (argônio ou nitrogênio) para prevenir oxidação durante a fusão.</p></div></div>
<div class="flex gap-4 items-start"><span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">3</span><div><p class="text-on-surface font-medium">Fusão a laser camada por camada</p><p class="text-tertiary text-body-md text-sm">Laser de fibra de alta potência funde o pó metálico, recoater espalha nova camada. Horas a dias até peça completa.</p></div></div>
<div class="flex gap-4 items-start"><span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">4</span><div><p class="text-on-surface font-medium">Materiais e parâmetros</p><p class="text-tertiary text-body-md text-sm">Aço Inox 316L, Maraging, alumínio, titânio — cada um com parâmetros próprios de potência, velocidade, hatching.</p></div></div>
<div class="flex gap-4 items-start"><span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">5</span><div><p class="text-on-surface font-medium">Pós-processamento e inspeção dimensional</p><p class="text-tertiary text-body-md text-sm">Alívio térmico, remoção de suportes, HIP, usinagem das superfícies funcionais, inspeção CMM.</p></div></div>
</div>

## Etapa 1: Preparação do modelo e fatiamento

### Do CAD ao STL

O ponto de partida é o modelo CAD da peça em formato sólido (SolidWorks, Inventor, Fusion 360). Esse modelo é exportado como **STL** — uma malha triangulada que aproxima a geometria. A resolução do STL precisa ser alta o suficiente para preservar as curvas e features sem gerar arquivo gigante (~5-50MB típico para uma peça industrial).

Cada vez mais, formatos paramétricos diretos (STEP, 3MF) são usados — preservam mais informação que STL e evitam erros de aproximação.

### Decisões de orientação

A orientação da peça dentro do volume de build da máquina **afeta tudo**: tempo de impressão, quantidade de suportes, qualidade superficial, propriedades mecânicas anisotrópicas, e até a viabilidade da peça. Princípios:

- **Minimizar suportes:** superfícies inclinadas abaixo de ~45° em relação à plataforma exigem suportes. Orientar para reduzir essas regiões diminui pós-processamento.
- **Acabamento das superfícies críticas:** superfícies viradas para baixo (downskin) têm pior acabamento que viradas para cima (upskin). Posicionar superfícies de interesse para cima.
- **Anisotropia mecânica:** propriedades mecânicas são levemente diferentes entre eixos. Para carga predominante em uma direção, orientar a peça de forma que a carga não fique paralela às camadas.
- **Eficiência de build:** múltiplas peças podem compartilhar a plataforma. Empacotar bem reduz custo unitário.

### Geração de suportes

Áreas com balanço (inclinação < 45°) precisam de **estruturas de suporte** — geometrias reticuladas finas que sustentam a peça durante a impressão e são removidas no pós-processo. Suportes mal projetados geram:
- Marcas superficiais difíceis de remover.
- Tempo extra de pós-processamento.
- Stress térmico que pode deformar a peça.
- Custo extra em material de suporte.

Engenharia de suporte é uma especialização — bons operadores SLM dedicam tempo significativo a otimizar suportes, frequentemente usando software dedicado (Materialise Magics, Autodesk Netfabb).

### Fatiamento

Com orientação e suportes definidos, o software slicer fatia a geometria em **camadas de 20 a 60 micrômetros de espessura**. Para cada camada, o slicer gera o caminho que o laser vai percorrer:

- **Contorno (skin):** trajetória que define o perímetro da camada.
- **Hatching (interior):** padrão de varredura paralela ou em zigue-zague para fundir o interior. Estratégias variam (chess, stripes, rotating layers) para gerenciar tensões térmicas.
- **Parâmetros de laser:** potência (W), velocidade de varredura (mm/s), espaçamento entre linhas (hatch spacing) — calibrados especificamente para cada material e cada região da peça (contorno vs. interior, camadas de topo vs. middle).

O arquivo final que vai para a máquina é um conjunto de instruções de movimento + ativação de laser camada por camada.

## Etapa 2: Atmosfera controlada

Metais em alta temperatura oxidam **rapidamente**. Aço fundido em contato com oxigênio forma escória que deteriora as propriedades mecânicas da peça final. Alumínio é ainda pior — forma camada de alumina que impede a fusão. Titânio é o mais sensível — pode pegar fogo em pó na presença de oxigênio.

Por isso, a câmara SLM **opera com atmosfera inerte**:
- **Argônio:** padrão para titânio, aços e alumínio. Pesado, fica naturalmente acumulado na câmara.
- **Nitrogênio:** alternativa mais barata para aços inoxidáveis. Menos puro que argônio mas suficiente para 316L.

Antes da impressão começar, a câmara é **purgada**: ar atmosférico é evacuado e substituído por gás inerte até atingir < 100 ppm de oxigênio residual. Esse processo leva 15-60 minutos dependendo do volume da máquina.

Durante a impressão, há fluxo contínuo de gás para remover fumaça e respingos gerados pela fusão, mantendo o caminho óptico do laser limpo.

## Etapa 3: Fusão a laser camada por camada

### O ciclo de impressão

A impressão acontece em loop até a peça completar:

1. **Recoater espalha pó:** uma lâmina ou rolo distribui uma camada uniforme de pó metálico sobre o build plate (ou sobre as camadas anteriores).
2. **Laser funde a camada:** o feixe segue o caminho gerado pelo slicer, fundindo o pó onde a camada existe.
3. **Plataforma desce:** o build plate desce uma altura igual à espessura de camada (20-60μm).
4. **Repete:** 1.000 a 50.000 vezes dependendo da altura total da peça.

### O laser

SLM usa **laser de fibra ytterbium**, comprimento de onda ~1070nm, potência tipicamente 200-1000W. Esse comprimento de onda é absorvido eficientemente por metais (40-60% absorção, vs. <10% de laser CO₂). A focalização produz spot de 50-100μm — escala compatível com o tamanho das partículas de pó (~30-50μm).

A velocidade de varredura típica é 800-2.000 mm/s. Isso significa que o laser passa rapidamente sobre cada ponto — o tempo de interação é da ordem de microssegundos. Mesmo assim, a energia depositada é suficiente para elevar o metal acima do ponto de fusão (1.400°C para aços), formando uma poça líquida que solidifica rapidamente.

### O pó metálico

Pó SLM é diferente de pó genérico. Características-chave:
- **Esfericidade alta:** partículas esféricas escoam bem no recoater e formam camada uniforme.
- **Distribuição granulométrica controlada:** tipicamente 15-45μm.
- **Pureza:** ligas com composição química rigorosamente controlada.
- **Atomização:** produzido por atomização a gás inerte para preservar características.

Pó SLM custa **R$ 200 a R$ 2.000 por kg** dependendo do material — Aço Inox 316L na ponta baixa, titânio na ponta alta. Parte do pó da câmara é reciclável (peneirar para remover partículas oxidadas), parte vai para descarte controlado.

### Duração da impressão

Tempo total de impressão depende fortemente do **volume de material fundido** e da **altura Z** (cada camada exige tempo de recoating + tempo de fusão). Ordens de grandeza:

- Peça pequena (50cm³): 6-12 horas
- Peça média (200cm³): 18-36 horas
- Build cheio (peças múltiplas, 1000-3000cm³ total): 48-120 horas

Impressões longas frequentemente correm **noites e fins de semana** com a máquina autônoma.

## Etapa 4: Materiais e parâmetros

Cada material exige um **conjunto próprio de parâmetros** — potência de laser, velocidade, hatch spacing, espessura de camada, atmosfera, temperatura de plataforma. Estes parâmetros são fruto de calibração extensa do fabricante da máquina + ajustes específicos da aplicação.

### Aço Inox 316L

- **Aplicações:** ambientes corrosivos (químico, marinho, médico-laboratorial não-implantes), peças biocompatíveis não-implantáveis.
- **Propriedades pós-SLM:** densidade > 99,7%, tensão de escoamento 470-540 MPa, alongamento 45-50% (frequentemente superior a 316L forjado).
- **Pós-processamento típico:** alívio térmico a 650°C por 2-4h, usinagem dos diâmetros funcionais.

### Aço Maraging

- **Aplicações:** ferramental de injeção, moldes com refrigeração conformal, peças sob alta carga.
- **Propriedades pós-SLM (envelhecido):** tensão de escoamento > 1.800 MPa, dureza HRC 50-54.
- **Pós-processamento:** envelhecimento a 490°C por 5-8h para atingir resistência máxima.

### Alumínio AlSi10Mg

- **Aplicações:** peças leves, trocadores de calor, suportes estruturais (não-aeronáuticos).
- **Propriedades:** densidade ~2,67 g/cm³, tensão de escoamento 230-280 MPa após T6.
- **Pós-processamento:** alívio térmico + envelhecimento T6 para propriedades máximas.

### Titânio Ti-6Al-4V

- **Aplicações:** componentes leves de alta performance, peças biocompatíveis não-implantes.
- **Propriedades:** razão resistência/peso excepcional, biocompatibilidade.
- **Pós-processamento:** HIP frequente para fechar microporosidades, alívio térmico.

## Etapa 5: Pós-processamento e inspeção dimensional

Esta etapa muitas vezes consome **tanto ou mais tempo** que a impressão em si. Subetapas:

### Alívio térmico

Logo após a impressão, a peça (ainda fixada na plataforma) vai para um forno de alívio térmico. Temperaturas e tempos variam por material (650°C/2-4h para 316L, ~250°C para Alumínio). O objetivo é **liberar tensões internas** geradas pelo rápido aquecimento/resfriamento durante a fusão — sem isso, a peça pode trincar ou deformar durante a remoção da plataforma.

### Remoção da plataforma

A peça é cortada da plataforma por **EDM a fio** (eletroerosão) ou serra de banda. EDM é mais preciso e menos invasivo termicamente — preferido para peças críticas.

### Remoção de suportes

Suportes são quebrados manualmente ou removidos com ferramentas (alicate, formão, lixa). Em casos complexos, EDM ou usinagem CNC removem suportes em regiões delicadas. Esta é uma das etapas mais trabalhosas e onde bom projeto de suporte paga dividendos.

### HIP (Hot Isostatic Pressing) — opcional

Para aplicações onde porosidade absoluta zero é necessária, a peça vai para câmara HIP: alta pressão (~100 MPa) + alta temperatura (próximo do ponto de fusão) por horas. Isso **fecha microporosidades internas** que sobraram da fusão. Custo significativo, justificado em aplicações críticas.

### Usinagem das superfícies funcionais

Superfícies SLM brutas têm Ra de 6-12μm — inadequado para vedações, eixos, encaixes apertados, roscas. Essas regiões são usinadas em CNC com sobre-metal deixado no projeto (~0,5-2mm). Após usinagem, Ra cai para 0,8-3,2μm conforme operação.

### Inspeção dimensional

A peça final passa por inspeção em CMM (Coordinate Measuring Machine) ou scanner 3D, comparando com o CAD original. Relatório dimensional documenta tolerâncias atendidas em cotas funcionais.

## Resumo do fluxo total

<div class="glass-panel rounded-sm p-6 my-8 border border-primary-container/15 space-y-3 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<div class="flex gap-3 items-start"><span class="text-primary-container text-label-caps">▸</span><div><p class="text-on-surface text-sm"><strong>Dia 1:</strong> Recebimento de CAD, análise de viabilidade, orientação e suportes.</p></div></div>
<div class="flex gap-3 items-start"><span class="text-primary-container text-label-caps">▸</span><div><p class="text-on-surface text-sm"><strong>Dia 2:</strong> Fatiamento, programação da máquina, purga e início da impressão.</p></div></div>
<div class="flex gap-3 items-start"><span class="text-primary-container text-label-caps">▸</span><div><p class="text-on-surface text-sm"><strong>Dias 2-4:</strong> Impressão SLM (horas a dias dependendo do volume).</p></div></div>
<div class="flex gap-3 items-start"><span class="text-primary-container text-label-caps">▸</span><div><p class="text-on-surface text-sm"><strong>Dia 4-5:</strong> Resfriamento, alívio térmico, despoeiramento (recuperar pó não-fundido).</p></div></div>
<div class="flex gap-3 items-start"><span class="text-primary-container text-label-caps">▸</span><div><p class="text-on-surface text-sm"><strong>Dia 5-6:</strong> Remoção da plataforma, remoção de suportes.</p></div></div>
<div class="flex gap-3 items-start"><span class="text-primary-container text-label-caps">▸</span><div><p class="text-on-surface text-sm"><strong>Dia 6-7:</strong> Usinagem das superfícies funcionais, inspeção dimensional.</p></div></div>
<div class="flex gap-3 items-start"><span class="text-primary-container text-label-caps">▸</span><div><p class="text-on-surface text-sm"><strong>Dia 7-8:</strong> Embalagem, NF-e, entrega.</p></div></div>
</div>

Total típico: **5 a 10 dias úteis** entre recebimento do CAD e entrega de peça SLM funcional. Esse prazo é fortemente influenciado pela complexidade da geometria, necessidade de HIP, e demanda da máquina no momento.

## O que esperar como cliente SLM

Três expectativas importantes:

**1. Acabamento bruto não é o final.** A peça que sai da câmara SLM raramente é a peça funcional final. Usinagem das superfícies críticas é a regra, não a exceção.

**2. O lead time tem variabilidade.** A impressão em si é determinística, mas o pós-processamento envolve operações de bancada que escalonam por demanda. Para projetos críticos, alinhar prazo antecipadamente.

**3. Geometria é o ativo principal.** O CAD bem projetado para SLM (com sobre-metal nas superfícies funcionais, suportes minimizados, orientação considerada) reduz custo final em 30-50% versus CAD ingênuo. Discussão de projeto antes da impressão paga dividendos significativos.

## Conclusão

SLM não é "imprimir metal" — é um processo industrial composto por preparação CAD, fatiamento especializado, atmosfera controlada, fusão a laser de precisão e pós-processamento metalúrgico. Cada etapa tem decisões que afetam o resultado. Entender o fluxo permite especificar peças melhor, alinhar prazos com realismo, e tomar decisões de projeto que reduzem custo sem comprometer função.

A AUMAF 3D opera o fluxo SLM completo na sede em São Carlos – SP, incluindo modelagem, engenharia reversa quando necessária, impressão em múltiplos materiais metálicos, pós-processamento e inspeção dimensional. Para discutir um projeto SLM, <a href="/contato?ref=blog-processo-slm" class="text-primary-container hover:underline">envie o CAD pelo formulário</a> ou explore os <a href="/servicos" class="text-primary-container hover:underline">serviços técnicos</a> oferecidos.

---

**Leitura complementar:**
- <a href="/blog/impressao-3d-metalica-quando-slm-melhor-escolha" class="text-primary-container hover:underline">Quando SLM é a melhor escolha</a>
- <a href="/blog/slm-sls-sla-fdm-qual-tecnologia-escolher" class="text-primary-container hover:underline">SLM vs SLS vs SLA vs FDM: comparativo</a>
- <a href="/materiais" class="text-primary-container hover:underline">Catálogo completo de materiais</a>
- <a href="/glossario" class="text-primary-container hover:underline">Glossário técnico</a>
`,
}
