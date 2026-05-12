# LIA — Legitimate Interest Assessment do Analytics Próprio

**Documento interno — controlado | NÃO publicar**
**Versão:** 1.0
**Vigente desde:** 12 de maio de 2026
**Próxima revisão:** 12 de maio de 2027 (anual) ou a qualquer alteração substancial do pipeline

Este documento formaliza a **Avaliação de Legítimo Interesse (LIA)** do pipeline próprio de analytics da AUMAF 3D, em conformidade com o **artigo 7º, IX, da LGPD** e com a estrutura recomendada pela ANPD e pelo EDPB (European Data Protection Board). A LIA suporta a decisão de tratar dados pseudonimizados de navegação sob a base legal de **legítimo interesse**, distinguindo o que cabe nessa base e o que precisa de **consentimento**.

---

## 1. Identificação da Finalidade

### 1.1 Atividade de tratamento

Coleta, armazenamento, agregação e análise de dados de navegação no site **www.aumaf3d.com.br** por meio do pipeline interno de analytics (`packages/analytics-sdk` no frontend público + `backend/src/services/analytics-ingest.service.ts` no backend).

### 1.2 Finalidade declarada

- **Melhorar a experiência do usuário** (UX) por meio da identificação de páginas mais e menos eficazes, fluxos de navegação, dispositivos predominantes e gargalos de conversão;
- **Apoiar decisões de produto** baseadas em dados agregados (priorização de melhorias, validação de hipóteses);
- **Detectar abusos e padrões anômalos** (proteção contra fraude e raspagem).

### 1.3 Interesse legítimo perseguido

A AUMAF 3D, como controladora e prestadora de serviço de impressão 3D, tem interesse legítimo em **operar e melhorar continuamente o canal digital pelo qual capta oportunidades comerciais e divulga conteúdo técnico**. A coleta de métricas agregadas de navegação é prática **amplamente esperada e considerada aceitável** em qualquer site institucional moderno.

---

## 2. Necessidade do Tratamento

### 2.1 Por que analytics próprio (e não somente GA4)?

| Critério | Analytics próprio | GA4 / Clarity |
|---|---|---|
| Transferência internacional | **Não** (servidores em Brasil) | Sim (Estados Unidos) |
| Controle sobre o que é coletado | **Total** (código auditável) | Limitado pela política do provedor |
| Granularidade do dado pessoal | Pseudonimizado por design (IP hasheado) | Identificador persistente de cliente |
| Transparência ao titular | Política descreve campo a campo | Depende da política do provedor |
| Dependência de consentimento | Apenas pageview/sessão agregados sob legítimo interesse | Exige consentimento (LGPD art. 7º, I) |

A operação **apenas com cookies de terceiros (GA4)** **exigiria consentimento prévio explícito** e, sem ele, o site perderia toda visibilidade básica de tráfego. Manter um pipeline próprio com salvaguardas técnicas robustas é a **alternativa menos invasiva** que ainda permite à AUMAF 3D operar e melhorar o site.

### 2.2 Necessidade x proporcionalidade

- Coletamos **somente** o que é necessário para a finalidade declarada;
- **Não realizamos profiling individual** — não cruzamos identificadores de navegação com Lead exceto se o titular consentir;
- **Não vendemos, não compartilhamos e não comercializamos** dados de analytics;
- A retenção raw é limitada a **12 meses**, com purga automatizada por cron worker.

---

## 3. Teste de Balanceamento (Three-Part Test)

### 3.1 Direitos e liberdades do titular potencialmente afetados

- Direito à privacidade na navegação;
- Direito à autodeterminação informativa;
- Expectativa legítima de não ser rastreado individualmente.

### 3.2 Análise de proporcionalidade

| Critério | Avaliação |
|---|---|
| **Natureza do dado** | Pseudonimizado por design — IP hasheado SHA-256+salt, sem armazenamento em claro |
| **Sensibilidade** | Nenhum dado sensível (art. 5º, II, LGPD) é coletado |
| **Volume** | Limitado a eventos básicos de navegação por sessão |
| **Cruzamento** | Não há cruzamento individual com Lead exceto sob consentimento expresso |
| **Expectativa do titular** | Analytics é prática-padrão da web; titular **espera** que sites institucionais meçam uso agregado |
| **Risco para o titular** | Baixo — dados pseudonimizados, sem possibilidade prática de reidentificação |
| **Benefício para o controlador** | Médio-alto — métricas essenciais para a operação do canal digital |
| **Benefício para o titular** | Indireto — melhor UX, conteúdo mais relevante, site mais rápido |

