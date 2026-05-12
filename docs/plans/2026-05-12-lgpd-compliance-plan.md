# Plano de Conformidade LGPD — AUMAF 3D

**Data:** 2026-05-12
**Autor:** kayoridolfi.ai
**Estado:** Proposta para execução
**Escopo:** Site institucional + Blog + Backoffice + Analytics próprio + Integrações (Botyio, Featurable, Behold.so, GA4/Clarity/Pixel, OpenAI/Anthropic, MinIO/S3)
**Domínio em produção:** `https://aumaf.kayoridolfi.ai` (migração futura para `www.aumaf3d.com.br`)

---

## Status (2026-05-12 — após implementação)

- ✅ **Fases A–F entregues em `feat/lgpd-compliance`**, prontas para PR.
  Commits:
  - `88da267` docs (plano + Política/Termos/Cookies + ROPA/LIA/incident/DPA)
  - `09266d8` Fase A — páginas legais públicas + footer + aviso no /contato
  - `8e9bd88` Fase B — banner CookieConsent + ConsentLog + endpoint `/v1/consent` + DDL DSR
  - `de62ad7` Fase C — Consent Mode v2 + third-party loader + opt-in no analytics SDK
  - `9dc5d68` Fase D — DSR backend (service+routes+magic link) + admin UI `/lgpd/solicitacoes`
  - `fec8971` Fase E — worker BullMQ `data-retention` diário (03:00 BRT)
  - (Fase F) smoke `scripts/lgpd-smoke.sh` + runbook `lgpd-operations.md` + CLAUDE.md
- ✅ **Documentos legais criados** — Política de Privacidade, Termos de Uso e Política de Cookies em `docs/legal/`. Compliance interna (ROPA, LIA, incident-response, DPA) em `docs/compliance/`.
- ✅ **Identidade jurídica confirmada** — razão social, CNPJ, endereço, foro e representantes legais extraídos da Ficha Cadastral.
- ✅ **DPO/Encarregado designado** — Luiz Felipe Lampa Risse (felipe@aumaf3d.com.br), backup Marcos Ninelli. **Sujeito a confirmação interna formal**.
- ⚠️ **LGPD-DEFER (humano):** (1) revisão jurídica formal antes de mergear, (2) confirmação formal escrita do DPO, (3) gerar `LGPD_ANON_SALT` aleatório forte em prod + backup off-server (1Password), (4) adicionar captcha real (Cloudflare Turnstile) no `/lgpd/direitos` em sprint pós-deploy.
- ✅ **Hospedagem do Botyio confirmada** — operador no Brasil (sem transferência internacional para este fluxo).

---

## 1. Resumo Executivo

- **Estado atual:** o site coleta dados pessoais por (a) formulário de lead em `/contato`, (b) pipeline de analytics próprio (pageviews, cliques, sessões via cookie), (c) embeds de terceiros (Featurable, Behold.so) e (d) scripts opcionais já cabeados (GA4, Clarity, Meta Pixel, GTM). **Nenhum desses caminhos hoje tem banner de consentimento, política de privacidade publicada, termos de uso, política de cookies, contato de encarregado, plano de retenção formalizado, nem mecanismo público para o titular exercer direitos do art. 18 da LGPD.**
- **Risco regulatório:** AUMAF 3D se enquadra como **agente de tratamento de pequeno porte** (Res. CD/ANPD nº 2/2022) — boa parte das obrigações é flexibilizada, mas **não dispensada**. Sem banner de cookies, sem política publicada e sem canal para direitos do titular, a empresa está exposta a (1) reclamação direta à ANPD por qualquer visitante, (2) sanção administrativa (advertência → multa até 2% do faturamento, limitada a R$ 50 milhões por infração — Res. 4/2023) e (3) obrigação de comunicar incidente de segurança em **3 dias úteis** sem possuir hoje sequer um plano de resposta a incidente (Res. 15/2024).
- **Esforço estimado:** **~46 horas** de implementação técnica + documental, distribuídas em 6 fases (A→F). Prazo realista: **3 semanas corridas** se executado em paralelo ao desenvolvimento normal, ou **1 sprint dedicado de 1 semana** focado.
- **Decisões pendentes do cliente (AUMAF):** (1) ✅ razão social + CNPJ confirmados (AUMAF 3D PRINTING A NEW WORLD LTDA — CNPJ 46.357.355/0001-33); (2) ✅ canal institucional do Encarregado definido em felipe@aumaf3d.com.br; (3) ✅ Encarregado designado: Luiz Felipe Lampa Risse (sujeito a confirmação formal interna); (4) ✅ Botyio hospedado no Brasil (sem transferência internacional); (5) prazos comerciais reais (5 anos pós-último contato) para retenção de leads; (6) revisão por advogado de privacidade antes de publicar.
- **Quick wins (≤8h, alto valor):** publicar Política de Privacidade + Política de Cookies + canal LGPD no rodapé, com aviso curto inline no formulário de contato. Cobre ~60% do risco percebido com baixo esforço.
- **Bloqueio técnico real:** o pipeline de analytics próprio **já está em produção** coletando dados (mesmo com IP hasheado). Sem opt-in granular, ele opera hoje na base de **legítimo interesse** — defensável **se** LIA documentada existir.
- **Não é escopo:** RGPD/GDPR (UE), CCPA (Califórnia), HIPAA. Foco exclusivo em LGPD + Marco Civil + CDC + Resoluções ANPD vigentes em 2026-05.

---

## 2. Diagnóstico Atual — Mapeamento de Coleta

