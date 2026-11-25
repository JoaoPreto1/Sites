import { journal, works } from '../repositories/index.js';
import { serviceName } from '../config/site.js';
import { notFound } from '../utils/httpError.js';

const newest = (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt);
const withLabel = (w) => ({ ...w, categoryLabel: serviceName(w.category) });

export async function publishedWorks({ category } = {}) {
  const list = await works.findAll((w) => w.published && (!category || w.category === category));
  return list.sort(newest).map(withLabel);
}

export async function workBySlug(slug) {
  const work = await works.findOne((w) => w.slug === slug && w.published);
  if (!work) throw notFound('Trabalho');
  const all = await publishedWorks();
  const i = all.findIndex((w) => w.id === work.id);
  return { work: withLabel(work), next: all[(i + 1) % all.length], prev: all[(i - 1 + all.length) % all.length] };
}

export async function randomWork() {
  const all = await publishedWorks();
  return all[Math.floor(Math.random() * all.length)];
}

export async function publishedEntries() {
  return (await journal.findAll((e) => e.published)).sort(newest);
}

export async function entryBySlug(slug) {
  const entry = await journal.findOne((e) => e.slug === slug && e.published);
  if (!entry) throw notFound('Entrada');
  const all = await publishedEntries();
  return { entry, others: all.filter((e) => e.id !== entry.id).slice(0, 3) };
}

export const allWorks = async () => (await works.findAll()).sort(newest).map(withLabel);
export const allEntries = async () => (await journal.findAll()).sort(newest);
