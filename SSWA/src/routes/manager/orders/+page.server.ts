import { fail } from '@sveltejs/kit';
import { OrderStatus } from '../../../../generated/prisma/enums';
import type { Actions, PageServerLoad } from './$types';

type ManagerOrder = {
	id: string;
	status: string;
	totalPesos: number;
	notes: string | null;
	scopeId: string | null;
	createdAt: string;
	user: {
		id: string;
		email: string;
	};
};

type ManagerOrdersPayload = {
	totalCount: number;
	page: number;
	pageSize: number;
	orders: ManagerOrder[];
	error?: string;
};

export const load: PageServerLoad = async ({ fetch, url }) => {
	const page = Number(url.searchParams.get('page') ?? '1');
	const pageSize = Number(url.searchParams.get('pageSize') ?? '20');

	const response = await fetch(`/api/manager/orders?page=${page}&pageSize=${pageSize}`);

	if (!response.ok) {
		const payload = (await response.json().catch(() => null)) as { error?: string } | null;

		return {
			error: payload?.error ?? 'Unable to load manager orders.',
			totalCount: 0,
			page,
			pageSize,
			orders: []
		};
	}

	const payload = (await response.json()) as ManagerOrdersPayload;

	return {
		error: null,
		totalCount: payload.totalCount,
		page: payload.page,
		pageSize: payload.pageSize,
		orders: payload.orders,
		statusOptions: Object.values(OrderStatus)
	};
};

export const actions: Actions = {
	setStatus: async ({ request, fetch }) => {
		const formData = await request.formData();
		const orderId = String(formData.get('orderId') ?? '');
		const nextStatus = String(formData.get('status') ?? '');

		if (!orderId || !nextStatus) {
			return fail(400, { error: 'orderId and status are required.' });
		}

		const response = await fetch(`/api/manager/orders/${orderId}/status`, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ status: nextStatus })
		});

		const payload = (await response.json().catch(() => null)) as { error?: string } | null;

		if (!response.ok) {
			return fail(response.status, {
				error: payload?.error ?? 'Unable to update order status.'
			});
		}

		return { success: 'Order status updated successfully.' };
	}
};