import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { getAuthUser, unauthorizedResponse, forbiddenResponse } from '$lib/server/auth';

function outcomeToLevel(outcome: string): 'info' | 'warning' | 'error' {
  if (outcome === 'SUCCESS') return 'info';
  if (outcome === 'DENIED') return 'error';
  return 'warning';
}

// EH&L (4): restrict log access to administrators only
export const GET: RequestHandler = async ({ request }) => {
  const user = getAuthUser(request);
  if (!user) return unauthorizedResponse();
  if (user.role !== 'admin') return forbiddenResponse();

  const url = new URL(request.url);
  const filter = url.searchParams.get('filter')?.toLowerCase() ?? '';

  const logs = await db.securityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
    include: { User: { select: { email: true } } },
  });

  const mapped = logs.map((entry) => ({
    id: entry.id,
    level: outcomeToLevel(entry.outcome),
    eventType: entry.eventType,
    message: (entry.metadataJson as { message?: string } | null)?.message ?? entry.eventType,
    user: entry.User?.email ?? 'anonymous',
    ip: entry.ip ?? undefined,
    createdAt: entry.createdAt.toISOString(),
  }));

  const filtered = filter
    ? mapped.filter(
        (e) =>
          e.message.toLowerCase().includes(filter) ||
          e.user.toLowerCase().includes(filter) ||
          e.level.toLowerCase().includes(filter) ||
          e.eventType.toLowerCase().includes(filter)
      )
    : mapped;

  return json(filtered);
};
