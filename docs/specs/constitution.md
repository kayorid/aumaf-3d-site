# Constituição — AUMAF 3D

> Princípios não negociáveis deste projeto. Vivem mais que features individuais. Atualize apenas em mudança estrutural com ADR correspondente.

**Última revisão**: 2026-05-02  
**Aprovada por**: Kayo Ridolfi (kayoridolfi.ai)

---

## 1. Idioma e ortografia

- Idioma de UI: pt-BR
- Idioma de documentação e specs: pt-BR
- Acentuação obrigatória — sem substituir caracteres acentuados por ASCII (nunca "nao" por "não")
- Termos técnicos consagrados (API, JWT, endpoint, slug, etc.) ficam no original
- Comentários no código: apenas quando o PORQUÊ não é óbvio — sem comentários que descrevam o QUE

## 2. Stack core (não trocar sem ADR)

Ver **ADR-001** (`docs/decisions/ADR-001-stack.md`) para justificativas.

| Camada | Tech |
|--------|------|
| Backend | Node 18 + TypeScript + Express + Prisma + PostgreSQL 16 |
| Frontend público | Astro 5 + Tailwind CSS (SSG/SSR) |
| Frontend admin | React 18 + Vite + Tailwind + Radix UI |
| Shared | `@aumaf/shared` — schemas Zod (em `packages/shared/src`) |
| Cache/Filas | Redis 7 + BullMQ |
| Storage | MinIO (dev) / S3 (prod) |
| Auth | JWT em cookie httpOnly — **nunca localStorage** |
| Autorização | CASL |
| Testes BE | Jest |
| Testes FE | Vitest (unit) + Playwright (E2E) + Storybook (componentes) |
| Observabilidade | Pino (logs estruturados) + Sentry (FE + BE) |
| Build | Turbo (monorepo npm workspaces) |

## 3. Restrições absolutas de arquitetura

- **Sem multi-tenancy**: projeto single-tenant. Zero `tenantId` em qualquer lugar do schema Prisma ou queries.
- **Storybook obrigatório**: documentação de componentes nunca removida, mesmo sob pressão de prazo.
- **Playwright obrigatório**: cobertura E2E no frontend-admin por fluxo principal de cada entrega.
- **MinIO obrigatório**: todo upload de imagens do blog passa por MinIO (dev) / S3 (prod).
- **Imports `@aumaf/shared`** sempre de `packages/shared/src`, nunca caminho relativo direto.

## 4. Segurança

✅ **Always**
- JWT sempre em cookie httpOnly, sameSite: strict
- Toda rota autenticada do backend valida o token antes de qualquer lógica
- Variáveis sensíveis apenas em `.env` (não commitado)
- Mutations sensíveis (criação de usuário, publicação de post) registram entrada de log estruturado

⚠️ **Ask first**
- Qualquer migration Prisma que ALTER ou DROP coluna existente
- Qualquer adição de dependência runtime (não devDependency)
- Qualquer mudança em URL pública (afeta SEO/links externos)
- Qualquer integração com serviço externo (Botyo, GA4, Facebook Pixel, etc.)

🚫 **Never**
- Nunca commitar `.env`, chaves, tokens ou segredos
- Nunca usar `--no-verify` em git ou `--dangerously-skip-permissions`
- Nunca rodar `prisma migrate reset` sem confirmação humana explícita
- Nunca usar `localStorage` para dados de sessão/auth
- Nunca adicionar `tenantId` ao schema Prisma

## 5. Qualidade

- `npm run typecheck` deve passar limpo antes de qualquer commit — é gate de PR
- `npm run lint` sem warnings em código novo
- `npm run build` deve completar sem erros (todos os 4 workspaces)
- Testes unitários obrigatórios para regras de negócio críticas (validações Zod, lógica de negócio)
- Cobertura Playwright: ao menos um fluxo E2E por feature entregue no admin
- Storybook: componente novo no admin → story correspondente

## 6. Performance e observabilidade

- Frontend público: Astro SSG preferível a SSR onde conteúdo for estático
- p95 de endpoints autenticados abaixo de 200ms (localmente)
- Logs via Pino — sem `console.log` em código de produção
- Erros não tratados vão para Sentry com contexto (usuário, rota, payload se não-PII)
- Sem PII em logs (e-mail, telefone, nome completo em texto plano)

## 7. Design system

- Design system: **Cinematic Additive Manufacturing** (ver `docs/design/plano-design-completo.md`)
- Tokens em `frontend-public/tailwind.config.ts` — não duplicar valores inline
- Componentes admin seguem Radix UI + Tailwind; nunca introduzir outra biblioteca de UI sem ADR
- Responsividade: breakpoints mobile (375px), tablet (768px), desktop (1280px+)
- Paleta: background `#000000`, primary-container `#61c54f` (verde), superfícies escuras
- Fonte display: Space Grotesk (Google Fonts)

## 8. Processo de desenvolvimento

- Commits convencionais: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- PRs com descrição: Summary (bullets) + Test plan (checklist)
- Code review obrigatório antes do merge para main
- Specs não triviais (> 3 passos ou com múltiplas camadas) vivem em `docs/specs/_active/` **antes** do código
- ADRs para decisões técnicas que fecham caminhos — vivem em `docs/decisions/`
- ADRs no formato: `NNN-titulo-kebab.md`

## 9. Integrações planejadas (Q2/Q3)

- **Botyo** — WhatsApp chatbot + captação de leads via formulário
- **GA4 + Microsoft Clarity + Facebook Pixel + GTM** — analytics e tracking
- **IA para posts** — geração automática SEO/GEO (provedor a confirmar pela AUMAF)

Toda integração nova exige spec em `docs/specs/_active/` antes de implementação.

## 10. Definição de pronto (DoD)

Uma feature está pronta apenas quando:

1. Todos os critérios EARS de `requirements.md` têm código que os satisfaz
2. Testes automatizados cobrem os critérios de aceitação
3. `npm run typecheck` e `npm run lint` passam limpos
4. `npm run build` bem-sucedido
5. Code review aprovado (ou auto-revisão documentada em `status.md`)
6. Spec movida de `_active/` para `_completed/` com `retrospective.md`
7. `docs/specs/INDEX.md` atualizado

## 11. Cronograma e entregas

| Quinzena | Status | Entrega |
|----------|--------|---------|
| Q1 (sem 1–2) | ✅ Entregue (2026-05-02) | Site público navegável + design aprovado + infra ativa |
| Q2 (sem 3–4) | 🔄 A iniciar | Blog funcional + backoffice + IA gerando posts |
| Q3 (sem 5–6) | ⏳ Pendente | Deploy produção + QA + handover |

---

## Anexos vivos

- `CLAUDE.md` — instruções para agentes IA (raiz do repo)
- `docs/decisions/` — ADRs
- `docs/specs/INDEX.md` — portfólio de specs ativas e concluídas
- `docs/design/plano-design-completo.md` — design system detalhado
- `docs/research/site-atual-conteudo.md` — conteúdo do site Wix atual
