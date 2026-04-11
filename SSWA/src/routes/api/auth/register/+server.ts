import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { hashPassword } from '$lib/server/crypto';
import { logEvent, SecurityEventType, SecurityEventOutcome } from '$lib/server/log';
import { randomUUID } from 'crypto';

// Auth (5,6): password policy constants
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;
const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

// Data Validation (2,3): field length bounds
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  // Data Validation (1): reject missing fields
  if (!name || !email || !password) {
    await logEvent(SecurityEventType.VALIDATION, SecurityEventOutcome.FAILURE, 'Registration with missing required fields', null, { ip });
    return json({ message: 'Name, email, and password are required.' }, { status: 400 });
  }

  // Data Validation (2,3): range and length checks — reject, never sanitize
  if (name.length > MAX_NAME_LENGTH) {
    await logEvent(SecurityEventType.VALIDATION, SecurityEventOutcome.FAILURE, `Name exceeds max length (${name.length})`, null, { ip });
    return json({ message: `Name must not exceed ${MAX_NAME_LENGTH} characters.` }, { status: 400 });
  }
  if (email.length > MAX_EMAIL_LENGTH) {
    await logEvent(SecurityEventType.VALIDATION, SecurityEventOutcome.FAILURE, 'Email exceeds max length', null, { ip });
    return json({ message: `Email must not exceed ${MAX_EMAIL_LENGTH} characters.` }, { status: 400 });
  }

  // Auth (6): minimum password length
  if (password.length < MIN_PASSWORD_LENGTH) {
    await logEvent(SecurityEventType.VALIDATION, SecurityEventOutcome.FAILURE, `Password too short (${password.length} chars)`, null, { ip });
    return json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.` }, { status: 400 });
  }
  // Data Validation (2): maximum password length
  if (password.length > MAX_PASSWORD_LENGTH) {
    await logEvent(SecurityEventType.VALIDATION, SecurityEventOutcome.FAILURE, 'Password exceeds max length', null, { ip });
    return json({ message: `Password must not exceed ${MAX_PASSWORD_LENGTH} characters.` }, { status: 400 });
  }
  // Auth (5): complexity — uppercase, lowercase, digit, special char
  if (!PASSWORD_POLICY.test(password)) {
    await logEvent(SecurityEventType.VALIDATION, SecurityEventOutcome.FAILURE, 'Password fails complexity policy', null, { ip });
    return json({
      message: 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.'
    }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return json({ message: 'Email already exists. Please choose another address.' }, { status: 409 });
  }

  // Auth (3): hash with scrypt before storing — never store plaintext
  const passwordHash = await hashPassword(password);
  const now = new Date();

  const newUser = await db.user.create({
    data: {
      id: randomUUID(),
      email,
      passwordHash,
      role: 'USER',
      updatedAt: now,
    },
  });

  await logEvent(SecurityEventType.AUTH_REGISTER, SecurityEventOutcome.SUCCESS, `New user registered: ${email}`, newUser.id, { ip });

  return json({ message: 'Registration successful.' }, { status: 201 });
};
