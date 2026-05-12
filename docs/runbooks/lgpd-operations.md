# Runbook — Operações LGPD

Este runbook cobre a operação diária da camada LGPD da AUMAF 3D. Para o
desenho geral, ler `docs/plans/2026-05-12-lgpd-compliance-plan.md`.

**Encarregado de Dados (DPO):** Luiz Felipe Lampa Risse — felipe@aumaf3d.com.br

---

## 1. Atender uma solicitação de direitos (DSR)

**SLA legal:** 15 dias úteis a contar da verificação (e-mail magic link
confirmado). O dashboard mostra dias restantes (vermelho = atrasado).

1. **Notificação.** Quando um titular submete `/lgpd/direitos`, recebemos
   uma linha em `data_subject_requests` com `status=pending_verification`.
   Após o titular clicar no magic link (válido 24h), o status vira `open` e
   `verifiedAt` é preenchido. Configurar alerta de e-mail para o DPO no
   futuro — por ora, monitorar pelo admin.
2. **Abrir.** Login em `/admin/lgpd/solicitacoes` (requer permissão
   `lgpd:view`). Clicar na linha para abrir o drawer lateral.
3. **Validar identidade.** O magic link já garante posse do e-mail. Para
   pedidos sensíveis (eliminação, anonimização, portabilidade), confirmar
   com o titular por um segundo canal (telefone do lead vinculado, p.ex.).
4. **Executar a ação:**
   - **access / portability** → clicar **Exportar PII (JSON)**. O arquivo
     baixado contém todos os leads, notes, consent logs e DSRs do e-mail.
     Enviar por canal seguro ao titular.
   - **correction** → ajustar manualmente no admin (`/admin/leads` etc.).
   - **anonymization / deletion** → clicar **Anonimizar dados deste
     titular** (verde sangrento, com `ConfirmDialog`). Substitui
     irreversivelmente nome/e-mail/telefone/mensagem por hashes. Após
     concluir, o status vira `completed` automaticamente.
   - **revocation** → para revogar consentimento de marketing, marcar
     `marketingConsent=false` no lead. O consentimento de cookies o
     próprio titular ajusta em `/preferencias-de-cookies`.
   - **info_share, info_no_consent, review_automated** → responder por
     e-mail; preencher `resolutionNote` no drawer e marcar como
     `completed`.
5. **Documentar.** Sempre escrever `resolutionNote` clara (auditável).
6. **Fechar.** Marcar status como `completed` (ou `rejected` com
   justificativa). `resolvedAt` é preenchido automaticamente.

---

## 2. Comunicar incidente de dados

Ver `docs/compliance/incident-response.md`. Resumo:

1. **Conter** — desligar o vetor (rotacionar chave, revogar token, isolar
   container, derrubar endpoint).
2. **Avaliar impacto** — quantos titulares, qual PII, qual risco.
3. **Notificar ANPD** em até **2 dias úteis** se houver risco a direitos.
4. **Notificar titulares afetados** no mesmo prazo (e-mail + página /aviso).
5. **Post-mortem público** em `docs/compliance/incidents/<data>.md`.

---

## 3. Atualizar a versão da política (forçar re-consent)

Quando texto da Política/Termos/Cookies mudar de forma material:

1. Editar `frontend-public/src/content/legal/*.md` (markdown).
2. Em `frontend-public/src/components/CookieConsent.astro`, bump da const:
   ```ts
   const POLICY_VERSION = '1.0' // → '1.1'
   ```
   (atualizar nas duas posições — `<aside data-policy-version>` e no
   script). Isto faz o banner aparecer de novo para TODO mundo que tinha
   consentido na versão anterior (storage key segue mas comparison falha).
3. Atualizar `Política — versão` no rodapé de cada `.md` legal.
4. Rebuild + deploy normal (CD pega automaticamente).
5. Avisar Botyio se o consentimento de marketing mudou.

---

## 4. Rodar smoke test

Local:
```bash
BASE_URL=http://localhost:4321 API_URL=http://localhost:3000 ./scripts/lgpd-smoke.sh
```

Produção:
```bash
BASE_URL=https://aumaf.kayoridolfi.ai API_URL=https://aumaf.kayoridolfi.ai ./scripts/lgpd-smoke.sh
```

Cobre: páginas legais 200, POST /consent 201, GET /dsr/requests 401 sem
auth, POST /dsr/request 201.

---

## 5. Backup do salt LGPD_ANON_SALT

`env.LGPD_ANON_SALT` (default `aumaf-lgpd-anon-default-salt-change-me`) é
o **sal usado nas anonimizações**. Em produção:

- Setar para 32 bytes aleatórios: `openssl rand -hex 32`.
- Persistir em `/srv/aumaf/env/.env.production` (chmod 600, owner `deploy`).
- **Backup off-server obrigatório** — guardar em 1Password (cofre
  `kayoridolfi.ai · AUMAF`). Sem o sal, anonimizações antigas perdem
  rastreabilidade entre si.
- **Rotação:** trocar o sal invalida hashes existentes. Só rotacionar em
  caso de vazamento. Antes de rotacionar, exportar PII de leads ainda não
  anonimizados se precisar correlacionar histórico.

---

## 6. Worker de retenção — overrides operacionais

O `data-retention.worker` roda às 03:00 BRT (06:00 UTC). Para forçar uma
sweep manual fora do horário (debug ou hotfix de incidente):

```ts
// Em scripts/manual-retention.ts (criar conforme necessidade):
import { runRetentionSweep } from '../backend/src/workers/data-retention.worker'
const summary = await runRetentionSweep()
console.log(summary)
```

Em produção, executar via SSH:
```bash
ssh deploy@2.24.72.8
cd /srv/aumaf
docker compose exec backend node -e "require('./dist/workers/data-retention.worker').runRetentionSweep().then(console.log)"
```

Os logs mostram `LGPD data retention sweep complete` com contadores. Se
algum bloco falhar (ex.: Prisma cluster timeout), o job é re-tentado pelo
BullMQ até `attempts=2`.

---

## 7. Permissão de feature LGPD no admin

A feature `lgpd` foi adicionada em `backend/src/lib/permissions.ts`:

- **ADMIN** recebe `lgpd:edit` (e `lgpd:view`) automaticamente via
  `ROLE_PRESETS.ADMIN = ALL_FEATURES_EDIT`.
- **EDITOR / MARKETING** podem ganhar `lgpd:view` ou `lgpd:edit` via
  override individual em `/admin/usuarios/:id` se necessário (recomendado
  manter restrito ao DPO + sócios).

A sidebar (`/admin/lgpd/solicitacoes`) é gated por `lgpd:view`.
