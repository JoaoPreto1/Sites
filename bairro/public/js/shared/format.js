const euroFormat = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });

export const euros = (value) => `${euroFormat.format(value)} €`;

export const range = (min, max) => `${euros(min)} a ${euros(max)}`;

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export const monthName = (yyyyMm) => {
  const [year, month] = yyyyMm.split('-').map(Number);
  return { name: MONTHS[month - 1], short: SHORT[month - 1], year };
};

export function dateLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  return `${d.getUTCDate()} ${SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function timeLabel(iso) {
  const d = new Date(iso);
  return d.toLocaleString('pt-PT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Lisbon' });
}

export const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Fotografias do Unsplash no tamanho certo para cada ecrã
export const photoUrl = (id, width, ratio) =>
  `https://images.unsplash.com/photo-${id}?w=${width}${ratio ? `&h=${Math.round(width * ratio)}` : ''}&q=70&auto=format&fit=crop`;

export const photoSrcset = (id, widths, ratio) => widths.map((w) => `${photoUrl(id, w, ratio)} ${w}w`).join(', ');

export const weeksLabel = ([a, b]) => (a === b ? `${a} semanas` : `${a} a ${b} semanas`);

export const slugFile = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
