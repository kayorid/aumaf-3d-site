# Registro de Operações de Tratamento de Dados Pessoais (ROPA)

**Documento interno — controlado | NÃO publicar**
**Versão:** 1.0
**Vigente desde:** 12 de maio de 2026
**Próxima revisão:** 12 de novembro de 2026 (semestral) ou a cada nova integração

Este Registro atende ao **artigo 37 da LGPD** e segue o modelo do *Guia Orientativo para Elaboração de Registro das Operações de Tratamento de Dados Pessoais* publicado pela ANPD.

---

## 0. Identificação do Controlador

- **Razão social:** AUMAF 3D PRINTING A NEW WORLD LTDA
- **CNPJ:** 46.357.355/0001-33
- **Endereço:** Alameda Sinlioku Tanaka, 202 — Parque Tecnológico Damha II — CEP 13565-261 — São Carlos/SP
- **Encarregado titular:** Luiz Felipe Lampa Risse — felipe@aumaf3d.com.br
- **Backup do Encarregado:** Marcos Ninelli — marcos@aumaf3d.com.br
- **Canal institucional:** felipe@aumaf3d.com.br
- **Enquadramento ANPD:** Agente de tratamento de pequeno porte (Res. CD/ANPD nº 2/2022) — *a confirmar com contabilidade*.

---

## OP-01 — Lead via Formulário de Contato (/contato)

| Campo | Descrição |
|---|---|
| **Finalidade** | Atender solicitação de orçamento e proposta comercial de impressão 3D; comunicação preparatória de contrato |
| **Base legal (art. 7º LGPD)** | V — execução de procedimentos preliminares relacionados a contrato |
| **Categorias de titulares** | Pessoas físicas interessadas em serviços B2B/B2C; representantes de empresas |
| **Categorias de dados** | Nome, sobrenome, e-mail, telefone, empresa, tipo de projeto, material de interesse, mensagem livre, arquivo técnico (.STL/.STEP/.PDF), referrer, landingPage, UTMs |
| **Origem da coleta** | Formulário web `/contato` |
| **Destinatários (operadores)** | Botyio (encaminhamento ao WhatsApp), provedor SMTP (notificação interna por e-mail) |
| **Transferência internacional** | Não há transferência internacional para Botyio (operador hospedado no Brasil) |
| **Prazo de retenção** | 5 anos pós-último contato (CDC); arquivos técnicos: 2 anos pós-projeto |
| **Medidas de segurança** | TLS na coleta; banco PostgreSQL com acesso restrito por RBAC; backups criptografados; logs de auditoria |
| **Compartilhamento com terceiros** | Apenas operadores listados acima |
| **Responsável interno** | Encarregado (Luiz Felipe) + equipe comercial |

---

## OP-02 — Analytics Próprio (Pageview, Sessão, Eventos)

| Campo | Descrição |
|---|---|
| **Finalidade** | Métrica agregada de uso do site para decisões de produto e melhoria contínua |
| **Base legal (art. 7º LGPD)** | IX — legítimo interesse (pageview/sessão); I — consentimento (eventos comportamentais ricos `data-track`) |
| **LIA** | Documentada em `docs/compliance/lia-analytics.md` |
| **Categorias de titulares** | Visitantes do site (qualquer pessoa) |
| **Categorias de dados** | sessionId (`aumaf_session`), visitorId hash (`aumaf_uid`), URL, referrer, user-agent parseado, viewport, idioma, IP hasheado SHA-256+salt, GeoIP cidade/UF, eventos `data-track` |
| **Origem da coleta** | SDK `packages/analytics-sdk` no site público |
| **Destinatários (operadores)** | Nenhum operador externo (pipeline 100% interno) |
| **Transferência internacional** | Não |
| **Prazo de retenção** | 12 meses para dados brutos; rollups agregados (sem PII) por até 5 anos |
| **Medidas de segurança** | IP nunca persistido em claro; salt secreto rotacionável; banco protegido por RBAC; worker `data-retention` agendado |
| **Responsável interno** | Encarregado + desenvolvedor (kayoridolfi.ai) |

---

## OP-03 — Atendimento WhatsApp via Botyio

| Campo | Descrição |
|---|---|
| **Finalidade** | Continuar atendimento comercial pelo canal preferencial do titular |
| **Base legal (art. 7º LGPD)** | V — execução de procedimentos preliminares de contrato |
| **Categorias de titulares** | Leads que iniciaram contato via `/contato` ou diretamente pelo WhatsApp |
| **Categorias de dados** | Número de telefone, nome de contato exibido no WhatsApp, histórico de mensagens, status de entrega |
| **Origem da coleta** | Encaminhamento do backend AUMAF para o Botyio (operador) |
| **Destinatários** | Botyio (operador); Meta Platforms (provedor do WhatsApp Business API, sub-operador) |
| **Transferência internacional** | Botyio: Brasil (sem transferência). WhatsApp Business API (Meta) processa fora do Brasil |
| **Prazo de retenção** | 5 anos pós-último contato no histórico interno; no Botyio conforme política do operador |
| **Medidas de segurança** | Credenciais Botyio cifradas em repouso (AES-GCM); webhook autenticado por assinatura HMAC; logs de auditoria |
| **DPA** | ⚠️ pendente — ver `dpa-checklist.md` |

