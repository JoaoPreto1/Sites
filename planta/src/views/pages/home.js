import { PHASES, STUDIO } from '../../config/studio.js';
import { typeLabel } from '../../services/project.service.js';
import { esc, imgUrl, northArrow, photo, srcset, stamp } from '../html.js';

// As divisões da planta: cada uma recebe um projeto, pela ordem do índice
const ROOMS = [
  { x: 20, y: 20, w: 450, h: 280, label: [44, 250] },
  { x: 470, y: 20, w: 370, h: 380, label: [496, 350] },
  { x: 20, y: 300, w: 230, h: 370, label: [44, 344] },
  { x: 250, y: 300, w: 220, h: 370, label: [276, 344] },
  { x: 470, y: 400, w: 370, h: 270, label: [496, 444] },
];

// Linhas que só desenham: paredes, portas, escada, mobiliário
const WALLS = `<g class="plan__walls" stroke-linecap="square">
      <path d="M20 20H840V670H20Z"/>
      <path d="M20 300H340M430 300H470"/>
      <path d="M470 20V190M470 280V670"/>
      <path d="M470 400H600M690 400H840"/>
      <path d="M250 300V420M250 510V670"/>
    </g>
    <g class="plan__thin">
      <path d="M340 300A90 90 0 0 1 430 300" stroke-dasharray="4 5"/><path d="M340 300V210"/>
      <path d="M470 190A90 90 0 0 1 560 280" stroke-dasharray="4 5"/>
      <path d="M600 400A90 90 0 0 1 690 400" stroke-dasharray="4 5"/>
      <path d="M250 420A90 90 0 0 1 340 510" stroke-dasharray="4 5"/>
    </g>
    <g class="plan__furniture">
      <path d="M70 66C150 40 250 110 230 168C214 206 130 202 100 176"/>
      <circle cx="390" cy="110" r="42"/>
      <rect x="530" y="60" width="260" height="86"/><path d="M540 70h240M540 136h240"/>
      <path d="M40 640C100 540 170 580 210 500" stroke-dasharray="5 6"/>
      <rect x="300" y="560" width="120" height="70"/>
      <path d="M520 470h22v40h22v40h22v40h22v40h22"/>
      <rect x="710" y="460" width="96" height="170"/><path d="M710 500h96M710 540h96M710 580h96"/>
    </g>
    <g class="plan__dims">
      <path d="M20 -8H840M20 -14v12M470 -14v12M840 -14v12"/>
      <text x="230" y="-16">10,40</text><text x="640" y="-16">8,20</text>
    </g>`;

function plan(projects) {
  const rooms = ROOMS.map((room, i) => {
    const p = projects[i];
    const [lx, ly] = room.label;
    if (!p) {
      return `<a class="room room--studio" href="/sobre" aria-label="O atelier"><rect x="${room.x}" y="${room.y}" width="${room.w}" height="${room.h}"/><text class="room__label" x="${lx}" y="${ly}">ATELIER</text><text class="room__sub room__label" x="${lx}" y="${ly + 19}">quem somos</text></a>`;
    }
    const name = p.name.toUpperCase();
    // Nomes compridos em duas linhas nas divisões estreitas
    const lines = room.w < 300 && name.length > 18 ? [name.slice(0, name.lastIndexOf(' ', 18)), name.slice(name.lastIndexOf(' ', 18) + 1)] : [name];
    return `<a class="room${i === 0 ? ' is-on' : ''}" href="/projetos/${p.slug}" data-room="${i}" data-src="${imgUrl(p.slug, p.cover.key, 480)}" data-srcset="${esc(srcset(p.slug, p.cover.key))}" data-alt="${esc(p.cover.alt)}" data-caption="${esc(`${p.n} · ${p.name}`)}">
      <rect x="${room.x}" y="${room.y}" width="${room.w}" height="${room.h}"/>
      <text class="room__num" aria-hidden="true" x="${room.x + room.w / 2}" y="${room.y + room.h / 2 + 24}" text-anchor="middle">${p.n}</text>
      ${lines.map((line, k) => `<text class="room__label" x="${lx}" y="${ly + k * 18}">${k === 0 ? `${p.n} · ` : ''}${esc(line)}</text>`).join('')}
      <text class="room__sub room__label" x="${lx}" y="${ly + lines.length * 18 + 1}">${esc(typeLabel(p.type).toLowerCase())} · ${p.year}</text>
    </a>`;
  }).join('');

  return `<svg class="plan" viewBox="0 -30 860 720" role="group" aria-label="Planta do atelier: cada divisão é um projeto">
    ${WALLS}
    ${rooms}
    <g class="plan__note" aria-hidden="true"><path d="M110 150l34-34h190"/><circle cx="110" cy="150" r="5"/><text x="150" y="108">sala curva aberta ao logradouro</text></g>
    <g transform="translate(796 626)" class="plan__north">${northArrow('north north--svg')}</g>
  </svg>`;
}

