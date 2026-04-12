type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export type RoleAwareNavLink = {
	href: string;
	label: string;
	allowedRoles: UserRole[];
};

const DASHBOARD_LINKS: RoleAwareNavLink[] = [
	{
		href: '/menu',
		label: 'Menu / Create Order',
		allowedRoles: ['ADMIN', 'MANAGER', 'USER']
	},
	{
		href: '/orders/me',
		label: 'My Orders',
		allowedRoles: ['USER']
	},
	{
		href: '/manager/orders',
		label: 'Manager Orders',
		allowedRoles: ['ADMIN', 'MANAGER']
	},
	{
		href: '/manager/users',
		label: 'User Management',
		allowedRoles: ['ADMIN', 'MANAGER']
	},
	{
		href: '/account/password',
		label: 'Change Password',
		allowedRoles: ['ADMIN', 'MANAGER', 'USER']
	},
	{
		href: '/forgot-password',
		label: 'Forgot Password',
		allowedRoles: ['ADMIN', 'MANAGER', 'USER']
	},
	{
		href: '/admin/users',
		label: 'Admin Users',
		allowedRoles: ['ADMIN']
	},
	{
		href: '/admin/menu',
		label: 'Menu Pricing',
		allowedRoles: ['ADMIN']
	},
	{
		href: '/admin/logs',
		label: 'Security Logs',
		allowedRoles: ['ADMIN']
	}
];

const SECONDARY_LAYOUT_LINKS: RoleAwareNavLink[] = [
	{
		href: '/',
		label: 'Dashboard',
		allowedRoles: ['ADMIN', 'MANAGER', 'USER']
	},
	{
		href: '/menu',
		label: 'Menu',
		allowedRoles: ['ADMIN', 'MANAGER', 'USER']
	},
	{
		href: '/orders/me',
		label: 'My Orders',
		allowedRoles: ['USER']
	},
	{
		href: '/manager/orders',
		label: 'Manage Orders',
		allowedRoles: ['ADMIN', 'MANAGER']
	},
	{
		href: '/manager/users',
		label: 'Manage Users',
		allowedRoles: ['ADMIN', 'MANAGER']
	},
	{
		href: '/admin/users',
		label: 'Admin Users',
		allowedRoles: ['ADMIN']
	},
	{
		href: '/admin/menu',
		label: 'Admin Menu',
		allowedRoles: ['ADMIN']
	},
	{
		href: '/admin/logs',
		label: 'Admin Logs',
		allowedRoles: ['ADMIN']
	}
];

function filterByRole(
	links: RoleAwareNavLink[],
	role: App.Locals['user'] extends { role: infer R } ? R | null | undefined : string | null | undefined
): RoleAwareNavLink[] {
	if (!role) {
		return [];
	}

	return links.filter((link) => link.allowedRoles.includes(role as UserRole));
}

export function getDashboardNavLinks(role: App.Locals['user'] extends { role: infer R } ? R | null | undefined : string | null | undefined): RoleAwareNavLink[] {
	return filterByRole(DASHBOARD_LINKS, role);
}

export function getSecondaryNavLinks(role: App.Locals['user'] extends { role: infer R } ? R | null | undefined : string | null | undefined): RoleAwareNavLink[] {
	return filterByRole(SECONDARY_LAYOUT_LINKS, role);
}
