# Project Scaffold — AUMAF 3D Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Criar a base completa do monorepo AUMAF 3D com backend, dois frontends e pacotes compartilhados — tudo configurado e funcional localmente.

**Architecture:** Monorepo npm workspaces + Turbo com três apps (backend Express, frontend-public Astro, frontend-admin React/Vite) e um pacote shared (schemas Zod). Sem multi-tenancy. Infraestrutura local via Docker Compose (PostgreSQL, Redis, MinIO).

**Tech Stack:** Node.js 18 + Express + Prisma + PostgreSQL 16, Astro 4, React 18 + Vite + Tailwind + Radix UI, Redis 7 + BullMQ, MinIO, JWT, Zod, CASL, Pino, Sentry, Storybook, Playwright, Vitest, Jest.

---

## Task 1: Root do monorepo

**Files:**
- Create: `package.json`
- Create: `turbo.json`
- Create: `.gitignore`
- Create: `.nvmrc`
- Create: `docker-compose.yml`

**Step 1: Criar `package.json` raiz**

```json
{
  "name": "aumaf-3d-site",
  "version": "0.0.1",
  "private": true,
  "workspaces": [
    "backend",
    "frontend-public",
    "frontend-admin",
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:db\" \"npm run dev:backend\" \"npm run dev:public\" \"npm run dev:admin\"",
    "dev:db": "docker compose up -d",
    "dev:backend": "npm run dev --workspace=backend",
    "dev:public": "npm run dev --workspace=frontend-public",
    "dev:admin": "npm run dev --workspace=frontend-admin",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "test:e2e": "npm run test:e2e --workspace=frontend-admin"
  },
  "devDependencies": {
    "concurrently": "^9.2.1",
    "turbo": "^2.9.6"
  }
}
```

**Step 2: Criar `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".astro/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "env": ["NODE_ENV"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Step 3: Criar `.nvmrc`**

```
18
```

**Step 4: Criar `.gitignore`**

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
.astro/
.next/
out/

# Environment
.env
.env.local
.env.*.local
!.env.example

# Logs
logs/
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
*.swp
*.swo

# Testing
coverage/
playwright-report/
test-results/
storybook-static/

# Prisma
prisma/migrations/

# Turbo
.turbo/
```

**Step 5: Criar `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: aumaf_postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: aumaf
      POSTGRES_PASSWORD: aumaf123
      POSTGRES_DB: aumaf_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: aumaf_redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio:latest
    container_name: aumaf_minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

**Step 6: Commit**

```bash
git add package.json turbo.json .gitignore .nvmrc docker-compose.yml
git commit -m "chore: setup monorepo root (workspaces + turbo + docker)"
```

---

## Task 2: packages/shared

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/schemas/post.ts`
- Create: `packages/shared/src/schemas/lead.ts`
- Create: `packages/shared/src/schemas/user.ts`
- Create: `packages/shared/src/schemas/settings.ts`

**Step 1: Criar `packages/shared/package.json`**

```json
{
  "name": "@aumaf/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.6.2"
  },
  "dependencies": {
    "zod": "^3.23.8"
  }
}
```

**Step 2: Criar `packages/shared/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Criar schemas Zod compartilhados**

`packages/shared/src/schemas/user.ts`:
```typescript
import { z } from 'zod'

export const UserRoleSchema = z.enum(['ADMIN', 'EDITOR', 'MARKETING'])
export type UserRole = z.infer<typeof UserRoleSchema>

export const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: UserRoleSchema,
})
export type CreateUserInput = z.infer<typeof CreateUserSchema>

export const UpdateUserSchema = CreateUserSchema.partial().omit({ password: true })
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
export type LoginInput = z.infer<typeof LoginSchema>
```

`packages/shared/src/schemas/post.ts`:
```typescript
import { z } from 'zod'

export const PostStatusSchema = z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'UNPUBLISHED'])
export type PostStatus = z.infer<typeof PostStatusSchema>

export const CreatePostSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  coverImageUrl: z.string().url().optional(),
  categoryId: z.string().cuid().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  publishedAt: z.coerce.date().optional(),
  status: PostStatusSchema.default('DRAFT'),
})
export type CreatePostInput = z.infer<typeof CreatePostSchema>

export const UpdatePostSchema = CreatePostSchema.partial()
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>

