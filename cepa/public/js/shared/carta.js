import { bottle } from './bottle.js';
import { escapeHtml, money, plural, vintage } from './format.js';

// Uma linha da carta: nome ........ preço, como num menu impresso
export function entry(wine, { note = false, add = true } = {}) {
  const soldOut = wine.stock <= 0;
  return `
    <article class="entry${soldOut ? ' entry--out' : ''}" data-wine="${wine.id}">
      <a class="entry__line" href="/carta/${wine.slug}">
        <span class="entry__name">${escapeHtml(wine.name)} <em>${vintage(wine)}</em></span>
        <span class="entry__leader" aria-hidden="true"></span>
        <span class="entry__price">${soldOut ? 'Esgotado' : money(wine.price)}</span>
      </a>
      <p class="entry__meta">${escapeHtml(wine.producer?.name ?? '')} · ${escapeHtml(wine.regionName ?? '')} · ${escapeHtml(wine.grapes.join(', '))}</p>
      ${note ? `<p class="entry__note">${escapeHtml(wine.notes)}</p>` : ''}
      ${add && !soldOut ? `<button class="entry__add" type="button" data-add="${wine.id}" data-name="${escapeHtml(wine.name)}" aria-label="Juntar ${escapeHtml(wine.name)} ao cesto">+</button>` : ''}
    </article>`;
}

export function section(type, wines, options) {
  if (!wines.length) return '';
  return `
    <section class="carta-section" aria-labelledby="sec-${type.slug}">
      <header class="carta-section__head">
        <h2 id="sec-${type.slug}">${escapeHtml(type.name)}</h2>
        <span class="mono">${plural(wines.length, 'vinho', 'vinhos')}</span>
      </header>
      ${wines.map((w) => entry(w, options)).join('')}
    </section>`;
}

export function carta(types, wines, options) {
  return types.map((type) => section(type, wines.filter((w) => w.type === type.slug), options)).join('');
}

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

// Resultado do "o que vai para a mesa": a primeira sugestão em destaque e as outras em linha
export function pairingResult({ picks, people, overBudget }) {
  if (!picks.length) return '<p class="pairing__empty">Ainda não temos nada na carta para isto. Fale connosco na loja.</p>';
  const [first, ...rest] = picks;
  const bottles = plural(first.bottles, 'garrafa', 'garrafas');

  return `
    ${overBudget ? '<p class="pairing__warn mono">Nada abaixo desse valor; estas são as mais em conta.</p>' : ''}
    <article class="pick">
      <a class="pick__bottle" href="/carta/${first.slug}" tabindex="-1">${bottle(first)}</a>
      <div class="pick__body">
        <p class="mono pick__kicker">A nossa escolha · ${escapeHtml(first.regionName)}</p>
        <h2><a href="/carta/${first.slug}">${escapeHtml(first.name)} <em>${vintage(first)}</em></a></h2>
        <p class="pick__reason">${escapeHtml(first.reason)}</p>
        <p class="pick__note">“${escapeHtml(first.staffNote || first.notes)}”</p>
        <div class="pick__buy">
          <span class="pick__price">${money(first.price)}</span>
          <button class="btn" type="button" data-add="${first.id}" data-name="${escapeHtml(first.name)}" data-qty="${first.bottles}">Levar ${bottles}${people > 1 ? ` para ${people}` : ''}</button>
        </div>
      </div>
    </article>
    ${rest.length ? `<div class="pick-alts"><p class="mono">Ou então</p>${rest.map((w) => `${entry(w)}<p class="pick-alts__reason">${escapeHtml(w.reason)}</p>`).join('')}</div>` : ''}`;
}
