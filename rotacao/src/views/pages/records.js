import { cover, duration, escapeHtml, grade, price } from '../../../public/js/shared/format.js';
import { icons } from '../../../public/js/shared/icons.js';
import { gradeLegend, recordCard } from '../components.js';

export const PRICES = [
  [25, 'Até 25 €'],
  [35, 'Até 35 €'],
  [50, 'Até 50 €'],
];

export const ORDERS = [
  ['chegada', 'Últimas entradas'],
  ['preco', 'Mais baratos'],
  ['preco-desc', 'Mais caros'],
  ['ano', 'Mais antigos'],
  ['artista', 'Artista (A–Z)'],
];

const option = (value, label, current) => `<option value="${value}"${String(current) === String(value) ? ' selected' : ''}>${label}</option>`;

// Linha da vista em lista, como uma folha de inventário da loja
export function recordRow(record) {
  const minutes = duration(record.tracks.reduce((s, t) => s + t.ms, 0));
  return `
    <li class="row">
      <button class="row__play" type="button" data-play="${record.id}" aria-pressed="false" aria-label="Ouvir ${escapeHtml(record.title)}">${icons.play}${icons.pause}</button>
      <img src="${cover(record, 100)}" width="56" height="56" alt="" loading="lazy" decoding="async">
      <a class="row__name" href="/discos/${record.id}"><b>${escapeHtml(record.artist)}</b><span>${escapeHtml(record.title)}</span></a>
      <span class="row__meta mono">${record.year} · ${escapeHtml(record.label)}</span>
      <span class="row__meta mono">${record.tracks.length} faixas · ${minutes}</span>
      <span class="chip">${grade(record)}</span>
      <b class="row__price">${price(record.price)}</b>
      <button class="row__add" type="button" data-add="${record.id}" data-name="${escapeHtml(record.title)}" aria-label="Juntar ${escapeHtml(record.title)} ao saco"${record.stock ? '' : ' disabled'}>${icons.bag}</button>
    </li>`;
}

export const recordsResults = (records, view) =>
  records.length
    ? view === 'lista'
      ? `<ol class="rows">${records.map(recordRow).join('')}</ol>`
      : `<div class="records-grid">${records.map((r, i) => recordCard(r, { index: i, eager: i < 4, reveal: false })).join('')}</div>`
    : `<div class="none"><p class="display">Nada neste caixote.</p><p>Tenta tirar um filtro, ou deixa o disco na <a href="/procura">parede da procura</a> e avisamos quando entrar.</p></div>`;

export function recordsPage({ records, catalog, filters, view, title }) {
  const tabs = [`<a href="/discos"${!filters.caixote ? ' aria-current="page"' : ''}>Tudo</a>`, ...catalog.crates.map((c) => `<a href="/discos?caixote=${c.slug}"${filters.caixote === c.slug ? ' aria-current="page"' : ''}>${c.name}</a>`)].join('');

  return `
  <section class="records wrap">
    <header class="page-head records__head">
      <div>
        <p class="kicker">${catalog.total} discos · ${catalog.crates.length} caixotes</p>
        <h1 class="display">${escapeHtml(title)}</h1>
        <p>Todos os discos têm pré-escuta: carrega no botão da capa e ouve 30 segundos antes de decidir. Os usados são limpos e classificados à mão.</p>
      </div>
      ${gradeLegend(catalog.grades)}
    </header>

    <nav class="dividers" aria-label="Caixotes" data-tabs>${tabs}</nav>

    <form class="filters" data-filters action="/discos" role="search">
      ${filters.caixote ? `<input type="hidden" name="caixote" value="${filters.caixote}">` : ''}
      <label class="filters__search"><span class="sr-only">Procurar</span><input class="input" type="search" name="q" value="${escapeHtml(filters.q ?? '')}" placeholder="Artista, disco, editora ou faixa" autocomplete="off"></label>
      <label class="field"><span>Estado mínimo</span><select class="input" name="estado">${option('', 'Qualquer', filters.estado ?? '')}${catalog.grades.map((g) => option(g.code, `${g.code} · ${g.name}`, filters.estado)).join('')}</select></label>
      <label class="field"><span>Preço</span><select class="input" name="ate">${option('', 'Qualquer', filters.ate ?? '')}${PRICES.map(([v, l]) => option(v, l, filters.ate)).join('')}</select></label>
      <label class="field"><span>Ordem</span><select class="input" name="ordem">${ORDERS.map(([v, l]) => option(v, l, filters.ordem ?? 'chegada')).join('')}</select></label>
      <div class="filters__view" role="group" aria-label="Vista">
        <button type="submit" name="vista" value="capas" aria-pressed="${view !== 'lista'}">Capas</button>
        <button type="submit" name="vista" value="lista" aria-pressed="${view === 'lista'}">Lista</button>
      </div>
      <noscript><button class="btn btn--small" type="submit">Filtrar</button></noscript>
    </form>

    <h2 class="sr-only">Discos</h2>
    <p class="records__count mono" data-count role="status">${records.length} ${records.length === 1 ? 'disco' : 'discos'}</p>
    <div class="records__results" data-results>${recordsResults(records, view)}</div>
  </section>`;
}
