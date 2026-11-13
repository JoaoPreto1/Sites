// Usado no servidor e no browser: nada aqui pode depender do DOM

const moneyFormat = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
export const money = (value) => moneyFormat.format(value).replace(/\s/g, ' ');

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

const parse = (iso) => new Date(`${iso.slice(0, 10)}T12:00:00Z`);

export const monthName = (iso) => MONTHS[parse(iso).getUTCMonth()];

export function longDate(iso) {
  const d = parse(iso);
  return `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`;
}

export function shortDate(iso) {
  const d = parse(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()].slice(0, 3)} ${d.getUTCFullYear()}`;
}

export const dayNumber = (iso) => parse(iso).getUTCDate();
export const weekday = (iso) => WEEKDAYS[parse(iso).getUTCDay()];

export const vintage = (wine) => (wine.year ? String(wine.year) : 'Sem ano');

export const wineTitle = (wine) => (wine.year ? `${wine.name} ${wine.year}` : wine.name);

export const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;
