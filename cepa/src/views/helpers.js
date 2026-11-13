import { photoUrl, srcset } from '../seo/images.js';
import { escapeHtml } from '../../public/js/shared/format.js';

export function photo(url, { widths = [480, 800, 1200], ratio = 1.25, sizes = '100vw', alt = '', eager = false, className = '' } = {}) {
  const largest = widths[widths.length - 1];
  const middle = widths[Math.floor(widths.length / 2)];
  const loading = eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
  return `<img${className ? ` class="${className}"` : ''} src="${photoUrl(url, middle, ratio)}" srcset="${srcset(url, widths, ratio)}" sizes="${sizes}" width="${largest}" height="${Math.round(largest * ratio)}" alt="${escapeHtml(alt)}" ${loading}>`;
}

const GLASS = '<path d="M2 1h10l-.6 7.2A4.4 4.4 0 0 1 7.6 12.3V19h3v1.5H3.4V19h3v-6.7A4.4 4.4 0 0 1 2.6 8.2Z" fill="currentColor"/>';

// Um copo por lugar: cheios os ocupados, vazios os livres
export function glasses(seats, taken) {
  const list = Array.from({ length: seats }, (_, i) => `<svg viewBox="0 0 14 22" class="${i < taken ? 'is-taken' : 'is-free'}" aria-hidden="true">${GLASS}</svg>`);
  return `<span class="glasses" role="img" aria-label="${taken} de ${seats} lugares ocupados">${list.join('')}</span>`;
}

// Número da carta: muda todas as quintas-feiras
export function cartaNumber(date = new Date()) {
  const start = Date.UTC(2026, 0, 1);
  return Math.floor((date.getTime() - start) / (7 * 86400000)) + 1;
}

export { escapeHtml };
