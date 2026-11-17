import { availability, team } from '../repositories/index.js';
import { notFound } from '../utils/httpError.js';
import { monthName } from '../../public/js/shared/format.js';
import { lisbonMonth } from '../utils/dates.js';

export const listTeam = () => team.findAll();

// Vagas para começar projetos nos próximos meses (os meses que já passaram não aparecem)
export async function listAvailability() {
  const current = lisbonMonth();
  const months = await availability.findAll((m) => m.month >= current);
  return months
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({ ...m, ...monthName(m.month), free: Math.max(0, m.slots - m.taken) }));
}

export async function nextOpening() {
  const months = await listAvailability();
  return months.find((m) => m.free > 0) ?? null;
}

export async function updateAvailability(id, changes) {
  const month = await availability.findById(id);
  if (!month) throw notFound('Mês');
  const slots = changes.slots ?? month.slots;
  const taken = Math.min(changes.taken ?? month.taken, slots);
  return availability.update(id, { slots, taken });
}
