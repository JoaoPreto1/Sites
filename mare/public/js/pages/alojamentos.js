import { api } from '../api.js';
import { linkDateInputs } from '../date-range.js';
import { params, plural, propertyCard, shortDate } from '../utils.js';

const form = document.querySelector('[data-filters]');
const tags = document.querySelector('[data-tags]');
const results = document.querySelector('[data-results]');
const summary = document.querySelector('[data-summary]');
const clearButton = document.querySelector('[data-clear]');

const state = { checkIn: '', checkOut: '', guests: '', tag: '', sort: '', ...params() };

const sorters = {
  'price-asc': (a, b) => a.pricePerNight - b.pricePerNight,
  'price-desc': (a, b) => b.pricePerNight - a.pricePerNight,
  rating: (a, b) => b.rating - a.rating,
  guests: (a, b) => b.guests - a.guests,
};

function syncForm() {
  form.checkIn.value = state.checkIn;
  form.checkOut.value = state.checkOut;
  form.guests.value = state.guests;
  form.sort.value = state.sort;
  tags.querySelectorAll('.chip').forEach((chip) => chip.classList.toggle('is-active', chip.dataset.tag === state.tag));
}

function queryString(keys) {
  const query = new URLSearchParams();
  for (const key of keys) if (state[key]) query.set(key, state[key]);
  const text = query.toString();
  return text ? `?${text}` : '';
}

function describe(properties) {
  if (!state.checkIn || !state.checkOut) return `<strong>${plural(properties.length, 'casa', 'casas')}</strong> em Lagos`;

  const free = properties.filter((p) => p.available).length;
  return `<strong>${plural(free, 'casa disponível', 'casas disponíveis')}</strong> de ${shortDate(state.checkIn)} a ${shortDate(state.checkOut)}`;
}

async function load() {
  history.replaceState(null, '', `/alojamentos${queryString(['checkIn', 'checkOut', 'guests', 'tag', 'sort'])}`);
  clearButton.hidden = !['checkIn', 'checkOut', 'guests', 'tag', 'sort'].some((key) => state[key]);

  // Só pesquisa por datas quando as duas estão preenchidas
  const query = state.checkIn && state.checkOut ? ['checkIn', 'checkOut', 'guests', 'tag'] : ['guests', 'tag'];

  try {
    const { properties } = await api(`/properties${queryString(query)}`);
    if (sorters[state.sort]) properties.sort(sorters[state.sort]);
    summary.innerHTML = describe(properties);

    if (!properties.length) {
      results.innerHTML = `
        <div class="empty">
          <h3>Nenhuma casa com estes filtros</h3>
          <p>Experimente outras datas ou menos filtros.</p>
        </div>`;
      return;
    }

    const linkQuery = queryString(['checkIn', 'checkOut', 'guests']);
    results.innerHTML = properties.map((property) => propertyCard(property, linkQuery)).join('');
  } catch (error) {
    summary.textContent = error.message;
    results.innerHTML = '';
  }
}

form.addEventListener('change', (event) => {
  if (!['checkIn', 'checkOut', 'guests', 'sort'].includes(event.target.name)) return;
  state.checkIn = form.checkIn.value;
  state.checkOut = form.checkOut.value;
  state.guests = form.guests.value;
  state.sort = form.sort.value;
  load();
});

tags.addEventListener('click', (event) => {
  const chip = event.target.closest('[data-tag]');
  if (!chip) return;
  state.tag = chip.dataset.tag;
  syncForm();
  load();
});

clearButton.addEventListener('click', () => {
  Object.assign(state, { checkIn: '', checkOut: '', guests: '', tag: '', sort: '' });
  syncForm();
  load();
});

linkDateInputs(form.checkIn, form.checkOut);
syncForm();
load();
