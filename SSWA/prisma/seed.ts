/**
 * Seed script — creates default admin and manager accounts.
 * Run from inside SSWA/:  npm run seed
 *
 * Credentials (change after first run):
 *   admin@sswa.dev     /  Admin@sswa2024!
 *   manager@sswa.dev   /  Manager@sswa2024!
 */
import 'dotenv/config';
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { randomUUID } from 'crypto';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const scrypt = promisify(scryptCb);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt.toString('hex')}:${derived.toString('hex')}`;
}

const raw = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '';
if (!raw) {
  console.error('ERROR: DATABASE_URL or DIRECT_URL must be set in .env');
  process.exit(1);
}
const connectionString = raw.replace(/[?&]pgbouncer=true/gi, '').replace(/\?$/, '');
const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter } as never);

const SEED_ACCOUNTS = [
  { email: 'admin@sswa.dev',   password: 'Admin@sswa2024!',   role: 'ADMIN'   },
  { email: 'manager@sswa.dev', password: 'Manager@sswa2024!', role: 'MANAGER' },
] as const;

async function main() {
  console.log('Seeding default accounts…\n');

  for (const account of SEED_ACCOUNTS) {
    const existing = await db.user.findUnique({ where: { email: account.email } });
    if (existing) {
      console.log(`  ⚡ ${account.email} already exists — skipping`);
      continue;
    }

    const passwordHash = await hashPassword(account.password);
    const now = new Date();
    await db.user.create({
      data: {
        id: randomUUID(),
        email: account.email,
        role: account.role,
        passwordHash,
        failedLoginCount: 0,
        passwordChangedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    });

    console.log(`  ✓ Created ${account.role.toLowerCase()} — ${account.email}`);
  }

  console.log('\nDone. Remember to change these passwords after your first login.');
  await db.$disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
