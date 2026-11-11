import { env } from '../config/env.js';
import { users } from '../repositories/index.js';
import * as auth from '../services/auth.service.js';
import { HttpError } from '../utils/httpError.js';

const REFRESH_COOKIE = 'mare_refresh';

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: env.isProduction,
  path: '/api/auth',
  maxAge: env.jwt.refreshDays * 24 * 60 * 60 * 1000,
});

async function sendSession(res, user, status = 200) {
  const refreshToken = await auth.issueRefreshToken(user.id);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());
  res.status(status).json({ user, accessToken: auth.signAccessToken(user) });
}

export async function register(req, res) {
  const user = await auth.register(req.valid.body);
  await sendSession(res, user, 201);
}

export async function login(req, res) {
  const user = await auth.login(req.valid.body);
  await sendSession(res, user);
}

export async function refresh(req, res) {
  const token = req.cookies[REFRESH_COOKIE];
  if (!token) throw new HttpError(401, 'Sem sessão ativa');

  const { user, refreshToken } = await auth.rotateRefreshToken(token);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());
  res.json({ user, accessToken: auth.signAccessToken(user) });
}

export async function logout(req, res) {
  const token = req.cookies[REFRESH_COOKIE];
  if (token) await auth.revokeRefreshToken(token);
  res.clearCookie(REFRESH_COOKIE, { ...cookieOptions(), maxAge: undefined });
  res.status(204).end();
}

export async function me(req, res) {
  const user = await users.findById(req.user.id);
  if (!user) throw new HttpError(404, 'Conta não encontrada');
  res.json({ user: auth.publicUser(user) });
}

export async function updateMe(req, res) {
  const user = await users.update(req.user.id, req.valid.body);
  res.json({ user: auth.publicUser(user) });
}

export async function changePassword(req, res) {
  await auth.changePassword(req.user.id, req.valid.body);
  res.json({ message: 'Palavra-passe alterada' });
}