export function homeBody({ projects }) {
  const first = projects[0];
  return `<section class="sheet hero" aria-labelledby="hero-title">
  <div class="sheet__frame" aria-hidden="true"></div>
  <div class="wrap hero__grid">
    <div class="hero__text">
      <p class="kicker">Matosinhos · Viseu · desde ${STUDIO.since}</p>
      <h1 id="hero-title" class="display">Projetos que começam num <em>traço</em> e acabam numa casa.</h1>
      <p class="hero__lead">Esta página é a planta do atelier. Cada divisão é um projeto: passe por cima para o ver construído, clique para entrar.</p>
      <div class="hero__actions"><a class="btn" href="/contactos">Pedir uma reunião</a><a class="link" href="/projetos">Ver o índice</a></div>
    </div>
    <div class="hero__plan">
      ${plan(projects)}
      ${
        first
          ? `<figure class="peek" data-peek>
        ${photo(first.slug, first.cover, { sizes: '(max-width: 900px) 70vw, 300px', eager: true, fit: 480 })}
        <figcaption><span data-peek-caption>${esc(`${first.n} · ${first.name}`)}</span> → ver projeto</figcaption>
      </figure>`
          : ''
      }
    </div>
  </div>
  ${stamp({ title: `${STUDIO.name}, arquiteta · ${STUDIO.school}`, code: 'LC-001 · início', third: ['Atelier', 'Matosinhos · Viseu'] })}
</section>

<section class="wrap index" aria-labelledby="index-title">
  <div class="index__head">
    <h2 id="index-title" class="display display--md">Índice de <em>projetos</em></h2>
    <p>Moradias, apartamentos reabilitados e habitação coletiva, entre o litoral e as Beiras.</p>
  </div>
  <ol class="rows">
    ${projects
      .map(
        (p) => `<li><a class="row" href="/projetos/${p.slug}">
      <span class="row__n">${p.n}</span>
      <span class="row__name">${esc(p.name)}</span>
      <span class="row__meta">${esc(p.place)}</span>
      <span class="row__meta">${esc(typeLabel(p.type))} · ${p.year}</span>
      <span class="row__thumb">${photo(p.slug, p.cover, { sizes: '160px', fit: 480 })}</span>
    </a></li>`,
      )
      .join('')}
  </ol>
</section>

<section class="method" aria-labelledby="method-title">
  <div class="wrap">
    <div class="method__head">
      <h2 id="method-title" class="display display--md">Um projeto são <em>cinco folhas</em></h2>
      <p>Cada fase tem um número de desenho, como nas folhas de um caderno de obra. Os clientes acompanham-nas na área de cliente, à medida que ficam prontas.</p>
    </div>
    <ol class="sheets">
      ${PHASES.map((ph, i) => `<li class="sheet-card" style="--i:${i}"><span class="sheet-card__code">${ph.code}</span><h3>${esc(ph.label)}</h3><p>${esc(ph.detail)}</p></li>`).join('')}
    </ol>
  </div>
</section>

<section class="wrap band" aria-label="Pormenores dos projetos">
  ${projects
    .filter((p) => p.photos.length > 1)
    .slice(0, 3)
    .map((p) => {
      const ph = p.photos[1];
      return `<figure class="band__item">${photo(p.slug, ph, { sizes: '(max-width: 760px) 92vw, 30vw', fit: 960 })}<figcaption>${esc(p.name)} · ${esc(p.place)}</figcaption></figure>`;
    })
    .join('')}
</section>

<section class="wrap offices" aria-label="Escritórios">
  ${STUDIO.offices.map((o) => `<div><p class="kicker">${esc(o.label)}</p><h2 class="display display--sm">${esc(o.city)}</h2><p>${esc(o.street)}<br>${esc(o.postalCode)} ${esc(o.city)}</p><p class="muted">${esc(o.hours)}</p></div>`).join('')}
  <div class="offices__cta"><p class="display display--sm">Tem um terreno, uma casa velha ou só uma ideia?</p><a class="btn" href="/contactos">Comece pelo terreno</a></div>
</section>`;
}
