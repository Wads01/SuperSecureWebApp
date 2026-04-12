import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { assertAllowedPath } from '$lib/server/authorization/policy';

type MenuItem = {
	id: string;
	name: string;
	category: string;
	pricePesos: number;
	isAvailable: boolean;
};

export const load: PageServerLoad = async ({ locals, url, fetch }) => {
	assertAllowedPath(url.pathname, locals.user);

	const response = await fetch('/api/menu');
	if (!response.ok) {
		return { items: [] };
	}

	const payload = (await response.json()) as { items?: MenuItem[] };

	return { items: payload.items ?? [] };
};

export const actions: Actions = {
	setPrice: async ({ request, fetch, locals, url }) => {
		assertAllowedPath(url.pathname, locals.user);

		const formData = await request.formData();
		const menuItemId = String(formData.get('menuItemId') ?? '');
		const pricePesos = Number(formData.get('pricePesos'));

		if (!menuItemId || Number.isNaN(pricePesos)) {
			return fail(400, { error: 'menuItemId and valid pricePesos are required.' });
		}

		const response = await fetch(`/api/admin/menu/${menuItemId}/price`, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ pricePesos })
		});

		const payload = (await response.json().catch(() => null)) as { error?: string } | null;

		if (!response.ok) {
			return fail(response.status, {
				error: payload?.error ?? 'Unable to update menu price.'
			});
		}

		return { success: 'Menu price updated successfully.' };
	}
};