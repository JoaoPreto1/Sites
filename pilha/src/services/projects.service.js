import { PHASE_KEYS, PHASES, serviceName } from '../config/site.js';
import { messages, projects, proofs, users } from '../repositories/index.js';
import { HttpError, notFound } from '../utils/httpError.js';

const oldest = (a, b) => new Date(a.createdAt) - new Date(b.createdAt);
const newest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

function decorate(project, { proofList, messageList, client, viewer }) {
  const current = PHASE_KEYS.indexOf(project.phase);
  return {
    ...project,
    serviceLabel: serviceName(project.service),
    client: client ? { id: client.id, name: client.name, company: client.company, email: client.email } : null,
    phases: project.phases.map((p, i) => ({ ...p, label: PHASES[i]?.label ?? p.key, state: i < current ? 'feita' : i === current ? 'agora' : 'depois' })),
    proofs: proofList.sort(newest),
    messages: messageList.sort(oldest),
    pendingProofs: proofList.filter((p) => p.status === 'pendente').length,
    unread: messageList.filter((m) => (viewer === 'estudio' ? !m.readByStudio : !m.readByClient)).length,
  };
}

async function load(project, viewer) {
  const [proofList, messageList, client] = await Promise.all([
    proofs.findAll((p) => p.projectId === project.id),
    messages.findAll((m) => m.projectId === project.id),
    users.findById(project.clientId),
  ]);
  return decorate(project, { proofList, messageList, client, viewer });
}

// Cliente: só vê os projetos que são seus
export async function listForClient(userId) {
  const list = await projects.findAll((p) => p.clientId === userId);
  return Promise.all(list.sort(newest).map((p) => load(p, 'cliente')));
}

async function ownedProject(projectId, user) {
  const project = await projects.findById(projectId);
  if (!project || (user.role === 'cliente' && project.clientId !== user.id)) throw notFound('Projeto');
  return project;
}

export async function markRead(projectId, user) {
  const project = await ownedProject(projectId, user);
  const field = user.role === 'estudio' ? 'readByStudio' : 'readByClient';
  const unread = await messages.findAll((m) => m.projectId === project.id && !m[field]);
  await Promise.all(unread.map((m) => messages.update(m.id, { [field]: true })));
}

export async function decideProof(proofId, user, { decision, comment }) {
  const proof = await proofs.findById(proofId);
  if (!proof) throw notFound('Prova');
  await ownedProject(proof.projectId, user);
  if (proof.status !== 'pendente') throw new HttpError(409, 'Esta prova já tem uma resposta');
  if (decision === 'alteracoes' && !comment) throw new HttpError(400, 'Diga-nos o que quer mudar', [{ field: 'comment', message: 'Diga-nos o que quer mudar' }]);
  return proofs.update(proof.id, { status: decision, clientComment: comment ?? '', decidedAt: new Date().toISOString() });
}

export async function postMessage(projectId, user, body) {
  const project = await ownedProject(projectId, user);
  const fromStudio = user.role === 'estudio';
  return messages.create({ projectId: project.id, authorId: user.id, authorName: user.name, fromStudio, body, readByClient: !fromStudio, readByStudio: fromStudio });
}

// Estúdio
export async function listAll() {
  const list = await projects.findAll();
  return Promise.all(list.sort(newest).map((p) => load(p, 'estudio')));
}

export async function setPhase(projectId, phase) {
  const project = await projects.findById(projectId);
  if (!project) throw notFound('Projeto');
  const target = PHASE_KEYS.indexOf(phase);
  const now = new Date().toISOString();
  const phases = project.phases.map((p, i) => ({ ...p, doneAt: i < target ? (p.doneAt ?? now) : null }));
  return projects.update(project.id, { phase, phases });
}

export async function addProof(projectId, { title, note, image }) {
  const project = await projects.findById(projectId);
  if (!project) throw notFound('Projeto');
  const same = await proofs.findAll((p) => p.projectId === projectId && p.title.toLowerCase() === title.toLowerCase());
  return proofs.create({ projectId, title, version: same.length + 1, image, note: note ?? '', status: 'pendente', clientComment: '', decidedAt: null });
}

export async function createProject({ title, clientId, service, summary, onTable, lead, weeks = 8 }) {
  const DAY = 86400000;
  const step = Math.max(1, Math.round((weeks * 7) / (PHASES.length - 1)));
  const phases = PHASES.map((p, i) => ({ key: p.key, due: new Date(Date.now() + i * step * DAY).toISOString().slice(0, 10), doneAt: null }));
  return projects.create({ title, clientId, service, phase: 'briefing', lead, summary: summary ?? '', onTable: onTable ?? '', phases });
}

// O que aparece na página inicial em "Agora em cima da mesa": só a descrição pública, nunca o nome do cliente
export async function onTheTable() {
  const list = await projects.findAll((p) => p.phase !== 'entregue' && p.onTable);
  return list.sort(newest).map((p) => p.onTable);
}