export const GeneratePostSchema = z.object({
  topic: z.string().min(5).max(200),
  keywords: z.array(z.string()).max(10).optional(),
  tone: z.enum(['technical', 'educational', 'commercial']).default('educational'),
})
export type GeneratePostInput = z.infer<typeof GeneratePostSchema>
```

`packages/shared/src/schemas/lead.ts`:
```typescript
import { z } from 'zod'

export const CreateLeadSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20).optional(),
  message: z.string().max(1000).optional(),
  source: z.string().max(100).optional(),
})
export type CreateLeadInput = z.infer<typeof CreateLeadSchema>
```

`packages/shared/src/schemas/settings.ts`:
```typescript
import { z } from 'zod'

export const UpdateSettingsSchema = z.object({
  siteName: z.string().min(2).max(100).optional(),
  siteDescription: z.string().max(300).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),
  whatsappNumber: z.string().max(20).optional(),
  botyoWebhookUrl: z.string().url().optional(),
  ga4MeasurementId: z.string().optional(),
  clarityProjectId: z.string().optional(),
  facebookPixelId: z.string().optional(),
  gtmContainerId: z.string().optional(),
  customHeadScripts: z.string().optional(),
  customBodyScripts: z.string().optional(),
})
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>
```

`packages/shared/src/index.ts`:
```typescript
export * from './schemas/user'
export * from './schemas/post'
export * from './schemas/lead'
export * from './schemas/settings'
```

**Step 4: Build do pacote**

```bash
cd packages/shared && npm run build
```
Expected: pasta `dist/` criada sem erros.

**Step 5: Commit**

```bash
git add packages/
git commit -m "feat: add @aumaf/shared package with Zod schemas"
```

---

## Task 3: Backend — setup inicial

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/jest.config.ts`
- Create: `backend/.env.example`
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`
- Create: `backend/src/config/env.ts`

**Step 1: Criar `backend/package.json`**

```json
{
  "name": "@aumaf/backend",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src --ext ts --max-warnings 0",
    "typecheck": "tsc --noEmit",
    "test": "jest --passWithNoTests",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "prisma:studio": "prisma studio",
    "prisma:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@aumaf/shared": "*",
    "@aws-sdk/client-s3": "^3.1038.0",
    "@aws-sdk/s3-request-presigner": "^3.1038.0",
    "@casl/ability": "^6.8.1",
    "@casl/prisma": "^1.6.0",
    "@godaddy/terminus": "^4.12.1",
    "@prisma/client": "^5.22.0",
    "@sentry/node": "^7.120.4",
    "bcrypt": "^5.1.1",
    "bullmq": "^5.76.3",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.6",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^8.3.1",
    "helmet": "^8.1.0",
    "hpp": "^0.2.3",
    "ioredis": "^5.10.1",
    "jsonwebtoken": "^9.0.2",
    "pino": "^10.3.0",
    "pino-http": "^11.0.0",
    "pino-pretty": "^13.1.3",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/cookie-parser": "^1.4.8",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/hpp": "^0.2.6",
    "@types/jest": "^29.5.13",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^20.16.10",
    "jest": "^30.3.0",
    "jest-mock-extended": "^4.0.0",
    "prisma": "^5.22.0",
    "ts-jest": "^29.4.6",
    "ts-node": "^10.9.2",
    "tsx": "^4.19.1",
    "typescript": "^5.6.2"
  }
}
```

**Step 2: Criar `backend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "paths": {
      "@aumaf/shared": ["../packages/shared/src/index.ts"]
    }
  },
  "include": ["src", "prisma"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Criar `backend/jest.config.ts`**

```typescript
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '@aumaf/shared': '<rootDir>/../packages/shared/src/index.ts',
  },
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
}

export default config
```

**Step 4: Criar `backend/.env.example`**

```env
# Database
DATABASE_URL="postgresql://aumaf:aumaf123@localhost:5432/aumaf_dev?schema=public"

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=change-this-in-production-minimum-32-chars
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_ADMIN_URL=http://localhost:5174
FRONTEND_PUBLIC_URL=http://localhost:4321

# Storage
STORAGE_DRIVER=s3
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin123
S3_BUCKET=aumaf-media

# Redis
REDIS_URL=redis://localhost:6379

# Monitoramento
SENTRY_DSN=
LOG_FORMAT=text

# IA para geração de posts
AI_PROVIDER=openai
AI_API_KEY=

# Botyo (WhatsApp)
BOTYO_WEBHOOK_URL=
```

**Step 5: Criar `backend/src/config/env.ts`**

```typescript
import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_ADMIN_URL: z.string().url(),
  FRONTEND_PUBLIC_URL: z.string().url(),
  STORAGE_DRIVER: z.enum(['fs', 's3']).default('s3'),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  SENTRY_DSN: z.string().optional(),
  LOG_FORMAT: z.enum(['text', 'json']).default('text'),
  AI_PROVIDER: z.enum(['openai', 'anthropic', 'gemini']).optional(),
  AI_API_KEY: z.string().optional(),
  BOTYO_WEBHOOK_URL: z.string().url().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
```

**Step 6: Criar `backend/src/app.ts`**

```typescript
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import hpp from 'hpp'
import { pinoHttp } from 'pino-http'
import { env } from './config/env'
import { logger } from './config/logger'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({
    origin: [env.FRONTEND_ADMIN_URL, env.FRONTEND_PUBLIC_URL],
    credentials: true,
  }))
  app.use(hpp())
  app.use(cookieParser())
  app.use(express.json({ limit: '5mb' }))
  app.use(pinoHttp({ logger }))

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  return app
}
```

**Step 7: Criar `backend/src/config/logger.ts`**

```typescript
import pino from 'pino'
import { env } from './env'

export const logger = pino(
  env.LOG_FORMAT === 'text'
    ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
    : {}
)
```

**Step 8: Criar `backend/src/server.ts`**

```typescript
import { createServer } from 'http'
import { createTerminus } from '@godaddy/terminus'
import { createApp } from './app'
import { env } from './config/env'
import { logger } from './config/logger'

async function main() {
  const app = createApp()
  const server = createServer(app)

  createTerminus(server, {
    signal: 'SIGINT',
    healthChecks: { '/health': async () => {} },
    onSignal: async () => {
      logger.info('Server shutting down...')
    },
  })

  server.listen(env.PORT, () => {
    logger.info(`Backend running on http://localhost:${env.PORT}`)
  })
}

