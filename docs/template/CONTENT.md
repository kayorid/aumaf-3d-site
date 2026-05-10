# Content — Páginas e estratégia de copy

Este documento explica o que cada página entrega, o que ela lê do `templateConfig` automaticamente e o que precisa ser editado manualmente.

---

## Mapa rápido

| Página | Status | Lê do config | Precisa editar? |
|---|---|---|---|
| `/` (index) | 🟡 Scaffold | title, description, nome, NAP | Copy do hero, value props, seções (sim) |
| `/contato` | 🟢 Pronta | TODO contato/endereço/WhatsApp | Apenas `projectTypes` (lista) |
| `/blog`, `/blog/[slug]` | 🟢 Pronta | tudo | Não — conteúdo vem do CMS |
| `/portfolio`, `/portfolio/[slug]` | 🟡 Scaffold | parcial | Cases (sim) |
| `/servicos` | 🟡 Scaffold | NAP no rodapé | Toda a copy |
| `/materiais` | 🟡 Scaffold | NAP | Toda a copy (era específica de impressão 3D) |
| `/sobre` | 🟡 Scaffold | NAP, founded | Toda a copy |
| `/faq` | 🟡 Scaffold | nome | Perguntas (sim) |
| `/avaliacoes` | 🟢 Pronta | reviews via Featurable | Configurar `PUBLIC_FEATURABLE_WIDGET_ID` |
| `/404` | 🟢 Pronta | nome | Não |

**Legenda:**

- 🟢 **Pronta** — funciona out-of-the-box assim que `templateConfig` e variáveis de ambiente estão preenchidos.
- 🟡 **Scaffold** — estrutura visual está pronta, mas a copy é demo (do setor original AUMAF 3D). Substitua. Cada uma tem o banner `TEMPLATE DEMO PAGE` no frontmatter.

---

## Páginas genéricas (não exigem edição)

### `/blog` e `/blog/[slug]`

Listagem e detalhe de posts, totalmente dirigidos pelo CMS (admin). Suporta:

- Featured post
- Paginação
- Renderização Markdown + GFM
- WYSIWYG blocks customizados (BlockPreview)
- Schema BlogPosting + breadcrumbs
- SEO completo (meta, OG, canonical)

Para popular, use o admin (`/admin/posts/new`) ou o gerador de IA.

### `/contato`

Form de captação de leads. Lê e exibe automaticamente:

- Endereço de `templateConfig.address`
- WhatsApp + telefone display de `templateConfig.contact`
- E-mail de `templateConfig.contact.email`
- Horário de funcionamento de `templateConfig.hours`

A lista `projectTypes` (Prototipagem, Peça Funcional, etc.) é específica do setor — edite no `.astro` se quiser outras opções.

### `/avaliacoes`

Reviews do Google via API Featurable. Configure em `frontend-public/.env`:

```env
PUBLIC_FEATURABLE_WIDGET_ID=<seu_widget_id>
```

Sem essa env var, a página renderiza um fallback informativo.

### `/404`

Genérica. Lê `templateConfig.name` para a mensagem.

---

## Páginas scaffold (precisam de edição)

### `/` (index)

Página mais longa do template (~1300 linhas). Estrutura:

1. Hero (2 colunas: copy + painel de mídia)
2. Strip de KPIs ("Active Build", "Active Components", etc.)
3. Logos cinematic
4. "Por que [nome]" — bloco diferenciais
5. Personas — para quem a marca resolve
6. Carrossel infinito de reviews
7. Blog teaser
8. CTA final

**Lê do config:** `templateConfig.seo.defaultTitle`, `seo.defaultDescription`.

**Precisa editar:** todo o resto. Cuidado especial:

- Linhas 140-145 (`hero-bg-hexmesh.webp`) — substitua imagem do hero
- Linhas 666-705 ("Por que AUMAF 3D") — reescreva
- Linhas 706-980 (Personas) — reescreva
- Linhas 1060-1080 (Quotes) — substitua

### `/servicos`

Apresentação dos serviços/produtos. Estrutura cinematográfica zigzag.

**Substitua:** títulos H2, descrições, ícones, ordem das seções.

### `/materiais`

Catálogo de materiais (era impressão 3D). **Considere excluir** se não fizer sentido pra sua marca — basta remover o link de `templateConfig.navigation.primary`.

### `/portfolio` e `/portfolio/[slug]`

Lista de cases + detalhe individual. O array de cases vive em `frontend-public/src/data/portfolio.ts` — edite lá.

### `/sobre`

História da empresa, equipe, números. Frontmatter já lê algumas coisas do `COMPANY` (founded, descrição). Substitua o texto narrativo.

### `/faq`

Perguntas frequentes. Substitua o array `faqs` por perguntas da sua marca. Schema FAQPage é gerado automaticamente.

---

## Estratégia recomendada

1. **Comece pelas pages 🟢 prontas** — `/blog`, `/contato`, `/avaliacoes`, `/404` funcionam imediatamente. Bom para validar configuração visual antes de investir em copy.
2. **Depois `/` (home)** — gere/escreva o hero, value props e seções. É a página de maior tráfego e ROI.
3. **Depois `/sobre` e `/contato`** — completam a "trinca institucional".
4. **`/servicos` e `/portfolio`** — se a marca tem produto/serviço a vender, são imprescindíveis.
5. **`/faq`** — pode esperar; alimente conforme dúvidas chegam dos leads.
6. **`/materiais`** — provavelmente remover, a menos que sua marca opere com catálogo de materiais.

---

## Gerador de IA do admin

O backoffice tem um gerador de posts via IA multi-provedor (OpenAI, Anthropic, Google). O system prompt usa automaticamente `templateConfig.name`, `industries`, `address.addressLocality`, etc. — então **gera posts no contexto da sua marca sem você precisar configurar nada extra**.

Configure as chaves em `/admin/settings`.
