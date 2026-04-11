import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { getAuthUser, unauthorizedResponse } from '$lib/server/auth';
import { verifyPassword, hashPassword } from '$lib/server/crypto';
import { logEvent, SecurityEventType, SecurityEventOutcome } from '$lib/server/log';
import { randomUUID } from 'crypto';

const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;
const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
const PASSWORD_HISTORY_DEPTH = 10;
// Auth (11): password must be at least 1 day old before it can be changed
const MIN_PASSWORD_AGE_MS = 24 * 60 * 60 * 1000;

export const POST: RequestHandler = async ({ request }) => {
  // Auth (13): user must be authenticated to change password
  const actor = getAuthUser(request);
  if (!actor) return unauthorizedResponse();

  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const body = await request.json().catch(() => null);
  const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';
  const confirmPassword = typeof body?.confirmPassword === 'string' ? body.confirmPassword : '';

  if (!currentPassword || !newPassword || !confirmPassword) {
    await logEvent(SecurityEventType.VALIDATION, SecurityEventOutcome.FAILURE, 'Password change with missing fields', actor.id, { ip });
    return json({ message: 'All fields are required.' }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return json({ message: 'New passwords do not match.' }, { status: 400 });
  }

  // Data Validation (3): length
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    await logEvent(SecurityEventType.VALIDATION, SecurityEventOutcome.FAILURE, 'Password change: new password too short', actor.id, { ip });
    return json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }, { status: 400 });
  }
  if (newPassword.length > MAX_PASSWORD_LENGTH) {
    return json({ message: `Password must not exceed ${MAX_PASSWORD_LENGTH} characters.` }, { status: 400 });
  }

  // Data Validation (1,2): complexity policy
  if (!PASSWORD_POLICY.test(newPassword)) {
    await logEvent(SecurityEventType.VALIDATION, SecurityEventOutcome.FAILURE, 'Password change: new password fails complexity policy', actor.id, { ip });
    return json({ message: 'Password must include uppercase, lowercase, number, and special character.' }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: actor.id },
    select: {
      id: true,
      passwordHash: true,
      passwordChangedAt: true,
      PasswordHistory: {
        orderBy: { createdAt: 'desc' },
        take: PASSWORD_HISTORY_DEPTH,
        select: { passwordHash: true },
      },
    },
  });

  if (!user) return json({ message: 'User not found.' }, { status: 404 });

  // Auth (13): re-authenticate — verify current password before allowing change
  const currentValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!currentValid) {
    await logEvent(SecurityEventType.AUTH_REAUTH, SecurityEventOutcome.FAILURE, `Password change re-auth failed for ${actor.email}`, actor.id, { ip });
    return json({ message: 'Current password is incorrect.' }, { status: 401 });
  }

  // Auth (11): enforce minimum password age (1 day)
  if (user.passwordChangedAt) {
    const ageMs = Date.now() - user.passwordChangedAt.getTime();
    if (ageMs < MIN_PASSWORD_AGE_MS) {
      await logEvent(SecurityEventType.VALIDATION, SecurityEventOutcome.FAILURE, `Password change too soon for ${actor.email}`, actor.id, { ip });
      return json({ message: 'Password must be at least one day old before it can be changed.' }, { status: 400 });
    }
  }

  // Auth (10): prevent re-use — check against stored history
  for (const entry of user.PasswordHistory) {
    if (await verifyPassword(newPassword, entry.passwordHash)) {
      await logEvent(SecurityEventType.VALIDATION, SecurityEventOutcome.FAILURE, `Password re-use detected for ${actor.email}`, actor.id, { ip });
      return json({ message: 'You cannot re-use a recent password.' }, { status: 400 });
    }
  }

  const newHash = await hashPassword(newPassword);
  const now = new Date();

  await db.$transaction([
    // Save old hash to history before overwriting
    db.passwordHistory.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        passwordHash: user.passwordHash,
        createdAt: now,
      },
    }),
    db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        passwordChangedAt: now,
        updatedAt: now,
      },
    }),
  ]);

  await logEvent(SecurityEventType.AUTH_PASSWORD_CHANGE, SecurityEventOutcome.SUCCESS, `Password changed for ${actor.email}`, actor.id, { ip });

  return json({ message: 'Password changed successfully.' });
};
