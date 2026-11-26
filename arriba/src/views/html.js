import { BIG_PHOTOS, PHOTO_ALT } from '../config/site.js';

export const esc = (value = '') =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const initialData = (data) =>
  `<script type="application/json" id="initial-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

export const euros = (n) => `${Number(n).toLocaleString('pt-PT')} €`;

export const widthsOf = (name) => (BIG_PHOTOS.includes(name) ? [480, 800, 1200, 1920] : [480, 800, 1200]);
export const srcsetOf = (name) => widthsOf(name).map((w) => `/img/fotos/${name}-${w}.webp ${w}w`).join(', ');

// Fotografia em webp com várias larguras e medidas reservadas (todas recortadas a 4:3)
export function photo(name, { sizes = '(max-width: 760px) 100vw, 50vw', eager = false, cls = '', alt } = {}) {
  return `<img${cls ? ` class="${cls}"` : ''} src="/img/fotos/${name}-800.webp" srcset="${srcsetOf(name)}" sizes="${sizes}" width="1200" height="900" alt="${esc(alt ?? PHOTO_ALT[name] ?? '')}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

// Cabeçalho de página com fotografia em ecrã inteiro e o título por cima
export const pageHero = ({ photo: name, crumbs = [], title, aside = '', alt }) => `<section class="topo-pg" data-heroi>
  ${photo(name, { sizes: '100vw', eager: true, cls: 'topo-pg__f', alt })}
  <div class="topo-pg__tx">
    <nav class="migalhas" aria-label="Caminho"><a href="/">Início</a>${crumbs.map(([label, href]) => `<span aria-hidden="true">/</span>${href ? `<a href="${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`}`).join('')}</nav>
    <h1>${title}</h1>
    ${aside ? `<div class="topo-pg__lado">${aside}</div>` : ''}
  </div>
</section>`;

export const eyebrow = (text, cls = '') => `<p class="e${cls ? ` ${cls}` : ''}">${text}</p>`;
