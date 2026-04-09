import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { logs } from '../mock-data';

export const GET: RequestHandler = async ({ request }) => {
  const url = new URL(request.url);
  const filter = url.searchParams.get('filter')?.toLowerCase() ?? '';

  const filtered = filter
    ? logs.filter((entry) => entry.message.toLowerCase().includes(filter) || entry.user.toLowerCase().includes(filter) || entry.level.toLowerCase().includes(filter))
    : logs;

  return json(filtered);
};
