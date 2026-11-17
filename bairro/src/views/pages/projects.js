import { esc, icon, photo, win } from '../components.js';
import { photoUrl, slugFile } from '../../../public/js/shared/format.js';

const folderPath = (category) => `C:\\Bairro\\projetos${category ? `\\${category.slug}` : ''}`;

function card(p, i) {
  return `<li class="file" data-search="${esc(`${p.title} ${p.categoryName} ${p.services.join(' ')} ${p.year}`.toLowerCase())}">
    <a href="/projetos/${p.slug}">
      <span class="file__thumb">${photo({ id: p.cover.photo, alt: p.cover.alt, widths: [300, 460, 640], sizes: '(min-width: 1200px) 260px, (min-width: 1024px) 30vw, 50vw', ratio: 0.75, eager: i < 3 })}</span>
      <span class="file__name">${icon('folder')}${slugFile(p.title)}</span>
      <span class="file__meta"><span>${esc(p.categoryName)}</span><span>${esc(p.services.join(', '))}</span><span>${p.year}</span></span>
    </a>
  </li>`;
}

export function projectsWindows({ projects, categories, category, total }) {
  const sidebar = `<nav class="explorer__side" aria-label="Pastas">
    <p class="explorer__side-title">Pastas</p>
    <ul>
      <li><a href="/projetos"${category ? '' : ' aria-current="page"'}>${icon('folder')}todos <span class="mute">${total}</span></a></li>
      ${categories
        .map(
          (c) => `<li><a href="/projetos?categoria=${c.slug}"${category?.slug === c.slug ? ' aria-current="page"' : ''}>${icon('folder')}${c.slug} <span class="mute">${c.count}</span></a></li>`,
        )
        .join('')}
    </ul>
    <div class="explorer__tip small">
      <p><b>Dica:</b> as janelas arrastam-se pela barra de cima. Duplo clique na barra para maximizar.</p>
    </div>
  </nav>`;

  const body = `<div class="explorer">
    ${sidebar}
    <div class="explorer__main">
      <div class="explorer__bar">
        <span class="explorer__path" aria-hidden="true">${folderPath(category)}</span>
        <label class="explorer__search"><span class="sr-only">Procurar projetos</span><input type="search" placeholder="Procurar…" data-search-input autocomplete="off"></label>
        <div class="explorer__views" role="group" aria-label="Vista">
          <button type="button" data-view="icones" aria-pressed="true">Ícones</button>
          <button type="button" data-view="lista" aria-pressed="false">Lista</button>
        </div>
      </div>
      <div class="explorer__intro">
        <h1>${category ? `Projetos de ${category.name.toLowerCase()}` : 'Projetos'}</h1>
        <p class="mute">${
          category
            ? `${projects.length} ${projects.length === 1 ? 'trabalho' : 'trabalhos'} de ${category.name.toLowerCase()} feitos no estúdio, cada um com a história de como foi feito.`
            : 'Marcas, embalagens, sites e cartazes que fizemos para negócios do Porto e arredores. Abra uma pasta para ver as imagens e a história de cada um.'
        }</p>
      </div>
      <ul class="files" data-files>
        ${projects.map(card).join('')}
      </ul>
      <p class="empty" data-empty hidden>Nenhum projeto com esse nome. Experimente "caixa", "site" ou "marca".</p>
    </div>
  </div>`;

  return [
    {
      id: 'projetos',
      label: 'Projetos',
      ico: 'folder',
      html: win({
        id: 'projetos',
        url: category ? `/projetos?categoria=${category.slug}` : '/projetos',
        title: `projetos${category ? ` › ${category.slug}` : ''}`,
        label: 'Projetos',
        ico: 'folder',
        primary: true,
        x: 40,
        y: 30,
        w: 1080,
        cls: 'explorer-win',
        script: 'projects',
        flush: true,
        body,
        status: `<span data-count>${projects.length} ${projects.length === 1 ? 'objeto' : 'objetos'}</span><span>Clique numa pasta para abrir</span>`,
      }),
    },
  ];
}

export function projectWindows(project) {
  const [first] = project.images;
  const body = `<div class="project">
    <div class="project__stage">
      <figure class="viewer__stage">
        ${photo({ id: first.photo, alt: first.alt, widths: [480, 760, 1000, 1400], sizes: '(min-width: 1200px) 700px, (min-width: 1024px) 60vw, 100vw', ratio: 0.66, eager: true, cls: 'viewer__img' })}
        <button class="viewer__nav viewer__nav--prev" type="button" data-prev aria-label="Fotografia anterior">◀</button>
        <button class="viewer__nav viewer__nav--next" type="button" data-next aria-label="Fotografia seguinte">▶</button>
      </figure>
      <div class="project__caption"><span data-caption>${esc(first.caption)}</span><span class="mute" data-counter>1 de ${project.images.length}</span></div>
      <div class="thumbs" role="group" aria-label="Fotografias">
        ${project.images
          .map(
            (img, i) =>
              `<button type="button" class="thumb" data-photo="${img.photo}" data-alt="${esc(img.alt)}" data-caption="${esc(img.caption)}" aria-pressed="${i === 0}" aria-label="Ver: ${esc(
                img.caption,
              )}"><img src="${photoUrl(img.photo, 120, 0.7)}" width="60" height="42" alt="" loading="lazy"></button>`,
          )
          .join('')}
      </div>
    </div>
    <div class="project__info">
      <p class="project__kicker">${esc(project.categoryName)} · ${project.year}</p>
      <h1 class="project__title">${esc(project.title)}</h1>
      <p class="project__summary">${esc(project.summary)}</p>
      <fieldset class="props">
        <legend>Propriedades</legend>
        <dl>
          <dt>Cliente</dt><dd>${esc(project.client)}</dd>
          <dt>Local</dt><dd>${esc(project.place)}</dd>
          <dt>Serviços</dt><dd>${esc(project.services.join(', '))}</dd>
          <dt>Duração</dt><dd>${esc(project.duration)}</dd>
        </dl>
      </fieldset>
      <div class="palette" aria-label="Paleta de cores">
        ${project.palette.map((color) => `<span class="palette__swatch"><span style="background:${color}"></span><code>${color}</code></span>`).join('')}
      </div>
    </div>
    <article class="project__story">
      <h2 class="project__story-title">${icon('doc')}leia-me.txt</h2>
      ${project.body.map((p) => `<p>${esc(p)}</p>`).join('')}
      <p class="project__cta"><a class="btn btn--primary" href="/orcamento">Quero algo parecido</a><a class="link" href="/projetos?categoria=${project.category}">Mais ${esc(project.categoryName.toLowerCase())}</a></p>
    </article>
  </div>`;

  return [
    {
      id: `projeto-${project.slug}`,
      label: project.title,
      ico: 'app',
      html: win({
        id: `projeto-${project.slug}`,
        url: `/projetos/${project.slug}`,
        title: `${slugFile(project.title)}.jpg`,
        label: project.title,
        primary: true,
        x: 60,
        y: 30,
        w: 1120,
        cls: 'viewer project-win',
        script: 'viewer',
        flush: true,
        menu: `<a href="/projetos/${project.previous.slug}" rel="prev">◀ ${esc(project.previous.title)}</a><a href="/projetos">Todos os projetos</a><a href="/projetos/${project.next.slug}" rel="next">${esc(project.next.title)} ▶</a>`,
        body,
        status: `<span>Projeto ${project.position.index} de ${project.position.total}</span><span>Use as setas do teclado para mudar de fotografia</span>`,
      }),
    },
  ];
}
