import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;

async function deriveKey(password: string, salt: Buffer, keyLength: number): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => {
		scrypt(
			password,
			salt,
			keyLength,
			{ N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P },
			(error, derivedKey) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(derivedKey as Buffer);
			}
		);
	});
}

export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16);
	const derivedKey = await deriveKey(password, salt, KEY_LENGTH);

	return [
		'scrypt',
		SCRYPT_N.toString(),
		SCRYPT_R.toString(),
		SCRYPT_P.toString(),
		salt.toString('base64url'),
		derivedKey.toString('base64url')
	].join('$');
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	try {
		const parts = storedHash.split('$');
		if (parts.length !== 6 || parts[0] !== 'scrypt') {
			return false;
		}

		const [_, nValue, rValue, pValue, saltB64, keyB64] = parts;
		const salt = Buffer.from(saltB64, 'base64url');
		const expectedKey = Buffer.from(keyB64, 'base64url');

		if (
			Number(nValue) !== SCRYPT_N ||
			Number(rValue) !== SCRYPT_R ||
			Number(pValue) !== SCRYPT_P
		) {
			return false;
		}

		const calculatedKey = await deriveKey(password, salt, expectedKey.length);

		if (calculatedKey.length !== expectedKey.length) {
			return false;
		}

		return timingSafeEqual(calculatedKey, expectedKey);
	} catch {
		return false;
	}
}
