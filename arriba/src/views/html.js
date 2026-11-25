import { PHOTO_ALT } from '../config/site.js';

export const esc = (value = '') =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const initialData = (data) =>
  `<script type="application/json" id="initial-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

export const euros = (n) => `${Number(n).toLocaleString('pt-PT')} €`;

// Fotografia em webp com três larguras e medidas reservadas (todas recortadas a 4:3)
export function photo(name, { sizes = '(max-width: 820px) 100vw, 50vw', eager = false, cls = '', alt } = {}) {
  const base = `/img/fotos/${name}`;
  const srcset = [480, 800, 1200].map((w) => `${base}-${w}.webp ${w}w`).join(', ');
  return `<img${cls ? ` class="${cls}"` : ''} src="${base}-800.webp" srcset="${srcset}" sizes="${sizes}" width="1200" height="900" alt="${esc(alt ?? PHOTO_ALT[name] ?? '')}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

export const kicker = (text, cls = '') => `<p class="rot${cls ? ` ${cls}` : ''}">${text}</p>`;

// Etiquetas com os números das chaves de um tipo de quarto (livres e ocupadas nas datas)
export const keyTags = (rooms, free = rooms) =>
  `<ul class="chaves" aria-label="Chaves">${rooms.map((n) => `<li class="${free.includes(n) ? '' : 'fora'}">${n}<span class="sr"> ${free.includes(n) ? 'livre' : 'ocupado'}</span></li>`).join('')}</ul>`;

export const arrow = '<svg class="seta" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';

export const pageHead = ({ kicker: k, title, lead, crumbs = [] }) => `<header class="phead"><div class="cx">
  ${crumbs.length ? `<nav class="migalhas" aria-label="Caminho"><a href="/">Início</a>${crumbs.map(([label, href]) => `<span aria-hidden="true">/</span>${href ? `<a href="${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`}`).join('')}</nav>` : ''}
  ${k ? kicker(k) : ''}
  <h1>${title}</h1>
  ${lead ? `<p class="lead">${lead}</p>` : ''}
</div></header>`;
