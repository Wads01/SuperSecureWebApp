import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';

export type Role = 'admin' | 'manager' | 'user';

export type AuthUser = {
  name: string;
  email: string;
  role: Role;
  token: string;
};

const STORAGE_KEY = 'sswa_auth';

function parseStoredAuth(value: string | null): AuthUser | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    return null;
  }
}

function createAuthStore() {
  const initial = browser ? parseStoredAuth(sessionStorage.getItem(STORAGE_KEY)) : null;
  const { subscribe, set: setStore } = writable<AuthUser | null>(initial);

  return {
    subscribe,
    set(value: AuthUser | null) {
      if (browser) {
        if (value) {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        } else {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      }
      setStore(value);
    },
    reset() {
      if (browser) {
        sessionStorage.removeItem(STORAGE_KEY);
      }
      setStore(null);
    },
    load() {
      if (!browser) return;
      setStore(parseStoredAuth(sessionStorage.getItem(STORAGE_KEY)));
    },
  };
}

export const auth = createAuthStore();
export const isAuthenticated = derived(auth, ($auth) => !!$auth);
export const isAdmin = derived(auth, ($auth) => $auth?.role === 'admin');
export const isManager = derived(auth, ($auth) => $auth?.role === 'manager');

export function loadAuthFromStorage() {
  auth.load();
}

export function saveAuth(user: AuthUser) {
  auth.set(user);
}

export function clearAuth() {
  auth.reset();
}

export function getAuthToken(): string {
  let token = '';
  auth.subscribe((value) => {
    token = value?.token ?? '';
  })();
  return token;
}
