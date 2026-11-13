import { bottle } from './bottle.js';
import { escapeHtml, money, plural, vintage } from './format.js';

// Uma linha da carta, em colunas como numa carta de restaurante: vinho, região, ano e preço
export function entry(wine, { note = false, add = true } = {}) {
  const soldOut = wine.stock <= 0;
  return `
    <article class="entry${soldOut ? ' entry--out' : ''}" data-wine="${wine.id}">
      <div class="entry__main">
        <a class="entry__name" href="/carta/${wine.slug}">${escapeHtml(wine.name)}</a>
        <p class="entry__by">${escapeHtml(wine.producer?.name ?? '')} · ${escapeHtml(wine.grapes.join(', '))}</p>
        ${note ? `<p class="entry__note">${escapeHtml(wine.notes)}</p>` : ''}
      </div>
      <span class="entry__region" data-year=" · ${vintage(wine)}">${escapeHtml(wine.regionName ?? '')}</span>
      <span class="entry__year">${wine.year ?? '—'}</span>
      <span class="entry__price">${soldOut ? 'Esgotado' : money(wine.price)}</span>
      ${add && !soldOut ? `<button class="entry__add" type="button" data-add="${wine.id}" data-name="${escapeHtml(wine.name)}" aria-label="Juntar ${escapeHtml(wine.name)} ao cesto">+</button>` : '<span></span>'}
    </article>`;
}

const columns = '<div class="carta-cols" aria-hidden="true"><span>Vinho</span><span>Região</span><span>Ano</span><span>Garrafa</span><span></span></div>';

export function section(type, wines, options) {
  if (!wines.length) return '';
  return `
    <section class="carta-section" aria-labelledby="sec-${type.slug}">
      <header class="carta-section__head">
        <h2 id="sec-${type.slug}">${escapeHtml(type.name)}</h2>
        <span class="mono">${plural(wines.length, 'vinho', 'vinhos')}</span>
      </header>
      ${columns}
      ${wines.map((w) => entry(w, options)).join('')}
    </section>`;
}

export function carta(types, wines, options) {
  return types.map((type) => section(type, wines.filter((w) => w.type === type.slug), options)).join('');
}

// Lista simples (sem secções), com cabeçalho de colunas
export const entries = (wines, options) => `<div class="entries">${columns}${wines.map((w) => entry(w, options)).join('')}</div>`;

// A mesma carta vista como prateleira de garrafas
export function shelfItem(wine) {
  const soldOut = wine.stock <= 0;
  return `
    <a class="shelf-item${soldOut ? ' shelf-item--out' : ''}" href="/carta/${wine.slug}">
      <span class="shelf-item__bottle">${bottle(wine, { title: false })}</span>
      <span class="shelf-item__name">${escapeHtml(wine.name)}</span>
      <span class="shelf-item__meta mono">${escapeHtml(wine.regionName ?? '')} · ${vintage(wine)}</span>
      <span class="shelf-item__price">${soldOut ? 'Esgotado' : money(wine.price)}</span>
    </a>`;
}

export const shelf = (wines) => `<div class="shelf">${wines.map(shelfItem).join('')}</div>`;

const PEOPLE_WORDS = ['', 'sozinho', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze'];
export const peopleWord = (n) => PEOPLE_WORDS[n] ?? String(n);

function pickCard(wine, main) {
  const bottles = plural(wine.bottles, 'garrafa', 'garrafas');
  return `
    <article class="pick${main ? ' pick--main' : ''}">
      <p class="pick__badge mono">${main ? 'A nossa escolha' : 'Também resulta'}</p>
      <a class="pick__bottle" href="/carta/${wine.slug}" tabindex="-1" aria-hidden="true">${bottle(wine, { title: false })}</a>
      <p class="pick__kind mono">${escapeHtml(wine.regionName)} · ${escapeHtml(wine.typeName)}</p>
      <h3><a href="/carta/${wine.slug}">${escapeHtml(wine.name)} <em>${vintage(wine)}</em></a></h3>
      <p class="pick__reason">${escapeHtml(wine.reason)}</p>
      <div class="pick__buy">
        <span class="pick__price">${money(wine.price)}</span>
        <button class="${main ? 'btn btn--wine' : 'btn btn--line'}" type="button" data-add="${wine.id}" data-name="${escapeHtml(wine.name)}" data-qty="${wine.bottles}">Levar ${bottles}</button>
      </div>
    </article>`;
}

// Resultado do "o que vai para a mesa": três cartões lado a lado
export function pairingResult({ picks, people, dish, overBudget }) {
  if (!picks.length) return '<p class="pairing__empty">Ainda não temos nada na carta para isto. Fale connosco na loja.</p>';
  const [first] = picks;
  const bottles = plural(first.bottles, 'garrafa', 'garrafas');

  return `
    <h2 class="sr-only">Sugestões para ${escapeHtml(dish.name)}</h2>
    ${overBudget ? '<p class="pairing__warn mono">Nada abaixo desse valor; estas são as mais em conta.</p>' : ''}
    <div class="picks">${picks.map((w, i) => pickCard(w, i === 0)).join('')}</div>
    <p class="pairing__note"><span class="mono">Nota do escanção</span>${people <= 3 ? 'Uma garrafa chega para até três pessoas.' : `Uma garrafa chega para três pessoas, por isso para ${people} sugerimos ${bottles}.`} ${escapeHtml(first.staffNote || first.notes)}</p>`;
}
