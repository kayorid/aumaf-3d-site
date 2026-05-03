import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

const CATEGORIES = [
  { name: 'Guia Técnico', slug: 'guia-tecnico' },
  { name: 'Materiais', slug: 'materiais' },
  { name: 'Case Study', slug: 'case-study' },
  { name: 'Engenharia', slug: 'engenharia' },
  { name: 'Parceria', slug: 'parceria' },
  { name: 'Inovação', slug: 'inovacao' },
  { name: 'Tutorial', slug: 'tutorial' },
]

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminName = process.env.ADMIN_NAME ?? 'Admin AUMAF'

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL e ADMIN_PASSWORD são obrigatórios no .env')
  }

  const hash = await bcrypt.hash(adminPassword, 12)
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })

  if (existing) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { password: hash, name: adminName, role: 'ADMIN', active: true },
    })
    console.log(`✅ Admin atualizado: ${adminEmail} (senha sincronizada do .env)`)
  } else {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hash,
        name: adminName,
        role: 'ADMIN',
        active: true,
      },
    })
    console.log(`✅ Admin criado: ${adminEmail}`)
  }

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: {},
    })
  }
  console.log(`✅ ${CATEGORIES.length} categorias seedadas`)

  await prisma.setting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'AUMAF 3D',
      siteDescription: 'Impressão 3D profissional — FDM, SLA, SLS, SLM e mais.',
    },
  })
}

main()
  .catch((err) => {
    console.error('❌ Seed falhou:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
