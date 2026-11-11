import { galleries, users } from '../repositories/index.js';
import { today } from '../utils/dates.js';
import { HttpError, notFound } from '../utils/httpError.js';

const isExpired = (gallery) => gallery.expiresAt < today();

export function summary({ photos, ...gallery }) {
  return { ...gallery, photoCount: photos.length, expired: isExpired(gallery) };
}

export async function listFor(user) {
  const list = await galleries.findAll((g) => user.role === 'admin' || g.clientId === user.id);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(summary);
}

// Um cliente só vê as suas galerias e só enquanto não expiram; o admin vê tudo
export async function findFor(user, id) {
  const gallery = await galleries.findById(id);
  const allowed = gallery && (user.role === 'admin' || gallery.clientId === user.id);
  if (!allowed) throw notFound('Galeria');
  if (user.role !== 'admin' && isExpired(gallery)) {
    throw new HttpError(410, 'Esta galeria expirou. Peça-nos para a voltar a abrir.');
  }
  return gallery;
}

export async function toggleFavorite(user, id, photoId) {
  const gallery = await findFor(user, id);
  if (!gallery.photos.some((p) => p.id === photoId)) throw notFound('Fotografia');

  const favorites = gallery.favorites.includes(photoId)
    ? gallery.favorites.filter((f) => f !== photoId)
    : [...gallery.favorites, photoId];

  const updated = await galleries.update(id, { favorites });
  return updated.favorites;
}

export async function registerDownload(user, id, photoIds) {
  const gallery = await findFor(user, id);
  if (!gallery.allowDownload) throw new HttpError(403, 'O download ainda não está disponível nesta galeria');

  const photos = photoIds?.length ? gallery.photos.filter((p) => photoIds.includes(p.id)) : gallery.photos;
  await galleries.update(id, { downloads: gallery.downloads + photos.length });

  return photos.map((p) => ({ id: p.id, name: p.name, url: `${p.url}?w=4000&q=95&fm=jpg` }));
}

export async function createGallery({ title, clientId, project, shotOn, expiresAt, allowDownload, photoUrls }) {
  const client = await users.findById(clientId);
  if (client?.role !== 'cliente') throw new HttpError(400, 'Cliente não encontrado');

  const prefix = Math.random().toString(36).slice(2, 6);
  const photos = photoUrls.map((url, i) => ({
    id: `${prefix}-${i + 1}`,
    url: url.split('?')[0],
    name: `${prefix.toUpperCase()}_${String(i + 1).padStart(3, '0')}.jpg`,
  }));

  const gallery = await galleries.create({
    title,
    clientId,
    project: project ?? '',
    shotOn,
    expiresAt,
    allowDownload,
    cover: photos[0].url,
    photos,
    favorites: [],
    downloads: 0,
  });
  return summary(gallery);
}

export async function updateGallery(id, changes) {
  const gallery = await galleries.update(id, changes);
  if (!gallery) throw notFound('Galeria');
  return summary(gallery);
}

export async function removeGallery(id) {
  if (!(await galleries.remove(id))) throw notFound('Galeria');
}
