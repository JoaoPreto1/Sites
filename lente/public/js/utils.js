import { icon } from './icons.js';

const moneyFormat = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
export const money = (value) => moneyFormat.format(value);

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function formatDate(iso, { year = true } = {}) {
  if (!iso) return '';
  const date = new Date(`${iso.slice(0, 10)}T12:00:00`);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}${year ? ` ${date.getFullYear()}` : ''}`;
}

export function daysUntil(iso) {
  const target = new Date(`${iso}T12:00:00`);
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return Math.round((target - now) / 86400000);
}

export function img(url, width, height) {
  const size = height ? `&h=${height}` : '';
  return `${url}?w=${width}${size}&q=75&auto=format&fit=crop`;
}

// Atributos src/srcset/sizes para o browser escolher o tamanho certo em cada ecrã
export function responsive(url, widths, ratio, sizes) {
  const largest = widths[widths.length - 1];
  const middle = widths[Math.floor(widths.length / 2)];
  const srcset = widths.map((w) => `${img(url, w, Math.round(w * ratio))} ${w}w`).join(', ');
  return `src="${img(url, middle, Math.round(middle * ratio))}" srcset="${srcset}" sizes="${sizes}" width="${largest}" height="${Math.round(largest * ratio)}"`;
}

// Dados que o servidor deixa na página para evitar um pedido à API
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

export const pad = (n, size = 3) => String(n).padStart(size, '0');

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
    const name = field.split('.')[0];
    const input = form.elements[name];
    const target = input?.closest ? input : input?.[0];
    if (!target) continue;
    target.setAttribute('aria-invalid', 'true');
    const error = document.createElement('span');
    error.className = 'field-error';
    error.textContent = message;
    target.closest('.field')?.append(error);
  }
}

export const WORK_WIDTHS = [400, 600, 800, 1000, 1200];
export const GRID_SIZES = '(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw';
export const FEATURED_SIZES = '(max-width: 860px) 100vw, 50vw';

// O primeiro cartão visível carrega logo e com prioridade (é o LCP da página)
export function workCard(project, index, { sizes = GRID_SIZES, eager = false } = {}) {
  const loading = eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
  return `
    <a class="work" href="/trabalho/${project.slug}">
      <div class="work__media">
        <img ${responsive(project.cover, WORK_WIDTHS, 1.25, sizes)} alt="${escapeHtml(project.title)}" ${loading}>
        <span class="tag">${escapeHtml(project.category)}</span>
        <span class="work__view">${icon('arrowUp', 22)}</span>
      </div>
      <div class="work__meta">
        <h3>${escapeHtml(project.title)}</h3>
        <span class="mono">${index !== undefined ? `${pad(index + 1)} · ` : ''}${project.year}</span>
      </div>
      <p class="work__client">${escapeHtml(project.client)} — ${escapeHtml(project.summary)}</p>
    </a>`;
}
