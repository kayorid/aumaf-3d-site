# Requirements — Geração de Imagens AI (Higgsfield)

> Substituir todos os placeholders visuais do site público AUMAF 3D por imagens fotorrealistas alinhadas ao DS Cinematic Additive Manufacturing, geradas via Higgsfield MCP, sem depender da entrega de vídeos pelo cliente.

**Slug**: `2026-05-03-ai-image-generation`
**Início**: 2026-05-03
**Stakeholders**: Kayo (dev/freelancer), AUMAF 3D (cliente)
**Status**: clarifying

---

## 1. Contexto e problema

O site público tem múltiplos slots de mídia ainda renderizados como placeholders HUD ("Vídeo em produção", play icon, tech-grid). Os MP4s reais dependem de produção de vídeo pelo cliente, sem prazo confirmado. Em paralelo, páginas como `portfolio.astro` e `materiais.astro` foram entregues sem nenhum slot de imagem — são puramente tipográficas, o que enfraquece a percepção premium do produto e prejudica conversão.

O PR #8 (mergeado em `f839289`) provou que o pipeline Higgsfield + `nano_banana_2` produz imagens consistentes com o DS quando o prompt-template canônico é seguido. As 5 primeiras imagens (hero + 4 capabilities do `index.astro`) estão em produção. Falta cobrir os slots restantes e adicionar slots novos onde fazem falta.

## 2. Objetivo de negócio

Eliminar 100% dos placeholders visuais do site público até o final desta feature, mantendo coerência visual total (paleta verde AUMAF `#61c54f`, mood Cinematic). Métrica primária: **0 slots HUD-placeholder ativos em produção**.

## 3. Personas afetadas

| Persona | Como esta feature afeta |
|---------|------------------------|
| Visitante do site | Vê imagens reais coerentes em vez de placeholders genéricos |
| AUMAF (cliente) | Pode mostrar o site em apresentações comerciais sem desculpar-se por placeholders |
| Editor de blog (admin) | Posts sem `coverImageUrl` ganham fallback categórico decente |
| Kayo (dev) | Tem biblioteca de masters PNG reusável para redes sociais e materiais |

## 4. User stories

- Como visitante, quero ver a página `/portfolio` com cases visuais reais para entender o nível técnico da AUMAF.
- Como visitante, quero ver a página `/materiais` com amostras visuais de cada material para distinguir PLA de PEEK rapidamente.
- Como visitante de `/v2`, quero ver a homepage alternativa com a mesma qualidade visual da `/`.
- Como editor admin, quero que posts sem capa exibam um fallback categórico que respeite o DS, em vez de quadro vazio.
- Como Kayo, quero PNG masters 2k em pasta versionada para reaproveitar em redes sociais e briefings sem regerar.

## 5. Critérios de aceitação (EARS)

### Comportamento principal

- **R1**: O site público deve exibir imagem fotorrealista verde-AUMAF em todos os 6 slots de vídeo do `index.astro` (5 já entregues + `sls-laser`).
- **R2**: O site público deve exibir imagem fotorrealista verde-AUMAF em todos os 6 slots de vídeo do `v2/index.astro` mais o slot extra "highlight visual".
- **R3**: A página `/portfolio` deve exibir 12 cards (PORT-01 a PORT-12), cada um com `<img>` real e respondendo 200.
- **R4**: A página `/materiais` deve exibir 16 cards (MAT-01 a MAT-16), cada um com `<img>` real e respondendo 200.
- **R5**: O blog deve exibir uma capa categórica de fallback quando `post.coverImageUrl` for nulo/inválido.
- **R6**: Quando uma imagem `.webp` for adicionada em `frontend-public/public/images/`, o respectivo master `.png` 2752×1536 deve estar em `assets/generated/images/` com o mesmo basename.

### Comportamento condicional

- **R7**: Onde um slot de mídia for futuro placeholder de vídeo (não definitivo), o markup deve preservar comentário `<video poster={image}>` para migração trivial quando o MP4 chegar.
- **R8**: Onde uma página ainda não tem slots `<img>` (portfolio, materiais), os slots devem ser adicionados primeiro, antes da geração das imagens.

### Comportamento de erro

- **R9**: Se uma imagem falhar ao carregar, o layout deve manter `width`/`height` (aspect ratio) sem layout shift, exibindo o `bg-surface-base` por baixo.
- **R10**: Se o saldo Higgsfield ficar abaixo de 100 créditos durante geração em lote, parar e avisar o usuário antes de prosseguir.

## 6. Edge cases conhecidos

- **AVIFs orfãos** (`raissa-ninelli`, `thiago-gerotto`, `vitor-goncalez`, `SAE-formula`) já no `/public/images/` mas não referenciados — decidir se aproveitar em `sobre.astro` ou deletar.
- **Sobre.astro Map placeholder** — embed real do Google Maps é provavelmente melhor que imagem AI; tratar como decisão de design, não geração.
- **Blog posts existentes com `coverImageUrl` nulo** — fallback deve ser determinístico (mesma capa para a mesma categoria), não aleatório, para evitar mudança visual a cada refresh.
- **`v2/index.astro` reaproveitamento** — duplica os 6 vídeos do `/`. Decidir se reaproveita as 5 imagens já produzidas ou gera variantes.
- **Higgsfield MCP desconecta entre turnos** — `ToolSearch` precisa recarregar schemas; não é falha do plano, é operacional.

## 7. Fora de escopo (explícito)

