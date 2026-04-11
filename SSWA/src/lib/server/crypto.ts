import { randomBytes, scrypt, timingSafeEqual, createHmac } from 'crypto';
import { promisify } from 'util';
import { env } from '$env/dynamic/private';

const scryptAsync = promisify(scrypt);

// In production this must be a long random secret from an environment variable.
const TOKEN_SECRET = env.TOKEN_SECRET ?? 'sswa-dev-secret-change-this-in-production';

// ---------------------------------------------------------------------------
// Password hashing (scrypt + random salt)
// ---------------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt.toString('hex')}:${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const [saltHex, keyHex] = hash.split(':');
    if (!saltHex || !keyHex) return false;
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(keyHex, 'hex');
    const derived = (await scryptAsync(password, salt, 64)) as Buffer;
    if (derived.length !== expected.length) return false;
    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Signed session tokens (HMAC-SHA256)
// ---------------------------------------------------------------------------

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export function createToken(payload: TokenPayload): string {
  const data = JSON.stringify({ ...payload, iat: Date.now() });
  const encoded = Buffer.from(data).toString('base64url');
  const sig = createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyToken(token: string): (TokenPayload & { iat: number }) | null {
  try {
    const dotIndex = token.lastIndexOf('.');
    if (dotIndex === -1) return null;
    const encoded = token.slice(0, dotIndex);
    const sig = token.slice(dotIndex + 1);
    const expectedSig = createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
    const sigBuf = Buffer.from(sig, 'base64url');
    const expectedBuf = Buffer.from(expectedSig, 'base64url');
    // Constant-time comparison to prevent timing attacks on the signature
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null;
    return JSON.parse(Buffer.from(encoded, 'base64url').toString()) as TokenPayload & { iat: number };
  } catch {
    return null;
  }
}
