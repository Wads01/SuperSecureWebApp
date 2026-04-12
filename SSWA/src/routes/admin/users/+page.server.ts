import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { UserRole, UserStatus } from '../../../../generated/prisma/enums';
import { prisma } from '$lib/server/db';
import { assertAllowedPath } from '$lib/server/authorization/policy';

export const load: PageServerLoad = async ({ locals, url }) => {
	assertAllowedPath(url.pathname, locals.user);

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

	return {
		users,
		assignableRoles: [UserRole.ADMIN, UserRole.MANAGER]
	};
};

export const actions: Actions = {
	setRole: async ({ request, fetch, locals, url }) => {
		assertAllowedPath(url.pathname, locals.user);

		const formData = await request.formData();
		const targetUserId = String(formData.get('targetUserId') ?? '');
		const role = String(formData.get('role') ?? '');

		if (!targetUserId || !role) {
			return fail(400, { error: 'targetUserId and role are required.' });
		}

		const response = await fetch(`/api/admin/users/${targetUserId}/role`, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ role })
		});

		const payload = (await response.json().catch(() => null)) as { error?: string } | null;

		if (!response.ok) {
			return fail(response.status, {
				error: payload?.error ?? 'Unable to change user role.'
			});
		}

		return { success: 'User role updated successfully.' };
	},
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

		await prisma.user.update({
			where: { id: targetUserId },
			data: {
				status: nextStatus as UserStatus,
				failedLoginCount: nextStatus === UserStatus.ACTIVE ? 0 : undefined,
				lockoutUntil: nextStatus === UserStatus.ACTIVE ? null : undefined
			}
		});

		return { success: 'User status updated successfully.' };
	}
};