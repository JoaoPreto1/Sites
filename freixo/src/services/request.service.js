import * as repo from '../repositories/index.js';
import { REQUEST_STATUS } from '../config/municipio.js';
import { HttpError, notFound } from '../utils/httpError.js';

const label = (status) => REQUEST_STATUS.find(([v]) => v === status)?.[1] ?? status;
const newest = (a, b) => b.createdAt.localeCompare(a.createdAt);

async function nextNumber(collection, prefix) {
  const year = new Date().getFullYear();
  const all = await collection.findAll();
  const max = Math.max(0, ...all.map((i) => Number(i.number.split('-').pop()) || 0));
  return `${prefix}-${year}-${String(max + 1).padStart(4, '0')}`;
}

async function withService(request) {
  const service = await repo.services.findOne((s) => s.slug === request.service);
  return { ...request, serviceTitle: service?.title ?? request.service, statusLabel: label(request.status) };
}

// Pedidos de serviço
export async function forUser(userId) {
  const items = await repo.requests.findAll((r) => r.userId === userId);
  return Promise.all(items.sort(newest).map(withService));
}

export async function create(user, { service, text }) {
  const found = await repo.services.findOne((s) => s.slug === service);
  if (!found) throw new HttpError(400, 'Escolha um serviço da lista');
  if (!found.online) throw new HttpError(400, 'Este serviço só se trata presencialmente');
  const now = new Date().toISOString();
  const request = await repo.requests.create({
    number: await nextNumber(repo.requests, 'P'),
    userId: user.id,
    service,
    text,
    status: 'recebido',
    history: [{ at: now, status: 'recebido', note: 'Pedido recebido pelo Balcão Online.' }],
  });
  return withService(request);
}

export async function listAll({ status } = {}) {
  const items = await repo.requests.findAll((r) => !status || r.status === status);
  const people = new Map((await repo.users.findAll()).map((u) => [u.id, u.name]));
  return Promise.all(items.sort(newest).map(async (r) => ({ ...(await withService(r)), person: r.userId ? people.get(r.userId) : r.name })));
}

export async function counts() {
  const items = await repo.requests.findAll();
  return Object.fromEntries(REQUEST_STATUS.map(([v]) => [v, items.filter((r) => r.status === v).length]));
}

export async function updateStatus(id, { status, note }) {
  const current = await repo.requests.findById(id);
  if (!current) throw notFound('Pedido');
  const history = [...current.history, { at: new Date().toISOString(), status, note: note || `Estado alterado para “${label(status)}”.` }];
  return withService(await repo.requests.update(id, { status, history }));
}

// Ocorrências na via pública
export async function issuesForUser(userId) {
  return (await repo.issues.findAll((o) => o.userId === userId)).sort(newest).map((o) => ({ ...o, statusLabel: label(o.status) }));
}

export async function createIssue(user, { type, place, text, name }) {
  return repo.issues.create({
    number: await nextNumber(repo.issues, 'O'),
    userId: user?.id ?? null,
    name: user ? undefined : name || 'Munícipe',
    type,
    place,
    text,
    status: 'recebido',
  });
}

export async function listIssues() {
  const people = new Map((await repo.users.findAll()).map((u) => [u.id, u.name]));
  return (await repo.issues.findAll()).sort(newest).map((o) => ({ ...o, person: o.userId ? people.get(o.userId) : o.name, statusLabel: label(o.status) }));
}

export async function updateIssue(id, status) {
  const item = await repo.issues.update(id, { status });
  if (!item) throw notFound('Pedido');
  return { ...item, statusLabel: label(item.status) };
}
