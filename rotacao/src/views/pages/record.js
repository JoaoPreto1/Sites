import { cover, coverSrcset, duration, escapeHtml, price } from '../../../public/js/shared/format.js';
import { icons } from '../../../public/js/shared/icons.js';
import { recordCard } from '../components.js';

const gradeName = (grades, code) => grades.find((g) => g.code === code) ?? { name: code, note: '' };

export function recordPage({ record, sides, related, grades }) {
  const name = `${record.artist} — ${record.title}`;
  const media = gradeName(grades, record.media);
  const sleeve = gradeName(grades, record.sleeve);

  const tracks = sides
    .map(
      (side) => `
      <section class="side-list">
        <h3 class="side-list__name"><span>Lado ${side.side}</span><i></i><small class="mono">${duration(side.tracks.reduce((s, t) => s + t.ms, 0))}</small></h3>
        <ol>
          ${side.tracks
            .map(
              (t) => `
            <li>
              <button class="track" type="button" data-track="${t.index}" aria-pressed="false">
                <span class="track__n mono">${side.side}${side.tracks.indexOf(t) + 1}</span>
                <span class="track__icon" aria-hidden="true">${icons.play}<span class="eq"><i></i><i></i><i></i></span></span>
                <span class="track__title">${escapeHtml(t.title)}</span>
                <span class="track__time mono">${duration(t.ms)}</span>
              </button>
            </li>`,
            )
            .join('')}
        </ol>
      </section>`,
    )
    .join('');

  return `
  <article class="record wrap" data-record="${record.id}">
    <nav class="crumbs mono" aria-label="Caminho"><a href="/discos">Discos</a> / <a href="/discos?caixote=${record.crate}">${escapeHtml(record.crateName)}</a> / <span>${escapeHtml(record.title)}</span></nav>

    <div class="record__grid">
      <div class="record__art">
        <div class="pull" data-pull style="--label:${record.color}">
          <div class="pull__vinyl" aria-hidden="true"><span class="pull__label"><img src="${cover(record, 300)}" alt="" width="300" height="300"></span></div>
          <img class="pull__cover" src="${cover(record, 600)}" srcset="${coverSrcset(record)}" sizes="(max-width: 900px) 80vw, 520px" width="1000" height="1000" alt="Capa de ${escapeHtml(name)}" fetchpriority="high">
          <span class="tag pull__tag">${price(record.price)}</span>
        </div>
        <p class="record__apple mono">Pré-escutas de 30 s via <a href="${record.appleUrl}" rel="noopener" target="_blank">Apple Music</a></p>
      </div>

      <div class="record__info">
        <p class="kicker">${escapeHtml(record.crateName)} · ${record.year}</p>
        <p class="record__artist">${escapeHtml(record.artist)}</p>
        <h1 class="display record__title">${escapeHtml(record.title)}</h1>

        <dl class="record__facts">
          <div><dt>Editora</dt><dd>${escapeHtml(record.label)}</dd></div>
          <div><dt>Prensagem</dt><dd>${escapeHtml(record.pressing)}</dd></div>
          <div><dt>Faixas</dt><dd>${record.tracks.length} · ${record.minutes} min${record.discs > 1 ? ' · duplo' : ''}</dd></div>
        </dl>

        <div class="record__grades">
          <div class="meter"><span class="mono">Disco</span><b>${record.media}</b><span>${media.name}. ${media.note}</span></div>
          <div class="meter"><span class="mono">Capa</span><b>${record.sleeve}</b><span>${sleeve.name}. ${sleeve.note}</span></div>
        </div>

        <div class="record__buy">
          <button class="btn" type="button" data-play-all>${icons.play} <span data-play-label>Ouvir o lado A</span></button>
          ${
            record.stock
              ? `<button class="btn btn--line" type="button" data-add="${record.id}" data-name="${escapeHtml(record.title)}">${icons.bag} Juntar ao saco · ${price(record.price)}</button>`
              : `<a class="btn btn--line" href="/procura">Esgotado · avisa-me</a>`
          }
        </div>
        <p class="record__stock mono">${record.stock > 1 ? `${record.stock} cópias na loja` : record.stock === 1 ? 'Só há esta cópia' : 'Esgotado'} · envio em 48 h ou levantamento na Rua dos Anjos</p>
        <p class="record__owned" data-owned hidden>${icons.play} Tens este disco. Na tua conta ouves as faixas completas, quando a loja as tiver.</p>

        <figure class="note">
          <blockquote>${escapeHtml(record.note)}</blockquote>
          <figcaption class="mono">— quem o ouviu na loja</figcaption>
        </figure>

        <div class="record__tracks" data-tracks>${tracks}</div>
      </div>
    </div>
  </article>

  ${
    related.length
      ? `<section class="related wrap" aria-labelledby="related-title">
    <header class="section-head"><div><p class="kicker">No mesmo caixote</p><h2 class="display" id="related-title">Já agora.</h2></div><a class="link" href="/discos?caixote=${record.crate}">Ver o caixote todo</a></header>
    <div class="records-grid">${related.map((r, i) => recordCard(r, { index: i + 1 })).join('')}</div>
  </section>`
      : ''
  }`;
}