### 3.3 Medidas de mitigação adotadas

- **Pseudonimização forte**: IP é hasheado SHA-256 com **sal secreto rotacionável** e truncado a 32 hex; nunca persistimos IP em claro;
- **GeoIP em granularidade reduzida**: apenas cidade/UF, sem coordenadas geográficas precisas;
- **Retenção curta**: 12 meses para dados brutos, com purga automática diária via worker BullMQ `data-retention`;
- **Agregação preferencial**: rollups diários e mensais consumidos pelo dashboard interno, com dados brutos acessados apenas em casos pontuais de investigação;
- **Transparência total**: Política de Privacidade descreve cada campo coletado;
- **Opt-out efetivo**: titular pode desativar a categoria "Funcional" no banner de cookies, e o SDK respeita o evento `aumaf:consent` em tempo real;
- **Restrição da base legal a coleta agregada**: eventos comportamentais ricos (cliques, scroll, formulário) **NÃO** ficam sob legítimo interesse — exigem consentimento na categoria "Analíticos".

### 3.4 Conclusão do balanceamento

O **legítimo interesse prevalece** para a coleta de pageview e sessão agregada com IP hasheado, **dadas as salvaguardas técnicas adotadas e o baixo risco residual ao titular**. Eventos ricos exigem consentimento por **precaução**, mesmo que arguivelmente caberiam também na base IX.

---

## 4. Salvaguardas Técnicas e Operacionais

| Salvaguarda | Implementação |
|---|---|
| Hash do IP | SHA-256 + salt secreto + trunc 32 hex em `analytics-ingest.service.ts#hashIp` |
| Sal rotacionável | Variável de ambiente `ANALYTICS_IP_SALT`, rotacionada a cada 12 meses sem afetar a continuidade da pseudonimização (hash nunca é revertido) |
| Retenção 12 meses raw | Worker BullMQ `data-retention` com cron `0 3 * * *` |
| Agregados por dashboard | Tabelas `AnalyticsDailyPageview`, `AnalyticsDailyEvent` com retenção até 5 anos |
| Opt-out funcional | Categoria "Funcional" do banner desativa SDK; categoria "Analíticos" filtra eventos ricos |
| Transparência | Política de Privacidade item 4.2; Política de Cookies item 4.1 |
| Acesso ao dado bruto | Restrito por RBAC no backoffice (`feature=analytics action=read`) |
| Auditoria | Logs Pino estruturados; métrica `data_retention_deleted_total` |

---

## 5. Direito de Oposição e Revisão

Em conformidade com o **art. 18, §2º, LGPD**, o titular pode opor-se a qualquer momento ao tratamento baseado em legítimo interesse. A oposição é operacionalizada por:

- Desativação da categoria "Funcional" no banner de cookies (interrompe a coleta no SDK);
- Solicitação via canal LGPD (`felipe@aumaf3d.com.br` ou `/lgpd/direitos`) para apagar registros existentes vinculados ao identificador de navegação informado.

O Encarregado revisará esta LIA **anualmente** ou sempre que houver alteração substancial no pipeline (nova categoria de evento, nova retenção, novo identificador).

---

## 6. Conclusão

A AUMAF 3D adota o **legítimo interesse (art. 7º, IX, LGPD)** como base legal **exclusivamente** para a coleta de:

- Pageview agregado;
- Identificador de sessão (`aumaf_session`) e visitante pseudonimizado (`aumaf_uid`);
- Atributos derivados de IP hasheado (cidade/UF, dedup);
- User-agent parseado e viewport.

Para **qualquer outra coleta** (eventos `data-track`, integração com GA4/Clarity/Pixel, cruzamento com Lead), a base é **consentimento explícito (art. 7º, I)** registrado em `ConsentLog`.

---

## Assinatura

**Encarregado pela Proteção de Dados Pessoais:** Luiz Felipe Lampa Risse
**E-mail:** felipe@aumaf3d.com.br
**Canal institucional:** felipe@aumaf3d.com.br
**Data de aprovação:** 12 de maio de 2026

*Documento sujeito à revisão jurídica externa antes da publicação produtiva.*
