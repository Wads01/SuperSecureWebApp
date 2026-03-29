import { UserRole, UserStatus } from '../../../../generated/prisma/enums';
import type { Prisma } from '../../../../generated/prisma/client';
import { prisma } from '$lib/server/db';
import { hashPassword, verifyPassword } from '$lib/server/auth/password';
import {
	SESSION_TTL_SECONDS,
	generateSessionToken,
	hashSessionToken
} from '$lib/server/auth/session';

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

type SecurityContext = {
	ip: string | null;
	userAgent: string | null;
	route?: string;
};

export type AuthUser = {
	id: string;
	email: string;
	role: UserRole;
	status: UserStatus;
	scopeId: string | null;
};

type AuthResult =
	| { ok: true; user: AuthUser; sessionToken: string }
	| { ok: false; message: string };

function toAuthUser(user: {
	id: string;
	email: string;
	role: UserRole;
	status: UserStatus;
	scopeId: string | null;
}): AuthUser {
	return {
		id: user.id,
		email: user.email,
		role: user.role,
		status: user.status,
		scopeId: user.scopeId
	};
}

async function writeSecurityLog(params: {
	actorUserId?: string;
	eventType:
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
	outcome: 'SUCCESS' | 'FAILURE' | 'DENIED';
	route?: string;
	ip?: string | null;
	userAgent?: string | null;
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
				metadataJson: params.metadataJson as Prisma.InputJsonValue | undefined
			}
		});
	} catch {
		// Do not break auth flow if log writing fails.
	}
}

async function createSession(userId: string, context: SecurityContext): Promise<string> {
	const rawToken = generateSessionToken();
	const tokenHash = hashSessionToken(rawToken);
	const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

	await prisma.session.create({
		data: {
			userId,
			sessionTokenHash: tokenHash,
			expiresAt,
			ip: context.ip,
			userAgent: context.userAgent
		}
	});

	return rawToken;
}

export async function registerRoleB(
	email: string,
	password: string,
	context: SecurityContext
): Promise<AuthResult> {
	const normalizedEmail = email.trim().toLowerCase();

	const existingUser = await prisma.user.findUnique({
		where: { email: normalizedEmail }
	});

	if (existingUser) {
		return {
			ok: false,
			message: 'Unable to register with provided credentials.'
		};
	}

	const passwordHash = await hashPassword(password);

	const user = await prisma.user.create({
		data: {
			email: normalizedEmail,
			role: UserRole.USER,
			status: UserStatus.ACTIVE,
			passwordHash,
			passwordHistory: {
				create: {
					passwordHash
				}
			}
		},
		select: {
			id: true,
			email: true,
			role: true,
			status: true,
			scopeId: true
		}
	});

	const sessionToken = await createSession(user.id, context);

	await writeSecurityLog({
		actorUserId: user.id,
		eventType: 'AUTH_REGISTER',
		outcome: 'SUCCESS',
		route: context.route,
		ip: context.ip,
		userAgent: context.userAgent
	});

	return { ok: true, user: toAuthUser(user), sessionToken };
}

export async function login(
	email: string,
	password: string,
	context: SecurityContext
): Promise<AuthResult> {
	const normalizedEmail = email.trim().toLowerCase();
	const genericFailureMessage = 'Invalid username and/or password.';

	const user = await prisma.user.findUnique({
		where: { email: normalizedEmail },
		select: {
			id: true,
			email: true,
			role: true,
			status: true,
			scopeId: true,
			passwordHash: true,
			failedLoginCount: true,
			lockoutUntil: true
		}
	});

	if (!user) {
		await writeSecurityLog({
			eventType: 'AUTH_LOGIN',
			outcome: 'FAILURE',
			route: context.route,
			ip: context.ip,
			userAgent: context.userAgent,
			metadataJson: { reason: 'user_not_found', email: normalizedEmail }
		});

		return { ok: false, message: genericFailureMessage };
	}

	if (user.status === UserStatus.DISABLED) {
		await writeSecurityLog({
			actorUserId: user.id,
			eventType: 'AUTH_LOGIN',
			outcome: 'DENIED',
			route: context.route,
			ip: context.ip,
			userAgent: context.userAgent,
			metadataJson: { reason: 'user_disabled' }
		});

		return { ok: false, message: genericFailureMessage };
	}

	if (user.lockoutUntil && user.lockoutUntil > new Date()) {
		await writeSecurityLog({
			actorUserId: user.id,
			eventType: 'AUTH_LOGIN',
			outcome: 'DENIED',
			route: context.route,
			ip: context.ip,
			userAgent: context.userAgent,
			metadataJson: { reason: 'locked_out' }
		});

		return { ok: false, message: genericFailureMessage };
	}

	const passwordMatches = await verifyPassword(password, user.passwordHash);

	if (!passwordMatches) {
		const failedLoginCount = user.failedLoginCount + 1;
		const shouldLock = failedLoginCount >= MAX_FAILED_LOGIN_ATTEMPTS;

		await prisma.user.update({
			where: { id: user.id },
			data: {
				failedLoginCount,
				lastLoginFailureAt: new Date(),
				lockoutUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : null,
				status: shouldLock ? UserStatus.LOCKED : user.status
			}
		});

		await writeSecurityLog({
			actorUserId: user.id,
			eventType: shouldLock ? 'AUTH_LOCKOUT' : 'AUTH_LOGIN',
			outcome: 'FAILURE',
			route: context.route,
			ip: context.ip,
			userAgent: context.userAgent,
			metadataJson: {
				reason: 'bad_password',
				failedLoginCount,
				lockoutApplied: shouldLock
			}
		});

		return { ok: false, message: genericFailureMessage };
	}

	await prisma.user.update({
		where: { id: user.id },
		data: {
			failedLoginCount: 0,
			lockoutUntil: null,
			status: UserStatus.ACTIVE,
			lastLoginAt: new Date(),
			lastLoginSuccessAt: new Date()
		}
	});

	const sessionToken = await createSession(user.id, context);

	await writeSecurityLog({
		actorUserId: user.id,
		eventType: 'AUTH_LOGIN',
		outcome: 'SUCCESS',
		route: context.route,
		ip: context.ip,
		userAgent: context.userAgent
	});

	return {
		ok: true,
		user: toAuthUser(user),
		sessionToken
	};
}

export async function getSessionFromToken(token: string) {
	const tokenHash = hashSessionToken(token);

	const session = await prisma.session.findUnique({
		where: {
			sessionTokenHash: tokenHash
		},
		include: {
			user: {
				select: {
					id: true,
					email: true,
					role: true,
					status: true,
					scopeId: true
				}
			}
		}
	});

	if (!session) {
		return null;
	}

	if (session.expiresAt <= new Date()) {
		await prisma.session.delete({ where: { id: session.id } });
		return null;
	}

	await prisma.session.update({
		where: { id: session.id },
		data: { lastSeenAt: new Date() }
	});

	return {
		session: {
			id: session.id,
			expiresAt: session.expiresAt
		},
		user: toAuthUser(session.user)
	};
}

export async function logout(token: string, context: SecurityContext): Promise<void> {
	const tokenHash = hashSessionToken(token);

	const existingSession = await prisma.session.findUnique({
		where: { sessionTokenHash: tokenHash },
		select: { id: true, userId: true }
	});

	if (!existingSession) {
		return;
	}

	await prisma.session.delete({ where: { id: existingSession.id } });

	await writeSecurityLog({
		actorUserId: existingSession.userId,
		eventType: 'AUTH_LOGOUT',
		outcome: 'SUCCESS',
		route: context.route,
		ip: context.ip,
		userAgent: context.userAgent
	});
}
