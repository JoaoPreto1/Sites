import { VENUE } from '../config/venue.js';
import { blocks, bookings, vouchers } from '../repositories/index.js';
import { groupPrice } from '../../public/js/shared/pricing.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { addDays, lisbonNow, lisbonToday, weekday } from '../utils/dates.js';
import { listRooms, roomBySlug, roomMap } from './room.service.js';

const ACTIVE = (b) => b.status !== 'cancelada';
const isWeekend = (date) => [0, 6].includes(weekday(date));

export function slotsFor(date) {
  if (VENUE.closedWeekdays.includes(weekday(date))) return [];
  return isWeekend(date) ? VENUE.slots.weekend : VENUE.slots.weekday;
}

export function bookingWindow() {
  const today = lisbonToday();
  return { from: today, to: addDays(today, VENUE.bookingDays) };
}

// Uma sessão de hoje só se pode reservar até 30 minutos antes de começar
function tooLate(date, time) {
  const today = lisbonToday();
  if (date < today) return true;
  if (date > today) return false;
  const [h, m] = lisbonNow().split(':').map(Number);
  const [sh, sm] = time.split(':').map(Number);
  return sh * 60 + sm - (h * 60 + m) < 30;
}

async function taken(roomId, date) {
  const [booked, blocked] = await Promise.all([
    bookings.findAll((b) => b.roomId === roomId && b.date === date && ACTIVE(b)),
    blocks.findAll((k) => k.roomId === roomId && k.date === date),
  ]);
  return { booked: new Map(booked.map((b) => [b.time, b])), blockedDay: blocked.find((k) => !k.time), blocked: new Set(blocked.map((k) => k.time)) };
}

export async function availability(roomId, date) {
  const slots = slotsFor(date);
  const { booked, blockedDay, blocked } = await taken(roomId, date);
  return slots.map((time) => ({
    time,
    free: !blockedDay && !blocked.has(time) && !booked.has(time) && !tooLate(date, time),
  }));
}

// Resumo dos próximos dias para o calendário da sala: quantas sessões livres há em cada dia
export async function calendar(roomId, days = 21) {
  const { from } = bookingWindow();
  const list = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(from, i);
    const slots = await availability(roomId, date);
    list.push({ date, closed: !slots.length, free: slots.filter((s) => s.free).length, total: slots.length });
  }
  return list;
}

// Próxima sessão livre de cada sala, para a página inicial
export async function nextFree(roomId) {
  const { from } = bookingWindow();
  for (let i = 0; i < 21; i++) {
    const date = addDays(from, i);
    const slot = (await availability(roomId, date)).find((s) => s.free);
    if (slot) return { date, time: slot.time };
  }
  return null;
}

function bookingCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return `FX-${Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')}`;
}

export async function voucherForBooking(code, { players, roomId }) {
  const voucher = await vouchers.findOne((v) => v.code === code.toUpperCase());
  if (!voucher) throw new HttpError(400, 'Este voucher não existe', [{ field: 'voucher', message: 'Confirme o código do voucher' }]);
  if (voucher.status === 'usado') throw new HttpError(400, 'Este voucher já foi usado', [{ field: 'voucher', message: 'Já foi usado' }]);
  if (voucher.status !== 'ativo') throw new HttpError(400, 'Este voucher ainda não está pago', [{ field: 'voucher', message: 'Ainda está por pagar' }]);
  if (voucher.validUntil < lisbonToday()) throw new HttpError(400, 'Este voucher já expirou', [{ field: 'voucher', message: 'Expirou' }]);
  if (voucher.roomId && voucher.roomId !== roomId) throw new HttpError(400, 'Este voucher é para outra sala', [{ field: 'voucher', message: 'É para outra sala' }]);
  if (players > voucher.players) {
    throw new HttpError(400, `Este voucher é para ${voucher.players} pessoas`, [{ field: 'players', message: `O voucher dá para ${voucher.players} pessoas` }]);
  }
  return voucher;
}

export async function createBooking(data, user) {
  const room = await roomBySlug(data.room);
  const { from, to } = bookingWindow();

  if (data.date < from || data.date > to) throw new HttpError(400, 'Só aceitamos reservas para as próximas semanas', [{ field: 'date', message: 'Escolha outro dia' }]);
  if (data.players < room.players.min || data.players > room.players.max) {
    throw new HttpError(400, `Esta sala é para ${room.players.min} a ${room.players.max} pessoas`, [{ field: 'players', message: `Entre ${room.players.min} e ${room.players.max}` }]);
  }

  const slot = (await availability(room.id, data.date)).find((s) => s.time === data.time);
  if (!slot) throw new HttpError(400, 'Não há sessão a essa hora', [{ field: 'time', message: 'Escolha outra hora' }]);
  if (!slot.free) throw new HttpError(409, 'Alguém reservou esta sessão primeiro. Escolha outra hora.', [{ field: 'time', message: 'Já está ocupada' }]);

  const voucher = data.voucher ? await voucherForBooking(data.voucher, { players: data.players, roomId: room.id }) : null;
  const price = groupPrice(data.players);

  const booking = await bookings.create({
    code: bookingCode(),
    roomId: room.id,
    date: data.date,
    time: data.time,
    players: data.players,
    team: data.team || data.name,
    name: data.name,
    email: data.email.toLowerCase(),
    phone: data.phone ?? '',
    userId: user?.id ?? null,
    total: voucher ? 0 : price.total,
    voucherCode: voucher?.code ?? null,
    status: 'confirmada',
    result: null,
  });

  if (voucher) await vouchers.update(voucher.id, { status: 'usado', usedIn: booking.code });
  return withRoom(booking, room);
}

