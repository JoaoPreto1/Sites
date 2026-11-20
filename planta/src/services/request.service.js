import { requests } from '../repositories/index.js';
import { notFound } from '../utils/httpError.js';

const newestFirst = (a, b) => b.createdAt.localeCompare(a.createdAt);

export async function create(data) {
  const request = await requests.create({
    name: data.name,
    email: data.email.toLowerCase(),
    phone: data.phone ?? '',
    situation: data.situation,
    budget: data.budget ?? 'nao-sei',
    place: data.place ?? '',
    message: data.message,
    status: 'novo',
    notes: '',
  });
  // Número da folha que a pessoa recebe no fim do formulário
  const count = (await requests.findAll()).length;
  return { id: request.id, number: `P-${String(count).padStart(3, '0')}`, name: request.name };
}

export async function list({ status } = {}) {
  const all = (await requests.findAll((r) => !status || r.status === status)).sort(newestFirst);
  return all;
}

export async function counts() {
  const all = await requests.findAll();
  return all.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), { total: all.length });
}

export async function update(id, changes) {
  const request = await requests.update(id, changes);
  if (!request) throw notFound('Pedido');
  return request;
}
