import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { templateConfig } from '@template/shared'

dotenv.config()

const prisma = new PrismaClient()

// Categorias padrão neutras — adapte ao domínio da sua marca.
const CATEGORIES = [
  { name: 'Geral', slug: 'geral' },
  { name: 'Tutoriais', slug: 'tutoriais' },
  { name: 'Cases', slug: 'cases' },
  { name: 'Novidades', slug: 'novidades' },
]

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminName = process.env.ADMIN_NAME ?? `Admin ${templateConfig.name}`

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
      siteName: templateConfig.name,
      siteDescription: templateConfig.shortPitch,
    },
  })
}

main()
  .catch((err) => {
    console.error('❌ Seed falhou:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