| # | Ponto de coleta | Localização | Dados coletados | Base legal aplicável | Gap LGPD |
|---|---|---|---|---|---|
| 1 | Formulário `/contato` | `frontend-public/src/pages/contato.astro` | nome, sobrenome, e-mail, telefone, empresa, mensagem, tipo de projeto, material, arquivo, UTMs, referrer, landing | art. 7º, V (pré-contrato) + I (consentimento p/ marketing futuro) | Sem aviso inline, sem link p/ política, sem checkbox separado para finalidade de marketing |
| 2 | Pipeline analytics próprio | `packages/analytics-sdk/`, `backend/src/services/analytics-ingest.service.ts` | sessionId, visitorId (cookie + localStorage), pageviews, cliques `data-track`, scroll, UA parseado, país GeoIP, IP hasheado (SHA-256+salt, trunc. 32 hex), referrer, UTM | art. 7º, IX (legítimo interesse) | Sem banner, sem LIA documentada, sem opt-out, sem política de retenção publicada |
| 3 | Botyio (WhatsApp lead) | `backend/src/services/botyio.service.ts`, webhook `botyio-webhook.routes.ts` | dados do lead enviados ao Botyio + status sync via webhook | art. 7º, V (execução pré-contratual) | Sem DPA documentado, transferência internacional não declarada |
| 4 | Featurable (Google Reviews) | `frontend-public/src/lib/google-reviews.ts` + embed | JSON com reviews públicas; cookies de terceiros possíveis (verificar via DevTools) | art. 7º, IX (legítimo interesse) | Cookies de terceiros sem consentimento; sem menção em política |
| 5 | Behold.so (Instagram feed) | `frontend-public/src/components/instagram/InstagramFeed.astro` | embed iframe/JS de terceiros; cookies Instagram/Meta possíveis | art. 7º, IX | Cookies de terceiros sem consentimento |
| 6 | GA4 / Clarity / Meta Pixel / GTM | `Base.astro` linhas 109-138 (já cabeados em `Settings`) | identificadores de cliente, fingerprint, eventos, gravação de sessão (Clarity) | art. 7º, I (consentimento) — não há base de legítimo interesse para marketing/perfilamento | **Carregados sem consentimento prévio** se IDs estiverem preenchidos no admin |
| 7 | MinIO / S3 (uploads de mídia) | `backend/src/lib/s3-client.ts` + `media.routes.ts` | imagens/anexos do blog/admin; pode conter PII se admin subir | execução de contrato (operador) | DPA com AWS/MinIO; localização do bucket |
| 8 | OpenAI/Anthropic/Gemini (geração de posts) | `backend/src/services/ai/` | prompts e respostas; em tese não contém PII de visitante, mas posts podem citar pessoas | execução de contrato com fornecedor de IA | Cláusula de "no training" + menção na política |
| 9 | Backoffice — usuários internos | tabela `User` no Prisma | nome, e-mail, password (hash), phone, avatar, logs de login | execução de contrato de trabalho/prestação de serviço | Política interna + retenção pós-desligamento |
| 10 | Logs de aplicação (Pino) | stdout container + Caddy access logs | IPs reais, user-agent, paths, possíveis querystrings com PII | Marco Civil art. 13/15 (guarda obrigatória 6 meses logs de acesso) | Retenção 6 meses + descarte |

---

## 3. Inventário de Dados Pessoais (RoPA — visão registro)

> Versão executiva. Versão completa vai para `docs/compliance/ropa.md` no Plano Fase A.

| Categoria | Campo | Origem | Finalidade | Base legal (art. 7º LGPD) | Compartilhado com | Retenção |
|---|---|---|---|---|---|---|
| Identificação | nome, sobrenome | form contato | atendimento orçamento | V — pré-contrato | Botyio, equipe interna | 5 anos pós-último contato |
| Contato | e-mail | form contato | retorno orçamento + (opt-in futuro) marketing | V + I | Botyio, equipe interna, SMTP | 5 anos pós-último contato |
| Contato | telefone | form contato | retorno WhatsApp | V | Botyio | 5 anos pós-último contato |
| Organizacional | empresa | form contato | qualificação B2B | V | Botyio, equipe interna | 5 anos pós-último contato |
| Conteúdo | mensagem livre | form contato | atendimento | V | Botyio, equipe interna | 5 anos pós-último contato |
| Conteúdo | arquivo .STL/.STEP/.PDF | form contato | cotação técnica | V | equipe interna | 2 anos pós-projeto (segredo industrial cliente) |
| Marketing | UTMs, referrer, landingPage | form contato + analytics | atribuição | IX — legítimo interesse | — | 5 anos (lead) / 12 meses (analytics raw) |
| Comportamental | sessionId, visitorId | cookie/localStorage 1ª parte | métricas de uso | IX — legítimo interesse | — | 12 meses raw, agregado eterno |
| Comportamental | pageviews, cliques, scroll | analytics SDK | métricas de uso | IX — legítimo interesse | — | 12 meses raw, agregado eterno |
| Técnico | IP (hasheado) | analytics ingest | dedupe + GeoIP | IX — legítimo interesse | — | 12 meses (hash); IP cru nunca persistido |
| Técnico | user-agent parseado | analytics ingest | segmentação device | IX — legítimo interesse | — | 12 meses |
| Geo | país (ISO), região, cidade | GeoIP MaxMind | segmentação | IX — legítimo interesse | — | 12 meses raw, agregado eterno |
| Usuário interno | nome, e-mail, hash senha, phone | backoffice | autenticação/operação | V — execução de contrato | — | enquanto vínculo + 5 anos |
| Log de acesso | IP real, UA, path | Caddy/Pino | segurança + obrigação MCI | obrigação legal (Marco Civil art. 13) | — | 6 meses obrigatório, 12 meses máx |

---

## 4. Inventário de Cookies e Trackers

| Nome / chave | Categoria | Domínio | Tipo | Finalidade | Duração | Existente hoje |
|---|---|---|---|---|---|---|
| `aumaf_consent_v1` | **Necessário** | aumaf.kayoridolfi.ai | 1ª parte (localStorage) | armazenar escolha de consentimento — prova de opt-in/out | 12 meses | A criar |
| `aumaf_session` (httpOnly JWT admin) | **Necessário** | aumaf.kayoridolfi.ai | 1ª parte (cookie httpOnly) | autenticação backoffice | sessão | Existente |
| `aumaf_visitor_id` | **Funcional** (analytics 1ª parte) | aumaf.kayoridolfi.ai | 1ª parte (cookie/localStorage) | dedupe de visitante para métricas próprias | 12 meses | Existente (analytics SDK) |
| `aumaf_session_id` | **Funcional** (analytics 1ª parte) | aumaf.kayoridolfi.ai | 1ª parte (localStorage) | agrupamento de sessão | 30 min idle | Existente (analytics SDK) |
| `aumaf_utm` | Funcional | aumaf.kayoridolfi.ai | 1ª parte (sessionStorage) | atribuição última campanha | sessão | Existente |
| `_ga`, `_ga_<id>` | **Analítico** | .aumaf... | 3ª parte (Google) | métrica universal GA4 | 2 anos | Cabeado, inativo (sem ID) |
| `_clck`, `_clsk`, `MUID` | **Analítico** | .clarity.ms | 3ª parte (Microsoft) | gravação de sessão e heatmaps | 1 ano | Cabeado, inativo |
| `_fbp`, `_fbc` | **Marketing/Publicidade** | .aumaf... | 3ª parte (Meta) | atribuição de anúncio Meta | 90 dias | Cabeado, inativo |
| `gtm_*`, `_dc_gtm_*` | **Marketing/Analítico** | .aumaf... | 3ª parte (Google) | container GTM (depende das tags carregadas) | variável | Cabeado, inativo |
| `featurable_*` | **Analítico** (terceiros) | embed Featurable | 3ª parte | embed widget Google Reviews | sessão/persistente | Existente |
| `behold_*` / `ig_*` | **Marketing** | Behold.so + Instagram | 3ª parte | feed Instagram + tracking Meta | persistente | Existente |
| Logs Caddy/Pino | Necessário | servidor | — | obrigação legal Marco Civil | 6 meses | Existente (logs container) |

**Decisão regulatória:** somente cookies/scripts **necessários** podem carregar antes do consentimento. Tudo o mais (incluindo o pipeline próprio em modo "eventos ricos" e os embeds de Featurable/Behold) precisa de **toggle granular** e exige carregamento condicional.

---

## 5. Bases Legais por Finalidade — Justificativa LGPD

