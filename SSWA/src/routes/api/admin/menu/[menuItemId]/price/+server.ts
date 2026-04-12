import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';
import { assertAdmin } from '$lib/server/authorization/policy';
import { adminUpdateMenuPriceSchema } from '$lib/server/validation/order';
import { logValidationFailure, writeSecurityLog } from '$lib/server/logging/security-log';

export const PATCH: RequestHandler = async ({ locals, params, request, getClientAddress, url }) => {
	assertAdmin(locals.user);

	const payload = await request.json().catch(() => null);
	const parsed = adminUpdateMenuPriceSchema.safeParse(payload);

	if (!parsed.success) {
		await logValidationFailure({
			actorUserId: locals.user.id,
			route: url.pathname,
			ip: getClientAddress(),
			userAgent: request.headers.get('user-agent'),
			reason: 'invalid_menu_price_payload',
			fields: parsed.error.issues.map((issue) => issue.path.join('.'))
		});

		return json({ error: 'Invalid menu price payload.' }, { status: 400 });
	}

	const existing = await prisma.menuItem.findUnique({
		where: { id: params.menuItemId },
		select: { id: true, name: true, pricePesos: true }
	});

	if (!existing) {
		return json({ error: 'Menu item not found.' }, { status: 404 });
	}

	const updated = await prisma.menuItem.update({
		where: { id: existing.id },
		data: {
			pricePesos: parsed.data.pricePesos.toFixed(2)
		},
		select: {
			id: true,
			name: true,
			pricePesos: true,
			updatedAt: true
		}
	});

	await writeSecurityLog({
		actorUserId: locals.user.id,
		eventType: 'TASK_CRUD',
		outcome: 'SUCCESS',
		route: url.pathname,
		ip: getClientAddress(),
		userAgent: request.headers.get('user-agent'),
		resourceType: 'menu_item',
		resourceId: updated.id,
		metadataJson: {
			previousPricePesos: Number(existing.pricePesos),
			nextPricePesos: Number(updated.pricePesos)
		}
	});

	return json({
		menuItem: {
			...updated,
			pricePesos: Number(updated.pricePesos)
		}
	});
};
