import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { logEvent, nextId, users } from '../../mock-data';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password.trim() : '';

  if (!name || !email || !password) {
    return json({ message: 'Name, email, and password are required.' }, { status: 400 });
  }

  if (users.some((record) => record.email.toLowerCase() === email)) {
    return json({ message: 'Email already exists. Please choose another address.' }, { status: 409 });
  }

  const newUser = {
    id: nextId(),
    name,
    email,
    password,
    role: 'user' as const,
  };

  users.push(newUser);
  logEvent('info', `New Role B user created: ${name}`, email);

  return json({ message: 'Registration successful.' }, { status: 201 });
};
