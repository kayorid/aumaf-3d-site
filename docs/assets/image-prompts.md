# AUMAF 3D — Prompts de Geração de Imagem
**Direção de Arte:** Cinematic Additive Manufacturing  
**Paleta:** Void-and-Vapor — Preto absoluto + Precision Green (#61C54F) + Charcoal profundo  
**Estética:** High-contrast industrial, glassmorphism, laboratório de precisão futurista  
**Versão:** 1.0 — 2026-05-02

---

## REGRAS UNIVERSAIS DE ESTILO

Todo prompt deste documento herda estas regras base. Incorpore-as mentalmente em cada geração:

**Atmosfera:** Laboratório industrial de alta precisão às 2h da manhã. Sem luz natural. Iluminação 100% artificial — neon verde cirúrgico (#61C54F) como fonte de luz principal, fill-light em charcoal frio, sombras absolutas em preto puro (#000000).

**Fotografia:** Camera Sony A7R V, lente macro 100mm f/2.8, ISO 400, abertura f/5.6–f/8 para máxima nitidez em detalhes de engenharia. Foco seletivo — plano principal tack-sharp, fundo mergulhando em bokeh escuro.

**Pós-produção:** Tone mapping cinematográfico. Desaturação seletiva — tudo dessaturado exceto os verdes neon que ficam supersaturados. Contraste +25. Vignette suave nas bordas. Subtle halation verde em pontos de luz.

**Proibido:** Fundos brancos, fundos cinza médio, luz quente (amarela/laranja), gradientes coloridos, looks "fotos de produto e-commerce", sorriso humano, mãos visíveis, branding de concorrentes, logotipos visíveis de máquinas.

**Formato de saída preferencial:** RAW tratado como editorial de revista técnica de engenharia aeroespacial premium.

---

## BLOCO 1 — HERO HOMEPAGE

### HERO-01 — Imagem de Fundo Principal (Homepage)
**Slot:** `index.astro` — seção hero full-screen (100vh × 100vw)  
**Dimensões:** 1920×1080px mínimo, landscape 16:9  
**Uso:** Background com overlay gradient `from-black via-black/85 to-transparent` da esquerda para direita

---

**PROMPT PRINCIPAL:**

```
Ultra-close macro photograph of a metal 3D printed mechanical component, selective laser sintering 
stainless steel 316L surface, extreme precision engineering detail, titanium-grey metallic surface 
with sharp geometric edges and internal lattice structure visible through a cut-section, 
neon green precision laser line (#61C54F) tracing the edge contours of the part creating 
a razor-thin glow outline, absolute pure black background (#000000), dramatic side-lighting 
from a single cold-white LED source at 90 degrees creating deep shadow valleys in the 
layer-by-layer texture, micro surface detail of sintered metal powder particles fused together, 
captured with Sony A7R V + 100mm macro lens f/5.6, ISO 400, tack-sharp engineering precision, 
cinematic tonal grading with desaturated metallics and hyper-saturated green accent, 
subtle vignette, editorial quality, industrial laboratory atmosphere at 2AM, no humans, 
no logos, no background objects, depth of field with far-edge bokeh dissolving into pure black
```

**Negative prompt:** `white background, grey background, warm lighting, orange tones, yellow, 
product photography white seamless, hands, people, logos, text, watermarks, soft focus overall, 
HDR oversaturated, colorful, blue tones dominant`

**Parâmetros Midjourney:** `--ar 16:9 --style raw --v 6.1 --q 2`

---

**VARIANTE — cena de processo (alternativa mais dinâmica):**

```
High-speed macro photography of metal powder being laser-sintered in a selective laser sintering 
3D printer chamber, bright neon green laser beam (#61C54F) striking a flat bed of fine stainless 
steel 316L metallic powder, micro-explosion of glowing particles at the laser impact point, 
smoke trails in deep charcoal grey rising vertically, surrounding powder surface reflecting 
the laser glow creating a constellation of green micro-reflections, pure black chamber background, 
industrial precision atmosphere, captured at 1/8000s shutter speed, Sony A7R V macro, 
cinematic color grade — everything desaturated to near-black-and-white except the neon green laser, 
physics simulation realism, no cartoon, photorealistic, high-end automotive photography quality
```

**Parâmetros Midjourney:** `--ar 16:9 --style raw --v 6.1 --q 2`

---

## BLOCO 2 — CAPACIDADES CORE [01–04]

**Contexto de uso:** Seção "O que fazemos" — grid zigzag 2 colunas, imagens quadradas (~500×500px), cada uma ao lado de texto técnico. Efeito scanline HUD por cima das imagens.

**Regra de composição:** Enquadramento quadrado perfeito (1:1). Objeto centralizado com espaço negativo controlado nas bordas. Leve tilt (–5° a +5°) para dinamismo.

---

### CAP-01 — Prototipagem Rápida
**Slot:** Capacidade [01] — FDM/Resina prototyping  
**Dimensões:** 600×600px (1:1)

```
Extreme close-up macro of a complex FDM 3D printed prototype component made of translucent 
amber resin, intricate internal honeycomb lattice structure visible through semi-transparent walls, 
sharp layer lines visible as fine horizontal striations catching neon green side-light (#61C54F), 
precise geometric overhang structures with no support artifacts, floating on pure black background, 
dramatic single-source cold LED rim lighting from the upper-left creating a sharp edge highlight 
along all geometric edges, part tilted at 7 degrees for dynamic composition, macro lens capturing 
individual 0.2mm layer lines in perfect focus, depth of field transition from tack-sharp center 
to soft bokeh edges, cinematic desaturated color grade — amber neutralized to warm grey except 
green neon reflections, premium engineering laboratory atmosphere, no humans, no scale reference, 
abstract technical beauty
```

**Negative:** `white background, warm orange lighting, product photo style, text labels, 
supports visible, failed print artifacts, messy, casual, stock photo`

**Parâmetros Midjourney:** `--ar 1:1 --style raw --v 6.1 --q 2`

---

### CAP-02 — Manufatura em Metal
**Slot:** Capacidade [02] — Metal sintering / peças funcionais  
**Dimensões:** 600×600px (1:1)

```
Macro photography of a precision CNC-quality mechanical part produced by metal additive 
manufacturing — stainless steel 316L, perfectly polished functional surface on top half 
contrasting with raw sintered grain texture visible on the bottom half as a cross-section reveal, 
multiple internal cooling channels visible in cross-section with neon green light (#61C54F) 
bleeding out from inside the channels like bioluminescent veins, absolute black void background, 
single brutal overhead rim light source — cold white LED at 15 degrees angle to the surface 
creating long dramatic shadows in every surface groove and texture variation, photorealistic 
material quality — differentiated steel vs raw powder texture, engineering cross-section aesthetic, 
Sony A7R V + 100mm macro, tack-sharp at f/8, editorial industrial magazine quality, no text, 
no context objects, purely the part
```

**Negative:** `warm tones, orange, yellow glow, soft lighting, studio product photo, 
hands holding part, measurement tools visible, scale reference, text, logos`

**Parâmetros Midjourney:** `--ar 1:1 --style raw --v 6.1 --q 2`

---

### CAP-03 — Engenharia Reversa & Modelagem
**Slot:** Capacidade [03] — 3D scanning / reverse engineering  
**Dimensões:** 600×600px (1:1)

```
A complex mechanical part (automotive bracket or aerospace component) surrounded by a 
semi-transparent three-dimensional point cloud mesh overlay — thousands of tiny neon green 
data points (#61C54F) at varying opacity levels forming the exact digital wireframe of the 
physical object in 3D space, the physical part in sharp focus showing worn metal surface 
with engineering tolerances visible, the floating digital cloud slightly defocused creating 
a ghostly dual-reality composite, pure black background with no gradient, cold precise 
laboratory lighting from below casting faint upward shadows, cinematic grade — physical part 
in cool grey-silver, data cloud in pure precision green, photorealistic hybrid of physical 
and digital worlds, no text overlays, no UI chrome, no axes visible, purely the object 
and its ghost, dramatic depth separation between the two layers, atmospheric engineering precision
```

**Negative:** `colorful UI, axis labels, coordinate systems, warm tones, hands, laptop visible, 
monitor in background, text annotations, casual photography, white background`

**Parâmetros Midjourney:** `--ar 1:1 --style raw --v 6.1 --q 2`

---

### CAP-04 — Peças Sob Demanda
**Slot:** Capacidade [04] — On-demand legacy replacement parts  
**Dimensões:** 600×600px (1:1)

```
Dramatic side-by-side macro comparison of two identical mechanical components — left: an 
original worn industrial metal part showing signs of corrosion, scratches, and decades of use, 
surface oxidized to deep rust-brown, right: an exact replica freshly 3D printed in stainless 
steel with a flawless sintered surface finish, both parts sharply in focus on a pure black 
reflective surface, neon green precision light line (#61C54F) running vertically between the 
two parts as a separator — a razor-thin 1px glow divider, dramatic cold overhead lighting 
highlighting the contrast between old and new, reflective black surface below both parts showing 
inverted ghost reflections, zero depth of field falloff — both parts tack-sharp from edge to edge, 
cinematic color grade — worn part desaturated to near-greyscale, new part has a subtle metallic 
silver sheen, editorial product comparison photography, no labels, no text, pure visual storytelling
```

**Negative:** `text labels "old" "new", warm background, hands, workshop environment visible, 
messy table, tool marks, casual snapshot aesthetic, colorful`

**Parâmetros Midjourney:** `--ar 1:1 --style raw --v 6.1 --q 2`

---

## BLOCO 3 — TECNOLOGIAS

### TECH-01 — SLS Sinterização Seletiva a Laser
**Slot:** `index.astro` — seção tecnologias, destaque SLS, altura ~208px desktop  
**Dimensões:** 800×533px (3:2)

```
Inside view of a selective laser sintering (SLS) industrial 3D printer chamber, top-down 
perspective through a protective glass window, the build platform shows a partially completed 
nylon PA12 component emerging from a flat bed of fine white powder — only the top layer is 
visible as a ghost outline in the powder, a single high-powered CO2 laser beam drawn as a 
razor-thin bright green line (#61C54F) actively tracing a precise cross-hatching scan pattern 
across the powder surface, micro-melt zones visible as slightly darker spots where the laser 
has already fused the particles, the surrounding unsintered powder an absolute flat matte white 
against the deep shadow of the chamber walls, cold industrial overhead LED illumination, 
no visible machine parts except the powder bed itself, extreme precision and cleanliness, 
no debris, documentary photography quality, Leica SL2 + 35mm lens, f/8, ISO 800, 
cinematic grade with desaturated whites and vivid green laser trace
```

**Negative:** `orange tones, warm light, visible machine arms, operator hands, 
external environment, casual photography, imprecise details, cartoon-style`

**Parâmetros Midjourney:** `--ar 3:2 --style raw --v 6.1 --q 2`

---

### TECH-02 — SLA Estereolitografia
**Slot:** Seção tecnologias — card SLA  
**Dimensões:** 600×400px (3:2)

```
Ultra-macro close-up of a UV resin stereolithography 3D print mid-process — a delicate 
architectural lattice structure emerging from a translucent amber-gold liquid resin surface, 
the structure rising vertically with each freshly-cured layer still glistening wet, 
a thin UV laser point visible as a brilliant cyan-white dot on the resin surface creating 
circular interference rings in the liquid like a precision stone in still water, 
backlighting from below the resin tank creates a warm deep-amber translucency through 
the cured part — only warm light source allowed for this specific shot for material authenticity, 
everything else black, sharp angular overhangs demonstrating SLA's support-free capability, 
no bubbles or artifacts, pristine engineering precision, macro lens capturing 0.025mm layer lines, 
photorealistic material simulation
```

**Parâmetros Midjourney:** `--ar 3:2 --style raw --v 6.1 --q 2`

---

### TECH-03 — FDM Deposição de Material Fundido
**Slot:** Seção tecnologias — card FDM  
**Dimensões:** 600×400px (3:2)

```
Extreme close-up action shot of an FDM 3D printer nozzle actively depositing a bead of 
carbon fiber reinforced nylon filament (PA CF15), the brass/hardened steel nozzle at 240°C 
shown at 10% visible at top frame as a dramatic overhead silhouette, the freshly extruded 
filament bead in sharp focus — semi-transparent dark grey strand with visible carbon fiber 
speckles catching the rim light, bead of material micro-expanding as it exits the 0.4mm 
nozzle orifice, depositing onto a built structure of previous layers below showing perfect 
layer-to-layer adhesion, neon green ambient glow (#61C54F) from LED build chamber lighting 
reflecting off the shiny surface of the fresh extrusion, pure black background, 
1/2000s shutter freeze motion, Sony A7R V 100mm macro, cinematic industrial quality
```

**Parâmetros Midjourney:** `--ar 3:2 --style raw --v 6.1 --q 2`

---

## BLOCO 4 — PORTFOLIO (12 PROJETOS)

**Contexto:** Grid masonry 3 colunas, cards 4:3, hover revela overlay com título. As imagens precisam funcionar com um overlay escuro semi-transparente por cima.

**Regra universal para todos os projetos:**
- Fundo preto absoluto ou superfície industrial escura
- Peça centralizada, bem iluminada, sem contexto de ambiente casual
- Sempre um detalhe técnico de destaque (tolerância, acabamento, geometria complexa)
- Neon green (#61C54F) como luz de detalhe, nunca como iluminação dominante

---

### PORT-01 — Suporte para Robô Industrial
**Material:** PA CF15 (Nylon com fibra de carbono 15%)  
**Dimensões:** 600×450px (4:3)

```
Macro photography of a structural robot arm bracket printed in carbon fiber reinforced nylon 
(PA CF15), sharp angular geometry with thin-wall ribbed construction demonstrating mass 
optimization — every gram calculated, surface texture shows the characteristic matte-satin 
finish of carbon fiber nylon with subtle directional fiber alignment visible under raking light, 
precision threaded metal inserts pressed into the polymer at mounting points — clean brass vs 
matte black contrast, neon green precision light (#61C54F) from a thin LED strip at 45 degrees 
casting a dramatic highlight along the primary load-bearing rib, pure black background, 
no fill light — only rim and key light, Sony A7R V macro, f/8, cinematic desaturated grade, 
industrial robot component feel, zero visible support artifacts, perfect print quality
```

**Parâmetros Midjourney:** `--ar 4:3 --style raw --v 6.1 --q 2`

---

### PORT-02 — Flange Estrutural em Aço 316L
**Material:** BASF Ultrafuse 316L (metal sintered)  
**Dimensões:** 600×450px (4:3)

```
Studio macro of a stainless steel 316L metal 3D printed industrial flange — circular disc 
with precision bolt pattern and central bore, post-processed and polished to a mirror-bright 
machined finish on the sealing faces contrasting sharply with the raw sintered texture 
on the non-functional surfaces, cross-sectional view showing the dense internal grain structure 
with no voids, reflective black anodized aluminum surface below the part creating an inverted 
mirror reflection, single cold white overhead key light creating a circular catchlight 
in the polished center bore, neon green fine line (#61C54F) traced around the bolt circle 
diameter as an engineering measurement indicator — ghostly precision overlay effect, 
pure black background fading from dark charcoal near the part, Sony A7R V 100mm macro, 
f/11, tack-sharp, premium automotive industry quality standard
```

**Parâmetros Midjourney:** `--ar 4:3 --style raw --v 6.1 --q 2`

---

### PORT-03 — Componente Fórmula SAE
**Material:** Nylon PA12 (SLS)  
**Dimensões:** 600×450px (4:3)

```
Aerodynamic carbon-black SLS nylon PA12 component for a Formula SAE racing vehicle — 
a complex intake manifold or suspension upright with impossible internal channels that 
only additive manufacturing could produce, organic topology-optimized form inspired by 
bone structures removing every non-structural gram of material, flowing surface curves 
meeting sharp intersection edges at engineered stress concentration points, captured from 
a 3/4 view angle showing depth and complexity, AUMAF's characteristic matte grey PA12 
surface texture under dramatic cold sidelight from the right, deep shadow carving the 
internal topology, faint neon green internal channel glow effect (#61C54F) bleeding 
through the thin-wall sections as if light passes through them, pure black background, 
racing precision atmosphere, Leica SL2 + 50mm APO lens, cinematic motorsport editorial quality
```

**Parâmetros Midjourney:** `--ar 4:3 --style raw --v 6.1 --q 2`

---

### PORT-04 — Garra Pneumática em Ação
**Material:** PC + TPU (co-material — rígido + flexível)  
**Dimensões:** 600×450px (4:3)

```
Action macro of a custom 3D printed pneumatic gripper assembly in the closed gripping position, 
transparent polycarbonate (PC) rigid structural fingers with soft TPU overmolded gripping pads 
at fingertips — material contrast between crystal-clear structural body and matte-black 
flexible tips, the gripper firmly clasping a precision-turned aluminum cylinder rod showing 
the conforming flex of the TPU against the metal surface, pneumatic air channel visible 
as a translucent internal path through the PC body when backlit, neon green precision laser 
dot (#61C54F) from a measurement sensor reflected on the aluminum cylinder surface, 
pure black background, cold clinical lighting from directly above, no warm tones, 
industrial automation photography quality, zero motion blur, f/11 everything in focus, 
functional art of manufacturing automation
```

**Parâmetros Midjourney:** `--ar 4:3 --style raw --v 6.1 --q 2`

---

### PORT-05 — Maquete Arquitetônica de Precisão
**Material:** Resina ABS (SLA)  
**Dimensões:** 600×450px (4:3)

```
Macro aerial perspective of an architectural scale model 3D printed in SLA white ABS-like 
resin — a modernist building section with ultra-thin facade elements at 0.3mm wall thickness 
that would be impossible to cast or mill, perfect smooth post-cured surface showing zero 
layer lines (SLA quality), dramatic shadow-casting from a single directional light source 
positioned at 20 degrees horizon angle, creating long precise architectural shadows that 
reveal the geometry, pure white resin against pure black background for maximum contrast, 
neon green fine line (#61C54F) as a scale reference bar in the foreground — ultra-thin 
luminous ruler, Hasselblad X2D 100C sensor quality, absolute geometric precision, 
no people, no furniture for scale, purely the architectural form abstracted to its essence
```

**Parâmetros Midjourney:** `--ar 4:3 --style raw --v 6.1 --q 2`

---

### PORT-06 — Implante Médico Veterinário
**Material:** PEEK (alto desempenho biocompatível)  
**Dimensões:** 600×450px (4:3)

```
Clinical macro photography of a PEEK polymer 3D printed bone implant or custom orthopedic 
device — amber-tan translucent PEEK material with a precisely machined porous bone-ingrowth 
surface on one side and a smooth biocompatible sealing surface on the other, 
micro-pore architecture visible as a precise mathematical grid of 300-micron holes providing 
bone osseointegration surface, clinical precision in every dimension, placed on a reflective 
clean stainless steel surgical tray, single overhead cold surgical LED creating a sharp 
shadow pattern from the porous surface, neon green micro-spot light (#61C54F) illuminating 
the interior of three of the pores creating depth, pure black environmental background 
beyond the steel tray edge, medical device photography quality, sterile atmosphere, 
no text, no labels, clinical precision aesthetic
```

**Parâmetros Midjourney:** `--ar 4:3 --style raw --v 6.1 --q 2`

---

### PORT-07 — Proteção de Eletrônicos
**Material:** PC Industrial (Policarbonato)  
**Dimensões:** 600×450px (4:3)

```
Macro of a custom industrial electronics enclosure 3D printed in transparent polycarbonate 
(PC), complex internal partition walls, cable routing channels, and component mounting 
bosses all printed in a single part — eliminating 12 separate machined parts, translucent 
clear body revealing the internal geometry as an x-ray-like view, PCB component shadow 
visible through the walls as subtle dark rectangles, precise snap-fit locking mechanism 
shown in a 45-degree closed position, crisp shadow lines from internal ribs projecting 
onto outer walls under directional light, neon green LED indicator channel (#61C54F) 
molded directly into the part — glowing from within along a 2mm light guide groove, 
pure black background, cold laboratory lighting, engineering elegance over aesthetics, 
functional complex part as art
```

**Parâmetros Midjourney:** `--ar 4:3 --style raw --v 6.1 --q 2`

---

### PORT-08 — Ferramenta de Produção
**Material:** ABS Alta Temperatura  
**Dimensões:** 600×450px (4:3)

```
Macro of a production-floor manufacturing jig or fixture 3D printed in high-temperature ABS, 
matte black surface with precision-ground locating pins of polished steel pressed into 
the polymer body — contrast between the raw black ABS surface and the mirror-polished 
stainless steel pins, complex profile matching the outer contour of a specific production 
part for quality control go/no-go gauging, measurement datum points marked with tiny 
neon green laser-etched reference dots (#61C54F), worn edges on the high-contact areas 
showing the tool has been used in production — authenticity of a real production tool, 
industrial workshop floor setting compressed into black background with no visible context, 
dramatic sidelight from 3 degrees creating extreme surface texture contrast on the ABS finish, 
authentic manufacturing tool photography
```

**Parâmetros Midjourney:** `--ar 4:3 --style raw --v 6.1 --q 2`

---

### PORT-09 — Peça Aeroespacial em Titânio
**Material:** Ti-6Al-4V (simulado em metal SLS)  
**Dimensões:** 600×450px (4:3)

```
Macro of a titanium-grey aerospace bracket with extreme topology optimization — a complex 
3D lattice structure where only the structural load paths remain, resembling a metallic 
coral or bone structure, 80% material removed compared to the solid block while maintaining 
full load-bearing capacity, fine strut diameter of 1.2mm creating an intricate 3D web 
of micro-structures, each strut junction precisely fused, sintered metal surface texture 
with slight roughness at 3–5 micron Ra, placed on pure black carbon fiber weave fabric 
background, cold white key light from 60 degrees creating thousands of individual micro-highlights 
on each strut surface, neon green interior glow (#61C54F) emanating from within the lattice 
as if lit from inside, ultra-premium aerospace photography quality, ZEISS Otus 100mm lens simulation
```

**Parâmetros Midjourney:** `--ar 4:3 --style raw --v 6.1 --q 2`

---

### PORT-10 — Peça de Reposição Industrial
**Material:** Nylon PA12 + insert metálico  
**Dimensões:** 600×450px (4:3)

```
Side-by-side dramatic comparison — an original OEM mechanical part (discontinued, impossible 
to source, showing heavy wear with cracked polymer, deformed geometry, corroded metal inserts) 
directly beside a perfect AUMAF 3D printed replacement in natural white PA12 with fresh 
brass heat-set inserts gleaming, original mounted slightly lower and at a 5-degree tilt 
suggesting age and defeat, replacement standing perfectly vertical suggesting precision and 
renewal, pure black reflective surface below both creating mirror reflections, 
razor-thin neon green vertical light divider between them (#61C54F) — 1px wide, 
pure cold white overhead key light, editorial product photography quality, 
no text, no labels, the visual narrative tells the story of resurrection through additive manufacturing
```

**Parâmetros Midjourney:** `--ar 4:3 --style raw --v 6.1 --q 2`

---

### PORT-11 — Produto de Consumo
**Material:** TPU (flexível) + ABS (rígido)  
**Dimensões:** 600×450px (4:3)

```
Lifestyle-meets-industrial macro of a custom consumer product designed and printed by AUMAF 3D — 
a precision ergonomic handle or control device with dual-material over-mold (rigid ABS chassis 
with soft TPU grip zone), the grip texture pattern is a mathematical Voronoi surface derived 
from human palm pressure mapping, absolutely precise and geometric while being organically 
comfortable, floating on pure black background, three-point lighting setup — cold white key, 
neon green fill from below (#61C54F) bleeding into the textured grip surface, 
hair light from behind to separate from background, product photography meets high-fashion 
editorial meets engineering precision, no casual stock-photo feel, the object commands respect, 
shot on Phase One IQ4 150MP quality simulation
```

**Parâmetros Midjourney:** `--ar 4:3 --style raw --v 6.1 --q 2`

---

### PORT-12 — Conjunto Funcional Completo
**Material:** Múltiplos materiais  
**Dimensões:** 600×450px (4:3)

```
Exploded view composition of a complete functional assembly with 5–7 individually printed 
components in different materials — clear PC for optical housing, black ABS for structural 
frame, white PA12 for internal mechanism, brass metal inserts, grey TPU damping elements — 
all parts floating in a perfect geometric exploded arrangement as if disassembled by an 
invisible force in zero gravity, each part separated by exactly equal distances, 
pure black void background, individual parts each lit by their own neon green edge-light 
from below creating a constellation of glowing component silhouettes, the spatial arrangement 
reads as a technical schematic in 3D, photorealistic material differentiation, 
no arrows or labels, purely the visual language of disassembly revealing inner complexity, 
high-end watch brand editorial photography quality
```

**Parâmetros Midjourney:** `--ar 4:3 --style raw --v 6.1 --q 2`

---

## BLOCO 5 — MATERIAIS (16 FOTOGRAFIAS MACRO)

**Contexto:** Grid 4 colunas, cards quadrados (~280px). Imagens macro de filamentos, grânulos e amostras impressas. Objetivo: comunicar propriedades físicas e premium do material apenas visualmente.

**Regra universal:** Fundo sempre preto. Iluminação macro de precisão. Cada material deve comunicar sua propriedade principal visualmente: flexibilidade (curvatura), transparência (refração), dureza (aresta), fibra (textura direcional).

---

### MAT-01 — Nylon PA12 (Termoplástico padrão)
**Dimensões:** 400×400px (1:1)

```
Macro of a natural white nylon PA12 3D printed test specimen — flat top surface showing 
the characteristic semi-matte, slightly translucent white-cream color with an almost 
ivory micro-texture, a corner of the specimen catching a neon green rim-light (#61C54F) 
creating a precise bright edge, the surface micro-porosity visible under extreme magnification 
as a field of nano-craters that give SLS nylon its unique tactile quality, pure black 
background, single cold key light from 20-degree low angle to maximize surface texture 
capture, depth of field with near edge tack-sharp fading to soft bokeh at far edge, 
material property photography, zero context objects
```

**Parâmetros Midjourney:** `--ar 1:1 --style raw --v 6.1 --q 2`

---

### MAT-02 — ABS (Termoplástico padrão)
**Dimensões:** 400×400px (1:1)

```
Macro close-up of a spool of black ABS 3D printing filament, the circular cross-section 
of the 1.75mm diameter strand perfectly round and smooth, multiple parallel strands of 
filament arranged in a tight geometric pattern filling the frame, the glossy surface of 
ABS reflecting a long horizontal neon green specular highlight (#61C54F) along the 
length of each strand, pure black background, dramatic sidelight from the left catching 
only the tops of the strands creating alternating bands of highlight and shadow, 
macro photography capturing individual scratch marks on the filament surface, 
the perfect cylindrical geometry of extruded polymer as minimalist industrial sculpture
```

**Parâmetros Midjourney:** `--ar 1:1 --style raw --v 6.1 --q 2`

---

### MAT-03 — Policarbonato (PC Industrial)
**Dimensões:** 400×400px (1:1)

```
Macro of a 3D printed transparent polycarbonate (PC) block specimen — crystal clear like 
optical glass, light refracting internally creating caustic light patterns on the pure 
black surface below, a sharp geometric edge catching a brilliant white internal reflection 
edge, the material so clear the camera can see through it to the black background with 
only the slightest blue-tinted tint, a neon green laser dot (#61C54F) projected onto 
the top surface creating a perfect circular halo of refracted green light spreading 
through the transparent body, high-end optical component photography quality, 
representing polycarbonate's unique combination of clarity and industrial strength
```

**Parâmetros Midjourney:** `--ar 1:1 --style raw --v 6.1 --q 2`

---

### MAT-04 — PETG
**Dimensões:** 400×400px (1:1)

```
Macro of PETG filament in translucent electric blue (the only color exception in this 
series — representing PETG's availability in vibrant colors), multiple strands of filament 
forming a soft curved arc shape, the translucent blue material showing internal light 
scattering as a subtle glow within the strand walls, semi-gloss surface with 
characteristic PETG surface sheen, pure black background, cold white key light 
from above creating specular highlights along the strand surface, neon green accent 
light (#61C54F) from below adding a complimentary edge glow, material photographed 
as an abstract still life exploring transparency and color, macro bokeh at strand ends
```

**Parâmetros Midjourney:** `--ar 1:1 --style raw --v 6.1 --q 2`

---

### MAT-05 — Polipropileno (PP)
**Dimensões:** 400×400px (1:1)

```
Macro of natural polypropylene (PP) pellets/granules in a tight cluster — frosted white 
spherical-ish granules with a characteristic waxy matte surface that diffuses light softly, 
approximately 20–30 granules filling the frame in a shallow-depth-of-field arrangement, 
front row in sharp focus revealing the crystalline internal structure visible through 
the semi-opaque waxy surface, middle and back rows fading into a bokeh cloud, 
pure black background, cold diffused side-light from the right, neon green accent (#61C54F) 
as a single specular pin-light on one foreground granule, representing the chemical inertness 
and industrial utility of polypropylene, laboratory specimen aesthetic
```

**Parâmetros Midjourney:** `--ar 1:1 --style raw --v 6.1 --q 2`

---

### MAT-06 — TPU Flexível
**Dimensões:** 400×400px (1:1)

```
Action macro of a TPU flexible 3D printed lattice structure being physically bent — 
a human finger (the only instance where fingers are allowed, for material demonstration) 
pressing into a soft black TPU specimen causing dramatic elastic deformation, 
the lattice cells compressing and stretching simultaneously, neon green light (#61C54F) 
penetrating through the deformed cells and creating internal shadows as the geometry changes, 
the TPU surface has a characteristic matte-rubber texture with micro-grain, 
pure black background, dramatic sidelight freezing the deformation moment, 
the physical elasticity and resilience of TPU told in a single frame, macro lens f/8
```

**Parâmetros Midjourney:** `--ar 1:1 --style raw --v 6.1 --q 2`

---

### MAT-07 — PA CF15 (Nylon + Fibra de Carbono 15%)
**Dimensões:** 400×400px (1:1)

```
Extreme close macro of a PA CF15 carbon fiber reinforced nylon filament cross-section — 
the end face of a single 1.75mm filament strand perfectly cleaved and photographed 
straight-on, revealing the internal structure: a black polymer matrix with hundreds 
of individual carbon fiber strands (each 7 micron diameter) visible as dark specks 
distributed throughout the grey nylon matrix, the surface texture of the strand under 
a raking light showing directional carbon fiber orientation as subtle parallel ridges, 
neon green backlight (#61C54F) creating a halo around the circular cross-section end face, 
pure black background, the image reads as a microscope photograph of exotic material 
science, premium materials engineering aesthetic
```

**Parâmetros Midjourney:** `--ar 1:1 --style raw --v 6.1 --q 2`

---

### MAT-08 — Tritan HT (Alta temperatura transparente)
**Dimensões:** 400×400px (1:1)

```
Macro of a transparent Tritan HT high-temperature polymer 3D printed functional component — 
crystal clear like borosilicate glass, placed on a black surface near a heat source 
(glowing red-hot metallic rod visible in extreme background soft bokeh), the Tritan 
specimen completely undistorted and clear while near the heat — demonstrating its 
heat resistance visually, internal Fresnel lens-like concentric geometry reflecting 
a neon green point source (#61C54F) into a circular caustic pattern on the black surface below, 
the material represents "transparency that survives industrial heat", glass-like macro photography, 
optical instrument quality
```

**Parâmetros Midjourney:** `--ar 1:1 --style raw --v 6.1 --q 2`

---

### MAT-09 — PEEK (Alto Desempenho)
**Dimensões:** 400×400px (1:1)

```
Macro of a PEEK high-performance polymer specimen — the characteristic amber-brown 
semi-translucent color of natural PEEK under a precision machined cross-section showing 
pristine internal structure with zero porosity, the surface alternating between 
a precision-machined mirror finish on one face and the raw 3D printed layer texture 
on the opposite face — demonstrating that PEEK can be post-machined to aerospace tolerances, 
neon green laser measurement dot (#61C54F) projected onto the machined face creating 
a circular green caustic, pure black background, the warm amber color of PEEK is the 
one material exception to the desaturated color grade — the amber is preserved to 
accurately represent the material, single cold overhead key light, materials science photography
```

**Parâmetros Midjourney:** `--ar 1:1 --style raw --v 6.1 --q 2`

---

### MAT-10 — PC Industrial (Policarbonato Industrial)
**Dimensões:** 400×400px (1:1)

```
Dramatic impact test macro — a thick-walled PC industrial specimen immediately after 
a controlled impact test, a heavy steel ball bearing resting on the dented-but-not-cracked 
surface of the black polycarbonate specimen, the surface shows a complex stress-whitening 
pattern around the impact crater — a white fractal-like halo of polymer crystal deformation 
radiating outward from the impact point, the specimen did not break (PC's defining property), 
neon green backlight (#61C54F) highlighting the stress-whitening pattern from below 
creating an eerie internal luminescence, pure black background, cold forensic laboratory 
lighting, communicating polycarbonate's bulletproof toughness as a single powerful image
```

**Parâmetros Midjourney:** `--ar 1:1 --style raw --v 6.1 --q 2`

---

### MAT-11 — TPU Shore 95A
**Dimensões:** 400×400px (1:1)

```
Macro of a TPU Shore 95A 3D printed geometric test piece showing a perfect 90-degree 
compressed state — the specimen has been elastically compressed to 50% of its original 
height, returning to perfect shape is implied by the flawless undamaged surface, 
the material at this compression ratio shows beautiful internal wrinkling patterns 
in the surface texture and micro-buckling of the vertical walls, the colour is 
translucent warm-grey-black with a slight sheen, neon green edge-light (#61C54F) 
catching the compressed fold lines creating a precise topographic line map of the deformation, 
pure black background, macro documentary of material behavior, silent and precise
```

**Parâmetros Midjourney:** `--ar 1:1 --style raw --v 6.1 --q 2`

---

### MAT-12 — Flex 85A (Ultra-flexível)
**Dimensões:** 400×400px (1:1)

```
Macro of an ultra-flexible TPU 85A Shore 3D printed spiral coil spring structure 
fully elongated — the natural resting length is 3cm and it's being stretched to 9cm 
visible in the frame, each coil turn stretching into a long oval loop, the matte 
black flexible material showing surface micro-texture under tension, the perfect 
geometric regularity of the coil pitch communicating that this was printed with 
mathematical precision, neon green (#61C54F) backlit from below turning the stretched 
coil into a glowing suspension bridge of rubber, pure black, macro, the coil as 
minimalist industrial sculpture, zero text, zero context
```

**Parâmetros Midjourney:** `--ar 1:1 --style raw --v 6.1 --q 2`

---

### MAT-13 — Resina Standard (SLA)
**Dimensões:** 400×400px (1:1)

```
Macro of fresh liquid photopolymer resin being poured in a slow stream — a thin arc 
of high-gloss amber-golden translucent SLA resin flowing from a tilted container, 
the stream mid-air captured in perfect sharp focus, internal light caustics in the 
liquid stream creating golden-green translucent ribbons as a neon green backlight 
(#61C54F) backlights the stream, surface tension creating a slightly thicker, 
slow-motion droplet at the bottom of the stream, pure black background, 
1/2000s freeze motion, the liquid beauty of the raw material before UV curing, 
high-end cosmetics photography quality applied to an industrial material
```

**Parâmetros Midjourney:** `--ar 1:1 --style raw --v 6.1 --q 2`

---

### MAT-14 — Resina ABS-Like (SLA)
**Dimensões:** 400×400px (1:1)

```
Macro of a pair of ultra-precise SLA resin printed micro-mechanical gears — 
two small meshing gears with 0.5mm module teeth engaged in perfect contact, 
the crisp geometry of each tooth flank showing zero layer lines (SLA surface quality), 
the white ABS-like resin surface polished to a smooth matte finish, 
the mechanical engagement point of the two gears highlighted by a neon green 
micro-spot (#61C54F) creating a glowing contact patch as if electricity flows 
between the meshing teeth, pure black background, Zeiss lens macro simulation, 
the gears read as an ode to mechanical precision enabled by additive manufacturing
```

**Parâmetros Midjourney:** `--ar 1:1 --style raw --v 6.1 --q 2`

---

### MAT-15 — Resina Cerâmica (SLA)
**Dimensões:** 400×400px (1:1)

```
Macro of a post-fired ceramic SLA 3D printed specimen — buff-white fired ceramic surface 
with the characteristic slight roughness and crystalline matte surface of sintered ceramic, 
a cross-section showing zero porosity internal structure and the slight orange peel micro-texture 
of the fired surface, extreme geometric precision showing sharp inside corners at 0.3mm radius 
that only 3D printing allows in ceramics, the ceramic piece placed on a pure black polished 
surface with a faint mirror reflection below, single cold overhead key light creating 
the maximum amount of micro-texture information from the ceramic surface, neon green 
edge-light (#61C54F) at 5-degree grazing angle along one edge, scientific ceramics photography
```

**Parâmetros Midjourney:** `--ar 1:1 --style raw --v 6.1 --q 2`

---

### MAT-16 — BASF Ultrafuse 316L (Metal — DESTAQUE)
**Dimensões:** 600×400px (3:2) — este é o material de destaque, formato diferente

```
Epic macro of BASF Ultrafuse 316L metal 3D printing filament — a single strand of the 
filament in a dramatic curved S-shape filling the frame, the filament surface under 
extreme magnification reveals individual stainless steel powder particles (5–20 micron) 
suspended in the polymer matrix binder, visible as dark grey metallic speckles 
distributed throughout the brown-grey strand color, the curve of the filament creates 
a graceful arc against pure black, a neon green precision light (#61C54F) from 
a slit aperture at 3 degrees grazing angle along the filament length creates 
thousands of individual micro-highlights on each metal particle surface turning 
the strand into a glittering constellation of metallic stars, the filament end-face 
in the foreground showing cross-section metal particle distribution, 
pure black background, macro astrophotography meets industrial materials science, 
Sony A7R V + 180mm macro + extension tubes, this is the hero material of the page
```

**Parâmetros Midjourney:** `--ar 3:2 --style raw --v 6.1 --q 2`

---

## BLOCO 6 — SOBRE / INSTITUCIONAL

### SOBRE-01 — Localização Parque Tecnológico Damha II
**Slot:** `sobre.astro` — seção localização, altura ~320px  
**Dimensões:** 800×320px (2.5:1)

```
Aerial drone photography at golden hour of Parque Tecnológico Damha II in São Carlos, 
São Paulo, Brazil — a modern technology park with clean architectural lines, 
wide pedestrian avenues lined with native Cerrado trees, low-rise contemporary buildings 
with large glass facades, green landscaping between buildings, the distant São Carlos 
skyline and rural landscape visible at the horizon under a dramatic gradient sky 
transitioning from deep orange at the horizon to dark blue-grey overhead, 
the image is cinematic-graded with a cold blue-teal color grade applied (desaturating 
the warm sunset tones) to match the site's dark aesthetic, neon green precision grid 
overlay (#61C54F) at 2% opacity suggesting a GPS coordinate grid mapping the location, 
a subtle pulsing green location pin floating above one specific building (no text), 
drone shot, Sony A7R IV + wide angle, cinematic aerial editorial quality, 
the goal is to convey São Carlos as a precision technology hub, not a casual city
```

**Parâmetros Midjourney:** `--ar 5:2 --style raw --v 6.1 --q 2`

---

### SOBRE-02 — Equipe / Workshop (Atmosfera)
**Slot:** Possível uso em seção sobre ou blog  
**Dimensões:** 1200×675px (16:9)

```
Atmospheric wide-angle interior photography of a modern 3D printing workshop at night — 
multiple industrial FDM and SLS 3D printers visible in the background through a 
glass partition, their chamber LEDs creating a constellation of blue-white points 
of light in the dark, a single focused work area in the foreground with a stainless 
steel table, a complex multi-material 3D printed component under examination by 
calipers (no hands visible — just the calipers in contact), neon green status 
indicator LEDs on printer panels reflecting off the polished floor creating 
long green light trails in the reflection, deep atmospheric shadows between machines, 
the industrial equipment reads as precision instruments rather than workshop tools, 
FUJIFILM GFX 100S + 23mm wide angle simulation, cinematic documentary photography, 
no visible humans, the machines are the protagonists
```

**Parâmetros Midjourney:** `--ar 16:9 --style raw --v 6.1 --q 2`

---

## BLOCO 7 — BLOG / CONTEÚDO

### BLOG-COVER-01 — Post sobre Impressão 3D Industrial
**Slot:** Post destaque / featured post  
**Dimensões:** 800×450px (16:9)

```
Cinematic still-life editorial of multiple 3D printed components arranged in a 
precise geometric composition on a pure black surface — different materials: 
metal, nylon, transparent PC, flexible TPU all represented by one component each, 
arranged in a diagonal line composition from bottom-left to upper-right with 
increasing complexity, dramatic raking sidelight from the right (cold white LED strip) 
creating long precise shadows pointing left, neon green fine-line separator (#61C54F) 
running diagonally under the composition, all parts in sharp focus f/11, 
cinematic color grade — each material retaining its characteristic color (silver metal, 
ivory nylon, clear PC, grey TPU) but all slightly desaturated toward a unified 
industrial grey palette with green accents, magazine editorial cover quality, 
no text space reservation, full bleed composition
```

**Parâmetros Midjourney:** `--ar 16:9 --style raw --v 6.1 --q 2`

---

### BLOG-COVER-02 — Post sobre Materiais
**Slot:** Blog grid — segundo post em destaque  
**Dimensões:** 600×400px (3:2)

```
Abstract macro of 3D printing filament spools viewed from directly above — 
5 to 7 spools arranged in a tight cluster filling the entire frame when viewed top-down, 
each spool a different material/color (matte black, transparent, white, grey, blue), 
the circular winding pattern of each spool creating a hypnotic concentric pattern, 
the central holes of spools creating dark voids in the composition, 
neon green (#61C54F) laser dot from above projected onto the central void 
of the center spool creating a green bullseye target, pure black gaps between spools, 
geometric abstract composition, drone-like overhead industrial shot, 
creative product photography, the spools as abstract art, no labels or brand names visible
```

**Parâmetros Midjourney:** `--ar 3:2 --style raw --v 6.1 --q 2`

---

### BLOG-COVER-03 — Post sobre Tecnologia
**Slot:** Blog grid — terceiro post  
**Dimensões:** 600×400px (3:2)

```
Abstract macro close-up of G-code toolpath visualization made physical — 
a top layer of a partially printed FDM object mid-print, the nozzle toolpath visible 
as parallel infill lines of melted plastic at exactly 0.4mm width creating a 
mathematical wave pattern across the build surface, each infill line slightly different 
height due to temperature variation, the pattern reads as topographic contour lines 
or fingerprint-like ridges under extreme macro, neon green UV light source (#61C54F) 
illuminating the fresh extrusion from directly above turning each plastic bead into 
a green-tinted strand against the dark build plate background, abstract mathematical 
beauty in the industrial process, macro astrophotography of a printed surface, 
pure black build plate background, the layer as an aerial view of a vast landscape
```

**Parâmetros Midjourney:** `--ar 3:2 --style raw --v 6.1 --q 2`

---

## BLOCO 8 — VÍDEOS (Loop Backgrounds)

### VID-01 — Hero Video Loop
**Slot:** Substituição do hero estático por vídeo loop (opção futura)  
**Duração:** 8–12 segundos loop seamless  
**Dimensões:** 1920×1080px (16:9), 4K preferencial

```
PROMPT DE VÍDEO / RUNWAY / KLING:

Time-lapse macro of a selective laser sintering build — viewing from above through 
protective glass, the powder recoater blade sweeping from left to right every 3 seconds 
depositing a fresh layer of stainless steel powder, then the laser scanner rapidly 
tracing the cross-section in a fast neon green line constellation pattern, 
each laser pass fusing the metal with micro-sparks, the build plate slowly descending 
0.1mm per layer, new powder deposited, cycle repeats — 8 second loop representing 
approximately 15 layer cycles, cinematic time-lapse with cold industrial color grade, 
neon green laser as the only color accent in an otherwise black-and-grey scene, 
seamless loop with final frame matching first frame exactly, no camera movement 
(locked-off overhead shot), hypnotic industrial rhythm
```

**Ferramenta:** Runway Gen-3, Kling 2.0, ou Sora  
**Duração alvo:** 8s loop seamless  
**Parâmetros:** `--motion: minimal, --style: photorealistic, --loop: seamless`

---

### VID-02 — Seção Capacidades — Transição
**Slot:** Background animado para seção capacidades (opcional)  
**Duração:** 6 segundos loop

```
PROMPT DE VÍDEO:

Ultra-slow-motion (8000fps playback speed) macro of the exact moment a 3D printer nozzle 
deposits a single bead of molten polymer onto a build surface — the material emerging 
from the brass nozzle orifice as a perfectly smooth continuous strand, slight 
material-string connecting nozzle to strand for one frame before cleanly separating, 
the fresh material still glowing slightly orange from heat before cooling to grey 
in real-time during the shot, ambient neon green chamber light (#61C54F) reflecting 
off the glossy fresh-extrusion surface, pure black background, 6-second seamless loop 
(begins and ends at same nozzle position), slow-motion industrial beauty, 
Phantom camera simulation, zero camera motion
```

---

## ÍNDICE DE SLOTS E ARQUIVOS

| Slot | Arquivo sugerido | Dimensão | Bloco |
|------|-----------------|----------|-------|
| Hero homepage | `hero-sintering.webp` | 1920×1080 | 1 |
| Capacidade 01 | `cap-prototipagem.webp` | 600×600 | 2 |
| Capacidade 02 | `cap-metal.webp` | 600×600 | 2 |
| Capacidade 03 | `cap-engenharia-reversa.webp` | 600×600 | 2 |
| Capacidade 04 | `cap-sob-demanda.webp` | 600×600 | 2 |
| Tecnologia SLS | `tech-sls.webp` | 800×533 | 3 |
| Tecnologia SLA | `tech-sla.webp` | 600×400 | 3 |
| Tecnologia FDM | `tech-fdm.webp` | 600×400 | 3 |
| Portfolio 01–12 | `portfolio-01.webp` … `portfolio-12.webp` | 600×450 | 4 |
| Material Nylon PA12 | `mat-nylon-pa12.webp` | 400×400 | 5 |
| Material ABS | `mat-abs.webp` | 400×400 | 5 |
| Material PC | `mat-pc.webp` | 400×400 | 5 |
| Material PETG | `mat-petg.webp` | 400×400 | 5 |
| Material PP | `mat-pp.webp` | 400×400 | 5 |
| Material TPU | `mat-tpu.webp` | 400×400 | 5 |
| Material PA CF15 | `mat-pa-cf15.webp` | 400×400 | 5 |
| Material Tritan HT | `mat-tritan-ht.webp` | 400×400 | 5 |
| Material PEEK | `mat-peek.webp` | 400×400 | 5 |
| Material PC Industrial | `mat-pc-industrial.webp` | 400×400 | 5 |
| Material TPU 95A | `mat-tpu-95a.webp` | 400×400 | 5 |
| Material Flex 85A | `mat-flex-85a.webp` | 400×400 | 5 |
| Material Resina Standard | `mat-resina-std.webp` | 400×400 | 5 |
| Material Resina ABS-Like | `mat-resina-abs.webp` | 400×400 | 5 |
| Material Resina Cerâmica | `mat-resina-ceramica.webp` | 400×400 | 5 |
| Material Ultrafuse 316L | `mat-316l.webp` | 600×400 | 5 |
| Localização Damha II | `sobre-localizacao.webp` | 800×320 | 6 |
| Workshop atmosfera | `sobre-workshop.webp` | 1200×675 | 6 |
| Blog cover 01 | `blog-cover-componentes.webp` | 800×450 | 7 |
| Blog cover 02 | `blog-cover-materiais.webp` | 600×400 | 7 |
| Blog cover 03 | `blog-cover-tecnologia.webp` | 600×400 | 7 |
| Hero video loop | `hero-loop.mp4` | 1920×1080 | 8 |

**Total de assets:** 38 imagens + 2 vídeos = **40 ativos visuais**

---

## GUIA RÁPIDO DE APLICAÇÃO

### Para Midjourney
Cole o prompt diretamente, adicione `--ar`, `--style raw`, `--v 6.1`, `--q 2` no final.  
Para variações de composição adicione `--chaos 15`.

### Para DALL-E 3 (via ChatGPT)
Prefixe com: *"Photorealistic, cinematic industrial macro photography:"* antes do prompt.  
Remova os parâmetros `--ar` e `--v` (DALL-E não usa esses parâmetros).

### Para Stable Diffusion (SDXL / Flux)
Use como positive prompt. Adicione o negative prompt separado no campo correto.  
Modelo recomendado: **Flux.1 Pro** ou **SDXL Turbo** com LoRA de fotografia macro industrial.

### Para Highfield (Hailuo / sua conta)
Cole o prompt completo no campo de texto. Ajuste o aspect ratio conforme a tabela acima.  
Rerun da geração 2–3 vezes e selecione a que melhor captura a iluminação neon verde.

### Critérios de Aprovação (Quality Gate)
Antes de aceitar uma imagem gerada, verifique:
- [ ] Fundo é preto absoluto ou charcoal muito escuro (sem cinza médio)
- [ ] Verde neon presente como acento, não como cor dominante
- [ ] Sem texto visível na imagem
- [ ] Sem mãos humanas (exceto MAT-06 TPU, onde é intencional)
- [ ] A iluminação tem caráter industrial/laboratorial, não fotografia de produto genérica
- [ ] Detalhe de engenharia é visível e reconhecível (não abstrato demais)
- [ ] A imagem funcionaria como background com texto branco por cima

---

*Documento criado em 2 de maio de 2026 — AUMAF 3D — Kayo Ridolfi / kayoridolfi.ai*
