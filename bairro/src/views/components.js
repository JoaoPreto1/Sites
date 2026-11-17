import { escapeHtml, photoSrcset, photoUrl } from '../../public/js/shared/format.js';

export const esc = escapeHtml;

export const icon = (type, label = '') => `<span class="ico ico--${type}" aria-hidden="true"></span>${label}`;

// Fotografia do Unsplash com srcset; as que aparecem logo no ecrã carregam com prioridade
export function photo({ id, alt, widths = [400, 700, 1000], sizes = '100vw', ratio, eager = false, cls = '' }) {
  const largest = widths.at(-1);
  const width = widths[1] ?? widths[0];
  const height = ratio ? Math.round(width * ratio) : Math.round(width * 0.66);
  return `<img class="${cls}" src="${photoUrl(id, width, ratio)}" srcset="${photoSrcset(id, widths, ratio)}" sizes="${sizes}" width="${largest}" height="${ratio ? Math.round(largest * ratio) : height}" alt="${esc(alt)}" ${
    eager ? 'fetchpriority="high"' : 'loading="lazy"'
  } decoding="async">`;
}

const data = (value) => (value ? `<script type="application/json" class="win-data">${JSON.stringify(value).replace(/</g, '\\u003c')}</script>` : '');

// Cada página é uma janela. A janela principal fica no fluxo do documento (o h1 vai no corpo dela),
// as outras flutuam por cima e o desktop.js deixa arrastá-las.
export function win({ id, url, title, label = title, ico = 'app', x = 40, y = 30, w = 640, primary = false, cls = '', menu = '', body, status = '', script = '', state, flush = false }) {
  return `<article class="win${primary ? ' win--primary' : ''}${cls ? ` ${cls}` : ''}" id="w-${id}" data-url="${url}" data-title="${esc(label)}" data-ico="${ico}"${
    primary ? ' data-primary' : ''
  }${script ? ` data-script="${script}"` : ''} style="--x:${x}px;--y:${y}px;--w:${w}px" aria-label="${esc(label)}">
  <div class="win__bar">
    <button class="win__ctl" type="button" data-act="close" aria-label="Fechar ${esc(label)}"></button>
    <p class="win__title">${title}</p>
    <span class="win__ctls"><button class="win__ctl" type="button" data-act="max" aria-label="Maximizar ${esc(label)}"></button><button class="win__ctl" type="button" data-act="min" aria-label="Minimizar ${esc(label)}"></button></span>
  </div>
  ${menu ? `<nav class="win__menu" aria-label="Menu de ${esc(label)}">${menu}</nav>` : ''}
  <div class="win__body${flush ? ' win__body--flush' : ''}">${body}</div>
  ${status ? `<div class="win__status">${status}</div>` : ''}
  ${data(state)}
</article>`;
}

export const options = (list, selected) =>
  list.map(([value, label]) => `<option value="${value}"${value === selected ? ' selected' : ''}>${esc(label)}</option>`).join('');
