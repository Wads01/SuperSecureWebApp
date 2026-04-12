import { json } from '@sveltejs/kit';
import { UserRole } from '../../../../generated/prisma/enums';
import type { RequestHandler } from './$types';
import { assertRole } from '$lib/server/authorization/policy';
import { createOrder } from '$lib/server/orders/service';
import { createOrderSchema } from '$lib/server/validation/order';
import { logValidationFailure, writeSecurityLog } from '$lib/server/logging/security-log';

export const POST: RequestHandler = async ({ request, locals, getClientAddress, url }) => {
	assertRole(locals.user, [UserRole.USER]);

	const payload = await request.json().catch(() => null);
	const parsed = createOrderSchema.safeParse(payload);

	if (!parsed.success) {
		await logValidationFailure({
			actorUserId: locals.user.id,
			route: url.pathname,
			ip: getClientAddress(),
			userAgent: request.headers.get('user-agent'),
			reason: 'invalid_order_create_payload',
			fields: parsed.error.issues.map((issue) => issue.path.join('.'))
		});

		return json({ error: 'Invalid order payload.' }, { status: 400 });
	}

	const result = await createOrder({
		user: locals.user,
		notes: parsed.data.notes,
		items: parsed.data.items
	});

	if (!result.ok) {
		await writeSecurityLog({
			actorUserId: locals.user.id,
			eventType: 'TASK_CRUD',
			outcome: 'FAILURE',
			route: url.pathname,
			ip: getClientAddress(),
			userAgent: request.headers.get('user-agent'),
			resourceType: 'order',
			metadataJson: { reason: result.message }
		});

		return json({ error: result.message }, { status: result.status });
	}

	await writeSecurityLog({
		actorUserId: locals.user.id,
		eventType: 'TASK_CRUD',
		outcome: 'SUCCESS',
		route: url.pathname,
		ip: getClientAddress(),
		userAgent: request.headers.get('user-agent'),
		resourceType: 'order',
		resourceId: result.order.id
	});

	return json({
		order: {
			...result.order,
			totalPesos: Number(result.order.totalPesos),
			orderItems: result.order.orderItems.map((item) => ({
				...item,
				unitPricePesos: Number(item.unitPricePesos),
				lineTotalPesos: Number(item.lineTotalPesos)
			}))
		}
	});
};
