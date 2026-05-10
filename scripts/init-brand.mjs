#!/usr/bin/env node
/**
 * init-brand.mjs — Bootstrap interativo de marca nova
 *
 * Lê dados de uma marca via prompts no terminal e:
 *  1. Reescreve packages/shared/src/template/config.ts
 *  2. Atualiza o @import do tema em global.css e index.css
 *  3. Imprime checklist de itens manuais (logos, OG, copy)
 *
 * Uso:
 *   npm run brand:init
 *   node scripts/init-brand.mjs
 *
 * Flags:
 *   --fresh-git    apaga histórico git e reinicializa o repo (opcional)
 *   --yes          aceita defaults para tudo (não-interativo)
 */

import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const FLAGS = new Set(process.argv.slice(2))
const NON_INTERACTIVE = FLAGS.has('--yes')
const FRESH_GIT = FLAGS.has('--fresh-git')

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
}

function banner() {
  console.log('')
  console.log(c.cyan + c.bold + '╔══════════════════════════════════════════════════════════╗' + c.reset)
  console.log(c.cyan + c.bold + '║       MULTI-BRAND SITE TEMPLATE — brand:init             ║' + c.reset)
  console.log(c.cyan + c.bold + '╚══════════════════════════════════════════════════════════╝' + c.reset)
  console.log('')
  console.log(c.dim + 'Vamos reconfigurar este template para a sua marca.' + c.reset)
  console.log(c.dim + 'Pressione ENTER para aceitar o valor padrão entre colchetes.' + c.reset)
  console.log('')
}

function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function ask(rl, label, defaultValue, validator) {
  while (true) {
    if (NON_INTERACTIVE) return defaultValue
    const hint = defaultValue !== undefined && defaultValue !== ''
      ? c.dim + ` [${defaultValue}]` + c.reset
      : ''
    const answer = (await rl.question(`${c.bold}${label}${c.reset}${hint}: `)).trim()
    const value = answer === '' ? (defaultValue ?? '') : answer
    if (!validator) return value
    const err = validator(value)
    if (!err) return value
    console.log(c.red + '  ✖ ' + err + c.reset)
  }
}

async function askYesNo(rl, label, defaultYes) {
  if (NON_INTERACTIVE) return defaultYes
  const hint = c.dim + ` [${defaultYes ? 'Y/n' : 'y/N'}]` + c.reset
  const answer = (await rl.question(`${c.bold}${label}${c.reset}${hint}: `)).trim().toLowerCase()
  if (answer === '') return defaultYes
  return answer === 'y' || answer === 'yes' || answer === 's' || answer === 'sim'
}

function listThemes() {
  const dir = join(ROOT, 'frontend-public/src/styles/themes')
  return readdirSync(dir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => f.replace(/\.css$/, ''))
}

function writeTemplateConfig(data) {
  const target = join(ROOT, 'packages/shared/src/template/config.ts')

  // Tokens vazios para socials sem URL informada
  const socialEntry = (key, val) => (val ? `    ${key}: '${val}',` : `    // ${key}: '',`)

  const body = `/**
 * ============================================================
 *  TEMPLATE CONFIG — Single Source of Truth da Marca
 * ============================================================
 *
 * Gerado por scripts/init-brand.mjs em ${new Date().toISOString()}.
 * Para reconfigurar, edite manualmente ou rode \`npm run brand:init\`.
 * ============================================================
 */

import type { TemplateConfig } from './types'

export const templateConfig: TemplateConfig = {
  name: '${data.name}',
  legalName: '${data.legalName}',
  slug: '${data.slug}',
  url: '${data.url}',
  logo: '/logo.png',
  founded: '${data.founded}',
  description: '${data.description.replace(/'/g, "\\'")}',
  shortPitch: '${data.shortPitch.replace(/'/g, "\\'")}',

  industries: [${data.industries.map((i) => `'${i}'`).join(', ')}],
  serviceAreaCountry: '${data.country}',

  address: {
    streetAddress: '${data.street}',
    addressLocality: '${data.city}',
    addressRegion: '${data.region}',
    postalCode: '${data.postalCode}',
    addressCountry: '${data.country}',
  },
  contact: {
    phone: '${data.phone}',
    phoneDisplay: '${data.phoneDisplay}',
    whatsapp: '${data.whatsapp}',
    email: '${data.email}',
  },
  hours: {
    open: '${data.openHour}',
    close: '${data.closeHour}',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    displayPt: '${data.hoursDisplay.replace(/'/g, "\\'")}',
  },
  socials: {
${socialEntry('instagram', data.instagram)}
${socialEntry('linkedin', data.linkedin)}
${socialEntry('facebook', data.facebook)}
  },

  navigation: {
    primary: [
      { label: 'Início', href: '/' },
      { label: 'Serviços', href: '/servicos' },
      { label: 'Portfolio', href: '/portfolio' },
      { label: 'Sobre', href: '/sobre' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contato', href: '/contato' },
    ],
    footer: [
      {
        heading: 'Soluções',
        items: [
          { label: 'Serviços', href: '/servicos' },
          { label: 'Portfolio', href: '/portfolio' },
        ],
      },
      {
        heading: 'Empresa',
        items: [
          { label: 'Sobre', href: '/sobre' },
          { label: 'FAQ', href: '/faq' },
          { label: 'Blog', href: '/blog' },
        ],
      },
      {
        heading: 'Contato',
        items: [{ label: 'Fale conosco', href: '/contato' }],
      },
    ],
  },

  home: {
    hero: {
      eyebrow: '${data.shortPitch.replace(/'/g, "\\'")}',
      title: '${data.name}',
      subtitle: '${data.description.replace(/'/g, "\\'")}',
      primaryCta: { label: 'Fale conosco', href: '/contato', variant: 'primary' },
      secondaryCta: { label: 'Ver portfolio', href: '/portfolio', variant: 'secondary' },
    },
    valueProps: [
      { title: 'Edite valueProps em', description: 'packages/shared/src/template/config.ts' },
    ],
  },

  seo: {
    defaultTitle: '${data.name} — ${data.shortPitch.replace(/'/g, "\\'")}',
    titleTemplate: '%s | ${data.name}',
    defaultDescription: '${data.description.replace(/'/g, "\\'")}',
    defaultOgImage: '/og/og-default.png',
    locale: 'pt-BR',
  },

  theme: {
    themeName: '${data.theme}',
    fontFamily: {
      sans: '"Space Grotesk", sans-serif',
      display: '"Space Grotesk", sans-serif',
    },
  },

  features: {
    blog: true,
    portfolio: true,
    reviews: true,
    contactForm: true,
    aiBlogGenerator: true,
    botyo: true,
  },
}

export default templateConfig
`
  writeFileSync(target, body, 'utf8')
  return target
}

