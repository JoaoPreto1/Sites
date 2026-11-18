import { vouchers } from '../repositories/index.js';
import { groupPrice } from '../../public/js/shared/pricing.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { addDays, lisbonToday } from '../utils/dates.js';
import { roomBySlug, roomMap } from './room.service.js';

function voucherCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return `CHAVE-${Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')}`;
}

const withRoomName = (voucher, map) => ({ ...voucher, roomName: voucher.roomId ? map.get(voucher.roomId)?.name : null });

export async function createVoucher(data, user) {
  const room = data.room ? await roomBySlug(data.room) : null;
  if (room && data.players > room.players.max) {
    throw new HttpError(400, `${room.name} é para ${room.players.max} pessoas no máximo`, [{ field: 'players', message: `Até ${room.players.max}` }]);
  }

  const voucher = await vouchers.create({
    code: voucherCode(),
    players: data.players,
    roomId: room?.id ?? null,
    amount: groupPrice(data.players).total,
    from: data.from,
    to: data.to,
    message: data.message ?? '',
    buyerName: data.buyerName,
    buyerEmail: data.buyerEmail.toLowerCase(),
    userId: user?.id ?? null,
    status: 'por pagar',
    validUntil: addDays(lisbonToday(), 365),
  });
  return withRoomName(voucher, await roomMap());
}

// Confirmação pública do código antes de reservar: não mostra quem comprou
export async function checkVoucher(code) {
  const voucher = await vouchers.findOne((v) => v.code === code.toUpperCase());
  if (!voucher) throw notFound('Voucher');
  const map = await roomMap();
  return { code: voucher.code, players: voucher.players, room: voucher.roomId ? map.get(voucher.roomId)?.slug : null, status: voucher.status, validUntil: voucher.validUntil };
}

export async function userVouchers(user) {
  const map = await roomMap();
  const list = await vouchers.findAll((v) => v.userId === user.id);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((v) => withRoomName(v, map));
}

export async function adminVouchers() {
  const map = await roomMap();
  const list = await vouchers.findAll();
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((v) => withRoomName(v, map));
}

export async function setVoucherStatus(id, status) {
  const voucher = await vouchers.findById(id);
  if (!voucher) throw notFound('Voucher');
  if (voucher.status === 'usado') throw new HttpError(400, 'Este voucher já foi usado numa reserva');
  return vouchers.update(id, { status });
}
