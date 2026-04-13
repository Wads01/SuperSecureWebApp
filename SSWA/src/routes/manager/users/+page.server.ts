import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { UserRole, UserStatus } from '../../../../generated/prisma/enums';
import { prisma } from '$lib/server/db';
import { assertAllowedPath, canManageUser } from '$lib/server/authorization/policy';
import { logValidationFailure, writeSecurityLog } from '$lib/server/logging/security-log';

export const load: PageServerLoad = async ({ locals, url }) => {
	assertAllowedPath(url.pathname, locals.user);

	if (locals.user.role === UserRole.ADMIN) {
		const users = await prisma.user.findMany({
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				email: true,
				role: true,
				status: true,
				scopeId: true
			}
		});

		return { users };
	}

	const users = await prisma.user.findMany({
		where: {
			role: UserRole.USER,
			OR: [{ scopeId: locals.user.scopeId }, { scopeId: null }]
		},
		orderBy: { createdAt: 'desc' },
		select: {
			id: true,
			email: true,
			role: true,
			status: true,
			scopeId: true
		}
	});

	return { users };
};

export const actions: Actions = {
	setStatus: async ({ request, locals, url, getClientAddress }) => {
		assertAllowedPath(url.pathname, locals.user);

		const formData = await request.formData();
		const targetUserId = String(formData.get('targetUserId') ?? '');
		const nextStatus = String(formData.get('nextStatus') ?? '');

		if (!targetUserId || !nextStatus) {
			await logValidationFailure({
				actorUserId: locals.user.id,
				route: url.pathname,
				ip: getClientAddress(),
				userAgent: request.headers.get('user-agent'),
				reason: 'missing_required_fields',
				fields: ['targetUserId', 'nextStatus']
			});

			return fail(400, { error: 'targetUserId and nextStatus are required.' });
		}

		if (nextStatus !== UserStatus.ACTIVE && nextStatus !== UserStatus.DISABLED) {
			await logValidationFailure({
				actorUserId: locals.user.id,
				route: url.pathname,
				ip: getClientAddress(),
				userAgent: request.headers.get('user-agent'),
				reason: 'invalid_status_value',
				fields: ['nextStatus']
			});

			return fail(400, { error: 'Invalid status value.' });
		}

		const targetUser = await prisma.user.findUnique({
			where: { id: targetUserId },
			select: {
				id: true,
				role: true,
				scopeId: true
			}
		});

		if (!targetUser) {
			await logValidationFailure({
				actorUserId: locals.user.id,
				route: url.pathname,
				ip: getClientAddress(),
				userAgent: request.headers.get('user-agent'),
				reason: 'target_user_not_found',
				fields: ['targetUserId']
			});

			return fail(404, { error: 'User not found.' });
		}

		if (!canManageUser(locals.user, targetUser)) {
			await writeSecurityLog({
				actorUserId: locals.user.id,
				eventType: 'AUTHZ_ACCESS',
				outcome: 'DENIED',
				route: url.pathname,
				metadataJson: {
					reason: 'scope_or_role_restriction',
					targetUserId: targetUser.id,
					targetUserRole: targetUser.role,
					actorRole: locals.user.role
				}
			});

			return fail(403, { error: 'Access denied.' });
		}

		await prisma.user.update({
			where: { id: targetUser.id },
			data: {
				status: nextStatus as UserStatus,
				failedLoginCount: nextStatus === UserStatus.ACTIVE ? 0 : undefined,
				lockoutUntil: nextStatus === UserStatus.ACTIVE ? null : undefined
			}
		});

		return { success: true };
	}
};
