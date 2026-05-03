# Backend — AUMAF 3D API

## Comandos

```bash
npm run dev          # tsx watch src/server.ts → :3000
npm run build        # tsc
npm run test         # jest
npm run lint         # eslint
npm run typecheck    # tsc --noEmit

npx prisma migrate dev   # nova migration
npx prisma studio        # UI do banco → :5555
npx prisma db seed       # seed inicial
```

## Estrutura

```
backend/src/
├── server.ts        # entry point — Express listen
├── app.ts           # Express app factory
├── config/          # env vars validados com Zod
└── ...              # features: routes, controllers, services, repos
```

## Variáveis de Ambiente
Ver `backend/.env.example`. Obrigatórias: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `MINIO_*`.

## Padrões
- Rotas em `src/routes/`, controllers em `src/controllers/`, serviços em `src/services/`
- Validação de input com schemas Zod de `@aumaf/shared`
- Erros HTTP via middleware centralizado
- Logs com Pino (JSON em prod, pretty em dev)
- Rate limiting ativo via `express-rate-limit`
