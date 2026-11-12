import { api } from '../api.js';
import { escapeHtml, img, initialData, pad, params, workCard } from '../utils.js';

const filters = document.querySelector('[data-filters]');
const grid = document.querySelector('[data-works]');
const list = document.querySelector('[data-list]');
const count = document.querySelector('[data-count]');
const toggle = document.querySelectorAll('[data-view]');

let projects = [];
let categories = [];
let current = params().categoria ?? '';

function renderFilters() {
  const total = (category) => projects.filter((p) => !category || p.category === category).length;
  filters.innerHTML = ['', ...categories]
    .map((c) => `<button class="filter${c === current ? ' is-active' : ''}" type="button" data-category="${c}">${c || 'Tudo'}<sup>${total(c)}</sup></button>`)
    .join('');
}

function render() {
  const visible = projects.filter((p) => !current || p.category === current);
  count.textContent = `Portefólio · ${visible.length} ${visible.length === 1 ? 'projeto' : 'projetos'}`;

  grid.innerHTML = visible.map((p, i) => workCard(p, i, { eager: i === 0 })).join('');
  list.innerHTML = visible
    .map(
      (p, i) => `
      <a class="index__row" href="/trabalho/${p.slug}">
        <span class="mono">${pad(i + 1)}</span>
        <img src="${img(p.cover, 240, 180)}" alt="" loading="lazy">
        <strong>${escapeHtml(p.title)}</strong>
        <span class="mono">${escapeHtml(p.category)} · ${escapeHtml(p.client)}</span>
        <span class="mono">${p.year}</span>
      </a>`,
    )
    .join('');

  const url = current ? `/trabalho?categoria=${encodeURIComponent(current)}` : '/trabalho';
  history.replaceState(null, '', url);
}

filters.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  current = button.dataset.category;
  renderFilters();
  render();
});

toggle.forEach((button) =>
  button.addEventListener('click', () => {
    toggle.forEach((b) => b.classList.toggle('is-active', b === button));
    const asList = button.dataset.view === 'list';
    list.hidden = !asList;
    grid.hidden = asList;
  }),
);

try {
  ({ projects, categories } = initialData() ?? (await api('/projects')));
  if (!categories.includes(current)) current = '';
  renderFilters();
  render();
} catch {
  grid.innerHTML = '<p class="empty">Não foi possível carregar os projetos.</p>';
}
