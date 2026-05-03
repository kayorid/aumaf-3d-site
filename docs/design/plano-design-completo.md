# Plano de Design Completo — AUMAF 3D
> Versão 1.1 | 2026-05-02 (atualizado pós-Q1)
> Referência estrutural: coffee-tech.com | Paleta: Cinematic Additive Manufacturing | Conteúdo: site-atual-conteudo.md (melhorado)

## Status de Implementação (Q1 — commit bb9269e)

| Página | Status | Observações |
|---|---|---|
| `/` — Homepage | ✅ Implementada | Hero HUD, zigzag [01–04], carrossel depoimentos, CTA final |
| `/servicos` | ✅ Implementada | Zigzag 4 serviços, fluxo 6 etapas |
| `/sobre` | ✅ Implementada | MVV [01–03], case Fórmula SAE, localização |
| `/contato` | ✅ Implementada | Split layout, formulário underline, drop zone |
| `/faq` | ✅ Implementada | Accordion CSS, filtro por categoria |
| `/materiais` | ✅ Implementada | 16 materiais, filtro pills, destaque 316L |
| `/portfolio` | ✅ Implementada | Masonry 12 projetos, filtro, hover overlay |
| `/blog` | ✅ Implementada | Featured post + grid |
| `/blog/[slug]` | ✅ Implementada | Template post com specs card e citação |
| Design tokens | ✅ `tailwind.config.ts` | Paleta, tipografia, animações, grid |
| CSS utilities | ✅ `global.css` | Glass, glow, pills, accordion, scanline |
| Navbar | ✅ Implementada | Glassmorphism, scroll hide/show, mobile |
| Footer | ✅ Implementado | 3 colunas, social, WhatsApp |

### Próxima fase: Refinamento Visual
- Responsividade mobile detalhada (375–430px)
- Animações de stagger por elemento
- Microinterações em cards
- HUD widget mais elaborado
- Paralax sutil no hero

---

---

## 1. Princípios de Design

### 1.1 Conceito Central
**"O Laboratório do Futuro"** — A AUMAF 3D não é uma gráfica de impressão. É um parceiro de engenharia de precisão. O site deve transmitir isso visualmente: painel de controle de uma fábrica digital, dados em tempo real, materiais de alta performance, tolerância de 0.05mm. Cada elemento da UI reforça que aqui se faz engenharia, não decoração.

### 1.2 Adaptação do Modelo coffee-tech
O coffee-tech.com usa alternância **dark `#0D0E13` ↔ cream `#F3EDE3`** para criar ritmo.  
A AUMAF 3D adaptará isso como **void `#000000` ↔ surface `#1c1b1b`** — sempre dentro do universo dark, mas com profundidade variando entre camadas. O Precision Green `#61c54f` substitui o laranja terracota como único acento quente.

| coffee-tech | AUMAF 3D (adaptação) |
|---|---|
| Fundo dark `#0D0E13` | Void `#000000` / `#131313` |
| Cream `#F3EDE3` | Surface `#1c1b1b` / `#201f1f` |
| Acento laranja `#C8603D` | Precision Green `#61c54f` |
| Tipografia: Inter | Tipografia: Space Grotesk |
| Foto produto real | Macro shot peça impressa + render |

### 1.3 Arquitetura de Profundidade (4 camadas)
```
Level 0 — THE VOID        #000000   Backgrounds globais, hero sections
Level 1 — DEEP SURFACE    #0e0e0e   Fundos de seção alternados
Level 2 — SURFACE         #1c1b1b   Fundo de seções "claras", cards base
Level 3 — GLASS           rgba(42,42,42,0.4) + blur(40px)   Containers flutuantes
Level 4 — DATA            #7ce268 / #e5e2e1   Texto e elementos de acento
```

### 1.4 Regras Invioláveis
- Nunca usar gradientes coloridos — apenas fade para transparente
- Verde `#61c54f` apenas em CTAs, status indicators, bordas de destaque — nunca em superfícies grandes
- Todos os títulos de seção em UPPERCASE com Space Grotesk
- Numeração `[01]` `[02]` como único marcador visual de sequência (padrão coffee-tech)
- Imagens sempre com `mix-blend-mode: luminosity` ou `opacity: 0.6–0.8` sobre fundo escuro
- Botões: sharp corners `border-radius: 0` para estruturais, `border-radius: 2px` para pills

---

## 2. Estrutura de Navegação

### 2.1 Páginas do Site
```
/ ...................... Home
/servicos .............. Serviços
/portfolio ............. Portfolio (Galeria)
/materiais ............. Materiais
/sobre ................. Sobre
/blog .................. Blog (listagem)
/blog/[slug] ........... Post individual
/contato ............... Contato
/faq ................... FAQ
```

### 2.2 Navbar (global, fixed)
**Estrutura:** Logo esquerda | Links centro | CTAs direita

```
[ AUMAF 3D ]    Serviços  Portfolio  Materiais  Sobre  Blog    [ Solicitar Orçamento ↗ ]
```

**Especificações:**
- `position: fixed; top: 0; z-index: 50`
- Fundo: `bg-black/40 backdrop-blur-3xl border-b border-white/10`
- Logo: `Space Grotesk, weight 700, uppercase, tracking-tighter, text-white, 20px`
- Links: `Space Grotesk, 11px, weight 700, uppercase, tracking-widest, text-white/60`
- Link ativo: `text-primary-container border-b border-primary-container`
- Hover: `text-white transition-colors 300ms`
- CTA: `bg-primary-container text-black px-6 py-2.5 font-label-caps uppercase tracking-widest glow-effect hover:bg-primary`
- Altura: `h-20` (80px)
- Responsivo: hamburger abaixo de 768px, menu drawer com glass bg

