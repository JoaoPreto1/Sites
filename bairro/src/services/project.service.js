import { CATEGORIES } from '../config/studio.js';
import { projects } from '../repositories/index.js';
import { notFound } from '../utils/httpError.js';

const byOrder = (a, b) => a.order - b.order;

const categoryName = (slug) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;

const card = (p) => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  year: p.year,
  category: p.category,
  categoryName: categoryName(p.category),
  services: p.services,
  summary: p.summary,
  cover: p.cover,
  featured: p.featured,
  published: p.published,
});

export async function listProjects({ categoria, all = false } = {}) {
  const list = await projects.findAll((p) => (all || p.published) && (!categoria || p.category === categoria));
  return list.sort(byOrder).map(card);
}

export async function categoryCounts() {
  const list = await projects.findAll((p) => p.published);
  return CATEGORIES.map((c) => ({ ...c, count: list.filter((p) => p.category === c.slug).length }));
}

export async function projectDetail(slug) {
  const project = await projects.findOne((p) => p.slug === slug && p.published);
  if (!project) throw notFound('Projeto');

  const list = (await projects.findAll((p) => p.published)).sort(byOrder);
  const index = list.findIndex((p) => p.id === project.id);
  const neighbour = (offset) => {
    const p = list[(index + offset + list.length) % list.length];
    return { slug: p.slug, title: p.title };
  };

  return {
    ...project,
    categoryName: categoryName(project.category),
    position: { index: index + 1, total: list.length },
    previous: neighbour(-1),
    next: neighbour(1),
  };
}

export async function featuredProject() {
  const [first] = await listProjects();
  const featured = (await projects.findAll((p) => p.published && p.featured)).sort(byOrder)[0];
  return projectDetail((featured ?? first).slug);
}

export async function updateProject(id, changes) {
  const project = await projects.update(id, changes);
  if (!project) throw notFound('Projeto');
  return card(project);
}
