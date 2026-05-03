# Requirements — Q2 Phase 2 (blog dinâmico + admin completo)

> Iteração que estende a spec `2026-05-02-q2-blog-backoffice`. Phase 1 entregue em `98b50bb`.
> WHAT/WHY desta fase, sem mencionar tecnologia. Critérios em EARS.

**Slug**: `2026-05-02-q2-blog-backoffice` (mesmo)
**Início P2**: 2026-05-03
**Branch**: `feat/admin-q2-phase2-migration-blog-dynamic`
**Status**: tasks (em implementação)

---

## 1. Contexto e problema

A Phase 1 entregou o backoffice funcional (auth, posts CRUD, IA multi-provedor, dashboard) — mas o site público em `/blog` ainda renderiza posts hard-coded em arquivos `.astro`. Resultado: o admin pode criar posts no banco, mas eles não aparecem no site. O ciclo de publicação está quebrado.

Adicionalmente, o admin ainda não tem UI para leads (que já estão chegando pelo formulário de contato), nem para settings (analytics IDs estão em `.env`), nem CRUD de categorias.

**Restrição crítica de migração**: os 6 posts `.astro` existentes têm conteúdo de alta qualidade com formatação rica (tabelas comparativas, specs grids, glass-panel cards, fluxograma de decisão, FAI table, blockquotes). Esse conteúdo **deve ser preservado integralmente** — texto, imagens, formatação visual — ao migrar para o banco.

## 2. Objetivo de negócio

- Fechar o ciclo de publicação: admin cria → blog público mostra automaticamente
- Preservar 100% do conteúdo já produzido (6 posts) sem perda visual
- Dar à AUMAF autonomia total: leads, settings (analytics), categorias gerenciados pela UI
- Reduzir fricção de criação de post (auto-save) e custo operacional (IA assíncrona)

## 3. Personas afetadas

| Persona | Como esta fase afeta |
|---------|---------------------|
| Administrador AUMAF | Vê leads na UI, configura analytics IDs sem editar `.env`, gerencia categorias, IA não bloqueia mais o editor |
| Visitante do site | Continua navegando `/blog` e `/blog/[slug]` exatamente como antes — mas o conteúdo agora é editável |
| Equipe kayoridolfi.ai | Encerra Q2 com produto inteiro funcional ponta-a-ponta |

## 4. User stories

- Como administrador, eu quero que tudo que publicar no admin apareça no `/blog` público em até 1 minuto, sem rebuild manual.
- Como visitante, eu quero ler os posts existentes (FDM×SLA×SLS, materiais, Fórmula SAE etc.) com mesma qualidade visual de antes.
- Como administrador, eu quero ver os leads que chegaram pelo formulário de contato em uma listagem, com filtros e exportação CSV.
- Como administrador, eu quero configurar IDs de GA4, Clarity, Pixel e GTM pela UI — e que o site público use esses IDs no `<head>`.
- Como administrador, eu quero criar/editar/excluir categorias do blog pela UI.
- Como administrador, eu quero que o editor de posts salve automaticamente meu trabalho enquanto eu digito.
- Como administrador, eu quero gerar posts com IA sem o editor travar — quero ver progresso e poder cancelar.

## 5. Critérios de aceitação (EARS)

### Migração de conteúdo

- **R-P2-1**: O sistema deve preservar 100% do texto, headings, listas, tabelas e blockquotes dos 6 posts originais ao migrar para o banco.
- **R-P2-2**: O sistema deve preservar elementos visuais ricos dos posts originais (specs grids, glass-panel cards, fluxograma de decisão, FAI table, comparison tables, badges múltiplos).
- **R-P2-3**: O sistema deve preservar `slug`, `title`, `excerpt`, `category`, `publishedAt`, `readingTimeMin` e `featured` originais.
- **R-P2-4**: O sistema deve fazer upload da imagem real `SAE-formula.avif` para o storage de mídias e referenciá-la pelo `coverImageUrl`.
- **R-P2-5**: O sistema deve seedar todas as categorias originais (Guia Técnico, Materiais, Case Study, Engenharia, Parceria, Inovação).
- **R-P2-6**: A migração deve ser **idempotente** — rodar 2 vezes não duplica posts.
- **R-P2-7**: Após a migração, ao abrir qualquer post original em `/blog/<slug>` no público, ele deve ser **visualmente indistinguível** da versão estática anterior (a menos de imagens dinâmicas de capa).

### Blog público dinâmico

