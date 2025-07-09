import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prismaClients: Record<string, PrismaClient> | undefined
}

if (!globalForPrisma.prismaClients) {
  globalForPrisma.prismaClients = {}
}

export function getPrismaForTenant(tenant: string) {
  if (!globalForPrisma.prismaClients![tenant]) {
    globalForPrisma.prismaClients![tenant] = new PrismaClient({
      datasources: {
        db: {
          url: process.env[`DATABASE_URL_${tenant.toUpperCase()}`],
        },
      },
    })
  }
  return globalForPrisma.prismaClients![tenant]
}
