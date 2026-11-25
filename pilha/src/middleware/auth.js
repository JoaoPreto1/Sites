import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { users } from '../repositories/index.js';
import { HttpError } from '../utils/httpError.js';

const bearer = (req) => {
  const [type, token] = (req.get('authorization') ?? '').split(' ');
  return type === 'Bearer' && token ? token : null;
};

// O perfil é relido a cada pedido para que uma conta desativada deixe logo de funcionar
export async function requireUser(req, res, next) {
  const token = bearer(req);
  if (!token) return next(new HttpError(401, 'Precisa de entrar na sua conta'));
  let payload;
  try {
    payload = jwt.verify(token, env.jwt.accessSecret, { audience: 'pilha' });
  } catch {
    return next(new HttpError(401, 'Sessão expirada'));
  }
  const user = await users.findById(payload.sub);
  if (!user || !user.active) return next(new HttpError(401, 'Conta desativada'));
  req.user = { id: user.id, name: user.name, role: user.role };
  next();
}

export const requireRole = (role) => (req, res, next) =>
  req.user?.role === role ? next() : next(new HttpError(403, role === 'estudio' ? 'Só a equipa do estúdio pode fazer isto' : 'Esta área é só para clientes'));
