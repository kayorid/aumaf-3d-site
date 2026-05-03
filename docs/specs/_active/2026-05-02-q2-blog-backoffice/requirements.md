# Requirements — q2-blog-backoffice

> WHAT e WHY desta feature. Sem mencionar tecnologia. Critérios em EARS notation.

**Slug**: `2026-05-02-q2-blog-backoffice`
**Início**: 2026-05-02
**Stakeholders**: AUMAF 3D (cliente), Kayo Ridolfi (dev/IA)
**Status**: draft

---

## 1. Contexto e problema

A AUMAF 3D precisa de presença digital ativa com produção de conteúdo sobre impressão 3D. O site público (Q1) foi entregue sem capacidade de gestão de conteúdo — o blog existe como rota mas não tem posts reais nem como publicá-los. A empresa não tem equipe técnica para administrar conteúdo diretamente no banco; precisa de uma interface administrativa usável por não-desenvolvedores.

Adicionalmente, a AUMAF quer reduzir o esforço de criação de conteúdo usando IA para gerar rascunhos de posts com foco em SEO/GEO, que um humano revisa e publica.

**Fonte**: contrato de trabalho + conversa de kickoff (2026-05-02).

## 2. Objetivo de negócio

- Ter pelo menos 4 posts publicados no blog até o fim de Q2, atraindo tráfego orgânico sobre impressão 3D em SP
- Reduzir o tempo de criação de um post de ~2h (manual) para ~30min (IA + revisão humana)
- Dar à AUMAF autonomia para publicar e editar conteúdo sem depender do dev

## 3. Personas afetadas

| Persona | Como esta feature afeta |
|---------|------------------------|
| Administrador AUMAF | Passa a criar, editar e publicar posts de blog pela interface web |
| Visitante do site | Passa a encontrar conteúdo real e atualizado na rota `/blog` |
| Equipe kayoridolfi.ai | Entrega o backoffice como produto funcional para handover em Q3 |

## 4. User stories

- Como administrador, eu quero criar e editar posts de blog com título, conteúdo rich text, imagem de capa e categorias para publicar conteúdo sobre impressão 3D.
- Como administrador, eu quero salvar um post como rascunho antes de publicar para revisar antes de tornar público.
- Como administrador, eu quero fazer upload de imagens para usar nos posts do blog.
- Como administrador, eu quero usar um assistente de IA para gerar o rascunho de um post a partir de um tema ou prompt, para acelerar a criação de conteúdo.
- Como visitante, eu quero ver a lista de posts publicados em `/blog` com imagem de capa, título, data e resumo.
- Como visitante, eu quero ler um post completo em `/blog/[slug]` com renderização adequada do conteúdo rich text.
- Como visitante, eu quero ver posts relacionados ao fim de um post para continuar navegando.
- Como administrador, eu quero fazer login no backoffice com e-mail e senha para acessar as ferramentas de gestão.

## 5. Critérios de aceitação (EARS)

### Blog público

- **R1**: O sistema deve exibir em `/blog` a lista de posts publicados, ordenados por data de publicação decrescente, com título, imagem de capa, data e resumo de até 200 caracteres.
- **R2**: Quando um visitante acessa `/blog/[slug]`, o sistema deve exibir o conteúdo completo do post renderizado, incluindo título, imagem de capa, data de publicação e corpo em rich text.
- **R3**: Se um visitante acessa `/blog/[slug]` de um post não publicado ou inexistente, então o sistema deve retornar 404.
- **R4**: Quando um post é exibido, o sistema deve exibir ao menos 2 posts relacionados (mesma categoria ou mais recentes) ao fim da página.

### Autenticação do backoffice

- **R5**: Quando um administrador acessa o backoffice sem sessão ativa, o sistema deve redirecionar para a tela de login.
- **R6**: Quando um administrador submete credenciais válidas, o sistema deve criar uma sessão JWT em cookie httpOnly e redirecionar para o dashboard.
- **R7**: Se um administrador submete credenciais inválidas, então o sistema deve exibir mensagem de erro sem revelar se é o e-mail ou a senha que está incorreto.

