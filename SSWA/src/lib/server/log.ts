import { randomUUID } from 'crypto';
import { SecurityEventType, SecurityEventOutcome } from '../../../generated/prisma/enums';
import { db } from './db';

export { SecurityEventType, SecurityEventOutcome };

export async function logEvent(
  eventType: SecurityEventType,
  outcome: SecurityEventOutcome,
  message: string,
  actorUserId?: string | null,
  options?: { ip?: string | null; route?: string | null }
): Promise<void> {
  try {
    await db.securityLog.create({
      data: {
        id: randomUUID(),
        eventType,
        outcome,
        actorUserId: actorUserId ?? null,
        ip: options?.ip ?? null,
        route: options?.route ?? null,
        metadataJson: { message },
      },
    });
  } catch (err) {
    console.error('[logEvent] Failed to write security log:', err);
  }
}
