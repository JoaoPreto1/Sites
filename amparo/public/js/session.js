import { api, clearSession, saveSession, storedUser } from './api.js';

export const currentUser = () => storedUser();

export async function login(credentials) {
  const session = await api('/auth/login', { method: 'POST', body: credentials });
  saveSession(session);
  return session.user;
}

export async function register(data) {
  const session = await api('/auth/register', { method: 'POST', body: data });
  saveSession(session);
  return session.user;
}

export async function logout() {
  await api('/auth/logout', { method: 'POST' }).catch(() => {});
  clearSession();
  window.location.href = '/';
}

export const loginUrl = (next = window.location.pathname + window.location.search + window.location.hash) => `/entrar?next=${encodeURIComponent(next)}`;

// Garante que há sessão (renova o token se for preciso) ou manda para o login
export async function requireUser() {
  try {
    const { user } = await api('/auth/me', { auth: true });
    return user;
  } catch {
    clearSession();
    window.location.replace(loginUrl());
    return null;
  }
}

// Só aceita destinos dentro do próprio site
export function safeNext(fallback = '/conta') {
  const next = new URLSearchParams(window.location.search).get('next');
  return next && next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}
