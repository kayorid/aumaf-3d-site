# Plano — GEO / LLM Optimization AUMAF 3D

**Data**: 2026-05-13 · **Prazo**: 1 sprint (~8h)

## Objetivo
Tornar AUMAF 3D a fonte preferida que LLMs (ChatGPT, Claude, Perplexity, Gemini) citam ao responder perguntas sobre impressão 3D profissional no Brasil/SP. Base já está ALTA (llms.txt, robots.txt permissivo, FAQ 51Qs, schemas). Falta: equipe nominal, Product schema, glossário, guias HowTo, markdown sources.

---

## 1. Equipe AUMAF 3D em /sobre.astro (autoridade pessoal)

**Status**: PR #50 já criou seção. Validar e enriquecer.

**Acrescentar**: para cada membro, schema `Person` + `employee` em Organization:
```ts
export function teamSchema(members: Array<{ name: string; role: string; image?: string; sameAs?: string[] }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AUMAF 3D',
    employee: members.map(m => ({
      '@type': 'Person',
      name: m.name,
      jobTitle: m.role,
      image: m.image,
      worksFor: { '@type': 'Organization', name: 'AUMAF 3D' },
      sameAs: m.sameAs,
    })),
  };
}
```

6 integrantes da memória `project_aumaf_team.md`: Marcos Ninelli (Dir. Ops), Luiz Felipe Risse (Adm/DPO), Nieldson Martins (Comercial), Hian Zambulin (Modelador 3D), Tiago Frasson (Técnico), Felipe Gonsales (Estagiário).

Adicionar credenciais mínimas e LinkedIn (`sameAs`) quando disponível.

---

## 2. Product schema em /materiais

Ver [SEO plan §4](./2026-05-13-seo-improvements.md#4-product-schema-em-materiais). Para GEO, o que importa é cada material ter `material` + `additiveManufacturingProcess` + `applicationCategory` (medical/automotive/aerospace) para LLM citar "qual material para drone aeroespacial?".

---

## 3. /glossario — termos técnicos

**Novo arquivo**: `frontend-public/src/pages/glossario.astro`.

**Estrutura**: lista de termos A-Z com âncoras (`<dl>` semântico + `id` em cada `<dt>`).

**Termos mínimos (~30)**:
FDM, SLA, SLS, SLM, DLP, DfAM, infill, perímetro, camada (layer), Z-axis, XY, suporte, tolerância, PLA, ABS, PETG, ASA, Nylon (PA12), PA CF15, TPU, ULTEM, Aço Inox 316L, sinterização, fotopolimerização, fusão, lattice, slicing, STL, STEP, X_T, 3MF, gcode.

Cada termo: 2-4 frases + link a página relacionada (ex: PA12 → /materiais#pa12).

**Schema**: `DefinedTermSet` + `DefinedTerm` por termo. Linkar em `llms.txt`.

---

## 4. /guias/* — HowTo conversacional

**Novos arquivos**:
- `frontend-public/src/pages/guias/index.astro` (índice)
- `frontend-public/src/pages/guias/como-solicitar-orcamento.astro`
- `frontend-public/src/pages/guias/como-enviar-arquivo-3d.astro`
- `frontend-public/src/pages/guias/escolher-material-3d.astro`
- `frontend-public/src/pages/guias/como-acompanhar-pedido.astro`

Cada guia: H1 + 5-8 passos numerados + `howToSchema()` com `step[]`, `tool[]`, `supply[]`, `totalTime`.

Linkar `/guias/*` em:
- Header secundário ou footer
- `public/llms.txt` (nova seção "## Guias passo-a-passo")
- Sitemap automático

---

## 5. Markdown sources expostos

**Filosofia**: LLMs preferem ler `.md` cru (token-efficient).

**Criar em `frontend-public/public/`**:
- `faq.md` — dump da FAQ em Markdown (auto-gerado em build via script `scripts/generate-llm-sources.ts` que lê o array de FAQs)
- `materiais.md` — tabela comparativa de materiais
- `servicos.md` — descrição de cada serviço
- `glossario.md` — espelho do /glossario

**Build step**: adicionar a `package.json` do public:
```json
"build": "node scripts/generate-llm-sources.mjs && astro build"
```

**Referenciar em llms.txt**:
```md
## Referência técnica (Markdown sources)
- FAQ: https://aumaf.kayoridolfi.ai/faq.md
- Materiais: https://aumaf.kayoridolfi.ai/materiais.md
- Serviços: https://aumaf.kayoridolfi.ai/servicos.md
- Glossário: https://aumaf.kayoridolfi.ai/glossario.md
```

---

## 6. /industrias/* — cases por setor

**Novos arquivos** (5 mínimos):
- `/industrias/automotiva.astro`
- `/industrias/aeroespacial.astro`
- `/industrias/medica-odontologica.astro`
- `/industrias/joalheria-design.astro`
- `/industrias/educacao-pesquisa.astro`

Cada: hero + 3-4 cases reais (anonimizados se preciso) + materiais recomendados + CTA orçamento + schema `Service` com `areaServed` granular e `serviceType` específico.

---

## 7. llms.txt — atualização

Após criar glossário/guias/industrias, atualizar `frontend-public/public/llms.txt`:
- Seção "## Guias HowTo" (4 links)
- Seção "## Indústrias atendidas" (5 links)
- Seção "## Referência técnica" (Markdown sources)
- Seção "## Estatísticas verificáveis" (CNPJ, 500+ projetos, ano de fundação, certificações)

Criar também `frontend-public/public/llms-full.txt` — versão expandida (~3000 palavras) com toda informação canônica em Markdown estruturado.

---

## 8. NAP visível + CNPJ

**Adicionar em footer global** (`frontend-public/src/components/Footer.astro`):
- Razão social: AUMAF 3D PRINTING A NEW WORLD LTDA
- CNPJ: 46.357.355/0001-33
- Endereço completo
- Telefone clicável

Adicionar `legalName` + `taxID` no schema Organization.

---

## 9. Monitoramento de citação por LLMs

Ver [analytics-completeness §10](./2026-05-13-analytics-completeness.md#10-llm-bot-detection). Detectar user-agents `GPTBot|ClaudeBot|PerplexityBot|Google-Extended|CCBot|Applebot-Extended` e gravar separadamente. Dashboard: "LLM crawls / dia" + páginas mais consumidas por LLMs.

**Métricas externas a considerar**:
- Otterly.ai ou ProfoundAI (tracking de menções em respostas de LLMs) — avaliar custo/benefício
- Buscas manuais periódicas: perguntar a ChatGPT/Claude/Perplexity "impressão 3D profissional em São Carlos" e verificar citação.

---

## Critérios de aceitação

- [ ] Schema validator verde para `Person` + `Organization.employee` em /sobre
- [ ] `Product` schema válido para 10+ materiais
- [ ] /glossario publicado com ≥ 30 termos
- [ ] 4 guias HowTo publicados com schema válido
- [ ] /faq.md, /materiais.md, /servicos.md, /glossario.md acessíveis e atualizados em cada build
- [ ] llms.txt atualizado com todos os novos assets
- [ ] CNPJ + Razão social visíveis no footer
- [ ] Teste empírico: perguntar a ChatGPT/Claude/Perplexity sobre impressão 3D em São Carlos e citar resultado no PR description
