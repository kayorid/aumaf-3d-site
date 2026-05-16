/**
 * Fonte canônica de serviços e fluxo de orçamento — consumida por:
 *  - src/pages/servicos.astro (UI + Service/HowTo JSON-LD)
 *  - scripts/generate-llm-sources.ts (public/servicos.md)
 */
export interface ServiceSpec {
  id: string
  num: string
  title: string
  body: string
  specs: string[]
  details: { label: string; value: string }[]
  reverse: boolean
}

export interface ProcessStep {
  n: string
  title: string
  body: string
}

export const services: ServiceSpec[] = [
  {
    id: 'prototipagem',
    num: '01',
    title: 'Prototipagem Rápida',
    body: 'Reduza o ciclo de desenvolvimento com protótipos funcionais entregues em dias. Ideal para validação de forma, encaixe e montagem antes da produção em série. Tecnologias FDM, SLA e SLS disponíveis conforme o nível de detalhe e material necessário.',
    specs: ['FDM / SLA / SLS', 'Entrega 24–72h', 'Geometria Complexa', 'Sem Molde'],
    details: [
      { label: 'Prazo típico', value: '24–72h' },
      { label: 'Materiais', value: 'PLA, ABS, PETG, Resina' },
      { label: 'Processos', value: 'FDM / SLA' },
      { label: 'Aplicação', value: 'Validação de conceito' },
    ],
    reverse: false,
  },
  {
    id: 'funcionais',
    num: '02',
    title: 'Peças Funcionais & Metal',
    body: 'Peças de reposição para máquinas, componentes para robôs e equipamentos industriais. Fabricadas sob demanda em plásticos de alta performance ou Aço Inox 316L sinterizado por SLM. Sem molde, sem mínimo de quantidade.',
    specs: ['Aço Inox 316L (SLM)', 'PA CF15', 'Alta Temperatura', '+260°C'],
    details: [
      { label: 'Prazo típico', value: '3–7 dias úteis' },
      { label: 'Metal prazo', value: 'Sob consulta (SLM)' },
      { label: 'Processo', value: 'FDM / SLS / SLM' },
      { label: 'Aplicação', value: 'Uso final industrial' },
    ],
    reverse: true,
  },
  {
    id: 'modelagem',
    num: '03',
    title: 'Modelagem 3D & Otimização DfAM',
    body: 'Nossa equipe converte desenhos técnicos, esboços ou especificações verbais em modelos 3D prontos para impressão, com otimização para manufatura aditiva (DfAM). Entregamos arquivos .STL, .X_T, .STEP e .3MF validados e prontos para produção.',
    specs: ['CAD Profissional', 'DfAM', 'Análise de Topologia', 'STL / X_T / STEP / 3MF'],
    details: [
      { label: 'Entregável', value: '.STL / .X_T / .STEP / .3MF' },
      { label: 'Prazo', value: 'Sob consulta' },
      { label: 'Inclui', value: 'Análise de impressibilidade' },
      { label: 'Aplicação', value: 'Projeto do zero ou conversão' },
    ],
    reverse: false,
  },
  {
    id: 'reposicao',
    num: '04',
    title: 'Engenharia Reversa (Scanner 3D)',
    body: 'Capturamos peças físicas existentes com scanner 3D de alta resolução e geramos o modelo digital para replicação exata ou modificação de design. Ideal para peças descontinuadas pelo fabricante original ou componentes orgânicos complexos.',
    specs: ['Scanner 3D', 'Engenharia Reversa', 'Nuvem de Pontos', 'Réplica Exata'],
    details: [
      { label: 'Tecnologia', value: 'Scanner portátil HD' },
      { label: 'Precisão', value: 'Scanner óptico estruturado' },
      { label: 'Entregável', value: 'Modelo 3D + arquivo pronto' },
      { label: 'Aplicação', value: 'Peças descontinuadas / orgânicas' },
    ],
    reverse: true,
  },
]

export const processSteps: ProcessStep[] = [
  { n: '01', title: 'Envio do Arquivo', body: 'Envie .STL, .X_T, .STEP, .3MF ou descreva o projeto.' },
  { n: '02', title: 'Análise Técnica', body: 'Revisamos viabilidade, material e processo.' },
  { n: '03', title: 'Orçamento', body: 'Retornamos em até 24h com valor e prazo.' },
  { n: '04', title: 'Produção', body: 'Impressão com monitoramento em tempo real.' },
  { n: '05', title: 'Controle de Qualidade', body: 'Verificação dimensional antes do envio.' },
  { n: '06', title: 'Entrega & Suporte', body: 'Envio nacional + suporte técnico pós-entrega.' },
]