| Finalidade | Base legal proposta (art. 7º LGPD) | Justificativa | Documento de suporte |
|---|---|---|---|
| Atender solicitação de orçamento via form | **V — execução de procedimentos preliminares relacionados a contrato** | O titular preenche o form para receber proposta comercial; é tratamento estritamente necessário | Política de privacidade item 4 |
| Enviar a mesma proposta via Botyio/WhatsApp | **V** | mesma base; Botyio atua como operador (apenas executa entrega) | DPA com Botyio |
| Marketing posterior (newsletter, retargeting, e-mail flow) | **I — consentimento** | finalidade nova; exige opt-in separado, livre, informado, específico (art. 8º) | Checkbox no form + log no `ConsentLog` |
| Analytics próprio (pageview, sessão, dispositivo) com IP hasheado | **IX — legítimo interesse** | métrica essencial para operação do site; dados pseudonimizados; baixo risco | LIA `docs/compliance/lia-analytics.md` |
| Eventos comportamentais ricos (click-tracking, scroll, formulário) | **I — consentimento** OU **IX** | conservador: tratar como consentimento se categoria "analítica" estiver no consent banner; LIA cobre apenas pageview agregado | LIA + banner |
| Cookies Clarity (gravação sessão) | **I — consentimento** | grava interações reais → risco maior | banner |
| GA4 / Meta Pixel | **I — consentimento** | finalidade de marketing/perfilamento | banner |
| Manutenção de log de acesso (IP cru, UA) | **II — cumprimento de obrigação legal** | Marco Civil art. 13 (provedor de aplicação), guarda 6 meses | Política item 9 |
| Posts gerados por IA citando pessoas/empresas | **IX — legítimo interesse** ou **VII — proteção do crédito/exercício regular de direitos** caso B2B | apenas pessoas com expressão pública profissional | Revisão editorial |
| Backoffice (Users) | **V — execução de contrato** | login operacional | Política interna |
| Botyio webhook recebendo updates | **V** | continuidade do atendimento | DPA |

---

## 6. Direitos do Titular (art. 18) — Fluxos de Atendimento

**Prazo legal:** 15 dias corridos a partir da solicitação para resposta clara e completa (art. 19, II LGPD); resposta simplificada deve ser imediata.

| Direito (art. 18) | Como o titular solicita | Onde o DPO atende | SLA interno |
|---|---|---|---|
| I — Confirmação de existência de tratamento | Form em `/lgpd/direitos` (público) → ticket | `/admin/lgpd/requests` | 48h úteis |
| II — Acesso | Mesmo form, com validação de identidade (link mágico no e-mail informado) | UI admin gera JSON-export | 15 dias |
| III — Correção | Form ou contato direto | UI admin edita Lead/User | 5 dias úteis |
| IV — Anonimização, bloqueio ou eliminação | Form | Botão "Anonimizar lead" → substitui nome/email/telefone por hashes, mantém métricas agregadas | 15 dias |
| V — Portabilidade | Form | JSON download estruturado (mesma rota do II) | 15 dias |
| VI — Eliminação dos dados tratados com base em consentimento | Form | Hard-delete + propagação para Botyio | 15 dias |
| VII — Informação sobre compartilhamento | Resposta automatizada (lista fixa: Botyio, Google/Featurable, Meta, MinIO/S3, MaxMind, ANPD em caso de incidente) | template em `/lgpd/direitos` | imediato |
| VIII — Informação sobre não consentir e consequências | Texto fixo na própria página de cookies | público | sempre disponível |
| IX — Revogação do consentimento | Botão "Gerenciar cookies" no rodapé + revogação por categoria | aplicado imediatamente; emit `aumaf:consent` | imediato |

**Canal único:**
- E-mail institucional: `felipe@aumaf3d.com.br`
- Encarregado titular: Luiz Felipe Lampa Risse — `felipe@aumaf3d.com.br`
- Backup do Encarregado: Marcos Ninelli — `marcos@aumaf3d.com.br`
- Página: `/lgpd/direitos` (formulário + captcha)
- WhatsApp comercial: +55 (16) 99286-3412 (canal não preferencial; tickets são redirecionados ao e-mail institucional)

---

## 7. Encarregado pelo Tratamento (DPO)

A **Res. CD/ANPD nº 2/2022** dispensa formalmente a designação de encarregado para **agentes de tratamento de pequeno porte**, **desde que** seja disponibilizado **canal de comunicação claro, funcional e acessível** com o titular ([gov.br/anpd](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022)).

**Recomendação para AUMAF 3D:**

- Enquadrar-se formalmente como **agente de pequeno porte** (microempresa/pequeno porte conforme LC 123/2006 — ⚠️ confirmar faturamento com contabilidade).
- **Mesmo dispensada formalmente, AUMAF optou por designar Encarregado** — bom posicionamento institucional e simplifica auditoria futura.
- **Encarregado titular:** Luiz Felipe Lampa Risse (`felipe@aumaf3d.com.br`).
- **Backup:** Marcos Ninelli (`marcos@aumaf3d.com.br`).
- **Canal institucional:** `felipe@aumaf3d.com.br`.
- Publicar identificação do Encarregado na Política de Privacidade (nome + e-mail institucional).
- Se AUMAF crescer ou começar a processar dados sensíveis em volume, **rever em 12 meses** a necessidade de DPO terceirizado especializado.

---

## 8. Documentos Legais a Produzir

Todos os documentos vivem em `frontend-public/src/pages/` (versões públicas) e em `docs/compliance/` (versões controladas internamente, com histórico de versões).

### 8.1 Política de Privacidade — `/politica-de-privacidade`

✅ **Criada em `docs/legal/politica-de-privacidade.md`** (v1.0 — vigente 2026-05-12). Resta apenas portar para página Astro em Fase A2.

Outline (15 seções):

1. **Quem somos** — razão social, CNPJ, endereço (São Carlos/SP), canal LGPD.
2. **A quem se aplica** — visitantes do site, leads, usuários do backoffice.
3. **Quais dados coletamos** — referência ao inventário (seção 3 deste plano), em linguagem simples.
4. **Por que coletamos cada dado** — finalidades + base legal LGPD lado a lado.
5. **Como coletamos** — formulário, cookies de 1ª parte (analytics próprio), embeds de 3ª parte (Featurable, Behold.so), scripts opcionais (GA4, Clarity, Pixel) que **só carregam após consentimento**.
6. **Cookies e tecnologias similares** — link para `/politica-de-cookies`.
7. **Com quem compartilhamos** — lista nominal: Botyio, Featurable (Google), Behold.so (Meta), Google/Microsoft/Meta (se autorizado), MaxMind (GeoIP), provedores de e-mail (SMTP), MinIO/S3.
8. **Transferência internacional** — declarar quais operadores estão fora do Brasil (Botyio ⚠️, Featurable EUA, Behold.so EUA, MaxMind EUA, AWS us-east, OpenAI/Anthropic EUA). Base do art. 33: cláusulas contratuais padrão / país com nível adequado.
9. **Por quanto tempo guardamos** — tabela de retenção da seção 11.
10. **Como protegemos** — TLS, hash bcrypt para senhas, JWT em cookie httpOnly, IP hasheado nos analytics, secrets cifrados (`IntegrationSecret` AES-GCM), backups criptografados, controle de acesso RBAC.
11. **Seus direitos** — referência ao art. 18 + canal `/lgpd/direitos` + prazo de 15 dias.
12. **Crianças e adolescentes** — site não é direcionado a menores de 18 anos; não coletamos conscientemente.
13. **Atualizações desta política** — versionamento (Política v1.0 — 2026-MM-DD) + aviso por e-mail aos leads ativos.
14. **Como falar conosco** — canal LGPD.
15. **Legislação aplicável e foro** — LGPD + foro São Carlos/SP.

