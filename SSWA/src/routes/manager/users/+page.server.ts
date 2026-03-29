import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { UserRole, UserStatus } from '../../../../generated/prisma/enums';
import { prisma } from '$lib/server/db';
import { assertAllowedPath, canManageUser } from '$lib/server/authorization/policy';

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
			scopeId: locals.user.scopeId
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
	setStatus: async ({ request, locals, url }) => {
		assertAllowedPath(url.pathname, locals.user);

		const formData = await request.formData();
		const targetUserId = String(formData.get('targetUserId') ?? '');
		const nextStatus = String(formData.get('nextStatus') ?? '');

		if (!targetUserId || !nextStatus) {
			return fail(400, { error: 'targetUserId and nextStatus are required.' });
		}

		if (nextStatus !== UserStatus.ACTIVE && nextStatus !== UserStatus.DISABLED) {
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
			return fail(404, { error: 'User not found.' });
		}

		if (!canManageUser(locals.user, targetUser)) {
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
