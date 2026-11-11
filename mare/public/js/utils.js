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
    ? `<strong>${money(property.stay.total)}</strong>${plural(property.stay.nights, 'noite', 'noites')}`
    : `<strong>${money(property.pricePerNight)}</strong>/ noite`;

  return `
    <a class="property-card${unavailable ? ' is-unavailable' : ''}" href="/alojamentos/${property.slug}${query}">
      <div class="property-card__media">
        <img src="${img(property.images[0], 800, 880)}" alt="${escapeHtml(property.name)}" loading="lazy">
        ${tag ? `<span class="tag">${tagLabels[tag]}</span>` : ''}
      </div>
      <div class="property-card__row">
        <div>
          <h3>${escapeHtml(property.name)}</h3>
          <p class="property-card__meta">${plural(property.bedrooms, 'quarto', 'quartos')} · ${property.guests} hóspedes · ★ ${property.rating.toFixed(2)}</p>
        </div>
        <p class="property-card__price">${price}</p>
      </div>
      ${unavailable ? `<p class="property-card__status">Indisponível nestas datas (${property.unavailableReason})</p>` : ''}
    </a>`;
}
