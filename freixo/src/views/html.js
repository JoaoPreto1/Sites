import { readFileSync } from 'node:fs';

const MANIFEST = JSON.parse(readFileSync(new URL('../data/photos.json', import.meta.url), 'utf8'));

export const PHOTO_CREDITS = {
  penedo: 'Miradouro do Penedo Durão · foto VetK2O3, CC BY-SA 4.0',
  douro: 'O Douro visto do Penedo Durão · foto VetK2O3, CC BY-SA 4.0',
  torre: 'Torre do Galo · foto Vitor Oliveira, CC BY-SA 2.0',
  congida: 'Praia fluvial da Congida · foto Vitor Oliveira, CC BY-SA 2.0',
  matriz: 'Igreja Matriz · foto Maragato1976, CC BY-SA 3.0',
  vila: 'A vila vista do alto · foto Carlos Cunha, CC BY-SA 3.0',
  seda: 'Casulos de seda · foto Guy Moll, CC BY 2.0',
  amendoeiras: 'Amendoeiras em flor · foto ManuelBarreira, CC BY-SA 3.0',
};

export const esc = (value = '') =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const info = (key) => MANIFEST[key] ?? { ratio: 0.667, widths: [480] };

export const imgUrl = (key, width = 960) => {
  const { widths } = info(key);
  const w = widths.filter((x) => x <= width).at(-1) ?? widths[0];
  return `/img/${key}-${w}.webp`;
};

export const srcset = (key) =>
  info(key)
    .widths.map((w) => `/img/${key}-${w}.webp ${w}w`)
    .join(', ');

// Fotografia local em webp com srcset; a largura e a altura reservam o espaço antes de carregar
export function photo(key, alt, { sizes = '100vw', eager = false, cls = 'ph', fit = 960 } = {}) {
  const { ratio } = info(key);
  return `<img class="${cls}" src="${imgUrl(key, fit)}" srcset="${srcset(key)}" sizes="${esc(sizes)}" alt="${esc(alt)}" width="${fit}" height="${Math.round(fit * ratio)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
}

export const crest = (width, cls = '', alt = '') =>
  `<img${cls ? ` class="${cls}"` : ''} src="/img/brasao-${width <= 48 ? 96 : width <= 92 ? 184 : 280}.webp" alt="${esc(alt)}" width="${width}" height="${Math.round(width * 1.083)}" decoding="async">`;

// Dados para o JavaScript da página, sem pedido extra à API
export const initialData = (data) =>
  `<script type="application/json" id="initial-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

// Datas escritas à mão: não dependem dos dados de idioma que o Node tiver instalados
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const local = (iso) => new Date(new Date(iso).toLocaleString('en-US', { timeZone: 'Europe/Lisbon' }));

export const dateLong = (iso) => {
  const d = local(iso);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
};
export const monthShort = (iso) => MONTHS[local(iso).getMonth()].slice(0, 3);
export const dateShort = (iso) => `${local(iso).getDate()} ${monthShort(iso)}`;
export const dayNum = (iso) => String(local(iso).getDate()).padStart(2, '0');
export const timeOf = (iso) => {
  const d = local(iso);
  return `${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`;
};

export const icon = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  arrow: '<svg class="arr" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 11l9-7 9 7v9H3z"/><path d="M9 20v-6h6v6"/></svg>',
  school: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/></svg>',
  bus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="4" y="5" width="16" height="11" rx="2"/><circle cx="8" cy="19" r="1.5"/><circle cx="16" cy="19" r="1.5"/><path d="M4 11h16"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 5h16v11H8l-4 4z"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
  leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 21c-5-3-8-7-8-11a8 8 0 0 1 16 0c0 4-3 8-8 11z"/><path d="M12 7v7"/></svg>',
  mountain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 20l6-12 4 7 3-4 5 9z"/></svg>',
  laptop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  build: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 20h16M6 20V9l6-4 6 4v11"/><path d="M10 13h4M10 16h4"/></svg>',
};