---

## OP-04 — Usuários do Backoffice (Colaboradores)

| Campo | Descrição |
|---|---|
| **Finalidade** | Autenticação e autorização de colaboradores no sistema interno de gestão |
| **Base legal (art. 7º LGPD)** | V — execução de contrato (de trabalho ou prestação de serviços) |
| **Categorias de titulares** | Funcionários, prestadores e parceiros autorizados da AUMAF 3D |
| **Categorias de dados** | Nome, e-mail corporativo, telefone, foto de perfil (opcional), função, papel (role), hash de senha (bcrypt), logs de login |
| **Origem da coleta** | Cadastro interno feito por administrador do sistema |
| **Destinatários** | Nenhum (uso estritamente interno) |
| **Transferência internacional** | Não |
| **Prazo de retenção** | Enquanto durar o vínculo + 5 anos pós-desligamento (obrigações fiscais/trabalhistas) |
| **Medidas de segurança** | Senha em bcrypt; JWT em cookie HTTPOnly; RBAC com matriz de permissões feature×ação; logs de auditoria de ações sensíveis |

---

## OP-05 — Cookies de Terceiros (GA4, Clarity, Meta Pixel, GTM)

| Campo | Descrição |
|---|---|
| **Finalidade** | Análise de audiência (GA4, Clarity) e atribuição de campanhas pagas (Meta Pixel) |
| **Base legal (art. 7º LGPD)** | I — consentimento livre, informado e específico do titular |
| **Categorias de titulares** | Visitantes que consentiram com a categoria correspondente no banner de cookies |
| **Categorias de dados** | Identificadores únicos de cliente, fingerprint do navegador, eventos de pageview e clique, gravação de sessão (Clarity), conversões de campanha |
| **Origem da coleta** | Scripts de terceiros carregados condicionalmente em `Base.astro` após evento `aumaf:consent` |
| **Destinatários** | Google LLC, Microsoft Corp., Meta Platforms |
| **Transferência internacional** | Sim — Estados Unidos. Salvaguardas: cláusulas contratuais padrão dos termos de cada operador |
| **Prazo de retenção** | Conforme política de cada provedor (ver Política de Cookies) |
| **Medidas de segurança** | Carregamento gated por consentimento; Google Consent Mode v2 com default `denied`; possibilidade de revogação no painel de preferências |

---

## OP-06 — Logs de Acesso (Marco Civil)

| Campo | Descrição |
|---|---|
| **Finalidade** | Cumprir obrigação legal de guarda de registros de acesso pelo provedor de aplicação |
| **Base legal (art. 7º LGPD)** | II — cumprimento de obrigação legal ou regulatória (Marco Civil, art. 15) |
| **Categorias de titulares** | Qualquer visitante do site e usuários do backoffice |
| **Categorias de dados** | Endereço IP (em claro nesta operação, distinto do hash do analytics), user-agent, path, timestamp, código de status |
| **Origem da coleta** | Caddy (servidor web) + Pino (aplicação) |
| **Destinatários** | Nenhum (uso interno) — disponibilizado mediante ordem judicial |
| **Transferência internacional** | Não |
| **Prazo de retenção** | 6 meses obrigatórios; até 12 meses máximo |
| **Medidas de segurança** | Logs em volume restrito do servidor; logrotate com criptografia em backup; acesso por SSH com chave |

---

## OP-07 — Mídias do Blog/Admin (MinIO/S3)

| Campo | Descrição |
|---|---|
| **Finalidade** | Armazenar imagens e anexos de posts do blog e materiais do backoffice |
| **Base legal (art. 7º LGPD)** | V — execução de contrato (operador) |
| **Categorias de titulares** | Eventualmente pessoas retratadas em imagens do portfólio (sob autorização) |
| **Categorias de dados** | Imagens, anexos. Geralmente sem PII; eventualmente fotos de pessoas com autorização escrita |
| **Origem da coleta** | Upload via UI do admin (`/media`) |
| **Destinatários** | MinIO em VPS Brasil (atual) ou AWS S3 (alternativa de produção) |
| **Transferência internacional** | Não enquanto MinIO local; sim caso migre para AWS S3 |
| **Prazo de retenção** | Enquanto referenciado por algum post/conteúdo; cleanup semanal de órfãos |
| **Medidas de segurança** | Bucket privado; URLs assinadas; controle de acesso por papel no admin |

---

## Gestão deste Registro

- **Atualização obrigatória:** a cada nova integração, nova finalidade, mudança substancial em operador, ou no mínimo semestralmente.
- **Versionamento:** alterações são registradas no `docs/compliance/CHANGELOG.md` (a criar) e versionadas via git.
- **Responsável pela manutenção:** Encarregado em conjunto com o desenvolvedor responsável pela infraestrutura.
- **Acessibilidade:** documento disponível a qualquer fiscal da ANPD mediante requisição.
