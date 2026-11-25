import { ROOM_TYPES, ROOMS, SITE, typeBySlug, typeOfRoom } from '../config/site.js';
import { menus, prices, requests, reservations, users } from '../repositories/index.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { addDays, nextWeekend, nightsBetween, today } from '../utils/dates.js';

const ACTIVE = new Set(['confirmada', 'em-casa']);
const overlaps = (r, from, to) => r.checkIn < to && r.checkOut > from;

export async function priceOf(slug) {
  return (await prices.findById(slug))?.price ?? typeBySlug(slug).price;
}
export async function priceTable() {
  return Object.fromEntries(await Promise.all(ROOM_TYPES.map(async (t) => [t.slug, await priceOf(t.slug)])));
}

// Datas inválidas dão 400 com o campo certo, para o formulário mostrar o erro ao lado
export function checkStay({ checkIn, checkOut, guests = 2 }) {
  const t = today();
  const errors = [];
  if (checkIn < t) errors.push({ field: 'checkIn', message: 'A chegada não pode ser antes de hoje' });
  if (checkIn > addDays(t, 365)) errors.push({ field: 'checkIn', message: 'Só aceitamos reservas até um ano antes' });
  const n = nightsBetween(checkIn, checkOut);
  if (n < 1) errors.push({ field: 'checkOut', message: 'A saída tem de ser depois da chegada' });
  else if (n > SITE.maxNights) errors.push({ field: 'checkOut', message: `No máximo ${SITE.maxNights} noites por reserva` });
  if (!Number.isInteger(guests) || guests < 1 || guests > 3) errors.push({ field: 'guests', message: 'Entre 1 e 3 hóspedes por quarto' });
  if (errors.length) throw new HttpError(400, 'As datas não estão certas', errors);
  return n;
}

export async function busyRooms(from, to, { exceptId } = {}) {
  const list = await reservations.findAll((r) => ACTIVE.has(r.status) && r.id !== exceptId && overlaps(r, from, to));
  return new Set(list.map((r) => r.room));
}

// O que o quadro de chaves mostra: as chaves livres para as datas e quantas pessoas cabem em cada quarto
export async function availability(stay = {}) {
  const def = nextWeekend();
  const checkIn = stay.checkIn ?? def.checkIn;
  const checkOut = stay.checkOut ?? (stay.checkIn ? addDays(stay.checkIn, 2) : def.checkOut);
  const guests = stay.guests ?? 2;
  const nights = checkStay({ checkIn, checkOut, guests });
  const busy = await busyRooms(checkIn, checkOut);
  const table = await priceTable();
  const rooms = ROOMS.map((r) => {
    const type = typeBySlug(r.type);
    return { num: r.num, type: r.type, typeName: type.name, free: !busy.has(r.num) && guests <= type.guests, price: table[r.type], total: table[r.type] * nights };
  });
  return {
    checkIn,
    checkOut,
    nights,
    guests,
    free: rooms.filter((r) => r.free).map((r) => r.num),
    rooms,
    types: ROOM_TYPES.map((t) => ({ slug: t.slug, name: t.name, price: table[t.slug], total: table[t.slug] * nights, free: rooms.filter((r) => r.type === t.slug && r.free).map((r) => r.num) })),
  };
}

// Quantos quartos de um tipo estão livres em cada uma das próximas noites (calendário da página do quarto)
export async function typeCalendar(slug, days = 35) {
  const type = typeBySlug(slug);
  const start = today();
  const active = await reservations.findAll((r) => ACTIVE.has(r.status) && r.type === slug && r.checkOut > start);
  return Array.from({ length: days }, (_, i) => {
    const day = addDays(start, i);
    const taken = new Set(active.filter((r) => overlaps(r, day, addDays(day, 1))).map((r) => r.room));
    return { day, free: type.rooms.length - taken.size };
  });
}

export async function createReservation(user, { room, checkIn, checkOut, guests, arrivalTime = '', notes = '' }) {
  const type = typeOfRoom(room);
  if (!type) throw notFound('Quarto');
  const nights = checkStay({ checkIn, checkOut, guests });
  if (guests > type.guests) throw new HttpError(400, `O quarto ${room} é para ${type.guests} pessoas no máximo`, [{ field: 'guests', message: `No máximo ${type.guests} pessoas` }]);
  if ((await busyRooms(checkIn, checkOut)).has(room)) throw new HttpError(409, `A chave do ${room} já saiu do quadro para estas datas. Escolha outro quarto.`);
  const full = await users.findById(user.id);
  const price = await priceOf(type.slug);
  const count = (await reservations.findAll()).length;
  return reservations.create({
    code: `ARR-${4900 + count}`,
    userId: user.id,
    guestName: full.name,
    room,
    type: type.slug,
    checkIn,
    checkOut,
    guests,
    nights,
    total: price * nights,
    status: 'confirmada',
    arrivalTime,
    notes,
  });
}

async function ownReservation(user, id) {
  const r = await reservations.findById(id);
  if (!r || r.userId !== user.id) throw notFound('Reserva');
  return r;
}

export const cancelDeadline = (r) => addDays(r.checkIn, -SITE.freeCancelDays);
export const canCancel = (r) => r.status === 'confirmada' && today() <= cancelDeadline(r);

