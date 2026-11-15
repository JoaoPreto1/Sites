import { CRATES, GRADES } from '../data/records.js';
import { orders, records } from '../repositories/index.js';
import { HttpError, notFound } from '../utils/httpError.js';

const GRADE_ORDER = GRADES.map((g) => g.code);
const crateName = Object.fromEntries(CRATES.map((c) => [c.slug, c.name]));

export const gradeRank = (code) => GRADE_ORDER.indexOf(code);

// Um LP tem dois lados; com muitas faixas passa a ser um duplo (quatro lados)
export function sides(tracks) {
  const count = tracks.length > 12 ? 4 : 2;
  return Array.from({ length: count }, (_, i) => ({ side: 'ABCD'[i], tracks: tracks.filter((t, n) => sideOf(tracks, n) === i) })).filter((s) => s.tracks.length);
}

// Cada faixa vai para o lado onde cai o seu meio, para os lados terem durações parecidas
export function sideOf(tracks, index) {
  const count = tracks.length > 12 ? 4 : 2;
  const total = tracks.reduce((s, t) => s + t.ms, 0) || 1;
  const before = tracks.slice(0, index).reduce((s, t) => s + t.ms, 0);
  return Math.min(count - 1, Math.floor(((before + tracks[index].ms / 2) / total) * count));
}

// O que vai para o browser: as faixas completas ficam no servidor
export function publicRecord(record) {
  return {
    ...record,
    crateName: crateName[record.crate],
    discs: record.tracks.length > 12 ? 2 : 1,
    minutes: Math.round(record.tracks.reduce((s, t) => s + t.ms, 0) / 60000),
    tracks: record.tracks.map(({ full, ...t }, index) => ({ ...t, index, hasFull: Boolean(full) })),
  };
}

const ORDERS = {
  chegada: (a, b) => b.arrivedAt.localeCompare(a.arrivedAt),
  preco: (a, b) => a.price - b.price,
  'preco-desc': (a, b) => b.price - a.price,
  ano: (a, b) => a.year - b.year,
  artista: (a, b) => a.artist.localeCompare(b.artist, 'pt'),
};

const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export async function listRecords({ caixote, estado, ate, q, ordem = 'chegada', destaque, emStock } = {}) {
  const query = q ? normalize(q) : null;
  const list = await records.findAll(
    (r) =>
      (!caixote || r.crate === caixote) &&
      (!estado || gradeRank(r.media) <= gradeRank(estado)) &&
      (!ate || r.price <= ate) &&
      (!destaque || r.featured) &&
      (!emStock || r.stock > 0) &&
      (!query || normalize(`${r.artist} ${r.title} ${r.label} ${r.year} ${r.tracks.map((t) => t.title).join(' ')}`).includes(query)),
  );
  return list.sort(ORDERS[ordem] ?? ORDERS.chegada).map(publicRecord);
}

export async function catalog() {
  const all = await records.findAll();
  return {
    crates: CRATES.map((c) => ({ ...c, count: all.filter((r) => r.crate === c.slug).length })),
    grades: GRADES,
    total: all.length,
  };
}

export async function recordDetail(slug) {
  const record = await records.findById(slug);
  if (!record) throw notFound('Disco');
  const sameCrate = await records.findAll((r) => r.crate === record.crate && r.id !== record.id);
  return {
    record: publicRecord(record),
    sides: sides(publicRecord(record).tracks),
    related: sameCrate.slice(0, 4).map(publicRecord),
  };
}

// Discos que a pessoa já comprou (encomendas pagas, enviadas ou entregues)
export async function ownedIds(userId) {
  const list = await orders.findAll((o) => o.userId === userId && o.status !== 'cancelada');
  return new Set(list.flatMap((o) => o.items.map((i) => i.recordId)));
}

export async function library(userId) {
  const ids = await ownedIds(userId);
  const list = await records.findAll((r) => ids.has(r.id));
  return list.map(publicRecord);
}

// A faixa completa só é servida a quem tem o disco
export async function fullTrack(userId, recordId, index) {
  const record = await records.findById(recordId);
  const track = record?.tracks[index];
  if (!track) throw notFound('Faixa');
  if (!(await ownedIds(userId)).has(recordId)) throw new HttpError(403, 'A faixa completa é para quem tem o disco');
  if (!track.full) throw notFound('Faixa');
  return track.full;
}
