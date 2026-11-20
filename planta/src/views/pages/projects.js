import { TYPES, typeLabel } from '../../services/project.service.js';
import { area, esc, imgUrl, photo, ratioOf, stamp } from '../html.js';

export function projectsBody({ projects, type }) {
  const filters = [['', 'Todos'], ...TYPES];
  return `<section class="sheet page-head" aria-labelledby="page-title">
  <div class="sheet__frame" aria-hidden="true"></div>
  <div class="wrap">
    <p class="crumb"><a href="/">início</a> / <b>projetos</b></p>
    <div class="page-head__row">
      <h1 id="page-title" class="display">Índice de <em>projetos</em></h1>
      <p class="page-head__lead">${projects.length} ${projects.length === 1 ? 'obra' : 'obras'}${type ? ` de ${esc(typeLabel(type).toLowerCase())}` : ''}. Cada folha abre a planta, as fotografias e a história de uma casa.</p>
    </div>
    <nav class="filters" aria-label="Filtrar por tipo">
      ${filters.map(([value, label]) => `<a class="chip" href="/projetos${value ? `?tipo=${value}` : ''}"${value === (type ?? '') ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('')}
    </nav>
  </div>
</section>

<section class="wrap catalogue" aria-label="Projetos">
  ${
    projects.length
      ? projects
          .map(
            (p, i) => `<article class="entry${i % 2 ? ' entry--flip' : ''}">
    <a class="entry__photo" href="/projetos/${p.slug}" tabindex="-1" aria-hidden="true">${photo(p.slug, p.cover, { sizes: '(max-width: 900px) 92vw, 58vw', eager: i === 0, fit: 960 })}</a>
    <div class="entry__text">
      <p class="entry__n">${p.n}</p>
      <h2 class="display display--sm"><a href="/projetos/${p.slug}">${esc(p.name)}</a></h2>
      <p>${esc(p.summary)}</p>
      <dl class="spec spec--small">
        <div><dt>Programa</dt><dd>${esc(typeLabel(p.type))}</dd></div>
        <div><dt>Local</dt><dd>${esc(p.place)}</dd></div>
        <div><dt>Ano</dt><dd>${p.year} · ${esc(p.state.toLowerCase())}</dd></div>
      </dl>
      <a class="link" href="/projetos/${p.slug}">Abrir a folha →</a>
    </div>
  </article>`,
          )
          .join('')
      : '<p class="empty">Ainda não há projetos deste tipo publicados.</p>'
  }
</section>`;
}

export function projectBody({ project: p, prev, next }) {
  const pins = p.drawing?.pins ?? [];
  return `<article>
<section class="sheet project-head" aria-labelledby="page-title">
  <div class="sheet__frame" aria-hidden="true"></div>
  <div class="wrap">
    <p class="crumb"><a href="/">início</a> / <a href="/projetos">projetos</a> / <b>${p.n} · ${esc(p.name)}</b></p>
    <div class="project-head__row">
      <h1 id="page-title" class="display">${esc(p.name.split(' ').slice(0, -1).join(' '))} <em>${esc(p.name.split(' ').at(-1))}</em></h1>
      <dl class="spec">
        <div><dt>Programa</dt><dd>${esc(typeLabel(p.type))}</dd></div>
        <div><dt>Local</dt><dd>${esc(p.place)}</dd></div>
        <div><dt>Área</dt><dd>${area(p.area)}</dd></div>
        <div><dt>Ano</dt><dd>${p.year} · ${esc(p.state.toLowerCase())}</dd></div>
      </dl>
    </div>
    <figure class="project-hero">${photo(p.slug, p.cover, { sizes: '(max-width: 1340px) 92vw, 1240px', eager: true, fit: 1600 })}<figcaption>${esc(p.cover.alt)}</figcaption></figure>
  </div>
</section>

<section class="wrap story">
  <p class="story__lead">${esc(p.summary)}</p>
  <div class="story__text">${p.story.map((s) => `<p>${esc(s)}</p>`).join('')}<p class="tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</p></div>
</section>

${
  p.drawing
    ? `<section class="wrap reading" aria-labelledby="reading-title" data-reading>
  <figure class="drawing">
    <span class="drawing__label">${esc(p.drawing.label)}</span>
    <div class="drawing__paper" style="aspect-ratio:${(1 / ratioOf(p.slug, p.drawing.key)).toFixed(3)}">
      ${photo(p.slug, p.drawing, { sizes: '(max-width: 900px) 92vw, 640px', fit: 960, cls: 'drawing__img' })}
      ${pins.map((pin, i) => `<button class="pin${i === 0 ? ' is-on' : ''}" type="button" style="left:${pin.x}%;top:${pin.y}%" data-pin="${i}" aria-pressed="${i === 0}" aria-label="${i + 1}: ${esc(pin.title)}">${i + 1}</button>`).join('')}
    </div>
  </figure>
  <div class="reading__notes">
    <h2 id="reading-title" class="display display--md">Ler a casa <em>pela planta</em></h2>
    <ol class="notes">
      ${pins.map((pin, i) => `<li class="${i === 0 ? 'is-on' : ''}" data-note="${i}"><b>${i + 1}</b><div><h3>${esc(pin.title)}</h3><p>${esc(pin.text)}</p></div></li>`).join('')}
    </ol>
    <figure class="reading__photo" data-pin-photo>
      ${pins[0] ? photo(p.slug, p.photos.find((ph) => ph.key === pins[0].photo), { sizes: '(max-width: 900px) 92vw, 520px', fit: 960 }) : ''}
    </figure>
    <script type="application/json" id="pin-photos">${JSON.stringify(pins.map((pin) => {
      const ph = p.photos.find((x) => x.key === pin.photo);
      return { src: imgUrl(p.slug, ph.key, 960), alt: ph.alt };
    })).replace(/</g, '\\u003c')}</script>
  </div>
</section>`
    : ''
}

${
  p.sketch
    ? `<section class="wrap sketch">
  <figure class="sketch__paper">${photo(p.slug, p.sketch, { sizes: '(max-width: 900px) 92vw, 420px', fit: 960 })}</figure>
  <blockquote><p>Uma casa desenhada a partir da curva, como no poema de Niemeyer que ficou preso na parede do atelier durante todo o projeto.</p><cite>referência do projeto</cite></blockquote>
</section>`
    : ''
}

<section class="wrap gallery" aria-label="Fotografias" data-gallery>
  ${[...p.photos.slice(1), ...(p.extra ? [p.extra] : [])]
    .map(
      (ph, i) => `<button class="gallery__item${ph === p.extra ? ' gallery__item--drawing' : ''}" type="button" data-full="${imgUrl(p.slug, ph.key, 1600)}" data-alt="${esc(ph.alt)}" aria-label="Ampliar: ${esc(ph.alt)}">${photo(p.slug, ph, { sizes: i === 0 ? '(max-width: 900px) 92vw, 62vw' : '(max-width: 900px) 92vw, 30vw', fit: 960 })}</button>`,
    )
    .join('')}
</section>

<nav class="wrap pager" aria-label="Outros projetos">
  <a class="pager__item" href="/projetos/${prev.slug}" rel="prev"><small>projeto anterior · tecla P</small><span>← ${prev.n} · ${esc(prev.name)}</span></a>
  <a class="pager__item pager__item--next" href="/projetos/${next.slug}" rel="next"><small>próximo projeto · tecla N</small><span>${next.n} · ${esc(next.name)} →</span>
    <svg viewBox="0 0 140 90" aria-hidden="true"><path d="M10 80H130"/><path class="door" d="M10 80V10"/><path d="M10 10A70 70 0 0 1 80 80" stroke-dasharray="4 5"/></svg></a>
</nav>

<dialog class="lightbox" data-lightbox aria-label="Fotografia ampliada"><img alt=""><button class="lightbox__close" type="button" aria-label="Fechar">×</button></dialog>
${stamp({ title: p.name, code: `LC-1${p.n}`, third: ['Ano', String(p.year)] }).replace('class="stamp"', 'class="stamp stamp--inline"')}
</article>`;
}
