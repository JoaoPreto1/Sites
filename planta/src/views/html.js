import { readFileSync } from 'node:fs';

const MANIFEST = JSON.parse(readFileSync(new URL('../data/photos.json', import.meta.url), 'utf8'));

export const esc = (value = '') =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const info = (slug, key) => MANIFEST[slug]?.[key] ?? { ratio: 0.667, widths: [480] };

export const imgUrl = (slug, key, width = 960) => {
  const { widths } = info(slug, key);
  const w = widths.includes(width) ? width : widths.filter((x) => x <= width).at(-1) ?? widths[0];
  return `/img/${slug}/${key}-${w}.webp`;
};

export const srcset = (slug, key) =>
  info(slug, key)
    .widths.map((w) => `/img/${slug}/${key}-${w}.webp ${w}w`)
    .join(', ');

export const ratioOf = (slug, key) => info(slug, key).ratio;

// Fotografia local em webp com srcset; a largura e a altura reservam o espaço antes de carregar
export function photo(slug, { key, alt }, { sizes = '100vw', eager = false, cls = '', fit = 960 } = {}) {
  const ratio = ratioOf(slug, key);
  return `<img${cls ? ` class="${cls}"` : ''} src="${imgUrl(slug, key, fit)}" srcset="${srcset(slug, key)}" sizes="${esc(sizes)}" alt="${esc(alt)}" width="${fit}" height="${Math.round(fit * ratio)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
}

// Dados para o JavaScript da página, sem pedido extra à API
export const initialData = (data) =>
  `<script type="application/json" id="initial-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

export const area = (m2) => `${m2.toLocaleString('pt-PT')} m²`;

// Carimbo de desenho técnico, no canto das folhas
export const stamp = ({ title, code, scale = '1:100', third = ['Data', new Date().toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' }).replace('.', '')] }) =>
  `<div class="stamp" aria-hidden="true"><p class="stamp__title">${esc(title)}</p><p><small>Desenho</small><b>${esc(code)}</b></p><p><small>Escala</small><b>${esc(scale)}</b></p><p><small>${esc(third[0])}</small><b>${esc(third[1])}</b></p></div>`;

export const northArrow = (cls = 'north') =>
  `<svg class="${cls}" viewBox="-26 -40 52 72" aria-hidden="true"><circle r="22" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M0 -30V30" stroke="currentColor" stroke-width="1.5"/><path d="M0 -22l-7 14h14z" fill="currentColor"/><text y="-30" x="5" font-size="10" fill="currentColor">N</text></svg>`;

export const dateLong = (iso) =>
  new Date(iso).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });

export const timeOf = (iso) => new Date(iso).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
