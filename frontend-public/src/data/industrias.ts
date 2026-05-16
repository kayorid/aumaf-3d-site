/**
 * Landings por indústria — consumidas por:
 *  - src/pages/industrias/[slug].astro
 *  - src/pages/industrias/index.astro (hub)
 *  - llms.txt (seção "Indústrias atendidas")
 *
 * Cada landing precisa de ~600-1200 palavras para evitar thin content.
 */

export interface IndustryFaq {
  q: string
  a: string
}

export interface IndustryCase {
  title: string
  body: string
}

export interface IndustryMaterialRec {
  slug: string // referencia /materiais#<slug>
  name: string
  why: string
}

export interface Industry {
  slug: string
  hero: string // h1 curto
  heading: string // chamada acessível para hub
  pitch: string // 1-2 frases curtas
  metaTitle: string
  metaDescription: string
  serviceType: string // ex: "Impressão 3D para indústria automotiva"
  keywords: string[]
  dores: { title: string; body: string }[]
  abordagem: { title: string; body: string }[]
  cases: IndustryCase[]
  materiais: IndustryMaterialRec[]
  processos: { name: string; url: string; why: string }[]
  faqs: IndustryFaq[]
  disclaimer?: string
  ctaText?: string
  bg?: string // /images/bg-X.webp para preload
}

