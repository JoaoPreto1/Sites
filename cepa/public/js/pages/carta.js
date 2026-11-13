import { api } from '../api.js';
import { carta, shelf } from '../shared/carta.js';
import { plural } from '../shared/format.js';
import { initialData } from '../utils.js';

const form = document.querySelector('[data-filters]');
const results = document.querySelector('[data-results]');
const count = document.querySelector('[data-count]');
const { types } = initialData() ?? {};
let view = new URLSearchParams(window.location.search).get('vista') === 'garrafas' ? 'garrafas' : 'carta';
let wines = initialData()?.wines ?? [];
let request = 0;

function filters() {
  const entries = [...new FormData(form)].filter(([, value]) => String(value).trim());
  return new URLSearchParams(entries);
}

function render() {
  count.textContent = plural(wines.length, 'vinho', 'vinhos');
  if (!wines.length) {
    results.innerHTML = '<p class="empty">Nenhum vinho com estes filtros. <a href="/carta">Ver a carta inteira</a>.</p>';
    return;
  }
  results.innerHTML = view === 'garrafas' ? shelf(wines) : `<div class="carta-list">${carta(types, wines, { note: true })}</div>`;
}

function updateUrl() {
  const query = filters();
  if (view === 'garrafas') query.set('vista', 'garrafas');
  history.replaceState(null, '', `/carta${query.size ? `?${query}` : ''}`);
  for (const link of document.querySelectorAll('[data-view]')) {
    const q = filters();
    q.set('vista', link.dataset.view);
    link.href = `?${q}`;
    if (link.dataset.view === view) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
}

async function load() {
  const id = ++request;
  results.classList.add('is-loading');
  try {
    const data = await api(`/wines?${filters()}`);
    if (id !== request) return;
    wines = data.wines;
    render();
    updateUrl();
  } finally {
    if (id === request) results.classList.remove('is-loading');
  }
}

form.addEventListener('change', (event) => {
  if (event.target.name === 'tipo') {
    form.querySelectorAll('.type-chip').forEach((chip) => chip.classList.toggle('is-active', chip.querySelector('input').checked));
  }
  load();
});

let typing;
form.q.addEventListener('input', () => {
  clearTimeout(typing);
  typing = setTimeout(load, 300);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  load();
});

for (const link of document.querySelectorAll('[data-view]')) {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    view = link.dataset.view;
    render();
    updateUrl();
  });
}
