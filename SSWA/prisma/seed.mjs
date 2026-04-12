// @ts-check
/**
 * Seed script: creates default admin and manager accounts.
 * Run with: node prisma/seed.mjs
 *
 * Reads DATABASE_URL from SSWA/.env (or environment).
 * Uses the same scrypt parameters as src/lib/server/auth/password.ts.
 */

import { scrypt, randomBytes } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import pg from 'pg';

// ---------------------------------------------------------------------------
// Load .env
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');

if (existsSync(envPath)) {
	const raw = readFileSync(envPath, 'utf8');
	for (const line of raw.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const eq = trimmed.indexOf('=');
		if (eq === -1) continue;
		const key = trimmed.slice(0, eq).trim();
		const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
		if (!(key in process.env)) process.env[key] = val;
	}
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	console.error('❌  DATABASE_URL is not set. Add it to SSWA/.env');
	process.exit(1);
}

// ---------------------------------------------------------------------------
// Scrypt helpers — identical params to password.ts
// ---------------------------------------------------------------------------
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;

function deriveKey(password, salt) {
	return new Promise((resolve, reject) => {
		scrypt(password, salt, KEY_LENGTH, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P }, (err, key) => {
			if (err) reject(err);
			else resolve(key);
		});
	});
}

async function hashPassword(password) {
	const salt = randomBytes(16);
	const derived = await deriveKey(password, salt);
	return ['scrypt', SCRYPT_N, SCRYPT_R, SCRYPT_P, salt.toString('base64url'), derived.toString('base64url')].join('$');
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
const SEED_USERS = [
	{
		email: 'admin@sswa.dev',
		password: 'Admin@sswa2024!',
		role: 'ADMIN',
	},
	{
		email: 'manager@sswa.dev',
		password: 'Manager@sswa2024!',
		role: 'MANAGER',
	},
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const client = new pg.Client({ connectionString: DATABASE_URL });
await client.connect();

try {
	for (const seed of SEED_USERS) {
		const exists = await client.query('SELECT id FROM "User" WHERE email = $1', [seed.email]);
		if (exists.rows.length > 0) {
			console.log(`⏭  ${seed.email} already exists — skipping`);
			continue;
		}

		const hash = await hashPassword(seed.password);
		await client.query(
			`INSERT INTO "User" (id, email, role, status, "passwordHash", "failedLoginCount", "passwordChangedAt", "createdAt", "updatedAt")
			 VALUES (gen_random_uuid(), $1, $2, 'ACTIVE', $3, 0, now(), now(), now())`,
			[seed.email, seed.role, hash]
		);
		console.log(`✅  Created ${seed.role.toLowerCase()} → ${seed.email}  /  ${seed.password}`);
	}
} finally {
	await client.end();
}
