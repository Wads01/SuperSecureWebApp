import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { resetPasswordWithSecurityChallenge } from '$lib/server/auth/service';
import { validatePasswordComplexity, validateResetChallenge } from '$lib/server/auth/password-policy';
import { logValidationFailure } from '$lib/server/logging/security-log';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request, getClientAddress, url, locals }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '').trim();
		const resetQuestion = String(formData.get('resetQuestion') ?? '').trim();
		const resetAnswer = String(formData.get('resetAnswer') ?? '');
		const newPassword = String(formData.get('newPassword') ?? '');
		const confirmPassword = String(formData.get('confirmPassword') ?? '');

		if (!email || !resetQuestion || !resetAnswer || !newPassword || !confirmPassword) {
			await logValidationFailure({
				actorUserId: locals.user?.id,
				route: url.pathname,
				ip: getClientAddress(),
				userAgent: request.headers.get('user-agent'),
				reason: 'missing_required_fields',
				fields: ['email', 'resetQuestion', 'resetAnswer', 'newPassword', 'confirmPassword']
			});

			return fail(400, { error: 'All fields are required.' });
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

			return fail(400, { error: 'Passwords do not match.' });
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

		const resetChallengeError = validateResetChallenge(resetQuestion, resetAnswer);
		if (resetChallengeError) {
			await logValidationFailure({
				actorUserId: locals.user?.id,
				route: url.pathname,
				ip: getClientAddress(),
				userAgent: request.headers.get('user-agent'),
				reason: 'reset_challenge_policy_violation',
				fields: ['resetQuestion', 'resetAnswer']
			});

			return fail(400, { error: resetChallengeError });
		}

		const result = await resetPasswordWithSecurityChallenge(
			email,
			resetQuestion,
			resetAnswer,
			newPassword,
			{
				ip: getClientAddress(),
				userAgent: request.headers.get('user-agent'),
				route: url.pathname
			}
		);

		if (!result.ok) {
			return fail(result.validationError ? 400 : 403, { error: result.message });
		}

		return { success: result.message };
	}
};