const withRoom = (booking, room) => ({
  ...booking,
  room: room && { slug: room.slug, name: room.name, short: room.short, caseNo: room.caseNo, color: room.color, duration: room.duration, photo: room.photos[0].id },
});

function startsIn(booking) {
  const start = new Date(`${booking.date}T${booking.time}:00`);
  const nowLisbon = new Date(`${lisbonToday()}T${lisbonNow()}:00`);
  return (start - nowLisbon) / 36e5;
}

export const canChange = (booking) => booking.status === 'confirmada' && startsIn(booking) >= VENUE.cancelHours;

export async function userBookings(user) {
  const map = await roomMap();
  const list = await bookings.findAll((b) => b.userId === user.id);
  return list
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
    .map((b) => ({ ...withRoom(b, map.get(b.roomId)), canChange: canChange(b) }));
}

async function ownBooking(user, id) {
  const booking = await bookings.findById(id);
  if (!booking || booking.userId !== user.id) throw notFound('Reserva');
  if (!canChange(booking)) throw new HttpError(400, `Só se pode alterar até ${VENUE.cancelHours} horas antes da sessão. Ligue-nos para o ${VENUE.phone}.`);
  return booking;
}

export async function cancelBooking(user, id) {
  const booking = await ownBooking(user, id);
  const updated = await bookings.update(booking.id, { status: 'cancelada', cancelledAt: new Date().toISOString() });
  if (booking.voucherCode) {
    const voucher = await vouchers.findOne((v) => v.code === booking.voucherCode);
    if (voucher) await vouchers.update(voucher.id, { status: 'ativo', usedIn: null });
  }
  return updated;
}

export async function changePlayers(user, id, players) {
  const booking = await ownBooking(user, id);
  const map = await roomMap();
  const room = map.get(booking.roomId);
  if (players < room.players.min || players > room.players.max) {
    throw new HttpError(400, `Esta sala é para ${room.players.min} a ${room.players.max} pessoas`, [{ field: 'players', message: `Entre ${room.players.min} e ${room.players.max}` }]);
  }
  if (booking.voucherCode) {
    const voucher = await vouchers.findOne((v) => v.code === booking.voucherCode);
    if (voucher && players > voucher.players) throw new HttpError(400, `O voucher desta reserva dá para ${voucher.players} pessoas`);
  }
  const total = booking.voucherCode ? 0 : groupPrice(players).total;
  return bookings.update(booking.id, { players, total });
}

// Reservas e vouchers feitos sem conta passam para a conta criada com o mesmo email
export async function claimByEmail(user) {
  const [mineB, mineV] = await Promise.all([
    bookings.findAll((b) => !b.userId && b.email === user.email),
    vouchers.findAll((v) => !v.userId && v.buyerEmail === user.email),
  ]);
  await Promise.all([...mineB.map((b) => bookings.update(b.id, { userId: user.id })), ...mineV.map((v) => vouchers.update(v.id, { userId: user.id }))]);
}

/* Painel */

export async function dayBoard(date) {
  const list = await listRooms();
  const slots = slotsFor(date);
  const rows = await Promise.all(
    list.map(async (room) => {
      const { booked, blockedDay, blocked } = await taken(room.id, date);
      return {
        room: { id: room.id, slug: room.slug, short: room.short, caseNo: room.caseNo, color: room.color },
        blockedDay: blockedDay?.reason ?? null,
        sessions: slots.map((time) => ({ time, blocked: blocked.has(time), booking: booked.get(time) ?? null })),
      };
    }),
  );
  return { date, slots, closed: !slots.length, rows };
}

export async function adminBookings({ status, q } = {}) {
  const map = await roomMap();
  const today = lisbonToday();
  const term = q?.toLowerCase();
  const list = await bookings.findAll(
    (b) =>
      (status ? b.status === status : b.date >= today && b.status === 'confirmada') &&
      (!term || [b.code, b.name, b.team, b.email].some((v) => v?.toLowerCase().includes(term))),
  );
  return list
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`) * (status === 'jogada' ? -1 : 1))
    .slice(0, 25)
    .map((b) => withRoom(b, map.get(b.roomId)));
}

export async function setResult(id, { escaped, minutes, seconds, hints }) {
  const booking = await bookings.findById(id);
  if (!booking || booking.status === 'cancelada') throw notFound('Reserva');
  const map = await roomMap();
  const room = map.get(booking.roomId);
  const total = escaped ? minutes * 60 + seconds : room.duration * 60;
  if (escaped && total > room.duration * 60) throw new HttpError(400, `O tempo não pode passar de ${room.duration} minutos`, [{ field: 'minutes', message: 'Tempo a mais' }]);
  return bookings.update(id, { status: 'jogada', result: { escaped, seconds: total, hints } });
}

export async function toggleBlock({ roomId, date, time, reason }) {
  const existing = await blocks.findOne((k) => k.roomId === roomId && k.date === date && k.time === (time ?? null));
  if (existing) {
    await blocks.remove(existing.id);
    return { blocked: false };
  }
  const booked = await bookings.findOne((b) => b.roomId === roomId && b.date === date && (!time || b.time === time) && b.status === 'confirmada');
  if (booked) throw new HttpError(409, `Há uma reserva (${booked.code}) nesta ${time ? 'sessão' : 'data'}. Cancele-a primeiro.`);
  await blocks.create({ roomId, date, time: time ?? null, reason: reason || 'Bloqueado pela equipa' });
  return { blocked: true };
}

export async function adminCancel(id) {
  const booking = await bookings.findById(id);
  if (!booking) throw notFound('Reserva');
  return bookings.update(id, { status: 'cancelada', cancelledAt: new Date().toISOString() });
}
