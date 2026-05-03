# AUMAF 3D — Prompts para Geração de Vídeos

**Estilo visual:** Cinematic Additive Manufacturing — tech-dark, industrial, preciso  
**Duração ideal por slot:** 8–20s em loop  
**Formato:** MP4 H.264, WebM como fallback  
**Resolução:** 1920×1080px mínimo (1080p), 3840×2160px ideal (4K)  
**FPS:** 24fps (cinematográfico) ou 30fps  
**Áudio:** Mudo (autoplay loop)  
**Cor dominante:** Pretos profundos, verde #61c54f como acento

---

## Prompt Base para Geração com Sora / Kling / Runway

```
Cinematic industrial 3D printing process, dark studio environment, 
dramatic rim lighting with subtle green (#61c54f) accent, 
ultra-slow motion or real-time, hyperrealistic, 8K quality,
no text overlays, no watermarks, seamless loop
```

---

## VIDEO_HERO — Showreel Principal

**Slot:** `src="/videos/hero-printing.mp4"`  
**Aspecto:** 16:9  
**Posição:** Hero section, painel direito  
**Duração:** 15–20s loop

### Prompt Sora/Kling/Runway:
```
Cinematic close-up of an industrial FDM 3D printer head moving across a dark platform,
laying carbon fiber reinforced nylon filament in precise layers, green LED accent lights 
illuminate the printing nozzle and extruded material, dark studio background,
slow motion capture at 240fps played back at 24fps, hyperrealistic detail on layer 
deposition, steam/heat distortion visible near nozzle, deep focus, anamorphic lens flare,
20 second seamless loop
```

### Prompt Alternativo (cenas rápidas editadas):
```
Sequence: 1) FDM printer head extreme close-up, 2) SLA laser hitting resin pool with ripples,
3) finished metal part emerging from support removal, 4) quality measurement with calipers,
each scene 3-4 seconds, dark aesthetic, green accent glow, cinematic color grade
```

### Gravação Real (instruções para AUMAF 3D):
- Impressora: câmera a 5–10cm do bico em movimento
- Configuração: LED verde atrás da impressora, fundo preto
- Câmera: 120fps para slow motion suave
- Edição: Color grade escuro, realce no verde, levemente desaturado exceto verde

---

## VIDEO_CAP_01 — Prototipagem Rápida

**Slot:** `src="/videos/prototipagem.mp4"`  
**Aspecto:** 1:1 (square)

```
Time-lapse of rapid prototyping: FDM 3D printer building a complex geometric prototype part 
from scratch to completion, dark studio, green LED accent on printer, 
total print time compressed to 8 seconds, prototype reveals complex internal geometry,
layer-by-layer construction visible, cinematic dark aesthetic
```

### Gravação Real:
- Timelapse da impressora FDM construindo uma peça em ~1h
- 1 frame a cada 5–10 segundos
- Resultado: ~8–15s de vídeo fluido
- Enquadramento quadrado, fundo preto, LED verde atrás

---

## VIDEO_CAP_02 — Peças Funcionais & Metal

**Slot:** `src="/videos/metal-parts.mp4"`  
**Aspecto:** 1:1

```
Close-up rotating view of a stainless steel 316L 3D printed industrial connector or flange,
rotating on a dark turntable, studio rim lighting creating metallic reflections,
subtle green accent light, hyperrealistic metal surface quality visible,
6-second seamless rotation loop, photographic quality
```

### Gravação Real:
- Mesa giratória motorizada com peça metálica
- LED ring light + verde como acento lateral
- Fundo preto
- Peças ideais: flange, conector, suporte estrutural em 316L

---

## VIDEO_CAP_03 — Modelagem & Engenharia Reversa

**Slot:** `src="/videos/reverse-engineering.mp4"`  
**Aspecto:** 1:1

```
3D laser scanner capturing mechanical part geometry, structured light patterns project 
onto dark metallic surface, green point cloud visualization builds in real-time,
dark studio environment, technical aesthetic, professional engineering equipment,
10-second seamless sequence showing: scan setup → point cloud generation → 3D model wireframe
```

### Gravação Real:
- Gravar o scanner 3D capturando uma peça complexa
- Incluir tela do computador mostrando a nuvem de pontos emergindo
- Corte: scanner → tela com modelo → renderização final

---

## VIDEO_CAP_04 — Peças Sob Demanda

**Slot:** `src="/videos/on-demand.mp4"`  
**Aspecto:** 1:1

```
Split screen or reveal: worn/corroded industrial machine part on left transforms/morphs 
into perfect 3D printed replacement on right, dramatic studio lighting, 
dark background, green accent glow on new part highlighting its precision,
8-second reveal sequence
```

---

## VIDEO_SLS — Laser Sinterizando

**Slot:** `src="/videos/sls-laser.mp4"`  
**Aspecto:** 16:9 ou 3:2

```
Extreme close-up of SLS laser sintering process: focused laser beam scanning across nylon 
powder bed surface, micro-fusion happening in real-time, green/white laser light trail,
smoke tendrils from sintering, dark environment with only laser illumination,
ultra-slow motion 240fps playback at 24fps, hyperrealistic powder texture,
seamless 10-second loop
```

### Gravação Real:
- Câmera dentro da câmara de impressão SLS (se acesso permitido)
- Ou close-up externo da janela da câmara
- Alta velocidade (120-240fps) para slow motion do processo

---

## Notas Técnicas de Produção

### Codec e Compressão:
```
MP4: H.264 (compatibilidade universal), CRF 23, preset slow
WebM: VP9 (para Chrome/Firefox), quality 33
Fallback: poster JPG para navegadores sem suporte
```

### Implementação no Astro:
```html
<video
  class="absolute inset-0 w-full h-full object-cover"
  autoplay
  loop
  muted
  playsinline
  poster="/images/video-poster.jpg"
>
  <source src="/videos/hero-printing.webm" type="video/webm" />
  <source src="/videos/hero-printing.mp4" type="video/mp4" />
</video>
```

### Tamanho máximo recomendado:
- Hero (16:9, 15s): ≤ 8MB MP4 / ≤ 5MB WebM
- Cards quadrados (8s): ≤ 4MB MP4 / ≤ 2.5MB WebM
- Usar `loading="lazy"` via Intersection Observer para não carregar fora da viewport

### Ferramentas de IA para geração:
- **Sora** (OpenAI) — melhor qualidade cinematográfica
- **Kling AI** (Kuaishou) — bom para industrial/realista
- **Runway Gen-3 Alpha** — bom para motion design
- **Luma Dream Machine** — bom para objetos 3D em rotação
- **Pika 2.0** — bom para sequências curtas

### Workflow recomendado:
1. Gerar com IA (Sora/Kling) como draft
2. Complementar com gravação real dos equipamentos AUMAF
3. Editar no DaVinci Resolve com LUT dark/industrial
4. Exportar em 2 formatos (MP4 + WebM)
5. Gerar poster JPG do frame mais impactante

---

## Checklist de Slots a Preencher (por prioridade)

| Prioridade | Slot | Seção | Status |
|---|---|---|---|
| 1 | VIDEO_HERO | Hero | ⏳ Pendente |
| 2 | VIDEO_SLS | Tecnologias | ⏳ Pendente |
| 3 | VIDEO_CAP_01 | Prototipagem | ⏳ Pendente |
| 4 | VIDEO_CAP_02 | Metal | ⏳ Pendente |
| 5 | VIDEO_CAP_03 | Modelagem | ⏳ Pendente |
| 6 | VIDEO_CAP_04 | Reposição | ⏳ Pendente |
