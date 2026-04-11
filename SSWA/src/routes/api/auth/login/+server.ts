import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { verifyPassword, createToken } from '$lib/server/crypto';
import { logEvent, SecurityEventType, SecurityEventOutcome } from '$lib/server/log';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const GENERIC_FAILURE = 'Invalid username and/or password.';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  // Data Validation (1,3): reject missing / empty fields
  if (!email || !password) {
    await logEvent(SecurityEventType.VALIDATION, SecurityEventOutcome.FAILURE, 'Login attempt with missing credentials', null, { ip });
    return json({ message: 'Email and password are required.' }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email } });

  // Auth (4): generic failure — never reveal which field was wrong
  if (!user) {
    await logEvent(SecurityEventType.AUTH_LOGIN, SecurityEventOutcome.FAILURE, `Login attempt for unknown email: ${email}`, null, { ip });
    return json({ message: GENERIC_FAILURE }, { status: 401 });
  }

  // Auth (8): enforce lockout
  if (user.lockoutUntil !== null && user.lockoutUntil > new Date()) {
    await logEvent(SecurityEventType.AUTH_LOCKOUT, SecurityEventOutcome.FAILURE, `Login blocked — account locked: ${email}`, user.id, { ip });
    return json({ message: GENERIC_FAILURE }, { status: 401 });
  }

  // Auth (3): constant-time password verification against scrypt hash
  const valid = await verifyPassword(password, user.passwordHash);

  if (!valid) {
    const newCount = user.failedLoginCount + 1;
    const newLockout = newCount >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;

    await db.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: newCount,
        lastLoginFailureAt: new Date(),
        lockoutUntil: newLockout,
        updatedAt: new Date(),
      },
    });

    if (newCount >= MAX_FAILED_ATTEMPTS) {
      await logEvent(SecurityEventType.AUTH_LOCKOUT, SecurityEventOutcome.FAILURE, `Account locked after ${MAX_FAILED_ATTEMPTS} failed attempts: ${email}`, user.id, { ip });
    } else {
      await logEvent(SecurityEventType.AUTH_LOGIN, SecurityEventOutcome.FAILURE, `Invalid password for ${email} (attempt ${newCount}/${MAX_FAILED_ATTEMPTS})`, user.id, { ip });
    }

    // Auth (4) + EH&L (6): generic message, failure logged
    return json({ message: GENERIC_FAILURE }, { status: 401 });
  }

  // Successful authentication
  const previousSuccessfulLoginAt = user.lastLoginSuccessAt?.toISOString() ?? null;
  const previousFailedLoginAt = user.lastLoginFailureAt?.toISOString() ?? null;

  const now = new Date();
  await db.user.update({
    where: { id: user.id },
    data: {
      failedLoginCount: 0,
      lockoutUntil: null,
      lastLoginAt: now,
      lastLoginSuccessAt: now,
      updatedAt: now,
    },
  });

  const name = user.email.split('@')[0];
  const role = user.role.toLowerCase() as 'admin' | 'manager' | 'user';

  // Auth (3): HMAC-signed token — not forgeable without the server secret
  const token = createToken({ id: user.id, email: user.email, role, name });

  // EH&L (6): log successful authentication
  await logEvent(SecurityEventType.AUTH_LOGIN, SecurityEventOutcome.SUCCESS, `User signed in: ${email}`, user.id, { ip });

  return json({
    user: { name, email: user.email, role, token },
    // Auth (12): provide last-use timestamps for display at next login
    lastAccountUse: { previousSuccessfulLoginAt, previousFailedLoginAt },
  });
};
