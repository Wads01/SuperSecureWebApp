import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { items, logEvent, nextId } from '../mock-data';

export const GET: RequestHandler = async () => {
  return json(items);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { title, description } = body as { title?: string; description?: string };

  if (!title || !description) {
    return json({ message: 'Title and description are required.' }, { status: 400 });
  }

  const newItem = {
    id: nextId(),
    ownerId: '3',
    ownerName: 'Role B User',
    title,
    description,
    createdAt: new Date().toISOString(),
  };

  items.unshift(newItem);
  logEvent('info', `Item created: ${title}`, 'system');

  return json(newItem, { status: 201 });
};
