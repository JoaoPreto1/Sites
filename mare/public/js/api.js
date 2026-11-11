const TOKEN_KEY = 'mare.token';
const USER_KEY = 'mare.user';

const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value);
    } catch {}
  },
};

export class ApiError extends Error {
  constructor(message, status, details = []) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function saveSession({ accessToken, user }) {
  storage.set(TOKEN_KEY, accessToken);
  storage.set(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  storage.set(TOKEN_KEY, null);
  storage.set(USER_KEY, null);
}

export function storedUser() {
  try {
    return JSON.parse(storage.get(USER_KEY));
  } catch {
    return null;
  }
}

let refreshing = null;

// Vários pedidos podem falhar ao mesmo tempo com o token expirado:
// todos esperam pelo mesmo refresh em vez de fazerem um cada.
function refreshSession() {
  refreshing ??= fetch('/api/auth/refresh', { method: 'POST', credentials: 'same-origin' })
    .then(async (res) => {
      if (!res.ok) throw new Error('refresh falhou');
      saveSession(await res.json());
      return true;
    })
    .catch(() => {
      clearSession();
      return false;
    })
    .finally(() => {
      refreshing = null;
    });

  return refreshing;
}

async function send(path, { method, body, auth }) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = storage.get(TOKEN_KEY);
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  return fetch(`/api${path}`, {
    method,
    headers,
    credentials: 'same-origin',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function api(path, { method = 'GET', body, auth = false } = {}) {
  let res = await send(path, { method, body, auth });

  if (res.status === 401 && auth && (await refreshSession())) {
    res = await send(path, { method, body, auth });
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? 'Algo correu mal. Tente outra vez.', res.status, data.details);
  return data;
}
