import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { getAuthUser, unauthorizedResponse, forbiddenResponse } from '$lib/server/auth';
import { logEvent, SecurityEventType, SecurityEventOutcome } from '$lib/server/log';
import { randomUUID } from 'crypto';

const VALID_ROLES = ['admin', 'manager', 'user'];
const MAX_TASK_LENGTH = 200;

export const PUT: RequestHandler = async ({ request, params }) => {
  const actor = getAuthUser(request);
  if (!actor) return unauthorizedResponse();
  // AuthZ (3): admins and managers may update users
  if (actor.role !== 'admin' && actor.role !== 'manager') {
    await logEvent(SecurityEventType.AUTHZ_ACCESS, SecurityEventOutcome.DENIED, `Unauthorized user update attempt by ${actor.email}`, actor.id);
    return forbiddenResponse();
  }

  const body = await request.json().catch(() => null);
  const role: string | undefined = body?.role;
  const task: string | undefined = body?.task;
  const { id } = params;
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  const user = await db.user.findUnique({ where: { id } });
  if (!user) return json({ message: 'User not found.' }, { status: 404 });

  // AuthZ (3): managers may only manage regular users
  if (actor.role === 'manager' && user.role !== 'USER') {
    await logEvent(SecurityEventType.AUTHZ_ACCESS, SecurityEventOutcome.DENIED, `Manager ${actor.email} attempted to modify non-user ${user.email}`, actor.id, { ip });
    return forbiddenResponse();
  }

  const now = new Date();

  if (role !== undefined) {
    // AuthZ (3): only admins may change roles
    if (actor.role !== 'admin') {
      await logEvent(SecurityEventType.AUTHZ_ACCESS, SecurityEventOutcome.DENIED, `Non-admin ${actor.email} attempted role change`, actor.id, { ip });
      return forbiddenResponse();
    }
    if (!VALID_ROLES.includes(role)) {
      await logEvent(SecurityEventType.VALIDATION, SecurityEventOutcome.FAILURE, `Invalid role value: "${role}"`, actor.id, { ip });
      return json({ message: 'Invalid role.' }, { status: 400 });
    }
    await db.user.update({
      where: { id },
      data: { role: role.toUpperCase() as 'ADMIN' | 'MANAGER' | 'USER', updatedAt: now },
    });
    await logEvent(SecurityEventType.USER_MANAGEMENT, SecurityEventOutcome.SUCCESS, `Role for ${user.email} changed to "${role}" by ${actor.email}`, actor.id, { ip });
  }

  let assignedTask: string | undefined;

  if (typeof task === 'string') {
    if (task.length > MAX_TASK_LENGTH) {
      await logEvent(SecurityEventType.VALIDATION, SecurityEventOutcome.FAILURE, `Task exceeds max length (${task.length})`, actor.id, { ip });
      return json({ message: `Task must not exceed ${MAX_TASK_LENGTH} characters.` }, { status: 400 });
    }
    await db.task.create({
      data: {
        id: randomUUID(),
        title: task,
        ownerUserId: id,
        managerId: actor.id,
        status: 'OPEN',
        updatedAt: now,
      },
    });
    assignedTask = task;
    await logEvent(SecurityEventType.USER_MANAGEMENT, SecurityEventOutcome.SUCCESS, `Task "${task}" assigned to ${user.email} by ${actor.email}`, actor.id, { ip });
  } else {
    const currentTask = await db.task.findFirst({
      where: { ownerUserId: id, status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
      select: { title: true },
    });
    assignedTask = currentTask?.title;
  }

  const updatedUser = await db.user.findUnique({ where: { id } });
  return json({
    id: updatedUser!.id,
    name: updatedUser!.email.split('@')[0],
    email: updatedUser!.email,
    role: updatedUser!.role.toLowerCase() as 'admin' | 'manager' | 'user',
    task: assignedTask,
  });
};

export const DELETE: RequestHandler = async ({ request, params }) => {
  const actor = getAuthUser(request);
  if (!actor) return unauthorizedResponse();
  // AuthZ (3): only admins may delete users
  if (actor.role !== 'admin') {
    await logEvent(SecurityEventType.AUTHZ_ACCESS, SecurityEventOutcome.DENIED, `Non-admin delete attempt by ${actor.email}`, actor.id);
    return forbiddenResponse();
  }

  const { id } = params;
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  if (actor.id === id)
    return json({ message: 'You cannot delete your own account.' }, { status: 400 });

  const user = await db.user.findUnique({ where: { id } });
  if (!user) return json({ message: 'User not found.' }, { status: 404 });

  await db.user.delete({ where: { id } });
  await logEvent(SecurityEventType.USER_MANAGEMENT, SecurityEventOutcome.SUCCESS, `User "${user.email}" deleted by ${actor.email}`, actor.id, { ip });

  return json({ message: 'User deleted.' });
};
