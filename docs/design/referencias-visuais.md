# Referências Visuais — Design System AUMAF 3D

Paleta extraída diretamente do projeto Stitch **AUMAF 3D Tech Experience**
(ID: `788969119779217639`, telas Cinematic aprovadas em 2026-05-02).

---

## Estética Aprovada: Cinematic Additive Manufacturing

**Conceito:** Futuristic Glassmorphism aplicado a manufatura industrial. Fundos abissais pretos com
painéis de vidro semitransparentes, glow verde neon nos elementos de ação, tipografia técnica
em maiúsculas. A sensação é de um painel de controle de impressão 3D de alta precisão.

---

## Paleta de Cores

### Backgrounds / Superfícies
| Token          | Hex       | Uso                                  |
|----------------|-----------|--------------------------------------|
| `background`   | `#000000` | Fundo global (preto absoluto)        |
| `surface`      | `#131313` | Superfície padrão                    |
| `surface-lowest` | `#0e0e0e` | Fundo de inputs e recesses          |
| `surface-low`  | `#1c1b1b` | Superfície levemente elevada         |
| `surface-base` | `#201f1f` | Cards e containers                   |
| `surface-high` | `#2a2a2a` | Glass panel fill (+ opacity 40%)     |
| `surface-highest` | `#353534` | Hover states, borders              |

### Primária — Precision Green
| Token               | Hex       | Uso                                  |
|---------------------|-----------|--------------------------------------|
| `primary`           | `#7ce268` | Texto primário ativo, links          |
| `primary-container` | `#61c54f` | Botão CTA fill, ícones, status dots  |
| `primary-dim`       | `#78dd64` | Hover do CTA                         |
| `primary-fixed`     | `#93fa7d` | Highlights e seleções                |

### Texto
| Token               | Hex       | Uso                                  |
|---------------------|-----------|--------------------------------------|
| `on-surface`        | `#e5e2e1` | Texto principal (warm off-white)     |
| `on-surface-variant`| `#becab6` | Texto secundário / labels            |
| `tertiary`          | `#cdcaca` | Texto descritivo / corpo             |
| `muted`             | `#c6c6c6` | Texto desabilitado / metadados       |
| `outline`           | `#899482` | Bordas sutis                         |

### Funcionais
| Token             | Hex       | Uso              |
|-------------------|-----------|------------------|
| `error`           | `#ffb4ab` | Estados de erro  |
| `error-container` | `#93000a` | Fundo de erro    |

---

## Efeitos Glass

```css
/* Glass Panel — container padrão */
.glass-panel {
  background: rgba(42, 42, 42, 0.4);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Nav / Header */
.nav-glass {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(48px); /* backdrop-blur-3xl */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Glow effect — botões CTA e status dots */
.glow-effect {
  box-shadow: 0 0 15px rgba(97, 197, 79, 0.3);
}

/* Glow border sutil — cards hover */
.glow-border {
  border: 1px solid rgba(124, 226, 104, 0.2);
  box-shadow: 0 0 20px rgba(97, 197, 79, 0.3);
}
```

---

## Tipografia

| Papel        | Fonte         | Size  | Weight | Tracking       | Case      |
|--------------|---------------|-------|--------|----------------|-----------|
| Display      | Space Grotesk | 64px  | 700    | `-0.02em`      | UPPERCASE |
| Headline LG  | Space Grotesk | 32px  | 600    | normal         | UPPERCASE |
| Headline MD  | Space Grotesk | 24px  | 500    | normal         | UPPERCASE |
| Body LG      | Manrope       | 18px  | 400    | normal         | —         |
| Body MD      | Manrope       | 16px  | 400    | normal         | —         |
| Label / Code | Space Grotesk | 12px  | 700    | `0.1em` (wide) | UPPERCASE |

**Google Fonts import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## Componentes Padrão

### Botão Primário (CTA)
```html
<button class="bg-primary-container text-black font-label-caps px-8 py-4 rounded glow-effect hover:bg-primary transition-colors uppercase tracking-widest">
  Solicitar Orçamento
</button>
```

### Botão Secundário (Ghost)
```html
<button class="border border-primary-container text-primary-container font-label-caps px-8 py-4 rounded hover:bg-primary-container/10 transition-colors uppercase tracking-widest">
  Ver Portfolio
</button>
```

