# Requirements — instagram-feed

> Exibir automaticamente os últimos posts do Instagram da AUMAF no site público (home + página de contato), via Behold.so como fonte de dados, renderizado 100% no Design System Cinematic Additive Manufacturing.

**Slug**: `2026-05-10-instagram-feed`
**Início**: 2026-05-10
**Stakeholders**: Kayo Ridolfi (kayoridolfi.ai), AUMAF (cliente — conteúdo Instagram)
**Status**: clarifying → ready

---

## 1. Contexto e problema

Hoje o site público (https://aumaf.kayoridolfi.ai) **não tem nenhuma prova social do Instagram** da AUMAF. A AUMAF mantém presença ativa no Instagram (`@aumaf3d`) postando peças impressas, bastidores do parque produtivo e processos — conteúdo de alto valor para conversão que está completamente invisível no site.

Três fatores agravam:
1. **Atualização manual é frágil** — adicionar peças novas exige PR + deploy a cada post.
2. **Instagram Basic Display API foi deprecada em dez/2024** — qualquer caminho oficial passa pela Graph API.
3. **Scraping direto está descartado** — viola ToS do Instagram (risco de banimento da conta da AUMAF) e quebra a cada mudança de HTML deles.

Já temos um playbook validado no projeto para integrações via "proxy de dados externo + render no nosso DS": foi assim que entregamos **Google Reviews via Featurable** (PR #32). Vamos replicar o mesmo padrão para o Instagram usando **Behold.so**.

## 2. Objetivo de negócio

- Visitantes do site veem prova social viva do Instagram da AUMAF em pontos estratégicos da jornada (home + final do `/contato`).
- Conteúdo atualiza sozinho — toda nova publicação no Instagram aparece no site em até ~1h, sem deploy.
- Visual **indistinguível** do resto do site — zero "cheiro" de widget de terceiros (mesma régua do Featurable: JSON apenas, render nosso).
- Solução resiliente: se Behold.so cair, o site degrada graciosamente (fallback estático ou seção oculta) sem 500.

## 3. Personas afetadas

| Persona | Como esta feature afeta |
|---------|------------------------|
| Visitante do site (lead em potencial) | Vê prova social fresca, sente que a empresa está ativa e produzindo. |
| AUMAF (cliente) | Não precisa duplicar conteúdo entre Instagram e site — posta uma vez, aparece nos dois. |
| Kayo Ridolfi (dev/intermediário) | Configura Behold.so uma vez com **conta intermediária**; AUMAF não precisa fazer OAuth agora. |
| AUMAF Admin (operação) | Indireto: ganha um botão "Sincronizar agora" no admin para forçar refresh em casos de urgência. |

## 4. User stories

- Como **visitante na home**, ao chegar na seção "Veja nosso dia a dia" quero ver 8 fotos recentes do Instagram da AUMAF em grid, com hover sutil revelando a caption, para sentir que a empresa está ativa.
- Como **visitante no /contato**, ao terminar de ler o formulário quero ver a mesma prova social do Instagram antes de decidir enviar, para reforçar confiança.
- Como **visitante**, ao clicar numa foto quero ir direto pro post no Instagram (`permalink`), para conferir contexto completo.
- Como **visitante mobile**, quero ver no máximo 4 posts em scroll horizontal snap (não 8 empilhados em 8 telas), para não cansar.
- Como **dev**, quero que se o Behold.so cair, a seção inteira suma silenciosamente (não mostre "erro ao carregar"), para o site não parecer quebrado.
- Como **dev**, quero um cache Redis de 1h no backend para não bater no Behold.so a cada request SSR.
- Como **AUMAF Admin** (futuro, opcional Phase 2), quero um botão "Forçar sincronização agora" em `/admin/integrations` para invalidar o cache manualmente quando publicar algo urgente.

## 5. Critérios de aceitação (EARS)

### EARS-IG-001 — Render na home
**Quando** o visitante acessa `/`, **o sistema** renderiza uma seção "Instagram" entre `ReviewsHomeWidget` e o CTA final, com 8 thumbnails em grid 4×2 (desktop) ou scroll horizontal snap (mobile, mostra ~2.5 por vez).

### EARS-IG-002 — Render em /contato
**Quando** o visitante acessa `/contato`, **o sistema** renderiza a mesma seção Instagram após o formulário e antes do footer.

### EARS-IG-003 — Fonte de dados (revisado: frontend-only)
**Quando** uma página é renderizada SSR pelo processo Astro, **`getInstagramFeed()`** retorna do cache em memória do processo (`cached.expiresAt > now`) ou, em miss, busca em `https://feeds.behold.so/{FEED_ID}` e cacheia (TTL 1h). Mesmo padrão de `google-reviews.ts`.

### EARS-IG-004 — Sem rota de backend
**Não há** endpoint backend nesta feature. A integração roda inteiramente no `frontend-public` (SSR Astro). Decisão revisada vs draft inicial — alinha com o padrão já em produção de Google Reviews.

### EARS-IG-005 — Filtro de tipo de mídia
**Quando** o feed contém vídeos/reels, **o backend** mantém apenas `IMAGE` e `CAROUSEL_ALBUM` no resultado retornado ao frontend (filtra `VIDEO` na origem). Carousel exibe a primeira imagem.

### EARS-IG-006 — Click → permalink
**Quando** o visitante clica num thumbnail, **o navegador** abre `permalink` (URL do post no Instagram) em **nova aba** com `rel="noopener noreferrer"`.

### EARS-IG-007 — Fallback de erro
**Quando** o backend falha em buscar (Behold.so 5xx, timeout > 3s, JSON inválido), **o sistema** retorna o último cache válido se existir, ou `{ posts: [] }`. Astro NÃO renderiza a seção se `posts.length === 0`.

### EARS-IG-008 — Sem CSS de terceiros
**Quando** a seção renderiza, **NÃO** existe `<script>`, `<iframe>` ou `<link rel="stylesheet">` apontando para `behold.so`. 100% do visual usa tokens do DS Cinematic.

### EARS-IG-009 — Acessibilidade
**Quando** a seção renderiza, **cada thumbnail** tem `alt` derivado da caption (primeira frase, truncada em 100 chars) ou fallback "Publicação AUMAF 3D no Instagram de {data}".

### EARS-IG-010 — Performance
**Quando** a seção carrega, **o LCP da página não regride** mais de 100ms. Imagens usam `loading="lazy"` (exceto se acima da dobra), `decoding="async"` e `width`/`height` explícitos para evitar CLS.

### EARS-IG-011 — Reduced motion
**Quando** o usuário tem `prefers-reduced-motion: reduce`, **animações de hover** (lift, glow, reveal de caption) são suprimidas.

### EARS-IG-012 — Mobile snap
**Quando** o viewport ≤ 768px, **o grid** vira scroll horizontal com `scroll-snap-type: x mandatory`, mostrando ~2.5 cards por vez e sem barra de scroll visível.

## 6. Não-objetivos (out of scope)

- ❌ **Login OAuth da AUMAF agora** — usaremos conta intermediária do Kayo no Behold.so (decisão 2026-05-10). Migração futura para conta AUMAF fica como follow-up.
- ❌ **Player de vídeo/Reels embedado** — filtrados out na Phase 1; revisitar se AUMAF pedir.
- ❌ **Curtir/comentar pelo site** — só link para o post original.
- ❌ **Estatísticas (likes/comments count)** — Behold.so plano free não traz; pular.
- ❌ **Página dedicada `/instagram`** — não pedida; só home + /contato.
- ❌ **Painel admin de gestão** Phase 1 — botão "Sincronizar agora" fica como Phase 2 opcional.
- ❌ **Migração para Instagram Graph API direto** — Phase 3 futura, se um dia precisarmos zero dependência externa.

## 7. Premissas

1. **Conta `@aumaf3d` é Business ou Creator** — Kayo confirmará. Se for Personal, primeiro passo da execução é Kayo solicitar à AUMAF para alterar (1 toggle nas configs do Instagram, mantém todos os posts/seguidores). **Bloqueia início da Task IG-002.**
2. **Conta intermediária Kayo no Behold.so** — Kayo cria conta no Behold com seu próprio login Instagram pessoal e conecta `@aumaf3d` como página gerenciada (requer ser admin da página Facebook vinculada).
   - 🚨 **Risco**: se Kayo não for admin da página FB da AUMAF, isso não funciona. Plano B: AUMAF cria conta Behold.so direto e nos passa o `FEED_ID`.
3. **Behold.so plano free é suficiente** — 1h de update + 12 posts no cache; pegamos 8. Plano pago ($5/mo) só se AUMAF reclamar da latência de update.
4. **Backend já tem padrão de cache Redis** — usado no Botyio, Google Reviews; replicar.
5. **Endpoint público sem auth** — feed é dado público do Instagram, sem necessidade de JWT.

## 8. Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Kayo não é admin da página FB da AUMAF → não consegue conectar via Behold | Média | Alto | Plano B: AUMAF cria a conta Behold; passamos só o `FEED_ID` (env var). |
| Behold.so descontinua plano free | Baixa | Médio | Trocar pra Graph API direto reaproveitando 100% do render layer (componentes Astro idênticos). |
| Instagram muda Graph API e quebra Behold | Baixa | Alto | Mesma mitigação: cache Redis serve último snapshot bom; degrada gracioso (EARS-IG-007). |
| `@aumaf3d` é conta Personal e AUMAF não quer trocar | Baixa | Bloqueante | Negociar com AUMAF; se recusar, escalar pra widget pago tipo Elfsight (sem mudança de conta). |
| Capções com termos sensíveis aparecem como alt | Baixa | Baixo | Truncar em 100 chars + sanitizar emojis/quebras. |
| LCP regride (imagens grandes) | Média | Médio | Behold retorna `thumbnail_url` (≤640px); usar **thumb** no grid, `mediaUrl` só no hover preview se houver. |

## 9. Métricas de sucesso

- ✅ Seção Instagram visível em `/` e `/contato` em produção.
- ✅ 8 posts renderizados, atualizando em até 1h após nova publicação no `@aumaf3d`.
- ✅ Zero requests para `behold.so` no HTML final (verificar via DevTools → Network).
- ✅ Lighthouse Performance ≥ 90 mantido em `/` e `/contato` (não regride).
- ✅ Smoke test `bash scripts/smoke-test.sh` passa após deploy.
- ✅ Click-through rate para Instagram trackado via GA4 event `instagram_click` (Phase 2 opcional).
