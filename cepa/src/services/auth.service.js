import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { users, refreshTokens } from '../repositories/index.js';
import { HttpError } from '../utils/httpError.js';

const DAY = 24 * 60 * 60 * 1000;

export const publicUser = ({ passwordHash, ...user }) => user;

export async function register({ name, email, password, birthDate, phone }) {
  const normalizedEmail = email.toLowerCase();
  const exists = await users.findOne((u) => u.email === normalizedEmail);
  if (exists) throw new HttpError(409, 'Já existe uma conta com este email');

  const user = await users.create({
    name,
    email: normalizedEmail,
    birthDate,
    phone: phone ?? '',
    address: '',
    postalCode: '',
    city: '',
    role: 'cliente',
    passwordHash: await bcrypt.hash(password, 10),
  });

  return publicUser(user);
}

export async function login({ email, password }) {
  const user = await users.findOne((u) => u.email === email.toLowerCase());
  const valid = user && (await bcrypt.compare(password, user.passwordHash));
  if (!valid) throw new HttpError(401, 'Email ou palavra-passe incorretos');

  return publicUser(user);
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await users.findById(userId);
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new HttpError(400, 'A palavra-passe atual não está correta');
  }
  await users.update(userId, { passwordHash: await bcrypt.hash(newPassword, 10) });
}

export function signAccessToken(user) {
  return jwt.sign({ role: user.role, name: user.name }, env.jwt.accessSecret, {
    subject: user.id,
    expiresIn: env.jwt.accessExpires,
  });
}

export async function issueRefreshToken(userId) {
  const id = randomUUID();
  await refreshTokens.create({ id, userId, expiresAt: new Date(Date.now() + env.jwt.refreshDays * DAY).toISOString() });

  return jwt.sign({}, env.jwt.refreshSecret, {
    subject: userId,
    jwtid: id,
    expiresIn: `${env.jwt.refreshDays}d`,
  });
}

async function revokeAllFor(userId) {
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
    // Token já usado: pode ter sido roubado, por isso termina todas as sessões
    await revokeAllFor(payload.sub);
    throw new HttpError(401, 'Sessão inválida, entre novamente');
  }
  await refreshTokens.remove(stored.id);

  const user = await users.findById(payload.sub);
  if (!user) throw new HttpError(401, 'Conta não encontrada');

  return { user: publicUser(user), refreshToken: await issueRefreshToken(user.id) };
}

export async function revokeRefreshToken(token) {
  const payload = jwt.decode(token);
  if (payload?.jti) await refreshTokens.remove(payload.jti);
}
