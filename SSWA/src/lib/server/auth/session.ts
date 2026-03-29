import { createHash, randomBytes } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';

export const SESSION_COOKIE_NAME = 'sswa_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export function generateSessionToken(): string {
	return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export function setSessionCookie(cookies: Cookies, token: string): void {
	cookies.set(SESSION_COOKIE_NAME, token, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: SESSION_TTL_SECONDS
	});
}

export function clearSessionCookie(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE_NAME, {
		path: '/'
	});
}
