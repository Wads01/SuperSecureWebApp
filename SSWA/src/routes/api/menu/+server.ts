import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMenuItems } from '$lib/server/orders/service';

export const GET: RequestHandler = async () => {
	const menuItems = await getMenuItems();

	return json({
		items: menuItems.map((item) => ({
			...item,
			pricePesos: Number(item.pricePesos)
		}))
	});
};
