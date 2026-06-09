import { PrismaClient } from '@prisma/client'

// Bulletproof DB connection: resolve the PostgreSQL URL from any available env var
// Vercel Postgres may set DATABASE_URL, POSTGRES_URL, or POSTGRES_PRISMA_URL
function resolveDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    ''

  if (!url) {
    console.error(
      '[DB] No database URL found! Set DATABASE_URL or POSTGRES_URL in your environment.'
    )
  }

  // Ensure Prisma can always find DATABASE_URL (the var referenced in schema.prisma)
  if (url && !process.env.DATABASE_URL) {
    process.env.DATABASE_URL = url
  }

  return url
}

// Resolve URL at import time so Prisma Client can use it
resolveDatabaseUrl()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export default db
