---
name: Cinematic additive manufacturing
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#becab6'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#899482'
  outline-variant: '#3f4a3b'
  surface-tint: '#78dd64'
  primary: '#7ce268'
  on-primary: '#013a00'
  primary-container: '#61c54f'
  on-primary-container: '#014e00'
  inverse-primary: '#016e00'
  secondary: '#c6c6c6'
  on-secondary: '#303030'
  secondary-container: '#474747'
  on-secondary-container: '#b5b5b5'
  tertiary: '#cdcaca'
  on-tertiary: '#313030'
  tertiary-container: '#b1afaf'
  on-tertiary-container: '#434242'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#93fa7d'
  primary-fixed-dim: '#78dd64'
  on-primary-fixed: '#002200'
  on-primary-fixed-variant: '#015300'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-xl:
    fontFamily: Space Grotesk
    fontSize: 72px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '300'
    lineHeight: '1.6'
    letterSpacing: 0em
  body-md:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.2em
  code-data:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: 0.05em
spacing:
  unit: 4px
  gutter: 24px
  margin: 64px
  section-gap: 160px
---

## Brand & Style
The design system is engineered to evoke the atmosphere of a high-end industrial laboratory or a futuristic command center. It centers on the intersection of physical precision and digital intelligence. The personality is uncompromisingly premium, catering to engineers and visionaries who view 3D printing not as a hobby, but as the future of manufacturing.

The aesthetic combines **Glassmorphism** and **Cinematic High-Contrast** styles. It moves beyond standard boxy layouts by utilizing non-linear arrangements, asymmetrical grids, and depth achieved through layered transparency. Visuals are anchored by the tension between absolute black voids and hyper-sharp, glowing data points.

## Colors
This design system utilizes a "Void-and-Vapor" palette. The foundation is **Pure Black (#000000)**, ensuring maximum contrast and a cinematic depth that makes the screen feel like an infinite space. 

**Vibrant Green (#61C54F)** is reserved strictly for interactive elements, status indicators, and data-driven accents. It should never be used for large surfaces, but rather as a light source (glows, thin strokes, and lasers). Deep charcoal tones are used to define subtle boundaries within the black space, creating a sense of sophisticated machinery.

## Typography
The typography strategy leverages the technical DNA of **Space Grotesk**. To achieve a high-tech look, the system uses extreme variations in letter spacing and weight:
- **Displays:** Ultra-bold and tight tracking for high-impact industrial headlines.
- **Labels:** Wide-tracked, uppercase bold weights to mimic technical specifications and schematics.
- **Body:** Light weights for a sophisticated, airy feel that balances the heavy imagery.
- **Accents:** Mixes of weights within a single line are encouraged to highlight specific variables or data points.

## Layout & Spacing
The layout follows a **Cinematic Grid** model. While rooted in a 12-column system, it encourages non-linear placement where elements may bleed off-edge or overlap. 

- **Full-Bleed Imagery:** High-contrast macro shots of 3D textures should occupy entire sections, often acting as the background for glassmorphic cards.
- **Asymmetry:** Data modules are often offset to one side, leaving "negative void" on the other to create a sense of vastness.
- **Rhythm:** Wide margins (64px+) are essential to maintain a premium, editorial feel. Large vertical gaps between sections (160px) give the machinery "room to breathe."

## Elevation & Depth
Depth in this design system is not achieved through shadows, but through **Optical Layering**.

1.  **Level 0 (The Void):** Pure #000000 background.
2.  **Level 1 (Macro Base):** Full-bleed textures or subtle charcoal gradients (#0A0A0A).
3.  **Level 2 (The Glass):** Semi-transparent surfaces with high backdrop-blur (30px-60px) and a 1px inner stroke in a low-opacity white or green to define the edge.
4.  **Level 3 (The Data):** Floating text and green glowing accents that appear to sit on the surface of the glass or hover just above it.

Glow effects (outer glows) should be applied to primary buttons and active status pips to simulate light emission in a dark environment.

## Shapes
The shape language is **Precision-Geometric**. Sharp corners (0px) are the default for all major structural elements, containers, and buttons to reinforce the industrial, high-tech nature of additive manufacturing. 

Subtle 45-degree chamfers may be used on card corners or button edges to mimic CNC-machined parts. Circles are used exclusively for data points, status pips, and progress indicators to contrast against the rigid rectangular grid.

## Components
- **Buttons:** Sharp-edged. Primary buttons feature a solid #61C54F background with black text and a soft green outer glow. Secondary buttons are "Ghost" style with a 1px green border and wide-tracked uppercase text.
- **Glass Cards:** High-blur containers with a 1px top-left highlight stroke to simulate a light source reflecting off a glass panel.
- **Input Fields:** Minimalist under-lines rather than boxes. On focus, the line glows #61C54F and displays a technical coordinate (e.g., "LOC_01") in the corner.
- **Data Visualizations:** Use thin, 1px lines for charts. Avoid filled areas; use gradients or "scanning" line animations to fill space.
- **Status Indicators:** Pulsing green pips for "Active/Printing" and static charcoal pips for "Standby."
- **Imagery Containers:** Always high-contrast. Macro shots of filament layers or laser-sintering metal powder should be treated with a slight vignette to blend into the pure black background.