---

## 3. Home Page — Detalhamento Completo

### 3.1 Hero (viewport inteira — 100vh)
**Referência coffee-tech:** Hero de produto com produto centralizado + blur nos extremos.  
**Adaptação AUMAF:** Peça impressa em metal/carbono sobre fundo preto, iluminação lateral neon verde.

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ [NAV]                                               │
│                                                     │
│  ZERO-ERROR                          ┌──────────┐   │
│  PRECISION.         [Status pip]     │ ACTIVE   │   │
│                                      │ BUILD    │   │
│  Impressão 3D industrial para        │ ID_409X  │   │
│  aplicações críticas. Tolerância     │ ████░░   │   │
│  de 0.05mm.                          │ 80% ▓▓▓  │   │
│                                      └──────────┘   │
│  [ Solicitar Orçamento → ]  [ Ver Portfolio ]       │
│                                                     │
│                         ← scroll →                  │
└─────────────────────────────────────────────────────┘
```

**Componentes:**
- Background: foto full-bleed de peça metálica impressa + `bg-gradient-to-r from-black via-black/80 to-transparent`
- Status pill top-left: `● System Online // Imprimindo Agora` (verde pulsante)
- Headline: `Space Grotesk 72px weight-700 tracking-[-0.04em] UPPERCASE text-white`
- Subtítulo: `Space Grotesk 18px weight-300 text-tertiary max-w-2xl`
- CTA primário: `bg-primary-container text-black glow-effect`
- CTA secundário: `border border-primary-container text-primary-container`
- Widget "Active Build" (glass, flutuante direita-baixo): display de stats fictícios animados
- Scroll indicator: seta animada centralizada na base

**Copywriting melhorado:**
```
Supertítulo: SISTEMA ONLINE // IMPRIMINDO AGORA
Headline:    ZERO-ERROR
             PRECISION.
Subtítulo:   Manufatura aditiva industrial para aplicações críticas.
             Peças em metal, carbono e polímeros de alta performance —
             com tolerância de ±0.05mm, entregues onde você precisar.
CTA 1:       Solicitar Orçamento →
CTA 2:       Ver Portfolio
```

---

### 3.2 Stats Strip (faixa de números)
**Referência:** Separador visual entre hero e conteúdo.

```
┌──────────────────────────────────────────────────────┐
│  [linha verde 1px top]                               │
│                                                      │
│    +500          20+          0.05mm         3       │
│  projetos    materiais    tolerância    tecnologias  │
│  entregues   disponíveis                             │
│                                                      │
│  [linha verde 1px bottom]                            │
└──────────────────────────────────────────────────────┘
```

**Especificações:**
- Fundo: `#0e0e0e` (Level 1 — contraste sutil com hero)
- Borda top/bottom: `border-y border-primary-container/30`
- Números: `Space Grotesk 48px weight-700 text-white tracking-tighter`
- Labels: `Space Grotesk 11px weight-700 uppercase tracking-widest text-tertiary`
- Layout: grid 4 colunas com divisores verticais `border-r border-white/10`
- Animação: números contam de 0 ao valor quando entram na viewport (IntersectionObserver)

---

### 3.3 Seção — Capacidades Core (zigzag, coffee-tech Technology)
**Referência coffee-tech:** Produtos flutuando em zigzag sobre fundo preto, numeração `[01]`.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  [01]                         [imagem peça FDM]      │
│  PROTOTIPAGEM RÁPIDA          (flutuando, sem card)  │
│                                                      │
│  Valide seu conceito em horas,                       │
│  não semanas. Iteração acelerada                     │
│  com precisão industrial.                            │
│                                                      │
│  [Saiba mais →]                                      │
│                                                      │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                                      │
│                    [imagem peça metal]  [02]         │
│                                   PEÇAS FUNCIONAIS   │
│                                                      │
│  ...                                                 │
└──────────────────────────────────────────────────────┘
```

**Especificações:**
- Fundo: `#000000` (puro)
- Sem cards, sem boxes — imagem e texto flutuam sobre void
- Numeração: `Space Grotesk 12px weight-700 text-white/30 tracking-widest uppercase`
- Título item: `Space Grotesk 40px weight-500 uppercase text-white tracking-[-0.02em]`
- Corpo: `Space Grotesk 18px weight-300 text-tertiary max-w-md`
- Link: `text-primary-container text-sm uppercase tracking-widest hover:gap-3 transition-all`
- Separador entre items: `border-b border-white/5`
- Altura por item: ~80vh (muito espaço negativo — não comprimir)
- Imagens: `object-fit: cover, mix-blend-mode: luminosity, opacity: 0.85`

