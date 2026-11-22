import * as repo from '../repositories/index.js';
import { notFound } from '../utils/httpError.js';

const byDateDesc = (a, b) => b.date.localeCompare(a.date);
const byDateAsc = (a, b) => a.date.localeCompare(b.date);

export const slugify = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70);

// Notícias
export async function listNews({ all = false, cat } = {}) {
  const items = await repo.news.findAll((n) => (all || n.published) && (!cat || n.cat === cat));
  return items.sort(byDateDesc);
}

export async function findNews(slug) {
  return repo.news.findOne((n) => n.slug === slug && n.published);
}

export async function createNews({ title, summary, cat, label, photo, text, published }) {
  let slug = slugify(title);
  if (await repo.news.findOne((n) => n.slug === slug)) slug = `${slug}-${Date.now().toString(36)}`;
  const body = [['lead', summary], ...text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p) => ['p', p])];
  return repo.news.create({ slug, title, summary, cat, label, photo, body, published, date: new Date().toISOString() });
}

export async function setNewsPublished(id, published) {
  const item = await repo.news.update(id, { published });
  if (!item) throw notFound('Notícia');
  return item;
}

export async function removeNews(id) {
  if (!(await repo.news.remove(id))) throw notFound('Notícia');
}

// Agenda
export async function listEvents({ upcoming = true } = {}) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const items = await repo.events.findAll((e) => !upcoming || new Date(e.date) >= now);
  return items.sort(byDateAsc);
}

export const createEvent = (data) => repo.events.create(data);

export async function removeEvent(id) {
  if (!(await repo.events.remove(id))) throw notFound('Evento');
}

// Avisos
export async function listNotices({ all = false } = {}) {
  const now = new Date().toISOString();
  const items = await repo.notices.findAll((a) => all || a.until >= now);
  return items.sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || a.until.localeCompare(b.until));
}

export const createNotice = (data) => repo.notices.create(data);

export async function removeNotice(id) {
  if (!(await repo.notices.remove(id))) throw notFound('Aviso');
}

// Editais
export async function listEditais() {
  return (await repo.editais.findAll()).sort(byDateDesc);
}

// Catálogo de serviços
export const listServices = () => repo.services.findAll();
export const findService = (slug) => repo.services.findOne((s) => s.slug === slug);
