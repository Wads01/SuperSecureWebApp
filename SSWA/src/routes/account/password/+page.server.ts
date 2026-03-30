import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { changePasswordWithReauth } from '$lib/server/auth/service';
import { validatePasswordComplexity } from '$lib/server/auth/password-policy';
import { logValidationFailure } from '$lib/server/logging/security-log';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals, getClientAddress, url }) => {
		const formData = await request.formData();
		const currentPassword = String(formData.get('currentPassword') ?? '');
		const newPassword = String(formData.get('newPassword') ?? '');
		const confirmPassword = String(formData.get('confirmPassword') ?? '');

		if (!currentPassword || !newPassword || !confirmPassword) {
			await logValidationFailure({
				actorUserId: locals.user?.id,
				route: url.pathname,
				ip: getClientAddress(),
				userAgent: request.headers.get('user-agent'),
				reason: 'missing_required_fields',
				fields: ['currentPassword', 'newPassword', 'confirmPassword']
			});

			return fail(400, { error: 'All password fields are required.' });
		}

		if (newPassword !== confirmPassword) {
			await logValidationFailure({
				actorUserId: locals.user?.id,
				route: url.pathname,
				ip: getClientAddress(),
				userAgent: request.headers.get('user-agent'),
				reason: 'password_confirmation_mismatch',
				fields: ['newPassword', 'confirmPassword']
			});

			return fail(400, { error: 'New password fields do not match.' });
		}

		const passwordPolicyError = validatePasswordComplexity(newPassword);
		if (passwordPolicyError) {
			await logValidationFailure({
				actorUserId: locals.user?.id,
				route: url.pathname,
				ip: getClientAddress(),
				userAgent: request.headers.get('user-agent'),
				reason: 'password_policy_violation',
				fields: ['newPassword']
			});

			return fail(400, { error: passwordPolicyError });
		}

		const result = await changePasswordWithReauth(locals.user!.id, currentPassword, newPassword, {
			ip: getClientAddress(),
			userAgent: request.headers.get('user-agent'),
			route: url.pathname
		});

		if (!result.ok) {
			return fail(result.validationError ? 400 : 403, { error: result.message });
		}

		return { success: result.message };
	}
};
