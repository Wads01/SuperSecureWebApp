import { json } from '@sveltejs/kit';
import { verifyToken, type TokenPayload } from './crypto';

export type AuthUser = TokenPayload & { iat: number };

/**
 * Extracts and validates the Bearer token from the Authorization header.
 * Returns null if missing or invalid — callers MUST check the return value.
 */
export function getAuthUser(request: Request): AuthUser | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.slice(7));
}

/** 401 – no valid credential supplied */
export const unauthorizedResponse = () =>
  json({ message: 'Unauthorized.' }, { status: 401 });

/** 403 – credential is valid but role is insufficient */
export const forbiddenResponse = () =>
  json({ message: 'Access denied.' }, { status: 403 });