main().catch((err) => {
  logger.error(err)
  process.exit(1)
})
```

**Step 9: Escrever teste do health endpoint**

Criar `backend/src/app.test.ts`:
```typescript
import request from 'supertest'
import { createApp } from './app'

// Mock env para testes
jest.mock('./config/env', () => ({
  env: {
    FRONTEND_ADMIN_URL: 'http://localhost:5174',
    FRONTEND_PUBLIC_URL: 'http://localhost:4321',
    LOG_FORMAT: 'text',
    STORAGE_DRIVER: 'fs',
    REDIS_URL: 'redis://localhost:6379',
    NODE_ENV: 'test',
    PORT: 3000,
    JWT_SECRET: 'test-secret-minimum-32-characters-here',
    JWT_EXPIRES_IN: '7d',
  },
}))

jest.mock('./config/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}))

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const app = createApp()
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.timestamp).toBeDefined()
  })
})
```

Instalar supertest:
```bash
cd backend && npm install -D supertest @types/supertest
```

**Step 10: Rodar o teste**

```bash
cd backend && npm test
```
Expected: PASS — `GET /api/health returns status ok`

**Step 11: Commit**

```bash
git add backend/
git commit -m "feat: bootstrap backend with Express, health endpoint and env validation"
```

---

## Task 4: Backend — Prisma Schema

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/prisma/seed.ts`

**Step 1: Inicializar Prisma**

```bash
cd backend && npx prisma init --datasource-provider postgresql
```

**Step 2: Criar `backend/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN
  EDITOR
  MARKETING
}

enum PostStatus {
  DRAFT
  PENDING_REVIEW
  PUBLISHED
  UNPUBLISHED
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      UserRole @default(EDITOR)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  posts Post[] @relation("AuthorPosts")

  @@map("users")
}

model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  posts Post[]

  @@map("categories")
}

model Post {
  id               String     @id @default(cuid())
  title            String
  slug             String     @unique
  excerpt          String?
  content          String
  coverImageUrl    String?
  status           PostStatus @default(DRAFT)
  metaTitle        String?
  metaDescription  String?
  generatedByAi    Boolean    @default(false)
  publishedAt      DateTime?
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt

  author     User?     @relation("AuthorPosts", fields: [authorId], references: [id])
  authorId   String?
  category   Category? @relation(fields: [categoryId], references: [id])
  categoryId String?

  @@map("posts")
}

model Lead {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  message   String?
  source    String?
  createdAt DateTime @default(now())

  @@map("leads")
}

model Setting {
  id                  String   @id @default(cuid())
  siteName            String   @default("AUMAF 3D")
  siteDescription     String?
  contactEmail        String?
  contactPhone        String?
  whatsappNumber      String?
  botyoWebhookUrl     String?
  ga4MeasurementId    String?
  clarityProjectId    String?
  facebookPixelId     String?
  gtmContainerId      String?
  customHeadScripts   String?
  customBodyScripts   String?
  updatedAt           DateTime @updatedAt

  @@map("settings")
}
```

