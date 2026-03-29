import type { PageServerLoad } from './$types';
import { SecurityEventOutcome, SecurityEventType } from '../../../../generated/prisma/enums';
import { prisma } from '$lib/server/db';
import { assertAllowedPath } from '$lib/server/authorization/policy';

function parseEnum<T extends string>(value: string | null, enumValues: readonly T[]): T | null {
	if (!value) {
		return null;
	}

	return enumValues.includes(value as T) ? (value as T) : null;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	assertAllowedPath(url.pathname, locals.user);
	const eventType = parseEnum(url.searchParams.get('eventType'), Object.values(SecurityEventType));
	const outcome = parseEnum(url.searchParams.get('outcome'), Object.values(SecurityEventOutcome));
	const routeFilter = url.searchParams.get('route')?.trim() ?? '';
	const ipFilter = url.searchParams.get('ip')?.trim() ?? '';
	const q = url.searchParams.get('q')?.trim() ?? '';

	const where = {
		...(eventType ? { eventType } : {}),
		...(outcome ? { outcome } : {}),
		...(routeFilter ? { route: { contains: routeFilter, mode: 'insensitive' as const } } : {}),
		...(ipFilter ? { ip: { contains: ipFilter, mode: 'insensitive' as const } } : {}),
		...(q
			? {
				OR: [
					{ route: { contains: q, mode: 'insensitive' as const } },
					{ ip: { contains: q, mode: 'insensitive' as const } },
					{ resourceType: { contains: q, mode: 'insensitive' as const } },
					{ resourceId: { contains: q, mode: 'insensitive' as const } }
				]
			}
			: {})
	};

	const logs = await prisma.securityLog.findMany({
		where,
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

	return {
		logs,
		filters: {
			eventType: eventType ?? '',
			outcome: outcome ?? '',
			route: routeFilter,
			ip: ipFilter,
			q
		},
		options: {
			eventTypes: Object.values(SecurityEventType),
			outcomes: Object.values(SecurityEventOutcome)
		}
	};
};
