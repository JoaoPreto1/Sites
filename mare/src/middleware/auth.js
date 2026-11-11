import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

export function requireAuth(req, res, next) {
  const [type, token] = (req.get('authorization') ?? '').split(' ');
  if (type !== 'Bearer' || !token) return next(new HttpError(401, 'Precisa de entrar na sua conta'));

  try {
    const payload = jwt.verify(token, env.jwt.accessSecret);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new HttpError(401, 'Sessão expirada'));
  }
}

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (roles.includes(req.user?.role)) return next();
    next(new HttpError(403, 'Não tem permissão para isto'));
  };
