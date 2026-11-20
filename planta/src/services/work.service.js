import { randomUUID } from 'node:crypto';
import { PHASES } from '../config/studio.js';
import { users, works } from '../repositories/index.js';
import { HttpError, notFound } from '../utils/httpError.js';

const byDate = (a, b) => a.at.localeCompare(b.at);

// Junta à obra o texto de cada fase e ordena reuniões e mensagens
function present(work, owner) {
  const now = new Date().toISOString();
  return {
    ...work,
    owner: owner ? { name: owner.name, email: owner.email, phone: owner.phone } : undefined,
    phases: work.phases.map((p, i) => ({ ...PHASES[i], ...p })),
    meetings: [...work.meetings].sort(byDate).map((m) => ({ ...m, past: m.at < now })),
    messages: [...work.messages].sort(byDate),
    documents: [...work.documents].sort((a, b) => b.at.localeCompare(a.at)),
    unread: work.messages.filter((m) => m.from === 'cliente' && !m.read).length,
  };
}

export async function forClient(userId) {
  const work = await works.findOne((w) => w.userId === userId);
  if (!work) throw new HttpError(404, 'Ainda não há uma obra associada a esta conta');
  return present(work);
}

export async function list() {
  const all = await works.findAll();
  return Promise.all(all.map(async (w) => present(w, await users.findById(w.userId))));
}

async function get(id) {
  const work = await works.findById(id);
  if (!work) throw notFound('Obra');
  return work;
}

export async function addMessage(work, from, text) {
  const message = { id: randomUUID(), from, text, at: new Date().toISOString(), read: from === 'arquiteta' };
  const updated = await works.update(work.id, { messages: [...work.messages, message] });
  return present(updated);
}

export async function clientMessage(userId, text) {
  const work = await works.findOne((w) => w.userId === userId);
  if (!work) throw notFound('Obra');
  return addMessage(work, 'cliente', text);
}

export async function confirmMeeting(userId, meetingId) {
  const work = await works.findOne((w) => w.userId === userId);
  if (!work) throw notFound('Obra');
  const meeting = work.meetings.find((m) => m.id === meetingId);
  if (!meeting) throw notFound('Reunião');
  if (meeting.at < new Date().toISOString()) throw new HttpError(400, 'Esta reunião já passou');
  const meetings = work.meetings.map((m) => (m.id === meetingId ? { ...m, confirmed: true } : m));
  return present(await works.update(work.id, { meetings }));
}

export async function staffMessage(id, text) {
  const work = await get(id);
  const messages = work.messages.map((m) => ({ ...m, read: true }));
  return addMessage({ ...work, messages }, 'arquiteta', text);
}

export async function markRead(id) {
  const work = await get(id);
  return present(await works.update(id, { messages: work.messages.map((m) => ({ ...m, read: true })) }));
}

// Avança ou recua uma fase; a data de início fica registada
export async function step(id, direction) {
  const work = await get(id);
  const phase = work.phase + (direction === 'avancar' ? 1 : -1);
  if (phase < 0 || phase >= PHASES.length) throw new HttpError(400, 'Não há mais fases nesse sentido');
  const today = new Date().toISOString();
  const phases = work.phases.map((p, i) => ({
    ...p,
    status: i < phase ? 'feita' : i === phase ? 'agora' : 'depois',
    start: i === phase && !p.start ? today : i > phase ? null : p.start,
  }));
  return present(await works.update(id, { phase, phases }), await users.findById(work.userId));
}

export async function addMeeting(id, { at, topic, where }) {
  const work = await get(id);
  if (at < new Date().toISOString()) throw new HttpError(400, 'Escolha uma data no futuro');
  const meeting = { id: randomUUID(), at, topic, where, confirmed: false };
  return present(await works.update(id, { meetings: [...work.meetings, meeting] }), await users.findById(work.userId));
}
