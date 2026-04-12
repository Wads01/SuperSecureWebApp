import { json } from '@sveltejs/kit';
import { UserRole } from '../../../../../generated/prisma/enums';
import type { RequestHandler } from './$types';
import { assertRole } from '$lib/server/authorization/policy';
import { getMyOrders } from '$lib/server/orders/service';

export const GET: RequestHandler = async ({ locals }) => {
	assertRole(locals.user, [UserRole.USER]);

	const orders = await getMyOrders(locals.user.id);

	return json({
		orders: orders.map((order) => ({
			...order,
			totalPesos: Number(order.totalPesos),
			orderItems: order.orderItems.map((item) => ({
				...item,
				unitPricePesos: Number(item.unitPricePesos),
				lineTotalPesos: Number(item.lineTotalPesos)
			}))
		}))
	});
};