**Tamanho-alvo:** 1.500–2.500 palavras. Tom: PT-BR formal mas acessível, sem jargão jurídico desnecessário.

### 8.2 Termos de Uso — `/termos-de-uso`

✅ **Criados em `docs/legal/termos-de-uso.md`** (v1.0 — vigente 2026-05-12).

Outline (10 cláusulas):

1. **Objeto** — uso do site institucional + blog AUMAF 3D.
2. **Aceitação** — navegação implica aceitação.
3. **Cadastro** — somente backoffice; visitantes não precisam cadastrar.
4. **Uso permitido** — pessoal e informacional; vedado scraping massivo, engenharia reversa, ataque.
5. **Propriedade intelectual** — marca AUMAF 3D e identidade visual são da empresa; posts do blog (inclusive os gerados por IA) são de titularidade da AUMAF 3D, com revisão editorial humana; citações a terceiros seguem fair use jornalístico.
6. **Conteúdo gerado por IA** — divulgação de que parte do conteúdo editorial é assistida por IA (OpenAI/Anthropic/Gemini) com revisão humana; precisão técnica é responsabilidade da AUMAF.
7. **Limitação de responsabilidade** — o site é informacional; cotações reais só após contato formal; AUMAF não se responsabiliza por links externos.
8. **Disponibilidade** — esforço razoável; sem SLA público.
9. **Alterações** — termos podem ser atualizados; versão vigente sempre publicada.
10. **Foro** — São Carlos/SP; renúncia a foros mais privilegiados nos termos do CDC.

### 8.3 Política de Cookies — `/politica-de-cookies`

✅ **Criada em `docs/legal/politica-de-cookies.md`** (v1.0 — vigente 2026-05-12).

- Categorias (necessários/funcionais/analíticos/marketing) — texto explicativo.
- Tabela dinâmica espelhando a seção 4 deste plano.
- Botão "Gerenciar minhas preferências" → abre o componente CookieConsent em modo "Personalizar".
- Botão "Revogar todo consentimento" → reseta `aumaf_consent_v1` e recarrega.

### 8.4 Aviso de privacidade inline no formulário de contato

Adicionar abaixo do botão "Enviar Projeto" em `/contato`:

```
Ao enviar, você concorda que a AUMAF 3D use seus dados para retornar com o
orçamento solicitado. Leia nossa [Política de Privacidade](/politica-de-privacidade).
```

**Sem dark pattern** — não é checkbox; é aviso informativo, porque a base é "execução pré-contratual" (art. 7º V), não consentimento. Checkbox separado **somente** se for adicionada finalidade de marketing futura ("Quero receber novidades por e-mail").

### 8.5 Registro das Operações de Tratamento (ROPA)

✅ **Criado em `docs/compliance/ropa.md`**.

Arquivo interno. Estrutura:

- Identificação do controlador
- Identificação do encarregado/ponto focal
- Operações de tratamento (uma por finalidade) com: descrição, dados tratados, titulares afetados, base legal, retenção, medidas de segurança, transferência internacional, operadores
- Atualização: a cada nova integração ou nova finalidade

### 8.6 LIA — Legítimo Interesse para Analytics

✅ **Criada em `docs/compliance/lia-analytics.md`**.

Estrutura (modelo ANPD):

1. **Finalidade legítima** — entender uso do site para melhorar UX/conversão.
2. **Necessidade** — sem métricas não há iteração baseada em dado.
3. **Balanceamento** — vs. expectativas razoáveis do titular (esperado em qualquer site moderno); riscos baixos (IP hasheado, pseudonimização, sem profiling individual).
4. **Salvaguardas** — IP hasheado SHA-256+salt, sem cruzamento com Lead exceto via consentimento explícito, retenção 12 meses raw, opt-out via banner, política transparente.
5. **Conclusão** — legítimo interesse aplicável **apenas para pageview/sessão agregada**; eventos ricos exigem consentimento.

### 8.7 Plano de Resposta a Incidentes — `docs/compliance/incident-response.md`

✅ **Criado em `docs/compliance/incident-response.md`**.

Baseado em Res. CD/ANPD nº 15/2024 ([gov.br/anpd](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-aprova-o-regulamento-de-comunicacao-de-incidente-de-seguranca)):

1. **Detecção** — alertas Sentry, monitoring `/health`, denúncia interna.
2. **Triagem** (até 24h) — confirma se houve afetação de dado pessoal; classificação (baixo/médio/alto/crítico).
3. **Contenção** (até 48h) — rotaciona secrets (`IntegrationSecret`), revoga JWTs, snapshot do DB.
4. **Comunicação à ANPD** — **3 dias úteis** a partir da ciência ([Res. 15/2024 art. 5º](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis)) via portal `gov.br/anpd`.
5. **Comunicação aos titulares afetados** — mesmo prazo de 3 dias úteis; canal: e-mail individual + aviso público se >100 titulares.
6. **Registro** — manter por **5 anos** mesmo incidentes não reportados (Res. 15/2024 art. 9º).
7. **Pós-mortem** — em `docs/runbooks/production-incident.md`.

### 8.8 DPAs (Acordos de Operador) — checklist por fornecedor

✅ **Criado em `docs/compliance/dpa-checklist.md`**.

Para cada operador (Botyio, Featurable, Behold.so, AWS/S3, MaxMind, OpenAI/Anthropic, provedor de e-mail), validar/exigir:

- [ ] Finalidade específica de tratamento documentada
- [ ] Restrição de uso (não pode usar dados para treinar modelos sem autorização — crítico para OpenAI/Anthropic)
- [ ] Localização do tratamento (país)
- [ ] Medidas técnicas de segurança (TLS, criptografia em repouso, controle de acesso)
- [ ] Obrigação de comunicar incidente em ≤24h ao controlador
- [ ] Direito de auditoria
- [ ] Devolução/destruição ao final do contrato
- [ ] Cláusula sobre sub-operadores
- [ ] Foro Brasil ou cláusulas contratuais padrão para transferência internacional

---

## 9. Banner de Consentimento de Cookies — Spec Técnico Detalhado

### 9.1 Componente

`frontend-public/src/components/CookieConsent.astro` + ilha interativa client-side mínima (vanilla TS, sem React).

### 9.2 Estado persistido

LocalStorage chave `aumaf_consent_v1`:

```ts
type ConsentState = {
  version: 1
  timestamp: string          // ISO
  categories: {
    necessary: true          // sempre true (não-opcional)
    functional: boolean      // analytics 1ª parte (sessionId)
    analytics: boolean       // eventos ricos próprios + GA4 + Clarity
    marketing: boolean       // Meta Pixel, Featurable cookies de marketing, Behold tracking
  }
  source: 'banner' | 'manage-page' | 'api-revoke'
}
```

