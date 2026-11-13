import { bottle } from '../../../public/js/shared/bottle.js';
import { shelf } from '../../../public/js/shared/carta.js';
import { escapeHtml, money, vintage } from '../../../public/js/shared/format.js';
import { DISHES } from '../../data/seed.js';
import { photo } from '../helpers.js';

const TYPE_PLURAL = { espumante: 'Espumantes', branco: 'Brancos', rose: 'Rosés', tinto: 'Tintos', generoso: 'Generosos' };

function scale(label, value, [low, high]) {
  const marks = Array.from({ length: 5 }, (_, i) => `<i class="${i < value ? 'is-on' : ''}"></i>`).join('');
  return `
    <div class="scale">
      <span class="mono">${label}</span>
      <span class="scale__bar" role="img" aria-label="${label}: ${value} em 5">${marks}</span>
      <span class="scale__ends"><span>${low}</span><span>${high}</span></span>
    </div>`;
}

export function winePage({ wine, producer, related }) {
  const dishName = Object.fromEntries(DISHES.map((d) => [d.slug, d.name]));
  const lowStock = wine.stock > 0 && wine.stock <= 6;

  return `
  <article class="wine wrap">
    <nav class="crumbs mono" aria-label="Caminho">
      <a href="/carta">A carta</a><span aria-hidden="true">/</span><a href="/carta?tipo=${wine.type}">${TYPE_PLURAL[wine.type]}</a><span aria-hidden="true">/</span><a href="/carta?regiao=${wine.region}">${escapeHtml(wine.regionName)}</a>
    </nav>

    <div class="wine__grid">
      <div class="wine__stage">
        ${bottle(wine, { className: 'bottle wine__bottle' })}
      </div>

      <div class="wine__info">
        <p class="mono wine__kicker">${escapeHtml(wine.regionName)} · ${escapeHtml(wine.typeName)} · ${vintage(wine)}</p>
        <h1 class="title-xl">${escapeHtml(wine.name)}${wine.year ? ` <em>${wine.year}</em>` : ''}</h1>
        <p class="wine__producer">de <a href="/produtores#${producer.slug}">${escapeHtml(producer.name)}</a></p>
        <p class="wine__notes">${escapeHtml(wine.notes)}</p>

        <form class="buy" data-buy data-wine="${wine.id}" data-name="${escapeHtml(wine.name)}">
          <p class="buy__price">${money(wine.price)}<span class="mono">a garrafa</span></p>
          ${
            wine.stock > 0
              ? `<div class="qty">
              <button type="button" data-step="-1" aria-label="Menos uma garrafa">−</button>
              <input type="number" name="quantity" value="1" min="1" max="${Math.min(24, wine.stock)}" aria-label="Garrafas" inputmode="numeric">
              <button type="button" data-step="1" aria-label="Mais uma garrafa">+</button>
            </div>
            <button class="btn btn--wine" type="submit">Juntar ao cesto</button>`
              : '<p class="buy__out">Esgotado. Volta a entrar com a próxima colheita.</p>'
          }
        </form>
        <p class="buy__info mono">${lowStock ? `Restam ${wine.stock} garrafas · ` : ''}Envio em 24 h · grátis a partir de 60 €</p>

        ${
          wine.staffNote
            ? `<blockquote class="staff-note"><p>“${escapeHtml(wine.staffNote)}”</p><footer class="mono">Helena, escanção da Cepa</footer></blockquote>`
            : ''
        }
      </div>
    </div>

    <section class="backlabel" aria-labelledby="ficha">
      <h2 id="ficha" class="mono">Contrarrótulo</h2>
      <dl class="backlabel__facts">
        <div><dt>Castas</dt><dd>${escapeHtml(wine.grapes.join(', '))}</dd></div>
        <div><dt>Região</dt><dd>${escapeHtml(wine.regionName)}</dd></div>
        <div><dt>Álcool</dt><dd>${String(wine.alcohol).replace('.', ',')}% vol.</dd></div>
        <div><dt>Servir a</dt><dd>${escapeHtml(wine.temperature)}</dd></div>
        <div><dt>Guardar</dt><dd>${escapeHtml(wine.keep)}</dd></div>
        <div><dt>Produtor</dt><dd>${escapeHtml(producer.winemaker)}</dd></div>
      </dl>
      <div class="backlabel__scales">
        ${scale('Corpo', wine.body, ['leve', 'encorpado'])}
        ${scale('Acidez', wine.acidity, ['macia', 'viva'])}
      </div>
      <div class="backlabel__pairs">
        <h3 class="mono">Vai bem com</h3>
        <p>${wine.pairings.map((p) => `<a href="/carta?prato=${p}">${escapeHtml(dishName[p])}</a>`).join('<span aria-hidden="true"> · </span>')}</p>
      </div>
    </section>

    <section class="maker" aria-labelledby="maker-title">
      <figure>${photo(producer.photo, { widths: [480, 800, 1100], ratio: 0.7, sizes: '(max-width: 900px) 100vw, 55vw', alt: `Vinhas da ${producer.name}` })}</figure>
      <div class="maker__text">
        <p class="mono">Quem faz</p>
        <h2 id="maker-title">${escapeHtml(producer.name)}</h2>
        <p>${escapeHtml(producer.story)}</p>
        ${producer.quote ? `<blockquote>“${escapeHtml(producer.quote)}”<footer class="mono">${escapeHtml(producer.winemaker)}</footer></blockquote>` : ''}
      </div>
    </section>

    ${
      related.length
        ? `<section class="related" aria-labelledby="related-title">
      <h2 id="related-title" class="title-lg">Na mesma <em>prateleira</em></h2>
      ${shelf(related)}
    </section>`
        : ''
    }
  </article>`;
}
