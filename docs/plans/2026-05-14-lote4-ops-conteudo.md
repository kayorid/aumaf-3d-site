# Lote 4 — Ops + estratégia de conteúdo (não-código, ação do Kayo/AUMAF)

**Por quê**: técnica está 95% pronta após Lotes 1-3. Os últimos 5% e a tração orgânica real **dependem de ações operacionais e editoriais** que só o Kayo + AUMAF podem fazer — Claude não tem acesso a GSC, GBP, Cloudflare dashboard ou ao calendário editorial da empresa.

Este documento é o plano de ação para Kayo + Marcos + Felipe Risse executarem na próxima semana e nos próximos 90 dias.

---

## 4.1 — Google Search Console + Bing Webmaster Tools (1h, Kayo) 🔴 PRIORIDADE MÁXIMA

**Por quê**: sem GSC/BWT, estamos voando cegos. Não sabemos quantas impressões, cliques, posições, queries indexadas, erros de cobertura.

**Passos**:

1. **Google Search Console** — https://search.google.com/search-console
   - Adicionar propriedade `https://aumaf.kayoridolfi.ai` (Domain property se possível, URL prefix se DNS não bater).
   - Verificar via DNS TXT (preferido) ou meta tag.
   - **Submeter sitemap**: `https://aumaf.kayoridolfi.ai/sitemap-index.xml`
   - Inspecionar 5 URLs principais (/, /servicos, /materiais, /blog, /contato) → "Solicitar indexação"
   - Configurar alerta de e-mail para erros de cobertura.

2. **Bing Webmaster Tools** — https://www.bing.com/webmasters
   - Importar do GSC (botão "Import from Google Search Console") — copia propriedade e sitemap.
   - Validar IndexNow funcionando (após Lote 1.5 deployado).

3. **Yandex Webmaster** (opcional, baixa prioridade Brasil) — https://webmaster.yandex.com

**Validação após 7 dias**: GSC mostra ≥ 50 páginas indexadas; relatório de Performance mostra ≥ 100 impressões.

**Quando**: hoje ou amanhã.

---

## 4.2 — Google Business Profile (2h, Kayo + Marcos) 🔴 ALTA

**Por quê**: para query local ("impressão 3d são carlos"), GBP é mais importante que o site. Aparece no Map Pack, com avaliações, fotos, horário.

**Passos**:

1. Acessar https://business.google.com — entrar com a conta da AUMAF (provavelmente já existe).
2. **Otimizações canônicas**:
   - Categoria primária: "Serviço de impressão 3D" (ou "Manufatura" se específico não existir).
   - Categorias secundárias: "Empresa de prototipagem", "Empresa de manufatura", "Serviço de engenharia".
   - Descrição: usar `COMPANY.description` do `company.ts` (consistência com site).
   - Endereço: confirmar coincide com `company.ts`.
   - Telefone: confirmar coincide.
   - Site: `https://aumaf.kayoridolfi.ai` (atualizar para `aumaf3d.com.br` quando migrar).
   - Horário: Seg-Sex 08-18 (alinhado com `company.ts`).
   - Atributos: "Atende remotamente", "Aceita PIX", "Wi-Fi grátis", "Atende por agendamento".

3. **Fotos** (mínimo 20):
   - 5+ fotos da fábrica (impressoras, peças, equipe trabalhando).
   - 5+ fotos de peças impressas (catálogo visual).
   - 5+ fotos da equipe (mesmas usadas em /sobre).
   - Logo + capa otimizada (1024×576px).

4. **Posts semanais** — Google Business posts duram 7 dias. Aproveitar para anunciar:
   - Novo post de blog.
   - Case do mês.
   - Promoção (se houver).
   - Eventos (feira, palestra, parceria).

5. **Respostas a avaliações** — todas as avaliações Google atuais devem ter resposta da AUMAF (mesmo as 5 estrelas — engajamento sinal positivo).

6. **Q&A** — pré-popular 10 perguntas que a equipe receba e responda como AUMAF:
   - "Vocês fazem peças em metal?"
   - "Qual o prazo médio?"
   - "Atendem todo o Brasil?"
   - "Vocês fazem peças únicas ou só em série?"
   - "Quais formatos de arquivo aceitam?"
   - etc.

**Validação após 30 dias**: GBP mostra ≥ 100 visualizações/mês, ≥ 5 cliques no site, ≥ 3 chamadas.

**Quando**: esta semana.