export const industrias: Industry[] = [
  {
    slug: 'automotiva',
    hero: 'Impressão 3D para a indústria automotiva',
    heading: 'Automotiva',
    pitch: 'Gabaritos, peças de reposição, protótipos e ferramentaria sob demanda — sem molde, sem mínimo de quantidade.',
    metaTitle: 'Impressão 3D Automotiva — Gabaritos, Reposição, Protótipos | AUMAF 3D',
    metaDescription: 'Impressão 3D para a indústria automotiva no Brasil: gabaritos de montagem, peças de reposição para veículos clássicos, protótipos de validação e ferramentaria sob demanda em PA CF15, Nylon PA12 e ABS. São Carlos – SP.',
    serviceType: 'Impressão 3D para indústria automotiva',
    keywords: ['impressão 3d automotiva', 'gabarito impresso 3d', 'peça reposição carro impressão 3d', 'protótipo automotivo'],
    bg: '/images/bg-blueprint.webp',
    dores: [
      { title: 'Ferramentaria cara para baixos volumes', body: 'Investir em molde para pequenas séries de gabaritos, dispositivos ou peças únicas raramente compensa. Manufatura aditiva elimina o ferramental e entrega a peça funcional em dias.' },
      { title: 'Peças descontinuadas pelo fabricante', body: 'Veículos clássicos e linhas antigas perdem suporte de peças. Com engenharia reversa + impressão, reproduzimos a peça mesmo sem desenho original.' },
      { title: 'Gabaritos sob medida na linha de produção', body: 'Dispositivos de montagem, guias de soldagem, jigs de inspeção e gauges precisam acompanhar mudanças de produto. Iteração rápida vira vantagem competitiva.' },
      { title: 'Validação de design antes de investir em molde', body: 'Protótipos funcionais em material similar ao de produção validam encaixe, ergonomia e resistência por uma fração do custo do tooling final.' },
    ],
    abordagem: [
      { title: 'Materiais técnicos compatíveis', body: 'PA CF15 (substituindo alumínio em rigidez/leveza), Nylon PA12 (durabilidade e atrito), ABS/ASA (impacto e exposição), TPU (vedações e amortecedores).' },
      { title: 'Processos certos para cada uso', body: 'FDM para gabaritos e peças funcionais grandes; SLS para protótipos sem suporte e geometrias internas; SLA para modelos visuais de alta fidelidade.' },
      { title: 'DfAM aplicado caso a caso', body: 'Reorientação de camadas para máxima resistência, consolidação de peças multipart e lattice quando peso importa — análise técnica em cada orçamento.' },
    ],
    cases: [
      { title: 'Gabarito de montagem para chicote elétrico', body: 'Dispositivo em PA CF15 que orienta crimpagem e fixação de chicote — substituiu jig de alumínio usinado, com 60% menos tempo de entrega.' },
      { title: 'Peça de reposição para veículo clássico', body: 'Suporte de console central inexistente no mercado: scaneado com scanner óptico, modelado e impresso em ABS preto com acabamento por vapor de acetona.' },
      { title: 'Protótipo de duto de admissão', body: 'Validação aerodinâmica em túnel de vento antes de tooling — peça em SLA com pintura automotiva.' },
      { title: 'Suporte para teste de durabilidade', body: 'Dispositivo fixador para ensaio de vibração; impresso em PA CF15 para resistir aos ciclos sem deformação.' },
    ],
    materiais: [
      { slug: 'mat-08-pa-cf15', name: 'PA CF15', why: 'Rigidez/leveza para gabaritos e peças sob carga' },
      { slug: 'mat-16-pa12-sls', name: 'Nylon PA12 (SLS)', why: 'Peças funcionais sem suporte, geometrias internas' },
      { slug: 'mat-02-abs', name: 'ABS', why: 'Impacto + acabamento por acetona' },
      { slug: 'mat-06-tpu', name: 'TPU', why: 'Vedações, buchas, amortecedores' },
    ],
    processos: [
      { name: 'Prototipagem Rápida', url: '/servicos#prototipagem', why: 'Validar antes do molde' },
      { name: 'Peças Funcionais', url: '/servicos#funcionais', why: 'Gabaritos e reposição' },
      { name: 'Engenharia Reversa', url: '/servicos#reposicao', why: 'Peças descontinuadas' },
    ],
    faqs: [
      { q: 'Vocês fazem peças para veículos clássicos sem desenho original?', a: 'Sim. Combinamos engenharia reversa (scanner 3D portátil de alta precisão) com modelagem CAD para reconstruir a peça e imprimir em material adequado ao uso (ABS, ASA, PA12). Processo típico: 5–10 dias úteis.' },
      { q: 'Posso usar impressão 3D em peças que vão para o cliente final?', a: 'Para peças visíveis e funcionais não-críticas (suportes, conectores, peças de interior), sim. Para peças estruturais primárias com requisitos de homologação (chassi, freio, direção), recomendamos validação por ensaio mecânico documentado — encaminhamos para laboratórios parceiros (ASTM D638 tração, D790 flexão, D256 impacto).' },
      { q: 'Quanto custa um gabarito impresso vs usinado?', a: 'Gabaritos simples em FDM (até 200×200×200 mm) ficam tipicamente 50–70% mais baratos que alumínio usinado e ficam prontos em 24–72h. Para gabaritos com cargas altas, PA CF15 oferece resistência próxima ao alumínio 6061 com massa muito menor.' },
      { q: 'Atendem Fórmula SAE e KartCross?', a: 'Sim. Somos parceiros oficiais da Fórmula SAE USP São Carlos 2024. Atendemos peças não-estruturais (dutos, cases de avionics, suportes). Para componentes estruturais, exigimos validação por ensaio antes de aprovação.' },
      { q: 'Como envio peças com requisitos dimensionais críticos?', a: 'Envie .STEP, .X_T ou .3MF (preservam paramétrico exato) e indique cotas críticas no orçamento. Controle dimensional com paquímetro/micrômetro antes do envio; peças críticas recebem certificado.' },
    ],
    ctaText: 'Orçamento para projeto automotivo',
  },
  {
    slug: 'aeroespacial',
    hero: 'Impressão 3D para aeroespacial, drones e Fórmula SAE',
    heading: 'Aeroespacial & UAV',
    pitch: 'PA CF15 + Aço Inox 316L para componentes leves, ductos, suportes e ferramentaria. Parceiros oficiais Fórmula SAE USP São Carlos.',
    metaTitle: 'Impressão 3D Aeroespacial e Drones — PA CF15, 316L | AUMAF 3D',
    metaDescription: 'Manufatura aditiva para aeroespacial, drones e UAVs: cases de avionics, suportes estruturais leves, ductos e fixadores em PA CF15, ASA e Aço Inox 316L (SLM). Parceiros Fórmula SAE USP São Carlos.',
    serviceType: 'Impressão 3D para aeroespacial e UAVs',
    keywords: ['impressão 3d aeroespacial', 'impressão 3d drone', 'pa cf15 uav', 'fórmula sae peça impressa'],
    bg: '/images/bg-particles.webp',
    dores: [
      { title: 'Cada grama conta', body: 'Em UAVs, drones e fórmula universitária, o trade-off rigidez/peso define autonomia, manobrabilidade e segurança. PA CF15 entrega 70–80% da rigidez específica do alumínio 6061 com massa muito menor.' },
      { title: 'Lotes pequenos sem economia de escala', body: 'Prototipagem aerodinâmica, suportes únicos, fixadores para bancos de teste — quantidades baixas (1–50) viabilizam manufatura aditiva diante de usinagem CNC.' },
      { title: 'Iteração rápida na fase de design', body: 'Times de competição (SAE, F-SAE, Aero Design) precisam testar 5 versões em uma semana. FDM entrega em 24–72h.' },
      { title: 'Geometrias complexas impossíveis em usinagem', body: 'Lattice internos, dutos curvos, hubs estruturais multi-conexão são exclusivos da manufatura aditiva — abrem espaço para topologia otimizada.' },
    ],
    abordagem: [
      { title: 'Materiais de alta performance', body: 'PA CF15 (nylon + 15% fibra de carbono) para máxima rigidez/leveza; ASA para peças com exposição UV; Aço Inox 316L (SLM) para componentes metálicos com requisitos de resistência mecânica e térmica.' },
      { title: 'Processos certos para cada peça', body: 'FDM com filamento técnico para suportes e cases; SLS PA12 para conjuntos funcionais sem suporte; SLM 316L para peças metálicas finais.' },
      { title: 'DfAM agressivo', body: 'Otimização topológica, lattice gyroide internas, consolidação de assemblies — reduzimos peso preservando rigidez torcional e modos de vibração.' },
    ],
    cases: [
      { title: 'Protótipo aerodinâmico Fórmula SAE USP São Carlos', body: 'Parceria oficial 2024. Peças não-estruturais para validação em túnel de vento e ajuste de pacote aerodinâmico.' },
      { title: 'Hub estrutural multi-rotor para drone industrial', body: 'PA CF15 com lattice interna; redução de 38% no peso vs versão maciça preservando rigidez torcional.' },
      { title: 'Fixadores não-estruturais para banco de teste', body: 'Suportes para sensoreamento durante ensaio de vibração de UAV; impressos em PA CF15 para resistir aos ciclos.' },
      { title: 'Duto de admissão otimizado', body: 'Curva interna sem suporte, lattice de reforço, paredes de 1.2 mm — impossível em fresamento.' },
    ],
    materiais: [
      { slug: 'mat-08-pa-cf15', name: 'PA CF15', why: 'Rigidez específica próxima de alumínio com massa menor' },
      { slug: 'mat-17-aco-inox-316l-slm', name: 'Aço Inox 316L (SLM)', why: 'Componentes metálicos finais, resistência térmica/mecânica' },
      { slug: 'mat-18-asa', name: 'ASA', why: 'Peças com exposição UV prolongada' },
      { slug: 'mat-16-pa12-sls', name: 'Nylon PA12 (SLS)', why: 'Conjuntos funcionais sem suporte' },
    ],
    processos: [
      { name: 'Peças Funcionais & Metal', url: '/servicos#funcionais', why: 'PA CF15 + 316L SLM' },
      { name: 'Prototipagem Rápida', url: '/servicos#prototipagem', why: 'Iteração aerodinâmica' },
      { name: 'Modelagem DfAM', url: '/servicos#modelagem', why: 'Otimização topológica + lattice' },
    ],
    disclaimer: 'Não atendemos certificação aeronáutica primária (FAR/EASA Part 21). Para peças não-estruturais, protótipos, ferramentaria e veículos de competição universitária, somos referência.',
    faqs: [
      { q: 'Imprimem peças certificadas para aviação tripulada?', a: 'Não. Não temos certificação Part 21 (FAR/EASA). Para componentes de aviação tripulada certificada, indicamos fornecedores especializados com programa de qualidade próprio (PMA/STC).' },
      { q: 'Atendem drones industriais e UAVs comerciais?', a: 'Sim, para componentes não-críticos de voo: cases, suportes, hubs estruturais, dutos. Para peças críticas de voo, é necessário ensaio mecânico documentado caso a caso (laboratórios parceiros).' },
      { q: 'Qual a relação resistência/peso do PA CF15 vs alumínio?', a: 'PA CF15 chega a 70–80% da resistência específica do Al-6061 com densidade aproximadamente 50% menor. Para muitos componentes onde tensão é o requisito (não rigidez extrema), substitui alumínio com vantagem de massa.' },
      { q: 'Vocês ajudam com otimização topológica?', a: 'Sim. Recebemos a peça atual (CAD ou física) + envelope funcional + cargas e devolvemos versão otimizada por algoritmo — tipicamente 20–40% menos massa. Iteração em CAD + impressão de protótipo de validação inclusa.' },
      { q: 'Atendem times de Fórmula SAE / Aero Design?', a: 'Sim. Parceiros oficiais Fórmula SAE USP São Carlos 2024 — atendemos com condições especiais para projetos universitários (academia/educação/pesquisa).' },
    ],
    ctaText: 'Orçamento para projeto aeroespacial',
  },
  {
    slug: 'medica-odontologica',
    hero: 'Impressão 3D médica e odontológica',
    heading: 'Médica & Odontológica',
    pitch: 'Modelos anatômicos pré-cirúrgicos, gabaritos de furação odontológica e dispositivos não-invasivos para treinamento e planejamento.',
    metaTitle: 'Impressão 3D Médica e Odontológica — Modelos Anatômicos | AUMAF 3D',
    metaDescription: 'Impressão 3D para área médica e odontológica: modelos anatômicos para planejamento pré-cirúrgico, gabaritos de furação dentária, dispositivos de treinamento e equipamento médico não-invasivo em resinas SLA e PA12.',
    serviceType: 'Impressão 3D para área médica e odontológica',
    keywords: ['modelo anatômico impressão 3d', 'moldeira dentária impressão 3d', 'gabarito cirúrgico 3d', 'impressão 3d odontologia'],
    bg: '/images/bg-docs.webp',
    dores: [
      { title: 'Planejamento pré-cirúrgico exige modelo físico', body: 'Cirurgias ortopédicas e maxilofaciais complexas se beneficiam de modelo anatômico tátil para ensaio do procedimento e treinamento da equipe.' },
      { title: 'Gabaritos cirúrgicos personalizados', body: 'Guias de furação para parafusos pediculares, gabaritos de osteotomia e dispositivos não-invasivos sob medida — cada paciente, uma peça.' },
      { title: 'Equipamento de treinamento médico', body: 'Modelos didáticos detalhados em resina substituem cadáveres em treinamentos de procedimentos minimamente invasivos.' },
      { title: 'Iteração rápida em P&D dental', body: 'Moldeiras, alinhadores piloto e dispositivos protéticos prototipam em horas, não semanas.' },
    ],
    abordagem: [
      { title: 'Resinas SLA de alta resolução', body: 'Detalhe de até 25 µm em camada Z; permite reproduzir anatomia complexa para planejamento. Resinas castable para fundição em metal.' },
      { title: 'Nylon PA12 para gabaritos funcionais', body: 'Gabaritos de furação odontológica e dispositivos auxiliares em PA12 (SLS) — resistente, fácil de esterilizar por imersão, sem necessidade de suporte na impressão.' },
      { title: 'Confidencialidade total', body: 'NDA padrão assinado, arquivos em servidor isolado, destruição automática após 90 dias (ou imediata sob solicitação).' },
    ],
    cases: [
      { title: 'Modelo anatômico para planejamento de cirurgia ortopédica', body: 'Reprodução de fêmur com fratura complexa em resina branca; cirurgião pré-modelou placas e parafusos antes do ato.' },
      { title: 'Gabarito de furação odontológica', body: 'Guia personalizado em PA12 para implantes; precisão XY ~0.3 mm garantiu posicionamento conforme planejamento digital.' },
      { title: 'Modelo educacional médico', body: 'Conjunto de órgãos em resina para treinamento de procedimento minimamente invasivo em centro de simulação.' },
      { title: 'Moldeira piloto', body: 'Versão de validação de moldeira de clareamento em material biocompatível classe IIa; aprovação rápida antes de produção em série.' },
    ],
    materiais: [
      { slug: 'mat-14-resina-standard', name: 'Resina Standard (SLA)', why: 'Modelos anatômicos de alta resolução' },
      { slug: 'mat-15-resina-abs', name: 'Resina ABS-like (SLA)', why: 'Gabaritos funcionais com mecânica + detalhe' },
      { slug: 'mat-16-pa12-sls', name: 'Nylon PA12 (SLS)', why: 'Gabaritos esterilizáveis sem suporte' },
    ],
    processos: [
      { name: 'Prototipagem Rápida (SLA)', url: '/servicos#prototipagem', why: 'Modelos anatômicos' },
      { name: 'Peças Funcionais (SLS)', url: '/servicos#funcionais', why: 'Gabaritos cirúrgicos' },
      { name: 'Modelagem 3D', url: '/servicos#modelagem', why: 'Reconstrução a partir de DICOM' },
    ],
    disclaimer: 'Não fabricamos implantes ou dispositivos invasivos com regulamentação ANVISA específica. Modelos anatômicos para educação/pré-cirúrgico, gabaritos não-invasivos e dispositivos de treinamento são nossa especialidade. Para implantes, indicamos parceiros certificados.',
    faqs: [
      { q: 'Vocês imprimem implantes ortopédicos ou dentários?', a: 'Não. Implantes exigem certificação ANVISA classe III e materiais bio-classe que ainda não fabricamos in-house. Indicamos parceiros certificados para esse tipo de produto.' },
      { q: 'Aceitam arquivos DICOM da tomografia?', a: 'Sim. Convertemos DICOM em STL/STEP segmentando estruturas anatômicas (osso, vasos, tecido mole) em software médico especializado. Custo de segmentação cobrado separadamente conforme complexidade.' },
      { q: 'Os modelos anatômicos podem ser esterilizados?', a: 'Modelos em resina SLA aceitam desinfecção química leve. Para esterilização por autoclave (alta temperatura), use PA12 ou peças em Aço Inox 316L (SLM).' },
      { q: 'Quanto tempo leva um modelo anatômico para planejamento cirúrgico?', a: 'Recebendo DICOM já segmentado: 24–48h. Com segmentação inclusa: 3–5 dias úteis. Para casos urgentes, contate via WhatsApp.' },
      { q: 'Têm experiência em odontologia digital?', a: 'Sim — moldeiras de validação, gabaritos de furação para implantes, modelos de estudo para alinhadores. Aceitamos STL exportado de scanners intra-orais e softwares de planejamento.' },
    ],
    ctaText: 'Orçamento para projeto médico ou odontológico',
  },
  {
    slug: 'joalheria-design',
    hero: 'Impressão 3D para joalheria e design de produto',
    heading: 'Joalheria & Design',
    pitch: 'Resinas castable de alta resolução para fundição por cera perdida; modelos visuais e protótipos premium para validação de coleção.',
    metaTitle: 'Impressão 3D Joalheria e Design — Resina Castable, SLA | AUMAF 3D',
    metaDescription: 'Impressão 3D para joalheria e design: modelos castable em SLA para fundição por cera perdida em prata e ouro, protótipos visuais de alta resolução, prototipagem de coleções e peças únicas.',
    serviceType: 'Impressão 3D para joalheria e design de produto',
    keywords: ['impressão 3d joalheria', 'modelo cera perdida sla', 'castable joia', 'protótipo design produto'],
    bg: '/images/bg-particles.webp',
    dores: [
      { title: 'Peças únicas com alta resolução', body: 'Joias e modelos de design precisam reproduzir geometrias finas (filigranas, texturas, monogramas) que FDM não entrega.' },
      { title: 'Modelos para fundição por cera perdida', body: 'Joalheria tradicional usa modelo em cera; resinas castable substituem com mais detalhe e repetibilidade.' },
      { title: 'Validação de coleção sem investir em ferramental', body: 'Antes de injetar metal ou plástico em série, protótipos em SLA validam estética e ergonomia.' },
      { title: 'Detalhe extremo em superfícies curvas', body: 'Lentes de cobranding, embalagens premium e modelos de produto exigem superfícies sem facetamento — terreno do SLA/DLP.' },
    ],
    abordagem: [
      { title: 'Resina Castable para fundição', body: 'Modelos em resina especialmente formulada para queima limpa em forno (burn-out) — substitui modelo de cera tradicional com mais detalhe.' },
      { title: 'Resinas Standard de alta resolução', body: 'Camada Z de 25–100 µm; reproduzimos detalhes invisíveis a olho nu em joias e peças de design.' },
      { title: 'Acabamento premium', body: 'Lixamento progressivo, primer e pintura para protótipos de apresentação; suporte por jewelry-rendering quando aplicável.' },
    ],
    cases: [
      { title: 'Modelo SLA castable para fundição em prata', body: 'Anel com filigrana — modelo em resina castable enviado para fundição em prata 950; reprodução fiel.' },
      { title: 'Protótipo de pulseira em resina rígida', body: 'Validação de encaixe e ergonomia antes de produção em metal.' },
      { title: 'Matriz de injeção para curta tiragem', body: 'Modelo em resina ABS-like usado como matriz piloto para injeção de silicone em 30 peças.' },
      { title: 'Protótipo premium de produto', body: 'Lente de óculos de design impressa em SLA com acabamento por pintura automotiva.' },
    ],
    materiais: [
      { slug: 'mat-14-resina-standard', name: 'Resina Standard (SLA)', why: 'Detalhe extremo + acabamento liso' },
      { slug: 'mat-15-resina-abs', name: 'Resina ABS-like (SLA)', why: 'Mecânica + detalhe para protótipos funcionais' },
    ],
    processos: [
      { name: 'Prototipagem Rápida (SLA)', url: '/servicos#prototipagem', why: 'Modelos castable e visuais' },
      { name: 'Modelagem 3D', url: '/servicos#modelagem', why: 'CAD jewelry a partir de sketch ou referência' },
    ],
    faqs: [
      { q: 'A resina castable queima totalmente sem deixar resíduo?', a: 'Sim — resinas castable são formuladas para burn-out limpo, sem deixar cinzas. Trabalhamos com perfil de temperatura padrão da indústria; podemos ajustar para forno específico do cliente.' },
      { q: 'Vocês fundem o metal também?', a: 'Não. Entregamos o modelo castable pronto para fundição. Indicamos fundidores parceiros em São Paulo/SP, ou enviamos para o fornecedor do cliente.' },
      { q: 'Posso enviar arquivo de software de joalheria (Matrix, Rhino, JewelCAD)?', a: 'Sim. Aceitamos .STL, .3DM (Rhino) e .STEP. Para Matrix exporte em STL com tolerância fina para preservar detalhes.' },
      { q: 'Quanto tempo leva um modelo de joia?', a: 'Joias pequenas em SLA castable: 24–48h. Modelos maiores ou conjuntos: 2–4 dias úteis. Para coleções recorrentes, oferecemos fila prioritária.' },
      { q: 'Qual a resolução típica para joias?', a: 'Camada Z de 25 µm em SLA — invisível a olho nu. Detalhe XY ~50 µm. Reproduz filigranas, monogramas e texturas finas com fidelidade.' },
    ],
    ctaText: 'Orçamento para joalheria ou design',
  },
  {
    slug: 'educacao-pesquisa',
    hero: 'Impressão 3D para educação, pesquisa e equipes universitárias',
    heading: 'Educação & Pesquisa',
    pitch: 'TCC, iniciações científicas, projetos de competição universitária, pesquisa aplicada — atendimento especial a USP São Carlos e UFSCar.',
    metaTitle: 'Impressão 3D Universidades — USP, UFSCar, TCC, SAE | AUMAF 3D',
    metaDescription: 'Impressão 3D para educação e pesquisa: TCC, iniciações científicas, equipes de competição (Fórmula SAE), projetos universitários. Hub no Parque Tecnológico Damha II, próximo a USP São Carlos e UFSCar.',
    serviceType: 'Impressão 3D para educação e pesquisa',
    keywords: ['impressão 3d universidade são carlos', 'impressão 3d tcc', 'impressão 3d usp', 'impressão 3d ufscar', 'fórmula sae'],
    bg: '/images/bg-stars.webp',
    dores: [
      { title: 'Orçamento limitado de bolsa/grupo', body: 'Alunos e projetos universitários têm verba contada. Materiais econômicos (PLA, PETG) cobrem 80% dos casos com qualidade técnica.' },
      { title: 'Prazos acadêmicos apertados', body: 'Bancas, congressos e entregas de TCC raramente esperam. Iteração rápida em FDM (24–72h) viabiliza últimos ajustes.' },
      { title: 'Falta de equipamento no laboratório', body: 'Universidades têm impressoras, mas frequentemente sem capacidade para SLS, SLM ou resinas especiais. Complementamos onde o lab para.' },
      { title: 'Aprendizado prático de DfAM', body: 'Recebimento de feedback técnico junto ao orçamento; o aluno entende por que o projeto precisa ser ajustado para impressão.' },
    ],
    abordagem: [
      { title: 'Materiais econômicos para protótipos', body: 'PLA e PETG cobrem TCC, ICs e protótipos visuais com custo acessível. PA12 (SLS) quando o projeto exige peça funcional.' },
      { title: 'Atendimento próximo a USP/UFSCar', body: 'Hub no Parque Tecnológico Damha II — retirada presencial gratuita ou envio para Centro de São Carlos no mesmo dia útil.' },
      { title: 'Apoio técnico DfAM', body: 'Cada projeto recebe avaliação de impressibilidade — feedback educacional sobre orientação, suporte, paredes mínimas e infill.' },
    ],
    cases: [
      { title: 'Parceria oficial Fórmula SAE USP São Carlos 2024', body: 'Peças não-estruturais e protótipos aerodinâmicos para a equipe. Atendimento prioritário com condições especiais.' },
      { title: 'Apoio a TCCs em engenharia mecânica', body: 'Bancada de teste com peças impressas, fixadores para ensaio de vibração, protótipos de mecanismo.' },
      { title: 'Projetos da UFSCar', body: 'Modelos de bioengenharia para apresentação, gabaritos para experimentos químicos, peças de laboratório personalizadas.' },
      { title: 'Iniciações científicas', body: 'Suportes para sensores, encaixes ergonômicos para experimentos de neurociência, peças de robótica educativa.' },
    ],
    materiais: [
      { slug: 'mat-00-pla', name: 'PLA', why: 'Mais econômico, fácil para protótipos visuais' },
      { slug: 'mat-04-petg', name: 'PET-G', why: 'Mais resistente que PLA, custo similar' },
      { slug: 'mat-16-pa12-sls', name: 'Nylon PA12 (SLS)', why: 'Peças funcionais sem necessidade de suporte' },
    ],
    processos: [
      { name: 'Prototipagem Rápida', url: '/servicos#prototipagem', why: 'Protótipos para banca/congresso' },
      { name: 'Peças Funcionais', url: '/servicos#funcionais', why: 'TCC, IC e mestrado' },
      { name: 'Modelagem 3D', url: '/servicos#modelagem', why: 'Quando o aluno não tem CAD pronto' },
    ],
    faqs: [
      { q: 'Têm condições especiais para alunos e equipes universitárias?', a: 'Sim. Oferecemos preço diferenciado e fila prioritária para projetos acadêmicos comprovados (carta da orientadora, link do projeto, comprovante de equipe oficial). Solicite informando seu vínculo no formulário.' },
      { q: 'Atendem entrega na USP São Carlos ou UFSCar diretamente?', a: 'Sim. Retirada presencial gratuita no nosso hub (Parque Tecnológico Damha II) ou entrega no campus por moto-rota mediante taxa simbólica. Combinamos no fechamento.' },
      { q: 'Posso enviar o arquivo que exportei do SolidWorks/Fusion/Onshape?', a: 'Sim. Aceitamos .STL, .X_T, .STEP e .3MF. Para TCC, recomendamos STEP/X_T — preservam paramétrico e evitam perda de precisão.' },
      { q: 'Conseguem material biodegradável para projeto sustentável?', a: 'Sim — PLA é nosso material biodegradável padrão (compostagem industrial). Útil para projetos que precisam tese de baixo impacto ambiental.' },
      { q: 'Vocês emitem nota fiscal para reembolso da universidade?', a: 'Sim. NF-e em todos os pedidos. Para faturamento direto à universidade, atendemos mediante empenho/CNPJ válido — fale com o comercial para detalhes.' },
    ],
    ctaText: 'Orçamento para projeto acadêmico',
  },
]
