import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { auth, getAuthToken, type AuthUser, type Role } from '$lib/context/auth';

type ApiResponse<T> = T;

async function apiFetch<T>(path: string, options: RequestInit = {}) {
  if (!browser) {
    throw new Error('API requests must be made from the browser');
  }

  const token = getAuthToken();
  const headers = new Headers(options.headers ?? {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message ?? 'Server error';
    throw new Error(message);
  }

  return payload as ApiResponse<T>;
}

export interface ItemPayload {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
}

export interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: Role;
  task?: string;
}

export interface LogPayload {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  user: string;
  createdAt: string;
}

export async function login(email: string, password: string) {
  return apiFetch<{ user: AuthUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(name: string, email: string, password: string) {
  return apiFetch<{ message: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function fetchItems() {
  return apiFetch<ItemPayload[]>('/api/items');
}

export async function createItem(title: string, description: string) {
  return apiFetch<ItemPayload>('/api/items', {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  });
}

export async function updateItem(id: string, title: string, description: string) {
  return apiFetch<ItemPayload>(`/api/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, description }),
  });
}

export async function deleteItem(id: string) {
  return apiFetch<{ message: string }>(`/api/items/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchUsers() {
  return apiFetch<UserPayload[]>('/api/users');
}

export async function createUser(name: string, email: string, role: Role, password: string) {
  return apiFetch<UserPayload>('/api/users', {
    method: 'POST',
    body: JSON.stringify({ name, email, role, password }),
  });
}

export async function updateUserRole(id: string, role: Role) {
  return apiFetch<UserPayload>(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export async function deleteUser(id: string) {
  return apiFetch<{ message: string }>(`/api/users/${id}`, {
    method: 'DELETE',
  });
}

export async function assignTask(id: string, task: string) {
  return apiFetch<UserPayload>(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ task }),
  });
}

export async function fetchLogs(filter = '') {
  const query = filter ? `?filter=${encodeURIComponent(filter)}` : '';
  return apiFetch<LogPayload[]>(`/api/logs${query}`);
}
