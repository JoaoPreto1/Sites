import { icon } from './icons.js';

const moneyFormat = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2, minimumFractionDigits: 0 });

export const money = (value) => moneyFormat.format(value);

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export function formatDate(iso, { year = true, weekday = false } = {}) {
  if (!iso) return '';
  const date = new Date(`${iso.slice(0, 10)}T12:00:00`);
  const text = `${date.getDate()} ${MONTHS[date.getMonth()]}${year ? ` ${date.getFullYear()}` : ''}`;
  return weekday ? `${WEEKDAYS[date.getDay()]}, ${text}` : text;
}

export const shortDate = (iso) => formatDate(iso, { year: false });

export function toIsoDate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function addDays(iso, days) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export const todayIso = () => toIsoDate(new Date());

export function nightsBetween(from, to) {
  return Math.round((new Date(`${to}T12:00:00`) - new Date(`${from}T12:00:00`)) / 86400000);
}

export function img(url, width, height) {
  const size = height ? `&h=${height}` : '';
  return `${url}?w=${width}${size}&q=75&auto=format&fit=crop`;
}

// Atributos src/srcset/sizes para o browser escolher o tamanho certo em cada ecrã
export function responsive(url, widths, ratio, sizes) {
  const largest = widths[widths.length - 1];
  const srcset = widths.map((w) => `${img(url, w, Math.round(w * ratio))} ${w}w`).join(', ');
  return `src="${img(url, widths[1] ?? largest, Math.round((widths[1] ?? largest) * ratio))}" srcset="${srcset}" sizes="${sizes}" width="${largest}" height="${Math.round(largest * ratio)}"`;
}

export function initialData() {
  try {
    return JSON.parse(document.getElementById('initial-data')?.textContent ?? 'null');
  } catch {
    return null;
  }
}

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

export const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

export const tagLabels = {
  'vista-mar': 'Vista mar',
  piscina: 'Com piscina',
  familias: 'Famílias',
  casais: 'Casais',
};

export const statusLabels = {
  pendente: 'A aguardar confirmação',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  concluida: 'Concluída',
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

export function params() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

export function toast(message, type = 'info') {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    stack.setAttribute('role', 'status');
    document.body.append(stack);
  }

  const item = document.createElement('div');
  item.className = `toast${type === 'error' ? ' toast--error' : ''}`;
  item.textContent = message;
  stack.append(item);
  setTimeout(() => item.remove(), 4000);
}

export function showFieldErrors(form, details = []) {
  form.querySelectorAll('.field-error').forEach((el) => el.remove());
  form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));

  for (const { field, message } of details) {
    const input = form.elements[field];
    if (!input?.closest) continue;
    input.setAttribute('aria-invalid', 'true');
    const error = document.createElement('span');
    error.className = 'field-error';
    error.textContent = message;
    input.closest('.field')?.append(error);
  }
}

export function propertyCard(property, query = '') {
  const tag = property.tags[0];
  const unavailable = property.available === false;
  const price = property.stay
    ? `<span><strong>${money(property.stay.total)}</strong> · ${plural(property.stay.nights, 'noite', 'noites')}</span>`
    : `<span>desde <strong>${money(property.pricePerNight)}</strong> / noite</span>`;
  const second = property.images[1];

  return `
    <a class="pcard${unavailable ? ' is-unavailable' : ''}" href="/alojamentos/${property.slug}${query}">
      <div class="pcard__media">
        <img ${responsive(property.images[0], [400, 600, 800, 1000], 0.75, '(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 33vw')} alt="${escapeHtml(property.name)}" loading="lazy" decoding="async">
        ${second ? `<img class="pcard__alt" ${responsive(second, [400, 600, 800, 1000], 0.75, '(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 33vw')} alt="" loading="lazy" decoding="async">` : ''}
        ${tag ? `<span class="tag">${tagLabels[tag]}</span>` : ''}
        <span class="pcard__rating">${icon('star', 14)} ${property.rating.toFixed(2)}</span>
      </div>
      <div class="pcard__body">
        <p class="pcard__area">${icon('pin', 15)} ${escapeHtml(property.area)}</p>
        <h3>${escapeHtml(property.name)}</h3>
        <p class="pcard__tagline">${escapeHtml(property.tagline)}</p>
        <ul class="pcard__facts">
          <li>${icon('bed', 17)} ${property.bedrooms}</li>
          <li>${icon('bath', 17)} ${property.bathrooms}</li>
          <li>${icon('users', 17)} ${property.guests}</li>
          <li>${icon('area', 17)} ${property.size} m²</li>
        </ul>
        ${unavailable ? `<p class="pcard__status">Indisponível nestas datas · ${property.unavailableReason}</p>` : ''}
        <div class="pcard__foot">${price}<span class="pcard__go">${icon('arrow', 18)}</span></div>
      </div>
    </a>`;
}
