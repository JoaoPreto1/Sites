import { auditLog } from '../repositories/index.js';

// Registo só de acrescentar: não há rota para editar nem apagar entradas
export async function record(req, action, target = '', details = '') {
  await auditLog.create({
    staffId: req.staff.id,
    staffName: req.staff.name,
    action,
    target,
    details: String(details).slice(0, 300),
    ip: req.ip,
  });
}

export async function list({ staffId, action } = {}) {
  const all = await auditLog.findAll((e) => (!staffId || e.staffId === staffId) && (!action || e.action.startsWith(action)));
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 300);
}
