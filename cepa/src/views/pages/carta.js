import { carta, shelf } from '../../../public/js/shared/carta.js';
import { escapeHtml, plural } from '../../../public/js/shared/format.js';

export const PRICES = [
  [15, 'até 15 €'],
  [25, 'até 25 €'],
  [40, 'até 40 €'],
];

export const ORDERS = [
  ['carta', 'pela ordem da carta'],
  ['preco-asc', 'do mais barato'],
  ['preco-desc', 'do mais caro'],
  ['antigos', 'dos mais antigos'],
];

const option = (value, label, selected) => `<option value="${value}"${String(value) === String(selected ?? '') ? ' selected' : ''}>${escapeHtml(label)}</option>`;

export function cartaResults({ wines, types, view }) {
  if (!wines.length) {
    return '<p class="empty">Nenhum vinho com estes filtros. <a href="/carta">Ver a carta inteira</a>.</p>';
  }
  return view === 'garrafas' ? shelf(wines) : `<div class="carta-list">${carta(types, wines, { note: true })}</div>`;
}

export function cartaPage({ wines, catalog, filters, view }) {
  const { types, regions, dishes, total } = catalog;
  const typeLinks = [{ slug: '', name: 'Tudo', count: total }, ...types]
    .map((t) => {
      const active = (filters.tipo ?? '') === t.slug;
      return `<label class="type-chip${active ? ' is-active' : ''}"><input type="radio" name="tipo" value="${t.slug}"${active ? ' checked' : ''}><span>${escapeHtml(t.name)}</span><sup>${t.count}</sup></label>`;
    })
    .join('');

  return `
  <section class="carta-page wrap">
    <header class="carta-head">
      <p class="kicker mono"><span>Garrafeira Cepa · Porto</span></p>
      <h1 class="title-xl">A carta</h1>
      <p class="carta-head__intro">Todos os vinhos que temos na loja, de pequenos produtores portugueses que visitámos pelo menos uma vez. Preços por garrafa, com IVA.</p>
    </header>

    <form class="filters" action="/carta" method="get" data-filters>
      <fieldset class="filters__types">
        <legend class="sr-only">Tipo de vinho</legend>
        ${typeLinks}
      </fieldset>
      <div class="filters__row">
        <label class="filters__field"><span class="mono">Região</span>
          <select class="input" name="regiao">${option('', 'todas', filters.regiao)}${regions.map((r) => option(r.slug, r.name, filters.regiao)).join('')}</select>
        </label>
        <label class="filters__field"><span class="mono">Para</span>
          <select class="input" name="prato">${option('', 'qualquer prato', filters.prato)}${dishes.map((d) => option(d.slug, d.name, filters.prato)).join('')}</select>
        </label>
        <label class="filters__field"><span class="mono">Preço</span>
          <select class="input" name="ate">${option('', 'qualquer preço', filters.ate)}${PRICES.map(([v, l]) => option(v, l, filters.ate)).join('')}</select>
        </label>
        <label class="filters__field"><span class="mono">Ordenar</span>
          <select class="input" name="ordem">${ORDERS.map(([v, l]) => option(v, l, filters.ordem ?? 'carta')).join('')}</select>
        </label>
        <label class="filters__field filters__search"><span class="mono">Procurar</span>
          <input class="input" type="search" name="q" value="${escapeHtml(filters.q ?? '')}" placeholder="casta, produtor…" maxlength="60">
        </label>
        <noscript><button class="btn btn--line" type="submit">Filtrar</button></noscript>
      </div>
    </form>

    <div class="carta-bar">
      <p class="mono" data-count>${plural(wines.length, 'vinho', 'vinhos')}</p>
      <div class="view-toggle" role="group" aria-label="Ver como">
        <a href="?${new URLSearchParams({ ...filters, vista: 'carta' })}" data-view="carta"${view === 'carta' ? ' aria-current="true"' : ''}>Carta</a>
        <a href="?${new URLSearchParams({ ...filters, vista: 'garrafas' })}" data-view="garrafas"${view === 'garrafas' ? ' aria-current="true"' : ''}>Garrafas</a>
      </div>
    </div>

    <div class="carta-results" data-results aria-live="polite">${cartaResults({ wines, types, view })}</div>
  </section>`;
}
