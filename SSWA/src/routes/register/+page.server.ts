import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { registerRoleB } from '$lib/server/auth/service';
import { setSessionCookie } from '$lib/server/auth/session';
import { validatePasswordComplexity, validateResetChallenge } from '$lib/server/auth/password-policy';
import { logValidationFailure } from '$lib/server/logging/security-log';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, getClientAddress, cookies, url, locals }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '').trim();
		const password = String(formData.get('password') ?? '');
		const confirmPassword = String(formData.get('confirmPassword') ?? '');
		const resetQuestion = String(formData.get('resetQuestion') ?? '').trim();
		const resetAnswer = String(formData.get('resetAnswer') ?? '');

		if (!email || !password || !confirmPassword || !resetQuestion || !resetAnswer) {
			await logValidationFailure({
				actorUserId: locals.user?.id,
				route: url.pathname,
				ip: getClientAddress(),
				userAgent: request.headers.get('user-agent'),
				reason: 'missing_required_fields',
				fields: ['email', 'password', 'confirmPassword', 'resetQuestion', 'resetAnswer']
			});

			return fail(400, {
				error: 'Email, password, and reset challenge fields are required.'
			});
		}

		if (password !== confirmPassword) {
			await logValidationFailure({
				actorUserId: locals.user?.id,
				route: url.pathname,
				ip: getClientAddress(),
				userAgent: request.headers.get('user-agent'),
				reason: 'password_confirmation_mismatch',
				fields: ['password', 'confirmPassword']
			});

			return fail(400, { error: 'Passwords do not match.' });
		}

		const passwordPolicyError = validatePasswordComplexity(password);
		if (passwordPolicyError) {
			await logValidationFailure({
				actorUserId: locals.user?.id,
				route: url.pathname,
				ip: getClientAddress(),
				userAgent: request.headers.get('user-agent'),
				reason: 'password_policy_violation',
				fields: ['password']
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

		const result = await registerRoleB(email, password, resetQuestion, resetAnswer, {
			ip: getClientAddress(),
			userAgent: request.headers.get('user-agent'),
			route: url.pathname
		});

		if (!result.ok) {
			return fail(400, { error: result.message });
		}

		setSessionCookie(cookies, result.sessionToken);
		throw redirect(303, '/');
	}
};
