import { env } from '../config/env'
import { logger } from '../config/logger'

export interface EmailMessage {
  to: string
  subject: string
  text: string
  html?: string
  replyTo?: string
}

export interface EmailTransport {
  readonly name: 'console' | 'smtp' | 'stub'
  send(msg: EmailMessage): Promise<void>
}

class ConsoleTransport implements EmailTransport {
  readonly name = 'console' as const
  async send(msg: EmailMessage): Promise<void> {
    const banner = '─'.repeat(60)
    /* eslint-disable no-console */
    console.log(`\n${banner}\n📧 EMAIL (console transport)\n${banner}`)
    console.log(`From:    ${env.EMAIL_FROM}`)
    console.log(`To:      ${msg.to}`)
    console.log(`Subject: ${msg.subject}`)
    if (msg.replyTo) console.log(`Reply-To: ${msg.replyTo}`)
    console.log(`${banner}`)
    console.log(msg.text)
    console.log(`${banner}\n`)
    /* eslint-enable no-console */
  }
}

class StubTransport implements EmailTransport {
  readonly name = 'stub' as const
  async send(msg: EmailMessage): Promise<void> {
    logger.warn(
      { to: msg.to, subject: msg.subject },
      'Email NOT sent — EMAIL_TRANSPORT=stub. Configure SMTP to enable real delivery.',
    )
  }
}

class SmtpTransport implements EmailTransport {
  readonly name = 'smtp' as const
  async send(msg: EmailMessage): Promise<void> {
    if (!env.EMAIL_SMTP_HOST) {
      throw new Error('EMAIL_SMTP_HOST not configured but EMAIL_TRANSPORT=smtp')
    }
    // Lazy-import nodemailer só quando realmente usado em prod (mantém devDeps menor).
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      host: env.EMAIL_SMTP_HOST,
      port: env.EMAIL_SMTP_PORT,
      secure: env.EMAIL_SMTP_SECURE,
      auth:
        env.EMAIL_SMTP_USER && env.EMAIL_SMTP_PASS
          ? { user: env.EMAIL_SMTP_USER, pass: env.EMAIL_SMTP_PASS }
          : undefined,
    })
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: msg.to,
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
      replyTo: msg.replyTo,
    })
    logger.info({ to: msg.to, subject: msg.subject }, 'Email sent via SMTP')
  }
}

let cachedTransport: EmailTransport | null = null

export function getEmailTransport(): EmailTransport {
  if (cachedTransport) return cachedTransport
  switch (env.EMAIL_TRANSPORT) {
    case 'console':
      cachedTransport = new ConsoleTransport()
      break
    case 'smtp':
      cachedTransport = new SmtpTransport()
      break
    case 'stub':
      cachedTransport = new StubTransport()
      break
  }
  logger.info({ transport: cachedTransport.name }, 'Email transport selected')
  return cachedTransport
}

export async function sendEmail(msg: EmailMessage): Promise<void> {
  const transport = getEmailTransport()
  await transport.send(msg)
}

export function resetEmailTransport(): void {
  cachedTransport = null
}
