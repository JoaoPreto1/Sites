import { api, clearSession, saveSession, storedUser } from './api.js';

export const currentUser = () => storedUser();

export const isAdmin = (user = currentUser()) => user?.role === 'admin';

export async function login(credentials) {
  const session = await api('/auth/login', { method: 'POST', body: credentials });
  saveSession(session);
  return session.user;
}

export async function logout() {
  await api('/auth/logout', { method: 'POST' }).catch(() => {});
  clearSession();
  window.location.href = '/';
}

export function loginUrl(next = window.location.pathname + window.location.search) {
  return `/entrar?next=${encodeURIComponent(next)}`;
}

// Garante que há sessão (renova o token se for preciso) ou manda para o login
export async function requireUser({ roles } = {}) {
  try {
    const { user } = await api('/auth/me', { auth: true });
    if (roles && !roles.includes(user.role)) {
      window.location.replace('/galerias');
      return null;
    }
    return user;
  } catch {
    clearSession();
    window.location.replace(loginUrl());
    return null;
  }
}
