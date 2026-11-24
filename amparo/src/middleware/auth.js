import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { staff } from '../repositories/index.js';
import { HttpError } from '../utils/httpError.js';

const bearer = (req) => {
  const [type, token] = (req.get('authorization') ?? '').split(' ');
  return type === 'Bearer' && token ? token : null;
};

const readUser = (token) => {
  const payload = jwt.verify(token, env.jwt.accessSecret, { audience: 'conta' });
  return { id: payload.sub, name: payload.name };
};

export function requireUser(req, res, next) {
  const token = bearer(req);
  if (!token) return next(new HttpError(401, 'Precisa de entrar na sua conta'));
  try {
    req.user = readUser(token);
    next();
  } catch {
    next(new HttpError(401, 'Sessão expirada'));
  }
}

export function optionalUser(req, res, next) {
  const token = bearer(req);
  if (token) {
    try {
      req.user = readUser(token);
    } catch {}
  }
  next();
}

// Gestão: outro segredo e outra audiência, e a conta é relida a cada pedido
// para que uma permissão retirada ou uma conta desativada deixem logo de funcionar
export async function requireStaff(req, res, next) {
  const token = bearer(req);
  if (!token) return next(new HttpError(401, 'Sessão da gestão em falta'));
  try {
    const payload = jwt.verify(token, env.jwt.staffSecret, { audience: 'gestao' });
    const member = await staff.findById(payload.sub);
    if (!member?.active) return next(new HttpError(401, 'Credenciais desativadas'));
    req.staff = { id: member.id, name: member.name, role: member.role, permissions: member.role === 'dono' ? null : member.permissions };
    next();
  } catch {
    next(new HttpError(401, 'Sessão da gestão expirada'));
  }
}

export const can = (member, permission) => member.role === 'dono' || member.permissions.includes(permission);

export const requirePermission = (permission) => (req, res, next) => {
  if (req.staff && can(req.staff, permission)) return next();
  next(new HttpError(403, 'Não tem permissão para esta função'));
};

export const requireOwner = (req, res, next) => {
  if (req.staff?.role === 'dono') return next();
  next(new HttpError(403, 'Só o dono da plataforma pode fazer isto'));
};