export async function guestReservations(userId) {
  const list = await reservations.findAll((r) => r.userId === userId);
  const reqs = await requests.findAll((q) => q.userId === userId);
  return list
    .sort((a, b) => (ACTIVE.has(b.status) - ACTIVE.has(a.status)) || a.checkIn.localeCompare(b.checkIn))
    .map((r) => ({ ...r, typeName: typeBySlug(r.type).name, canCancel: canCancel(r), cancelUntil: cancelDeadline(r), requests: reqs.filter((q) => q.reservationId === r.id) }));
}

export async function updateByGuest(user, id, changes) {
  const r = await ownReservation(user, id);
  if (!ACTIVE.has(r.status)) throw new HttpError(409, 'Esta reserva já não pode ser alterada');
  return reservations.update(id, changes);
}

export async function cancelByGuest(user, id) {
  const r = await ownReservation(user, id);
  if (r.status !== 'confirmada') throw new HttpError(409, 'Esta reserva já não pode ser cancelada');
  if (!canCancel(r)) throw new HttpError(409, `O cancelamento sem custos era até ${cancelDeadline(r)}. Escreva para a receção.`);
  return reservations.update(id, { status: 'cancelada', cancelledAt: new Date().toISOString() });
}

export async function addRequest(user, id, { kind, date, notes = '' }) {
  const r = await ownReservation(user, id);
  if (!ACTIVE.has(r.status)) throw new HttpError(409, 'Só se fazem pedidos para estadias que ainda não terminaram');
  if (date < r.checkIn || date > r.checkOut) throw new HttpError(400, 'Escolha um dia da estadia', [{ field: 'date', message: 'Tem de ser um dia da estadia' }]);
  if (date < today()) throw new HttpError(400, 'Esse dia já passou', [{ field: 'date', message: 'Esse dia já passou' }]);
  return requests.create({ reservationId: r.id, userId: user.id, kind, date, notes, status: 'pendente' });
}

// ---------- receção ----------
const withType = (r) => ({ ...r, typeName: typeBySlug(r.type).name });

export async function dayOverview(day = today()) {
  const all = await reservations.findAll();
  const tonight = all.filter((r) => ACTIVE.has(r.status) && overlaps(r, day, addDays(day, 1)));
  const arrivals = all.filter((r) => r.status === 'confirmada' && r.checkIn === day).map(withType);
  const departures = all.filter((r) => r.status === 'em-casa' && r.checkOut <= day).map(withType);
  const inHouse = all.filter((r) => r.status === 'em-casa').map(withType);
  const board = ROOMS.map((room) => {
    const r = tonight.find((x) => x.room === room.num);
    return { num: room.num, typeName: typeBySlug(room.type).name, state: !r ? 'livre' : r.status === 'em-casa' ? 'em-casa' : 'reservado', guest: r?.guestName ?? null, code: r?.code ?? null };
  });
  const pending = (await requests.findAll((q) => q.status === 'pendente')).sort((a, b) => a.date.localeCompare(b.date));
  const byId = new Map(all.map((r) => [r.id, r]));
  return {
    day,
    arrivals,
    departures,
    inHouse,
    board,
    requests: pending.map((q) => ({ ...q, room: byId.get(q.reservationId)?.room, guestName: byId.get(q.reservationId)?.guestName })),
  };
}

export async function listReservations({ status } = {}) {
  const list = await reservations.findAll((r) => !status || r.status === status);
  return list.sort((a, b) => a.checkIn.localeCompare(b.checkIn)).map(withType);
}

const NEXT = { confirmada: ['em-casa', 'cancelada'], 'em-casa': ['terminada'], terminada: [], cancelada: [] };
export async function setStatus(id, status) {
  const r = await reservations.findById(id);
  if (!r) throw notFound('Reserva');
  if (!NEXT[r.status].includes(status)) throw new HttpError(409, `Uma reserva ${r.status} não pode passar a ${status}`);
  return withType(await reservations.update(id, { status }));
}

export async function setRequestStatus(id, status) {
  const q = await requests.findById(id);
  if (!q) throw notFound('Pedido');
  return requests.update(id, { status });
}

export async function allRequests() {
  const all = await reservations.findAll();
  const byId = new Map(all.map((r) => [r.id, r]));
  return (await requests.findAll()).sort((a, b) => a.date.localeCompare(b.date)).map((q) => ({ ...q, room: byId.get(q.reservationId)?.room, guestName: byId.get(q.reservationId)?.guestName }));
}

// A ementa do dia: a de hoje, ou a última que a receção escreveu
export async function currentMenu() {
  const list = (await menus.findAll()).sort((a, b) => b.date.localeCompare(a.date));
  return list.find((m) => m.date === today()) ?? list[0] ?? null;
}

export async function saveTodayMenu(items) {
  const existing = await menus.findOne((m) => m.date === today());
  return existing ? menus.update(existing.id, { items }) : menus.create({ date: today(), items });
}

export async function setPrice(slug, price) {
  if (!typeBySlug(slug)) throw notFound('Quarto');
  return prices.update(slug, { price });
}
