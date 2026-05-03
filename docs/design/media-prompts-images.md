# AUMAF 3D — Prompts para Geração de Imagens

**Estilo visual do site:** Cinematic Additive Manufacturing  
**Paleta:** Fundo preto (#000000), verde neon (#61c54f), branco frio (#e5e2e1)  
**Atmosfera:** Industrial de alta precisão, tech-dark, futurista sobrio  
**Referências visuais:** Fotografia industrial close-up, iluminação de estúdio técnica, fundos escuros/pretos, reflexos metálicos

---

## Prompt Base (reuse como prefixo em todos)

```
Professional industrial product photography, dark studio background (#0a0a0a), 
precision 3D printed part, rim lighting with subtle green (#61c54f) accent glow,
sharp focus, 8K detail, cinematic composition, black metal surface reflections,
tech-dark aesthetic, no text, no watermarks
```

---

## IMG_BLOG_01 — Parceria Fórmula SAE USP

**Slot:** `/images/blog/formula-sae-usp.jpg`  
**Dimensões:** 1200×630px (16:9 ou 4:3)  
**Aspecto:** Destaque (first card, maior impacto)

```
University Formula SAE racing car, USP São Carlos, young engineering students,
3D printed suspension components, carbon fiber parts, garage workshop setting,
dramatic side lighting, dark background, green accent lighting on the car parts,
photojournalistic style, wide angle, high contrast black and green color grading,
professional photography, sharp detail
```

**Alternativa IA (Midjourney/SDXL):**
```
/imagine formula SAE race car student engineering team, 3D printed suspension parts 
glowing green, dark workshop, dramatic rim lighting, cinematic --ar 16:9 --style raw 
--q 2 --v 6
```

---

## IMG_BLOG_02 — Filamentos de Impressão 3D

**Slot:** `/images/blog/filamentos-impressao-3d.jpg`  
**Dimensões:** 1200×630px

```
Collection of 3D printing filament spools arranged artistically, dark studio,
PA CF15 carbon fiber filament (dark gray), PEEK (translucent amber), metal filament 
BASF Ultrafuse 316L (metallic), TPU flexible (green accent), overhead flat lay,
moody product photography, subtle green LED accent lighting, sharp focus,
black background, industrial aesthetic
```

**Alternativa IA:**
```
/imagine 3D printer filament spools collection flat lay dark background,
carbon fiber PA nylon PEEK metal filament, green accent light, product photography --ar 16:9 --v 6
```

---

## IMG_BLOG_03 — Impressão 3D na Ciência

**Slot:** `/images/blog/impressao-3d-ciencia.jpg`  
**Dimensões:** 1200×630px

```
Scientific laboratory setting, 3D printed medical/scientific components,
biocompatible ceramic resin parts, molecular model structures, precision instruments,
dark background with teal/green accent lighting, researcher hands handling components,
macro photography detail, clean sterile aesthetic with tech-dark atmosphere
```

**Alternativa IA:**
```
/imagine scientific 3D printed parts laboratory dark background, ceramic resin 
biomedical components, green rim lighting, researcher gloved hands, macro --ar 16:9 --v 6
```

---

## Seção Capacidades — Imagens de Peças

### CAP_01 — Prototipagem Rápida
**Slot:** `/images/capacidades/prototipagem.jpg` (aspect-square)

```
Rapid prototype 3D printed part, FDM/SLA process, complex geometry with internal channels,
dark studio background, green LED rim lighting, industrial photomicroscopy style,
layer lines visible on prototype surface, precision engineering aesthetic,
dramatic shadow composition, sharp focus on geometric details
```

### CAP_02 — Peças Funcionais & Metal
**Slot:** `/images/capacidades/metal-parts.jpg` (aspect-square)

```
BASF Ultrafuse 316L stainless steel 3D printed industrial part, metallic surface finish,
complex geometric flange or connector, dark studio, dramatic studio lighting creating 
metallic reflections, machined surface quality, industrial engineering photography,
black background with subtle green accent glow, ultra-sharp detail
```

### CAP_03 — Modelagem & Engenharia Reversa
**Slot:** `/images/capacidades/reverse-engineering.jpg` (aspect-square)

```
3D scanner capturing complex mechanical part, structured light or laser scanning technology,
point cloud visualization (green/blue dots), dark environment with scanner beam visible,
engineering reverse engineering professional setup, technical aesthetic,
futuristic industrial photography, deep blacks
```

### CAP_04 — Peças de Reposição Sob Demanda
**Slot:** `/images/capacidades/on-demand.jpg` (aspect-square)

```
Side-by-side comparison: worn/broken industrial machine part next to its perfect 3D printed 
replacement, dramatic lighting emphasizing the new part quality, dark background,
green accent lighting, industrial macro photography, engineering precision aesthetic
```

---

## Seção Tecnologias

### VIDEO_SLS — Poster Frame
**Slot:** `/images/tech/sls-preview.jpg`

```
SLS laser sintering process extreme close-up, laser beam hitting nylon powder bed,
sintering flash moment captured, green/white laser light, dark background,
powder bed surface texture visible, industrial process photography,
motion blur on laser beam, sharp on powder surface
```

### Hero — Poster Frame  
**Slot:** `/images/hero-poster.jpg`

```
Industrial FDM 3D printer in action, close-up of print head laying carbon fiber reinforced 
nylon layers, green LED printer accent lighting, dark workshop background,
motion blur on filament extruder, sharp focus on printed layers,
cinematic wide angle, tech-dark aesthetic
```

---

## Notas de Produção

- **Formato:** JPG para fotos (90% quality), WebP como alternativa
- **Largura mínima:** 1200px para qualquer imagem
- **Thumbnails blog:** 1200×800px (3:2) → Astro `<Image>` gera versões otimizadas
- **Cards capacidades:** quadrado 800×800px → `aspect-square` no CSS
- **Modo:** Sem fundo branco — sempre dark/preto
- **Watermarks:** Nunca incluir
- **AI tools recomendados:** Midjourney v6, Flux Pro, SDXL + Realistic Vision, Adobe Firefly (industrial)
