import { blocks, bookings, messages, properties } from '../repositories/index.js';
import { withProperty } from './booking.service.js';
import { addDays, eachNight, nightsBetween, overlaps, today } from '../utils/dates.js';
import { HttpError, notFound } from '../utils/httpError.js';

const TRANSITIONS = {
  pendente: ['confirmada', 'cancelada'],
  confirmada: ['concluida', 'cancelada'],
};

export async function ownedProperties(user) {
  return properties.findAll((p) => user.role === 'admin' || p.ownerId === user.id);
}

async function ownedIds(user) {
  return new Set((await ownedProperties(user)).map((p) => p.id));
}

export async function overview(user) {
  const ids = await ownedIds(user);
  const all = await bookings.findAll((b) => ids.has(b.propertyId));
  const now = today();
  const year = now.slice(0, 4);

  const revenue = all
    .filter((b) => ['confirmada', 'concluida'].includes(b.status) && b.checkIn.startsWith(year))
    .reduce((sum, b) => sum + b.price.total, 0);

  const windowEnd = addDays(now, 30);
  const bookedNights = all
    .filter((b) => ['pendente', 'confirmada'].includes(b.status) && overlaps(now, windowEnd, b.checkIn, b.checkOut))
    .reduce((sum, b) => sum + eachNight(b.checkIn, b.checkOut).filter((d) => d >= now && d < windowEnd).length, 0);
  const occupancy = ids.size ? Math.round((bookedNights / (ids.size * 30)) * 100) : 0;

  const arrivals = all
    .filter((b) => b.status === 'confirmada' && b.checkIn >= now && b.checkIn <= addDays(now, 14))
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));

  const pending = all.filter((b) => b.status === 'pendente').sort((a, b) => a.checkIn.localeCompare(b.checkIn));

  return {
    stats: {
      pending: pending.length,
      upcoming: all.filter((b) => b.status === 'confirmada' && b.checkOut >= now).length,
      occupancy,
      revenue: Math.round(revenue * 100) / 100,
    },
    arrivals: await Promise.all(arrivals.map(withProperty)),
    pending: await Promise.all(pending.map(withProperty)),
  };
}

export async function listBookings(user, { status, propertyId }) {
  const ids = await ownedIds(user);
  const list = await bookings.findAll(
    (b) => ids.has(b.propertyId) && (!status || b.status === status) && (!propertyId || b.propertyId === propertyId),
  );
  list.sort((a, b) => b.checkIn.localeCompare(a.checkIn));
  return Promise.all(list.map(withProperty));
}

export async function changeStatus(user, code, status) {
  const ids = await ownedIds(user);
  const booking = await bookings.findOne((b) => b.code === code && ids.has(b.propertyId));
  if (!booking) throw notFound('Reserva');

  if (!TRANSITIONS[booking.status]?.includes(status)) {
    throw new HttpError(400, `Uma reserva ${booking.status} não pode passar a ${status}`);
  }

  const changes = { status };
  if (status === 'cancelada') Object.assign(changes, { cancelledAt: new Date().toISOString(), refund: booking.price.total });

  return withProperty(await bookings.update(booking.id, changes));
}

async function findOwnedProperty(user, id) {
  const property = await properties.findById(id);
  if (!property || (user.role !== 'admin' && property.ownerId !== user.id)) throw notFound('Alojamento');
  return property;
}

export async function updateProperty(user, id, changes) {
  await findOwnedProperty(user, id);
  return properties.update(id, changes);
}

export async function listBlocks(user) {
  const ids = await ownedIds(user);
  const list = await blocks.findAll((k) => ids.has(k.propertyId) && k.to >= today());
  return list.sort((a, b) => a.from.localeCompare(b.from));
}

export async function createBlock(user, { propertyId, from, to, reason }) {
  await findOwnedProperty(user, propertyId);

  const clash = await bookings.findOne(
    (b) => b.propertyId === propertyId && ['pendente', 'confirmada'].includes(b.status) && overlaps(from, to, b.checkIn, b.checkOut),
  );
  if (clash) throw new HttpError(409, `Já existe a reserva ${clash.code} nessas datas`);
  if (nightsBetween(from, to) > 365) throw new HttpError(400, 'Um bloqueio não pode passar de um ano');

  return blocks.create({ propertyId, from, to, reason: reason ?? '' });
}

export async function removeBlock(user, id) {
  const block = await blocks.findById(id);
  if (!block) throw notFound('Bloqueio');
  await findOwnedProperty(user, block.propertyId);
  await blocks.remove(id);
}

export async function listMessages() {
  const list = await messages.findAll();
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateMessage(id, status) {
  const message = await messages.update(id, { status });
  if (!message) throw notFound('Mensagem');
  return message;
}
