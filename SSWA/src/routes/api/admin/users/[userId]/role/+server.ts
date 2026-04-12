import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';
import { assertAdmin, canAssignRole } from '$lib/server/authorization/policy';
import { adminAssignRoleSchema } from '$lib/server/validation/order';
import { logValidationFailure, writeSecurityLog } from '$lib/server/logging/security-log';

export const PATCH: RequestHandler = async ({ locals, params, request, getClientAddress, url }) => {
	assertAdmin(locals.user);

	const payload = await request.json().catch(() => null);
	const parsed = adminAssignRoleSchema.safeParse(payload);

	if (!parsed.success) {
		await logValidationFailure({
			actorUserId: locals.user.id,
			route: url.pathname,
			ip: getClientAddress(),
			userAgent: request.headers.get('user-agent'),
			reason: 'invalid_admin_assign_role_payload',
			fields: parsed.error.issues.map((issue) => issue.path.join('.'))
		});

		return json({ error: 'Invalid role assignment payload.' }, { status: 400 });
	}

	if (!canAssignRole(locals.user, parsed.data.role)) {
		await writeSecurityLog({
			actorUserId: locals.user.id,
			eventType: 'AUTHZ_ACCESS',
			outcome: 'DENIED',
			route: url.pathname,
			ip: getClientAddress(),
			userAgent: request.headers.get('user-agent'),
			resourceType: 'user',
			resourceId: params.userId,
			metadataJson: { reason: 'role_assignment_not_allowed', requestedRole: parsed.data.role }
		});

		return json({ error: 'Access denied.' }, { status: 403 });
	}

	const targetUser = await prisma.user.findUnique({
		where: { id: params.userId },
		select: {
			id: true,
			email: true,
			role: true
		}
	});

	if (!targetUser) {
		return json({ error: 'User not found.' }, { status: 404 });
	}

	const updated = await prisma.user.update({
		where: { id: targetUser.id },
		data: {
			role: parsed.data.role
		},
		select: {
			id: true,
			email: true,
			role: true,
			updatedAt: true
		}
	});

	await writeSecurityLog({
		actorUserId: locals.user.id,
		eventType: 'USER_MANAGEMENT',
		outcome: 'SUCCESS',
		route: url.pathname,
		ip: getClientAddress(),
		userAgent: request.headers.get('user-agent'),
		resourceType: 'user',
		resourceId: updated.id,
		metadataJson: {
			previousRole: targetUser.role,
			nextRole: updated.role
		}
	});

	return json({ user: updated });
};
