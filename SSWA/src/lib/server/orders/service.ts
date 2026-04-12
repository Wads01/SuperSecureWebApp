import { OrderStatus, UserRole } from '../../../../generated/prisma/enums';
import { prisma } from '$lib/server/db';

type CurrentUser = NonNullable<App.Locals['user']>;

function decimalToNumber(value: unknown): number {
	if (typeof value === 'number') {
		return value;
	}

	if (typeof value === 'string') {
		return Number(value);
	}

	if (value && typeof value === 'object' && 'toString' in value) {
		return Number((value as { toString(): string }).toString());
	}

	return 0;
}

function pesos(value: number): string {
	return value.toFixed(2);
}

function isMutableByOwner(status: OrderStatus): boolean {
	return status === OrderStatus.PENDING;
}

function isManagerTransitionAllowed(current: OrderStatus, next: OrderStatus): boolean {
	if (current === OrderStatus.PENDING) {
		return next === OrderStatus.PREPARING || next === OrderStatus.CANCELLED;
	}

	if (current === OrderStatus.PREPARING) {
		return next === OrderStatus.COMPLETED || next === OrderStatus.CANCELLED;
	}

	return false;
}

export async function getMenuItems() {
	return prisma.menuItem.findMany({
		where: { isAvailable: true },
		orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
		select: {
			id: true,
			name: true,
			category: true,
			pricePesos: true,
			isAvailable: true
		}
	});
}

export async function createOrder(params: {
	user: CurrentUser;
	notes?: string;
	items: Array<{ menuItemId: string; quantity: number }>;
}) {
	const itemIds = [...new Set(params.items.map((item) => item.menuItemId))];
	const menuItems = await prisma.menuItem.findMany({
		where: {
			id: { in: itemIds },
			isAvailable: true
		},
		select: {
			id: true,
			pricePesos: true
		}
	});

	if (menuItems.length !== itemIds.length) {
		return { ok: false as const, status: 400, message: 'One or more selected items are unavailable.' };
	}

	const menuPriceMap = new Map(menuItems.map((item) => [item.id, decimalToNumber(item.pricePesos)]));

	let totalPesos = 0;
	const orderItemsPayload = params.items.map((item) => {
		const unitPrice = menuPriceMap.get(item.menuItemId) ?? 0;
		const lineTotal = unitPrice * item.quantity;
		totalPesos += lineTotal;

		return {
			menuItemId: item.menuItemId,
			quantity: item.quantity,
			unitPricePesos: pesos(unitPrice),
			lineTotalPesos: pesos(lineTotal)
		};
	});

	const order = await prisma.order.create({
		data: {
			userId: params.user.id,
			scopeId: params.user.scopeId,
			status: OrderStatus.PENDING,
			totalPesos: pesos(totalPesos),
			notes: params.notes,
			orderItems: {
				create: orderItemsPayload
			}
		},
		select: {
			id: true,
			status: true,
			totalPesos: true,
			notes: true,
			createdAt: true,
			orderItems: {
				select: {
					menuItemId: true,
					quantity: true,
					unitPricePesos: true,
					lineTotalPesos: true
				}
			}
		}
	});

	return { ok: true as const, order };
}

export async function getMyOrders(userId: string) {
	return prisma.order.findMany({
		where: { userId },
		orderBy: { createdAt: 'desc' },
		select: {
			id: true,
			status: true,
			totalPesos: true,
			notes: true,
			createdAt: true,
			updatedAt: true,
			orderItems: {
				select: {
					id: true,
					quantity: true,
					unitPricePesos: true,
					lineTotalPesos: true,
					menuItem: {
						select: {
							id: true,
							name: true,
							category: true
						}
					}
				}
			}
		}
	});
}

