import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { UserStatus } from '../generated/prisma/enums';
import { getSessionFromToken } from '$lib/server/auth/service';
import { clearSessionCookie, SESSION_COOKIE_NAME } from '$lib/server/auth/session';
import { isAllowedPath } from '$lib/server/authorization/policy';
import { writeSecurityLog } from '$lib/server/logging/security-log';

const PUBLIC_PATH_PREFIXES = ['/login', '/register', '/forgot-password'];

function isPublicPath(pathname: string): boolean {
	if (pathname === '/robots.txt' || pathname.startsWith('/favicon')) {
		return true;
	}

	return PUBLIC_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export const handle: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;
	const publicPath = isPublicPath(pathname);
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

	if (event.locals.user && event.locals.user.status !== UserStatus.ACTIVE) {
		await writeSecurityLog({
			actorUserId: event.locals.user.id,
			eventType: 'AUTHZ_ACCESS',
			outcome: 'DENIED',
			route: pathname,
			ip: event.getClientAddress(),
			userAgent: event.request.headers.get('user-agent'),
			metadataJson: {
				reason: 'inactive_account_status',
				status: event.locals.user.status
			}
		});

		clearSessionCookie(event.cookies);
		event.locals.user = null;
		event.locals.session = null;
	}

	if (!event.locals.user && !publicPath) {
		throw redirect(303, '/login');
	}

	if (event.locals.user && !publicPath && !isAllowedPath(pathname, event.locals.user)) {
		await writeSecurityLog({
			actorUserId: event.locals.user.id,
			eventType: 'AUTHZ_ACCESS',
			outcome: 'DENIED',
			route: pathname,
			ip: event.getClientAddress(),
			userAgent: event.request.headers.get('user-agent'),
			metadataJson: {
				reason: 'route_policy_denied',
				role: event.locals.user.role
			}
		});

		throw redirect(303, '/forbidden');
	}

	if (event.locals.user && (pathname === '/login' || pathname === '/register')) {
		throw redirect(303, '/');
	}

	return resolve(event);
};

export const handleError: HandleServerError = async ({ error, event }) => {
	await writeSecurityLog({
		actorUserId: event.locals.user?.id,
		eventType: 'TASK_CRUD',
		outcome: 'FAILURE',
		route: event.url.pathname,
		ip: event.getClientAddress(),
		userAgent: event.request.headers.get('user-agent'),
		metadataJson: {
			reason: 'unhandled_server_error'
		}
	});

	console.error(error);

	return {
		message: 'Something went wrong. Please try again later.'
	};
};
