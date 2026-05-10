/**
 * Catálogo de projetos do portfolio AUMAF 3D.
 * Fonte única de verdade para /portfolio (listagem) e /portfolio/[slug] (detalhe).
 */

export interface PortfolioMetric {
  label: string
  value: string
  hint?: string
}

export interface PortfolioGalleryItem {
  src: string
  alt: string
}

export interface PortfolioProject {
  slug: string
  cat: string
  title: string
  /** Material principal exibido em listagem. */
  mat: string
  accent: boolean
  /** Resumo curto (cards e meta description). */
  excerpt: string
  /** Setor/indústria atendido (para o detalhe). */
  industry: string
  /** Tecnologia de manufatura aditiva utilizada. */
  process: 'FDM' | 'SLA' | 'SLS' | 'Metal Sinterizado' | 'Misto'
  /** Briefing técnico — qual era a dor / contexto. */
  briefing: string
  /** O que foi entregue. */
  delivery: string
  /** Especificações técnicas (label/value). */
  specs: { label: string; value: string }[]
  /** Métricas de resultado mensuráveis. */
  results: PortfolioMetric[]
  /** Galeria de imagens. */
  gallery: PortfolioGalleryItem[]
  /** Tags/keywords (chips). */
  tags: string[]
}

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: 'port-01-suporte-robo',
    cat: 'Prototipagem',
    title: 'Suporte para Robô Industrial',
    mat: 'PA CF15',
    accent: true,
    excerpt: 'Suporte estrutural com 40% menos massa que o equivalente em alumínio, atendendo carga lateral de 18kgf.',
    industry: 'Automação Industrial',
    process: 'FDM',
    briefing: 'Cliente integrador de células robotizadas precisava de suporte customizado para fixar sensor de visão em braço robô colaborativo. Versão original em alumínio usinado custava R$1.200 por unidade e demorava 12 dias úteis. A geometria precisava acomodar 3 furos de fixação e cabos passantes — usinagem exigia operação em 4 lados.',
    delivery: 'Suporte único impresso em PA CF15 com lattice interno e canaleta integrada para o cabeamento. Carga de trabalho validada por ensaio de flexão (18 kgf laterais sem deformação plástica).',
    specs: [
      { label: 'Material', value: 'PA CF15 (Nylon + 15% fibra de carbono)' },
      { label: 'Processo', value: 'FDM industrial — bico hardened 0.5mm' },
      { label: 'Dimensões', value: '180 × 95 × 60 mm' },
      { label: 'Massa', value: '142 g (vs. 240 g em alumínio)' },
      { label: 'Tolerância', value: '±0,1 mm em furos' },
      { label: 'Acabamento', value: 'Bruto + lixamento spot em furos' },
    ],
    results: [
      { label: 'Prazo de entrega', value: '4 dias', hint: 'Vs. 12 dias em usinagem' },
      { label: 'Redução de massa', value: '−41%', hint: 'Lattice interno + DfAM' },
      { label: 'Custo unitário', value: '−63%', hint: 'Vs. peça em alumínio 6061' },
      { label: 'Carga validada', value: '18 kgf', hint: 'Ensaio de flexão lateral' },
    ],
    gallery: [
      { src: '/images/port-01-suporte-robo.webp', alt: 'Suporte estrutural em PA CF15 finalizado, vista isométrica' },
      { src: '/images/hero-fdm-extrusion.webp', alt: 'Detalhe da impressão FDM do suporte' },
      { src: '/images/mat-08-pa-cf15.webp', alt: 'Filamento PA CF15 utilizado' },
    ],
    tags: ['Prototipagem rápida', 'DfAM', 'Substituição de metal', 'Lattice'],
  },
  {
    slug: 'port-02-flange-316l',
    cat: 'Metal',
    title: 'Flange em Aço Inox 316L',
    mat: 'BASF Ultrafuse 316L',
    accent: false,
    excerpt: 'Flange descontinuada para equipamento alimentício, replicada em aço inox 316L grau alimentar com norma ASTM.',
    industry: 'Alimentícia',
    process: 'Metal Sinterizado',
    briefing: 'Equipamento de envase com 18 anos de operação teve a flange original perdida. Fornecedor europeu não fabricava mais a peça e indicava substituição completa do equipamento (~R$ 80.000). A peça precisava certificação 316L para contato com alimento.',
    delivery: 'Flange impressa em filamento BASF Ultrafuse 316L, debinding químico e sinterização em forno industrial parceiro. Densidade pós-sinterização >95% do aço maciço, certificada conforme ASTM 316L. Acabamento por jateamento + polimento sanitário.',
    specs: [
      { label: 'Material', value: 'BASF Ultrafuse 316L (aço inox grade alimentar)' },
      { label: 'Processo', value: 'FDM + debinding + sinterização' },
      { label: 'Dimensões', value: 'Ø 120 × 18 mm — 6 furos M8' },
      { label: 'Massa final', value: '420 g' },
      { label: 'Densidade', value: '>95% do aço sólido' },
      { label: 'Acabamento', value: 'Polimento sanitário Ra <1.6μm' },
    ],
    results: [
      { label: 'Custo total', value: 'R$ 2.400', hint: 'Vs. R$ 80k de equipamento novo' },
      { label: 'Prazo', value: '18 dias', hint: 'Inclui sinterização' },
      { label: 'Norma', value: 'ASTM 316L', hint: 'Contato alimentar' },
      { label: 'Vida útil', value: '15+ anos', hint: 'Equiparada à original' },
    ],
    gallery: [
      { src: '/images/port-02-flange-316l.webp', alt: 'Flange em aço inox 316L sinterizada, finalizada' },
      { src: '/images/mat-17-ultrafuse-316l.webp', alt: 'Filamento Ultrafuse 316L em rolo' },
    ],
    tags: ['Engenharia reversa', 'Aço inox', 'Indústria alimentícia', 'Reposição crítica'],
  },
  {
    slug: 'port-03-encaixe-sae',
    cat: 'Prototipagem',
    title: 'Encaixe para Fórmula SAE USP',
    mat: 'Nylon PA',
    accent: false,
    excerpt: 'Componente estrutural de cabine para protótipo Fórmula SAE da USP São Carlos — competição 2024.',
    industry: 'Engenharia Estudantil',
    process: 'FDM',
    briefing: 'Equipe Fórmula SAE da USP São Carlos precisava de encaixe customizado para fixar painel de instrumentos da cabine ao chassi tubular. Geometria precisava absorver vibração e tinha 5 dias úteis até a homologação técnica do veículo.',
    delivery: 'Encaixe impresso em Nylon PA com infill 60% e parede sólida nos pontos de fixação. Validado em pista durante a competição sem falhas estruturais. Peça padronizada e replicada para 4 unidades em estoque de campeonato.',
    specs: [
      { label: 'Material', value: 'Nylon (PA) — secado < 0.2% umidade' },
      { label: 'Processo', value: 'FDM com câmara fechada' },
      { label: 'Dimensões', value: '95 × 60 × 40 mm' },
      { label: 'Infill', value: '60% gyroid' },
      { label: 'Tolerância', value: '±0,15 mm' },
      { label: 'Quantidade', value: '4 unidades para a competição' },
    ],
    results: [
      { label: 'Prazo entrega', value: '3 dias', hint: 'Da CAD à entrega' },
      { label: 'Falhas em pista', value: '0', hint: 'Competição completa sem incidentes' },
      { label: 'Custo total', value: 'R$ 380', hint: '4 peças prontas para uso' },
    ],
    gallery: [
      { src: '/images/port-03-encaixe-sae.webp', alt: 'Encaixe estrutural Fórmula SAE em Nylon PA' },
    ],
    tags: ['Fórmula SAE', 'Pequena série', 'Validação em pista', 'Nylon'],
  },
  {
    slug: 'port-04-garra-pneumatica',
    cat: 'Peças Funcionais',
    title: 'Garra Pneumática para Automação',
    mat: 'PC + TPU',
    accent: true,
    excerpt: 'Garra customizada bi-material — corpo rígido em Policarbonato + ponteira flexível em TPU para manipulação de embalagens.',
    industry: 'Automação / Logística',
    process: 'FDM',
    briefing: 'Linha de empacotamento precisava de garra dedicada para manipular embalagens flexíveis de variados tamanhos sem esmagar. Solução comercial não existia — fabricantes ofereciam garras genéricas que precisavam regulagem manual.',
    delivery: 'Garra bi-material com corpo rígido em PC e ponteiras flexíveis em TPU 95A, intercambiáveis. Conexão pneumática integrada via canais internos impressos. Implantada em 3 estações de produção, operação 24/7 há 8 meses sem desgaste perceptível.',
    specs: [
      { label: 'Materiais', value: 'PC (corpo) + TPU 95A (ponteiras)' },
      { label: 'Processo', value: 'FDM dual-extruder' },
      { label: 'Dimensões', value: '180 × 80 × 65 mm' },
      { label: 'Pressão de ar', value: '6 bar nominal' },
      { label: 'Ciclos validados', value: '500.000+ acionamentos' },
      { label: 'Acabamento', value: 'Lixamento + sanitização ISO' },
    ],
    results: [
      { label: 'Tempo ciclo', value: '−18%', hint: 'Vs. solução manual anterior' },
      { label: 'Refugo embalagem', value: '−92%', hint: 'Esmagamento eliminado' },
      { label: 'Operação contínua', value: '8 meses', hint: 'Sem manutenção corretiva' },
    ],
    gallery: [
      { src: '/images/port-04-garra-pneumatica.webp', alt: 'Garra pneumática bi-material instalada em linha de produção' },
    ],
    tags: ['Bi-material', 'Pneumática', 'Automação industrial', 'Custom rigging'],
  },
  {
    slug: 'port-05-maquete-residencial',
    cat: 'Maquetes',
    title: 'Maquete Arquitetônica Residencial',
    mat: 'PLA / Resina',
    accent: false,
    excerpt: 'Maquete em escala 1:50 para apresentação de empreendimento residencial — fachada em SLA + estrutura em PLA.',
    industry: 'Arquitetura / Construção',
    process: 'Misto',
    briefing: 'Escritório de arquitetura precisava de maquete de alta qualidade visual para apresentação a investidores. Tempo apertado (10 dias) e exigência de fachada com detalhe arquitetônico fino (esquadrias, brise, jardins).',
    delivery: 'Maquete em escala 1:50 com estrutura modular em PLA branco fosco e elementos de fachada (esquadrias, balaústres, brise) em resina SLA por sua resolução superior. Iluminação LED interna integrada para apresentação noturna.',
    specs: [
      { label: 'Materiais', value: 'PLA branco fosco + Resina Standard' },
      { label: 'Processo', value: 'FDM + SLA combinados' },
      { label: 'Escala', value: '1:50' },
      { label: 'Dimensões totais', value: '720 × 480 × 380 mm' },
      { label: 'Quant. de peças', value: '184 componentes' },
      { label: 'Acabamento', value: 'Pintura epoxi + verniz fosco' },
    ],
    results: [
      { label: 'Prazo', value: '8 dias', hint: '2 dias antes do alvo' },
      { label: 'Vendas pós-evento', value: '+R$ 4,2M', hint: 'Reportado pelo cliente' },
      { label: 'Detalhe min.', value: '0,3 mm', hint: 'Esquadrias em SLA' },
    ],
    gallery: [
      { src: '/images/port-05-maquete-residencial.webp', alt: 'Maquete residencial em escala 1:50' },
    ],
    tags: ['Arquitetura', 'Apresentação', 'Multi-processo', 'SLA detalhe'],
  },
  {
    slug: 'port-06-conector-aeronautico',
    cat: 'Metal',
    title: 'Conector Estrutural Aeronáutico',
    mat: 'Ultrafuse 316L',
    accent: false,
    excerpt: 'Conector estrutural não-crítico para drone industrial — substituição de peça importada com prazo de 90 dias.',
    industry: 'Drones / UAV',
    process: 'Metal Sinterizado',
    briefing: 'Empresa de inspeção por drones tinha conector estrutural quebrado — peça vinha da Alemanha com prazo de 90 dias. Operação parada custava R$ 12.000/dia. Solução temporária em alumínio usinado não tinha rigidez torcional suficiente.',
    delivery: 'Conector replicado em aço inox 316L impresso e sinterizado, com geometria otimizada topologicamente para resistir torção. Operacional desde a entrega há 14 meses, sem falhas.',
    specs: [
      { label: 'Material', value: 'BASF Ultrafuse 316L' },
      { label: 'Processo', value: 'FDM + sinterização' },
      { label: 'Dimensões', value: '85 × 45 × 35 mm' },
      { label: 'Massa', value: '88 g' },
      { label: 'Resist. torção', value: '+22% vs. original' },
      { label: 'Otimização', value: 'Topologia FEA' },
    ],
    results: [
      { label: 'Prazo', value: '20 dias', hint: 'Vs. 90 dias importação' },
      { label: 'Custo evitado', value: 'R$ 240k', hint: 'Operação restabelecida' },
      { label: 'Vida útil', value: '14+ meses', hint: 'Sem manutenção' },
    ],
    gallery: [
      { src: '/images/port-06-conector-aeronautico.webp', alt: 'Conector estrutural em aço inox 316L' },
    ],
    tags: ['Drone', 'Topologia', 'Reposição crítica', 'Metal'],
  },
  {
    slug: 'port-07-empacotadora',
    cat: 'Peças Funcionais',
    title: 'Peça de Reposição para Empacotadora',
    mat: 'ABS Industrial',
    accent: false,
    excerpt: 'Came mecânica para máquina empacotadora descontinuada — replicada por engenharia reversa.',
    industry: 'Embalagem / Manufatura',
    process: 'FDM',
    briefing: 'Empacotadora de 22 anos com came mecânica trincada. Fabricante extinto há 11 anos. Cliente já considerava sucatear o equipamento e investir R$ 350k em substituição.',
    delivery: 'Came digitalizada em scanner 3D, modelada em CAD paramétrico, impressa em ABS industrial com tratamento de vapor de acetona para acabamento liso. Resistência ao desgaste validada em bancada — 200.000 ciclos sem deformação plástica.',
    specs: [
      { label: 'Material', value: 'ABS industrial (alta tenacidade)' },
      { label: 'Processo', value: 'FDM + alisamento por acetona' },
      { label: 'Dimensões', value: 'Ø 95 × 28 mm' },
      { label: 'Tolerância', value: '±0,08 mm na pista' },
      { label: 'Ciclos validados', value: '200.000 em bancada' },
    ],
    results: [
      { label: 'Custo', value: 'R$ 480', hint: 'Vs. R$ 350k em substituição' },
      { label: 'Prazo', value: '5 dias úteis' },
      { label: 'Operação', value: '14 meses', hint: 'Sem retrabalho' },
    ],
    gallery: [
      { src: '/images/port-07-empacotadora.webp', alt: 'Came mecânica em ABS para empacotadora' },
    ],
    tags: ['Engenharia reversa', 'Manutenção', 'Equipamento descontinuado'],
  },
  {
    slug: 'port-08-caixa-eletronica',
    cat: 'Prototipagem',
    title: 'Caixa de Eletrônica com Tampa',
    mat: 'PETG CF15',
    accent: false,
    excerpt: 'Encapsulamento de placa eletrônica IP54 com canaleta de cabeamento integrada para protótipo IoT.',
    industry: 'Eletrônica / IoT',
    process: 'FDM',
    briefing: 'Startup de IoT precisava de encapsulamento ergonômico e robusto para hardware piloto antes de investir em ferramental de injeção. Requisitos: IP54, fixação de PCB sem parafusos visíveis, abertura para conectores, cor neutra.',
    delivery: 'Caixa em duas peças (corpo + tampa) com encaixe snap-fit, vedação por anel de TPU integrado e suportes para PCB com clip. Acabamento fosco premium em PETG CF15. Validado em campo durante 6 meses de teste piloto.',
    specs: [
      { label: 'Material', value: 'PETG CF15 (Carbon Fiber 15%)' },
      { label: 'Processo', value: 'FDM com bico hardened' },
      { label: 'Dimensões', value: '120 × 80 × 35 mm' },
      { label: 'Vedação', value: 'IP54 — anel TPU integrado' },
      { label: 'Fixação PCB', value: 'Clips snap-fit, sem parafusos' },
    ],
    results: [
      { label: 'Iterações', value: '4 versões', hint: '8 dias da v1 à v4' },
      { label: 'Economia molde', value: 'R$ 90k', hint: 'Validação antes da injeção' },
      { label: 'Validação campo', value: '6 meses', hint: 'IP54 mantido' },
    ],
    gallery: [
      { src: '/images/port-08-caixa-eletronica.webp', alt: 'Caixa de eletrônica em PETG CF15' },
    ],
    tags: ['IoT', 'Snap-fit', 'IP54', 'Validação piloto'],
  },
  {
    slug: 'port-09-painel-resina',
    cat: 'Resina',
    title: 'Painel de Controle em Resina ABS',
    mat: 'Resina ABS',
    accent: false,
    excerpt: 'Painel decorativo de controle com detalhamento fino em texto gravado e ícones em alto-relevo.',
    industry: 'Equipamentos Hospitalares',
    process: 'SLA',
    briefing: 'Fabricante de equipamentos médicos não-críticos precisava de painel frontal com texto legível em pequena dimensão (até 1.2mm) e acabamento de alta qualidade visual. Injeção exigia ferramental dedicado por ~R$45k.',
    delivery: 'Painel impresso em resina ABS-like (SLA), camadas de 50µm, com gravação em alto-relevo de ícones e texto. Pintura automotiva primer + cor + verniz. Visualmente indistinguível de injeção, custo unitário compatível com produção piloto de 80 unidades.',
    specs: [
      { label: 'Material', value: 'Resina ABS-Like' },
      { label: 'Processo', value: 'SLA / MSLA' },
      { label: 'Camada', value: '50 µm' },
      { label: 'Texto mín.', value: '1.2 mm legível' },
      { label: 'Dimensões', value: '210 × 150 × 8 mm' },
      { label: 'Acabamento', value: 'Lixa 600 + primer + cor + verniz' },
    ],
    results: [
      { label: 'Custo unit.', value: 'R$ 285', hint: 'vs. R$ 45k de molde' },
      { label: 'Prazo lote 80un', value: '12 dias' },
      { label: 'Detalhamento', value: '50 µm', hint: 'Texto e ícones cristalinos' },
    ],
    gallery: [
      { src: '/images/port-09-painel-resina.webp', alt: 'Painel de controle pintado em resina ABS' },
    ],
    tags: ['SLA', 'Painel decorativo', 'Pintura automotiva', 'Pequeno lote'],
  },
  {
    slug: 'port-10-bucha-eixo',
    cat: 'Peças Funcionais',
    title: 'Bucha de Eixo com Rosca Interna',
    mat: 'Nylon + Fibra',
    accent: true,
    excerpt: 'Bucha estrutural com rosca M16 interna e canaleta lubrificante — substitui peça em bronze sinterizado.',
    industry: 'Manutenção Industrial',
    process: 'FDM',
    briefing: 'Bucha de bronze sinterizado em redutor industrial com vida útil esgotada. Substituição original custava R$ 1.800/un e prazo de 25 dias. Cliente precisava de 6 unidades para revisão programada.',
    delivery: 'Bucha replicada em PA + fibra de carbono com rosca M16 interna usinada in-situ (heat-set + macho). Canaleta lubrificante helicoidal impressa diretamente. Lote de 6 peças entregue em 7 dias.',
    specs: [
      { label: 'Material', value: 'PA CF15 (Nylon + 15% fibra carbono)' },
      { label: 'Processo', value: 'FDM + roscamento M16 + canaleta lubrificada' },
      { label: 'Dimensões', value: 'Ø 38 × 60 mm — rosca M16×1.5' },
      { label: 'Tolerância', value: '±0,08 mm no Ø externo' },
      { label: 'Quantidade', value: '6 unidades' },
    ],
    results: [
      { label: 'Custo lote 6un', value: 'R$ 2.400', hint: 'vs. R$ 10.800 original' },
      { label: 'Prazo', value: '7 dias', hint: 'vs. 25 dias' },
      { label: 'Vida útil esperada', value: '~70%', hint: 'Da peça em bronze original' },
    ],
    gallery: [
      { src: '/images/port-10-bucha-eixo.webp', alt: 'Bucha de eixo com rosca interna em PA CF15' },
    ],
    tags: ['Reposição', 'Heat-set', 'Substituição de bronze'],
  },
  {
    slug: 'port-11-prototipo-pitch',
    cat: 'Maquetes',
    title: 'Protótipo de Produto para Pitch',
    mat: 'PLA + Pintura',
    accent: false,
    excerpt: 'Protótipo dummy não-funcional em escala 1:1 para apresentação de produto a investidores.',
    industry: 'Hardware Startup',
    process: 'FDM',
    briefing: 'Startup de hardware precisava de protótipo visualmente perfeito para pitch a investidores em 4 dias. Não havia hardware funcional — apenas o design industrial validado em CAD.',
    delivery: 'Protótipo dummy em PLA branco com lixamento progressivo (320 → 2000 grit), preenchimento de massa epóxi nas linhas de camada e pintura automotiva. Acabamento visualmente equiparado a produção em massa. Pitch resultou em R$ 1,8M de captação.',
    specs: [
      { label: 'Material', value: 'PLA branco premium + acabamento' },
      { label: 'Processo', value: 'FDM + lixamento progressivo + pintura automotiva' },
      { label: 'Dimensões', value: '210 × 90 × 38 mm (escala 1:1)' },
      { label: 'Acabamento', value: 'Liso espelhado, sem linhas de camada' },
    ],
    results: [
      { label: 'Prazo entrega', value: '3 dias' },
      { label: 'Captação resultante', value: 'R$ 1,8M', hint: 'Reportado pelo cliente' },
    ],
    gallery: [
      { src: '/images/port-11-prototipo-pitch.webp', alt: 'Protótipo dummy de produto pintado em pitch' },
    ],
    tags: ['Pitch deck', 'Pintura automotiva', 'Acabamento espelhado'],
  },
  {
    slug: 'port-12-implante-medico',
    cat: 'Resina',
    title: 'Implante Educacional Médico',
    mat: 'Resina Cerâmica',
    accent: false,
    excerpt: 'Modelo anatômico em escala real de implante ortopédico para treinamento médico — não para uso clínico.',
    industry: 'Educação Médica',
    process: 'SLA',
    briefing: 'Faculdade de medicina precisava de modelo anatômico de implante de quadril em escala real para aulas práticas. Material precisava ter aparência e comportamento próximos do titânio cirúrgico, mas com custo viável para descarte após cada turma.',
    delivery: 'Modelo em resina cerâmica com pós-processo de queima leve para acabamento mate metálico. Geometria fiel ao implante real, com possibilidade de simular fixação em modelo ósseo sintético acoplado.',
    specs: [
      { label: 'Material', value: 'Resina cerâmica + queima leve' },
      { label: 'Processo', value: 'SLA + sinterização parcial' },
      { label: 'Dimensões', value: '160 × 35 × 35 mm (escala 1:1)' },
      { label: 'Camada', value: '50 µm' },
      { label: 'Uso', value: 'Educação — não clínico' },
    ],
    results: [
      { label: 'Lote', value: '24 unidades' },
      { label: 'Custo unit.', value: 'R$ 145', hint: 'vs. R$ 4k do implante real' },
      { label: 'Reuso aulas', value: '12 turmas/un', hint: 'Antes de descarte' },
    ],
    gallery: [
      { src: '/images/port-12-implante-medico.webp', alt: 'Modelo anatômico de implante em resina cerâmica' },
    ],
    tags: ['Educação', 'Modelo anatômico', 'Resina cerâmica'],
  },
]

export const portfolioCategories = ['Todos', 'Prototipagem', 'Peças Funcionais', 'Metal', 'Resina', 'Maquetes'] as const

/**
 * Encontra projeto por slug. Retorna null se não existir.
 */
export function getPortfolioProject(slug: string): PortfolioProject | null {
  return portfolioProjects.find((p) => p.slug === slug) ?? null
}

/**
 * Retorna prev/next baseado na ordem do array.
 */
export function getPortfolioSiblings(slug: string): {
  prev: PortfolioProject | null
  next: PortfolioProject | null
} {
  const idx = portfolioProjects.findIndex((p) => p.slug === slug)
  if (idx === -1) return { prev: null, next: null }
  return {
    prev: idx > 0 ? portfolioProjects[idx - 1] : portfolioProjects[portfolioProjects.length - 1],
    next: idx < portfolioProjects.length - 1 ? portfolioProjects[idx + 1] : portfolioProjects[0],
  }
}
