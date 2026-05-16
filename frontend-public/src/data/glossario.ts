/**
 * Fonte canônica do glossário técnico — consumida por:
 *  - src/pages/glossario.astro (UI + DefinedTermSet JSON-LD)
 *  - scripts/generate-llm-sources.ts (public/glossario.md para LLMs)
 */
export interface Term {
  term: string
  definition: string
  slug: string
  related?: string[]
}

export const terms: Term[] = [
  // Processos
  { slug: 'fdm', term: 'FDM (Fused Deposition Modeling)', definition: 'Processo de impressão 3D por extrusão de polímero termoplástico em camadas. Também chamado FFF. É o processo mais comum para peças funcionais em PLA, ABS, PETG, ASA, Nylon e materiais reforçados.' },
  { slug: 'sla', term: 'SLA (Stereolithography)', definition: 'Fotopolimerização por laser UV de resina líquida em camadas finas (25–100 μm). Acabamento liso e alta resolução; ideal para joalheria, moldes de inspeção e modelos médicos.' },
  { slug: 'sls', term: 'SLS (Selective Laser Sintering)', definition: 'Sinterização de pó polimérico (tipicamente Nylon PA12) por laser CO₂. Não requer suporte; peças isotrópicas e robustas para uso final.' },
  { slug: 'slm', term: 'SLM (Selective Laser Melting)', definition: 'Fusão completa de pó metálico por laser de alta potência. Usado para Aço Inox 316L, Titânio, Inconel. Peças com densidade > 99%, indicadas para aeroespacial, médico e ferramental.' },
  { slug: 'dlp', term: 'DLP (Digital Light Processing)', definition: 'Variante da SLA que cura uma camada inteira de cada vez via projetor UV. Mais rápido que SLA tradicional para peças pequenas.' },
  { slug: 'fff', term: 'FFF (Fused Filament Fabrication)', definition: 'Termo aberto equivalente a FDM (FDM é marca registrada da Stratasys). Tecnicamente intercambiáveis.' },
  // Materiais
  { slug: 'pla', term: 'PLA (Ácido Polilático)', definition: 'Termoplástico biodegradável (compostagem industrial) derivado de fontes renováveis. Fácil de imprimir, baixa retração, baixa resistência térmica (~55 °C). Ideal para protótipos visuais e maquetes.' },
  { slug: 'abs', term: 'ABS', definition: 'Termoplástico amorfo resistente a impacto e temperatura (~95 °C). Necessita câmara fechada para minimizar warping. Bom para peças funcionais sob carga.' },
  { slug: 'petg', term: 'PETG', definition: 'Co-poliéster com boa resistência química e a impacto. Mais fácil que ABS, mais durável que PLA. Adesão entre camadas excelente.' },
  { slug: 'asa', term: 'ASA', definition: 'Acrilonitrila Estireno Acrilato — semelhante ao ABS porém com resistência superior a UV/intempéries. Indicado para peças expostas ao sol e à chuva.' },
  { slug: 'pa12', term: 'Nylon (PA12)', definition: 'Poliamida 12 — termoplástico semicristalino com excelente resistência mecânica, química e à fadiga. Padrão da indústria para SLS.' },
  { slug: 'pa-cf15', term: 'PA CF15', definition: 'Nylon reforçado com 15% de fibra de carbono picada. Combina alta rigidez específica, leveza e estabilidade dimensional. Usado em ferramental, fixadores e peças sob carga.' },
  { slug: 'tpu', term: 'TPU (Poliuretano Termoplástico)', definition: 'Elastômero flexível imprimível por FDM. Dureza Shore 70A–95A. Aplicações em gaxetas, amortecedores e empunhaduras.' },
  { slug: 'aco-316l', term: 'Aço Inox 316L', definition: 'Aço austenítico de baixo carbono com excelente resistência à corrosão. Padrão para peças metálicas impressas via SLM em aplicações médicas, alimentares e marítimas.' },
  { slug: 'resina-fotossensivel', term: 'Resina fotossensível', definition: 'Polímero líquido que solidifica sob luz UV (405 nm tipicamente). Famílias principais: padrão, tough, flexible, castable, dental, biocompatível.' },
  // Conceitos de processo
  { slug: 'camada', term: 'Camada (layer)', definition: 'Seção horizontal individual depositada/curada/sinterizada pela impressora. Espessuras típicas: FDM 100–300 μm, SLA 25–100 μm, SLS 100–120 μm, SLM 30–60 μm.' },
  { slug: 'altura-de-camada', term: 'Altura de camada', definition: 'Espessura de cada camada — afeta diretamente acabamento (camadas finas = superfície mais lisa) e tempo de impressão (camadas finas = mais demorado).' },
  { slug: 'infill', term: 'Infill (preenchimento)', definition: 'Estrutura interna de uma peça FDM — controla peso, rigidez e tempo. Padrões: grid, gyroid, cubic. Densidades típicas: 15–30% protótipos, 40–80% peças funcionais.' },
  { slug: 'perimetro', term: 'Perímetro (wall)', definition: 'Linhas externas de uma camada FDM. Mais perímetros = mais rigidez e estanqueidade.' },
  { slug: 'suporte', term: 'Suporte (support)', definition: 'Estrutura sacrificial impressa para apoiar regiões em balanço (overhangs) > 45° em FDM/SLA. SLS e SLM não precisam de suporte do mesmo tipo (o pó/leito suporta).' },
  { slug: 'overhang', term: 'Overhang', definition: 'Região da peça projetada em ângulo sem material abaixo. Ângulos > 45° tipicamente exigem suporte em FDM/SLA.' },
  { slug: 'orientacao', term: 'Orientação de impressão', definition: 'Como a peça é posicionada na plataforma. Afeta resistência (camadas são plano fraco), acabamento (face XY > face Z) e custo de suporte.' },
  { slug: 'xy-z', term: 'XY vs Z', definition: 'XY = plano da plataforma; Z = altura. Resolução XY tipicamente 0,1–0,4 mm (FDM) e 50 μm (SLA). Resolução Z = altura de camada.' },
  { slug: 'warping', term: 'Warping', definition: 'Empenamento da peça por contração diferencial. Comum em ABS e Nylon sem câmara aquecida. Minimizado com bed adesivo, brim e raft.' },
  // Engenharia e design
  { slug: 'dfam', term: 'DfAM (Design for Additive Manufacturing)', definition: 'Conjunto de princípios de projeto que aproveita a liberdade geométrica da impressão 3D — consolidação de peças, lattices, canais internos, otimização topológica.' },
  { slug: 'lattice', term: 'Lattice (treliça)', definition: 'Estrutura interna periódica (giroides, octet, BCC) que reduz massa preservando rigidez. Exclusivo da manufatura aditiva; impossível em fundição/usinagem.' },
  { slug: 'otimizacao-topologica', term: 'Otimização topológica', definition: 'Algoritmo que remove material de regiões pouco solicitadas, gerando geometrias orgânicas otimizadas para resistência/peso.' },
  { slug: 'engenharia-reversa', term: 'Engenharia reversa', definition: 'Processo de digitalizar uma peça física (scanner 3D ou CMM) e reconstruir o modelo CAD — útil para reposição de peças sem desenho original.' },
  // Arquivos
  { slug: 'stl', term: 'STL', definition: 'Formato de malha triangular — padrão histórico da impressão 3D. Não carrega unidades, cor, ou metadados. Pode perder precisão em superfícies curvas.' },
  { slug: 'step', term: 'STEP (.step/.stp)', definition: 'Formato neutro de CAD paramétrico — preserva geometria exata e estrutura de montagem. Preferível a STL para peças funcionais críticas.' },
  { slug: '3mf', term: '3MF', definition: 'Formato moderno (Microsoft + 3MF Consortium) que carrega malha, cor, material, unidades e metadados em um único arquivo. Substituto natural do STL.' },
  { slug: 'x-t', term: 'X_T (Parasolid)', definition: 'Formato nativo do kernel Parasolid (SolidWorks, NX). Preserva geometria paramétrica exata. Aceito para orçamentos críticos.' },
]
