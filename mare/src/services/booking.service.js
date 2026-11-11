import { randomInt } from 'node:crypto';
import { bookings, experiences, properties, users } from '../repositories/index.js';
import { isAvailable } from './availability.js';
import { quoteStay } from './pricing.js';
import { nightsBetween, today } from '../utils/dates.js';
import { HttpError, notFound } from '../utils/httpError.js';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const FREE_CANCELLATION_DAYS = 14;

export async function buildQuote({ propertyId, checkIn, checkOut, adults, children = 0, extras = [] }, { ignoreBookingId } = {}) {
  const property = await properties.findById(propertyId);
  if (!property?.active) throw notFound('Alojamento');

  if (checkIn < today()) throw new HttpError(400, 'A data de entrada já passou');

  const nights = nightsBetween(checkIn, checkOut);
  if (nights < property.minNights) {
    throw new HttpError(400, `Esta casa tem uma estadia mínima de ${property.minNights} noites`);
  }

  if (adults + children > property.guests) {
    throw new HttpError(400, `Esta casa recebe no máximo ${property.guests} hóspedes`);
  }

  const extraItems = await Promise.all(
    extras.map(async ({ experienceId, people }) => {
      const experience = await experiences.findById(experienceId);
      if (!experience) throw new HttpError(400, 'Uma das experiências escolhidas já não existe');
      return { experience, people };
    }),
  );

  const available = await isAvailable(property.id, checkIn, checkOut, { ignoreBookingId });
  const quote = quoteStay(property, { checkIn, checkOut, adults, children, extras: extraItems });

  return { property, available, quote };
}

async function uniqueCode() {
  let code;
  do {
    code = 'MR-' + Array.from({ length: 6 }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join('');
  } while (await bookings.findOne((b) => b.code === code));
  return code;
}

export async function withProperty(booking) {
  const property = await properties.findById(booking.propertyId);
  return {
    ...booking,
    property: property && { id: property.id, name: property.name, slug: property.slug, area: property.area, image: property.images[0] },
  };
}

export function cancellationInfo(booking) {
  const daysBefore = nightsBetween(today(), booking.checkIn);
  const cancellable = ['pendente', 'confirmada'].includes(booking.status) && daysBefore > 0;
  const freeCancellation = booking.status === 'pendente' || daysBefore >= FREE_CANCELLATION_DAYS;
  return { cancellable, freeCancellation, daysBefore };
}

export async function createBooking(userId, { guest, notes, acceptTerms, ...stay }) {
  const { property, available, quote } = await buildQuote(stay);
  if (!available) throw new HttpError(409, 'Estas datas acabaram de ser reservadas. Escolha outras, por favor.');

  const user = await users.findById(userId);

  const booking = await bookings.create({
    code: await uniqueCode(),
    propertyId: property.id,
    userId,
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    adults: stay.adults,
    children: stay.children,
    extras: quote.extras,
    price: quote,
    status: 'pendente',
    guest: { name: guest.name, email: user.email, phone: guest.phone },
    notes: notes ?? '',
    checkin: null,
  });

  return withProperty(booking);
}

export async function findForUser(code, user) {
  const booking = await bookings.findOne((b) => b.code === code);
  if (!booking) throw notFound('Reserva');

  if (booking.userId === user.id || user.role === 'admin') return booking;

  if (user.role === 'proprietario') {
    const property = await properties.findById(booking.propertyId);
    if (property?.ownerId === user.id) return booking;
  }

  throw notFound('Reserva');
}

async function findOwnBooking(code, userId) {
  const booking = await bookings.findOne((b) => b.code === code && b.userId === userId);
  if (!booking) throw notFound('Reserva');
  return booking;
}

export async function cancelBooking(code, userId) {
  const booking = await findOwnBooking(code, userId);
  const { cancellable, freeCancellation } = cancellationInfo(booking);
  if (!cancellable) throw new HttpError(400, 'Esta reserva já não pode ser cancelada');

  const updated = await bookings.update(booking.id, {
    status: 'cancelada',
    cancelledAt: new Date().toISOString(),
    refund: freeCancellation ? booking.price.total : 0,
  });
  return withProperty(updated);
}

export async function saveOnlineCheckin(code, userId, data) {
  const booking = await findOwnBooking(code, userId);
  if (booking.status !== 'confirmada') throw new HttpError(400, 'O check-in online só abre depois de a reserva ser confirmada');
  if (booking.checkOut <= today()) throw new HttpError(400, 'Esta estadia já terminou');

  const updated = await bookings.update(booking.id, {
    checkin: { ...data, submittedAt: new Date().toISOString() },
    guest: { ...booking.guest, phone: data.phone },
  });
  return withProperty(updated);
}

export async function addExtra(code, userId, extra) {
  const booking = await findOwnBooking(code, userId);
  if (!['pendente', 'confirmada'].includes(booking.status) || booking.checkIn <= today()) {
    throw new HttpError(400, 'Já não é possível juntar experiências a esta reserva');
  }

  const extras = booking.extras
    .filter((line) => line.experienceId !== extra.experienceId)
    .map(({ experienceId, people }) => ({ experienceId, people }));
  extras.push(extra);

  const { quote } = await buildQuote(
    { propertyId: booking.propertyId, checkIn: booking.checkIn, checkOut: booking.checkOut, adults: booking.adults, children: booking.children, extras },
    { ignoreBookingId: booking.id },
  );

  const updated = await bookings.update(booking.id, { extras: quote.extras, price: quote });
  return withProperty(updated);
}
