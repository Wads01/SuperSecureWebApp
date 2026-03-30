import type { PageServerLoad } from './$types';
import { consumeLastAccountUseNoticeCookie } from '$lib/server/auth/session';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	const lastAccountUse = consumeLastAccountUseNoticeCookie(cookies);

	return {
		user: locals.user,
		lastAccountUse
	};
};
