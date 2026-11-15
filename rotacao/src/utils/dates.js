const DAY = 24 * 60 * 60 * 1000;

// A loja é em Lisboa: as datas e as horas das salas contam na hora de Portugal
const lisbon = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Lisbon',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
});

export function lisbonNow(date = new Date()) {
  const parts = Object.fromEntries(lisbon.formatToParts(date).map((p) => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

export const today = () => lisbonNow().date;

export function addDays(iso, days) {
  const d = new Date(`${iso}T12:00:00Z`);
  return new Date(d.getTime() + days * DAY).toISOString().slice(0, 10);
}

export const daysBetween = (from, to) => Math.round((new Date(`${to}T12:00:00Z`) - new Date(`${from}T12:00:00Z`)) / DAY);

// Horas que faltam até ao início de uma marcação (aproximado à hora)
export function hoursUntil(date, hour) {
  const now = lisbonNow();
  return daysBetween(now.date, date) * 24 + hour - now.hour;
}

export const round = (value) => Math.round(value * 100) / 100;
