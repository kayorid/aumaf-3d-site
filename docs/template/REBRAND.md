# Rebrand — Passo-a-passo

Este guia leva o template do estado padrão (demo AUMAF 3D, tema `industrial-green`) até uma instância pronta para uma nova marca.

Há dois caminhos: o **interativo** (via `npm run brand:init`) e o **manual** (edição direta).

---

## Caminho A — Interativo (recomendado)

```bash
npm run brand:init
```

O script faz as seguintes perguntas:

1. **Nome da marca** (ex: "Acme Corp")
2. **Slug** (auto-derivado, ex: `acme-corp`)
3. **URL canônica** (ex: `https://acme.com.br`)
4. **E-mail de contato**
5. **WhatsApp** (DDD + número ou vazio)
6. **Cidade / UF**
7. **Tema visual** (lista os arquivos em `frontend-public/src/styles/themes/`)
8. **Reset git history?** (opcional — para começar um repo fresco)

Ao final, o script:

- Reescreve `packages/shared/src/template/config.ts` com os dados informados.
- Atualiza o `@import` do tema em `frontend-public/src/styles/global.css` e `frontend-admin/src/index.css`.
- Imprime um checklist do que ainda exige edição manual (logos, favicons, OG, copy das páginas vitrine).

Após o script, rode `npm run dev` e abra http://localhost:4321 para validar.

---

## Caminho B — Manual

### 1. Editar `template.config.ts`

Abra [`packages/shared/src/template/config.ts`](../../packages/shared/src/template/config.ts). Todos os campos são tipados — o TypeScript reclama se algo ficar inconsistente.

Campos obrigatórios:

```ts
name: 'Acme Corp',
legalName: 'Acme Corp Ltda',
slug: 'acme-corp',
url: 'https://acme.com.br',
logo: '/logo.png',
description: 'Descrição longa para SEO (140-200 chars).',
shortPitch: 'Frase curta de pitch (max 90 chars).',
address: { ... },
contact: { phone, phoneDisplay, whatsapp, email },
socials: { instagram, linkedin, ... },
navigation: { primary: [...], footer: [...] },
home: { hero: {...}, valueProps: [...] },
seo: { defaultTitle, titleTemplate, defaultDescription, defaultOgImage, locale },
theme: { themeName, fontFamily },
features: { blog, portfolio, reviews, contactForm, aiBlogGenerator, botyo },
```

Ver [`packages/shared/src/template/types.ts`](../../packages/shared/src/template/types.ts) para a tipagem completa.

### 2. Escolher um tema visual

Lista de temas em `frontend-public/src/styles/themes/`:

| Tema | Vibe |
|---|---|
| `industrial-green` | Cinematic Additive Manufacturing — preto + verde neon. Tema legado AUMAF. |
| `ocean-blue` | Corporate / SaaS / fintech — azul-marinho + azul ciano. Cantos médios. |
| `warm-boutique` | Lifestyle / hospitalidade / boutique — creme + terracota. **Tema light**, cantos grandes. |

Para ativar, edite o **primeiro `@import`** em dois arquivos:

```css
/* frontend-public/src/styles/global.css */
@import './themes/ocean-blue.css';
```

```css
/* frontend-admin/src/index.css */
@import '../../frontend-public/src/styles/themes/ocean-blue.css';
```

E atualize `theme.themeName` em `template.config.ts` (para consistência semântica — o valor não é lido em runtime, mas serve como documentação).

Para criar um tema do zero, veja [`THEMING.md`](THEMING.md).

### 3. Substituir assets visuais

Arquivos a substituir (todos em `frontend-public/public/`):

- `logo.png` — logo principal
- `favicon.ico` + `icon-192.png` + `icon-512.png` + `apple-touch-icon.png`
- `og/og-default.png` — imagem padrão de Open Graph (1200×630)
- `fonts/pirulen.otf` — fonte do lockup (opcional; se não usar Pirulen, redefina a `@font-face` em `global.css` e `index.css`)
- `site.webmanifest` — ajustar nome e cores

### 4. Editar páginas vitrine

Páginas com banner `TEMPLATE DEMO PAGE` precisam de copy real:

- `frontend-public/src/pages/servicos.astro` — serviços/produtos da sua marca
- `frontend-public/src/pages/materiais.astro` — opcional (era específico de impressão 3D)
- `frontend-public/src/pages/portfolio.astro` — cases/projetos
- `frontend-public/src/pages/sobre.astro` — história, equipe
- `frontend-public/src/pages/faq.astro` — FAQ
- `frontend-public/src/pages/avaliacoes.astro` — reviews (depende da feature)
- `frontend-public/src/pages/index.astro` — copy do hero e seções (apenas title/desc lêem do config)

Veja [`CONTENT.md`](CONTENT.md) para o detalhe de cada página.

### 5. Variáveis de ambiente

Copie `backend/.env.example` para `backend/.env` e edite. Mínimo necessário:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=<>32_chars
ADMIN_EMAIL=admin@suamarca.com
ADMIN_PASSWORD=<senha forte>
ADMIN_NAME=Admin
EMAIL_FROM=Sua Marca <noreply@suamarca.com>
```

### 6. Banco de dados

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

O seed cria o admin (do `.env`), 4 categorias neutras e o registro Settings com `siteName` lido do `templateConfig`.

### 7. Validação

```bash
npm run build       # deve passar sem warnings de tipo
npm run typecheck   # deve passar
npm run lint        # deve passar
npm run dev         # http://localhost:4321 e http://localhost:5174
```

Checklist visual:

- [ ] Lockup da Navbar mostra o novo nome
- [ ] Footer mostra novo NAP completo
- [ ] WhatsApp FAB abre conversa correta
- [ ] /contato envia lead → backoffice recebe email
- [ ] Login admin funciona com credenciais do `.env`
- [ ] Storybook (admin) renderiza com novo tema

---

## Próximos passos pós-rebrand

- **Posts iniciais.** Use o gerador de IA no admin (`/admin/posts/new`) para popular o blog. O prompt já está configurado com o contexto da sua empresa.
- **Integrações analytics.** Configure GA4, Clarity, Pixel, GTM em `/admin/settings`.
- **Reviews Google.** Se ativar `features.reviews`, configure `PUBLIC_FEATURABLE_WIDGET_ID` em `frontend-public/.env`.
- **Botyo (WhatsApp bot).** Configure em `/admin/integrations/botyo`.
- **Deploy.** Veja `deploy/` e `docs/runbooks/` para o setup VPS pronto.
