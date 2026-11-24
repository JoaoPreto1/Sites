import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { users, refreshTokens } from '../repositories/index.js';
import { HttpError } from '../utils/httpError.js';

const DAY = 24 * 60 * 60 * 1000;
// Compara sempre com um hash, mesmo quando o email não existe, para não revelar que contas existem pelo tempo de resposta
const DUMMY_HASH = bcrypt.hashSync('nao-existe-esta-conta', 10);

export const publicUser = ({ passwordHash, ...user }) => user;

export async function register({ name, email, password }) {
  const normalized = email.toLowerCase();
  if (await users.findOne((u) => u.email === normalized)) throw new HttpError(409, 'Já existe uma conta com este email');

  const user = await users.create({ name, email: normalized, passwordHash: await bcrypt.hash(password, 12) });
  return publicUser(user);
}

export async function login({ email, password }) {
  const user = await users.findOne((u) => u.email === email.toLowerCase() && !u.deletedAt);
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) throw new HttpError(401, 'Email ou palavra-passe incorretos');
  return publicUser(user);
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await users.findById(userId);
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) throw new HttpError(400, 'A palavra-passe atual não está correta');
  await users.update(userId, { passwordHash: await bcrypt.hash(newPassword, 12) });
  await revokeAllFor(userId);
}

export const signAccessToken = (user) =>
  jwt.sign({ name: user.name }, env.jwt.accessSecret, { subject: user.id, audience: 'conta', expiresIn: env.jwt.accessExpires });

export async function issueRefreshToken(userId) {
  const id = randomUUID();
  await refreshTokens.create({ id, userId, expiresAt: new Date(Date.now() + env.jwt.refreshDays * DAY).toISOString() });
  return jwt.sign({}, env.jwt.refreshSecret, { subject: userId, jwtid: id, expiresIn: `${env.jwt.refreshDays}d` });
}

export async function revokeAllFor(userId) {
  const tokens = await refreshTokens.findAll((t) => t.userId === userId);
  await Promise.all(tokens.map((t) => refreshTokens.remove(t.id)));
}

export async function rotateRefreshToken(token) {
  let payload;
  try {
    payload = jwt.verify(token, env.jwt.refreshSecret);
  } catch {
    throw new HttpError(401, 'Sessão expirada, entre novamente');
  }

  const stored = await refreshTokens.findById(payload.jti);
  if (!stored) {
    // Token já usado: pode ter sido roubado, por isso termina todas as sessões desta conta
    await revokeAllFor(payload.sub);
    throw new HttpError(401, 'Sessão inválida, entre novamente');
  }
  await refreshTokens.remove(stored.id);

  const user = await users.findById(payload.sub);
  if (!user || user.deletedAt) throw new HttpError(401, 'Conta não encontrada');
  return { user: publicUser(user), refreshToken: await issueRefreshToken(user.id) };
}

export async function revokeRefreshToken(token) {
  const payload = jwt.decode(token);
  if (payload?.jti) await refreshTokens.remove(payload.jti);
}
