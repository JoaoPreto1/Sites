import { projects } from '../repositories/index.js';

const summary = ({ description, gallery, team, published, ...project }) => project;

const byNewest = (a, b) => b.year - a.year || a.title.localeCompare(b.title);

export async function listPublished({ category, featured } = {}) {
  const list = await projects.findAll((p) => p.published && (!category || p.category === category) && (!featured || p.featured));
  return list.sort(byNewest).map(summary);
}

// Devolve o projeto e o seguinte na ordem do portefólio (para o "próximo projeto")
export async function findWithNext(slug) {
  const list = (await projects.findAll((p) => p.published)).sort(byNewest);
  const index = list.findIndex((p) => p.slug === slug);
  if (index === -1) return null;

  const next = list[(index + 1) % list.length];
  const { published, ...project } = list[index];
  return { project, next: { slug: next.slug, title: next.title, category: next.category, cover: next.cover } };
}
