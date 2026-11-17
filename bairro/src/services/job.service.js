import { randomUUID } from 'node:crypto';
import { PHASES, PROOF_STATUS } from '../config/studio.js';
import { jobs, requests, users } from '../repositories/index.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { lisbonToday } from '../utils/dates.js';

const isStaff = (user) => user.role === 'admin';

async function describe(job) {
  const client = await users.findById(job.clientId);
  const pending = job.proofs.filter((p) => p.status === 'pendente').length;
  return {
    ...job,
    client: client ? { name: client.name, company: client.company, email: client.email } : null,
    phases: PHASES,
    phaseName: PHASES[job.phase],
    progress: Math.round((job.phase / (PHASES.length - 1)) * 100),
    pending,
    proofs: job.proofs.map((p) => ({ ...p, statusName: PROOF_STATUS[p.status] })),
  };
}

async function findFor(id, user) {
  const job = await jobs.findById(id);
  if (!job || (!isStaff(user) && job.clientId !== user.id)) throw notFound('Trabalho');
  return job;
}

export async function listJobs(user) {
  const list = await jobs.findAll((j) => isStaff(user) || j.clientId === user.id);
  return Promise.all(list.sort((a, b) => b.startedAt.localeCompare(a.startedAt)).map(describe));
}

export async function getJob(id, user) {
  return describe(await findFor(id, user));
}

export async function decideProof(id, proofId, { decision, comment }, user) {
  const job = await findFor(id, user);
  const proof = job.proofs.find((p) => p.id === proofId);
  if (!proof) throw notFound('Prova');
  if (proof.status !== 'pendente') throw new HttpError(409, 'Esta prova já tem resposta');
  if (decision === 'alteracoes' && !comment) {
    throw new HttpError(400, 'Há campos por corrigir', [{ field: 'comment', message: 'Diga-nos o que quer mudar' }]);
  }

  const proofs = job.proofs.map((p) => (p.id === proofId ? { ...p, status: decision, comment: comment ?? '', answeredAt: new Date().toISOString() } : p));
  const note = {
    id: randomUUID(),
    from: 'cliente',
    author: user.name.split(' ')[0],
    text: decision === 'aprovado' ? `Aprovei ${proof.name}.${comment ? ` ${comment}` : ''}` : `Pedi alterações em ${proof.name}: ${comment}`,
    at: new Date().toISOString(),
  };

  return describe(await jobs.update(id, { proofs, messages: [...job.messages, note] }));
}

export async function addMessage(id, text, user) {
  const job = await findFor(id, user);
  const message = {
    id: randomUUID(),
    from: isStaff(user) ? 'equipa' : 'cliente',
    author: user.name.split(' ')[0],
    text,
    at: new Date().toISOString(),
  };
  return describe(await jobs.update(id, { messages: [...job.messages, message] }));
}

export async function setPhase(id, phase) {
  const job = await jobs.findById(id);
  if (!job) throw notFound('Trabalho');
  return describe(await jobs.update(id, { phase }));
}

export async function addProof(id, { name, photo }) {
  const job = await jobs.findById(id);
  if (!job) throw notFound('Trabalho');
  const proof = { id: randomUUID(), name, photo, status: 'pendente', comment: '', at: new Date().toISOString() };
  return describe(await jobs.update(id, { proofs: [...job.proofs, proof] }));
}

// Um pedido aceite passa a trabalho: precisa de um cliente com conta para poder ver as provas
export async function createFromRequest(requestId, { title, dueDate }) {
  const request = await requests.findById(requestId);
  if (!request) throw notFound('Pedido');
  if (await jobs.findOne((j) => j.requestId === requestId)) throw new HttpError(409, 'Este pedido já tem um trabalho');

  const client = request.userId ? await users.findById(request.userId) : await users.findOne((u) => u.email === request.email);
  if (!client) throw new HttpError(409, 'O cliente ainda não tem conta. Peça-lhe para criar uma com o mesmo email.');

  const job = await jobs.create({
    id: `t-${randomUUID().slice(0, 8)}`,
    title,
    clientId: client.id,
    requestId,
    phase: 0,
    startedAt: lisbonToday(),
    dueDate,
    proofs: [],
    messages: [],
    invoices: [],
  });

  await requests.update(requestId, { status: 'aceite', userId: client.id, note: `Passou a trabalho: ${title}` });
  return describe(job);
}
