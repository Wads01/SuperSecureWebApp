import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { assertManagerOrAdmin } from '$lib/server/authorization/policy';
import { getManagerOrders } from '$lib/server/orders/service';
import { paginationQuerySchema } from '$lib/server/validation/order';
import { logValidationFailure } from '$lib/server/logging/security-log';

export const GET: RequestHandler = async ({ locals, url, getClientAddress, request }) => {
	assertManagerOrAdmin(locals.user);

	const parsed = paginationQuerySchema.safeParse({
		page: url.searchParams.get('page') ?? '1',
		pageSize: url.searchParams.get('pageSize') ?? '20'
	});

	if (!parsed.success) {
		await logValidationFailure({
			actorUserId: locals.user.id,
			route: url.pathname,
			ip: getClientAddress(),
			userAgent: request.headers.get('user-agent'),
			reason: 'invalid_pagination_query',
			fields: parsed.error.issues.map((issue) => issue.path.join('.'))
		});

		return json({ error: 'Invalid pagination query.' }, { status: 400 });
	}

	const result = await getManagerOrders({
		user: locals.user,
		page: parsed.data.page,
		pageSize: parsed.data.pageSize
	});

	return json({
		...result,
		orders: result.orders.map((order) => ({
			...order,
			totalPesos: Number(order.totalPesos)
		}))
	});
};
