export type Role = 'admin' | 'manager' | 'user';

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  task?: string;
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
  message: string;
  user: string;
  createdAt: string;
};

export const users: UserRecord[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin123!',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Manager User',
    email: 'manager@example.com',
    password: 'Manager123!',
    role: 'manager',
  },
  {
    id: '3',
    name: 'Role B User',
    email: 'user@example.com',
    password: 'User123!',
    role: 'user',
    task: 'Review your daily items',
  },
];

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
    message: 'System initialized with demo accounts.',
    user: 'system',
    createdAt: new Date().toISOString(),
  },
];

let nextIdNumber = 260;

export function nextId() {
  nextIdNumber += 1;
  return nextIdNumber.toString();
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
