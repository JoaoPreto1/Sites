import { bookings } from '../repositories/index.js';
import { lisbonMonth } from '../utils/dates.js';
import { listRooms } from './room.service.js';

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const monthName = (ym) => `${MONTHS[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;

const entry = (b) => ({ team: b.team, players: b.players, seconds: b.result.seconds, hints: b.result.hints, date: b.date });

// Registo de fugas: as equipas que saíram, da mais rápida para a mais lenta, sala a sala
export async function escapeLog({ month = lisbonMonth(), limit = 8 } = {}) {
  const [rooms, played] = await Promise.all([listRooms(), bookings.findAll((b) => b.status === 'jogada' && b.result)]);
  const months = [...new Set(played.map((b) => b.date.slice(0, 7)))].sort().reverse();
  const current = months.includes(month) ? month : months[0];
  const inMonth = played.filter((b) => b.date.startsWith(current));

  const pages = rooms.map((room) => {
    const games = inMonth.filter((b) => b.roomId === room.id);
    const escaped = games.filter((b) => b.result.escaped).sort((a, b) => a.result.seconds - b.result.seconds);
    return {
      room: { slug: room.slug, name: room.name, short: room.short, caseNo: room.caseNo, color: room.color, duration: room.duration },
      games: games.length,
      escaped: escaped.length,
      entries: escaped.slice(0, limit).map(entry),
    };
  });

  return { month: current, monthName: monthName(current), months: months.slice(0, 6).map((m) => ({ value: m, name: monthName(m) })), pages };
}

// Melhor tempo de sempre de cada sala, para os cartões da página inicial
export async function records() {
  const played = await bookings.findAll((b) => b.status === 'jogada' && b.result?.escaped);
  const best = new Map();
  for (const b of played) {
    if (!best.has(b.roomId) || b.result.seconds < best.get(b.roomId).seconds) best.set(b.roomId, entry(b));
  }
  return best;
}