- ✋ **Vídeos reais** — esta feature não substitui MP4s; apenas garante que enquanto não chegam, há imagem decente. Quando chegarem, será PR separado.
- ✋ **Reescrita de copy** — só geramos imagens, textos das páginas permanecem como estão.
- ✋ **Embed Google Maps em `sobre.astro`** — é decisão de design, não de geração de imagem; tratar em PR/spec separada se necessário.
- ✋ **Otimização agressiva (AVIF, srcset multi-tamanho)** — `<img>` simples com WebP min do Higgsfield basta. Otimização vai numa pass de performance dedicada.
- ✋ **Treinar modelo Soul** (avatares persistentes do Higgsfield) — não há necessidade para esta feature.
- ✋ **Imagens de equipe** (substituir AVIFs orfãos por geração) — manter as fotos reais existentes.

## 8. Métricas de sucesso

| Métrica | Linha de base atual | Meta pós-feature | Como medir |
|---------|--------------------|--------------------|------------|
| Slots HUD-placeholder ativos | 7 (sls-laser + 6 do v2 + highlight) | 0 | grep `Vídeo em produção` em todas `.astro` |
| Páginas sem nenhuma imagem | 2 (`portfolio`, `materiais`) | 0 | inspeção manual |
| Posts blog sem fallback de capa | 100% dos posts com `coverImageUrl=null` | 0 | query do banco |
| WebPs em `/public/images/` | 5 | ≥ 35 (5 + sls + v2-extra + 12 port + 16 mat + 4-6 blog) | `ls public/images/*.webp \| wc -l` |
| PNG masters em `assets/generated/images/` | 5 | mesmo número de WebPs em `/images/` | comparar listas |

## 9. Suposições e dependências

- **Higgsfield MCP** segue acessível no plano ultra do Kayo (~2467 créditos no início; cada imagem 2k consome poucos créditos)
- **Pipeline `nano_banana_2`** continua produzindo qualidade equivalente ao PR#8 com o prompt-template canônico
- **DS Cinematic** não muda durante esta feature (verde `#61c54f` permanece o accent único)
- **Backend** não precisa de mudanças (blog fallback é client-side no Astro)
- Não há prazo apertado — Q3 foundation já entregue, esta é a "última milha visual"

## 10. Tags pendentes de clarificação

- `[CLARIFY-A]` — Para `/v2/index.astro`: reaproveitar as 5 imagens do `/` ou gerar variantes específicas?
- `[CLARIFY-B]` — `sobre.astro`: substituir Map placeholder por embed Google Maps real (sem AI) ou imagem aérea AI de São Carlos?
- `[CLARIFY-C]` — Blog cover defaults: 4 (técnico/case/dicas/novidades) ou 6 categorias? Mapear quais categorias existem no banco hoje.
- `[CLARIFY-D]` — AVIFs orfãos da equipe: integrar em `sobre.astro` (cria slot novo) ou deletar?
- `[CLARIFY-E]` — Para `materiais.astro` (16 materiais), prompt-template muda? Cada material precisa de visual identificável (filamento PLA é diferente de PEEK), o template atual é para cenas industriais.
- `[CLARIFY-F]` — `sls-laser.mp4` poster: cena distinta das 4 capabilities ou pode ser um loop visual semelhante a `metal-parts`?

---

## 11. Clarifications

> Preenchido na fase Clarify pelo Kayo. Todas as 6 perguntas precisam de resposta antes do design.

| Data | Pergunta | Opções | Decisão | Razão |
|------|----------|--------|---------|-------|
| 2026-05-04 | A — v2 imagens | Reaproveitar / Gerar variantes | **Reaproveitar 5 do `/` + 1 variante (`v2-highlight`)** | Economiza créditos; v2 é variação de layout, não de mensagem. Único asset novo é o highlight visual diferenciador. |
| 2026-05-04 | B — sobre.astro mapa | Embed Maps / Imagem aérea AI | **Google Maps embed real** | Mais útil ao lead (rota navegável), zero custo, sem risco de "fake aerial" mal calibrada. |
| 2026-05-04 | C — Blog defaults | 4 categorias / 6 categorias | **7 categorias do seed + 1 fallback genérico = 8 capas** | Banco já tem 7 categorias seedadas (Guia Técnico, Materiais, Case Study, Engenharia, Parceria, Inovação, Tutorial). Cobertura completa + fallback para futuros sem default. |
| 2026-05-04 | D — AVIFs equipe | Integrar / Deletar | **Integrar em seção Equipe** | Humaniza `sobre.astro`; fotos já existem (custo zero); reforça presença da AUMAF como time real, não anônimo. |
| 2026-05-04 | E — Template materiais | Adaptar / Manter | **Adaptar para "amostra de material"** | PLA, PEEK, resina, metal são visualmente distintos; template industrial geraria 16 cenas iguais. Variar contexto (filamento em rolo / peça impressa / amostra de cor). |
| 2026-05-04 | F — sls-laser | Distinta / Reaproveitar | **Cena distinta (powder bed + laser)** | SLS é a tecnologia mais "wow" da AUMAF; merece cena dedicada — diferencia visualmente das outras 4 capabilities. |

## 12. Links

- Memória de contexto: `~/.claude/projects/.../memory/project_ai_image_generation.md`
- PR já mergeado (referência): https://github.com/kayorid/aumaf-3d-site/pull/8
- DS canônico: `frontend-public/tailwind.config.ts`, `frontend-public/src/styles/global.css`
- Setup MCP: `claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp`
