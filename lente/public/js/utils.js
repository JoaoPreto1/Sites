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

export function workCard(project, index) {
  return `
    <a class="work" href="/trabalho/${project.slug}">
      <div class="work__media">
        <img src="${img(project.cover, 800, 1000)}" alt="${escapeHtml(project.title)}" loading="lazy">
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