### Gestão de posts (backoffice)

- **R8**: O sistema deve permitir ao administrador criar um post com título, slug (gerado automaticamente a partir do título, editável), corpo rich text, imagem de capa, categoria e status (rascunho ou publicado).
- **R9**: Quando o administrador salva um post com status "rascunho", o sistema deve persistir o post sem torná-lo visível no site público.
- **R10**: Quando o administrador publica um post, o sistema deve torná-lo visível imediatamente na rota `/blog/[slug]`.
- **R11**: O sistema deve permitir ao administrador fazer upload de imagens via MinIO e inserir no corpo ou como capa do post.
- **R12**: Enquanto o administrador edita um post, o sistema deve indicar visualmente o status de salvamento (salvo / salvando / erro).

### Assistente de IA

- **R13**: Onde o administrador está criando um post, o sistema deve oferecer a opção de gerar um rascunho a partir de um tema/prompt via integração com IA.
- **R14**: Quando a geração de IA é concluída, o sistema deve inserir o rascunho no editor de rich text para revisão humana antes de salvar.
- **R15**: Se a geração de IA falhar (timeout, erro de API), então o sistema deve exibir mensagem de erro e permitir nova tentativa sem perder o conteúdo já editado.

## 6. Edge cases conhecidos

- Post com slug duplicado: sistema deve sufixar com `-2`, `-3`, etc. automaticamente
- Upload de imagem muito grande (> 10 MB): sistema deve rejeitar com mensagem de tamanho
- Post sem imagem de capa: exibir placeholder visual definido no design system
- Sessão expirada durante edição: preservar rascunho em localStorage e alertar ao relogin

## 7. Fora de escopo (explícito)

- **Múltiplos usuários admin**: Q2 tem apenas um admin — sistema de equipe/permissões é Q3+
- **Comentários no blog**: sem sistema de comentários — redirecionar para WhatsApp se necessário
- **Newsletter/e-mail**: fora deste contrato
- **Versionamento de posts**: sem histórico de edições — apenas a versão atual
- **Multi-idioma**: apenas pt-BR

## 8. Métricas de sucesso

| Métrica | Linha de base atual | Meta pós-feature | Como medir |
|---------|--------------------|--------------------|------------|
| <métrica> | <valor> | <valor> | <fonte/dashboard> |

## 9. Suposições e dependências

- O schema Prisma (Post, Category, User) já existe do Q1 — será validado antes do design
- MinIO já está configurado no Docker Compose — só precisará de bucket para imagens do blog
- O provedor de IA para geração de posts ainda não foi definido pela AUMAF [CLARIFY: Claude API? OpenAI? outro?]
- Assume-se apenas 1 usuário admin em Q2 — sem sistema de roles complexo
- O rich text editor será definido na fase design (TipTap é candidato forte)

## 10. Tags pendentes de clarificação

> Use `[CLARIFY]` em qualquer trecho com ambiguidade. Resolva todos na fase Clarify antes do design.

Exemplo: "Quando o usuário recebe a notificação, o sistema deve [CLARIFY: enviar push? email? ambos?] dentro de 5 minutos."

---

## 11. Clarifications

> Preenchido na fase Clarify. Cada entrada: data, pergunta, opções consideradas, decisão.

| Data | Pergunta | Opções | Decisão | Razão |
|------|----------|--------|---------|-------|
| 2026-05-02 | <pergunta> | A, B, C | <decisão> | <razão curta> |

## 12. Links

- Plano macro: `docs/plans/2026-05-02-q1-complete.md` (contexto de Q1)
- ADRs relacionados: `docs/decisions/ADR-001-stack.md`
- Constitution: `docs/specs/constitution.md`
- Conteúdo do site atual: `docs/research/site-atual-conteudo.md`
