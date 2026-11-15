import { rooms as config } from '../config/shop.js';
import { bookings, rooms, users } from '../repositories/index.js';
import { addDays, hoursUntil, lisbonNow, today } from '../utils/dates.js';
import { HttpError, notFound } from '../utils/httpError.js';

export const HOURS = Array.from({ length: config.closes - config.opens }, (_, i) => config.opens + i);

export const bookableDays = () => Array.from({ length: config.daysAhead }, (_, i) => addDays(today(), i));

const covers = (b, hour) => hour >= b.start && hour < b.start + b.hours;

// Para cada sala, o estado de cada hora do dia: livre, ocupada, já passou ou tua
export async function day(date, userId) {
  const [list, dayBookings] = await Promise.all([rooms.findAll(), bookings.findAll((b) => b.date === date && b.status === 'confirmada')]);
  const now = lisbonNow();

  return list.map((room) => ({
    ...room,
    slots: HOURS.map((hour) => {
      const booking = dayBookings.find((b) => b.roomId === room.id && covers(b, hour));
      const past = date < now.date || (date === now.date && hour <= now.hour);
      return { hour, state: booking ? (userId && booking.userId === userId ? 'tua' : 'ocupada') : past ? 'passou' : 'livre' };
    }),
  }));
}

export function price(room, hours, extras = []) {
  const extra = extras.reduce((s, key) => s + (config.extras[key]?.price ?? 0), 0);
  return room.price * hours + extra;
}

export async function book(userId, { roomId, date, start, hours, extras = [], band }) {
  const room = await rooms.findById(roomId);
  if (!room) throw notFound('Sala');
  if (!bookableDays().includes(date)) throw new HttpError(400, `Só dá para marcar nos próximos ${config.daysAhead} dias`);
  if (start < config.opens || start + hours > config.closes) throw new HttpError(400, `As salas estão abertas das ${config.opens}h à meia-noite`);
  if (hoursUntil(date, start) < 1) throw new HttpError(400, 'Essa hora já passou');

  const clash = await bookings.findOne(
    (b) => b.roomId === roomId && b.date === date && b.status === 'confirmada' && b.start < start + hours && start < b.start + b.hours,
  );
  if (clash) throw new HttpError(409, 'Alguém marcou uma dessas horas entretanto. Escolhe outras.');

  const user = await users.findById(userId);
  return bookings.create({
    roomId,
    userId,
    band: band || user.band || user.name,
    date,
    start,
    hours,
    extras,
    total: price(room, hours, extras),
    status: 'confirmada',
  });
}

export async function mine(userId) {
  const [list, allRooms] = await Promise.all([bookings.findAll((b) => b.userId === userId), rooms.findAll()]);
  const name = Object.fromEntries(allRooms.map((r) => [r.id, r.name]));
  return list
    .map((b) => ({ ...b, room: name[b.roomId], canCancel: b.status === 'confirmada' && hoursUntil(b.date, b.start) >= config.cancelHours }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start);
}

export async function cancel(userId, id, { force = false } = {}) {
  const booking = await bookings.findById(id);
  if (!booking || (!force && booking.userId !== userId)) throw notFound('Reserva');
  if (booking.status !== 'confirmada') throw new HttpError(409, 'Esta reserva já foi cancelada');
  if (!force && hoursUntil(booking.date, booking.start) < config.cancelHours) {
    throw new HttpError(409, `Só dá para cancelar até ${config.cancelHours} horas antes. Liga-nos.`);
  }
  return bookings.update(id, { status: 'cancelada' });
}

export async function forDay(date) {
  const [list, allRooms] = await Promise.all([bookings.findAll((b) => b.date === date), rooms.findAll()]);
  const name = Object.fromEntries(allRooms.map((r) => [r.id, r.name]));
  return list.map((b) => ({ ...b, room: name[b.roomId] })).sort((a, b) => a.start - b.start);
}
