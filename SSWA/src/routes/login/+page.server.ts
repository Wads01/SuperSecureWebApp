import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { login } from '$lib/server/auth/service';
import { setSessionCookie } from '$lib/server/auth/session';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, getClientAddress, cookies, url }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '');
		const password = String(formData.get('password') ?? '');

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required.' });
		}

		const result = await login(email, password, {
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