---

## 4.3 — Cloudflare em proxy mode (orange cloud) (30min, Kayo) 🟡 MÉDIA

**Por quê**: hoje Cloudflare é só DNS (gray cloud) → tráfego vai direto do usuário para VPS Hostinger (São Paulo, mas TTFB elevado para outras regiões BR). Em proxy mode (orange cloud), Cloudflare serve o cache do edge brasileiro (Brasília, Rio, Curitiba) → TTFB cai 100-150ms para usuários fora de SP.

**⚠️ Pegadinha conhecida** (memória `release_20260513_pr52_pr53_caddy_incident.md`): Cloudflare em Flexible SSL exige `http://` nos vhosts Caddy. Mudar para Full Strict é o ideal mas exige certificado válido no Caddy origin.

**Passos**:

1. Acessar Cloudflare dashboard → DNS → mudar gray cloud → orange cloud em:
   - `aumaf.kayoridolfi.ai`
   - `admin-aumaf.kayoridolfi.ai`
   - `api-aumaf.kayoridolfi.ai`

2. SSL/TLS → Encryption mode → **Full (Strict)** — exige que Caddy origin tenha cert válido (já tem via `acme_dns cloudflare`).

3. **Caching**:
   - Cache Level: Standard
   - Browser Cache TTL: respeitar origin (Cache-Control já configurado).
   - Always Online: ON.

4. **Performance**:
   - Auto Minify: HTML/CSS/JS ON.
   - Brotli: ON (Caddy também faz, redundante mas inofensivo).
   - Rocket Loader: OFF (quebra muita coisa, evitar).
   - Early Hints: ON.

5. **Security**:
   - Security Level: Medium.
   - Bot Fight Mode: ON (mas adicionar exception para Botyio webhook se necessário).
   - Browser Integrity Check: ON.

**Validação**: PageSpeed Insights mobile testando de mobile residencial 4G → TTFB < 300ms.

**Quando**: depois de Lote 1+2+3 deployados e estáveis (não fazer junto para isolar variável).

---

## 4.4 — Calendário editorial (contínuo, AUMAF + Kayo) 🟡 ALTA TRAÇÃO

**Por quê**: blog é o motor de ranking long-tail. Hoje 7 posts. Google indexa empresas que publicam regularmente. LLMs treinam com posts. Cada post = backlink interno + autoridade.

**Meta**: 1 post/semana, 12 posts no Q3 (até 14/ago/2026).

**Linhas editoriais** (mix 4:4:2:2):

1. **Comparativos técnicos (4 posts)** — alto valor GEO + SEO:
   - "FDM vs SLS: qual escolher para protótipo funcional?"
   - "PA12 vs PA CF15 vs Nylon padrão: comparativo de propriedades"
   - "316L impresso vs usinado: custo, prazo, qualidade"
   - "ASA vs ABS para peças expostas ao sol"

2. **Cases reais (4 posts)** — autoridade + E-E-A-T:
   - Case Fórmula SAE USP — número de peças, materiais, prazo.
   - Case automotivo (genérico para preservar cliente) — gabarito.
   - Case médico — modelo anatômico pré-cirúrgico.
   - Case joalheria — fundição por cera perdida.

3. **Guias práticos (2 posts)** — long-tail:
   - "Como exportar peça do SolidWorks para impressão 3D (STEP vs STL)"
   - "Checklist DfAM: 10 perguntas antes de enviar um arquivo"

4. **Tendências/setor (2 posts)** — backlink-friendly:
   - "Manufatura aditiva no Brasil em 2026: panorama e oportunidades"
   - "Impressão 3D em metal SLM: o que mudou nos últimos 5 anos"

**Estrutura canônica de cada post** (E-E-A-T):
- **Autor real** — Marcos/Felipe Risse/Nieldson assinando, com bio + foto + LinkedIn no final.
- **Schema Person** no `author` do `blogPostingSchema` (não Organization).
- **Mínimo 1200 palavras**.
- **3+ imagens originais** (não stock).
- **Tabela ou diagrama original** quando aplicável.
- **CTA orçamento** ao final.
- **2-3 links internos** para /materiais, /servicos, /industrias relacionados.

**Processo de produção**:
- Semana 1-2: Kayo + Marcos definem tema, brief de 1 página.
- Semana 3: Marcos/Felipe escrevem (ou ditam via WhatsApp, Kayo edita).
- Semana 4: revisão técnica final + publicação via /admin.

