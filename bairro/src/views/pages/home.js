import { BUDGETS } from '../../../public/js/shared/estimate.js';
import { photoUrl } from '../../../public/js/shared/format.js';
import { STUDIO } from '../../config/studio.js';
import { esc, icon, options, photo, win } from '../components.js';

const WORK = [
  ['marca.svg', 'Nome, logótipo, cores e letra', 'marca'],
  ['site.html', 'Sites rápidos que vocês conseguem atualizar', 'site'],
  ['embalagem.pdf', 'Caixas, rótulos e sacos que chegam inteiros', 'embalagem'],
  ['cartaz.png', 'Cartazes, menus e montras', 'cartaz'],
];

export const FEATURED_SIZES = '(min-width: 1024px) 480px, calc(100vw - 28px)';
export const FEATURED_WIDTHS = [400, 620, 900, 1200];

function welcome() {
  return win({
    id: 'bemvindo',
    url: '/',
    title: 'bem-vindo.app',
    label: 'Bem-vindo',
    primary: true,
    x: 40,
    y: 30,
    w: 660,
    cls: 'welcome',
    body: `<h1 class="welcome__title">Estúdio de design com <span class="mark">3 pessoas</span> e 1 gato.</h1>
    <p class="welcome__lead">Fazemos marcas, sites e embalagens para negócios pequenos do Porto e de onde for preciso. Abra as pastas, arraste as janelas pela barra de cima e, quando quiser falar connosco, escreva no bloco de notas.</p>
    <div class="welcome__actions"><a class="btn btn--primary" href="/projetos">Abrir projetos</a><a class="btn" href="/processo">Como trabalhamos</a><a class="btn" href="/orcamento">Pedir orçamento</a></div>
    <ul class="filelist" aria-label="O que fazemos">
      ${WORK.map(([file, text]) => `<li><a href="/precos"><span class="filelist__name">${icon('doc')}${file}</span><span class="mute">${text}</span></a></li>`).join('')}
    </ul>`,
    status: `<span>${STUDIO.street}, ${STUDIO.city}</span><span>${STUDIO.hours}</span>`,
  });
}

function teamMini(team, opening) {
  return win({
    id: 'equipa-mini',
    url: '/equipa',
    title: 'quem_cá_está',
    label: 'Quem cá está',
    ico: 'folder',
    x: 9999,
    y: 40,
    w: 380,
    cls: 'team-mini',
    body: `<h2 class="sr-only">Quem cá está</h2>
    <ul class="people">
      ${team
        .map(
          (p) => `<li>${photo({ id: p.photo, alt: '', widths: [80, 120], sizes: '60px', ratio: 1, cls: 'people__photo' })}<span><b>${esc(p.name.split(' ')[0])}</b><span class="mute small">${esc(
            p.role.toLowerCase(),
          )}</span></span></li>`,
        )
        .join('')}
      <li><span class="people__cat" aria-hidden="true">=^.^=</span><span><b>Pixel</b><span class="mute small">gato, chefe de moral</span></span></li>
    </ul>
    <a class="link small" href="/equipa">Abrir a pasta da equipa</a>`,
    status: opening
      ? `<span><span class="dot" aria-hidden="true"></span> ${opening.free} ${opening.free === 1 ? 'vaga' : 'vagas'} para começar em ${opening.name}</span>`
      : '<span>Agenda cheia, mas pergunte na mesma</span>',
  });
}

function featured(project) {
  const [first, ...rest] = project.images;
  return win({
    id: 'destaque',
    url: `/projetos/${project.slug}`,
    title: `${project.slug.replace(/-/g, '_')}.jpg`,
    label: project.title,
    ico: 'app',
    x: 9999,
    y: 500,
    w: 480,
    cls: 'viewer viewer--mini',
    script: 'viewer',
    flush: true,
    body: `<figure class="viewer__stage">
      ${photo({ id: first.photo, alt: first.alt, widths: FEATURED_WIDTHS, sizes: FEATURED_SIZES, ratio: 0.56, eager: true, cls: 'viewer__img' })}
    </figure>
    <div class="viewer__info">
      <div><h2 class="viewer__name">${esc(project.title)}</h2><p class="mute small">${esc(project.services.join(', ').toLowerCase())} · ${project.year}</p></div>
      <div class="thumbs" role="group" aria-label="Fotografias de ${esc(project.title)}">
        ${project.images
          .map(
            (img, i) =>
              `<button type="button" class="thumb" data-photo="${img.photo}" data-alt="${esc(img.alt)}" aria-pressed="${i === 0}" aria-label="Ver: ${esc(img.caption)}"><img src="${photoUrl(
                img.photo,
                120,
                0.7,
              )}" width="60" height="42" alt="" loading="lazy"></button>`,
          )
          .join('')}
      </div>
    </div>
    <div class="viewer__foot"><a class="btn btn--small" href="/projetos/${project.slug}">Abrir projeto</a><span class="mute small">${rest.length + 1} imagens</span></div>`,
  });
}

function note() {
  return win({
    id: 'nota',
    url: '/orcamento',
    title: 'orçamento.txt',
    label: 'Bloco de notas',
    ico: 'doc',
    x: 40,
    y: 860,
    w: 460,
    cls: 'win--note',
    script: 'note',
    body: `<h2 class="note__title">Fale-nos do seu projeto</h2>
    <form class="note-form lined" novalidate>
      <label class="note-row"><span>Nome:</span><input name="name" autocomplete="name" required></label>
      <label class="note-row"><span>Email:</span><input name="email" type="email" autocomplete="email" required></label>
      <label class="note-row"><span>Valor:</span><select name="budget" required><option value="">escolher…</option>${options(BUDGETS)}</select></label>
      <label class="note-row note-row--text"><span class="sr-only">O que precisa</span><textarea name="message" rows="3" placeholder="Olá! Precisamos de…" required></textarea></label>
      <p class="note-form__foot"><a class="small link" href="/orcamento">Mais opções</a><button class="btn btn--primary btn--small" type="submit">Guardar e enviar ⏎</button></p>
    </form>`,
  });
}

export function homeWindows({ team, project, opening }) {
  return [
    { id: 'bemvindo', label: 'Bem-vindo', ico: 'app', html: welcome() },
    { id: 'destaque', label: project.title, ico: 'app', html: featured(project) },
    { id: 'equipa-mini', label: 'Quem cá está', ico: 'folder', html: teamMini(team, opening) },
    { id: 'nota', label: 'Bloco de notas', ico: 'doc', html: note() },
  ];
}

export const homeSticky = () =>
  `<p class="sticky" style="--x:560px;--y:1090px">não esquecer: o gato chama-se Pixel e aparece em todas as videochamadas</p>`;
