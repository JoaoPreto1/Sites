const lisbon = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' });

// As salas são no Porto: "hoje" e "este mês" contam na hora de Portugal
export const lisbonToday = (date = new Date()) => lisbon.format(date);

export const lisbonMonth = (date = new Date()) => lisbonToday(date).slice(0, 7);

export function addDays(iso, days) {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// 0 = domingo … 6 = sábado
export const weekday = (iso) => new Date(`${iso}T12:00:00Z`).getUTCDay();

export function lisbonNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Lisbon', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
  return parts;
}