**Step 3: Criar seed inicial**

`backend/prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@12345', 12)

  await prisma.user.upsert({
    where: { email: 'admin@aumaf3d.com.br' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@aumaf3d.com.br',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  await prisma.setting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'AUMAF 3D',
      siteDescription: 'Impressão 3D profissional — FDM, SLA, SLS, SLM e mais.',
    },
  })

  console.log('✅ Seed concluído.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**Step 4: Subir o banco e rodar migration**

```bash
docker compose up -d postgres
cd backend && cp .env.example .env
npx prisma migrate dev --name init
npx prisma generate
```
Expected: tabelas criadas sem erros.

**Step 5: Rodar seed**

```bash
cd backend && npm run prisma:seed
```
Expected: `✅ Seed concluído.`

**Step 6: Commit**

```bash
git add backend/prisma/
git commit -m "feat: add Prisma schema (User, Post, Category, Lead, Setting) and seed"
```

---

## Task 5: frontend-admin — Setup

**Files:**
- Create: `frontend-admin/` (via Vite)
- Modify: `frontend-admin/package.json`
- Create: `frontend-admin/vite.config.ts`
- Create: `frontend-admin/tailwind.config.ts`
- Create: `frontend-admin/postcss.config.js`
- Create: `frontend-admin/src/index.css`
- Create: `frontend-admin/.env.example`

**Step 1: Criar projeto Vite**

```bash
cd /Users/kayoridolfi/Documents/vibecoding/aumaf-3d-site
npm create vite@latest frontend-admin -- --template react-swc-ts
```

**Step 2: Atualizar `frontend-admin/package.json`**

Substituir o conteúdo gerado pelo Vite pelo seguinte (mantendo devDependencies do Vite e adicionando todas as deps do stack):

```json
{
  "name": "@aumaf/frontend-admin",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 5174",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --max-warnings 200",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "dependencies": {
    "@aumaf/shared": "*",
    "@casl/ability": "^6.8.1",
    "@casl/react": "^5.0.0",
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-alert-dialog": "latest",
    "@radix-ui/react-avatar": "latest",
    "@radix-ui/react-checkbox": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "@radix-ui/react-label": "latest",
    "@radix-ui/react-popover": "latest",
    "@radix-ui/react-progress": "latest",
    "@radix-ui/react-scroll-area": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-separator": "latest",
    "@radix-ui/react-slot": "latest",
    "@radix-ui/react-switch": "latest",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-toast": "latest",
    "@radix-ui/react-tooltip": "latest",
    "@sentry/react": "^7.120.4",
    "@tanstack/react-query": "^5.100.5",
    "@tiptap/extension-image": "latest",
    "@tiptap/extension-link": "latest",
    "@tiptap/extension-placeholder": "latest",
    "@tiptap/extension-underline": "latest",
    "@tiptap/react": "latest",
    "@tiptap/starter-kit": "latest",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "isomorphic-dompurify": "^3.10.0",
    "lucide-react": "^0.577.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.74.0",
    "react-router-dom": "^6.28.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^4.3.6",
    "zustand": "^5.0.12"
  },
  "devDependencies": {
    "@chromatic-com/storybook": "^5.1.2",
    "@playwright/test": "^1.59.1",
    "@storybook/addon-a11y": "^10.3.5",
    "@storybook/addon-essentials": "^10.3.5",
    "@storybook/addon-vitest": "^10.3.5",
    "@storybook/react-vite": "^10.3.5",
    "@storybook/test": "^10.3.5",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^20.16.10",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@typescript-eslint/eslint-plugin": "^7.18.0",
    "@typescript-eslint/parser": "^7.18.0",
    "@vitejs/plugin-react-swc": "^3.7.1",
    "autoprefixer": "^10.5.0",
    "eslint": "^8.57.1",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.5.2",
    "jsdom": "^29.1.0",
    "msw": "^2.13.6",
    "playwright": "^1.58.2",
    "postcss": "^8.4.47",
    "storybook": "^10.3.5",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.2",
    "vite": "^5.4.9",
    "vitest": "^4.0.18"
  }
}
```

**Step 3: Criar `frontend-admin/vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@aumaf/shared': path.resolve(__dirname, '../packages/shared/src/index.ts'),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
```

**Step 4: Criar `frontend-admin/tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
          900: '#14532d',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