### Status Pill (System Online)
```html
<div class="flex items-center gap-4">
  <span class="w-2 h-2 rounded-full bg-primary-container glow-effect animate-pulse"></span>
  <span class="font-label-caps text-primary-container tracking-widest uppercase text-xs">
    System Online // Status: Printing
  </span>
</div>
```

### Glass Card
```html
<div class="glass-panel rounded-xl p-8 border border-white/10">
  <span class="font-label-caps text-primary-container tracking-widest uppercase text-xs block mb-2">
    01 // Module
  </span>
  <h3 class="font-headline-md text-white uppercase mb-4">Título</h3>
  <p class="font-body-md text-tertiary">Descrição...</p>
</div>
```

### Widget de Build Ativo (sidebar hero)
```html
<div class="glass-panel rounded-lg p-6 w-80">
  <div class="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
    <span class="font-label-caps text-tertiary uppercase text-xs">Active Build</span>
    <span class="font-label-caps text-primary-container text-xs">ID_409X</span>
  </div>
  <!-- progress bar -->
  <div class="h-1 bg-surface-lowest rounded overflow-hidden">
    <div class="h-full bg-primary-container glow-effect" style="width: 80%"></div>
  </div>
</div>
```

---

## Layout & Espaçamento

| Token          | Valor  | Uso                              |
|----------------|--------|----------------------------------|
| `section-gap`  | 160px  | Espaço entre seções              |
| `margin-edge`  | 40px   | Margem lateral (`px-margin`)     |
| `gutter`       | 24px   | Gap de grid (`gap-gutter`)       |
| `stack-lg`     | 48px   | Stack vertical grande            |
| `stack-md`     | 24px   | Stack vertical médio             |
| `stack-sm`     | 8px    | Stack vertical pequeno           |
| `container-max`| 1440px | Largura máxima do container      |

**Grid:** 12 colunas. Assimétrico: col-span-8 + col-span-4 como padrão hero.

---

## Padrões de Seção

### Hero (viewport inteira)
- `h-screen` com background image `opacity-60 mix-blend-luminosity`
- Gradiente over: `from-black via-black/80 to-transparent` (horizontal)
- Conteúdo alinhado à esquerda com `pl-margin`
- Widget de status flutuando à direita (`absolute right-margin bottom-margin`)

### Seção de Capacidades
- Fundo: `bg-background` (preto)
- Header da seção: label code `01 // Modules` + headline + icon à direita
- Grid 12 colunas: card grande (col-8) + 2 cards menores (col-4)

### Navbar
- `fixed top-0 z-50` + glass nav
- Logo: `Space Grotesk uppercase font-bold tracking-tighter text-white`
- Links: `uppercase tracking-widest text-xs` — ativo em `text-green-400 border-b border-green-400`
- CTA: botão primário com glow

### Footer
- Fundo preto
- Minimalista

---

## Telas Aprovadas no Stitch (visíveis)

| Tela                              | ID                                   |
|-----------------------------------|--------------------------------------|
| Home — Cinematic                  | `2da631f01c9a4cad8d9cc62cc75ed769`   |
| Home — Emerald Cinematic          | `c59f834eaaf14a86b8f7c154a4cdcae8`   |
| Home — Final Version (nova)       | `fce1b3bad78f477bb0d010f2989d3738`   |
| Home — Final Version (anterior)   | `3ba2bb7314a840748fe40314f5114d58`   |
| Services — Cinematic              | `ce351d0d79fd47799149267ae71eef1a`   |
| Services — Emerald Cinematic      | `e1f2a95acc0f44418c7861999953bc58`   |
| Portfolio — Cinematic             | `7a157a4fb6834a39a4a025810e0d0695`   |
| Portfolio — Emerald Cinematic     | `673733b523e34950b9702d25f2aa7f5c`   |
| Contact — Cinematic               | `f7124ceeb9c14327a07c569c36ef36e8`   |

---

## O que NÃO usar
- Fundos navy/azul — o Cinematic usa preto absoluto, não `#09141e`
- Gradientes coloridos — apenas gradientes para-transparente (fade)
- Sombras coloridas que não sejam o verde neon
- Borders visíveis em cards — apenas `border-white/10` (quase invisível)
- Fontes além de Space Grotesk e Manrope
