import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { getAuthUser, unauthorizedResponse, forbiddenResponse } from '$lib/server/auth';
import { logEvent, SecurityEventType, SecurityEventOutcome } from '$lib/server/log';

const MAX_TITLE_LENGTH = 140;
const MAX_DESCRIPTION_LENGTH = 500;

export const PUT: RequestHandler = async ({ request, params }) => {
  const user = getAuthUser(request);
  if (!user) return unauthorizedResponse();

  const { id } = params;
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  const task = await db.task.findUnique({ where: { id } });
  if (!task) return json({ message: 'Item not found.' }, { status: 404 });

  // AuthZ (3): Role B users may only modify their own items
  if (user.role === 'user' && task.ownerUserId !== user.id) {
    await logEvent(SecurityEventType.AUTHZ_ACCESS, SecurityEventOutcome.DENIED, `Access denied: user ${user.email} attempted to update item ${id}`, user.id, { ip });
    return forbiddenResponse();
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const description = typeof body?.description === 'string' ? body.description.trim() : '';

  if (!title || !description) {
    await logEvent(SecurityEventType.TASK_CRUD, SecurityEventOutcome.FAILURE, `Item update missing required fields for item ${id}`, user.id, { ip });
    return json({ message: 'Title and description are required.' }, { status: 400 });
  }
  if (title.length > MAX_TITLE_LENGTH) {
    await logEvent(SecurityEventType.TASK_CRUD, SecurityEventOutcome.FAILURE, `Item title exceeds max length (${title.length})`, user.id, { ip });
    return json({ message: `Title must not exceed ${MAX_TITLE_LENGTH} characters.` }, { status: 400 });
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    await logEvent(SecurityEventType.TASK_CRUD, SecurityEventOutcome.FAILURE, `Item description exceeds max length (${description.length})`, user.id, { ip });
    return json({ message: `Description must not exceed ${MAX_DESCRIPTION_LENGTH} characters.` }, { status: 400 });
  }

  const updated = await db.task.update({
    where: { id },
    data: { title, description, updatedAt: new Date(), updatedById: user.id },
    include: { User_Task_ownerUserIdToUser: true },
  });

  await logEvent(SecurityEventType.TASK_CRUD, SecurityEventOutcome.SUCCESS, `Item ${id} updated by ${user.email}`, user.id, { ip });

  return json({
    id: updated.id,
    title: updated.title,
    description: updated.description ?? '',
    ownerId: updated.ownerUserId,
    ownerName: updated.User_Task_ownerUserIdToUser.email.split('@')[0],
    createdAt: updated.createdAt.toISOString(),
  });
};

export const DELETE: RequestHandler = async ({ request, params }) => {
  const user = getAuthUser(request);
  if (!user) return unauthorizedResponse();

  const { id } = params;
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  const task = await db.task.findUnique({ where: { id } });
  if (!task) return json({ message: 'Item not found.' }, { status: 404 });

  // AuthZ (3): Role B users may only delete their own items
  if (user.role === 'user' && task.ownerUserId !== user.id) {
    await logEvent(SecurityEventType.AUTHZ_ACCESS, SecurityEventOutcome.DENIED, `Access denied: user ${user.email} attempted to delete item ${id}`, user.id, { ip });
    return forbiddenResponse();
  }

  await db.task.delete({ where: { id } });
  await logEvent(SecurityEventType.TASK_CRUD, SecurityEventOutcome.SUCCESS, `Item ${id} deleted by ${user.email}`, user.id, { ip });

  return json({ message: 'Item deleted.' });
};
