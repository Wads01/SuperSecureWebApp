import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { logEvent, users } from '../../mock-data';

export const PUT: RequestHandler = async ({ request, params }) => {
  const body = await request.json();
  const { role, task } = body as { role?: string; task?: string };
  const id = params.id;
  const user = users.find((record) => record.id === id);

  if (!user) {
    return json({ message: 'User not found.' }, { status: 404 });
  }

  if (role) {
    if (!['admin', 'manager', 'user'].includes(role)) {
      return json({ message: 'Invalid role.' }, { status: 400 });
    }
    user.role = role as 'admin' | 'manager' | 'user';
    logEvent('info', `Role changed for ${user.name} to ${user.role}.`, 'system');
  }

  if (typeof task === 'string') {
    user.task = task;
    logEvent('info', `Task assigned to ${user.name}.`, 'system');
  }

  return json({ id: user.id, name: user.name, email: user.email, role: user.role, task: user.task });
};

export const DELETE: RequestHandler = async ({ params }) => {
  const id = params.id;
  const index = users.findIndex((record) => record.id === id);

  if (index === -1) {
    return json({ message: 'User not found.' }, { status: 404 });
  }

  const [deleted] = users.splice(index, 1);
  logEvent('warning', `User ${deleted.name} deleted.`, 'system');

  return json({ message: 'User deleted.' });
};
