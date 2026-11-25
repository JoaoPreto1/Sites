import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { briefs, users } from '../repositories/index.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { createProject } from './projects.service.js';

async function nextRef() {
  const all = await briefs.findAll();
  const max = Math.max(400, ...all.map((b) => Number(b.ref.split('-')[1]) || 0));
  return `PL-${String(max + 1).padStart(4, '0')}`;
}

export async function submit(data) {
  const brief = await briefs.create({ ...data, email: data.email.toLowerCase(), ref: await nextRef(), status: 'novo', note: '' });
  return { ref: brief.ref };
}

export const list = async () => (await briefs.findAll()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export async function update(id, changes) {
  const brief = await briefs.findById(id);
  if (!brief) throw notFound('Pedido');
  if (brief.status === 'aceite' && changes.status && changes.status !== 'aceite') throw new HttpError(409, 'Este pedido já deu origem a um projeto');
  if (changes.status === 'aceite' && brief.status !== 'aceite') throw new HttpError(400, 'Para aceitar, use "Aceitar e criar projeto"');
  return briefs.update(id, changes);
}

// Aceitar um pedido cria o projeto e, se o cliente ainda não tiver conta, uma conta com uma palavra-passe provisória
// que só é mostrada uma vez ao estúdio, para a enviar ao cliente.
export async function accept(id, { title, service, lead }) {
  const brief = await briefs.findById(id);
  if (!brief) throw notFound('Pedido');
  if (brief.status === 'aceite') throw new HttpError(409, 'Este pedido já foi aceite');

  let client = await users.findOne((u) => u.email === brief.email.toLowerCase());
  let temporaryPassword = null;
  if (client && client.role !== 'cliente') throw new HttpError(409, 'Este email pertence a uma conta do estúdio');
  if (!client) {
    temporaryPassword = randomBytes(9).toString('base64url');
    client = await users.create({ name: brief.name, company: brief.company, email: brief.email.toLowerCase(), role: 'cliente', active: true, passwordHash: await bcrypt.hash(temporaryPassword, 12) });
  }
  const project = await createProject({ title, clientId: client.id, service, summary: brief.message.slice(0, 400), lead });
  await briefs.update(id, { status: 'aceite', projectId: project.id });
  return { project, client: { name: client.name, email: client.email }, temporaryPassword };
}
