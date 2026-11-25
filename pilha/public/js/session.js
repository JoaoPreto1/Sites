import { api, clearSession, saveSession, storedUser } from './api.js';

export const currentUser = () => storedUser();

export const homeFor = (user) => (user?.role === 'estudio' ? '/painel' : '/cliente');

export async function login(credentials) {
  const session = await api('/auth/login', { method: 'POST', body: credentials });
  saveSession(session);
  return session.user;
}

export async function logout() {
  await api('/auth/logout', { method: 'POST' }).catch(() => {});
  clearSession();
  window.location.href = '/entrar';
}

export const loginUrl = (next = window.location.pathname + window.location.hash) => `/entrar?next=${encodeURIComponent(next)}`;

// Garante que há sessão com o perfil certo (renova o token se for preciso) ou manda para o login
export async function requireRole(role) {
  try {
    const { user } = await api('/auth/me', { auth: true });
    if (user.role !== role) {
      window.location.replace(homeFor(user));
      return null;
    }
    return user;
  } catch {
    clearSession();
    window.location.replace(loginUrl());
    return null;
  }
}

// Só aceita destinos dentro do próprio site
export function safeNext(fallback) {
  const next = new URLSearchParams(window.location.search).get('next');
  return next && next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}
