import { createHash, randomBytes } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';

export const SESSION_COOKIE_NAME = 'sswa_session';
export const LAST_ACCOUNT_USE_COOKIE_NAME = 'sswa_last_account_use';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export type LastAccountUseNotice = {
	previousSuccessfulLoginAt: string | null;
	previousFailedLoginAt: string | null;
};

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

export function setLastAccountUseNoticeCookie(cookies: Cookies, notice: LastAccountUseNotice): void {
	const encoded = Buffer.from(JSON.stringify(notice), 'utf8').toString('base64url');

	cookies.set(LAST_ACCOUNT_USE_COOKIE_NAME, encoded, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 60 * 10
	});
}

export function consumeLastAccountUseNoticeCookie(cookies: Cookies): LastAccountUseNotice | null {
	const encoded = cookies.get(LAST_ACCOUNT_USE_COOKIE_NAME);

	if (!encoded) {
		return null;
	}

	cookies.delete(LAST_ACCOUNT_USE_COOKIE_NAME, { path: '/' });

	try {
		const json = Buffer.from(encoded, 'base64url').toString('utf8');
		const parsed = JSON.parse(json) as LastAccountUseNotice;

		return {
			previousSuccessfulLoginAt: parsed.previousSuccessfulLoginAt ?? null,
			previousFailedLoginAt: parsed.previousFailedLoginAt ?? null
		};
	} catch {
		return null;
	}
}
