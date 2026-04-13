import { z } from 'zod';
import { OrderStatus, UserRole } from '../../../../generated/prisma/enums';

export const paginationQuerySchema = z.object({
	page: z.coerce.number().int().min(1).max(10000).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export const createOrderSchema = z.object({
	notes: z.string().trim().max(300).optional(),
	items: z
		.array(
			z.object({
				menuItemId: z.string().uuid(),
				quantity: z.number().int().min(1).max(20)
			})
		)
		.min(1)
		.max(20)
});

export const updateOwnOrderSchema = z.discriminatedUnion('action', [
	z.object({
		action: z.literal('cancel')
	}),
	z.object({
		action: z.literal('update_items'),
		notes: z.string().trim().max(300).optional(),
		items: z
			.array(
				z.object({
					menuItemId: z.string().uuid(),
					quantity: z.number().int().min(1).max(20)
				})
			)
			.min(1)
			.max(20)
	})
]);

export const managerUpdateOrderStatusSchema = z.object({
	status: z.nativeEnum(OrderStatus)
});

export const adminAssignRoleSchema = z.object({
	role: z.enum([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER])
});

export const adminUpdateMenuPriceSchema = z.object({
	pricePesos: z
		.coerce
		.number()
		.min(1.0)
		.max(500.0)
		.refine((value) => Number(value.toFixed(2)) === value, {
			message: 'pricePesos must have at most 2 decimal places.'
		})
});
