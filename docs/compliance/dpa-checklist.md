# Checklist de Acordo de Tratamento com Operadores (DPA)

**Documento interno — controlado | NÃO publicar**
**Versão:** 1.0
**Vigente desde:** 12 de maio de 2026
**Próxima revisão:** semestral ou a cada nova integração

Este checklist apoia a AUMAF 3D na verificação e formalização de **Acordos de Tratamento de Dados (Data Processing Agreement — DPA)** com cada operador que processa dados pessoais por sua conta, em conformidade com o **art. 39 da LGPD**.

---

## 1. Cláusulas Mínimas Exigidas em Todo DPA

Todo contrato/aceite com operador deve cobrir:

- [ ] **Finalidade específica e restrita** do tratamento, conforme instrução do controlador;
- [ ] **Obrigação de seguir as instruções** documentadas do controlador (AUMAF 3D);
- [ ] **Sigilo e confidencialidade** sobre os dados pessoais acessados;
- [ ] **Medidas técnicas e organizacionais de segurança** (TLS em trânsito, criptografia em repouso, controle de acesso, segregação de ambientes);
- [ ] **Subcontratação** (sub-operadores) — necessidade de autorização prévia ou notificação;
- [ ] **Assistência ao controlador** no exercício de direitos do titular (acesso, eliminação, portabilidade);
- [ ] **Notificação de incidente** ao controlador em prazo curto (idealmente ≤24h) com informações suficientes para que a AUMAF 3D cumpra o prazo de 3 dias úteis com a ANPD;
- [ ] **Eliminação ou devolução** dos dados pessoais ao fim do contrato;
- [ ] **Direito de auditoria** (ou apresentação de relatórios de certificação como SOC 2, ISO 27001);
- [ ] **Transferência internacional** declarada e amparada (cláusulas contratuais padrão, país com nível adequado, ou consentimento do titular).

---

## 2. Status por Operador

Legenda:
- ✅ **DPA padrão público adequado** — termos do operador já cobrem; basta arquivar referência
- ⚠️ **Formalizar** — exige assinatura, aceite formal ou negociação adicional
- ❌ **Crítico** — incompatibilidade ou risco identificado

| Operador | Categoria de dado | País do tratamento | Status DPA | Ação pendente |
|---|---|---|---|---|
| **Botyio** | Lead WhatsApp (nome, telefone, histórico) |  Brasil | ⚠️ Formalizar | Solicitar DPA escrito + revisar callback URL; rotacionar API key se exigido |
| **Featurable** | Embed de avaliações Google Meu Negócio | Estados Unidos | ⚠️ Formalizar | Aceitar Terms públicos como referência; documentar uso de cookies de terceiros |
| **Behold.so** | Embed do feed Instagram | Estados Unidos | ⚠️ Formalizar | Aceitar Terms públicos; carregamento condicionado a consentimento de marketing |
| **Google LLC** (GA4, GTM, Workspace, Meu Negócio) | Identificadores de cliente, eventos, e-mail corporativo | Estados Unidos | ✅ DPA público via [business.safety.google](https://business.safety.google/) e Google Workspace DPA | Arquivar referência em docs |
| **Microsoft Corp.** (Clarity) | Identificadores, gravação de sessão | Estados Unidos | ✅ Termos do Clarity incluem cláusulas de proteção | Arquivar referência |
| **Meta Platforms** (Pixel, Instagram) | Identificadores, eventos de conversão | Estados Unidos / Irlanda | ✅ Business Tools Terms cobrem | Arquivar referência; ativar Consent Mode no GTM |
| **OpenAI** | Conteúdo editorial (prompts/resp); **sem PII de visitante** | Estados Unidos | ✅ Termos de API incluem cláusulas de "no training on API data" (planos pagos) | Confirmar tipo de conta + opt-out de treino |
| **Anthropic** | Conteúdo editorial | Estados Unidos | ✅ Termos de API garantem não-treino em conta paga | Confirmar plano contratado |
| **Amazon Web Services (S3)** | Mídias do blog (sem PII em regra) | A definir (us-east ou sa-east) | ✅ DPA padrão AWS GDPR/LGPD compatível em [aws.amazon.com/compliance/data-protection-agreement](https://aws.amazon.com/compliance/data-protection-agreement/) | Aceitar formal pelo console + escolher região |
| **Hostinger** | Hospedagem VPS (todo o stack) | Brasil | ⚠️ Formalizar | Validar DPA específico Hostinger (ou termos gerais); confirmar região do datacenter |
| **MaxMind (GeoIP)** | Apenas base local instalada — sem envio de dado | n/a | ✅ Não há transferência de dado | Documentar uso licenciado |
| **Provedor SMTP** (a definir: Gmail, SendGrid, AWS SES, etc.) | E-mail de leads e notificações internas | A definir | ⚠️ Formalizar | Escolher provedor + aceitar DPA |

---

## 3. Cláusulas Específicas por Risco

### 3.1 Operadores com transferência internacional (EUA/UE)

Para Featurable, Behold, Google, Microsoft, Meta, OpenAI, Anthropic, AWS:

- Comparar com art. 33 LGPD — base aplicada: cláusulas contratuais padrão ou consentimento informado (banner de cookies);
- Documentar na Política de Privacidade item 7 (✅ já documentado);
- Reavaliar em caso de pronunciamento futuro da ANPD sobre lista de países com nível adequado.

### 3.2 Operadores de IA (OpenAI, Anthropic)

Cláusulas críticas:

- [ ] Confirmar plano **API paga** (não plano gratuito/ChatGPT consumer);
- [ ] Verificar opt-out explícito de **uso de prompts/respostas para treinar modelos**;
- [ ] Garantir que **nenhum dado pessoal de visitante** seja enviado em prompts (somente conteúdo editorial);
- [ ] Manter revisão humana de todo conteúdo gerado antes da publicação (Termos de Uso item 6.2).

### 3.3 Botyio — operador crítico

- [ ] Solicitar **documento escrito** (e-mail formal ou cláusula contratual) sobre país do tratamento;
- [ ] Confirmar que o Botyio **não usa dados de leads para fins próprios** além da entrega ao WhatsApp;
- [ ] Confirmar **prazo de retenção** no lado do Botyio;
- [ ] Validar **assinatura HMAC** do webhook e canal seguro de notificação de incidente.

---

## 4. Procedimento de Atualização

- A cada **nova integração** com operador externo, o desenvolvedor responsável adiciona linha nesta tabela antes do go-live;
- Encarregado revisa **trimestralmente** o status de cada DPA;
- DPAs assinados/aceitos são arquivados em local restrito (gestor de senhas corporativo da AUMAF 3D), com referência cruzada nesta tabela.

---

## 5. Pendências Imediatas (Maio/2026)

1. [ ] **Botyio** — solicitar DPA formal;
2. [ ] **Hostinger** — validar DPA específico ou aceitar termos gerais por escrito;
3. [ ] **Provedor SMTP** — definir e formalizar;
4. [ ] **OpenAI / Anthropic** — confirmar plano API e opt-out de treino em conta corporativa AUMAF;
5. [ ] **Featurable / Behold** — arquivar evidência de aceite dos Terms aplicáveis;
6. [ ] **AWS** — caso seja migrado MinIO → S3 em produção, aceitar DPA padrão antes da migração.

---

*Documento sujeito à revisão jurídica antes da homologação final.*