**Conteúdo (4 capacidades):**
```
[01] PROTOTIPAGEM RÁPIDA
     Valide conceitos em horas, não semanas. Nossos processos FDM e SLA
     entregam protótipos funcionais com geometrias complexas e tolerância
     dimensional precisa para ciclos de iteração acelerados.
     → Saiba mais

[02] PEÇAS FUNCIONAIS DE ALTA PERFORMANCE
     Do projeto à peça final em materiais de engenharia: carbono, nylon
     de alta temperatura, PEEK e metal via sinterização BASF Ultrafuse.
     Componentes para ambientes industriais severos.
     → Saiba mais

[03] MODELAGEM & ENGENHARIA REVERSA
     Transformamos desenhos, esboços e peças físicas em modelos digitais
     precisos. Scanner 3D para captura de geometrias complexas e
     otimização DfAM (Design for Additive Manufacturing).
     → Saiba mais

[04] PEÇAS DE REPOSIÇÃO SOB DEMANDA
     Pare de esperar meses por peças descontinuadas. Fabricamos
     substitutas em plástico técnico ou metal em prazo reduzido,
     sem mínimo de quantidade.
     → Saiba mais
```

---

### 3.4 Seção — Por que AUMAF 3D (glass cards)
**Referência coffee-tech:** Seção de sustainability/efficiency com cards.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  POR QUE AUMAF 3D                                    │
│  Precisão industrial, entrega ágil, parceria técnica │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ ⚙ PRECISÃO  │  │ ◈ MATERIAIS │  │ ✦ SUPORTE  │ │
│  │             │  │             │  │            │ │
│  │ ±0.05mm em  │  │ 20+ materiais│  │Consultoria │ │
│  │ todas as    │  │ carbono,    │  │técnica em  │ │
│  │ tecnologias │  │ metal, PEEK │  │ todas as   │ │
│  │             │  │             │  │ etapas     │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Especificações:**
- Fundo: `#1c1b1b` (Level 2 — seção "clara" do universo dark)
- Header seção: label `[MODULE: DIFERENCIAIS]` + headline UPPERCASE
- Grid: 3 colunas, gap 24px
- Cards: `glass-panel rounded-none p-10 border border-white/10 hover:border-primary-container/30 transition-all`
- Ícone: Material Symbol outline, 28px, `text-primary-container`
- Numeração interna: `[01]` no canto superior direito, `text-white/20 text-xs`
- Hover: translação Y -4px, borda verde sutil

**Conteúdo:**
```
[01] PRECISÃO CERTIFICADA
     ±0.05mm em FDM industrial. Peças dimensionalmente
     consistentes entre lotes, rastreáveis por projeto.

[02] PORTFÓLIO DE MATERIAIS
     20+ materiais: PA CF15, PEEK, Ultem, TPU, ABS,
     Policarbonato, Resina ABS/Cerâmica e BASF Ultrafuse 316L (aço).

[03] FEITO SOB MEDIDA
     Personalização total — geometria, material, acabamento.
     Sem mínimo de produção para projetos unitários.

[04] CONSULTORIA TÉCNICA
     Equipe especializada para indicar tecnologia, material e
     processo ideal para cada aplicação.

[05] LOCALIZADO EM SÃO CARLOS — SP
     Parque Tecnológico Damha II. Hub de inovação tecnológica
     próximo à USP e UFSCar.

[06] ENTREGA ÁGIL
     Prazos comunicados com clareza. Agilidade no orçamento
     e na execução — confirmado pelos nossos clientes.
```
*(grid de 6 cards: 3 cols × 2 rows)*

---

### 3.5 Seção — Tecnologias (3 pills grandes)
**Referência coffee-tech:** Seção de catálogo de produtos com filtros.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  TECNOLOGIAS DISPONÍVEIS                             │
│  [label] SISTEMAS // CAPACIDADES                     │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  SLS                                          │  │
│  │  Sinterização Seletiva a Laser                │  │
│  │  ─────────────────────────────────────────    │  │
│  │  Peças com densidade máxima, geometrias       │  │
│  │  complexas sem suporte. Nylon, PA, TPU.       │  │
│  │  [RESOLUÇÃO: 100μm] [SEM SUPORTE] [NYLON/PA]  │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌─────────────────────┐  ┌─────────────────────┐   │
│  │ SLA                 │  │ FDM                 │   │
│  │ Estereolitografia   │  │ Filamentos          │   │
│  │ ...                 │  │ ...                 │   │
│  └─────────────────────┘  └─────────────────────┘   │
│                                                      │
│           [ Ver Todos os Materiais → ]               │
└──────────────────────────────────────────────────────┘
```

**Especificações:**
- Fundo: `#000000`
- Layout: 1 card grande (SLS, destaque) + 2 cards médios abaixo (SLA, FDM)
- Cards: `glass-panel border border-white/10 p-10`
- Pills de spec: `border border-white/20 text-white/60 px-3 py-1 text-xs uppercase tracking-widest rounded-full`
- Pill destaque (tecnologia principal): `border-primary-container text-primary-container`

---

