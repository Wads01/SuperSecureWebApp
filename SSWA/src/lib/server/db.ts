import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '$env/dynamic/private';

function createPrismaClient() {
  const raw = env.DIRECT_URL ?? env.DATABASE_URL;
  if (!raw) throw new Error('DATABASE_URL is not set in .env');
  // Strip pgbouncer param — pg driver doesn't understand it
  const connectionString = raw.replace(/[?&]pgbouncer=true/i, '').replace(/\?$/, '');
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
