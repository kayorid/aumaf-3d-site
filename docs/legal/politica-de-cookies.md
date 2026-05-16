# Política de Cookies — AUMAF 3D

**Versão:** 1.0
**Vigente desde:** 12 de maio de 2026
**Última atualização:** 12 de maio de 2026

Esta Política de Cookies explica o que são cookies, como a AUMAF 3D os utiliza no site **www.aumaf3d.com.br**, quais categorias estão presentes e como você pode gerenciar suas preferências. Esta Política deve ser lida em conjunto com a [Política de Privacidade](/politica-de-privacidade) e com os [Termos de Uso](/termos-de-uso).

---

## 1. O que são Cookies?

**Cookies** são pequenos arquivos de texto que um site armazena no seu dispositivo (computador, celular, tablet) durante a navegação. Eles servem para lembrar suas preferências, manter você conectado, medir o uso do site e oferecer experiências personalizadas.

Também utilizamos **tecnologias similares**, como **localStorage** e **sessionStorage** (armazenamento local do navegador), que cumprem função equivalente aos cookies e estão sujeitas às mesmas regras desta Política.

Cookies podem ser:

- **De primeira parte (first-party):** criados pelo próprio site AUMAF 3D.
- **De terceiros (third-party):** criados por serviços externos integrados às nossas páginas (ex.: Google Analytics, Meta Pixel).
- **De sessão:** apagados quando você fecha o navegador.
- **Persistentes:** ficam no seu dispositivo por um prazo determinado.

---

## 2. Como a AUMAF 3D Usa Cookies

Utilizamos cookies para:

1. Garantir o **funcionamento básico** do site (autenticação de área administrativa, registro de consentimento);
2. Oferecer **funcionalidades** que dependem de preferências do usuário (sessão de analytics próprio para deduplicação);
3. Realizar **análise agregada de uso** do site (páginas mais acessadas, fluxo de navegação, dispositivos);
4. Quando você consentir explicitamente, integrar **serviços de marketing e atribuição de campanhas** (Meta Pixel, Google Ads).

Seguimos as orientações do **Guia Orientativo "Cookies e Proteção de Dados Pessoais" da ANPD** (outubro de 2022) e da [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709compilado.htm). Cookies que não sejam estritamente necessários só são ativados após o seu **consentimento livre, informado e específico**, manifestado por meio do nosso banner de cookies.

---

## 3. Categorias de Cookies

| Categoria | Descrição | Base legal | Exige consentimento? |
|---|---|---|---|
| **Necessários** | Indispensáveis para o funcionamento básico do site, como autenticação do backoffice, registro da sua escolha de consentimento e segurança contra fraude | art. 7º, II e IX, LGPD | Não (carregam sempre) |
| **Funcionais** | Permitem funcionalidades extras como deduplicação de sessão no analytics próprio e memorização de preferências de navegação | art. 7º, IX, LGPD (legítimo interesse) | Pode ser desativado nas preferências |
| **Analíticos** | Coletam dados agregados sobre o uso do site para nos ajudar a melhorar a experiência. Inclui Google Analytics 4 e Microsoft Clarity | art. 7º, I, LGPD (consentimento) | **Sim** |
| **Marketing** | Permitem segmentar anúncios, mensurar campanhas e personalizar conteúdo em redes sociais. Inclui Meta Pixel e cookies de marketing dos embeds Instagram (Behold) e Google Reviews (Featurable) | art. 7º, I, LGPD (consentimento) | **Sim** |

---

## 4. Inventário Detalhado de Cookies e Tecnologias Similares

A tabela abaixo lista todos os cookies e tecnologias similares utilizados pelo site. Pode haver pequenas variações conforme a evolução das integrações; mantemos esta tabela atualizada e versionada.

### 4.1 Cookies de Primeira Parte (AUMAF 3D)

| Nome / chave | Categoria | Tecnologia | Finalidade | Duração |
|---|---|---|---|---|
| `aumaf_consent_v1` | Necessário | localStorage | Armazena sua escolha de consentimento (prova legal) | 12 meses |
| `aumaf_session` | Necessário (analytics próprio) | localStorage | Identificador de sessão para agrupamento de eventos | Sessão (≈30 min de inatividade) |
| `aumaf_uid` | Analítico | localStorage | Identificador anônimo de visitante (hash) para deduplicação e métricas agregadas | 12 meses |
| `aumaf_session` (JWT) — *backoffice* | Necessário | Cookie HTTPOnly Secure | Autenticação de colaboradores no backoffice | Sessão |
| `aumaf_utm` | Funcional | sessionStorage | Atribuição da campanha (UTM) de origem | Sessão |

### 4.2 Cookies de Terceiros

