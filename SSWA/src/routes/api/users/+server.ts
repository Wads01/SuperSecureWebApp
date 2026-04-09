import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { logEvent, nextId, users } from '../mock-data';

export const GET: RequestHandler = async () => {
  return json(users.map((user) => ({ id: user.id, name: user.name, email: user.email, role: user.role, task: user.task })));
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { name, email, role, password } = body as { name?: string; email?: string; role?: string; password?: string };

  if (!name || !email || !role || !password) {
    return json({ message: 'All fields are required.' }, { status: 400 });
  }

  if (!['admin', 'manager', 'user'].includes(role)) {
    return json({ message: 'Invalid role.' }, { status: 400 });
  }

  if (users.some((record) => record.email.toLowerCase() === email.toLowerCase())) {
    return json({ message: 'Email already exists.' }, { status: 409 });
  }

  const newUser = {
    id: nextId(),
    name,
    email,
    password,
    role: role as 'admin' | 'manager' | 'user',
  };

  users.push(newUser);
  logEvent('info', `User ${name} created.`, email);

  return json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }, { status: 201 });
};
