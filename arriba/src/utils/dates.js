// Datas de estadia como texto AAAA-MM-DD, sempre no fuso de Lisboa (o dia do hotel)
const DAY = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const SHORT_DAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(new Date());
const asDate = (iso) => new Date(`${iso}T12:00:00Z`);
export const addDays = (iso, n) => new Date(asDate(iso).getTime() + n * DAY).toISOString().slice(0, 10);
export const nightsBetween = (from, to) => Math.round((asDate(to) - asDate(from)) / DAY);
export const isIsoDay = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(asDate(v).getTime()) && asDate(v).toISOString().startsWith(v);

// A primeira sexta-feira depois de hoje: as datas que o quadro mostra quando ninguém escolheu outras
export function nextWeekend(from = today()) {
  const wd = asDate(from).getUTCDay();
  const checkIn = addDays(from, (5 - wd + 7) % 7 || 7);
  return { checkIn, checkOut: addDays(checkIn, 2) };
}

export const dayShort = (iso) => {
  const d = asDate(iso);
  return `${SHORT_DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()].slice(0, 3)}`;
};
export const dayLong = (iso) => {
  const d = asDate(iso);
  return `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`;
};
export const nights = (n) => `${n} ${n === 1 ? 'noite' : 'noites'}`;
