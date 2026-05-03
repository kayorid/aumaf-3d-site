# Frontend Público — Astro 5

## Comandos

```bash
npm run dev      # astro dev → http://localhost:4321
npm run build    # astro build → dist/
npm run preview  # prévia do build
npm run lint     # eslint
```

## Estrutura

```
frontend-public/src/
├── pages/       # rotas file-based (.astro)
├── layouts/     # BaseLayout, BlogLayout
├── components/  # componentes Astro e React islands
└── styles/      # global.css, tokens CSS
```

## Páginas Planejadas
- `/` — Home (conversão + hero + serviços + depoimentos + FAQ)
- `/servicos` — FDM, SLA, SLS, SLM, Modelagem, Eng. Reversa
- `/sobre` — história, equipe, clientes
- `/contato` — formulário + WhatsApp
- `/blog` — listagem + paginação
- `/blog/[slug]` — post individual (SEO/GEO)

## Padrões
- Hidratação seletiva com `client:load` / `client:visible` apenas quando necessário
- Tailwind CSS para estilização — tokens do design system em `tailwind.config.ts`
- Imagens via `<Image>` do Astro (otimização automática)
- SEO: meta tags, Open Graph e schema via `<BaseLayout>`
- Sitemap gerado automaticamente pelo integration `@astrojs/sitemap`
