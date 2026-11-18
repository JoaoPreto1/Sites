import { rooms } from '../repositories/index.js';
import { notFound } from '../utils/httpError.js';

const ORDER = ['01', '02', '03', '04'];

export async function listRooms() {
  const all = await rooms.findAll();
  return all.sort((a, b) => ORDER.indexOf(a.caseNo) - ORDER.indexOf(b.caseNo));
}

export async function roomBySlug(slug) {
  const room = await rooms.findOne((r) => r.slug === slug);
  if (!room) throw notFound('Sala');
  return room;
}

export async function roomById(id) {
  return rooms.findById(id);
}

export const roomMap = async () => new Map((await listRooms()).map((r) => [r.id, r]));
