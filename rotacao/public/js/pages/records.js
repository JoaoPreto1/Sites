// Caixotes: os filtros mudam a lista sem recarregar a página, e o URL acompanha
import { api } from '../api.js';
import { setupQuickPlay } from '../miniplayer.js';
import { cover, coverSrcset, duration, escapeHtml, grade, price } from '../shared/format.js';
import { icons } from '../shared/icons.js';
import { initialData } from '../utils.js';

const data = initialData();
const known = new Map(data.records.map((r) => [r.id, r]));
const form = document.querySelector('[data-filters]');
const results = document.querySelector('[data-results]');
const count = document.querySelector('[data-count]');
const TAGS = ['', 'tag--pink', 'tag--mint', 'tag--orange'];

let view = new URLSearchParams(location.search).get('vista') === 'lista' ? 'lista' : 'capas';

setupQuickPlay((id) => known.get(id));

const card = (r, i) => `
  <article class="record-card">
    <div class="sleeve" style="--label:${r.color}">
      <span class="sleeve__vinyl" aria-hidden="true"></span>
      <img class="sleeve__cover" src="${cover(r, 300)}" srcset="${coverSrcset(r)}" sizes="(max-width: 600px) 45vw, 240px" width="600" height="600" alt="Capa de ${escapeHtml(`${r.artist} — ${r.title}`)}" decoding="async">
      <span class="tag ${TAGS[i % TAGS.length]}">${price(r.price)}</span>
      <button class="record-card__play" type="button" data-play="${r.id}" aria-pressed="false" aria-label="Ouvir ${escapeHtml(r.title)}">${icons.play}${icons.pause}</button>
    </div>
    <h3><a href="/discos/${r.id}">${escapeHtml(r.artist)}</a></h3>
    <p>${escapeHtml(r.title)}</p>
    <div class="record-card__meta"><span>${r.year} · ${escapeHtml(r.label)}</span><span class="chip">${grade(r)}</span></div>
  </article>`;

const row = (r) => `
  <li class="row">
    <button class="row__play" type="button" data-play="${r.id}" aria-pressed="false" aria-label="Ouvir ${escapeHtml(r.title)}">${icons.play}${icons.pause}</button>
    <img src="${cover(r, 100)}" width="56" height="56" alt="" decoding="async">
    <a class="row__name" href="/discos/${r.id}"><b>${escapeHtml(r.artist)}</b><span>${escapeHtml(r.title)}</span></a>
    <span class="row__meta mono">${r.year} · ${escapeHtml(r.label)}</span>
    <span class="row__meta mono">${r.tracks.length} faixas · ${duration(r.tracks.reduce((s, t) => s + t.ms, 0))}</span>
    <span class="chip">${grade(r)}</span>
    <b class="row__price">${price(r.price)}</b>
    <button class="row__add" type="button" data-add="${r.id}" data-name="${escapeHtml(r.title)}" aria-label="Juntar ${escapeHtml(r.title)} ao saco"${r.stock ? '' : ' disabled'}>${icons.bag}</button>
  </li>`;

function render(records) {
  count.textContent = `${records.length} ${records.length === 1 ? 'disco' : 'discos'}`;
  if (!records.length) {
    results.innerHTML = `<div class="none"><p class="display">Nada neste caixote.</p><p>Tenta tirar um filtro, ou deixa o disco na <a href="/procura">parede da procura</a> e avisamos quando entrar.</p></div>`;
    return;
  }
  results.innerHTML = view === 'lista' ? `<ol class="rows">${records.map(row).join('')}</ol>` : `<div class="records-grid">${records.map(card).join('')}</div>`;
}

function params() {
  const p = new URLSearchParams();
  for (const [key, value] of new FormData(form)) if (value && key !== 'vista') p.set(key, value);
  if (view === 'lista') p.set('vista', 'lista');
  return p;
}

let controller = null;
async function update() {
  const p = params();
  history.replaceState(null, '', `/discos${p.toString() ? `?${p}` : ''}`);
  controller?.abort();
  controller = new AbortController();
  results.classList.add('is-loading');
  try {
    const query = new URLSearchParams(p);
    query.delete('vista');
    const { records } = await api(`/discos?${query}`);
    records.forEach((r) => known.set(r.id, r));
    render(records);
  } catch {
  } finally {
    results.classList.remove('is-loading');
  }
}

let timer = 0;
form.addEventListener('input', (event) => {
  clearTimeout(timer);
  timer = setTimeout(update, event.target.type === 'search' ? 250 : 0);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const button = event.submitter;
  if (button?.name === 'vista') {
    view = button.value;
    form.querySelectorAll('[name="vista"]').forEach((b) => b.setAttribute('aria-pressed', b === button));
  }
  update();
});
