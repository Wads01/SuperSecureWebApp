import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { MenuCategory, UserRole, UserStatus } from '../generated/prisma/enums';
import { hashPassword } from '../src/lib/server/auth/password';

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error('DIRECT_URL or DATABASE_URL must be configured to run seed.');
}

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString })
});

const menuItems = [
	{ name: 'Espresso', category: MenuCategory.COFFEE, pricePesos: '120.00', sortOrder: 1 },
	{ name: 'Americano', category: MenuCategory.COFFEE, pricePesos: '140.00', sortOrder: 2 },
	{ name: 'Cappuccino', category: MenuCategory.COFFEE, pricePesos: '170.00', sortOrder: 3 },
	{ name: 'Latte', category: MenuCategory.COFFEE, pricePesos: '185.00', sortOrder: 4 },
	{ name: 'Mocha', category: MenuCategory.COFFEE, pricePesos: '195.00', sortOrder: 5 },
	{ name: 'Cold Brew', category: MenuCategory.COFFEE, pricePesos: '165.00', sortOrder: 6 },
	{ name: 'Matcha Latte', category: MenuCategory.NON_COFFEE, pricePesos: '180.00', sortOrder: 7 },
	{ name: 'Croissant', category: MenuCategory.PASTRY, pricePesos: '95.00', sortOrder: 8 }
];

const demoAccounts = [
	{
		email: 'admin.demo@sswa.local',
		role: UserRole.ADMIN,
		password: 'Admin#Pass2026',
		resetQuestion: 'What is your first internship company code?',
		resetAnswer: 'AdminBlue42',
		scopeName: null
	},
	{
		email: 'manager1.demo@sswa.local',
		role: UserRole.MANAGER,
		password: 'Manager#1Pass2026',
		resetQuestion: 'What is your first internship company code?',
		resetAnswer: 'ManagerBlue42',
		scopeName: 'Main Branch'
	},
	{
		email: 'manager2.demo@sswa.local',
		role: UserRole.MANAGER,
		password: 'Manager#2Pass2026',
		resetQuestion: 'What is your first internship company code?',
		resetAnswer: 'ManagerGreen42',
		scopeName: 'Main Branch'
	},
	{
		email: 'manager3.demo@sswa.local',
		role: UserRole.MANAGER,
		password: 'Manager#3Pass2026',
		resetQuestion: 'What is your first internship company code?',
		resetAnswer: 'ManagerRed42',
		scopeName: 'Main Branch'
	}
] as const;

async function main() {
	for (const item of menuItems) {
		await prisma.menuItem.upsert({
			where: { name: item.name },
			update: {
				category: item.category,
				pricePesos: item.pricePesos,
				isAvailable: true,
				sortOrder: item.sortOrder
			},
			create: {
				name: item.name,
				category: item.category,
				pricePesos: item.pricePesos,
				isAvailable: true,
				sortOrder: item.sortOrder
			}
		});
	}

	const scopeCache = new Map<string, string>();

	for (const account of demoAccounts) {
		let scopeId: string | null = null;

		if (account.scopeName) {
			const cachedScopeId = scopeCache.get(account.scopeName);

			if (cachedScopeId) {
				scopeId = cachedScopeId;
			} else {
				const scope = await prisma.scope.upsert({
					where: { name: account.scopeName },
					update: {},
					create: { name: account.scopeName },
					select: { id: true }
				});

				scopeId = scope.id;
				scopeCache.set(account.scopeName, scope.id);
			}
		}

		const passwordHash = await hashPassword(account.password);
		const resetAnswerHash = await hashPassword(account.resetAnswer);

		const user = await prisma.user.upsert({
			where: { email: account.email },
			update: {
				role: account.role,
				status: UserStatus.ACTIVE,
				scopeId,
				passwordHash,
				resetQuestion: account.resetQuestion,
				resetAnswerHash,
				passwordChangedAt: new Date(),
				failedLoginCount: 0,
				lockoutUntil: null
			},
			create: {
				email: account.email,
				role: account.role,
				status: UserStatus.ACTIVE,
				scopeId,
				passwordHash,
				resetQuestion: account.resetQuestion,
				resetAnswerHash,
				passwordHistory: {
					create: {
						passwordHash
					}
				}
			},
			select: {
				id: true,
				email: true,
				role: true
			}
		});

		const passwordHistoryEntry = await prisma.passwordHistory.findFirst({
			where: {
				userId: user.id,
				passwordHash
			}
		});

		if (!passwordHistoryEntry) {
			await prisma.passwordHistory.create({
				data: {
					userId: user.id,
					passwordHash
				}
			});
		}
	}

	console.log('Seeded demo accounts:');
	console.log('- admin.demo@sswa.local (ADMIN)');
	console.log('- manager1.demo@sswa.local (MANAGER)');
	console.log('- manager2.demo@sswa.local (MANAGER)');
	console.log('- manager3.demo@sswa.local (MANAGER)');
	console.log('Default admin password: Admin#Pass2026');
	console.log('Default manager password: Manager#Pass2026');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (error) => {
		console.error(error);
		await prisma.$disconnect();
		process.exit(1);
	});