### 3.6 Seção — Materiais em Destaque (catálogo parcial)
**Referência coffee-tech:** Catálogo de produtos em grid 3 colunas.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  MATERIAIS                                           │
│  De polímeros a metal — a solução certa para         │
│  cada aplicação.                                     │
│                                                      │
│  [Todos] [Termoplásticos] [Alta Performance] [Metal] │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │[imagem]  │  │[imagem]  │  │[imagem]  │           │
│  │          │  │          │  │          │           │
│  │PA CF 15  │  │PEEK      │  │Ultrafuse │           │
│  │Nylon CF  │  │Alta Temp.│  │316L Aço  │           │
│  │[METAL]   │  │[INDUSTRIAL│  │[METAL]  │           │
│  └──────────┘  └──────────┘  └──────────┘           │
│                                                      │
│         [ Ver Catálogo Completo → ]                  │
└──────────────────────────────────────────────────────┘
```

**Especificações:**
- Fundo: `#1c1b1b`
- Filtros: pills como tabs horizontais, ativo em `border-primary-container text-primary-container`
- Cards: sem borda — imagem sobre fundo, texto abaixo
- Imagem: macro shot do material/peça, `aspect-square object-cover`
- Nome: `Space Grotesk 16px weight-600 text-white uppercase mt-4`
- Subtítulo: `Space Grotesk 12px weight-400 text-tertiary`
- Tag: pill outline pequeno, categoria do material

---

### 3.7 Seção — Depoimentos
**Referência coffee-tech:** Seção editorial com fotos e texto alternado.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  [label] CLIENTES // RESULTADOS                      │
│  O QUE NOSSOS                                        │
│  PARCEIROS DIZEM                                     │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │ "Peças impressas com rapidez, personalização    │ │
│  │  e muita precisão. Impressionante!"             │ │
│  │                                                 │ │
│  │  Raissa Ninelli — Diretora, Fugini Alimentos    │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ◀ ●  ○  ○ ▶                                         │
└──────────────────────────────────────────────────────┘
```

**Especificações:**
- Fundo: `#000000`
- Layout: carousel centralizado, 1 depoimento por vez em desktop
- Card: `glass-panel max-w-3xl mx-auto p-16 border border-white/10`
- Quote: `Space Grotesk 24px weight-300 text-white/90 leading-relaxed italic`
- Nome: `Space Grotesk 12px weight-700 uppercase tracking-widest text-primary-container mt-8`
- Empresa: `Space Grotesk 12px weight-400 text-tertiary`
- Dots: `w-2 h-2 rounded-full` — ativo: `bg-primary-container glow-effect`

**Conteúdo (3 depoimentos):**
```
"Agilidade no orçamento e na entrega do projeto.
 Produtos chegaram com a qualidade e acabamento esperados."
— Thiago Gerotto | Responsável Técnico, Callamarys

"Utilizamos maquetes e protótipos produzidos pela AUMAF 3D, sempre
 fomos muito bem atendidos, com suporte completo em todas as etapas."
— Vitor Gonçalez | Sócio Proprietário, Aulevi

"Usamos a AUMAF 3D como fornecedora de peças para máquinas e robôs.
 Rapidez, personalização e muita precisão. Impressionante!"
— Raissa Ninelli | Diretora, Fugini Alimentos
```

---

### 3.8 Seção — Indústrias Atendidas (GAP do site atual)
**Nova seção — não existe no site atual.**

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  [label] SETORES // APLICAÇÕES                       │
│  INDÚSTRIAS QUE CONFIAMOS                            │
│                                                      │
│  Automotiva  Aeroespacial  Médica  Robótica           │
│  Arquitetura  Fórmula SAE  Educação  Alimentos       │
│                                                      │
│  [8 pills grandes com ícone + nome]                  │
└──────────────────────────────────────────────────────┘
```

---

### 3.9 Seção — Blog Preview (3 cards)
**Referência coffee-tech:** "From our blog" em grid 3 colunas.

**Especificações:**
- Fundo: `#1c1b1b`
- Grid 3 colunas, gap 24px
- Cards: imagem full-bleed `border-radius: 4px`, categoria + título abaixo
- Categoria: label pill `text-primary-container border-primary-container`
- Título: `Space Grotesk 18px weight-500 text-white mt-3`
- Link "Ver todos": centralizado abaixo

---

### 3.10 CTA Final (full-width dark)
```
┌──────────────────────────────────────────────────────┐
│  [linha verde top]                                   │
│                                                      │
│  PRONTO PARA COMEÇAR                                 │
│  SEU PROJETO?                                        │
│                                                      │
│  Nossa equipe analisa seu arquivo em 24 horas.       │
│                                                      │
│  [ Enviar Arquivo e Solicitar Orçamento → ]          │
│  [ Falar pelo WhatsApp ]                             │
│                                                      │
│  [linha verde bottom]                                │
└──────────────────────────────────────────────────────┘
```

---

### 3.11 Footer
**Referência coffee-tech:** Minimalista dark, logo + endereço + botão topo.

```
┌──────────────────────────────────────────────────────┐
│  AUMAF 3D      Serviços · Portfolio · Materiais      │
│                Sobre · Blog · Contato · FAQ          │
│                                                      │
│  São Carlos — SP          [↑]                        │
│  Parque Tecnológico Damha II                         │
│  (16) 99286-3412                                     │
│  comercial@auma3d.com.br                             │
│                                                      │
│  ──────────────────────────────────────────────────  │
│  © 2026 AUMAF 3D · Todos os direitos reservados      │
│  Desenvolvido por kayoridolfi.ai                     │
└──────────────────────────────────────────────────────┘
```

**Especificações:**
- Fundo: `#000000`
- Logo: `Space Grotesk weight-700 uppercase text-white`
- Links: organizados em 2 colunas de 4, `text-white/50 hover:text-white text-sm`
- Botão ↑: `w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:border-primary-container`
- Social icons: Facebook, LinkedIn, Instagram — inline com footer info
- Linha divisória: `border-t border-white/10`

---

## 4. Página — Serviços

### 4.1 Hero Institucional
**Referência coffee-tech:** About/Technology hero — headline esquerda, body direita.

```
┌──────────────────────────────────────────────────────┐
│ [label] SISTEMAS // CAPACIDADES                      │
│                                                      │
│ SOLUÇÕES DE                   Engenharia aditiva     │
│ MANUFATURA                    completa: do arquivo   │
│ ADITIVA.                      digital à peça        │
│                               funcional.             │
└──────────────────────────────────────────────────────┘
```
- Layout assimétrico: headline 60% esquerda, corpo 40% direita
- Background: foto de impressora industrial em `opacity-30 mix-blend-luminosity`

### 4.2 Grid de Serviços (4 cards expandidos)
Cada serviço tem:
- Ícone técnico + numeração `[0X]`
- Título UPPERCASE
- Descrição detalhada (3-4 linhas)
- Especificações técnicas como pills: `[TOLERÂNCIA ±0.05mm]` `[FDM/SLS/SLA]` `[METAL]`
- Link "Saiba mais" ou CTA inline

**Conteúdo expandido dos 4 serviços:**
```
[01] PROTOTIPAGEM RÁPIDA
Tipologia: FDM, SLA, SLS
Prazo típico: 24–72h
Materiais: PLA, ABS, PETG, Resina
Specs pills: [ITERAÇÃO RÁPIDA] [GEOMETRIA COMPLEXA] [SEM MOLDE]
Texto: Reduza o ciclo de desenvolvimento com protótipos funcionais
entregues em dias. Ideal para validação de forma, encaixe e
montagem antes da produção em série.

[02] PEÇAS FUNCIONAIS & REPOSIÇÃO
Tipologia: FDM industrial, SLS, Metal (BASF Ultrafuse)
Aplicação: Componentes de uso final, máquinas, robótica
Specs pills: [METAL DISPONÍVEL] [SEM MÍNIMO] [ALTA TEMPERATURA]
Texto: Peças de reposição para máquinas, componentes para
robôs e equipamentos industriais. Fabricadas sob demanda
sem molde ou estoque mínimo.

[03] MODELAGEM 3D & OTIMIZAÇÃO DfAM
Tipologia: Serviço de engenharia
Entregável: Arquivo .STL / .STEP otimizado
Specs pills: [CAD PROFISSIONAL] [DfAM] [ANÁLISE DE TOPOLOGIA]
Texto: Nossa equipe converte desenhos técnicos, esboços ou
especificações verbais em modelos 3D prontos para impressão,
com otimização para fabricação aditiva.

[04] ENGENHARIA REVERSA (Scanner 3D)
Tipologia: Scanner portátil de alta precisão
Aplicação: Réplica de peças orgânicas e complexas
Specs pills: [SCANNER 3D] [ENGENHARIA REVERSA] [NUVEM DE PONTOS]
Texto: Capturamos peças físicas existentes com scanner 3D de
alta resolução e geramos o modelo digital para replicação
exata ou modificação de design.
```

### 4.3 Como Funciona (processo em steps)
```
[01] Envie o arquivo ou descreva a peça
[02] Análise técnica em até 24h
[03] Orçamento detalhado com prazo
[04] Impressão com monitoramento
[05] Controle de qualidade dimensional
[06] Entrega e suporte pós-venda
```
Layout: linha horizontal com dots conectados, steps numerados, ícone + texto abaixo.

### 4.4 CTA
Upload de arquivo STL/OBJ + form rápido (nome, email, material desejado).

---

## 5. Página — Portfolio

### 5.1 Hero mínimo
`PORTFOLIO` em display gigante + subtítulo `[500+ projetos entregues]`

### 5.2 Filtros
```
[Todos] [Prototipagem] [Peças Funcionais] [Metal] [Resina] [Maquetes] [Robótica]
```
Pills como tabs. Ativo: `bg-primary-container text-black`.  
Filtro funciona via JavaScript (mostrar/ocultar por categoria).

### 5.3 Grid Masonry (3 colunas)
- Cards sem borda — imagem ocupa o card inteiro
- `border-radius: 2px`
- Hover: overlay escuro com título + categoria + `[ver detalhes →]`
- Categoria no canto superior: label pill verde
- Mínimo 12 itens na home do portfolio

**Estrutura do card:**
```html
<div class="relative group overflow-hidden rounded-sm">
  <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
  <div class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
    <span class="label-caps text-primary-container">PROTOTIPAGEM</span>
    <h3 class="headline-md text-white uppercase">Suporte para Robô Industrial</h3>
  </div>
</div>
```

---

## 6. Página — Materiais

### 6.1 Hero
Headline: `MATERIAIS DE PRIMEIRA LINHA`  
Subtítulo: `20+ materiais certificados. Do polímero ao aço.`  
Background: macro shot de grânulos de material / filamento sobre fundo preto.

### 6.2 Intro copy (gap do site atual — melhorado)
```
A variedade nas propriedades dos polímeros e metais torna possível
atender desde protótipos de conceito até peças de uso final em
ambientes industriais severos. Nossa equipe indica o material ideal
para cada combinação de requisitos: temperatura, carga, flexibilidade,
biocompatibilidade e custo.
```

### 6.3 Filtros
```
[Todos] [Termoplásticos] [Alta Performance] [Flexíveis] [Resinas] [Metal]
```

### 6.4 Grid de Materiais (3 colunas, cards detalhados)
Cada card:
- Imagem macro do material (filamento/grânulo/peça)
- Nome: `Space Grotesk uppercase weight-600`
- Categoria: label pill
- 3 propriedades chave em formato de data:
  ```
  TEMP. MÁX.    240°C
  FLEX.         Rígido
  APLICAÇÃO     Industrial
  ```
- Link CTA: `Perguntar sobre este material →`

**Inventário completo de materiais:**

| Categoria | Material | Destaques |
|---|---|---|
| Termoplásticos | Nylon (PA) | Resistência mecânica, flexível |
| Termoplásticos | ABS | Alta durabilidade, pós-processável |
| Termoplásticos | Policarbonato (PC) | Transparente, alta temperatura |
| Termoplásticos | PET-G | Alimentício seguro, durável |
| Termoplásticos | PET-G CF15 | CF15 reforçado, rigidez |
| Termoplásticos | PP (Polipropileno) | Químico resistente, leve |
| Termoplásticos | TPU | Flexível, borracha técnica |
| Termoplásticos | ABS | Impacto |
| Alta performance | PAHT CF15 | Carbono, alta temp. >150°C |
| Alta performance | Tritan HT | Alta transparência, temperatura |
| Alta performance | PC (Policarbonato) | Alta temperatura |
| Técnicos | PVA | Suporte solúvel em água |
| Técnicos | Breakaway | Suporte manual |
| Técnicos | PLA Wood / Grafeno | Decorativo / condutor |
| Flexíveis | TPU | Shore 95A, elástico |
| Flexíveis | Flex | Shore 85A |
| Resinas | Resina Standard | Alta resolução, SLA |
| Resinas | Resina ABS | Mecânica, durável |
| Resinas | Resina Cerâmica | Temperatura extrema |
| Metal | BASF Ultrafuse 316L | Aço inoxidável, pós-sinterização |

---

## 7. Página — Sobre

### 7.1 Hero Institucional
Layout assimétrico (coffee-tech About).
```
SOBRE A                      São Carlos – SP.
AUMAF 3D.                    Parque Tecnológico Damha II.
                             Vizinhos à USP e UFSCar.
```

### 7.2 Missão e Valores (zigzag com numeração)
```
[01] MISSÃO
     Tornar a manufatura aditiva de alta performance acessível
     a empresas de todos os portes — sem abrir mão da qualidade,
     precisão e atendimento técnico de excelência.

[02] VISÃO
     Ser o parceiro de engenharia aditiva de referência no
     interior de São Paulo, acelerando a inovação de indústrias,
     startups e laboratórios de pesquisa.

[03] VALORES
     Inovação contínua. Qualidade comprovada. Transparência
     no processo. Parceria de longo prazo.
```

### 7.3 Case de Destaque — Parceria USP Fórmula SAE
Glass card especial com foto do evento, destaque da parceria.
```
[CASE]
FÓRMULA SAE — USP SÃO CARLOS
Peças estruturais e aerodinâmicas para o carro de competição
da equipe de Engenharia Mecânica da USP São Carlos.
[Jun/2024]
```

### 7.4 Localização + Contato rápido
```
[mapa estilizado ou img satélite + glass overlay]
Alameda Sinlioku Tanaka 202
Parque Tecnológico Damha II
São Carlos — SP | 13565-261
(16) 99286-3412
comercial@auma3d.com.br
```

---

## 8. Página — Blog

### 8.1 Listagem
**Referência coffee-tech:** "From our blog" grid 3 colunas sobre fundo light.  
**Adaptação AUMAF:** fundo `#1c1b1b`, cards com imagem + categoria + título.

**Layout:**
- Título: `BLOG` display gigante + subtítulo `O guia de manufatura aditiva da AUMAF 3D`
- Grid 3 colunas
- Card: imagem full-bleed `border-radius: 2px`, categoria pill verde, título, data, tempo leitura

### 8.2 Post Individual
**Referência coffee-tech:** post com título display, foto hero full-width, corpo estreito.

**Layout:**
```
TÍTULO DO POST EM DISPLAY   ← headline gigante, esquerda, max-w-4xl
GIGANTE UPPERCASE

[categoria] · [data] · [X min leitura]

┌────────────────────────────────────────────┐
│ [foto hero full-width, border-radius: 2px] │
└────────────────────────────────────────────┘

[corpo do post em coluna estreita — max-w-2xl mx-auto]

───────────────────────────────────────────────

POSTS RELACIONADOS
[grid 3 dark cards]
```

---

## 9. Página — Contato

### 9.1 Hero dark (formulário principal)
**Referência coffee-tech:** hero dark com headline esquerda + form direita.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  INICIE SEU           ┌──────────────────────────┐   │
│  PROJETO AGORA.       │ Nome ___________________  │   │
│                       │ Email __________________  │   │
│  Nossa equipe         │ Empresa ________________  │   │
│  responde em          │ Assunto ________________  │   │
│  até 24 horas.        │ Mensagem                  │   │
│                       │ ________________________  │   │
│                       │ [📎 Anexar arquivo STL]   │   │
│                       │                           │   │
│                       │ [ Enviar Projeto → ]      │   │
│                       └──────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Especificações:**
- Inputs: `border-b border-white/30 focus:border-primary-container bg-transparent text-white` (underline style, como coffee-tech)
- Inputs placeholder: `text-white/30 text-sm uppercase tracking-widest`
- Label flutuante: levanta ao focar (floating label animation)
- Área de texto: mínimo 150px, resize vertical
- Upload: drag-and-drop zone com `dashed border border-white/20 hover:border-primary-container`
- Formatos aceitos: `.STL .OBJ .STEP .PDF .DXF` (máx 15MB)

### 9.2 Seção info (light/surface)
**Referência coffee-tech:** seção bege inferior com suporte técnico.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ┌─────────────────┐  ┌──────────────────┐           │
│  │ 📍 ENDEREÇO     │  │ 💬 WHATSAPP      │           │
│  │ Alameda Sinlioku│  │ (16) 99286-3412  │           │
│  │ Tanaka 202      │  │ [Falar agora →]  │           │
│  │ Damha II        │  └──────────────────┘           │
│  │ São Carlos — SP │                                  │
│  └─────────────────┘  ┌──────────────────┐           │
│                       │ ✉ EMAIL          │           │
│  ┌─────────────────┐  │ comercial@...    │           │
│  │ 🕐 HORÁRIO      │  └──────────────────┘           │
│  │ Seg–Sex         │                                  │
│  │ 08h–18h         │                                  │
│  └─────────────────┘                                  │
└──────────────────────────────────────────────────────┘
```
*(Esta seção resolve o GAP de "Sem WhatsApp visível" e "Sem horário de funcionamento" do site atual)*

---

## 10. Página — FAQ

### 10.1 Layout
**Referência coffee-tech:** headline display centralizado + pills de categoria + accordion.

```
VOCÊ PERGUNTOU,
NÓS RESPONDEMOS.

[Geral] [Materiais] [Processos] [Entrega & Prazo]

────────────────────────────────────────────────
É possível imprimir uma única peça?          [+]
────────────────────────────────────────────────
Qual o prazo de entrega?                     [+]
────────────────────────────────────────────────
Como envio meu arquivo?                      [+]
────────────────────────────────────────────────
```

**Especificações:**
- Fundo: `#131313` (diferença do coffee-tech que usa bege — AUMAF mantém dark)
- Headline: display xl centralizado, `max-w-2xl mx-auto`
- Pills de categoria: `border border-white/20 text-white/60 hover:border-primary-container hover:text-primary-container`
- Accordion: `border-b border-white/10` + `[+]/[-]` em outline circle
- Resposta: `Space Grotesk 16px weight-400 text-tertiary pb-6`

**Conteúdo FAQ (expandido do site atual + novos):**
```
GERAL
[01] É possível imprimir uma única peça?
     Sim. A impressão 3D não depende de moldes, tornando viável
     desde peças únicas até pequenas séries. Não há mínimo de quantidade.

[02] Quanto custa uma peça impressa?
     O valor depende do material, geometria da peça e tempo de impressão.
     Entre em contato — analisamos seu projeto sem compromisso em até 24h.

[03] Vocês atendem todo o Brasil?
     Sim. Atendemos clientes em todo o território nacional com envio via
     transportadora. Para São Carlos e região, temos retirada presencial.

MATERIAIS
[04] O que posso imprimir com uma impressora 3D?
     Desde peças decorativas simples até protótipos industriais, componentes
     mecânicos, equipamentos hospitalares e peças estruturais em metal.

[05] Quais são os principais benefícios da impressão 3D?
     Personalização total, sem molde, produção unitária viável, geometrias
     complexas impossíveis por usinagem, e redução de custo e prazo.

[06] Vocês trabalham com metal?
     Sim. Utilizamos o material BASF Ultrafuse 316L para impressão de peças
     metálicas em aço inoxidável 316L, com processo de sinterização posterior.

PROCESSOS
[07] Quais são as principais aplicações industriais?
     Aeroespacial, automotiva, médica, robótica, agroindustrial, arquitetura
     e pesquisa universitária (ex: Fórmula SAE USP São Carlos).

[08] Qual a tolerância dimensional das peças?
     Em FDM industrial atingimos ±0.05mm. Em SLA, resolução de camadas
     de 25–100 microns. SLS entrega peças sem suporte com alta precisão.

[09] Como envio meu arquivo para orçamento?
     Aceitamos .STL, .OBJ, .STEP, .DXF e .PDF. Use o formulário de contato
     ou envie direto para comercial@auma3d.com.br.

ENTREGA & PRAZO
[10] Qual o prazo de entrega?
     Varia conforme material e quantidade. Protótipos simples: 24–72h.
     Peças funcionais em FDM: 3–7 dias úteis. Metal (sinterização): 15–20 dias.
```

---

## 11. Componentes — Inventário Completo

### 11.1 Átomos
| Componente | Descrição | Variantes |
|---|---|---|
| `Button` | Botão de ação | primary, ghost, icon-only |
| `Pill` | Tag / categoria | outline, filled, status |
| `StatusDot` | Indicador pulsante | active (verde), standby (cinza) |
| `SectionLabel` | Label de seção `[01] // TITLE` | — |
| `Divider` | `border-white/10` | horizontal, vertical |
| `IconWrapper` | Container para Material Symbol | sm, md, lg |
| `GlowEffect` | `box-shadow: 0 0 15px rgba(97,197,79,0.3)` | sm, lg |

### 11.2 Moléculas
| Componente | Descrição | Páginas |
|---|---|---|
| `GlassCard` | Card semitransparente | Home, Serviços, FAQ |
| `MaterialCard` | Card de material com specs | Materiais, Home |
| `ServiceRow` | Row zigzag de serviço | Home, Serviços |
| `TestimonialCard` | Depoimento em glass | Home |
| `BlogCard` | Card de post | Home, Blog |
| `PortfolioCard` | Card de projeto com hover | Portfolio |
| `TechCard` | Card de tecnologia com specs | Home, Serviços |
| `StatItem` | Número + label animado | Home stats strip |
| `FAQItem` | Accordion individual | FAQ |
| `NavLink` | Link de navegação ativo/inativo | Nav |
| `InputUnderline` | Input estilo underline | Contato |
| `FileDropZone` | Área de upload drag-and-drop | Contato, Serviços |

### 11.3 Organismos
| Componente | Descrição | Páginas |
|---|---|---|
| `Navbar` | Navegação global fixa | Global |
| `Footer` | Rodapé mínimo dark | Global |
| `HeroFull` | Hero viewport inteira | Home |
| `HeroInstitutional` | Hero assimétrico | Serviços, Sobre |
| `StatsStrip` | Faixa de números animados | Home |
| `ZigzagSection` | Seção alternada item por item | Home, Serviços |
| `GridSection` | Grid 3 colunas de cards | Materiais, Portfolio, Blog |
| `CarouselSection` | Carousel com dots | Depoimentos |
| `ProcessSteps` | Steps horizontais numerados | Serviços |
| `ContactForm` | Formulário completo | Contato |
| `FaqSection` | Lista accordion com filtros | FAQ |

---

## 12. Tokens Tailwind (tailwind.config.ts)

```typescript
colors: {
  background:  '#000000',
  surface: {
    DEFAULT:  '#131313',
    dim:      '#0e0e0e',
    low:      '#1c1b1b',
    base:     '#201f1f',
    high:     '#2a2a2a',
    highest:  '#353534',
  },
  primary: {
    DEFAULT:   '#7ce268',
    container: '#61c54f',
    dim:       '#78dd64',
    fixed:     '#93fa7d',
  },
  on: {
    surface:         '#e5e2e1',
    'surface-dim':   '#becab6',
    primary:         '#013a00',
  },
  tertiary: '#cdcaca',
  outline:  '#899482',
  error:    '#ffb4ab',
},
fontFamily: {
  sans: ['Space Grotesk', 'sans-serif'],
},
fontSize: {
  'display-xl': ['72px', { lineHeight: '1.0', letterSpacing: '-0.04em' }],
  'headline-lg': ['40px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
  'headline-md': ['24px', { lineHeight: '1.4', letterSpacing: '0.02em' }],
  'body-lg':     ['18px', { lineHeight: '1.6', letterSpacing: '0' }],
  'body-md':     ['16px', { lineHeight: '1.6', letterSpacing: '0.01em' }],
  'label-caps':  ['12px', { lineHeight: '1.0', letterSpacing: '0.2em' }],
  'code-data':   ['14px', { lineHeight: '1.4', letterSpacing: '0.05em' }],
},
spacing: {
  'margin':       '64px',
  'gutter':       '24px',
  'section-gap':  '160px',
  'stack-lg':     '48px',
  'stack-md':     '24px',
  'stack-sm':     '8px',
},
borderRadius: {
  DEFAULT: '2px',
  'sm':    '1px',
  'md':    '4px',
  'full':  '9999px',
},
```

---

## 13. Gaps do Site Atual — Como Cada Um é Resolvido

| Gap | Solução no novo site |
|---|---|
| Sem WhatsApp visível | Seção de contato info (seção 9.2) + CTA no hero final |
| Sem horário de funcionamento | Seção contato info: "Seg–Sex 08h–18h" |
| Blog inativo | Estrutura de blog completa + IA gerando posts (Q2) |
| Apenas 1 CTA ("Peça um orçamento") | CTA primário + secundário no hero, CTA em cada seção |
| Sem indústrias atendidas | Seção nova "Indústrias que Confiamos" (seção 3.8) |
| Sem certificações / parceiros | Case Fórmula SAE USP, menção BASF Ultrafuse partner |
| Sem anos de mercado / projetos | Stats strip: +500 projetos, 20+ materiais |
| Identidade visual fraca | Paleta Cinematic com glassmorphism industrial |
| Sem preços / prazo | FAQ expandido + copy de orçamento em 24h |
| Navegação pobre (Wix) | Astro SSG + performance A+ |

---

## 14. Ordem de Implementação (sprints)

### Sprint 1 — Fundação (Q1 semana 1–2)
1. `tailwind.config.ts` com tokens completos
2. `global.css` com classes utilitárias (`.glass-panel`, `.glow-effect`)
3. Componente `Navbar` + `Footer`
4. Layout base (`BaseLayout.astro`)
5. **Home completa** (todas as seções)

### Sprint 2 — Páginas de Conversão (Q1 semana 2–3)
6. Página Serviços
7. Página Contato (formulário completo)
8. Página FAQ

### Sprint 3 — Conteúdo (Q1 semana 3 / Q2 semana 1)
9. Página Materiais (catálogo completo)
10. Página Portfolio (grid com filtros)
11. Página Sobre
12. Blog (estrutura — posts via IA no Q2)

### Sprint 4 — Performance & SEO (Q1 final)
13. Otimização de imagens (Sharp no Astro)
14. Meta tags, Open Graph, sitemap
15. GA4 + Pixel + GTM
16. Integração Botyo WhatsApp
17. Lighthouse score > 95 em todas as páginas
