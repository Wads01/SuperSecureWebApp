import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { assertAllowedPath } from '$lib/server/authorization/policy';

export const load: PageServerLoad = async ({ locals, url }) => {
	assertAllowedPath(url.pathname, locals.user);

	const logs = await prisma.securityLog.findMany({
		orderBy: {
			createdAt: 'desc'
		},
		take: 100,
		select: {
			id: true,
			eventType: true,
			outcome: true,
			route: true,
			ip: true,
			createdAt: true
		}
	});

	return { logs };
};
