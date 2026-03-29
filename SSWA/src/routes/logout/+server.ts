import { redirect, type RequestHandler } from '@sveltejs/kit';
import { clearSessionCookie, SESSION_COOKIE_NAME } from '$lib/server/auth/session';
import { logout } from '$lib/server/auth/service';

export const POST: RequestHandler = async ({ cookies, getClientAddress, request, url }) => {
	const token = cookies.get(SESSION_COOKIE_NAME);

	if (token) {
		await logout(token, {
			ip: getClientAddress(),
			userAgent: request.headers.get('user-agent'),
			route: url.pathname
		});
	}

	clearSessionCookie(cookies);
	throw redirect(303, '/login');
};
