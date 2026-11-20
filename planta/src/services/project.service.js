import { projects } from '../repositories/index.js';
import { notFound } from '../utils/httpError.js';

export const TYPES = [
  ['moradia', 'Moradias'],
  ['reabilitacao', 'Reabilitação'],
  ['coletiva', 'Habitação coletiva'],
];

export const typeLabel = (type) =>
  ({ moradia: 'Moradia unifamiliar', reabilitacao: 'Reabilitação', coletiva: 'Habitação coletiva' })[type] ?? type;

const byOrder = (a, b) => a.order - b.order;

// Número de cada projeto no índice (01, 02…), sempre pela ordem atual
const numbered = (list) => list.map((p, i) => ({ ...p, n: String(i + 1).padStart(2, '0') }));

export async function listPublished() {
  return numbered((await projects.findAll((p) => p.published)).sort(byOrder));
}

export async function listAll() {
  return (await projects.findAll()).sort(byOrder);
}

export async function findPublished(slug) {
  const all = await listPublished();
  const index = all.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  return {
    project: all[index],
    prev: all[(index - 1 + all.length) % all.length],
    next: all[(index + 1) % all.length],
  };
}

export async function setPublished(id, published) {
  const project = await projects.update(id, { published });
  if (!project) throw notFound('Projeto');
  return project;
}

// Troca o projeto de lugar com o vizinho de cima ou de baixo
export async function move(id, direction) {
  const all = await listAll();
  const index = all.findIndex((p) => p.id === id);
  if (index === -1) throw notFound('Projeto');
  const other = all[index + (direction === 'cima' ? -1 : 1)];
  if (!other) return listAll();
  await projects.update(id, { order: other.order });
  await projects.update(other.id, { order: all[index].order });
  return listAll();
}
