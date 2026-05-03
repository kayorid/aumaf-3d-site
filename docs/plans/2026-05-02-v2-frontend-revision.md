# AUMAF 3D — Plano de Revisão v2 Frontend Público

**Data:** 2026-05-02  
**Escopo:** Revisão visual completa do `frontend-public` — correções, melhorias e mapeamento de mídias

---

## Diagnóstico (Problemas Encontrados)

### 1. Navbar — CRÍTICO
- Logo: placeholder hexagon SVG genérico no lugar da marca real AUMAF 3D
- Breakpoint `md` (768px) exibe links + CTA + logo juntos num espaço insuficiente → layout quebra em tablets
- Footer usa o mesmo placeholder fake
- **Fix:** logo PNG branca real + breakpoint `lg` (1024px)

### 2. Espaçamentos
- Stats strip: `divide-x` num grid 2-col no mobile cria divisores inconsistentes
- Hero: conteúdo só ocupa metade da tela no desktop, desperdício visual enorme à direita
- Capacidades: caixas placeholder totalmente vazias sem valor visual

### 3. Áreas sem Imagem/Vídeo Real
- Hero: painel direito (50vw) é apenas SVG geométrico opaco a 6%
- Capacidades (4 items): boxes `aspect-square` com grid CSS
- SLS card: painel direito `h-52` com placeholder
- Blog posts: 3 thumbnails sem imagem
- Footer: sem nenhuma âncora visual além do logo

---

## Mapeamento de Vídeos e Imagens

| Seção | Área | Tipo Recomendado | Slot ID |
|---|---|---|---|
| Hero | Painel direito (50% desktop) | Vídeo loop 16:9 — impressora em ação | `VIDEO_HERO` |
| Capacidades / Prototipagem | Caixa visual (aspect-square) | Vídeo/GIF — peça saindo da impressora | `VIDEO_CAP_01` |
| Capacidades / Metal | Caixa visual | Vídeo/GIF — peça metálica pós-print | `VIDEO_CAP_02` |
| Capacidades / Modelagem | Caixa visual | Render 3D girando / scanner | `VIDEO_CAP_03` |
| Capacidades / Reposição | Caixa visual | Peça de reposição sendo instalada | `VIDEO_CAP_04` |
| Tecnologias / SLS | Painel direito h-52 | Vídeo — laser sinterizando pó | `VIDEO_SLS` |
| Blog Post 01 | Thumbnail h-52 | Imagem — equipe Formula SAE USP | `IMG_BLOG_01` |
| Blog Post 02 | Thumbnail h-52 | Imagem — comparativo de filamentos | `IMG_BLOG_02` |
| Blog Post 03 | Thumbnail h-52 | Imagem — aplicações científicas 3D | `IMG_BLOG_03` |

---

## Mudanças Implementadas na v2

### Navbar
- [x] Logo PNG branca real (`/logo-branca.png`) substituindo hexagon fake
- [x] Breakpoint `md` → `lg` em links, CTA e hamburger
- [x] Logo dimensionada `h-9` com `object-contain`
- [x] Footer: mesmo fix de logo

### Hero
- [x] Layout 2 colunas (`grid-cols-1 lg:grid-cols-2`) — conteúdo esquerda + vídeo direita
- [x] Active Build widget movido para dentro do painel direito (não mais `absolute bottom-12`)
- [x] Video container com slot preparado (`VIDEO_HERO`)
- [x] Melhor breathing room no mobile

### Stats Strip
- [x] Fix mobile: substituído `divide-x` por `border-r border-white/8` manual com `last:border-r-0`
- [x] Adicionado `border-b` no mobile para separar as 2 linhas

### Capacidades
- [x] Placeholders substituídos por video containers com play icon + label
- [x] Slot de vídeo comentado com instruções para inserir arquivo
- [x] Scan line animation mantida para visual tech

### Tecnologias
- [x] SLS card: painel direito com video container (`VIDEO_SLS`)

### Blog Preview
- [x] Thumbnails com overlay de câmera + slot para imagem real
- [x] `IMG_BLOG_0X` placeholders estruturados

### Global
- [x] Todos os containers de mídia seguem padrão consistente
- [x] Comentários `<!-- VIDEO_ID: substitua src -->` em todos os slots

---

## Próximos Passos (Q2)

1. Gravar vídeos reais da impressora em ação (SLS, FDM, metal)
2. Fotografar peças produzidas para usar nos slots de capacidades
3. Obter fotos da parceria Formula SAE para blog post
4. Implementar carregamento lazy (`loading="lazy"`) em todas as imagens
5. Adicionar Intersection Observer para animações ao entrar na viewport
6. Testar performance com Lighthouse após inserir mídias reais