export async function updateOwnOrder(params: {
	user: CurrentUser;
	orderId: string;
	payload:
		| { action: 'cancel' }
		| { action: 'update_items'; notes?: string; items: Array<{ menuItemId: string; quantity: number }> };
}) {
	const order = await prisma.order.findUnique({
		where: { id: params.orderId },
		select: {
			id: true,
			userId: true,
			status: true
		}
	});

	if (!order || order.userId !== params.user.id) {
		return { ok: false as const, status: 404, message: 'Order not found.' };
	}

	if (!isMutableByOwner(order.status)) {
		return {
			ok: false as const,
			status: 403,
			message: 'Order can only be modified while it is pending.'
		};
	}

	if (params.payload.action === 'cancel') {
		const updated = await prisma.order.update({
			where: { id: order.id },
			data: { status: OrderStatus.CANCELLED },
			select: { id: true, status: true, updatedAt: true }
		});

		return { ok: true as const, order: updated };
	}

	const updateItemsPayload = params.payload;

	const itemIds = [...new Set(updateItemsPayload.items.map((item) => item.menuItemId))];
	const menuItems = await prisma.menuItem.findMany({
		where: { id: { in: itemIds }, isAvailable: true },
		select: { id: true, pricePesos: true }
	});

	if (menuItems.length !== itemIds.length) {
		return { ok: false as const, status: 400, message: 'One or more selected items are unavailable.' };
	}

	const menuPriceMap = new Map(menuItems.map((item) => [item.id, decimalToNumber(item.pricePesos)]));

	let totalPesos = 0;
	const orderItemsPayload = updateItemsPayload.items.map((item) => {
		const unitPrice = menuPriceMap.get(item.menuItemId) ?? 0;
		const lineTotal = unitPrice * item.quantity;
		totalPesos += lineTotal;

		return {
			menuItemId: item.menuItemId,
			quantity: item.quantity,
			unitPricePesos: pesos(unitPrice),
			lineTotalPesos: pesos(lineTotal)
		};
	});

	const updated = await prisma.$transaction(async (tx) => {
		await tx.orderItem.deleteMany({ where: { orderId: order.id } });

		await tx.order.update({
			where: { id: order.id },
			data: {
				notes: updateItemsPayload.notes,
				totalPesos: pesos(totalPesos)
			}
		});

		await tx.orderItem.createMany({
			data: orderItemsPayload.map((item) => ({
				orderId: order.id,
				...item
			}))
		});

		return tx.order.findUnique({
			where: { id: order.id },
			select: {
				id: true,
				status: true,
				totalPesos: true,
				notes: true,
				updatedAt: true
			}
		});
	});

	return { ok: true as const, order: updated };
}

export async function getManagerOrders(params: { user: CurrentUser; page: number; pageSize: number }) {
	const where = params.user.role === UserRole.ADMIN ? {} : { scopeId: params.user.scopeId };

	const [totalCount, orders] = await Promise.all([
		prisma.order.count({ where }),
		prisma.order.findMany({
			where,
			orderBy: { createdAt: 'desc' },
			skip: (params.page - 1) * params.pageSize,
			take: params.pageSize,
			select: {
				id: true,
				status: true,
				totalPesos: true,
				notes: true,
				scopeId: true,
				createdAt: true,
				user: {
					select: {
						id: true,
						email: true
					}
				}
			}
		})
	]);

	return {
		totalCount,
		page: params.page,
		pageSize: params.pageSize,
		orders
	};
}

export async function updateManagerOrderStatus(params: {
	user: CurrentUser;
	orderId: string;
	status: OrderStatus;
}) {
	const order = await prisma.order.findUnique({
		where: { id: params.orderId },
		select: {
			id: true,
			status: true,
			scopeId: true
		}
	});

	if (!order) {
		return { ok: false as const, status: 404, message: 'Order not found.' };
	}

	if (params.user.role === UserRole.MANAGER && params.user.scopeId !== order.scopeId) {
		return { ok: false as const, status: 403, message: 'Order is outside your assigned scope.' };
	}

	if (!isManagerTransitionAllowed(order.status, params.status)) {
		return {
			ok: false as const,
			status: 400,
			message: `Invalid order status transition from ${order.status} to ${params.status}.`
		};
	}

	const updated = await prisma.order.update({
		where: { id: order.id },
		data: { status: params.status },
		select: { id: true, status: true, updatedAt: true }
	});

	return { ok: true as const, order: updated };
}
