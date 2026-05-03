# Tasks — q2-blog-backoffice

> Quebra executável do design. Marque com `[P]` tarefas paralelizáveis e `[CHECKPOINT]` aquelas que exigem revisão humana antes de prosseguir.

**Linkado a**: [design.md](./design.md)
**Última atualização**: 2026-05-02

---

## Convenções

- `[P]` — paralelizável (não toca arquivos de outras tasks pendentes)
- `[CHECKPOINT]` — para e pede revisão humana
- `(<arquivo>)` — arquivo principal tocado
- `→ <criterio EARS>` — qual critério a task satisfaz
- Ordem importa quando há dependência; numeração explicita

---

## Setup inicial

- [ ] **T1** — <Criar branch a partir de main, configurar ambiente>
  - Critério de pronto: branch criada, dependências instaladas, build local passa

## Backend

- [ ] **T2** — <Adicionar modelo Prisma `NovoModelo`> (`backend/prisma/schema.prisma`) → R1
  - Critério de pronto: migration gerada, `npx prisma migrate dev` passa
- [ ] **T3** [P] — <Implementar service `NovoModeloService.create`> (`backend/src/services/novo-modelo.service.ts`) → R1, R5
  - Critério de pronto: 3 testes unitários verdes (caso feliz, caso de erro, edge case X)
- [ ] **T4** [P] — <Adicionar handler `POST /api/v1/novo-recurso`> (`backend/src/routes/novo-recurso.routes.ts`) → R1
  - Critério de pronto: requisição autenticada retorna 201; teste de integração passa

## Frontend

- [ ] **T5** [P] — <Criar componente `<NovoComponente />`> (`frontend/src/features/.../NovoComponente.tsx`) → R2
  - Critério de pronto: Storybook story renderiza, snapshot test passa
- [ ] **T6** — <Conectar componente ao endpoint via TanStack Query> (`frontend/src/features/.../use-novo-recurso.ts`) → R2
  - Critério de pronto: feature flag local liga e o componente exibe dados reais

## Validação cruzada

- [ ] **T7** [CHECKPOINT] — <Revisar contratos com PM antes de E2E>
  - Critério de pronto: PM confirmou contratos via comentário no PR

## E2E e validation

- [ ] **T8** — <E2E spec cobrindo R2, R3, R5> (`e2e/feature.spec.ts`)
  - Critério de pronto: spec verde local + CI
- [ ] **T9** — <Validation report contra requirements.md no `status.md`>
  - Critério de pronto: tabela de validação preenchida, todos os critérios EARS endereçados

## Documentação e fechamento

- [ ] **T10** — <Atualizar runbook operacional se aplicável> (`docs/runbooks/<nome>.md`)
- [ ] **T11** — <Criar ADR se houve decisão arquitetural não trivial> (`docs/adrs/NNN-...md`)
- [ ] **T12** [CHECKPOINT] — <Solicitar code review>
- [ ] **T13** — <Retrospectiva e arquivamento (mover para `_completed/`)>

---

## Notas de execução

- Use checkbox markdown como tracking real-time. Marque conforme concluir.
- Tarefas com `[P]` podem ser distribuídas para subagentes paralelos.
- Em `[CHECKPOINT]`, **pare** e atualize `status.md` antes de pedir revisão.
- Se uma task descobrir necessidade fora de escopo, registre em `status.md` (seção "Descobertas"). **Não enxerte** sem voltar ao requirements.
