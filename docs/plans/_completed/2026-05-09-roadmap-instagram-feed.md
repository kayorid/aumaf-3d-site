# Plano 3 — Integração com Instagram (Últimos Posts)

**Status:** 🟡 Stand-by (rascunho inicial — discutir antes de iniciar)
**Criado:** 2026-05-09
**Escopo:** `frontend-public/` + `backend/` (cache + token refresh)

## Objetivo
Exibir automaticamente os últimos posts do Instagram da AUMAF no site, mantendo o visual coerente com o DS e sem depender de uploads manuais.

## Opções de implementação

### Opção A — Instagram Basic Display API (deprecada em dez/2024)
- ❌ **Descartada** — Meta deprecou a Basic Display API; novas integrações exigem Graph API.

### Opção B — Instagram Graph API (via conta Business/Creator) [recomendada]
- Requer: conta Instagram Business/Creator vinculada a uma Página do Facebook + app Meta + token de longa duração (60 dias, renovável).
- Endpoint: `GET /{ig-user-id}/media` → últimas mídias com `media_url`, `permalink`, `caption`, `media_type`, `thumbnail_url`, `timestamp`.
- Backend cacheia em Redis (TTL 1–6h) e serve em `GET /api/v1/public/instagram-feed`.
- Job BullMQ recorrente para renovar token a cada ~50 dias e gravar no `Setting` (igual ao padrão Botyio).
- Astro consome SSR com fallback estático.

**Prós:** oficial, estável, sem custo direto de API.
**Contras:** complexidade de setup (app Meta + permissões + revisão), token requer renovação, conta precisa ser Business.

### Opção C — Widget de terceiros (Elfsight, SnapWidget, Lightwidget, Behold.so)
- Embed pronto.
- Behold.so tem plano gratuito generoso e é especializado em Instagram.
- **Prós:** setup em minutos, sem backend.
- **Contras:** branding limitado, planos pagos para customização, dependência externa, impacto em performance.

### Opção D — Scraping não-oficial
- ❌ **Descartada** — viola ToS do Instagram, frágil, bloqueio frequente.

## Recomendação inicial
- **Curto prazo:** Opção C com Behold.so (gratuito, automático, visual decente).
- **Médio prazo:** Opção B se quiser layout custom totalmente integrado ao DS Cinematic.

## Componentes/UX
- Seção "Acompanhe no Instagram" no rodapé ou em landing pages.
- Grid 3×2 ou 4×2 de últimas postagens (imagem + overlay com data/legenda no hover).
- Cada card linka para o `permalink` (abre no Instagram).
- Header com handle (@aumaf3d ou similar) + CTA "Seguir no Instagram".
- Suporte a Reels/vídeo: thumbnail estática + ícone play.

## Saídas
- Confirmação de handle oficial e tipo de conta (Business?).
- PR com seção de feed + link pro perfil.
- Documentação em `docs/integrations/instagram-feed.md`.
- Se Opção B: runbook de renovação de token.

## Pré-requisitos para destravar
- Handle oficial do Instagram da AUMAF.
- Confirmar se é conta Business/Creator (necessário para Opção B).
- Acesso de admin à Página do Facebook vinculada (Opção B).
- Decisão entre B/C.

## Riscos
- Token expirado sem renovação → feed vazio em prod (mitigar com job BullMQ + alerta).
- Conteúdo do Instagram pode ter posts não-curados/off-brand → considerar allowlist por hashtag ou sinalização manual.
- Posts com vídeos longos / carrosséis precisam de tratamento específico no card.
