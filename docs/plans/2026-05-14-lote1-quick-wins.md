# Lote 1 — Quick wins SEO/GEO (1 PR, ~6h)

**Origem**: audit 2026-05-13 deixou schemas criados mas não aplicados, e novos canais LLM/Bing pendentes.

---

## 1.1 — `productSchema` aplicado em `/materiais` (~1h)

**Por quê**: factory `productSchema()` foi criada em `frontend-public/src/lib/schemas.ts` mas a página `materiais.astro` ainda emite só `webPageSchema + breadcrumbSchema + itemListSchema`. Cada material precisa virar um `Product` no JSON-LD para o Google montar Product Rich Results e LLMs citarem "qual material para drone aeroespacial".

**Implementação**:
1. Em `materiais.astro`, identificar o array de materiais (existente).
2. Para cada material: mapear para `productSchema({ name, slug, description, image, material, process, category, applications })`.
3. Passar todos os Products no array `schemas` do `<Base>`.

**Schema esperado** (exemplo PA12):
```json
{
  "@type": "Product",
  "name": "Nylon (PA12)",
  "material": "Nylon PA12",
  "additionalProperty": [
    { "name": "additiveManufacturingProcess", "value": "SLS" },
    { "name": "application", "value": "Aeroespacial" }
  ],
  "brand": { "@type": "Brand", "name": "AUMAF 3D" },
  "offers": { "availability": "InStock", "priceCurrency": "BRL", ... }
}
```

**Aceitação**:
- [ ] 17 Products no JSON-LD da /materiais
- [ ] Google Rich Results Test passa
- [ ] `curl /materiais | grep '"@type":"Product"'` retorna 17 ocorrências

---

## 1.2 — `teamMembersSchema` aplicado em `/sobre` (~30min)

**Por quê**: factory foi criada mas não chamada. PR #50 adicionou seção UI da equipe, mas sem schema Person não há autoridade pessoal indexável.

**Implementação**:
1. Mapear os 6 integrantes (Marcos, Felipe Risse, Nieldson, Hian, Tiago, Felipe Gonsales) com `{ name, jobTitle, image, linkedin?, description? }`.
2. Passar `teamMembersSchema(members)` no array `schemas` do Base.

**Aceitação**:
- [ ] 6 `Person` no JSON-LD de /sobre
- [ ] Cada um com `worksFor: { "@id": ORG_ID }`
- [ ] Schema Validator verde

---

## 1.3 — Markdown sources (.md cru) (~1.5h)

**Por quê**: LLMs preferem `.md` cru (token-efficient, sem ruído HTML). Padrão emergente (Anthropic docs publica `/docs/X.md`). Eleva chance de citação.

**Implementação**:
1. Criar `frontend-public/scripts/generate-llm-sources.mjs` — script Node que:
   - Importa o array de FAQs de `faq.astro` (extrair para `src/data/faqs.ts`).
   - Importa array de materiais (extrair para `src/data/materiais.ts`).
   - Importa array de serviços (extrair para `src/data/servicos.ts`).
   - Importa array de termos de `glossario.astro` (extrair para `src/data/glossario.ts`).
   - Gera `public/faq.md`, `public/materiais.md`, `public/servicos.md`, `public/glossario.md`.
2. Atualizar `package.json` build script: `"build": "node scripts/generate-llm-sources.mjs && astro build"`.
3. Atualizar `llms.txt` linkando os 4 .md (seção "Markdown sources").

**Estrutura típica do faq.md**:
```md
# FAQ AUMAF 3D — Manufatura Aditiva

## Geral
### Quanto tempo leva para receber um orçamento?
Resposta...

### Vocês atendem todo o Brasil?
Resposta...
```

**Aceitação**:
- [ ] 4 .md acessíveis em https://aumaf.kayoridolfi.ai/{faq,materiais,servicos,glossario}.md
- [ ] Build automático regenera
- [ ] llms.txt linka os 4
- [ ] Cache-Control 1h via Caddy (já configurado `@robots_seo`)