**Step 5: Criar `frontend-admin/postcss.config.js`**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Step 6: Criar `frontend-admin/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --radius: 0.5rem;
  }
}
```

**Step 7: Criar `frontend-admin/.env.example`**

```env
VITE_API_URL=http://localhost:3000/api
VITE_SENTRY_DSN=
```

**Step 8: Criar estrutura inicial de pastas**

```
frontend-admin/src/
├── components/
│   └── ui/          # componentes Radix/Tailwind reutilizáveis
├── features/        # módulos por domínio (auth, posts, leads, settings)
├── hooks/           # custom hooks
├── lib/             # utils, queryClient, api client
├── pages/           # páginas (rotas)
├── stores/          # zustand stores
├── App.tsx
├── main.tsx
└── index.css
```

Criar `frontend-admin/src/lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Criar `frontend-admin/src/lib/api.ts`:
```typescript
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message ?? 'Request failed')
  }
  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
```

**Step 9: Instalar dependências e verificar build**

```bash
cd frontend-admin && npm install && npm run build
```
Expected: build sem erros de TypeScript.

**Step 10: Commit**

```bash
git add frontend-admin/
git commit -m "feat: setup frontend-admin (React + Vite + Tailwind + Radix)"
```

---

## Task 6: frontend-admin — Storybook e Playwright

**Files:**
- Create: `frontend-admin/.storybook/main.ts`
- Create: `frontend-admin/.storybook/preview.ts`
- Create: `frontend-admin/playwright.config.ts`
- Create: `frontend-admin/vitest.config.ts`

**Step 1: Inicializar Storybook**

```bash
cd frontend-admin && npx storybook@latest init --type react_vite --no-dev
```

**Step 2: Ajustar `frontend-admin/.storybook/main.ts`**

```typescript
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@chromatic-com/storybook',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
}

export default config
```

**Step 3: Ajustar `frontend-admin/.storybook/preview.ts`**

```typescript
import type { Preview } from '@storybook/react'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /date/i } },
  },
}

export default preview
```

**Step 4: Criar `frontend-admin/playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
  },
})
```

**Step 5: Criar `frontend-admin/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@aumaf/shared': path.resolve(__dirname, '../packages/shared/src/index.ts'),
    },
  },
})
```

**Step 6: Criar `frontend-admin/src/test/setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

**Step 7: Criar pasta e2e com teste smoke**

`frontend-admin/e2e/smoke.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

test('app loads without crash', async ({ page }) => {
  await page.goto('/')
  await expect(page).not.toHaveTitle('Error')
})
```

**Step 8: Verificar Storybook**

```bash
cd frontend-admin && npm run storybook -- --ci
```
Expected: Storybook sobe sem erros.

**Step 9: Commit**

```bash
git add frontend-admin/.storybook/ frontend-admin/playwright.config.ts frontend-admin/vitest.config.ts frontend-admin/src/test/ frontend-admin/e2e/
git commit -m "test: setup Storybook, Playwright E2E and Vitest for frontend-admin"
```

---

## Task 7: frontend-public — Astro

**Files:**
- Create: `frontend-public/` (via Astro CLI)
- Modify: `frontend-public/package.json`
- Create: `frontend-public/astro.config.ts`
- Create: `frontend-public/tailwind.config.ts`
- Create: `frontend-public/src/layouts/Base.astro`
- Create: `frontend-public/src/pages/index.astro`

**Step 1: Criar projeto Astro**

```bash
cd /Users/kayoridolfi/Documents/vibecoding/aumaf-3d-site
npm create astro@latest frontend-public -- --template minimal --typescript strict --no-install --no-git
```

