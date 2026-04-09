import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { items, logEvent } from '../../mock-data';

export const PUT: RequestHandler = async ({ request, params }) => {
  const id = params.id;
  const item = items.find((entry) => entry.id === id);

  if (!item) {
    return json({ message: 'Item not found.' }, { status: 404 });
  }

  const body = await request.json();
  const { title, description } = body as { title?: string; description?: string };

  if (!title || !description) {
    return json({ message: 'Title and description are required.' }, { status: 400 });
  }

  item.title = title;
  item.description = description;
  logEvent('info', `Item ${item.id} updated.`, 'system');

  return json(item);
};

export const DELETE: RequestHandler = async ({ params }) => {
  const id = params.id;
  const index = items.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return json({ message: 'Item not found.' }, { status: 404 });
  }

  const [deleted] = items.splice(index, 1);
  logEvent('info', `Item ${deleted.id} deleted.`, 'system');

  return json({ message: 'Item deleted.' });
};