Versão bumps invalidam consentimento prévio → re-banner.

### 9.3 UI (alinhada ao DS Cinematic Additive Manufacturing)

**Banner inicial** — bottom-fixed, glass-panel, z-index acima do FAB:

- Texto curto (≤2 linhas): "Usamos cookies necessários para operar o site e, com sua autorização, cookies analíticos e de marketing. Você pode escolher."
- 3 botões **visualmente equivalentes** (mesmo peso, mesma cor primária — proibido dark pattern):
  - `Aceitar todos` (primary)
  - `Recusar não essenciais` (primary outline)
  - `Personalizar` (primary outline)
- Link `/politica-de-cookies` discreto à direita.

**Modal Personalizar** — abre dialog acessível (focus trap, ESC, ARIA):

- 4 seções (necessary/functional/analytics/marketing) com toggle (switch).
- "Necessários" travado em ON com tooltip explicativo.
- Cada seção lista cookies (lê do inventário `frontend-public/src/lib/cookie-inventory.ts`).
- Botões: `Salvar preferências` / `Aceitar todos` / `Recusar não essenciais`.

**Página `/preferencias-de-cookies`** — versão sempre acessível pelo rodapé do mesmo modal expandido para layout de página.

### 9.4 Eventos

```ts
window.dispatchEvent(new CustomEvent('aumaf:consent', { detail: state }))
```

Consumidores:

- `packages/analytics-sdk/src/index.ts` — escuta o evento; em `functional=false` para de mandar até `pageview`; em `analytics=false` para de mandar `click/scroll/track`.
- `Base.astro` — wrapper condicional para GA4/Clarity/Meta Pixel/GTM: scripts só são injetados após receber `analytics=true` ou `marketing=true` (ver §10).
- Featurable / Behold embeds — carregamento lazy: o `<script>` só é montado quando `marketing=true`. Placeholder grayscale + CTA "Ativar conteúdo de terceiros" se categoria recusada.

### 9.5 Consent Log no Backend (prova de consentimento)

Nova tabela Prisma:

```prisma
model ConsentLog {
  id          String   @id @default(cuid())
  visitorId   String?  // do cookie analytics; null se opt-out total
  userIdHash  String?  // hash do email se logado/lead
  categories  Json     // { necessary, functional, analytics, marketing }
  version     Int
  ipHash      String   // mesmo hash do analytics
  userAgent   String   @db.Text
  source      String   // 'banner' | 'manage-page' | 'api-revoke'
  createdAt   DateTime @default(now())

  @@index([visitorId])
  @@index([userIdHash])
  @@index([createdAt])
  @@map("consent_logs")
}
```

Endpoint: `POST /v1/consent` em `backend/src/routes/consent.routes.ts` — schema Zod em `packages/shared/src/schemas/consent.ts`. Rate-limit 30 req/min por IP. Não exige auth.

### 9.6 Re-consentimento

- Bump em `ConsentState.version` (ex. de 1 → 2) → componente detecta divergência e reabre.
- Toda nova finalidade adicionada (ex.: ativar Clarity onde antes não havia) **deve** subir a versão.

### 9.7 Pegadinhas conhecidas

- **Embeds carregados via SSR/SSG** — Featurable hoje injeta `<script>` em Astro estático. Mover para componente client-side com gating: `<FeaturableEmbed clientGate />` que monta o script só após `marketing=true`.
- **GTM container** — se carregado, **todas** as tags dentro dele dependem do consentimento. Usar `gtag('consent', 'default', {...})` + `gtag('consent', 'update', {...})` (modo "Consent Mode v2" do Google). Documentar no DPA com Google.
- **NoScript fallback** — banner não aparece com JS desabilitado; nesses casos **nenhum** script de terceiros carrega (default deny no SSR).

---

## 10. Mudanças no Código Atual — Lista Precisa

| Arquivo | O que muda | Estimativa |
|---|---|---|
| `frontend-public/src/components/CookieConsent.astro` *(novo)* | Componente banner + modal | 4h |
| `frontend-public/src/lib/cookie-inventory.ts` *(novo)* | Fonte única do inventário (cf. §4) | 0.5h |
| `frontend-public/src/lib/consent.ts` *(novo)* | API client-side: `getConsent()`, `setConsent()`, `onConsentChange()`, `sendConsentLog()` | 1.5h |
| `frontend-public/src/layouts/Base.astro` | Injetar `<CookieConsent />`; envolver scripts GA4/Clarity/Pixel/GTM em wrappers que aguardam evento `aumaf:consent` antes de inserir tag | 1.5h |
| `packages/analytics-sdk/src/index.ts` | (a) Não enviar nada até consent ser lido (≤200ms); (b) com `functional=false` parar TUDO; (c) com `analytics=false` filtrar tipos `click`/`scroll`/`track` mantendo `pageview` agregado (LIA); (d) escutar `aumaf:consent` para reagir em tempo real | 2h |
| `frontend-public/src/components/instagram/InstagramFeed.astro` | Substituir embed direto por placeholder + lazy mount quando `marketing=true` | 1h |
| `frontend-public/src/components/reviews/*` (Featurable) | Mesmo padrão lazy/gate | 1h |
| `frontend-public/src/pages/politica-de-privacidade.astro` *(novo)* | Página estática com a política da §8.1 | 2h (incl. copy) |
| `frontend-public/src/pages/termos-de-uso.astro` *(novo)* | §8.2 | 1.5h |
| `frontend-public/src/pages/politica-de-cookies.astro` *(novo)* | §8.3 + tabela viva do inventário | 1h |
| `frontend-public/src/pages/preferencias-de-cookies.astro` *(novo)* | Reabre o modal em layout de página | 0.5h |
| `frontend-public/src/pages/lgpd/direitos.astro` *(novo)* | Form de DSR (Data Subject Request) com captcha | 2h |
| `frontend-public/src/components/Footer.astro` | Adicionar bloco "Legal" com links: Política de Privacidade, Termos, Cookies, Preferências de Cookies, Canal LGPD | 0.5h |
| `frontend-public/src/pages/contato.astro` | Aviso inline §8.4 abaixo do submit | 0.2h |
| `backend/prisma/schema.prisma` | Adicionar `model ConsentLog` + (opcional) índice/coluna `expiresAt` em `AnalyticsEvent` para job de purge | 0.5h |
| `backend/prisma/migrations/<new>_consent_log/` | Migration | auto |
| `packages/shared/src/schemas/consent.ts` *(novo)* | Zod `ConsentLogCreateSchema` | 0.3h |
| `packages/shared/src/index.ts` | Exportar consent schemas | 0.1h |
| `backend/src/routes/consent.routes.ts` *(novo)* | `POST /v1/consent` + rate-limit | 1h |
| `backend/src/services/consent.service.ts` *(novo)* | Persistência + hashing IP (reusar `analytics-ingest.service.ts#hashIp`) | 0.5h |
| `backend/src/services/analytics-ingest.service.ts` | Política de retenção 12 meses raw via job de purge (não no ingest) | 0.3h |
| `backend/src/workers/data-retention.worker.ts` *(novo)* | Cron diário: purga `AnalyticsEvent` >12m, `AnalyticsRealtime` >24h (já existe?), leads "anonimizados" cumprem regra | 2h |
| `backend/src/workers/register.ts` | Registrar `data-retention` | 0.1h |
| `backend/src/routes/dsr.routes.ts` *(novo)* | `POST /v1/dsr/request` (público, captcha) + `GET/PATCH /v1/dsr/:id` (admin) | 3h |
| `backend/src/services/dsr.service.ts` *(novo)* | Anonimização Lead (substitui PII por hashes mantendo agregados), export PII por e-mail, hard-delete sob consentimento | 3h |
| `frontend-admin/src/features/lgpd/*` *(novo)* | UI `/admin/lgpd/requests`: lista, status, ações, export JSON | 4h |
| `frontend-admin/src/AppRouter.tsx` | Rota `/admin/lgpd/requests` + permissão `feature=lgpd action=admin` | 0.3h |
| `docs/compliance/ropa.md` *(novo)* | RoPA completa | 1.5h |
| `docs/compliance/lia-analytics.md` *(novo)* | LIA | 1h |
| `docs/compliance/incident-response.md` *(novo)* | Runbook §8.7 | 1.5h |
| `docs/compliance/dpa-checklist.md` *(novo)* | §8.8 + status por fornecedor | 0.5h |
| `docs/compliance/CHANGELOG.md` *(novo)* | Versionamento de Política/Termos/Cookies | 0.1h |