function patchThemeImport(filePath, themeName, importPathBase) {
  if (!existsSync(filePath)) {
    console.log(c.yellow + `  ⚠ ${filePath} não encontrado — pulando` + c.reset)
    return
  }
  const content = readFileSync(filePath, 'utf8')
  // Substitui o primeiro @import de tema (qualquer .css em themes/)
  const newImport = `@import '${importPathBase}/${themeName}.css';`
  const re = /@import\s+['"]([^'"]*themes\/[^'"]+\.css)['"];?/
  if (!re.test(content)) {
    console.log(c.yellow + `  ⚠ Nenhum @import de tema encontrado em ${filePath}` + c.reset)
    return
  }
  const replaced = content.replace(re, newImport)
  writeFileSync(filePath, replaced, 'utf8')
  console.log(c.green + `  ✓ ${filePath}` + c.reset)
}

function resetGit() {
  console.log('')
  console.log(c.yellow + 'Resetando histórico git…' + c.reset)
  try {
    execSync('rm -rf .git', { cwd: ROOT, stdio: 'inherit' })
    execSync('git init', { cwd: ROOT, stdio: 'inherit' })
    execSync('git add -A', { cwd: ROOT, stdio: 'inherit' })
    execSync('git commit -m "chore: initial commit (brand:init)"', { cwd: ROOT, stdio: 'inherit' })
    console.log(c.green + '✓ Repo git reinicializado' + c.reset)
  } catch (err) {
    console.log(c.red + `✖ Falha ao resetar git: ${err.message}` + c.reset)
  }
}

function printChecklist(data) {
  console.log('')
  console.log(c.cyan + c.bold + '╔══════════════════════════════════════════════════════════╗' + c.reset)
  console.log(c.cyan + c.bold + '║                 CHECKLIST PÓS-INIT                       ║' + c.reset)
  console.log(c.cyan + c.bold + '╚══════════════════════════════════════════════════════════╝' + c.reset)
  console.log('')
  const items = [
    ['Substituir assets:', 'frontend-public/public/{logo.png, favicon.ico, icon-192.png, icon-512.png, apple-touch-icon.png}'],
    ['Substituir OG image:', 'frontend-public/public/og/og-default.png (1200×630)'],
    ['Editar copy do hero:', 'packages/shared/src/template/config.ts → home.valueProps'],
    ['Editar páginas vitrine:', '/servicos, /materiais, /portfolio, /sobre, /faq, /avaliacoes'],
    ['(Opcional) trocar fonte Pirulen:', 'frontend-public/src/styles/global.css e frontend-admin/src/index.css'],
    ['Configurar .env do backend:', 'cp backend/.env.example backend/.env'],
    ['Rodar migrations + seed:', 'cd backend && npx prisma migrate dev && npx prisma db seed'],
  ]
  items.forEach(([title, body]) => {
    console.log('  ' + c.green + '☐' + c.reset + ' ' + c.bold + title + c.reset)
    console.log('    ' + c.dim + body + c.reset)
  })
  console.log('')
  console.log(c.cyan + 'Próximos comandos sugeridos:' + c.reset)
  console.log('  ' + c.bold + 'npm run dev' + c.reset + c.dim + '   # sobe tudo' + c.reset)
  console.log('  ' + c.bold + 'cat docs/template/REBRAND.md' + c.reset)
  console.log('')
  console.log(c.green + c.bold + `✓ Marca "${data.name}" configurada!` + c.reset)
  console.log('')
}

