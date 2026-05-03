# Q3 Foundation — Status

**Fase atual:** implement (em curso)
**Última atualização:** 2026-05-03

## Próximo passo concreto

Implementar T1.1 (lib/redis.ts) e seguir cadência de commits granulares por fase.

## Decisões registradas

| Data | Decisão | Razão |
|------|---------|-------|
| 2026-05-03 | Workers no mesmo processo Express | Ops simples; servidor pequeno suficiente |
| 2026-05-03 | Email transport console (dev) + stub (prod) | Não bloquear go-live; SMTP entra com prod |
| 2026-05-03 | BullMQ + IORedis (já no package.json) | Stack já decidida; nada de novo |
| 2026-05-03 | Health endpoint agregado | Visibilidade unificada |
| 2026-05-03 | Storybook só para frontend-admin | `frontend-public/` continua bloqueado |
| 2026-05-03 | Botyo e Deploy fora desta iteração | Dependências externas (API + provider) |

## Perguntas em aberto

- Nenhuma — todas as ambiguidades foram fechadas no clarify.

## Blockers

- Nenhum.

## Histórico de fase

| Data | Fase | Notas |
|------|------|-------|
| 2026-05-03 | specify+clarify | Requirements + Q&A em uma rodada |
| 2026-05-03 | plan+tasks | Design técnico + decomposição em tasks |
| 2026-05-03 | implement | Em andamento — branch `feat/q3-foundation` |
