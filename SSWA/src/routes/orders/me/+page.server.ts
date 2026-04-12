import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { UserRole } from '../../../../generated/prisma/enums';

type OrderItem = {
	id: string;
	quantity: number;
	unitPricePesos: number;
	lineTotalPesos: number;
	menuItem: {
		id: string;
		name: string;
		category: string;
	};
};

type MyOrder = {
	id: string;
	status: string;
	totalPesos: number;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	orderItems: OrderItem[];
};

export const load: PageServerLoad = async ({ fetch, locals }) => {
	if (locals.user?.role !== UserRole.USER) {
		return { orders: [], isRoleB: false };
	}

	const response = await fetch('/api/orders/me');
	if (!response.ok) {
		return { orders: [], isRoleB: true };
	}

	const payload = (await response.json()) as { orders?: MyOrder[] };

	return {
		orders: payload.orders ?? [],
		isRoleB: true
	};
};

export const actions: Actions = {
	cancel: async ({ request, fetch, locals }) => {
		if (locals.user?.role !== UserRole.USER) {
			return fail(403, { error: 'Only Role B users can cancel their own orders.' });
		}

		const formData = await request.formData();
		const orderId = String(formData.get('orderId') ?? '');

		if (!orderId) {
			return fail(400, { error: 'Order ID is required.' });
		}

		const response = await fetch(`/api/orders/${orderId}`, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ action: 'cancel' })
		});

		const payload = (await response.json().catch(() => null)) as { error?: string } | null;

		if (!response.ok) {
			return fail(response.status, {
				error: payload?.error ?? 'Unable to cancel order.'
			});
		}

		return { success: 'Order cancelled successfully.' };
	}
};