| Nome / chave | Categoria | Domínio | Provedor | Finalidade | Duração |
|---|---|---|---|---|---|
| `_ga` | Analítico | aumaf3d.com.br | Google LLC | Identificador único de usuário do Google Analytics 4 | 2 anos |
| `_ga_<container>` | Analítico | aumaf3d.com.br | Google LLC | Estado da sessão GA4 | 2 anos |
| `_gid` | Analítico | aumaf3d.com.br | Google LLC | Distinção de usuários | 24 horas |
| `_clck` | Analítico | clarity.ms | Microsoft Corp. | Identificador persistente do Microsoft Clarity | 1 ano |
| `_clsk` | Analítico | clarity.ms | Microsoft Corp. | Identificador de sessão do Clarity | 1 dia |
| `MUID` | Analítico | clarity.ms | Microsoft Corp. | Identificador entre serviços Microsoft | 1 ano |
| `_fbp` | Marketing | aumaf3d.com.br | Meta Platforms | Identificador para atribuição de anúncios via Meta Pixel | 90 dias |
| `_fbc` | Marketing | aumaf3d.com.br | Meta Platforms | Click-id da campanha Meta | 90 dias |
| `_gtm`, `_dc_gtm_*` | Analítico/Marketing | aumaf3d.com.br | Google LLC | Container Google Tag Manager (depende das tags ativadas) | Variável |
| Cookies do widget Featurable | Analítico | featurable.com | Featurable, Inc. | Embed de avaliações do Google Meu Negócio | Sessão/persistente conforme provedor |
| Cookies de embed Behold/Instagram | Marketing | behold.so / instagram.com | Behold.so / Meta Platforms | Embed do feed do Instagram | Persistente conforme provedor |
| Cookies do canal Botyio/WhatsApp | Necessário/Funcional | botyio.* | Botyio | Encaminhamento de leads ao WhatsApp (verificar inventário com o operador) | Variável |

> A AUMAF 3D **não tem controle direto** sobre o ciclo de vida, a finalidade exata e a estrutura dos cookies definidos por terceiros. Consulte as políticas de cada provedor para detalhes adicionais: [Google](https://policies.google.com/), [Microsoft](https://privacy.microsoft.com/), [Meta](https://www.facebook.com/policy.php), [Featurable](https://featurable.com/), [Behold](https://behold.so/).

---

## 5. Como Gerenciar suas Preferências de Cookies

Você pode gerenciar suas preferências a qualquer momento:

### 5.1 Banner de Consentimento

Na sua primeira visita, exibimos um **banner** com três opções equivalentes:

- **Aceitar todos** — habilita todas as categorias (necessários, funcionais, analíticos e marketing).
- **Recusar não essenciais** — mantém apenas os cookies necessários.
- **Personalizar** — abre o painel para escolher categoria por categoria.

### 5.2 Página de Preferências

A qualquer momento, mesmo após a escolha inicial, você pode revisar e modificar suas preferências em:

**[/preferencias-de-cookies](/preferencias-de-cookies)**

Há também um link discreto "Preferências de Cookies" no rodapé de todas as páginas.

### 5.3 Configurações do Navegador

Você também pode configurar diretamente o seu navegador para bloquear ou apagar cookies. Veja as instruções oficiais:

- [Google Chrome](https://support.google.com/chrome/answer/95647)
- [Mozilla Firefox](https://support.mozilla.org/pt-BR/kb/protecao-aprimorada-rastreamento-firefox-desktop)
- [Microsoft Edge](https://support.microsoft.com/pt-br/microsoft-edge)
- [Apple Safari](https://support.apple.com/pt-br/guide/safari/welcome)

### 5.4 Revogação Total

Você pode revogar todo o seu consentimento clicando em "Revogar todo consentimento" na página de preferências. A escolha é registrada em `ConsentLog` no nosso servidor como prova de auditoria, e os cookies não essenciais são removidos.

---

## 6. Consequências de Recusar Cookies

A LGPD garante o direito de **não fornecer consentimento** e de ser informado sobre as consequências da negativa (art. 18, VIII). Em resumo:

- **Recusar cookies necessários:** não é possível — sem eles o site não funciona corretamente (autenticação do admin, registro do próprio consentimento). Eles não contêm dado pessoal identificável diretamente.
- **Recusar cookies funcionais:** o analytics próprio deixará de deduplicar sessões; o site continua plenamente utilizável.
- **Recusar cookies analíticos:** não receberemos métricas detalhadas de comportamento; o site continua funcional. Não há prejuízo para o titular.
- **Recusar cookies de marketing:** os embeds de Instagram e de avaliações do Google podem ser exibidos como placeholders, e anúncios externos não serão personalizados. Você pode reativar a qualquer momento.

---

## 7. Atualizações desta Política de Cookies

A AUMAF 3D pode atualizar esta Política em razão de mudanças nas integrações, evolução legislativa ou orientações da ANPD. Toda atualização será publicada nesta página com a data de vigência.

**Em caso de inclusão de nova categoria de cookie ou de mudança substancial nas finalidades**, a versão do consentimento (`aumaf_consent_v1` → `aumaf_consent_v2`) será incrementada e você será novamente convidado a manifestar sua escolha.

**Histórico de versões:**

| Versão | Data | Resumo |
|---|---|---|
| 1.0 | 2026-05-12 | Versão inicial |

---

## Assinatura

**AUMAF 3D PRINTING A NEW WORLD LTDA**
CNPJ: 46.357.355/0001-33
Alameda Sinlioku Tanaka, 202 — Parque Tecnológico Damha II — CEP 13565-261 — São Carlos/SP
Canal LGPD: felipe@aumaf3d.com.br

*Última atualização: 12 de maio de 2026 — Versão 1.0*
