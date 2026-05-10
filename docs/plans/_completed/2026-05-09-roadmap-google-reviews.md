# Plano 2 — Integração de Feedbacks do Google (Reviews)

**Status:** 🟡 Stand-by (rascunho inicial — discutir antes de iniciar)
**Criado:** 2026-05-09
**Escopo:** `frontend-public/` + possivelmente `backend/` (cache)

## Objetivo
Trazer automaticamente avaliações do Google Business Profile da AUMAF para o site, com link direto para o perfil e CTA para deixar review.

## Opções de implementação

### Opção A — Google Places API (My Business) [recomendada]
- Endpoint: `Places API` → `place/details` retorna até 5 reviews recentes + rating + total.
- Necessário: `Place ID` da AUMAF + Google Cloud API key (com restrição de domínio/IP).
- Cache no backend (Redis) com TTL ~6–24h para evitar rate limit e custo.
- Endpoint backend: `GET /api/v1/public/google-reviews` → `{ rating, total, reviews[] }`.
- Componente Astro consome no SSR ou via fetch client-side com fallback estático.

**Prós:** dados oficiais, controle total de visual, sem iframe.
**Contras:** API paga após cota gratuita; só 5 reviews; precisa renovar/auditar key.

### Opção B — Widget de terceiros (Elfsight, Trustmary, Reviews.io, Featurable)
- Embed via `<script>` ou iframe.
- Featurable tem plano gratuito ilimitado; Elfsight tem plano free com limite de views.
- **Prós:** zero backend, setup em minutos.
- **Contras:** custo recorrente em planos pagos, pouco controle visual, impacto em performance/CLS, dependência externa.

### Opção C — Coleta manual + JSON estático
- Atualizar JSON `frontend-public/src/data/reviews.json` periodicamente (mensal).
- Componente lê do JSON.
- **Prós:** zero custo, performance máxima.
- **Contras:** desatualiza; trabalho manual; perde "automaticamente".

## Recomendação inicial
- **Curto prazo:** Opção B com Featurable (free, automático) para validar UX.
- **Médio prazo:** migrar para Opção A se quiser controle total e branding consistente.

## Componentes/UX
- Seção "O que dizem nossos clientes" na home (carrossel ou grid 3 colunas).
- Card por review: avatar/inicial, nome, estrelas, trecho, data relativa.
- Header da seção: rating médio agregado + "Ver todas no Google" (link externo).
- CTA secundário: "Deixe sua avaliação" → link direto pro form de review do Google (URL `https://search.google.com/local/writereview?placeid=...`).
- Página dedicada `/avaliacoes` opcional, com lista completa.

## Saídas
- Definição de Place ID + URLs de review.
- PR com seção de reviews + link para o perfil Google.
- Documentação em `docs/integrations/google-reviews.md`.

## Pré-requisitos para destravar
- Acesso ao Google Business Profile da AUMAF (ou pelo menos Place ID público).
- Decisão entre A/B/C.
- Se A: criar projeto no Google Cloud, gerar API key restrita.

## Riscos
- Place ID errado → dados de outro estabelecimento.
- Reviews negativas precisam de política editorial (mostrar todas? filtrar < 4 estrelas?).
- ToS do Google: reviews não podem ser editadas/cherry-picked sem ressalva.
