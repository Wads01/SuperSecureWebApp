import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { getAuthUser, unauthorizedResponse, forbiddenResponse } from '$lib/server/auth';
import { logEvent, SecurityEventType, SecurityEventOutcome } from '$lib/server/log';
import { hashPassword } from '$lib/server/crypto';
import { randomUUID } from 'crypto';

const VALID_ROLES = ['admin', 'manager', 'user'];
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;
const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

function dbRoleToAppRole(role: string): 'admin' | 'manager' | 'user' {
  return role.toLowerCase() as 'admin' | 'manager' | 'user';
}

// AuthZ (1,3): admins and managers may list users; only admins may create
export const GET: RequestHandler = async ({ request }) => {
  const actor = getAuthUser(request);
  if (!actor) return unauthorizedResponse();
  if (actor.role !== 'admin' && actor.role !== 'manager') {
    await logEvent(SecurityEventType.AUTHZ_ACCESS, SecurityEventOutcome.DENIED, `Unauthorized user list attempt by ${actor.email}`, actor.id);
    return forbiddenResponse();
  }

  const usersWithTasks = await db.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      Task_Task_ownerUserIdToUser: {
        where: { status: 'OPEN' },
        select: { title: true },
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return json(usersWithTasks.map((u) => ({
    id: u.id,
    name: u.email.split('@')[0],
    email: u.email,
    role: dbRoleToAppRole(u.role),
    task: u.Task_Task_ownerUserIdToUser[0]?.title,
  })));
};

export const POST: RequestHandler = async ({ request }) => {
  const actor = getAuthUser(request);
  if (!actor) return unauthorizedResponse();
  // AuthZ (3): only admins may create users via this endpoint
  if (actor.role !== 'admin') {
    await logEvent(SecurityEventType.AUTHZ_ACCESS, SecurityEventOutcome.DENIED, `Non-admin user creation attempt by ${actor.email}`, actor.id);
    return forbiddenResponse();
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const role = typeof body?.role === 'string' ? body.role.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  if (!name || !email || !role || !password) {
    await logEvent(SecurityEventType.VALIDATION, SecurityEventOutcome.FAILURE, 'User creation with missing required fields', actor.id, { ip });
    return json({ message: 'All fields are required.' }, { status: 400 });
  }

  if (name.length > MAX_NAME_LENGTH)
    return json({ message: `Name must not exceed ${MAX_NAME_LENGTH} characters.` }, { status: 400 });
  if (email.length > MAX_EMAIL_LENGTH)
    return json({ message: `Email must not exceed ${MAX_EMAIL_LENGTH} characters.` }, { status: 400 });
  if (!VALID_ROLES.includes(role)) {
    await logEvent(SecurityEventType.VALIDATION, SecurityEventOutcome.FAILURE, `Invalid role value: "${role}"`, actor.id, { ip });
    return json({ message: 'Invalid role.' }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD_LENGTH)
    return json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.` }, { status: 400 });
  if (password.length > MAX_PASSWORD_LENGTH)
    return json({ message: `Password must not exceed ${MAX_PASSWORD_LENGTH} characters.` }, { status: 400 });
  if (!PASSWORD_POLICY.test(password)) {
    await logEvent(SecurityEventType.VALIDATION, SecurityEventOutcome.FAILURE, 'Password fails complexity policy for new user', actor.id, { ip });
    return json({ message: 'Password must include uppercase, lowercase, number, and special character.' }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return json({ message: 'Email already exists.' }, { status: 409 });

  const passwordHash = await hashPassword(password);
  const now = new Date();
  const newUser = await db.user.create({
    data: {
      id: randomUUID(),
      email,
      passwordHash,
      role: role.toUpperCase() as 'ADMIN' | 'MANAGER' | 'USER',
      updatedAt: now,
    },
  });

  await logEvent(SecurityEventType.USER_MANAGEMENT, SecurityEventOutcome.SUCCESS, `User "${name}" (${role}) created by ${actor.email}`, actor.id, { ip });

  return json({
    id: newUser.id,
    name: newUser.email.split('@')[0],
    email: newUser.email,
    role: dbRoleToAppRole(newUser.role),
  }, { status: 201 });
};