---

## 11. Plano de Retenção e Descarte

| Entidade | Retenção raw | Retenção agregada | Gatilho de descarte |
|---|---|---|---|
| `Lead` (não anonimizado) | 5 anos pós-último contato (cf. CDC 5 anos prescricionais) | indefinido (contagem agregada) | Cron diário marca `deletedAt`; após 30d hard-delete |
| `Lead` anonimizado (a pedido do titular) | imediato (hash de nome/email/telefone) | mantém UTM, source, country | DSR-anonimize |
| `LeadNote` | acompanha o Lead | — | cascade |
| `AnalyticsEvent` | **12 meses** | rollups eternos (`AnalyticsDailyPageview`, `AnalyticsDailyEvent`, etc.) | Cron diário `data-retention`: `DELETE WHERE occurredAt < NOW() - INTERVAL '12 months'` |
| `AnalyticsSession` | 12 meses | — | mesmo cron |
| `AnalyticsRealtime` | 30 minutos | — | cron a cada 5 min (já previsto no design analytics) |
| `ConsentLog` | 5 anos pós revogação ou pós último consentimento | — | cron mensal |
| `User` (ativo) | enquanto vínculo | — | manual ao desligamento |
| `User` (inativo) | + 5 anos | — | cron anual flag |
| `BotyoWebhookDelivery` | 90 dias | — | cron diário |
| `MediaAsset` | enquanto referenciado | — | cleanup orfãos cron semanal |
| Logs Caddy/Pino | **6 meses obrigatório** (Marco Civil art. 13), até 12 meses máx | — | logrotate no host |
| Backups DB | 30 dias rolling + 1 snapshot trimestral por 5 anos | — | política infra |

**Implementação:** worker BullMQ `data-retention` rodando cron `0 3 * * *` (3h da manhã America/Sao_Paulo). Log estruturado com counts. Métrica `data_retention_deleted_total{entity=...}`.

---

## 12. Direitos do Titular — Implementação Técnica

### 12.1 Página pública `/lgpd/direitos`

Form com: tipo de solicitação (radio), nome, e-mail, descrição, captcha (Cloudflare Turnstile ou hCaptcha). Envia para `POST /v1/dsr/request`.

### 12.2 Validação de identidade

Backend gera token mágico assinado (JWT 24h) e envia ao e-mail informado. Titular clica → confirma. Sem confirmação em 7d, ticket é descartado. Evita ataque de enumeração e DSR fraudulento.

### 12.3 Backend — `POST /v1/dsr/request`

```ts
const DsrRequestSchema = z.object({
  type: z.enum(['confirmation','access','rectification','anonymization','portability','deletion','revoke_consent','info_sharing']),
  email: z.string().email(),
  fullName: z.string().min(2).max(120),
  description: z.string().max(2000).optional(),
  captchaToken: z.string()
})
```

Cria `model DsrRequest` (id, type, email, status `pending|verified|in_progress|completed|rejected`, requestedAt, completedAt, notesAdmin).

### 12.4 UI admin `/admin/lgpd/requests`

- Lista paginada com filtros (status, tipo, prazo).
- Indicador visual de prazo legal (verde: ≤7d, amarelo: 8-12d, vermelho: 13-15d, preto: vencido).
- Detalhe do ticket: dados do solicitante, e-mails relacionados encontrados (Lead/User), botões de ação:
  - "Exportar dados (JSON)" — gera download e log
  - "Anonimizar Lead" — invoca `dsr.service.anonymize(leadId)`
  - "Eliminar Lead (hard)" — só ativa após confirmação
  - "Resposta livre" — template + e-mail
- Permissão: `feature=lgpd action=admin` (default só ADMIN).

### 12.5 Anonimização — função `anonymizeLead`

```ts
// pseudo-código
async function anonymizeLead(leadId: string) {
  const hash = (v: string) => sha256(v + env.PII_ANON_SALT).slice(0,16)
  await prisma.lead.update({ where: { id: leadId }, data: {
    name: `anon-${hash(lead.name)}`,
    email: `anon-${hash(lead.email)}@anonymized.local`,
    phone: null,
    message: null,
  }})
  // mantém: source, utm*, referrer, landingPage, createdAt, botyoStatus
  // não toca: AnalyticsEvent (já pseudonimizado por design)
  await audit.log({ action: 'lgpd.anonymize', leadId, by: actorId })
}
```

### 12.6 Exportação (portabilidade + acesso)

JSON estruturado:

```json
{
  "subject": { "name": "...", "email": "..." },
  "leads": [...],
  "leadNotes": [...],
  "analytics": { "sessions": [...], "events_count_by_type": {...} },
  "consent_logs": [...],
  "exportedAt": "2026-...",
  "controller": { "name": "AUMAF 3D ...", "cnpj": "..." }
}
```

---

## 13. Transferência Internacional

| Operador | Localização provável | Base art. 33 | Ação |
|---|---|---|---|
| Botyio | Brasil (confirmado em 2026-05-12) | Sem necessidade de cláusulas de transferência internacional | Item 1 da Fase A |
| Featurable | EUA | Cláusulas contratuais padrão; declarar na Política | Texto na Política |
| Behold.so | EUA | Idem | Idem |
| MaxMind (GeoIP) | EUA (DB local) | DB roda **on-prem**; nenhum dado sai. Não é transferência. | Documentar |
| AWS S3 / MinIO local | MinIO em VPS Brasil (Hostinger) | Sem transferência se MinIO local; se migrar p/ S3 us-east, cláusulas | Validar bucket |
| Provedor de e-mail (SMTP) | depende | ⚠️ confirmar | Item da Fase A |
| OpenAI / Anthropic | EUA | Cláusulas + opt-out de treino | Confirmar contratos atuais |