- **R-P2-8**: Quando um visitante acessa `/blog`, o sistema deve listar todos os posts publicados, ordenados por `publishedAt` desc, com card visualmente equivalente à versão atual estática.
- **R-P2-9**: O post marcado como `featured=true` deve aparecer em destaque no topo da listagem (mesmo layout atual).
- **R-P2-10**: Quando um visitante acessa `/blog/<slug>` de post publicado, o sistema deve renderizar o post com layout idêntico ao template `.astro` atual (hero, cover, conteúdo, share, CTA, "Mais do Blog").
- **R-P2-11**: Se o slug não existe ou o post não está publicado, então o sistema deve retornar 404 com a página `/404` do design system.
- **R-P2-12**: O sistema deve emitir schema JSON-LD `BlogPosting` correto (com headline, datePublished, author, image, etc.) em cada post dinâmico.
- **R-P2-13**: O sistema deve emitir `<link rel="canonical">`, Open Graph e Twitter Card corretos por post dinâmico.
- **R-P2-14**: O sitemap deve listar dinamicamente todos os posts publicados em `/blog/<slug>`.
- **R-P2-15**: Quando o admin publica um novo post, o `/blog` público deve refletir a mudança em **≤ 60 segundos**, sem rebuild manual.
- **R-P2-16**: Quando o admin despublica um post, o sistema deve retornar 404 em `/blog/<slug>` em ≤ 60 segundos.

### UI de Leads

- **R-P2-17**: Quando o admin acessa `/admin/leads`, o sistema deve listar todos os leads (não mascarados, pois é o admin), ordenados por `createdAt` desc, paginados em 20 itens.
- **R-P2-18**: O sistema deve permitir filtrar leads por intervalo de data, fonte (`source`) e busca textual em nome/email/mensagem.
- **R-P2-19**: O sistema deve permitir exportar a listagem filtrada como CSV (UTF-8 com BOM, separador vírgula, cabeçalhos em pt-BR).
- **R-P2-20**: O sistema deve exibir total de leads recebidos no período filtrado.

### UI de Settings

- **R-P2-21**: Quando o admin acessa `/admin/settings`, o sistema deve exibir formulário com campos: GA4, Clarity, FB Pixel, GTM, WhatsApp, e-mail de contato, telefone, scripts custom (head/body), webhook Botyo.
- **R-P2-22**: Quando o admin salva settings, o sistema deve persistir e o site público deve passar a usar os novos valores em ≤ 60 segundos.
- **R-P2-23**: Se o admin deixa um ID de analytics vazio, então o sistema **não deve** emitir o script correspondente no público (sem placeholders inúteis).
- **R-P2-24**: O sistema deve validar formato de cada ID (regex específico por provedor) e exibir erro inline.

### CRUD de Categorias

- **R-P2-25**: Quando o admin acessa `/admin/categories`, o sistema deve listar categorias com nome, slug e contagem de posts.
- **R-P2-26**: O sistema deve permitir criar, editar e excluir categorias.
- **R-P2-27**: Se o admin tenta excluir uma categoria com posts associados, então o sistema deve bloquear e exigir reatribuição manual.

### Auto-save no editor

- **R-P2-28**: Enquanto o admin edita um post, o sistema deve salvar automaticamente o rascunho a cada 5 segundos de inatividade.
- **R-P2-29**: O sistema deve indicar visualmente o estado: "Salvando…", "Salvo HH:MM", "Erro ao salvar — tentar novamente".
- **R-P2-30**: Se o auto-save falhar 3 vezes consecutivas, então o sistema deve pausar tentativas e exigir ação manual do usuário.

### IA assíncrona (BullMQ) — opcional Phase 2

- **R-P2-31** `[opcional]`: Quando o admin solicita geração de IA, o sistema deve retornar imediatamente um `jobId` e processar em fila.
- **R-P2-32** `[opcional]`: O frontend deve exibir progresso da geração via polling ou SSE, permitindo cancelamento.

### Storybook — opcional Phase 2

- **R-P2-33** `[opcional]`: Os primitivos do admin (Button, Input, Card, Badge, Select, etc.) devem ter stories no Storybook conforme constituição §5.

## 6. Edge cases conhecidos

- Migração rodando 2x: `upsert` por `slug` evita duplicação
- Post sem `coverImageUrl`: renderer público usa o placeholder SVG decorativo (mesmo do template atual)
- Categoria do post original não existe no seed: cria sob demanda
- HTML embedado no Markdown com classes Tailwind: precisa de `safelist` no `tailwind.config.ts` do público
- Lead com caracteres especiais no CSV (vírgula, aspas, quebra de linha): escape RFC 4180
- Setting com ID inválido (ex: GA4 sem prefixo `G-`): valida no Zod antes de persistir
- Categoria excluída com posts: front bloqueia, backend retorna 409 com lista de posts afetados
- Auto-save concorrente com edição manual ("Salvar"): merge tomando o último; debounce evita corrida
- BullMQ sem Redis disponível: fallback síncrono com warning no log

