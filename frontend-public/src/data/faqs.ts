/**
 * Fonte canônica do FAQ — consumida por:
 *  - src/pages/faq.astro (UI + FAQPage JSON-LD)
 *  - scripts/generate-llm-sources.ts (public/faq.md para LLMs)
 */
export interface FaqItem {
  q: string
  a: string
}

export interface FaqGroup {
  cat: string
  items: FaqItem[]
}

export const faqs: FaqGroup[] = [
  {
    cat: 'Geral',
    items: [
      { q: 'É possível imprimir uma única peça?', a: 'Sim. A impressão 3D não depende de moldes, tornando viável desde peças únicas até pequenas séries. Não há mínimo de quantidade — atendemos desde um protótipo até centenas de unidades.' },
      { q: 'Quanto custa uma peça impressa?', a: 'O valor depende do material escolhido, geometria da peça e tempo de impressão. Entre em contato — analisamos seu projeto e retornamos com orçamento detalhado em até 24 horas, sem compromisso.' },
      { q: 'Vocês atendem todo o Brasil?', a: 'Sim. Atendemos clientes em todo o território nacional com envio via transportadora (prazo médio de 2 a 5 dias úteis pelos Correios/Sedex). Para clientes em São Carlos e região, oferecemos retirada presencial gratuita no Parque Tecnológico Damha II.' },
      { q: 'Vocês emitem nota fiscal?', a: 'Sim. Emitimos nota fiscal eletrônica (NF-e) para todos os pedidos, com discriminação de produto e serviço conforme a operação.' },
      { q: 'Como falar com a AUMAF 3D?', a: 'Atendimento por WhatsApp em (16) 99286-3412 (segunda a sexta, 08h–18h), e-mail comercial@aumaf3d.com.br ou pelo formulário em /contato. Para visita presencial: Alameda Sinlioku Tanaka, 202 — Parque Tecnológico Damha II, São Carlos – SP, 13565-261.' },
    ],
  },
  {
    cat: 'Materiais',
    items: [
      { q: 'O que posso imprimir com uma impressora 3D?', a: 'Desde peças decorativas simples até protótipos industriais complexos, componentes mecânicos, peças para robôs, equipamentos hospitalares e estruturas aeroespaciais. O portfólio de aplicações é vasto.' },
      { q: 'Vocês trabalham com impressão em metal?', a: 'Sim. Produzimos peças em Aço Inox 316L por SLM (Selective Laser Melting) — sinterização por laser direto sobre pó metálico, gerando peças com densidade próxima ao maciço, prontas para aplicação industrial, alimentícia e marítima.' },
      { q: 'Quais são os materiais disponíveis?', a: 'Trabalhamos com termoplásticos convencionais (PLA, ABS, ASA, PETG, Nylon, PC, PP, TPU), materiais de alta performance (PA CF15, Tritan HT), resinas (Standard, ABS-like), pó PA12 para SLS e Aço Inox 316L sinterizado por SLM.' },
    ],
  },
  {
    cat: 'Processos',
    items: [
      { q: 'Como funcionam os principais processos de impressão 3D?', a: 'FDM trabalha com termoplásticos depositados em camadas — versátil, com o maior portfólio de materiais. SLA usa resina fotopolimerizável curada por luz UV, com camadas de 25–100 microns e excelente resolução visual. SLS sinteriza pó de poliamida (PA12) por laser, entregando peças funcionais sem necessidade de suporte. SLM sinteriza pó metálico (Aço Inox 316L) por laser, para peças metálicas finais. Cada processo é indicado conforme geometria, material e finalidade da peça.' },
      { q: 'Como envio meu arquivo para orçamento?', a: 'Para arquivos 3D, aceitamos .STL, .X_T, .STEP e .3MF — esses são os formatos que entram em produção. Você também pode anexar PDF (desenho técnico) e imagens (.JPG, .PNG, .WEBP) como referência complementar. Use o formulário em nosso site (com upload direto) ou envie para comercial@aumaf3d.com.br. Se não tiver o arquivo, descreva o projeto e nossa equipe de modelagem pode criar para você.' },
      { q: 'Vocês fazem modelagem 3D também?', a: 'Sim. Nossa equipe de engenharia transforma desenhos técnicos, esboços, fotos ou especificações verbais em modelos 3D prontos para impressão, com otimização DfAM (Design for Additive Manufacturing).' },
      { q: 'O que é engenharia reversa? Como funciona?', a: 'É o processo de digitalizar uma peça física existente para gerar seu modelo 3D. Usamos scanner 3D portátil de alta precisão. Ideal para replicar peças descontinuadas, peças orgânicas complexas ou quando não existe arquivo digital disponível.' },
    ],
  },
  {
    cat: 'Entrega & Prazo',
    items: [
      { q: 'Qual o prazo de entrega?', a: 'Varia conforme material, processo e quantidade. Protótipos simples em FDM: 24–72 horas. Peças funcionais em FDM: 3–7 dias úteis. Peças em SLS e SLA variam conforme complexidade. Peças metálicas em SLM (316L): prazo estendido sob consulta.' },
      { q: 'Qual o prazo para receber um orçamento?', a: 'Respondemos todos os orçamentos em até 24 horas úteis após o recebimento do arquivo ou descrição do projeto. Para projetos urgentes, entre em contato via WhatsApp para atendimento prioritário.' },
      { q: 'Quais são os principais benefícios da impressão 3D para indústria?', a: 'Produção sem molde (sem investimento inicial alto), personalização total de geometria e material, viabilidade de peças únicas ou pequenas séries, geometrias internas complexas impossíveis por usinagem, e redução significativa de prazo de desenvolvimento.' },
      { q: 'Vocês fazem entrega expressa em 24 horas?', a: 'Sim, para peças simples em FDM com material em estoque (ABS, PETG, PLA, Nylon padrão) e geometria que permita slicing rápido. Para projetos urgentes, contate via WhatsApp em (16) 99286-3412 — avaliamos viabilidade do prazo na hora e priorizamos a fila de produção.' },
      { q: 'Para clientes em São Carlos e região, é possível retirada presencial?', a: 'Sim. Retirada gratuita no Parque Tecnológico Damha II (Alameda Sinlioku Tanaka, 202 — São Carlos – SP, 13565-261). Atendimento de segunda a sexta, 08h–18h, com agendamento prévio para garantir que a peça esteja pronta no momento da retirada.' },
      { q: 'Vocês embalam adequadamente para envio frágil?', a: 'Sim. Peças delicadas (resina SLA, paredes finas, geometrias frágeis) recebem embalagem reforçada com plástico bolha duplo + caixa rígida. Marcamos como "frágil" com a transportadora. Para itens de alto valor (>R$1.000), enviamos com seguro automático.' },
    ],
  },
  {
    cat: 'Acabamento & Pós-processo',
    items: [
      { q: 'É possível pintar e ter acabamento liso nas peças?', a: 'Sim. Oferecemos lixamento progressivo (320 a 2000 grit), preenchimento com massa epóxi, primer e pintura. Para ABS é possível alisamento por vapor de acetona. Em resina SLA, o acabamento já sai liso e aceita pintura sem preparação adicional.' },
      { q: 'Qual a diferença entre FDM, SLA e SLS no acabamento final?', a: 'FDM tem linhas de camada visíveis (~0.15–0.2mm) que podem ser pós-processadas. SLA entrega superfície lisa e brilhante já na impressão (camadas de 25–100 microns invisíveis a olho nu). SLS produz acabamento poroso fosco, característico — ideal para peças funcionais sem necessidade de pós-processo estético.' },
      { q: 'Vocês fazem usinagem CNC complementar quando preciso?', a: 'Para furos roscados de precisão, planificação de superfícies de vedação ou peças com exigências dimensionais que vão além do que a impressão 3D entrega, encaminhamos para parceiros de usinagem CNC após a impressão. Acabamento misto (impressão + usinagem) é comum em peças funcionais.' },
      { q: 'É possível galvanizar ou revestir metalicamente uma peça impressa?', a: 'Sim, via parceiros de galvanoplastia. Peças em ABS aceitam revestimento de cobre/níquel/cromo após preparação. Resinas SLA específicas também são compatíveis. Não fazemos in-house, mas indicamos os parceiros e gerenciamos a logística.' },
      { q: 'Como faço inserção de roscas metálicas em peças plásticas?', a: 'Três opções: (1) inserts de latão por aquecimento (heat-set, mais comum), (2) inserts moldados durante a impressão (pause-print), ou (3) usinagem de roscas direto na peça com macho. Recomendamos heat-set para resistência mecânica e custo otimizado.' },
    ],
  },
  {
    cat: 'Custos & Pagamento',
    items: [
      { q: 'Qual a faixa de preço típica de um protótipo simples?', a: 'Protótipos simples em PLA ou PETG (ex.: case eletrônico de 100×60×30mm) ficam entre R$80 e R$250 dependendo de tempo de impressão e infill. Peças funcionais em PA CF15 ou Policarbonato partem de R$250–600. Peças metálicas em 316L (SLM) e peças em SLS/SLA têm orçamento sob medida.' },
      { q: 'Vocês cobram pelo arquivo digital ou pela peça impressa?', a: 'Cobramos pela peça impressa entregue. Modelagem 3D e engenharia reversa são serviços adicionais cobrados separadamente apenas se solicitados. Orçamento de impressão a partir do seu .STL, .X_T, .STEP ou .3MF é sempre gratuito e sem compromisso.' },
      { q: 'Quais formas de pagamento aceitam?', a: 'PIX e boleto bancário. Emitimos NF-e em todos os casos.' },
      { q: 'Há descontos para volume ou pequenas séries?', a: 'Sim. A partir de 10 unidades idênticas, aplicamos desconto progressivo (5–25% conforme volume e prazo). Pequenas séries de 50–500 peças têm preço otimizado para concorrer com injeção em produção piloto. Solicite orçamento informando a quantidade alvo.' },
    ],
  },
  {
    cat: 'Comparativos técnicos',
    items: [
      { q: 'Quando usar FDM vs SLA vs SLS vs SLM?', a: 'FDM: peças funcionais robustas em termoplásticos técnicos (PA CF15, ABS, PETG, PC), volumes grandes, prazo curto. SLA: alta resolução visual, miniaturas, joalheria, modelos médicos, peças com superfície lisa. SLS: protótipos funcionais sem suporte, geometrias internas complexas, pequenas séries em PA12. SLM: peças metálicas finais em Aço Inox 316L. A decisão depende de geometria, material e finalidade.' },
      { q: 'Impressão 3D substitui injeção plástica?', a: 'Não para grandes volumes (>10.000 peças/ano com geometria simples), onde injeção é imbatível em custo unitário. Sim para protótipos, peças únicas, geometrias impossíveis em molde, séries piloto e validação de design antes de investir R$30k–R$200k em ferramental.' },
      { q: 'Peça impressa em 3D substitui peça usinada em alumínio?', a: 'Em muitos casos sim, especialmente quando o requisito é funcional (não cosmético) e o volume é baixo. PA CF15 e Policarbonato chegam a 70–80% da resistência específica do alumínio 6061 com massa muito menor. Para esforços extremos, mantemos usinagem ou indicamos peça em Aço Inox 316L sinterizado por SLM.' },
      { q: 'Qual a diferença entre PA12 (SLS) e PA CF15 (FDM)?', a: 'PA12 em pó (SLS) gera peças funcionais sem necessidade de suporte, com geometrias internas livres e bom acabamento natural fosco. PA CF15 (FDM com fibra de carbono) entrega rigidez extra e estabilidade dimensional para peças que substituem metal. Use PA12 quando geometria complexa e densidade homogênea importam; use PA CF15 quando rigidez e leveza dirigem o projeto.' },
    ],
  },
  {
    cat: 'Indústrias atendidas',
    items: [
      { q: 'Vocês atendem o setor automotivo?', a: 'Sim. Peças funcionais para protótipos de validação, suportes de cabine, jigs de montagem na linha, peças unitárias para veículos clássicos descontinuados, componentes de Fórmula SAE e KartCross. Materiais comuns: PA CF15 (substituindo alumínio), PETG (peças visíveis), Policarbonato (peças sob impacto).' },
      { q: 'Atendem indústria alimentícia?', a: 'Sim. Para contato direto com alimento usamos PETG grade FDA ou Tritan HT (BPA-free, suporta lavagem em água quente até 95°C). Peças funcionais ao redor do processo (suportes, guias, gabaritos) são impressas em PA ou PP — resistente a limpeza com soda cáustica e detergentes industriais.' },
      { q: 'Imprimem peças para uso médico-hospitalar?', a: 'Imprimimos jigs cirúrgicos, modelos anatômicos para planejamento, próteses externas e equipamentos de treinamento médico. NÃO produzimos implantes (exigem certificação ANVISA específica e materiais bio-classe que ainda não fabricamos in-house). Para implantes, indicamos parceiros certificados.' },
      { q: 'Vocês atendem o setor aeroespacial / drones?', a: 'Sim, para componentes não-críticos de drones, UAVs e aeromodelos: cases de avionics, suportes de câmera, paletas, hubs estruturais e jigs. Material padrão: PA CF15 pela combinação rigidez/leveza. Para componentes críticos de voo certificado, é necessário ensaio mecânico documentado caso a caso.' },
      { q: 'Atendem a indústria de petróleo & gás?', a: 'Sim, em peças não-pressurizadas: gabaritos de inspeção, suportes de instrumentação, modelos de treinamento, cases de equipamentos de campo. Materiais comuns: PA CF15 e Policarbonato. Para ambientes corrosivos ou alta temperatura, indicamos peças em Aço Inox 316L sinterizado por SLM.' },
    ],
  },
  {
    cat: 'Capacidade & limitações',
    items: [
      { q: 'Qual o tamanho máximo de peça que vocês imprimem?', a: 'FDM: 600×600×600 mm em peça única. SLA: 600×600×400 mm. SLS: 400×400×420 mm. SLM (metal): 470×270×300 mm. Peças maiores podem ser fracionadas e coladas/parafusadas — fazemos o particionamento DfAM como parte do projeto.' },
      { q: 'Qual o menor detalhe (resolução) que conseguem imprimir?', a: 'FDM industrial: parede mínima 0.4mm, detalhe XY ~0.2mm. SLA: detalhe XY ~50 microns, camada Z 25 microns — visíveis apenas com lupa. SLS: paredes mínimas de 0.7mm, detalhe XY ~0.3mm. SLM: paredes mínimas de 0.5mm em geometrias controladas. Para detalhes extremos (joalheria, miniaturas), SLA é a tecnologia indicada.' },
      { q: 'Têm limite de complexidade geométrica?', a: 'Tecnicamente, manufatura aditiva permite quase qualquer geometria — incluindo canais internos, lattice estruturais, formas orgânicas otimizadas topologicamente. Limites práticos: overhangs >55° em FDM precisam de suporte; geometrias com bolhas de resina presas em SLA exigem furos de drenagem; SLS tem mais liberdade que ambos.' },
      { q: 'Imprimem partes móveis (engrenagens, dobradiças) montadas?', a: 'Sim, e essa é uma das vantagens da manufatura aditiva. Conjuntos com folgas de 0.3–0.5mm imprimem montados e funcionam após remoção de suporte. Engrenagens cônicas, juntas universais, mecanismos completos podem sair "prontos" da máquina sem montagem manual.' },
    ],
  },
  {
    cat: 'Confidencialidade & propriedade',
    items: [
      { q: 'Posso enviar arquivos confidenciais? Vocês assinam NDA?', a: 'Sim. Assinamos NDA (Non-Disclosure Agreement) com cláusulas de sigilo, não-cópia e devolução/destruição de arquivos após entrega. Compartilhe seu modelo de NDA ou usamos o nosso padrão. Arquivos ficam em servidor isolado, com acesso restrito apenas à equipe de produção alocada.' },
      { q: 'A AUMAF 3D mantém os direitos sobre minha peça?', a: 'Não. A propriedade intelectual (modelo CAD, design, patente) é 100% sua. Imprimimos sob contrato de prestação de serviço — não usamos seus arquivos para portfólio sem autorização explícita por escrito.' },
      { q: 'Posso pedir para destruírem o arquivo após a entrega?', a: 'Sim. Política padrão: arquivos são mantidos 90 dias para suporte e reimpressão. Após esse prazo são apagados automaticamente. Se quiser destruição imediata após a entrega, basta solicitar — emitimos termo de destruição de dados quando necessário.' },
    ],
  },
  {
    cat: 'Qualidade & garantia',
    items: [
      { q: 'O que acontece se a peça vier com defeito?', a: 'Se houver defeito de impressão (delaminação, falha geométrica, peça fora das especificações contratadas), refazemos sem custo adicional e sem questionamento. Garantia padrão: 30 dias após entrega, contra defeitos de manufatura. Peças com falha por uso indevido ou material errado especificado pelo cliente não são cobertas.' },
      { q: 'Como vocês validam dimensionalmente as peças?', a: 'Peças críticas passam por inspeção com paquímetro digital, micrômetro e gabarito. Cada peça crítica recebe um resumo do controle dimensional junto com a entrega.' },
      { q: 'Fazem ensaios mecânicos das peças impressas?', a: 'Para projetos que exigem (validação de protótipo crítico, lote piloto), encaminhamos amostras para laboratórios parceiros com ensaios padronizados (ASTM D638 tração, ASTM D790 flexão, ASTM D256 impacto Izod). Não fazemos ensaios destrutivos in-house.' },
    ],
  },
  {
    cat: 'Engenharia reversa',
    items: [
      { q: 'Não tenho o arquivo CAD da peça. Vocês conseguem reproduzir?', a: 'Sim — esse é exatamente o serviço de engenharia reversa. Você nos envia a peça física (ou fotos com referência dimensional), digitalizamos em scanner 3D de alta precisão, geramos a nuvem de pontos, reconstruímos o modelo paramétrico em CAD e imprimimos. Processo completo: 5–10 dias úteis dependendo da complexidade.' },
      { q: 'Qual a precisão do scanner 3D que vocês usam?', a: 'Scanner óptico estruturado com alta precisão para peças até ~500mm. Para peças muito pequenas (<30mm) ou com superfícies brilhantes/transparentes, usamos pó matificante temporário e calibração específica. Resultado entregue em STL (malha) ou STEP/X_T (paramétrico) conforme demanda.' },
      { q: 'Engenharia reversa funciona para qualquer peça?', a: 'Para a maioria. Limitações: superfícies muito espelhadas (precisam de pó) e peças com cavidades internas inacessíveis (CT scan necessário). Para peças com exigências dimensionais muito apertadas, complementamos com medição manual e CAD a partir de desenho técnico.' },
    ],
  },
  {
    cat: 'Sustentabilidade',
    items: [
      { q: 'A impressão 3D é sustentável? Como vocês descartam resíduos?', a: 'Manufatura aditiva é fundamentalmente menos desperdiçadora que usinagem subtrativa (depõe material onde precisa, não remove de bloco maciço). Suportes e refugos de FDM são triturados e reciclados parcialmente. Pó residual de SLS é peneirado e reutilizado em até 30% nas próximas impressões. Resíduos de resina seguem destino correto (resíduo perigoso classe II) com empresa licenciada.' },
      { q: 'Vocês usam materiais biodegradáveis?', a: 'Sim, quando a aplicação permite. PLA (biodegradável em condições industriais de compostagem) é nosso material biodegradável padrão. Para aplicações que exigem durabilidade estrutural, materiais convencionais (PETG, ABS, PA) entregam vida útil muito superior — descarte ambientalmente responsável compensa a baixa biodegradabilidade.' },
    ],
  },
]