**Step 2: Atualizar `frontend-public/package.json`**

```json
{
  "name": "@aumaf/frontend-public",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev --port 4321",
    "build": "astro build",
    "preview": "astro preview",
    "typecheck": "astro check",
    "lint": "eslint src --ext ts,astro --max-warnings 0"
  },
  "dependencies": {
    "@aumaf/shared": "*",
    "@astrojs/react": "^3.0.0",
    "@astrojs/sitemap": "^3.0.0",
    "@astrojs/tailwind": "^5.0.0",
    "astro": "^4.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.2"
  }
}
```

**Step 3: Criar `frontend-public/astro.config.ts`**

```typescript
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://aumaf3d.com.br',
  output: 'static',
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
  vite: {
    resolve: {
      alias: {
        '@aumaf/shared': '../packages/shared/src/index.ts',
      },
    },
  },
})
```

**Step 4: Criar `frontend-public/tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
          900: '#14532d',
        },
      },
    },
  },
  plugins: [],
}

export default config
```

**Step 5: Criar `frontend-public/src/styles/global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 6: Criar `frontend-public/src/layouts/Base.astro`**

```astro
---
export interface Props {
  title: string
  description?: string
  ogImage?: string
}
const { title, description = 'Impressão 3D profissional — AUMAF 3D', ogImage } = Astro.props
const canonicalURL = new URL(Astro.url.pathname, Astro.site)
---
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="canonical" href={canonicalURL} />
    <title>{title} | AUMAF 3D</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonicalURL} />
    {ogImage && <meta property="og:image" content={ogImage} />}
    <meta name="robots" content="index, follow" />
  </head>
  <body class="bg-white text-gray-900 antialiased">
    <slot />
  </body>
</html>
```

**Step 7: Criar `frontend-public/src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro'
---
<Base title="Impressão 3D Profissional">
  <main class="min-h-screen flex items-center justify-center">
    <h1 class="text-4xl font-bold text-brand-700">AUMAF 3D</h1>
  </main>
</Base>
```

**Step 8: Instalar dependências e verificar build**

```bash
cd frontend-public && npm install && npm run build
```
Expected: pasta `dist/` gerada com `index.html` sem erros.

**Step 9: Commit**

```bash
git add frontend-public/
git commit -m "feat: setup frontend-public with Astro, Tailwind and base layout"
```

---

## Task 8: Root install e verificação final

**Step 1: Instalar todas as dependências do monorepo**

```bash
cd /Users/kayoridolfi/Documents/vibecoding/aumaf-3d-site && npm install
```

**Step 2: Build de todos os workspaces**

```bash
npm run build
```
Expected: todos os workspaces buildam sem erros de TypeScript.

**Step 3: Subir infraestrutura e testar backend**

```bash
docker compose up -d
cd backend && cp .env.example .env
npm run prisma:migrate
npm run prisma:seed
npm run dev &
curl http://localhost:3000/api/health
```
Expected: `{"status":"ok","timestamp":"..."}` 

**Step 4: Verificar Astro em dev**

```bash
cd frontend-public && npm run dev
```
Expected: `http://localhost:4321` abre com "AUMAF 3D" na tela.

**Step 5: Verificar Admin em dev**

```bash
cd frontend-admin && npm run dev
```
Expected: `http://localhost:5174` abre sem erros.

**Step 6: Rodar todos os testes**

```bash
cd /Users/kayoridolfi/Documents/vibecoding/aumaf-3d-site && npm test
```
Expected: backend health test PASS, frontend-admin unit tests PASS.

**Step 7: Commit final**

```bash
git add .
git commit -m "chore: monorepo fully configured and passing all checks"
```

**Step 8: Push para o repositório remoto**

```bash
git push -u origin master
```

---

## Checklist de conclusão

- [ ] `docker compose up -d` — PostgreSQL, Redis e MinIO rodando
- [ ] `GET /api/health` retorna 200
- [ ] `prisma migrate dev` aplicado sem erros
- [ ] Seed criou usuário admin e settings
- [ ] `frontend-public` builda e serve em `:4321`
- [ ] `frontend-admin` builda e serve em `:5174`
- [ ] `npm test` passa em todos os workspaces
- [ ] Storybook sobe sem erros (`:6006`)
- [ ] Código commitado e pushed para `github.com/kayorid/aumaf-3d-site`
