import { entry } from '../../../public/js/shared/carta.js';
import { escapeHtml } from '../../../public/js/shared/format.js';
import { photo } from '../helpers.js';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export function producersPage({ producers, wines, regionName }) {
  const winesOf = (id) => wines.filter((w) => w.producerId === id);

  return `
  <section class="book wrap">
    <header class="book__head">
      <p class="kicker mono"><span>Produtores</span></p>
      <h1 class="title-xl">Quem está <em>por trás</em> de cada garrafa</h1>
      <p>Só vendemos vinho de quem conhecemos. Estes são os produtores com quem trabalhamos — visitámos todos, almoçámos com quase todos.</p>
    </header>

    <nav class="book__index" aria-label="Índice">
      <ol>
        ${producers
          .map(
            (p, i) => `
        <li><a href="#${p.slug}"><span class="mono">${ROMAN[i]}</span><span class="book__index-name">${escapeHtml(p.name)}</span><span class="book__index-dots" aria-hidden="true"></span><span class="mono">${escapeHtml(regionName[p.region])}</span></a></li>`,
          )
          .join('')}
      </ol>
    </nav>

    ${producers
      .map(
        (p, i) => `
    <article class="chapter${i % 2 ? ' chapter--flip' : ''}" id="${p.slug}" aria-labelledby="t-${p.slug}">
      <div class="chapter__media">
        ${photo(p.photo, { widths: [480, 800, 1100], ratio: 0.8, sizes: '(max-width: 900px) 100vw, 50vw', alt: `Paisagem da ${p.name}` })}
        <figure class="chapter__portrait">${photo(p.portrait, { widths: [240, 360], ratio: 1.25, sizes: '170px', alt: p.winemaker })}<figcaption class="mono">${escapeHtml(p.winemaker)}</figcaption></figure>
      </div>
      <div class="chapter__text">
        <p class="chapter__num"><span class="mono">Capítulo</span> ${ROMAN[i]}</p>
        <h2 id="t-${p.slug}">${escapeHtml(p.name)}</h2>
        <p class="mono chapter__region">${escapeHtml(regionName[p.region])}</p>
        <p class="chapter__story">${escapeHtml(p.story)}</p>
        <blockquote>“${escapeHtml(p.quote)}”</blockquote>
        <div class="chapter__wines">
          <h3 class="mono">Na nossa carta</h3>
          ${winesOf(p.id).map((w) => entry(w)).join('')}
        </div>
      </div>
    </article>`,
      )
      .join('')}
  </section>`;
}