---

## 14. Roadmap — Fases, Tasks Atômicas e Estimativas

> Formato GSD/PLAN.md. Toda task: `[ ] descrição — arquivo(s) — critério de aceite — estimativa`.

### Fase A — Documentos legais e bases (8h)

- [ ] **A1.** Coletar do cliente: razão social, CNPJ, endereço completo, e-mail LGPD, hospedagem do Botyio — *AskUser* — *resposta consolidada por escrito* — `0.5h`
- [ ] **A2.** Redigir Política de Privacidade v1.0 — `frontend-public/src/pages/politica-de-privacidade.astro` — *publicada, build verde, link no rodapé* — `2h`
- [ ] **A3.** Redigir Termos de Uso v1.0 — `.../termos-de-uso.astro` — *idem* — `1.5h`
- [ ] **A4.** Redigir Política de Cookies v1.0 — `.../politica-de-cookies.astro` — *tabela renderizada do `cookie-inventory.ts`* — `1h`
- [ ] **A5.** Criar `docs/compliance/ropa.md` — *cobre todas as finalidades da §3* — `1.5h`
- [ ] **A6.** Criar `docs/compliance/lia-analytics.md` — *4 seções modelo ANPD* — `1h`
- [ ] **A7.** Criar `docs/compliance/incident-response.md` + `dpa-checklist.md` — *runbook executável* — `0.5h`

**Definition of Done (Fase A):** páginas legais publicadas, links no rodapé, documentos internos versionados em git.

### Fase B — Banner de consentimento + consent log (12h)

- [ ] **B1.** `prisma schema` — adicionar `ConsentLog` + migration — *prisma migrate dev verde* — `0.5h`
- [ ] **B2.** Schema Zod compartilhado — `packages/shared/src/schemas/consent.ts` — *tipos exportados* — `0.3h`
- [ ] **B3.** Endpoint `POST /v1/consent` + service — `backend/src/routes/consent.routes.ts`, `backend/src/services/consent.service.ts` — *teste Jest 200/400/429* — `1.5h`
- [ ] **B4.** Fonte do inventário de cookies — `frontend-public/src/lib/cookie-inventory.ts` — *export tipado* — `0.5h`
- [ ] **B5.** API client-side `consent.ts` — *getConsent/setConsent/onConsentChange/sendConsentLog testados em DevTools* — `1.5h`
- [ ] **B6.** Componente `CookieConsent.astro` — banner + modal + a11y (focus trap, ESC, Tab) — *axe sem erros, 3 botões equivalentes* — `4h`
- [ ] **B7.** Página `/preferencias-de-cookies.astro` — *reabre modal* — `0.5h`
- [ ] **B8.** Storybook story do banner + modal — *3 variantes* — `1h` *(se mantemos Storybook para componentes admin; público não tem Storybook hoje — pode pular)*
- [ ] **B9.** Wire-up em `Base.astro` — *renderiza em todas as páginas, não bloqueia render* — `0.5h`
- [ ] **B10.** Testes E2E Playwright (frontend-admin? não — público não tem; usar test de integração mínimo) — *salvar preferência, recarregar página, estado persiste* — `2h`

**DoD (Fase B):** visitando o site limpo, banner aparece; aceitar/recusar/personalizar grava no localStorage e dispara `POST /v1/consent`; `ConsentLog` cresce no DB.

### Fase C — Gating de scripts terceiros + analytics opt-out (6h)

- [ ] **C1.** Refatorar `Base.astro` — extrair scripts GA4/Clarity/Pixel/GTM para componentes `<AnalyticsScripts categoryRequired="analytics" />` e `<MarketingScripts />` que aguardam evento `aumaf:consent` — *scripts não aparecem em DevTools se categoria=false* — `2h`
- [ ] **C2.** Modificar `analytics-sdk` — gating por categoria; `pageview` ainda envia em `functional=true`, demais só em `analytics=true` — *medir em prod-like* — `1.5h`
- [ ] **C3.** Lazy-mount de Featurable + Behold — placeholder com CTA "Ativar conteúdo de terceiros" — `1.5h`
- [ ] **C4.** Implementar Google Consent Mode v2 (default `denied`) no GTM/GA4 — *snippet inicial antes do GTM* — `1h`

**DoD (Fase C):** com consentimento recusado, **nenhum** request a `googletagmanager.com`, `clarity.ms`, `connect.facebook.net`, `featurable.com`, `behold.so` aparece no Network.

### Fase D — Direitos do titular (UI pública + backoffice) (12h)

- [ ] **D1.** Prisma — adicionar `model DsrRequest` + migration — `0.5h`
- [ ] **D2.** Schemas Zod compartilhados — `packages/shared/src/schemas/dsr.ts` — `0.5h`
- [ ] **D3.** Rotas backend `POST /v1/dsr/request` (público), `GET /v1/dsr` (admin), `PATCH /v1/dsr/:id` (admin), `POST /v1/dsr/:id/verify` (público com token) — *tests Jest* — `2.5h`
- [ ] **D4.** `dsr.service.ts` — anonymizeLead, exportSubjectData, hardDeleteLead, sendVerificationEmail — *tests unitários* — `2.5h`
- [ ] **D5.** Página pública `/lgpd/direitos.astro` com captcha + form — `2h`
- [ ] **D6.** UI admin `/admin/lgpd/requests` (lista + detalhe + ações) — `4h`

**DoD (Fase D):** end-to-end: visitante envia DSR → recebe e-mail → confirma → admin vê ticket → executa anonimização → DB atualizado → admin marca "completed".

### Fase E — Retenção e descarte (5h)

- [ ] **E1.** Worker `data-retention.worker.ts` + registrar em `workers/register.ts` — *cron 0 3 * * * com pg-boss-like via BullMQ Repeatable Job* — `2h`
- [ ] **E2.** Lógica de purga por entidade (cf. §11) — `2h`
- [ ] **E3.** Métricas Prometheus `data_retention_deleted_total` + alerta no `/health` se job não rodar em 26h — `1h`

**DoD (Fase E):** rodar manualmente em ambiente de dev com dados envelhecidos → contadores corretos → logs Pino estruturados.

### Fase F — Auditoria final e go-live (3h)

- [ ] **F1.** Checklist DPO/cliente: cada item da §15 verificado — `1h`
- [ ] **F2.** Varrer páginas em DevTools (Aplicação > Cookies + Network) com banner em 3 estados (aceito tudo / recusado / só funcional) — *resultados conferem* — `1h`
- [ ] **F3.** Atualizar `CLAUDE.md` raiz com seção "Conformidade LGPD" apontando para `docs/compliance/` e canal LGPD — `0.2h`
- [ ] **F4.** PR de release `feat/lgpd-compliance` → review → merge → smoke test em produção — `0.8h`

**Total estimado:** **~46 horas** = ~6 dias úteis de 1 dev sênior ≈ **3 semanas calendário** com outras frentes em paralelo.

---

## 15. Critérios de Aceitação — Definition of Done global

