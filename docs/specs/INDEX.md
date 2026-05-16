# Specs Index

> Visão de portfólio das specs deste projeto. Regenerado por `scripts/update_index.py`.

**Última atualização**: 2026-05-10

---

## Em andamento

| Feature | Iniciada em | Status |
|---------|-------------|--------|
| **instagram-feed** | 2026-05-10 | `implementation-complete` — código + wiring CI/Docker prontos e validados em build local. Bloqueado por setup externo: Kayo criar conta Behold.so, colher `FEED_ID` e cadastrar secret `PUBLIC_BEHOLD_FEED_ID` no GitHub. Ver `_active/2026-05-10-instagram-feed/status.md`. |

## Recém concluídas

| Feature | Concluída em | Retrospectiva |
|---------|--------------|---------------|
| **botyio-config-ui (credenciais dinâmicas + cripto AES-256-GCM)** | 2026-05-06 | [retro](_completed/2026-05-06-botyio-config-ui/retrospective.md) — ADR-002, master key em `/etc/aumaf/master.key` |
| vps-provisioning-cicd (homologação live) | 2026-05-04 | [retro](_completed/2026-05-04-vps-provisioning-cicd/retrospective.md) |
| ai-image-generation (39 imagens AI + Maps + Equipe) | 2026-05-04 | [retro](_completed/2026-05-03-ai-image-generation/retrospective.md) |
| botyio-integration (Lead Capture WhatsApp) | 2026-05-03 | [PR #7](https://github.com/kayorid/aumaf-3d-site/pull/7) — código mergeado, aguarda credenciais para ativar |
| q3-foundation (BullMQ + Storybook + QA + Ops) | 2026-05-03 | [retro](_completed/2026-05-03-q3-foundation/retrospective.md) |
| frontend-public-uxa11y-seo-geo | 2026-05-03 | [pasta](_completed/2026-05-03-frontend-public-uxa11y-seo-geo/) |
| q2-blog-backoffice | 2026-05-03 | [pasta](_completed/2026-05-02-q2-blog-backoffice/) |
| q1-site-publico | 2026-05-02 | [retro](_completed/2026-05-02-q1-site-publico/retrospective.md) |

## Backlog (aguardando dependências externas)

| Feature | Por que aguarda |
|---------|-----------------|
| domínio-AUMAF (migração de homologação para prod) | AUMAF confirmar/comprar domínio; envolve DNS swap + Cloudflare Origin Cert + ajustes de URL em `.env.production` (1 PR) |
| sentry-uptime (observability v2) | Deferido pela escolha em homologação; ativar quando AUMAF pedir alertas proativos |

> ℹ️ `botyio-ativação` saiu do backlog em 2026-05-10 — integração ativa em produção (ver `project_botyio_active.md`).

## Constituição

[constitution.md](constitution.md)
