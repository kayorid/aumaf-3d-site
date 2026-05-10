# Conversão para Template — Plano de Execução

**Data:** 2026-05-10
**Origem:** AUMAF 3D site (clone)
**Objetivo:** Transformar o codebase em um template reutilizável, com tokenização agressiva do design system, da identidade institucional e do conteúdo crítico, mantendo a stack (Astro + React Admin + Node/Prisma + Postgres + Redis + MinIO).

---

## Princípios

1. **Single source of truth para identidade.** Um arquivo (`template.config.ts`) na raiz controla nome da marca, contato, NAP, navegação, social, defaults.
2. **Tema via CSS variables.** Tailwind referencia `var(--color-*)`. Trocar de tema = trocar um import.
3. **Conteúdo crítico em slots.** Navbar, Footer, Home hero, Contato leem do config. Páginas vitrine (serviços, materiais, portfolio) ficam como **demo content scaffolds** com instruções claras de edição.
4. **Bootstrap em um comando.** `npm run brand:init` faz a clonagem para uma nova marca.
5. **Demo brands shippáveis.** 3 temas prontos (industrial-green legado AUMAF; ocean-blue corp; warm-boutique).
6. **Backend neutro.** Seeds, settings, .env.example sem brand hardcoded.

---

## Mapa de transformação

| Item | Estado atual | Estado alvo |
|---|---|---|
| Identidade | `frontend-public/src/lib/company.ts` (escopo limitado) | `template.config.ts` raiz, consumido por public+admin+backend |
| Cores | Hardcoded em `tailwind.config.ts` (verde AUMAF) | CSS variables em `themes/*.css`, Tailwind apenas referencia |
| Fontes | Hardcoded `Space Grotesk` + `Pirulen` | Lido do config; fonts em `public/fonts/` por tema |
| Pacote shared | `@aumaf/shared` | `@template/shared` |
| Conteúdo home | Cópia AUMAF cravada em `index.astro` | Hero + value props + CTAs vêm do config |
| Navbar/Footer | Links hardcoded | Items do config |
| Backend seed | Categorias/users com referências AUMAF | Seed neutro; `template.config` define defaults |
| README | "AUMAF 3D — Site institucional" | "Multi-Brand Marketing + Blog + Backoffice Template" |
| CLAUDE.md | Contexto do projeto AUMAF | Contexto do template + nota: substituir após brand:init |
| Páginas vitrine | Cópia AUMAF de impressão 3D | Continuam ricas como demo, com `<!-- TEMPLATE: edite esta seção -->` |

---

## Fases (ordem de execução)

### Phase A — Camada de identidade
- Criar `template.config.ts` na raiz com tipo `TemplateConfig`.
- Migrar `COMPANY` existente, expandir com: navegação, social, hero, ctas primários.
- Re-exportar via `packages/shared` para que public + admin + backend leiam o mesmo objeto.
- Manter `frontend-public/src/lib/company.ts` como passthrough deprecated (durante transição).

### Phase B — Tema via CSS variables
- Criar `frontend-public/src/styles/themes/industrial-green.css` (tema legado AUMAF, isolado).
- Criar `themes/ocean-blue.css` e `themes/warm-boutique.css` como alternativas.
- Reescrever `tailwind.config.ts` referenciando `var(--color-primary)` etc.
- `global.css` faz `@import './themes/<theme>.css'` controlado por env ou config.
- Tokens cobertos: cores, raios, sombras, blur, fontes.

### Phase C — Slots de conteúdo crítico
- `Navbar.astro` lê `config.navigation`.
- `Footer.astro` lê `config.contact`, `config.socials`, `config.address`.
- `index.astro` hero/CTAs lendo `config.home`.
- `contato.astro` form WhatsApp/email lendo `config.contact`.
- Páginas vitrine (`servicos`, `materiais`, `portfolio`, `sobre`, `faq`, `avaliacoes`) ficam como demo. Adicionar comentário-cabeçalho `{/* TEMPLATE DEMO PAGE — substitua por conteúdo da sua marca */}`.

### Phase D — Identity sweep
- Renomear pacote `@aumaf/shared` → `@template/shared` (ajusta `package.json`, todos os imports).
- Substituir strings hardcoded "AUMAF 3D" / "AUMAF" / "aumaf3d.com.br" no admin, backend, testes.
- Substituir `aumaf3d.com.br` por `config.url`.
- Renomear root `name: "aumaf-3d-site"` → `"multi-brand-site-template"`.

### Phase E — Backend genericização
- `backend/prisma/seed.ts`: settings padrão lê de `template.config`.
- `.env.example` revisado, sem strings AUMAF.
- Emails de notificação usam `config.name` e `config.contact.email`.

### Phase F — Documentação
- `README.md` raiz: descrição do template, como usar, link para REBRAND.md.
- `docs/template/REBRAND.md`: passo-a-passo de adaptação.
- `docs/template/THEMING.md`: como criar/editar temas.
- `docs/template/CONTENT.md`: estrutura de conteúdo do site público + onde editar.
- `docs/template/ARCHITECTURE.md`: visão geral da stack para novos devs.
- `CLAUDE.md` raiz reescrito como template; anotar que após `brand:init` o usuário deve substituir por contexto do projeto dele.

### Phase G — Bootstrap CLI
- `scripts/init-brand.mjs`:
  - Pergunta interativa: brand name, slug, primary color, contact email, WhatsApp, etc.
  - Gera/atualiza `template.config.ts`.
  - Escolhe tema (lista de `themes/*.css`).
  - Atualiza `package.json` names (`<slug>-site`).
  - Opcional: reseta git history (`--fresh-git`).
  - Imprime checklist do que ainda exige edição manual (logos, favicons, OG images, copy de páginas vitrine).

### Phase H (opcional / futuro)
- Storybook tokens page atualizada para refletir CSS variables vivas.
- Multi-brand runtime (escolher tema por subdomínio).
- Galeria de demo themes em `/v2`.

---

## Critérios de sucesso

- [ ] `template.config.ts` é o único lugar para mudar identidade.
- [ ] Mudar de tema = trocar 1 import em `global.css`.
- [ ] `npm run brand:init` produz site com nova marca em <2min.
- [ ] `grep -r "aumaf\|AUMAF" src/ backend/src/ packages/` zero matches fora de demo content explicitamente marcado.
- [ ] README + REBRAND.md permitem que dev externo crie um clone customizado sem ler código.
- [ ] Todas as 9 páginas Astro buildam (`npm run build`) com a config nova.
- [ ] Storybook continua funcionando.
- [ ] Tests Jest + Vitest + Playwright passando (ou regressões mínimas documentadas).

---

## Política para conteúdo das páginas vitrine

Páginas como `servicos.astro` e `materiais.astro` têm 1000+ linhas de copy super específico (impressão 3D em metal 316L, tolerância ±0.05mm, etc.). Tokenizar isso seria contraproducente — destruiria a riqueza visual e levaria semanas. Política adotada:

- **Mantemos** o conteúdo AUMAF como **demo scaffolds**.
- **Marcamos** com banner `{/* TEMPLATE DEMO — replace */}` no topo.
- **Documentamos** em `CONTENT.md` quais páginas são scaffolds vs. quais são genéricas.
- O `brand:init` printa a lista de páginas a editar manualmente.

Isso é honesto: o template entrega estrutura, design system, infraestrutura, fluxos de admin, integração de blog/IA — não cópia genérica vazia.
