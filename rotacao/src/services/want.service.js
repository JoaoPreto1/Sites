import { shop } from '../config/shop.js';
import { records, users, wants } from '../repositories/index.js';
import { HttpError, notFound } from '../utils/httpError.js';

const newestFirst = (a, b) => b.createdAt.localeCompare(a.createdAt);

// Na parede só aparece o primeiro nome de quem procura
const card = ({ userId, ...want }) => want;

export async function wall() {
  const list = await wants.findAll((w) => w.status !== 'fechado');
  return list.sort(newestFirst).map(card);
}

export const mine = async (userId) => (await wants.findAll((w) => w.userId === userId)).sort(newestFirst);

export async function create(userId, data) {
  const user = await users.findById(userId);
  const open = await wants.findAll((w) => w.userId === userId && w.status === 'aberto');
  if (open.length >= 10) throw new HttpError(409, 'Já tens dez discos na parede. Tira um antes de pendurar outro.');
  return wants.create({ ...data, userId, name: user.name.split(' ')[0], status: 'aberto' });
}

export async function remove(userId, id) {
  const want = await wants.findById(id);
  if (!want || want.userId !== userId) throw notFound('Procura');
  await wants.update(id, { status: 'fechado' });
}

export const all = async () => (await wants.findAll()).sort(newestFirst);

// A loja encontrou o disco: fica guardado com o nome de quem o procurava
export async function markFound(id, recordId) {
  const want = await wants.findById(id);
  if (!want) throw notFound('Procura');
  const record = await records.findById(recordId);
  if (!record) throw notFound('Disco');
  return wants.update(id, { status: 'encontrado', recordId, holdUntil: new Date(Date.now() + shop.holdHours * 3600 * 1000).toISOString() });
}

export async function close(id) {
  const want = await wants.findById(id);
  if (!want) throw notFound('Procura');
  return wants.update(id, { status: 'fechado' });
}
