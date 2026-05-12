# Plano de Resposta a Incidente de Segurança envolvendo Dados Pessoais

**Documento interno — controlado | NÃO publicar**
**Versão:** 1.0
**Vigente desde:** 12 de maio de 2026
**Próxima revisão:** anual ou após cada incidente

Este runbook define o processo da AUMAF 3D para detecção, contenção, avaliação, comunicação e remediação de **incidentes de segurança envolvendo dados pessoais**, em conformidade com o **art. 48 da LGPD** e com a **Resolução CD/ANPD nº 15, de 24 de abril de 2024**.

---

## 1. Definição de Incidente

Considera-se **incidente de segurança envolvendo dados pessoais** qualquer evento, **confirmado ou suspeito**, de:

- **Acesso não autorizado** a sistemas, bancos de dados ou backups;
- **Vazamento** (exposição pública involuntária de dados pessoais);
- **Perda** acidental ou intencional;
- **Alteração não autorizada** (integridade comprometida);
- **Destruição** acidental ou maliciosa de dados pessoais;
- **Indisponibilidade** prolongada que afete o exercício de direitos do titular;
- **Falha de operador** comunicada pelo próprio operador (ex.: Botyio, AWS, Featurable).

Incidentes que **não** envolvam dados pessoais (ex.: defacement de página estática sem coleta) são tratados como incidentes operacionais e seguem o runbook `docs/runbooks/production-incident.md`.

---

## 2. Papéis e Responsabilidades

| Papel | Responsável padrão | Responsabilidade |
|---|---|---|
| **Descobridor** | Quem detecta primeiro | Notifica o Encarregado imediatamente |
| **Encarregado titular (DPO)** | Luiz Felipe Lampa Risse (`felipe@aumaf3d.com.br`) | Coordena resposta, comunica ANPD e titulares |
| **Encarregado backup** | Marcos Ninelli (`marcos@aumaf3d.com.br`) | Substitui o titular em ausência |
| **Controlador** | AUMAF 3D PRINTING A NEW WORLD LTDA (representado pelos sócios) | Decide medidas estratégicas e jurídicas |
| **Time técnico** | kayoridolfi.ai (`kayocdi@gmail.com`) | Executa contenção, forense e remediação |
| **Jurídico** | A definir (advogado externo de privacidade) | Apoia comunicação à ANPD e gestão de risco regulatório |

---

## 3. Fluxo de Resposta — 6 Etapas

```
┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
│ 1. Detecção  │ → │ 2. Contenção │ → │ 3. Avaliação     │
└──────────────┘   └──────────────┘   └────────┬─────────┘
                                               │
              ┌─────────────────────────┐      │
              │ 4. Comunicação interna  │ ←────┘
              └────────────┬────────────┘
                           ↓
              ┌─────────────────────────┐
              │ 5. ANPD + titulares     │   (até 3 dias úteis)
              └────────────┬────────────┘
                           ↓
              ┌─────────────────────────┐
              │ 6. Pós-mortem + correção│
              └─────────────────────────┘
```

### Etapa 1 — Detecção (T0)

Fontes possíveis:

- Alertas do **Sentry** (erro 500, exceção não tratada);
- Endpoint `/health` reportando falha em DB/Redis/queues;
- Logs Caddy/Pino com padrões suspeitos (volume anômalo de 4xx/5xx, tentativas de brute-force);
- Notificação de fornecedor (Botyio, AWS, Hostinger, OpenAI, etc.);
- Denúncia externa (titular, autoridade pública, pesquisador de segurança, jornalista);
- Achado interno (developer, colaborador, sócio).

**Ação imediata do descobridor:** registrar o que viu (data, hora, evidência, sistema afetado) e **comunicar o Encarregado em até 1 hora**.

### Etapa 2 — Contenção (T0 → T+24h)

Coordenada pelo Encarregado + time técnico:

- **Isolar** o sistema/serviço afetado se possível (snapshot do DB antes);
- **Rotacionar credenciais** comprometidas: `JWT_SECRET`, `ANALYTICS_IP_SALT`, master key do `IntegrationSecret`, senhas de admin;
- **Revogar sessões ativas** do backoffice (invalidar todos os JWTs);
- **Coletar evidência forense** (logs, dumps, screenshots) antes de qualquer ação destrutiva;
- **Notificar fornecedores** envolvidos.

### Etapa 3 — Avaliação de Impacto (T+24h → T+72h)

| Pergunta | Resposta |
|---|---|
| Houve realmente dado pessoal envolvido? | Sim/Não |
| Quantos titulares foram afetados? | Número estimado |
| Quais categorias de dado? (identificação, contato, sensível?) | Lista |
| Há risco para direitos e liberdades dos titulares? | Avaliação (baixo/médio/alto/crítico) |
| Há mitigação técnica posterior ao incidente? (criptografia, anonimização) | Sim/Não |
| O incidente foi efetivamente comunicado por terceiros maliciosos? | Sim/Não |

A classificação de risco segue o **Anexo I da Res. CD/ANPD nº 15/2024**.

### Etapa 4 — Comunicação Interna

- Encarregado informa sócios da AUMAF 3D em reunião urgente;
- Decisão sobre ativação de jurídico externo;
- Definição de porta-voz único para comunicação externa.

