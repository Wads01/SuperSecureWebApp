import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { UserRole } from '../../../generated/prisma/enums';

type MenuItem = {
	id: string;
	name: string;
	category: string;
	pricePesos: number;
	isAvailable: boolean;
};

type PageFetch = Parameters<PageServerLoad>[0]['fetch'];

async function loadMenuItems(fetch: PageFetch): Promise<MenuItem[]> {
	const response = await fetch('/api/menu');

	if (!response.ok) {
		return [];
	}

	const payload = (await response.json()) as { items?: MenuItem[] };
	return payload.items ?? [];
}

export const load: PageServerLoad = async ({ fetch, locals }) => {
	return {
		userRole: locals.user?.role,
		items: await loadMenuItems(fetch)
	};
};

export const actions: Actions = {
	createOrder: async ({ request, fetch, locals }) => {
		if (locals.user?.role !== UserRole.USER) {
			return fail(403, { error: 'Only Role B users can create orders from this page.' });
		}

		const formData = await request.formData();
		const notesInput = String(formData.get('notes') ?? '').trim();
		const notes = notesInput.length > 0 ? notesInput : undefined;

		const items: Array<{ menuItemId: string; quantity: number }> = [];

		for (const [key, value] of formData.entries()) {
			if (!key.startsWith('qty_')) {
				continue;
			}

			const menuItemId = key.replace('qty_', '');
			const quantity = Number(value);

			if (Number.isInteger(quantity) && quantity > 0) {
				items.push({ menuItemId, quantity });
			}
		}

		if (items.length === 0) {
			return fail(400, { error: 'Select at least one item with quantity 1 to 20.' });
		}

		const response = await fetch('/api/orders', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ notes, items })
		});

		const payload = (await response.json().catch(() => null)) as
			| { error?: string; order?: { id: string } }
			| null;

		if (!response.ok) {
			return fail(response.status, {
				error: payload?.error ?? 'Unable to create order. Please review your inputs.'
			});
		}

		return {
			success: 'Order created successfully.',
			createdOrderId: payload?.order?.id ?? null
		};
	}
};