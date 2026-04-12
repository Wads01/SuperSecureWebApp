import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { encodeToken, logEvent, users } from '../../mock-data';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { email, password } = body as { email?: string; password?: string };
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const normalizedPassword = typeof password === 'string' ? password.trim() : '';

  if (!normalizedEmail || !normalizedPassword) {
    return json({ message: 'Email and password are required.' }, { status: 400 });
  }

  const user = users.find((record) => record.email.toLowerCase() === normalizedEmail);

  if (!user || user.password !== normalizedPassword) {
    return json({ message: 'Invalid email or password.' }, { status: 401 });
  }

  logEvent('info', `${user.name} signed in.`, user.email);

  return json({
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      token: encodeToken({ email: user.email, role: user.role, name: user.name }),
    },
  });
};