// Os seis ícones ilustrados dos serviços (púrpura e ouro, com os gradientes definidos no documento)
export const serviceArt = {
  balcao: '<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="38" fill="#f3ecf8"/><rect x="14" y="20" width="44" height="32" rx="4" fill="url(#gp)"/><rect x="18" y="24" width="36" height="24" rx="2" fill="#fff"/><rect x="22" y="28" width="16" height="3" rx="1.5" fill="#cdb9de"/><rect x="22" y="34" width="26" height="3" rx="1.5" fill="#e6dcef"/><rect x="22" y="40" width="20" height="3" rx="1.5" fill="#e6dcef"/><path d="M28 52h16l3 8H25z" fill="#4a2669"/><rect x="21" y="59" width="30" height="3" rx="1.5" fill="#4a2669"/><circle cx="57" cy="50" r="11" fill="url(#gg)" stroke="#fff" stroke-width="2.5"/><path d="M52 50l3.5 3.5L62 47" fill="none" stroke="#2c1a3d" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  agua: '<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="38" fill="#f3ecf8"/><path d="M40 13c10 13 17 22 17 32a17 17 0 0 1-34 0c0-10 7-19 17-32z" fill="url(#gw)"/><path d="M24.5 47c4-3 8-3 12 0s8 3 12 0 6-2 8-1" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".9"/><path d="M26 54c4-3 8-3 12 0s8 3 12 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/><path d="M33 26c-3 4-5 8-5 12" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/><path d="M58 18c3 4 5 7 5 9.5a5 5 0 0 1-10 0c0-2.5 2-5.5 5-9.5z" fill="url(#gg)"/></svg>',
  obras: '<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="38" fill="#f3ecf8"/><path d="M56 14v46" stroke="#4a2669" stroke-width="3"/><path d="M42 18h24" stroke="#4a2669" stroke-width="3" stroke-linecap="round"/><path d="M56 14l-10 4M56 14l8 4" stroke="#4a2669" stroke-width="2"/><path d="M47 18v8" stroke="#4a2669" stroke-width="1.5"/><rect x="44" y="26" width="6" height="5" rx="1" fill="url(#gg)"/><path d="M14 42l20-16 20 16v20H14z" fill="url(#gp)"/><path d="M10 44l24-20 24 20" fill="none" stroke="#e3b23c" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="29" y="48" width="10" height="14" rx="1.5" fill="url(#gg)"/><rect x="19" y="44" width="7" height="7" rx="1" fill="#fff" opacity=".9"/><rect x="42" y="44" width="7" height="7" rx="1" fill="#fff" opacity=".9"/><path d="M8 62h64" stroke="#4a2669" stroke-width="3" stroke-linecap="round"/></svg>',
  social: '<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="38" fill="#f3ecf8"/><circle cx="27" cy="27" r="8" fill="url(#gp)"/><path d="M12 56c0-9 7-16 15-16s15 7 15 16z" fill="url(#gp)"/><circle cx="53" cy="29" r="7" fill="#9b78bd"/><path d="M40 56c0-8 6-14 13-14s13 6 13 14z" fill="#9b78bd"/><path d="M40 62c-7-5-11-8.5-11-13a5.5 5.5 0 0 1 11-1.5A5.5 5.5 0 0 1 51 49c0 4.5-4 8-11 13z" fill="url(#gg)" stroke="#fff" stroke-width="2.5"/></svg>',
  educacao: '<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="38" fill="#f3ecf8"/><path d="M14 46c9-4 17-4 26 1v16c-9-5-17-5-26-1z" fill="#9b78bd"/><path d="M66 46c-9-4-17-4-26 1v16c9-5 17-5 26-1z" fill="url(#gp)"/><path d="M40 47v16" stroke="#fff" stroke-width="1.5"/><path d="M40 16l26 11-26 11-26-11z" fill="url(#gp)"/><path d="M26 32v8c8 5 20 5 28 0v-8l-14 6z" fill="#4a2669"/><path d="M62 29v13" stroke="#e3b23c" stroke-width="2.5" stroke-linecap="round"/><circle cx="62" cy="44" r="3.5" fill="url(#gg)"/></svg>',
  ocorrencia: '<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="38" fill="#f3ecf8"/><path d="M12 56l16-6 16 6 16-6 8 3v13l-8-3-16 6-16-6-16 6z" fill="#e4d8ee"/><path d="M28 50v13M44 56v13M60 50v13" stroke="#cdb9de" stroke-width="1.5"/><path d="M40 14a14 14 0 0 1 14 14c0 11-14 25-14 25S26 39 26 28a14 14 0 0 1 14-14z" fill="url(#gp)"/><circle cx="40" cy="28" r="8" fill="url(#gg)"/><path d="M40 23.5v5" stroke="#2c1a3d" stroke-width="2.4" stroke-linecap="round"/><circle cx="40" cy="32" r="1.4" fill="#2c1a3d"/></svg>',
};

export const searchForm = (placeholder = 'O que precisa de tratar?', { kbd = true } = {}) =>
  `<form class="search" role="search" action="/servicos" method="get">${icon.search}<input type="search" name="q" placeholder="${esc(placeholder)}" aria-label="${esc(placeholder)}" autocomplete="off">${kbd ? '<kbd>/</kbd>' : ''}<button class="go" type="submit" aria-label="Procurar"><span>Procurar</span>${icon.arrow}</button></form>`;

export const pageHero = ({ photoKey, crumbs, title, lead, credit = true }) => `<section class="phero">
  ${photo(photoKey, '', { eager: true, cls: 'ph', fit: 1600, sizes: '100vw' })}
  <div class="wrap">
    <nav class="crumbs" aria-label="Caminho"><a href="/">Início</a>${crumbs.map(([label, href]) => `<span aria-hidden="true">›</span>${href ? `<a href="${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`}`).join('')}</nav>
    <h1>${title}</h1>
    ${lead ? `<p>${lead}</p>` : ''}
  </div>
  ${credit ? `<p class="credit">${esc(PHOTO_CREDITS[photoKey])}</p>` : ''}
</section>`;

export const subnav = (items) =>
  `<nav class="subnav" aria-label="Nesta página"><div class="wrap">${items.map(([id, label]) => `<a href="#${id}">${esc(label)}</a>`).join('')}</div></nav>`;

export const toc = (items) => `<ul class="toc">${items.map(([id, label]) => `<li><a href="#${id}">${esc(label)}</a></li>`).join('')}</ul>`;

export const facts = (rows) => `<ul class="facts">${rows.map(([k, v]) => `<li><span>${esc(k)}</span><b>${esc(v)}</b></li>`).join('')}</ul>`;
