# Análise de Referência — coffee-tech.com
> Capturado via Playwright em 2026-05-02 | 15 páginas analisadas

## Sistema de Alternância Dark / Light

O ritmo visual do site é construído pela alternância entre dois modos de seção:

| Modo | Hex | Usado em |
|---|---|---|
| **Dark** | `#0D0E13` | Hero, navbar, technology features, footer |
| **Cream/Light** | `#F3EDE3` / `#E5E2DD` | Catálogo, blog, FAQ, editorial, contato inferior |

---

## Navbar
- Logo (texto + ícone) à esquerda
- Links de navegação no centro
- Dois botões à direita: CTA principal (pill com fill acento) + secundário (outline)
- Fundo transparente com transição dark↔light conforme seção em scroll
- Sem hamburguer no desktop

---

## Hero de Produto (template mais forte)
- Fundo: preto absoluto `#0D0E13`
- Produto 3D renderizado centralizado, nítido — produtos vizinhos desfocados nos extremos (blur)
- Nome em **Inter display gigante** (~120-140px, weight 600) na cor do acento
- Tags de spec acima do título: pills outline arredondados em uppercase pequeno (ex: `2·4KG` `COFFEE ROASTER` `ELECTRIC`)
- Navegação lateral: setas ←/→ em círculo outline absoluto nas bordas
- CTA "Request a Quote" no nav como botão de destaque

---

## Hero Institucional (About, Technology)
- Fundo: escuro com foto/render em baixa opacidade atrás
- Headline bold grande alinhada à **esquerda** (não centralizada)
- Layout assimétrico: headline ocupa 60% da largura, corpo à direita em coluna estreita
- Corpo em duas colunas: esquerda = headline, direita = parágrafo

---

## Seções de Features (Technology)
- Fundo: **preto absoluto** do início ao fim da página
- Produtos 3D flutuando em zigue-zague (alternado esquerda/direita)
- Numeração `[01]` `[02]` em texto pequeno cinza como único elemento de hierarquia
- Zero cards, zero boxes — produto flutua sobre vazio
- Espaço negativo generoso — cada item ocupa quase altura de viewport

---

## Seções Editoriais (Efficiency, Sustainability)
- Fundo: creme claro `#E5E2DD`
- Título em marquee horizontal: "Efficiency / Efficiency /"
- Fotos reais em cards com bordas arredondadas
- Layout alternado: foto direita + número+texto esquerda, depois invertido
- Sem bordas explícitas em cards — apenas a foto com border-radius

---

## Catálogo de Produtos
- Fundo: bege claro
- Título "Products" centralizado, display bold
- Filtros como tabs: All / Specialty / Commercial / Industrial / Cocoa & Nuts / Accessories
- Grid 3 colunas, muito espaço entre itens
- Cards sem borda — produto sobre fundo bege, nome em bold abaixo, tags em pills

---

## Blog (listagem)
- Fundo: bege claro
- Título "From our blog" centralizado display
- Grid 3 colunas, fotos full-bleed com border-radius
- Categoria + título abaixo da foto

---

## Post de Blog
- Fundo: bege claro do início ao fim
- Título display gigante, alinhado à esquerda
- Foto hero full-width com border-radius
- Corpo em coluna estreita centralizada — muito espaço lateral
- Posts relacionados no rodapé em grid 3 dark

---

## Contato
- Seção superior: hero dark — headline bold esquerda + formulário à direita
- Inputs com apenas linha inferior (underline style, sem box)
- Seção inferior: bege — suporte técnico + "Open a ticket"

---

## FAQ
- Fundo: bege claro
- Headline display: "You asked, we answered" centralizado
- Pills de categoria: "Products & Service" | "Shipping & Delivery"
- Accordion: linha separadora simples + `+` à direita — sem shadow, sem box

---

## Footer
- Fundo: `#0D0E13`
- Ícone do logo grande à esquerda (sem texto)
- Endereço compacto ao centro
- Botão "voltar ao topo" (↑ em círculo outline) à direita
- Copyright mínimo no rodapé inferior

---

## Micro-padrões de UI

| Elemento | Padrão |
|---|---|
| Pills/tags | Border-radius 100px, outline fino, uppercase, texto muito pequeno |
| Numeração de steps | `[01]` em cinza claro ao lado do conteúdo |
| Setas de produto | Círculo outline, ícone ← → dentro |
| Botão CTA | Fill sólido com cor de acento |
| Botão secundário | Outline, mesmo border-radius |
| Inputs | Underline apenas, sem box |
| Accordion | Linha separadora + `+` outline |
| Espaçamento | Muito espaço negativo — não comprimir conteúdo |

---

## Tipografia
- **Fonte:** Inter (única, Google Fonts)
- **Weights usados:** 450, 500, 600 predominantes
- **Display:** weight 600–800, 80–140px
- **Subtítulos:** 24–38px, weight 500–600
- **Body:** 14–18px, weight 400–450
- **Efeito marquee** no título de seções de features

---

## Paleta Real (CSS vars extraídas)
```css
--dark-blue:        #0D0E13   /* background principal */
--orange:           #C8603D   /* acento (NÃO usar para AUMAF) */
--grey-beige:       #67625E   /* texto secundário */
--product-bg:       #DCD8D3   /* fundo cards de produto */
--creme:            #F3EDE3   /* seções light */
--beige:            #E5E2DD   /* seções light variação */
--creme-light:      #FBF8F3   /* quase branco quente */
```

**Nota:** As cores quentes/bege serão substituídas pela paleta própria da AUMAF 3D.
