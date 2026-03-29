import type { Prisma } from '../../../../generated/prisma/client';
import { prisma } from '$lib/server/db';

type SecurityEventType =
	| 'AUTH_LOGIN'
	| 'AUTH_LOGOUT'
	| 'AUTH_REGISTER'
	| 'AUTH_PASSWORD_CHANGE'
	| 'AUTH_PASSWORD_RESET'
	| 'AUTH_REAUTH'
	| 'AUTH_LOCKOUT'
	| 'AUTHZ_ACCESS'
	| 'VALIDATION'
	| 'TASK_CRUD'
	| 'USER_MANAGEMENT';

type SecurityEventOutcome = 'SUCCESS' | 'FAILURE' | 'DENIED';

export async function writeSecurityLog(params: {
	actorUserId?: string;
	eventType: SecurityEventType;
	outcome: SecurityEventOutcome;
	route?: string;
	ip?: string | null;
	userAgent?: string | null;
	resourceType?: string;
	resourceId?: string;
	metadataJson?: Record<string, unknown>;
}): Promise<void> {
	try {
		await prisma.securityLog.create({
			data: {
				actorUserId: params.actorUserId,
				eventType: params.eventType,
				outcome: params.outcome,
				route: params.route,
				ip: params.ip,
				userAgent: params.userAgent,
				resourceType: params.resourceType,
				resourceId: params.resourceId,
				metadataJson: params.metadataJson as Prisma.InputJsonValue | undefined
			}
		});
	} catch {
		// Never interrupt main request flow if logging fails.
	}
}
