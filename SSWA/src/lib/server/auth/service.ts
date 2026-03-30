import { UserRole, UserStatus } from '../../../../generated/prisma/enums';
import { prisma } from '$lib/server/db';
import { hashPassword, verifyPassword } from '$lib/server/auth/password';
import { MIN_PASSWORD_AGE_MS } from '$lib/server/auth/password-policy';
import {
	SESSION_TTL_SECONDS,
	generateSessionToken,
	hashSessionToken
} from '$lib/server/auth/session';
import { writeSecurityLog } from '$lib/server/logging/security-log';

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
	| {
			ok: true;
			user: AuthUser;
			sessionToken: string;
			lastAccountUse?: {
				previousSuccessfulLoginAt: Date | null;
				previousFailedLoginAt: Date | null;
			};
	  }
	| { ok: false; message: string };

type PasswordChangeResult =
	| { ok: true; message: string }
	| {
			ok: false;
			message: string;
			validationError?: boolean;
	  };

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

async function isPasswordReused(userId: string, proposedPassword: string): Promise<boolean> {
	const historyEntries = await prisma.passwordHistory.findMany({
		where: { userId },
		orderBy: { createdAt: 'desc' },
		take: 10,
		select: {
			passwordHash: true
		}
	});

	for (const historyEntry of historyEntries) {
		if (await verifyPassword(proposedPassword, historyEntry.passwordHash)) {
			return true;
		}
	}

	return false;
}

async function updatePasswordWithPolicy(params: {
	userId: string;
	proposedPassword: string;
	context: SecurityContext;
	eventType: 'AUTH_PASSWORD_CHANGE' | 'AUTH_PASSWORD_RESET';
	actorUserId?: string;
}): Promise<PasswordChangeResult> {
	const user = await prisma.user.findUnique({
		where: { id: params.userId },
		select: {
			id: true,
			passwordChangedAt: true
		}
	});

	if (!user) {
		return { ok: false, message: 'Unable to process password update.' };
	}

	const ageMs = Date.now() - user.passwordChangedAt.getTime();
	if (ageMs < MIN_PASSWORD_AGE_MS) {
		await writeSecurityLog({
			actorUserId: params.actorUserId ?? user.id,
			eventType: params.eventType,
			outcome: 'DENIED',
			route: params.context.route,
			ip: params.context.ip,
			userAgent: params.context.userAgent,
			metadataJson: { reason: 'password_minimum_age_not_met' }
		});

		return {
			ok: false,
			message: 'Password must be at least one day old before it can be changed again.',
			validationError: true
		};
	}

	if (await isPasswordReused(user.id, params.proposedPassword)) {
		await writeSecurityLog({
			actorUserId: params.actorUserId ?? user.id,
			eventType: params.eventType,
			outcome: 'DENIED',
			route: params.context.route,
			ip: params.context.ip,
			userAgent: params.context.userAgent,
			metadataJson: { reason: 'password_reuse_detected' }
		});

		return {
			ok: false,
			message: 'Password re-use is not allowed.',
			validationError: true
		};
	}

	const nextPasswordHash = await hashPassword(params.proposedPassword);

	await prisma.$transaction([
		prisma.user.update({
			where: { id: user.id },
			data: {
				passwordHash: nextPasswordHash,
				passwordChangedAt: new Date()
			}
		}),
		prisma.passwordHistory.create({
			data: {
				userId: user.id,
				passwordHash: nextPasswordHash
			}
		})
	]);

	await writeSecurityLog({
		actorUserId: params.actorUserId ?? user.id,
		eventType: params.eventType,
		outcome: 'SUCCESS',
		route: params.context.route,
		ip: params.context.ip,
		userAgent: params.context.userAgent
	});

	return {
		ok: true,
		message:
			params.eventType === 'AUTH_PASSWORD_CHANGE'
				? 'Password changed successfully.'
				: 'Password reset successfully.'
	};
}

export async function registerRoleB(
	email: string,
	password: string,
	resetQuestion: string,
	resetAnswer: string,
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
	const resetAnswerHash = await hashPassword(resetAnswer);

	const user = await prisma.user.create({
		data: {
			email: normalizedEmail,
			role: UserRole.USER,
			status: UserStatus.ACTIVE,
			passwordHash,
			resetQuestion: resetQuestion.trim(),
			resetAnswerHash,
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
			lockoutUntil: true,
			lastLoginSuccessAt: true,
			lastLoginFailureAt: true
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

	const previousSuccessfulLoginAt = user.lastLoginSuccessAt;
	const previousFailedLoginAt = user.lastLoginFailureAt;

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
		sessionToken,
		lastAccountUse: {
			previousSuccessfulLoginAt,
			previousFailedLoginAt
		}
	};
}

export async function changePasswordWithReauth(
	userId: string,
	currentPassword: string,
	newPassword: string,
	context: SecurityContext
): Promise<PasswordChangeResult> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			passwordHash: true
		}
	});

	if (!user) {
		return { ok: false, message: 'Unable to process password change.' };
	}

	const verified = await verifyPassword(currentPassword, user.passwordHash);
	if (!verified) {
		await writeSecurityLog({
			actorUserId: user.id,
			eventType: 'AUTH_REAUTH',
			outcome: 'FAILURE',
			route: context.route,
			ip: context.ip,
			userAgent: context.userAgent,
			metadataJson: { reason: 'current_password_mismatch' }
		});

		return { ok: false, message: 'Current password is incorrect.', validationError: true };
	}

	await writeSecurityLog({
		actorUserId: user.id,
		eventType: 'AUTH_REAUTH',
		outcome: 'SUCCESS',
		route: context.route,
		ip: context.ip,
		userAgent: context.userAgent
	});

	return updatePasswordWithPolicy({
		userId: user.id,
		proposedPassword: newPassword,
		context,
		eventType: 'AUTH_PASSWORD_CHANGE',
		actorUserId: user.id
	});
}

export async function resetPasswordWithSecurityChallenge(
	email: string,
	question: string,
	answer: string,
	newPassword: string,
	context: SecurityContext
): Promise<PasswordChangeResult> {
	const normalizedEmail = email.trim().toLowerCase();
	const genericFailure = 'Unable to reset password with the provided details.';

	const user = await prisma.user.findUnique({
		where: { email: normalizedEmail },
		select: {
			id: true,
			resetQuestion: true,
			resetAnswerHash: true
		}
	});

	if (!user || !user.resetQuestion || !user.resetAnswerHash) {
		await writeSecurityLog({
			eventType: 'AUTH_PASSWORD_RESET',
			outcome: 'FAILURE',
			route: context.route,
			ip: context.ip,
			userAgent: context.userAgent,
			metadataJson: { reason: 'user_or_reset_challenge_not_found' }
		});

		return { ok: false, message: genericFailure };
	}

	const questionMatches = user.resetQuestion.trim().toLowerCase() === question.trim().toLowerCase();
	const answerMatches = await verifyPassword(answer, user.resetAnswerHash);

	if (!questionMatches || !answerMatches) {
		await writeSecurityLog({
			actorUserId: user.id,
			eventType: 'AUTH_PASSWORD_RESET',
			outcome: 'FAILURE',
			route: context.route,
			ip: context.ip,
			userAgent: context.userAgent,
			metadataJson: { reason: 'challenge_verification_failed' }
		});

		return { ok: false, message: genericFailure, validationError: true };
	}

	return updatePasswordWithPolicy({
		userId: user.id,
		proposedPassword: newPassword,
		context,
		eventType: 'AUTH_PASSWORD_RESET',
		actorUserId: user.id
	});
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
