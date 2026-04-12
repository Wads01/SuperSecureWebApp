import { json } from '@sveltejs/kit';
import { UserRole } from '../../../../../generated/prisma/enums';
import type { RequestHandler } from './$types';
import { assertRole } from '$lib/server/authorization/policy';
import { updateOwnOrder } from '$lib/server/orders/service';
import { updateOwnOrderSchema } from '$lib/server/validation/order';
import { logValidationFailure, writeSecurityLog } from '$lib/server/logging/security-log';

export const PATCH: RequestHandler = async ({ locals, params, request, getClientAddress, url }) => {
	assertRole(locals.user, [UserRole.USER]);

	const payload = await request.json().catch(() => null);
	const parsed = updateOwnOrderSchema.safeParse(payload);

	if (!parsed.success) {
		await logValidationFailure({
			actorUserId: locals.user.id,
			route: url.pathname,
			ip: getClientAddress(),
			userAgent: request.headers.get('user-agent'),
			reason: 'invalid_order_patch_payload',
			fields: parsed.error.issues.map((issue) => issue.path.join('.'))
		});

		return json({ error: 'Invalid order update payload.' }, { status: 400 });
	}

	const result = await updateOwnOrder({
		user: locals.user,
		orderId: params.orderId,
		payload: parsed.data
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
		resourceId: result.order?.id
	});

	return json({
		order: result.order
			? {
				...result.order,
				totalPesos:
					'totalPesos' in result.order && result.order.totalPesos
						? Number(result.order.totalPesos)
						: undefined
			}
			: null
	});
};
