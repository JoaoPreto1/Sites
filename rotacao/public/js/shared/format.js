// Usado no servidor e no browser: nada aqui pode depender do DOM

const moneyFormat = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
const roundFormat = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

export const money = (value) => moneyFormat.format(value).replace(/\s/g, ' ');
export const price = (value) => (Number.isInteger(value) ? roundFormat.format(value) : moneyFormat.format(value)).replace(/\s/g, ' ');

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

// As capas vêm do iTunes num endereço com o tamanho lá dentro
export const cover = (record, size = 600) => record.artwork.replaceAll('{size}', size);
export const coverSrcset = (record, sizes = [300, 600, 1000]) => sizes.map((s) => `${cover(record, s)} ${s}w`).join(', ');

export function duration(ms) {
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export const grade = (record) => (record.sleeve === record.media ? record.media : `${record.media} / ${record.sleeve}`);

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

const parse = (iso) => new Date(`${iso.slice(0, 10)}T12:00:00Z`);

export const weekday = (iso) => WEEKDAYS[parse(iso).getUTCDay()];
export const weekdayShort = (iso) => weekday(iso).slice(0, 3);
export const dayNumber = (iso) => parse(iso).getUTCDate();

export function longDate(iso) {
  const d = parse(iso);
  return `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`;
}

export function shortDate(iso) {
  const d = parse(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()].slice(0, 3)}`;
}

export const hour = (h) => `${String(h % 24).padStart(2, '0')}h`;

export const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;
