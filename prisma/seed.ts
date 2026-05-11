import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const roles = [
    { role: 'CLIENT', description: 'Utilizador cliente da plataforma' },
    { role: 'OWNER', description: 'Proprietário de imóveis' },
    { role: 'ADMIN', description: 'Administrador do sistema' },
  ]

  for (const r of roles) {
    await prisma.roles.upsert({
      where: { role: r.role as any },
      update: {},
      create: r as any,
    })
  }

  console.log('✅ Roles inseridas com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

