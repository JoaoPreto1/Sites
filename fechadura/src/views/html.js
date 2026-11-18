import { photoSrcset, photoUrl } from '../../public/js/shared/pricing.js';

export const esc = (value = '') =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const locks = (level, label = true) =>
  `<span class="locks"${label ? ` role="img" aria-label="Dificuldade ${level} em 5"` : ' aria-hidden="true"'}>${Array.from({ length: 5 }, (_, i) => `<i class="${i < level ? 'on' : ''}"></i>`).join('')}</span>`;

export function photo(id, { alt = '', widths = [400, 700, 1000], sizes = '100vw', ratio, eager = false, cls = '' } = {}) {
  const w = widths[Math.min(1, widths.length - 1)];
  return `<img${cls ? ` class="${cls}"` : ''} src="${esc(photoUrl(id, w, ratio ? Math.round(w * ratio) : undefined))}" srcset="${esc(photoSrcset(id, widths, ratio))}" sizes="${esc(sizes)}" alt="${esc(alt)}" width="${w}" height="${Math.round(w * (ratio ?? 0.66))}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
}

// Dados para o JavaScript da página, sem pedido extra à API
export const initialData = (data) =>
  `<script type="application/json" id="initial-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

export const players = (room) => `${room.players.min} a ${room.players.max} pessoas`;
