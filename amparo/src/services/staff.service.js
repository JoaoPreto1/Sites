import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ALL_PERMISSIONS, STAFF_PERMISSIONS } from '../config/platform.js';
import { staff } from '../repositories/index.js';
import { HttpError } from '../utils/httpError.js';

const MAX_FAILS = 5;
const LOCK_MINUTES = 15;
const DUMMY_HASH = bcrypt.hashSync('nao-existe-esta-credencial', 10);

export const publicStaff = ({ passwordHash, failedLogins, lockedUntil, ...member }) => ({
  ...member,
  permissions: member.role === 'dono' ? ALL_PERMISSIONS : member.permissions,
  locked: Boolean(lockedUntil && new Date(lockedUntil) > new Date()),
});

// O dono vem do .env e é criado no primeiro arranque; nunca pode ser criado por um pedido
export async function ensureOwner() {
  if (!env.owner.email) throw new Error('Falta definir OWNER_EMAIL no .env');
  const existing = await staff.findOne((s) => s.role === 'dono');
  if (existing) return;
  await staff.create({
    name: env.owner.name,
    email: env.owner.email,
    passwordHash: await bcrypt.hash(env.owner.password, 12),
    role: 'dono',
    permissions: [],
    active: true,
    failedLogins: 0,
    lockedUntil: null,
  });
}

export async function login({ email, password }) {
  const member = await staff.findOne((s) => s.email === email.toLowerCase());

  if (member?.lockedUntil && new Date(member.lockedUntil) > new Date()) {
    throw new HttpError(423, `Credenciais bloqueadas por ${LOCK_MINUTES} minutos depois de várias tentativas falhadas`);
  }

  const valid = await bcrypt.compare(password, member?.passwordHash ?? DUMMY_HASH);
  if (!member || !valid || !member.active) {
    if (member) {
      const fails = (member.failedLogins ?? 0) + 1;
      await staff.update(member.id, {
        failedLogins: fails >= MAX_FAILS ? 0 : fails,
        lockedUntil: fails >= MAX_FAILS ? new Date(Date.now() + LOCK_MINUTES * 60000).toISOString() : null,
      });
    }
    throw new HttpError(401, 'Credenciais incorretas');
  }

  const updated = await staff.update(member.id, { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date().toISOString() });
  const token = jwt.sign({ role: member.role }, env.jwt.staffSecret, { subject: member.id, audience: 'gestao', expiresIn: env.jwt.staffExpires });
  return { member: publicStaff(updated), token };
}

export async function list() {
  return (await staff.findAll()).map(publicStaff).sort((a, b) => (a.role === 'dono' ? -1 : b.role === 'dono' ? 1 : a.name.localeCompare(b.name)));
}

const cleanPermissions = (list = []) => [...new Set(list)].filter((p) => STAFF_PERMISSIONS.includes(p));

export async function create({ name, email, password, permissions }) {
  const normalized = email.toLowerCase();
  if (await staff.findOne((s) => s.email === normalized)) throw new HttpError(409, 'Já existem credenciais com este email');
  const member = await staff.create({
    name,
    email: normalized,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'funcionario',
    permissions: cleanPermissions(permissions),
    active: true,
    failedLogins: 0,
    lockedUntil: null,
  });
  return publicStaff(member);
}

export async function update(id, { permissions, active, password }) {
  const member = await staff.findById(id);
  if (!member) throw new HttpError(404, 'Credencial não encontrada');
  if (member.role === 'dono') throw new HttpError(400, 'As permissões do dono não se alteram aqui');

  const changes = {};
  if (permissions) changes.permissions = cleanPermissions(permissions);
  if (typeof active === 'boolean') changes.active = active;
  if (password) Object.assign(changes, { passwordHash: await bcrypt.hash(password, 12), failedLogins: 0, lockedUntil: null });
  return publicStaff(await staff.update(id, changes));
}

export async function changeOwnPassword(id, { currentPassword, newPassword }) {
  const member = await staff.findById(id);
  if (!(await bcrypt.compare(currentPassword, member.passwordHash))) throw new HttpError(400, 'A palavra-passe atual não está correta');
  await staff.update(id, { passwordHash: await bcrypt.hash(newPassword, 12) });
}
