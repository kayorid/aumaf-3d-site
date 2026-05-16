/**
 * Catálogo de guias HowTo. Cada guia vira:
 *  - uma página /guias/<slug>.astro com schema HowTo
 *  - um item no index /guias.astro
 *  - referência em llms.txt
 */
export interface GuiaStep {
  title: string
  text: string
}

export interface Guia {
  slug: string
  hero: string // chamada curta (h1)
  question: string // pergunta natural canônica
  description: string // meta + summary
  totalTime?: string // ISO-8601 ex 'PT5M'
  intro: string
  steps: GuiaStep[]
  tools?: string[]
  ctaText?: string
  related: { name: string; url: string }[]
}

export const guias: Guia[] = [
  {
    slug: 'como-solicitar-orcamento',
    hero: 'Como solicitar um orçamento de impressão 3D',
    question: 'Como solicito um orçamento de impressão 3D na AUMAF 3D?',
    description: 'Passo a passo para receber um orçamento de impressão 3D em até 24 horas: especificar projeto, enviar arquivo, análise técnica, aprovação e produção.',
    totalTime: 'PT24H',
    intro: 'Receba um orçamento detalhado em até 24 horas úteis, sem compromisso. Você pode enviar arquivo 3D pronto (.STL/.STEP/.X_T/.3MF) ou apenas descrever o projeto — nossa equipe de modelagem pode criar o CAD para você.',
    steps: [
      { title: 'Especifique o projeto', text: 'Descreva a peça em texto: para que serve, quantidade desejada, ambiente de uso (temperatura, umidade, esforço mecânico). Quanto mais contexto, mais preciso o material e processo recomendados.' },
      { title: 'Envie o arquivo (se tiver)', text: 'Aceitamos .STL, .X_T, .STEP e .3MF — esses entram em produção. PDFs de desenho técnico e imagens (.JPG, .PNG, .WEBP) servem como referência complementar. Upload direto pelo formulário ou anexo para comercial@aumaf3d.com.br.' },
      { title: 'Análise técnica', text: 'Avaliamos viabilidade de impressão (DfAM), recomendamos material e processo (FDM, SLA, SLS ou SLM) e estimamos tempo de impressão e pós-processo.' },
      { title: 'Receba o orçamento em até 24h', text: 'Resposta com valor, prazo e detalhes técnicos. Projetos urgentes via WhatsApp (16) 99286-3412 têm atendimento prioritário.' },
      { title: 'Aprove e acompanhe a produção', text: 'Pagamento por PIX ou boleto, NF-e emitida. Produção monitorada com controle dimensional antes do envio. Envio nacional ou retirada presencial em São Carlos.' },
    ],
    tools: ['Arquivo 3D (.STL/.STEP/.X_T/.3MF)', 'Descrição técnica do projeto', 'WhatsApp ou e-mail comercial'],
    ctaText: 'Solicitar orçamento agora',
    related: [
      { name: 'Como enviar seu arquivo 3D', url: '/guias/como-enviar-arquivo-3d' },
      { name: 'Como escolher o material', url: '/guias/escolher-material-impressao-3d' },
      { name: 'Catálogo de materiais', url: '/materiais' },
    ],
  },
  {
    slug: 'como-enviar-arquivo-3d',
    hero: 'Como enviar seu arquivo 3D para impressão',
    question: 'Quais formatos de arquivo 3D vocês aceitam e como exportar?',
    description: 'Guia para preparar e enviar arquivos 3D para impressão: STL, STEP, X_T e 3MF — quando usar cada um, como exportar do CAD e como validar antes do envio.',
    totalTime: 'PT15M',
    intro: 'Aceitamos quatro formatos de arquivo 3D para produção. Cada um tem um caso de uso ideal — escolher certo evita retrabalho e perda de precisão.',
    steps: [
      { title: 'Escolha o formato adequado', text: 'STL: padrão histórico, malha triangular, ideal para peças simples e protótipos visuais. STEP: CAD paramétrico preservando geometria exata — preferível para peças funcionais críticas. X_T (Parasolid): nativo de SolidWorks/NX, máxima precisão paramétrica. 3MF: formato moderno carrega malha + cor + material + unidades em arquivo único; substituto natural do STL.' },
      { title: 'Exporte do seu CAD', text: 'No SolidWorks/Fusion 360/Onshape, use "Salvar como…" e selecione o formato. Para STL, defina tolerância fina (≤ 0,01 mm) e ângulo de desvio ≤ 5° — evita facetamento em superfícies curvas. Para STEP/X_T, exporte na unidade milímetro.' },
      { title: 'Valide a malha (se for STL)', text: 'Abra em um visualizador (Microsoft 3D Viewer, MeshLab, Bambu Studio). Verifique se não há buracos, superfícies invertidas ou regiões degeneradas. Em geometrias complexas, prefira STEP/X_T — preserva paramétrico e evita problemas de malha.' },
      { title: 'Faça upload pelo formulário', text: 'Em /contato, anexe o arquivo (até 15 MB). Para arquivos maiores, envie por e-mail comercial@aumaf3d.com.br com link do Drive/WeTransfer. Confidencialidade garantida — assinamos NDA mediante solicitação.' },
    ],
    tools: ['Software CAD (SolidWorks, Fusion 360, Onshape, FreeCAD)', 'Visualizador de malha (opcional)', 'Conexão para upload até 15 MB'],
    ctaText: 'Enviar meu arquivo',
    related: [
      { name: 'Como solicitar orçamento', url: '/guias/como-solicitar-orcamento' },
      { name: 'Glossário: STL vs STEP vs 3MF', url: '/glossario#stl' },
      { name: 'Como escolher o material', url: '/guias/escolher-material-impressao-3d' },
    ],
  },
  {
    slug: 'escolher-material-impressao-3d',
    hero: 'Como escolher o material para impressão 3D',
    question: 'Qual material de impressão 3D devo usar para minha peça?',
    description: 'Fluxograma para escolher o material de impressão 3D ideal: protótipo visual, peça funcional, alta temperatura, metal, flexível ou alimentício. PLA, PETG, PA CF15, ASA, Tritan, PA12, 316L explicados.',
    totalTime: 'PT5M',
    intro: 'A escolha do material define resistência, custo, prazo e acabamento. Use este fluxograma curto para chegar à recomendação certa em 5 perguntas — depois consulte o catálogo completo em /materiais.',
    steps: [
      { title: 'A peça é só estética ou funcional?', text: 'Visual/maquete/feira: PLA (mais barato, fácil) ou Resina SLA (mais detalhe). Funcional sob esforço: pular para o próximo passo.' },
      { title: 'Vai estar exposta ao sol/chuva ou em ambiente externo?', text: 'Sim: ASA (resistência UV superior) ou Policarbonato (impacto + temperatura). Não: continuar para o próximo passo.' },
      { title: 'Precisa suportar alta temperatura (>100°C)?', text: 'Sim e em metal: Aço Inox 316L (SLM) suporta 800°C+. Sim em polímero: PA CF15 (180°C), Nylon (120°C), PC (130°C). Não: continuar.' },
      { title: 'Precisa ser flexível, alimentício ou translúcido?', text: 'Flexível/borracha: TPU Shore 95A (firme) ou Flex Shore 85A (macio). Alimentício (FDA/BPA-free): PETG ou Tritan HT (suporta lavagem 95°C). Translúcido: PETG, Tritan HT ou PC.' },
      { title: 'Geometria interna complexa, sem suporte?', text: 'SLS com PA12 — peças funcionais com canais internos, lattice e geometrias impossíveis em FDM/SLA, sem necessidade de suporte. Use para pequenas séries piloto ou peças finais leves.' },
      { title: 'Conferir e contratar', text: 'Confirme a escolha no catálogo /materiais (especificações técnicas + faixa de temperatura + processos compatíveis) e solicite orçamento em /contato passando o material desejado.' },
    ],
    tools: ['Requisitos do projeto (uso, esforço, ambiente)', 'Catálogo /materiais para conferir specs', 'WhatsApp para tirar dúvida técnica'],
    ctaText: 'Ver catálogo completo de materiais',
    related: [
      { name: 'Catálogo de materiais', url: '/materiais' },
      { name: 'Glossário: PA12, PA CF15, 316L', url: '/glossario#pa12' },
      { name: 'Como solicitar orçamento', url: '/guias/como-solicitar-orcamento' },
    ],
  },
  {
    slug: 'como-acompanhar-meu-pedido',
    hero: 'Como acompanhar meu pedido na AUMAF 3D',
    question: 'Como acompanho a produção e entrega do meu pedido?',
    description: 'Acompanhe seu pedido de impressão 3D na AUMAF 3D — e-mail de confirmação, atualização por WhatsApp do comercial, rastreio de envio e retirada presencial em São Carlos.',
    totalTime: 'PT5M',
    intro: 'Mantemos cliente informado em cada etapa — da aprovação ao recebimento da peça. Três canais oficiais de acompanhamento, sem perder informação no caminho.',
    steps: [
      { title: 'E-mail de confirmação após aprovação', text: 'Ao confirmar o orçamento, você recebe e-mail com número do pedido, prazo estimado e dados de NF-e. Guarde este e-mail — é a sua referência ao longo do processo.' },
      { title: 'Atualização proativa por WhatsApp', text: 'Nieldson (comercial) avisa quando a impressão inicia, quando entra em pós-processo (lixamento, cura, jateamento), e quando a peça está pronta para inspeção dimensional. Você pode pedir foto a qualquer momento.' },
      { title: 'Rastreamento ou retirada', text: 'Envio nacional: enviamos o código de rastreio dos Correios/Sedex por WhatsApp e e-mail. Retirada presencial em São Carlos: agendamos horário de seg–sex, 08h–18h, no Parque Tecnológico Damha II (Alameda Sinlioku Tanaka, 202).' },
    ],
    tools: ['Acesso ao e-mail informado no pedido', 'WhatsApp em (16) 99286-3412'],
    ctaText: 'Falar com nosso comercial',
    related: [
      { name: 'Como solicitar orçamento', url: '/guias/como-solicitar-orcamento' },
      { name: 'Contato e atendimento', url: '/contato' },
      { name: 'FAQ — entrega e prazos', url: '/faq' },
    ],
  },
]
