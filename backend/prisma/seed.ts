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
