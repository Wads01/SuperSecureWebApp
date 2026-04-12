import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { assertManagerOrAdmin } from '$lib/server/authorization/policy';
import { updateManagerOrderStatus } from '$lib/server/orders/service';
import { managerUpdateOrderStatusSchema } from '$lib/server/validation/order';
import { logValidationFailure, writeSecurityLog } from '$lib/server/logging/security-log';

export const PATCH: RequestHandler = async ({ locals, params, request, url, getClientAddress }) => {
	assertManagerOrAdmin(locals.user);

	const payload = await request.json().catch(() => null);
	const parsed = managerUpdateOrderStatusSchema.safeParse(payload);

	if (!parsed.success) {
		await logValidationFailure({
			actorUserId: locals.user.id,
			route: url.pathname,
			ip: getClientAddress(),
			userAgent: request.headers.get('user-agent'),
			reason: 'invalid_manager_status_update_payload',
			fields: parsed.error.issues.map((issue) => issue.path.join('.'))
		});

		return json({ error: 'Invalid status update payload.' }, { status: 400 });
	}

	const result = await updateManagerOrderStatus({
		user: locals.user,
		orderId: params.orderId,
		status: parsed.data.status
	});

	if (!result.ok) {
		const denied = result.status === 403 || result.status === 404;

		await writeSecurityLog({
			actorUserId: locals.user.id,
			eventType: denied ? 'AUTHZ_ACCESS' : 'TASK_CRUD',
			outcome: denied ? 'DENIED' : 'FAILURE',
			route: url.pathname,
			ip: getClientAddress(),
			userAgent: request.headers.get('user-agent'),
			resourceType: 'order',
			resourceId: params.orderId,
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
		resourceId: result.order.id,
		metadataJson: { nextStatus: result.order.status }
	});

	return json({ order: result.order });
};
