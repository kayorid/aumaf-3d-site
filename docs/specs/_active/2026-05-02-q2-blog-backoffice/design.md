# Design — q2-blog-backoffice

> HOW desta feature. Como satisfazer cada critério de `requirements.md`.

**Linkado a**: [requirements.md](./requirements.md)
**Última atualização**: 2026-05-02

---

## 1. Visão geral da solução

<3-5 parágrafos descrevendo a abordagem em alto nível. Não detalhe ainda — apenas a forma da solução.>

## 2. Arquitetura

### Componentes envolvidos

```
[diagrama em texto/mermaid mostrando componentes e fluxos]

Cliente
  └─→ API <novo endpoint>
        └─→ <serviço novo/alterado>
              ├─→ Prisma → DB
              └─→ Worker BullMQ
```

### Mudanças por camada

- **Frontend**: <componentes novos/alterados>
- **Backend (API)**: <rotas/serviços novos/alterados>
- **Banco de dados**: <tabelas novas/alterações>
- **Infra**: <novas dependências, jobs, integrações>

## 3. Modelo de dados

### Mudanças no schema

```prisma
model NovoModelo {
  id        String @id @default(cuid())
  tenantId  String
  // ...
}
```

### Migrations necessárias

- <Migration 1: descrição + estratégia (online/offline, backfill?)>

## 4. Contratos de API

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/v1/<recurso>` | <propósito> | JWT + tenant |
| GET | `/api/v1/<recurso>/:id` | <propósito> | JWT + tenant |

### Schemas (Zod ou referência)

```typescript
const CreateRequest = z.object({
  // ...
});
```

## 5. Mapeamento Requirements → Design

> Para cada critério EARS de requirements.md, indicar onde no design ele é satisfeito.

| Critério | Componente/arquivo responsável | Notas |
|----------|--------------------------------|-------|
| R1 | <serviço/handler> | <como> |
| R2 | <componente> | <como> |
| R3 | <serviço> | <como> |

## 6. Integrações externas

| Serviço | Propósito | Custo | Limites |
|---------|-----------|-------|---------|
| <serviço> | <propósito> | <USD/mês> | <rate limit, etc.> |

## 7. Boundaries (harness anti-drift)

### ✅ Always (obrigatórios nesta feature)
- <Comportamento obrigatório 1>
- <Comportamento obrigatório 2>

### ⚠️ Ask first (exigem confirmação)
- <Ação que requer confirmação antes de executar>

### 🚫 Never (proibidos)
- <Comportamento proibido nesta feature>

## 8. Alternativas consideradas

| Opção | Prós | Contras | Veredito |
|-------|------|---------|----------|
| <opção A> | ... | ... | <escolhida/rejeitada — razão> |
| <opção B> | ... | ... | <escolhida/rejeitada — razão> |

## 9. Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| <risco 1> | baixa/média/alta | baixo/médio/alto | <plano> |

## 10. Plano de rollout

- [ ] Feature flag (se aplicável): `<nome-da-flag>`
- [ ] Rollout: <% inicial → 100%>
- [ ] Métricas a monitorar: <quais>
- [ ] Plano de rollback: <como>

## 11. Validation gate (pós-design)

> Antes de gerar tasks, releia este design e responda:

- [ ] Cada critério EARS está mapeado para um componente?
- [ ] Algum componente listado não é necessário para os critérios? (Cortar.)
- [ ] Alguma dependência externa não validada (versão, rate limit, custo)?
- [ ] Plano de rollback está concreto?
- [ ] Boundaries cobrem os cenários sensíveis?

Se algo falhar, **revisitar antes de tasks**.

## 12. Links

- Requirements: [requirements.md](./requirements.md)
- ADRs criados/relacionados: <links>
- Plano macro: <docs/plans/...>