async function main() {
  banner()

  const themes = listThemes()
  const rl = createInterface({ input, output })

  try {
    const name = await ask(rl, 'Nome da marca', 'Acme Corp', (v) =>
      v.length >= 2 ? null : 'Nome deve ter ≥ 2 caracteres'
    )
    const slug = await ask(rl, 'Slug', slugify(name), (v) =>
      /^[a-z0-9-]+$/.test(v) ? null : 'Use apenas a-z, 0-9 e hífen'
    )
    const legalName = await ask(rl, 'Razão social', name)
    const url = await ask(rl, 'URL canônica (https://...)', `https://${slug}.com.br`, (v) =>
      v.startsWith('http') ? null : 'Inclua o protocolo (http/https)'
    )
    const founded = await ask(rl, 'Ano de fundação', String(new Date().getFullYear()))
    const shortPitch = await ask(rl, 'Pitch curto (≤ 90 chars)', `${name} — uma frase de pitch.`, (v) =>
      v.length <= 90 ? null : 'Máximo 90 caracteres'
    )
    const description = await ask(rl, 'Descrição longa (SEO, 140–200 chars)',
      `${name}. Substitua esta descrição em packages/shared/src/template/config.ts.`)
    const industries = await ask(rl, 'Indústrias atendidas (vírgula)', 'Industrial, Comercial')

    console.log('')
    console.log(c.cyan + '--- Endereço ---' + c.reset)
    const street = await ask(rl, 'Rua/Avenida', 'Rua Exemplo, 123')
    const city = await ask(rl, 'Cidade', 'São Paulo')
    const region = await ask(rl, 'UF', 'SP')
    const postalCode = await ask(rl, 'CEP', '00000-000')
    const country = await ask(rl, 'País (ISO-2)', 'BR')

    console.log('')
    console.log(c.cyan + '--- Contato ---' + c.reset)
    const phone = await ask(rl, 'Telefone E.164 (ex: +5511999998888)', '+5511999998888')
    const phoneDisplay = await ask(rl, 'Telefone display', '(11) 99999-8888')
    const wppNumber = phone.replace(/\D/g, '')
    const whatsapp = await ask(rl, 'URL do WhatsApp', `https://wa.me/${wppNumber}`)
    const email = await ask(rl, 'E-mail', `contato@${slug.replace(/-/g, '')}.com.br`)
    const openHour = await ask(rl, 'Horário de abertura', '09:00')
    const closeHour = await ask(rl, 'Horário de fechamento', '18:00')
    const hoursDisplay = await ask(rl, 'Horário (display)', 'Segunda – Sexta, 09h–18h')

    console.log('')
    console.log(c.cyan + '--- Redes sociais (deixe vazio para pular) ---' + c.reset)
    const instagram = await ask(rl, 'Instagram URL', '')
    const linkedin = await ask(rl, 'LinkedIn URL', '')
    const facebook = await ask(rl, 'Facebook URL', '')

    console.log('')
    console.log(c.cyan + '--- Tema visual ---' + c.reset)
    console.log(c.dim + 'Temas disponíveis: ' + themes.join(', ') + c.reset)
    const theme = await ask(rl, 'Tema', themes[0], (v) =>
      themes.includes(v) ? null : `Escolha um de: ${themes.join(', ')}`
    )

    console.log('')
    const confirm = await askYesNo(rl, 'Confirmar e gravar tudo?', true)
    if (!confirm) {
      console.log(c.yellow + 'Abortado pelo usuário.' + c.reset)
      rl.close()
      return
    }

    const data = {
      name, legalName, slug, url, founded, shortPitch, description,
      industries: industries.split(',').map((s) => s.trim()).filter(Boolean),
      street, city, region, postalCode, country,
      phone, phoneDisplay, whatsapp, email,
      openHour, closeHour, hoursDisplay,
      instagram, linkedin, facebook,
      theme,
    }

    console.log('')
    console.log(c.cyan + 'Escrevendo arquivos…' + c.reset)

    const cfgPath = writeTemplateConfig(data)
    console.log(c.green + `  ✓ ${cfgPath}` + c.reset)

    patchThemeImport(
      join(ROOT, 'frontend-public/src/styles/global.css'),
      theme,
      './themes'
    )
    patchThemeImport(
      join(ROOT, 'frontend-admin/src/index.css'),
      theme,
      '../../frontend-public/src/styles/themes'
    )

    if (FRESH_GIT) {
      resetGit()
    }

    printChecklist(data)
  } finally {
    rl.close()
  }
}

main().catch((err) => {
  console.error(c.red + 'Erro fatal: ' + err.message + c.reset)
  console.error(err.stack)
  process.exit(1)
})
