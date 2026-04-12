import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '$env/dynamic/private';
import { PrismaClient } from '../../../generated/prisma/client';

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
	const connectionString =
		env.DIRECT_URL ?? env.DATABASE_URL ?? process.env.DIRECT_URL ?? process.env.DATABASE_URL;

	if (!connectionString) {
		throw new Error(
			'DIRECT_URL or DATABASE_URL must be configured for Prisma. Add it to SSWA/.env and run `npm run dev` from the SSWA directory.'
		);
	}

	return new PrismaClient({
		adapter: new PrismaPg({ connectionString })
	});
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}