### Etapa 5 — Comunicação à ANPD e aos Titulares

**Prazo legal: até 3 (três) dias úteis** a contar da ciência do incidente, conforme **art. 5º da Res. CD/ANPD nº 15/2024**.

#### 5.1 Comunicação à ANPD

- Canal oficial: **portal pcd.anpd.gov.br** — formulário CIS (Comunicado de Incidente de Segurança);
- Conteúdo mínimo: descrição do incidente, categorias e número estimado de titulares e dados afetados, salvaguardas técnicas, riscos, medidas adotadas e a adotar, contato do Encarregado.

**Template — Comunicado à ANPD (CIS):**

```
1. IDENTIFICAÇÃO DO CONTROLADOR
   Razão social: AUMAF 3D PRINTING A NEW WORLD LTDA
   CNPJ: 46.357.355/0001-33
   Endereço: Alameda Sinlioku Tanaka, 202 — Parque Tecnológico Damha II — São Carlos/SP — CEP 13565-261

2. IDENTIFICAÇÃO DO ENCARREGADO
   Nome: Luiz Felipe Lampa Risse
   E-mail: felipe@aumaf3d.com.br
   Canal institucional: felipe@aumaf3d.com.br

3. DATA E HORA DO INCIDENTE / CIÊNCIA
   Ocorrência: [data/hora estimadas]
   Ciência: [data/hora do registro pelo Encarregado]

4. NATUREZA E CATEGORIAS DE DADOS AFETADOS
   [Descrição: leads, analytics, usuários internos, etc.]

5. NÚMERO ESTIMADO DE TITULARES AFETADOS
   [Estimativa em ordem de grandeza, mesmo que aproximada]

6. CONSEQUÊNCIAS PROVÁVEIS
   [Risco analisado: exposição de dados de contato; risco financeiro/reputacional]

7. MEDIDAS ADOTADAS
   [Contenção, rotação de credenciais, isolamento, etc.]

8. MEDIDAS A ADOTAR
   [Auditoria, hardening, treinamento, etc.]

9. COMUNICAÇÃO AOS TITULARES
   [Já realizada / a realizar em até X dias; canal: e-mail individual + aviso público se >100]
```

#### 5.2 Comunicação aos Titulares

Quando o incidente puder acarretar **risco ou dano relevante** aos titulares, comunicar individualmente por e-mail e, se mais de 100 titulares afetados, publicar aviso público no site dentro do mesmo prazo de 3 dias úteis.

**Template — Notificação ao titular:**

```
Assunto: Comunicado importante sobre seus dados pessoais — AUMAF 3D

Prezado(a) [Nome],

A AUMAF 3D informa que, em [data], identificou um incidente de segurança
que pode ter afetado dados pessoais sob nossa responsabilidade, incluindo
informações que você nos forneceu.

O que aconteceu: [descrição clara, sem jargão técnico]
Quais dados foram potencialmente envolvidos: [categorias]
O que estamos fazendo: [contenção, remediação, comunicação à ANPD]
O que você pode fazer: [recomendações: trocar senha em outros serviços
caso reutilize, atenção a tentativas de phishing, etc.]

Estamos à disposição pelo canal institucional felipe@aumaf3d.com.br.

Atenciosamente,
Luiz Felipe Lampa Risse
Encarregado pela Proteção de Dados Pessoais
AUMAF 3D PRINTING A NEW WORLD LTDA
CNPJ 46.357.355/0001-33
```

### Etapa 6 — Pós-mortem e Plano de Correção

- Documentar **causa raiz** em `docs/runbooks/production-incident.md` ou arquivo dedicado;
- Listar **ações corretivas** com responsável e prazo;
- Reavaliar **controles preventivos** (RBAC, hardening, treinamento);
- Atualizar este plano se houver lacunas;
- Reter registro do incidente por **5 anos** (art. 9º Res. 15/2024), mesmo se não comunicado à ANPD.

---

## 4. Contatos de Emergência

| Função | Pessoa | Canal | Disponibilidade |
|---|---|---|---|
| Encarregado titular | Luiz Felipe Lampa Risse | felipe@aumaf3d.com.br / WhatsApp (16) 99286-3412 | 24x7 (escalonamento) |
| Encarregado backup | Marcos Ninelli | marcos@aumaf3d.com.br | Horário comercial |
| Desenvolvedor / time técnico | kayoridolfi.ai (Kayo Ridolfi) | kayocdi@gmail.com | Sob demanda |
| ANPD — canal de incidentes | [pcd.anpd.gov.br](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis) | Portal web | 24x7 |
| Hostinger (infra VPS) | suporte oficial via painel | Painel | 24x7 |
| Botyio | suporte do operador | A confirmar | A confirmar |
| Jurídico externo | A definir | A definir | A definir |

---

## 5. Anexos

- Resolução CD/ANPD nº 15/2024 — [gov.br/anpd](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-aprova-o-regulamento-de-comunicacao-de-incidente-de-seguranca)
- Política de Privacidade pública — `docs/legal/politica-de-privacidade.md`
- ROPA interno — `docs/compliance/ropa.md`
- LIA do analytics — `docs/compliance/lia-analytics.md`
- Checklist de DPA — `docs/compliance/dpa-checklist.md`

---

*Documento sujeito à revisão jurídica antes da homologação final.*
