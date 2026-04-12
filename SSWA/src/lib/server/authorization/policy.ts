import { error } from '@sveltejs/kit';
import { UserRole } from '../../../../generated/prisma/enums';

type CurrentUser = NonNullable<App.Locals['user']>;

type AuthorizationRule = {
	pathPrefix: string;
	roles: UserRole[];
};

const ROUTE_RULES: AuthorizationRule[] = [
	{ pathPrefix: '/admin', roles: [UserRole.ADMIN] },
	{ pathPrefix: '/manager', roles: [UserRole.ADMIN, UserRole.MANAGER] }
];

function roleRank(role: UserRole): number {
	switch (role) {
		case UserRole.ADMIN:
			return 3;
		case UserRole.MANAGER:
			return 2;
		case UserRole.USER:
			return 1;
		default:
			return 0;
	}
}

export function isAllowedPath(pathname: string, user: App.Locals['user']): boolean {
	if (!user) {
		return false;
	}

	const matchedRule = ROUTE_RULES.find(
		(rule) => pathname === rule.pathPrefix || pathname.startsWith(`${rule.pathPrefix}/`)
	);

	if (!matchedRule) {
		return true;
	}

	return matchedRule.roles.includes(user.role);
}

export function assertAllowedPath(pathname: string, user: App.Locals['user']): asserts user is CurrentUser {
	if (!isAllowedPath(pathname, user)) {
		throw error(403, 'Access denied.');
	}
}

export function canManageUser(actor: CurrentUser, target: { role: UserRole; scopeId: string | null }): boolean {
	if (actor.role === UserRole.ADMIN) {
		return true;
	}

	if (actor.role === UserRole.MANAGER) {
		return target.role === UserRole.USER && actor.scopeId !== null && actor.scopeId === target.scopeId;
	}

	return false;
}

export function canAccessOwnOrHigherRole(actor: CurrentUser, ownerUserId: string): boolean {
	if (actor.role === UserRole.ADMIN || actor.role === UserRole.MANAGER) {
		return true;
	}

	return actor.id === ownerUserId;
}

export function canAssignRole(actor: CurrentUser, targetRole: UserRole): boolean {
	if (actor.role !== UserRole.ADMIN) {
		return false;
	}

	return roleRank(targetRole) >= 2;
}

export function assertRole(user: App.Locals['user'], allowedRoles: UserRole[]): asserts user is CurrentUser {
	if (!user || !allowedRoles.includes(user.role)) {
		throw error(403, 'Access denied.');
	}
}

export function assertAdmin(user: App.Locals['user']): asserts user is CurrentUser {
	assertRole(user, [UserRole.ADMIN]);
}

export function assertManagerOrAdmin(user: App.Locals['user']): asserts user is CurrentUser {
	assertRole(user, [UserRole.ADMIN, UserRole.MANAGER]);
}
