import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { registerRoleB } from '$lib/server/auth/service';
import { setSessionCookie } from '$lib/server/auth/session';

const MIN_PASSWORD_LENGTH = 12;
const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, getClientAddress, cookies, url }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '').trim();
		const password = String(formData.get('password') ?? '');
		const confirmPassword = String(formData.get('confirmPassword') ?? '');

		if (!email || !password || !confirmPassword) {
			return fail(400, { error: 'Email and password fields are required.' });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match.' });
		}

		if (password.length < MIN_PASSWORD_LENGTH) {
			return fail(400, {
				error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
			});
		}

		if (!PASSWORD_POLICY.test(password)) {
			return fail(400, {
				error:
					'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.'
			});
		}

		const result = await registerRoleB(email, password, {
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
