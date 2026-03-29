import { redirect, type Handle } from '@sveltejs/kit';
import { getSessionFromToken } from '$lib/server/auth/service';
import { SESSION_COOKIE_NAME } from '$lib/server/auth/session';

const PUBLIC_PATH_PREFIXES = ['/login', '/register', '/forgot-password'];

function isPublicPath(pathname: string): boolean {
	if (pathname === '/robots.txt' || pathname.startsWith('/favicon')) {
		return true;
	}

	return PUBLIC_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE_NAME);

	event.locals.user = null;
	event.locals.session = null;

	if (token) {
		const authSession = await getSessionFromToken(token);
		if (authSession) {
			event.locals.user = authSession.user;
			event.locals.session = authSession.session;
		}
	}

	const pathname = event.url.pathname;
	const publicPath = isPublicPath(pathname);

	if (!event.locals.user && !publicPath) {
		throw redirect(303, '/login');
	}

	if (event.locals.user && (pathname === '/login' || pathname === '/register')) {
		throw redirect(303, '/');
	}

	return resolve(event);
};
