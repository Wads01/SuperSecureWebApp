import { hashPassword } from '$lib/server/crypto';

export type Role = 'admin' | 'manager' | 'user';

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  task?: string;
  // Lockout tracking (Auth 8)
  failedLoginCount: number;
  lockedUntil: number | null; // epoch ms
  // Last-use reporting (Auth 12)
  lastLoginSuccess: string | null; // ISO date
  lastLoginFailure: string | null; // ISO date
};

export type ItemRecord = {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  description: string;
  createdAt: string;
};

export type LogEntry = {
  id: string;
  level: 'info' | 'warning' | 'error';
  eventType: string;
  message: string;
  user: string;
  ip?: string;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Demo seed data — passwords are hashed at startup by initializeData()
// ---------------------------------------------------------------------------

const _rawUsers: Array<{ id: string; name: string; email: string; _pw: string; role: Role; task?: string }> = [
  { id: '1', name: 'Admin User',   email: 'admin@example.com',   _pw: 'Admin123!@#',   role: 'admin' },
  { id: '2', name: 'Manager User', email: 'manager@example.com', _pw: 'Manager123!@#', role: 'manager' },
  { id: '3', name: 'Role B User',  email: 'user@example.com',    _pw: 'User1234!@#',   role: 'user', task: 'Review your daily items' },
];

export const users: UserRecord[] = _rawUsers.map((u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  passwordHash: '', // filled by initializeData() at server startup
  role: u.role,
  task: u.task,
  failedLoginCount: 0,
  lockedUntil: null,
  lastLoginSuccess: null,
  lastLoginFailure: null,
}));

export const items: ItemRecord[] = [
  {
    id: '101',
    ownerId: '3',
    ownerName: 'Role B User',
    title: 'Welcome note',
    description: 'This is your first secure item in the dashboard.',
    createdAt: new Date().toISOString(),
  },
];

export const logs: LogEntry[] = [
  {
    id: '201',
    level: 'info',
    eventType: 'SYSTEM',
    message: 'System initialized.',
    user: 'system',
    createdAt: new Date().toISOString(),
  },
];

let nextIdNumber = 260;

export function nextId() {
  nextIdNumber += 1;
  return nextIdNumber.toString();
}

/**
 * Write a structured security log entry.
 * Kept to 500 entries to prevent unbounded memory growth.
 */
export function logEvent(
  level: LogEntry['level'],
  eventType: string,
  message: string,
  user: string,
  ip?: string
) {
  logs.unshift({
    id: nextId(),
    level,
    eventType,
    message,
    user,
    ip,
    createdAt: new Date().toISOString(),
  });
  if (logs.length > 500) logs.splice(500);
}

/**
 * Hash the demo-account passwords at server startup.
 * Called once from hooks.server.ts `init`.
 */
export async function initializeData(): Promise<void> {
  await Promise.all(
    _rawUsers.map(async (raw, i) => {
      users[i].passwordHash = await hashPassword(raw._pw);
    })
  );
}

export function encodeToken(payload: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64');
}

export function decodeToken(token: string) {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString('utf-8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function authorizeToken(header: string | null) {
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  const payload = decodeToken(token);
  if (!payload || typeof payload.email !== 'string') return null;
  return users.find((user) => user.email === payload.email) || null;
}

export function logEvent(level: 'info' | 'warning' | 'error', message: string, user: string) {
  logs.unshift({
    id: nextId(),
    level,
    message,
    user,
    createdAt: new Date().toISOString(),
  });

  if (logs.length > 80) {
    logs.splice(80);
  }
}
