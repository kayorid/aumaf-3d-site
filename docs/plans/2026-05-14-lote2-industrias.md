# Lote 2 — Landing pages por indústria (1 PR, ~8h)

**Por quê**: query "impressão 3D para [setor]" tem volume alto e baixa concorrência local (Brasil). LLMs respondem essa query e citam páginas com `Service` schema + `areaServed` específico. Hoje AUMAF não tem nenhuma landing dedicada por setor — perde o tráfego para concorrentes genéricos.

## Estrutura comum às 5 landings

Cada `/industrias/<setor>.astro`:

1. **Hero** — H1: "Impressão 3D para [setor] no Brasil — AUMAF 3D"
2. **Dores do setor** — bloco de 3-4 problemas reais (ex: aeroespacial: peso, certificação, lote único)
3. **Como AUMAF resolve** — 3 cards (processos + materiais + DfAM)
4. **Casos típicos** — 3-4 cases anonimizados (ou abstratos se sensíveis)
5. **Materiais recomendados** — tabela com 4-5 materiais + propriedades-chave + link a /materiais#<slug>
6. **Processos recomendados** — link a /servicos#<slug>
7. **FAQ específica do setor** — 4-6 perguntas
8. **CTA orçamento** — pré-preenchido com `?ref=industria-<slug>`
9. **Breadcrumb visível** + schema BreadcrumbList

**Schemas no JSON-LD**:
- `webPageSchema` (type: `CollectionPage`)
- `breadcrumbSchema`
- `serviceSchema()` específico (serviceType: "Impressão 3D para [setor]", areaServed: Brasil + interior SP)
- `faqPageSchema()` (FAQ do setor)
- Reuso de `organizationSchema`, `localBusinessSchema`, `webSiteSchema` (via Base)

## As 5 landings

### 2.1 `/industrias/automotiva`
- **Dores**: ferramentaria cara, peças descontinuadas, gabaritos sob medida, prototipagem rápida para testes.
- **Cases**: gabarito de montagem para chicote elétrico; peça de reposição para veículo clássico; protótipo de duto de admissão; suporte para teste de durabilidade.
- **Materiais**: PA CF15 (rigidez), Nylon PA12 (durabilidade), ABS (impacto), TPU (vedações).
- **Processos**: FDM (gabaritos), SLS (peças funcionais), SLA (modelos visuais).
- **Keyword alvo**: "impressão 3d automotiva brasil", "gabarito impresso 3d carro".

### 2.2 `/industrias/aeroespacial`
- **Dores**: peso (relação resistência/massa), lotes pequenos, prototipagem aerodinâmica, peças sob demanda.
- **Cases**: protótipo aerodinâmico Fórmula SAE USP São Carlos (parceria existente!), fixadores não-estruturais, ductos.
- **Materiais**: PA CF15, ASA (UV/temperatura), Aço Inox 316L (SLM).
- **Processos**: SLS + SLM + FDM CF15.
- **Disclaimer**: "Não atendemos certificação aeronáutica primária (FAR/EASA Part 21). Para peças não-estruturais, protótipos e ferramentaria, somos referência."
- **Keyword alvo**: "impressão 3d aeroespacial são paulo".

### 2.3 `/industrias/medica-odontologica`
- **Dores**: modelos anatômicos pré-cirúrgicos, moldeiras dentárias, gabaritos cirúrgicos, biocompatibilidade.
- **Cases**: modelo anatômico para planejamento de cirurgia ortopédica; gabarito de furação odontológica; modelo educacional médico.
- **Materiais**: Resinas biocompatíveis (SLA), Nylon PA12 (SLS para moldeiras de produção).
- **Processos**: SLA + DLP + SLS.
- **Disclaimer**: "Não fabricamos implantes ou dispositivos invasivos. Modelos anatômicos para educação/pré-cirúrgico e gabaritos não-invasivos são nossa especialidade."
- **Keyword alvo**: "modelo anatômico impressão 3d", "moldeira dentária impressão 3d".

### 2.4 `/industrias/joalheria-design`
- **Dores**: peças únicas, alta resolução, modelos para fundição por cera perdida, prototipagem rápida de coleção.
- **Cases**: modelo SLA castable para fundição em prata; protótipo de pulseira; matriz de injeção curta tiragem.
- **Materiais**: Resina Castable (SLA), Resina padrão (modelos visuais).
- **Processos**: SLA + DLP.
- **Keyword alvo**: "impressão 3d joalheria fundição", "modelo cera perdida sla".

### 2.5 `/industrias/educacao-pesquisa`
- **Dores**: orçamento limitado, prazos acadêmicos, projetos universitários (TCC, ICs, equipes de competição).
- **Cases**: parceria oficial Fórmula SAE USP São Carlos 2024 (peças estruturais não-críticas); apoio a TCCs em engenharia mecânica; projetos da UFSCar.
- **Materiais**: PLA (custo), PETG (resistência razoável), PA12 (uso final acadêmico).
- **Processos**: FDM + SLS + SLA.
- **Diferencial**: "Hub no Parque Tecnológico Damha II — proximidade física a USP São Carlos e UFSCar."
- **Keyword alvo**: "impressão 3d universidade são carlos", "impressão 3d projeto acadêmico".

## Estrutura técnica

- Criar `/industrias/index.astro` (hub linking aos 5)
- Cada landing: ~300 linhas (hero + 4 seções + CTA + FAQ)
- Componente reusável `<IndustryHero>` se houver tempo (não-bloqueante).

**Atualizar**:
- `Navbar.astro` — adicionar link "Indústrias" no nível secundário? OU manter só linkado pelo footer + página `/industrias` hub.
- `Footer.astro` — adicionar coluna "Indústrias atendidas" linkando as 5.
- `llms.txt` — nova seção "Indústrias atendidas".
- `llms-full.txt` — referenciar.
- Sitemap (`astro.config.ts`) — incluído automaticamente via file-based routing.

## Aceitação

- [ ] 6 páginas 200 OK (`/industrias` + 5 setores)
- [ ] 5 Service schemas válidos no Rich Results Test
- [ ] 5 FAQPage schemas válidos
- [ ] Cada landing com 600-1200 palavras (suficiente para não ser thin content)
- [ ] Internal linking: cada landing linka 3+ materiais + 2+ serviços + 1+ caso/post
- [ ] llms.txt + llms-full.txt atualizados
- [ ] Footer com nova coluna "Indústrias"
- [ ] Smoke test prod
- [ ] Commit atômico por landing + 1 commit para hub + 1 para Navbar/Footer