## 7. Fora de escopo (Phase 2)

- Comentários no blog
- Newsletter / e-mail marketing
- Histórico de versões / undo de post
- Multi-idioma
- Reordenação de posts no `/blog` (sempre por `publishedAt`)
- Geração de imagem por IA (texto-only)
- Sistema multi-admin com permissões granulares (continua admin único)

## 8. Métricas de sucesso

| Métrica | Linha de base | Meta P2 | Como medir |
|---------|--------------|---------|------------|
| Tempo entre publicar e aparecer no público | infinito (rebuild manual) | ≤ 60s | observação manual |
| Posts editáveis pelo admin | 0 | 6 (todos migrados) | listagem `/admin/posts` |
| Tempo de criar post via IA + revisão | ~30 min (P1) | ~20 min (auto-save evita re-trabalho) | timer manual |
| Leads não acessíveis pela UI | 100% | 0 | UI `/admin/leads` |
| Configuração de analytics via `.env` | 100% | 0 (tudo em UI) | UI `/admin/settings` |

## 9. Suposições e dependências

- **Stack Phase 1 mantida** — sem mudança em auth, schema base, design system
- **MinIO operacional** — bucket `aumaf-blog-images` já existe (P1)
- **Tailwind do público pode ter safelist expandido** sem quebra de bundle
- **Astro 5 suporta hybrid sem regressão de build time** (a validar)
- **A imagem `SAE-formula.avif` existente em `frontend-public/public/images/` é a versão final** (não há original maior em outro lugar)

## 10. Boundaries (harness anti-drift)

### ✅ Always
- Preservar `slug`, `title`, `excerpt` exatos dos 6 posts ao migrar
- Manter visual indistinguível dos templates `.astro` atuais
- Migração via script idempotente (re-roda sem efeito colateral)
- Toda mutation de post invalida cache da listagem
- Validar IDs de analytics com regex no Zod antes de persistir

### ⚠️ Ask first
- Mudar a estrutura visual de qualquer post original
- Renomear slug existente (quebra link) — só se houver redirect
- Excluir conteúdo de post mesmo que pareça "decorativo"
- Qualquer migration destrutiva no Prisma (`@unique` em coluna existente, drop de coluna)

### 🚫 Never
- Perder texto, tabela ou bloco visual ao migrar
- Hardcodar IDs de analytics no código (devem vir de Settings)
- Servir imagens de blog do `frontend-public/public/` em produção (deve ser MinIO/S3)
- Rebuild full do Astro a cada publicação (deve ser ISR/on-demand)
- Commitar tokens/keys

## 11. Clarifications

| Data | Pergunta | Decisão | Razão |
|------|----------|---------|-------|
| 2026-05-03 | Como persistir componentes ricos (specs grid, glass cards) | **Markdown + HTML embedado**, classes do DS safelisted no Tailwind do público | Fidelidade total, sem refazer sistema de directives |
| 2026-05-03 | Posts a migrar | **Os 6 posts** (4 longos novos + 2 antigos) | Histórico do blog + datas variadas dão sinal de blog vivo |
| 2026-05-03 | Onde armazenar imagens | **MinIO** com `coverImageUrl` apontando para URL pública | Consistência com posts futuros + decoupling do frontend |
| 2026-05-03 | Renderização do `/blog` público | **Astro `output: 'hybrid'`** com prerender + ISR (revalidação on-demand) | Estático na maioria, atualiza em ≤60s sem rebuild full |
| 2026-05-03 | Migração executável vs. seed manual | **Script `scripts/migrate-blog-posts.ts`** parseando .astro originais | Rastreável, idempotente, replicável, serve de teste do conversor |
| 2026-05-03 | Categorias finais | Manter as 6 originais (Guia Técnico, Materiais, Case Study, Engenharia, Parceria, Inovação) | Cobertura completa dos posts existentes |
| 2026-05-03 | BullMQ e Storybook | **Opcionais nesta fase** — entrar somente se sobrar tempo após A+B+C | Foco no ciclo crítico (publicação ponta-a-ponta) |

## 12. Links

- Phase 1: `docs/specs/_active/2026-05-02-q2-blog-backoffice/{requirements,design,tasks,status}.md`
- Constitution: `docs/specs/constitution.md`
- Phase 2 design: `./design.md`
- Phase 2 tasks: `./tasks.md`
- Conteúdo dos 6 posts originais: `frontend-public/src/pages/blog/`