- [ ] Política de Privacidade publicada e linkada em todas as páginas (rodapé).
- [ ] Termos de Uso publicados e linkados.
- [ ] Política de Cookies publicada com tabela viva.
- [ ] Banner de consentimento aparece em primeira visita; opções equivalentes; sem dark pattern.
- [ ] `ConsentLog` registrando cada escolha com IP hasheado + UA + versão.
- [ ] GA4 / Clarity / Meta Pixel / GTM / Featurable / Behold **não** carregam sem consentimento da categoria correspondente.
- [ ] Analytics próprio respeita `functional` e `analytics` flags.
- [ ] Página `/lgpd/direitos` funcional; ticket E2E aprovado.
- [ ] UI admin `/admin/lgpd/requests` operacional com SLA visual.
- [ ] Worker `data-retention` rodando diariamente; métrica exposta.
- [ ] Runbook de incidente versionado; canais ANPD/titulares definidos.
- [ ] DPAs/cláusulas com Botyio, Featurable, Behold, AWS/MinIO documentados (mesmo que parcial — listar pendentes).
- [ ] `CLAUDE.md` atualizado com seção LGPD.
- [ ] Smoke test em produção: banner visível, consent log gravando, GA4/Clarity inativos sem opt-in.

---

## 16. Riscos e Decisões Pendentes (AskUser para Kayo + AUMAF)

1. ✅ **RESOLVIDO — Razão social, CNPJ e endereço oficial** — AUMAF 3D PRINTING A NEW WORLD LTDA, CNPJ 46.357.355/0001-33, Alameda Sinlioku Tanaka, 202 — Parque Tecnológico Damha II — São Carlos/SP — CEP 13565-261. Foro: Comarca de São Carlos – SP. Fonte: Ficha Cadastral oficial.
2. ✅ **RESOLVIDO — E-mail do Encarregado** — `felipe@aumaf3d.com.br` (decisão do cliente em 2026-05-12, sem alias institucional).
3. ✅ **RESOLVIDO — Encarregado designado** — Luiz Felipe Lampa Risse (`felipe@aumaf3d.com.br`), backup Marcos Ninelli (`marcos@aumaf3d.com.br`). **Sujeito a confirmação formal interna** (assinatura em ata ou termo de designação).
4. **DPO externo terceirizado?** — não é necessário (agente de pequeno porte), mas se AUMAF preferir blindagem extra, há ofertas no mercado por R$300–800/mês. Decisão go/no-go.
5. ✅ **RESOLVIDO — Hospedagem do Botyio** — operador hospedado no **Brasil** (confirmado pelo cliente em 2026-05-12). Não há transferência internacional para esta operação.
6. **Prazos comerciais reais** — quanto tempo AUMAF realmente precisa guardar Lead após último contato? Proposto 5 anos (CDC). Pode reduzir para 2 ou 3.
7. **Arquivos .STL/.STEP enviados** — são propriedade intelectual do cliente; retenção menor (2 anos pós-projeto) e descarte físico? Confirmar política comercial.
8. **Conteúdo do blog gerado por IA citando pessoas** — política editorial: revisar manualmente toda citação a indivíduos identificáveis antes de publicar? (Recomendado.)
9. **Cookie de marketing (Meta Pixel/Pixel TikTok) — vão ser ativados em campanha paga?** Se sim, banner precisa estar 100% pronto **antes** de qualquer ativação.
10. **Idade mínima** — algum produto AUMAF tem público B2C com risco de menor? Provavelmente não (B2B industrial), mas confirmar.
11. **Captcha** — Cloudflare Turnstile (preferido — sem custo, sem rastreamento) vs hCaptcha vs reCAPTCHA. ⚠️ reCAPTCHA implica consentimento de marketing/analytics Google.
12. ⚠️ **Auditoria jurídica externa PENDENTE** — recomendado que os textos da Política/Termos/Cookies criados em `docs/legal/` passem por **revisão de advogado de privacidade** antes da publicação em produção.

---

## 17. Referências

### Legislação primária

- [Lei nº 13.709/2018 — Lei Geral de Proteção de Dados (LGPD), texto compilado — planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709compilado.htm)
- [Lei nº 12.965/2014 — Marco Civil da Internet — planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm)
- [Decreto nº 8.771/2016 — regulamenta o Marco Civil — planalto.gov.br](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/decreto/d8771.htm)
- [Lei nº 8.078/1990 — Código de Defesa do Consumidor — planalto.gov.br](http://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm)

### Resoluções ANPD

- [Resolução CD/ANPD nº 2, de 27/01/2022 — Regulamento para agentes de tratamento de pequeno porte — gov.br/anpd](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022)
- [Resolução CD/ANPD nº 4, de 24/02/2023 — Regulamento de Dosimetria e Aplicação de Sanções Administrativas — gov.br/anpd](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-publica-regulamento-de-dosimetria/Resolucaon4CDANPD24.02.2023.pdf)
- [Resolução CD/ANPD nº 15, de 24/04/2024 — Regulamento de Comunicação de Incidente de Segurança — gov.br/anpd](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-aprova-o-regulamento-de-comunicacao-de-incidente-de-seguranca)
- [Canal oficial de Comunicado de Incidente de Segurança (CIS) — gov.br/anpd](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis)

### Guias ANPD

- [Guia Orientativo "Cookies e Proteção de Dados Pessoais" (PDF, out/2022) — gov.br/anpd](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf)
- [Página do guia de cookies — gov.br/anpd](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais)

### Análises de mercado consultadas

- [LGPD Dispensa do Encarregado para Micro e Pequenas Empresas — blog.bcompliance.com.br](https://blog.bcompliance.com.br/2025/07/11/lgpd-pequenas-empresas-dispensa-dpo-canal-comunicacao/)
- [Resolução CD/ANPD nº 4: dosimetria e sanções — totvs.com](https://www.totvs.com/blog/adequacao-a-legislacao/dosimetria/)
- [Guia Orientativo de Cookies da ANPD — techcompliance.org](https://techcompliance.org/guia-orientativo-de-cookies/)
- [Direitos do titular (art. 18) — santiago.rs.gov.br/lgpd](https://www.santiago.rs.gov.br/lgpd/direitos-doa-titular)
- [ANPD aprova Regulamento de Comunicação de Incidente — cesconbarrieu.com.br](https://cesconbarrieu.com.br/anpd-aprova-o-regulamento-de-comunicacao-de-incidente-de-seguranca/)

### Documentação técnica relacionada

- `docs/plans/2026-05-12-analytics-layer-design.md` — pipeline analytics próprio que motivou este plano
- `backend/prisma/schema.prisma` — modelos atuais
- `backend/src/services/analytics-ingest.service.ts` — hashing de IP, GeoIP, enrichment
- `frontend-public/src/layouts/Base.astro` — pontos de injeção de scripts terceiros

---

**⚠️ Aviso final:** este plano é uma proposta técnica e regulatória elaborada por engenheiro com boa-fé. **Não substitui parecer jurídico.** Antes da publicação dos textos legais (Política, Termos, Cookies) é fortemente recomendado revisão por advogado especialista em privacidade.
