import { reservations, tastings, users, wines } from '../repositories/index.js';
import { shop } from '../config/shop.js';
import { today } from '../utils/dates.js';
import { HttpError, notFound } from '../utils/httpError.js';

async function withSeats(tasting) {
  const list = await reservations.findAll((r) => r.tastingId === tasting.id);
  const taken = list.reduce((sum, r) => sum + r.people, 0);
  const lineup = await Promise.all(tasting.wineIds.map((id) => wines.findById(id)));
  return {
    ...tasting,
    taken,
    seatsLeft: Math.max(0, tasting.seats - taken),
    lineup: lineup.filter(Boolean).map(({ id, slug, name, year, type, shape, label, price }) => ({ id, slug, name, year, type, shape, label, price })),
  };
}

export async function upcoming() {
  const list = await tastings.findAll((t) => t.date >= today());
  const sorted = list.sort((a, b) => a.date.localeCompare(b.date));
  return Promise.all(sorted.map(withSeats));
}

export async function reserve(userId, tastingId, people) {
  const tasting = await tastings.findById(tastingId);
  if (!tasting || tasting.date < today()) throw notFound('Prova');

  const existing = await reservations.findOne((r) => r.tastingId === tastingId && r.userId === userId);
  if (existing) throw new HttpError(409, 'Já tem lugar nesta prova. Pode cancelar na sua conta.');

  const { seatsLeft } = await withSeats(tasting);
  if (people > Math.min(seatsLeft, shop.maxSeatsPerReservation)) {
    throw new HttpError(409, seatsLeft ? `Só restam ${seatsLeft} lugares` : 'Esta prova já esgotou');
  }

  return reservations.create({ tastingId, userId, people });
}

export async function mine(userId) {
  const list = await reservations.findAll((r) => r.userId === userId);
  const detailed = await Promise.all(
    list.map(async (r) => {
      const tasting = await tastings.findById(r.tastingId);
      return tasting && { ...r, tasting: { id: tasting.id, slug: tasting.slug, title: tasting.title, date: tasting.date, time: tasting.time, price: tasting.price, photo: tasting.photo } };
    }),
  );
  return detailed.filter((r) => r && r.tasting.date >= today()).sort((a, b) => a.tasting.date.localeCompare(b.tasting.date));
}

export async function cancel(userId, reservationId, { isAdmin = false } = {}) {
  const reservation = await reservations.findById(reservationId);
  if (!reservation || (!isAdmin && reservation.userId !== userId)) throw notFound('Reserva');
  await reservations.remove(reservationId);
}

export async function guestList() {
  const [list, people, all] = await Promise.all([upcoming(), users.findAll(), reservations.findAll()]);
  const names = Object.fromEntries(people.map((u) => [u.id, { name: u.name, email: u.email }]));

  return list.map((t) => ({
    ...t,
    guests: all.filter((r) => r.tastingId === t.id).map((r) => ({ id: r.id, people: r.people, ...names[r.userId] })),
  }));
}
