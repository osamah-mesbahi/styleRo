// Note: This file is now deprecated in favor of Firebase/Firestore for data operations
// Kept for reference/backwards compatibility only

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';

export function apiUrl(path: string) {
  if (!path) return API_BASE;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function authFetch(input: RequestInfo, init?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('stylero_token') : null;
  const headers = new Headers(init && init.headers ? init.headers as HeadersInit : undefined);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init && init.headers && (init as any).headers['Content-Type']) headers.set('Content-Type', (init as any).headers['Content-Type']);
  const merged: RequestInit = { ...init, headers };
  return fetch(typeof input === 'string' ? apiUrl(input) : input, merged);
}

export async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const res = await authFetch(input, init);
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return text; }
}
