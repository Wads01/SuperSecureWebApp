import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { getAuthUser, unauthorizedResponse } from '$lib/server/auth';
import { logEvent, SecurityEventType, SecurityEventOutcome } from '$lib/server/log';
import { randomUUID } from 'crypto';

// Data Validation (2,3): field length bounds
const MAX_TITLE_LENGTH = 140;
const MAX_DESCRIPTION_LENGTH = 500;

function taskToItem(task: {
  id: string;
  title: string;
  description: string | null;
  ownerUserId: string;
  createdAt: Date;
  User_Task_ownerUserIdToUser: { email: string };
}) {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    ownerId: task.ownerUserId,
    ownerName: task.User_Task_ownerUserIdToUser.email.split('@')[0],
    createdAt: task.createdAt.toISOString(),
  };
}

// AuthZ (1): single auth check via shared getAuthUser — any authenticated user may read items
// Role B (user) only sees their own; managers and admins see all
export const GET: RequestHandler = async ({ request }) => {
  const user = getAuthUser(request);
  if (!user) return unauthorizedResponse();

  const where = user.role === 'user' ? { ownerUserId: user.id } : {};
  const tasks = await db.task.findMany({
    where,
    include: { User_Task_ownerUserIdToUser: true },
    orderBy: { createdAt: 'desc' },
  });

  return json(tasks.map(taskToItem));
};

export const POST: RequestHandler = async ({ request }) => {
  // AuthZ (1,2): validate token before doing any work — fails securely
  const user = getAuthUser(request);
  if (!user) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const description = typeof body?.description === 'string' ? body.description.trim() : '';
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  // Data Validation (1): reject — never sanitize
  if (!title || !description) {
    await logEvent(SecurityEventType.TASK_CRUD, SecurityEventOutcome.FAILURE, 'Item creation missing required fields', user.id, { ip });
    return json({ message: 'Title and description are required.' }, { status: 400 });
  }
  // Data Validation (2,3): range/length
  if (title.length > MAX_TITLE_LENGTH) {
    await logEvent(SecurityEventType.TASK_CRUD, SecurityEventOutcome.FAILURE, `Item title exceeds max length (${title.length})`, user.id, { ip });
    return json({ message: `Title must not exceed ${MAX_TITLE_LENGTH} characters.` }, { status: 400 });
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    await logEvent(SecurityEventType.TASK_CRUD, SecurityEventOutcome.FAILURE, `Item description exceeds max length (${description.length})`, user.id, { ip });
    return json({ message: `Description must not exceed ${MAX_DESCRIPTION_LENGTH} characters.` }, { status: 400 });
  }

  const now = new Date();
  const newTask = await db.task.create({
    data: {
      id: randomUUID(),
      title,
      description,
      ownerUserId: user.id,
      createdById: user.id,
      updatedAt: now,
    },
    include: { User_Task_ownerUserIdToUser: true },
  });

  await logEvent(SecurityEventType.TASK_CRUD, SecurityEventOutcome.SUCCESS, `Item created: "${title}"`, user.id, { ip });

  return json(taskToItem(newTask), { status: 201 });
};
