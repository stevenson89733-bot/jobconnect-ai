import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const company = await prisma.company.create({ data: { name: 'Acme', website: 'https://acme.example' } })

  await prisma.user.create({
    data: {
      firstName: 'Recruiter',
      lastName: 'Example',
      email: 'recruiter@acme.com',
      hashedPassword: bcrypt.hashSync('recruiterpwd', 10),
      role: 'RECRUITER'
    }
  })

  await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@email.com',
      hashedPassword: bcrypt.hashSync('candidatepwd', 10),
      role: 'CANDIDATE'
    }
  })

  await prisma.job.create({
    data: {
      title: 'Senior Frontend Engineer',
      description: 'Build beautiful UIs',
      location: 'Remote',
      companyId: company.id
    }
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
