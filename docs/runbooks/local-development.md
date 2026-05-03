# Local Development — AUMAF 3D

Guia zero-to-running para subir todo o ambiente local em uma máquina nova.

## Pré-requisitos

| Ferramenta | Versão | Verificar |
|------------|--------|-----------|
| Node.js    | ≥ 20.x | `node -v` |
| npm        | ≥ 10   | `npm -v`  |
| Docker     | ≥ 24   | `docker -v` |
| Docker Compose | ≥ 2 | `docker compose version` |
| Git        | qualquer | `git --version` |

> **macOS Apple Silicon:** instale Docker Desktop e ative “Use Rosetta for x86/amd64 emulation” se houver problemas com imagens.

## Setup inicial (uma vez)

```bash
git clone https://github.com/kayorid/aumaf-3d-site.git
cd aumaf-3d-site
npm install                     # turbo + workspaces
cp backend/.env.example backend/.env
cp frontend-admin/.env.example frontend-admin/.env 2>/dev/null || true
```

Edite `backend/.env`:

```env
JWT_SECRET=<32+ caracteres aleatórios>   # openssl rand -hex 32
ADMIN_EMAIL=admin@aumaf.com.br
ADMIN_PASSWORD=AumafAdmin2026!           # troque antes de prod
ADMIN_NOTIFICATION_EMAIL=                # vazio = não envia (dev)
EMAIL_TRANSPORT=console                  # loga payload em dev
```

Suba a infra Docker:

```bash
npm run dev:db                 # Postgres :5432, Redis :6379, MinIO :9000
```

Aplique migrations + seed:

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
cd ..
```

## Subir o stack completo

Em terminais separados (ou via concurrently):

```bash
npm run dev:backend    # API → http://localhost:3000
npm run dev:public     # Astro → http://localhost:4321
npm run dev:admin      # Vite → http://localhost:5174
```

Ou tudo de uma vez:

```bash
npm run dev            # turbo orchestra
```

## Verificar saúde

```bash
bash scripts/smoke-test.sh
```

Deve retornar `✔ N/N checks passaram`.

## Storybook

```bash
cd frontend-admin
npm run storybook       # http://localhost:6006
```

## Testes

```bash
# Em todo o monorepo
npm run typecheck       # turbo typecheck
npm run lint            # turbo lint
npm run test            # jest (backend) + vitest (admin)

# E2E (admin precisa estar rodando)
cd frontend-admin
npm run test:e2e        # playwright
```

## Worker BullMQ — observar em ação

1. Backend rodando em `:3000`
2. Submeter um lead via formulário público (`localhost:4321/contato`) ou via curl:

```bash
curl -X POST http://localhost:3000/api/v1/leads \
  -H 'Content-Type: application/json' \
  -d '{"name":"Teste","email":"teste@x.com","phone":"+5516999990000","source":"site-aumaf-3d"}'
```

3. No log do backend você verá:
   - `Lead created`
   - `EMAIL (console transport)` com payload formatado (porque `EMAIL_TRANSPORT=console`)
   - `Job completed { queue: 'lead-notification' }`

## URLs locais — referência rápida

| Serviço | URL |
|---------|-----|
| Frontend público | http://localhost:4321 |
| Frontend admin   | http://localhost:5174 |
| Backend API      | http://localhost:3000 |
| Health agregado  | http://localhost:3000/health |
| MinIO Console    | http://localhost:9000 |
| Prisma Studio    | http://localhost:5555 (`npx prisma studio`) |
| Storybook        | http://localhost:6006 |

## Login dev

```
admin@aumaf.com.br / AumafAdmin2026!
```

## Reset completo

```bash
docker compose down -v   # apaga volumes Postgres/Redis/MinIO
rm -rf node_modules **/node_modules
npm install
npm run dev:db
cd backend && npx prisma migrate reset && cd ..
```

## Problemas comuns

### Porta 3000 ocupada
Outro serviço (ex: outro backend Node) está rodando. Pare ou troque `PORT` em `backend/.env`.

### Redis “MaxRetriesPerRequest” error nos workers BullMQ
`createIORedis` em `backend/src/lib/redis.ts` força `maxRetriesPerRequest: null` — exigência do BullMQ. Não altere.

### Storybook quebra com classes Tailwind `/8` ou `/15`
Não use sufixos com barra arbitrários como `/8`, `/15` — eles quebram o build. Use `/10`, `/20`, `/30` etc. (ver memória `feedback_admin_design_system`).

### MinIO 403 no upload
Bucket não foi criado no boot. Reinicie o backend; `ensureBucket` corrige na inicialização.

### Worker fica em "ready" mas job não processa
Verifique `Redis connected` no log de boot. Se ausente, `docker compose ps` para confirmar Redis up.