**Quando**: começar imediatamente. Post #1 publicar até 21/05/2026.

---

## 4.5 — Outreach para backlinks (contínuo, Kayo) 🟡 ALTA AUTORIDADE

**Por quê**: domain authority cresce com backlinks de domínios relevantes. Hoje AUMAF tem ~0 backlinks externos (verificar via Ahrefs/Ubersuggest gratuito).

**Alvos por prioridade**:

1. **`.edu` (peso máximo)**:
   - USP São Carlos — pedir menção em página da Fórmula SAE (parceria existente).
   - UFSCar — Departamento de Engenharia de Materiais (oferecer impressão para projetos acadêmicos em troca de menção).

2. **Setor industrial BR**:
   - ABM (Associação Brasileira de Metalurgia) — blog ou diretório.
   - SENAI São Carlos / SP — diretório de fornecedores.
   - Revistas especializadas: ABIMAQ, Engenharia BR, Plástico Industrial.

3. **Diretórios locais BR**:
   - Cylex Brasil
   - Apontador
   - Solutudo
   - GuiaMais
   - Te Conto (São Carlos local)

4. **Podcasts / canais YouTube de engenharia**:
   - Identificar 3-5 e oferecer entrevista (Marcos como expert em manufatura aditiva).

**Meta**: ≥ 10 backlinks dofollow em 90 dias.

**Quando**: começar semana 2 (depois do site estar com Lotes 1-3 deployados e Search Console ativo).

---

## 4.6 — Monitoramento de citação em LLMs (mensal, Kayo) 🟢 BAIXA mas medível

**Opções**:

1. **Manual** (gratuito) — uma vez por mês, perguntar a:
   - ChatGPT 4: "impressão 3d industrial em são carlos"
   - Claude: "manufatura aditiva em aço inox no brasil"
   - Perplexity: "empresa de impressão 3d sp interior"
   - Gemini: "prototipagem rápida sls brasil"
   - Documentar em `docs/perf/llm-citations-<mes>.md` se citou AUMAF, qual posição, qual contexto.

2. **Pago** ($30-100/mês):
   - Otterly.ai
   - Profound AI
   - Athena Intelligence
   Avaliar custo/benefício após 3 meses de medição manual.

**Meta**: ser citado em ≥ 3 dos 4 vendors LLM em queries-alvo.

**Quando**: começar primeira medição em 1 semana após Lotes 1+2 deployados (dar tempo para crawlers re-indexarem).

---

## 4.7 — Wikipedia + Wikidata (futuro, baixa prioridade) 🟢

LLMs treinam fortemente com Wikipedia. Ter uma entrada Wikidata de AUMAF 3D ajuda em GEO de longo prazo.

**Cuidado**: Wikipedia tem padrão estrito de notoriedade (precisa fontes terceiras independentes). Provavelmente prematuro — esperar 6+ meses + backlinks de mídia para tentar.

Wikidata é mais permissivo — pode criar entrada agora com `instance of: business`, `country: Brazil`, `headquarters location: São Carlos`, `industry: 3D printing`, etc.

**Quando**: Wikidata em 30 dias. Wikipedia em 6 meses (se houver imprensa coberta).

---

## Cronograma compacto

| Quando | Ação |
|---|---|
| Hoje | 4.1 Search Console + BWT |
| Esta semana | 4.2 Google Business Profile |
| Próxima semana | Iniciar 4.4 calendário editorial (post #1) |
| Semana 2-4 | 4.5 outreach backlinks (.edu primeiro) |
| Semana 3 | 4.3 Cloudflare orange cloud (após Lotes técnicos estáveis) |
| Mensal | 4.6 medição citação LLMs |
| Dia 30 | Criar entrada Wikidata |
| Trimestral | Auditoria minuciosa (5 dimensões — re-rodar) |

## Aceitação macro do Lote 4 (90 dias)

- [ ] GSC ativo com ≥ 5.000 impressões/mês
- [ ] BWT ativo com IndexNow validado
- [ ] GBP com ≥ 100 views/mês, ≥ 3 chamadas
- [ ] Cloudflare orange cloud ON, TTFB mobile 4G < 300ms
- [ ] 12 posts publicados (1/semana), todos com autor real
- [ ] ≥ 10 backlinks dofollow externos
- [ ] AUMAF citado em ≥ 3 LLMs em queries-alvo
- [ ] Entrada Wikidata aprovada
