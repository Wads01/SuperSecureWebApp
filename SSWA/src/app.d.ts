// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { UserRole, UserStatus } from '../generated/prisma/enums';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				id: string;
				email: string;
				role: UserRole;
				status: UserStatus;
				scopeId: string | null;
			} | null;
			session: {
				id: string;
				expiresAt: Date;
			} | null;
		}
		interface PageData {
			user?: App.Locals['user'];
			lastAccountUse?: {
				previousSuccessfulLoginAt: string | null;
				previousFailedLoginAt: string | null;
			} | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
