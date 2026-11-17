import { BUDGETS, estimate, SERVICES } from '../../public/js/shared/estimate.js';
import { REQUEST_STATUS } from '../config/studio.js';
import { requests } from '../repositories/index.js';
import { HttpError, notFound } from '../utils/httpError.js';

const budgetName = (id) => BUDGETS.find(([value]) => value === id)?.[1] ?? '';
const statusName = (id) => REQUEST_STATUS.find((s) => s.id === id)?.name ?? id;
const serviceNames = (ids) => ids.map((id) => SERVICES.find((s) => s.id === id)?.name).filter(Boolean);

export const describe = (request) => ({
  ...request,
  budgetName: budgetName(request.budget),
  statusName: statusName(request.status),
  serviceNames: serviceNames(request.services),
  estimate: estimate(request.services, request.extras),
});

export async function createRequest(data, user) {
  const all = await requests.findAll();
  const number = Math.max(1000, ...all.map((r) => r.number)) + 1;

  const request = await requests.create({
    id: `p-${number}`,
    number,
    name: data.name,
    email: data.email.toLowerCase(),
    company: data.company ?? '',
    services: data.services,
    extras: data.extras,
    budget: data.budget,
    deadline: data.deadline ?? null,
    message: data.message,
    status: 'novo',
    note: '',
    userId: user?.id ?? null,
  });

  return describe(request);
}

export async function myRequests(user) {
  const list = await requests.findAll((r) => r.userId === user.id);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(describe);
}

// Quem pediu orçamento antes de criar conta passa a ver esses pedidos na conta nova
export async function claimRequests(user) {
  const orphans = await requests.findAll((r) => !r.userId && r.email === user.email);
  await Promise.all(orphans.map((r) => requests.update(r.id, { userId: user.id })));
}

export async function listRequests({ status } = {}) {
  const list = await requests.findAll((r) => !status || r.status === status);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(describe);
}

export async function updateRequest(id, changes) {
  const request = await requests.findById(id);
  if (!request) throw notFound('Pedido');
  if (request.status === 'aceite' && changes.status && changes.status !== 'aceite') {
    throw new HttpError(409, 'Este pedido já passou a trabalho');
  }
  return describe(await requests.update(id, changes));
}