---

## 1.4 — 4 páginas `/guias/*` HowTo (~2h)

**Por quê**: LLMs respondem perguntas naturais ("como solicito orçamento?", "como envio meu arquivo?"). Páginas dedicadas com `HowTo` schema dão resposta direta + autoridade.

**Páginas**:
1. `/guias/como-solicitar-orcamento` — 5 passos (especificar projeto → enviar arquivo → análise → orçamento → aprovação).
2. `/guias/como-enviar-arquivo-3d` — 4 passos (escolher formato → exportar do CAD → validar → upload). Tabela: STL vs STEP vs X_T vs 3MF.
3. `/guias/escolher-material-impressao-3d` — fluxograma (uso final? funcional? estética?) → recomendação.
4. `/guias/como-acompanhar-meu-pedido` — 3 passos (e-mail de confirmação → WhatsApp do comercial → rastreamento).

**Estrutura de cada `.astro`**:
- Hero + H1 com pergunta natural
- 4-8 passos numerados com headings
- `howToSchema()` no JSON-LD com `step[]`, `tool[]?`, `totalTime`
- CTA final: solicitar orçamento
- Breadcrumb visível
- Links internos: para o material/serviço relacionado

**Atualizar**:
- `llms.txt` — nova seção "Guias HowTo"
- `llms-full.txt` — referenciar
- Footer ou navegação secundária — link agregador `/guias`

**Aceitação**:
- [ ] 4 páginas 200 OK em produção
- [ ] 4 schemas HowTo válidos no Rich Results Test
- [ ] `/guias` index lista os 4
- [ ] Linkadas em llms.txt

---

## 1.5 — IndexNow ping no backend (~1h)

**Por quê**: IndexNow é protocolo aberto (Bing, Yandex, Seznam, Naver) que aceita ping push em vez de aguardar crawl. Reduz tempo até indexação de ~48h para ~6h.

**Implementação**:
1. Gerar chave IndexNow (32 chars alfanuméricos) — variável env `INDEXNOW_KEY`.
2. Expor a chave em `frontend-public/public/<key>.txt` (verificação de propriedade).
3. Em `backend/src/services/post.service.ts` no `publishPost()`:
   - Após sucesso, chamar `pingIndexNow([postUrl, blogIndexUrl])`.
   - Implementar `pingIndexNow` em `backend/src/services/indexnow.service.ts`:
     ```ts
     export async function pingIndexNow(urls: string[]) {
       const body = {
         host: 'aumaf.kayoridolfi.ai',
         key: env.INDEXNOW_KEY,
         keyLocation: `https://aumaf.kayoridolfi.ai/${env.INDEXNOW_KEY}.txt`,
         urlList: urls,
       };
       await fetch('https://api.indexnow.org/IndexNow', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(body),
       });
     }
     ```
4. Best-effort com try/catch — nunca bloquear o publish.
5. Schema `@aumaf/shared` — novo evento `analytics_event` name `indexnow_ping_server` para tracking.

**Aceitação**:
- [ ] `INDEXNOW_KEY` no `.env.production` (gerar via `openssl rand -hex 16`)
- [ ] `https://aumaf.kayoridolfi.ai/<key>.txt` retorna a chave
- [ ] Publicar post de teste → log mostra `indexnow_ping_server` emitido
- [ ] Bing Webmaster Tools mostra URL submetida (validação manual após setup do GSC/BWT)

---

## Critérios de aceitação do Lote 1

- [ ] Build local Astro verde
- [ ] Backend typecheck verde
- [ ] Smoke test prod: /materiais, /sobre, /guias/*, /faq.md, /materiais.md, /llms.txt, /<indexnow-key>.txt
- [ ] Rich Results Test verde para Product (17), Person (6), HowTo (4)
- [ ] llms.txt referencia: glossario, guias/*, .md sources, llms-full
- [ ] Commit atômico por sub-item (1.1, 1.2, 1.3, 1.4, 1.5)
- [ ] PR squash-merged para master + deploy CD verde
