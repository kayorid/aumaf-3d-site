import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  // Core
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Auth
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  ADMIN_NAME: z.string().default('Admin AUMAF'),

  // CORS
  FRONTEND_ADMIN_URL: z.string().url(),
  FRONTEND_PUBLIC_URL: z.string().url(),
  BACKEND_URL: z.string().url().default('http://localhost:3000'),

  // Storage (MinIO/S3)
  STORAGE_DRIVER: z.enum(['fs', 's3']).default('s3'),
  S3_ENDPOINT: z.string().url(),
  S3_PUBLIC_URL: z.string().url(),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_BUCKET: z.string().default('aumaf-blog-images'),

  // Redis (não usado em Phase 1; vars mantidas para Phase 2)
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Observability
  SENTRY_DSN: z.string().optional(),
  LOG_FORMAT: z.enum(['text', 'json']).default('text'),

  // IA — multi-provedor
  AI_PROVIDER: z.enum(['anthropic', 'openai', 'gemini']).default('anthropic'),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default('claude-sonnet-4-6'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.0-flash-exp'),

  // Botyio — WhatsApp lead integration
  BOTYIO_BASE_URL: z.string().url().default('https://api.botyio.com'),
  BOTYIO_API_KEY: z.string().optional(),
  BOTYIO_WEBHOOK_SECRET: z.string().optional(),
  BOTYIO_ENABLED: z.enum(['true', 'false']).default('false'),

  // Email (notificação de leads ao admin)
  ADMIN_NOTIFICATION_EMAIL: z.string().email().optional(),
  EMAIL_FROM: z.string().default('AUMAF 3D <noreply@aumaf-3d.com.br>'),
  EMAIL_TRANSPORT: z.enum(['console', 'smtp', 'stub']).default('console'),
  EMAIL_SMTP_HOST: z.string().optional(),
  EMAIL_SMTP_PORT: z.coerce.number().default(587),
  EMAIL_SMTP_USER: z.string().optional(),
  EMAIL_SMTP_PASS: z.string().optional(),
  EMAIL_SMTP_SECURE: z.coerce.boolean().default(false),

  // Cache warm-up
  PUBLIC_BLOG_BASE_URL: z.string().url().optional(),

  // Integration secrets — encryption at rest
  MASTER_KEY_PATH: z.string().default('/etc/aumaf/master.key'),
  MASTER_ENCRYPTION_KEY: z.string().optional(), // base64 32 bytes — apenas dev/test
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export type Env = typeof env
