import { PrismaClient } from '../generated/prisma/client';
import { MenuCategory } from '../generated/prisma/enums';

const prisma = new PrismaClient();

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
