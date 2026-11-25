export const esc = (value = '') =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Parágrafos a partir de texto simples, já escapado
export const paragraphs = (text = '') =>
  esc(text)
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');

export const initialData = (data) =>
  `<script type="application/json" id="initial-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

// Datas escritas à mão para não depender dos dados de idioma instalados no Node
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const local = (iso) => new Date(new Date(iso).toLocaleString('en-US', { timeZone: 'Europe/Lisbon' }));

export const dateLong = (iso) => {
  const d = local(iso);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
};
export const dateShort = (iso) => {
  const d = local(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
};
export const isoDate = (iso) => new Date(iso).toISOString().slice(0, 10);

// Imagem em webp com três larguras, medidas reservadas para não haver saltos
export function picture(base, { alt = '', sizes = '(max-width: 700px) 100vw, 50vw', eager = false, cls = '' } = {}) {
  const srcset = [480, 800, 1200].map((w) => `${base}-${w}.webp ${w}w`).join(', ');
  return `<img${cls ? ` class="${cls}"` : ''} src="${base}-800.webp" srcset="${srcset}" sizes="${sizes}" width="1200" height="900" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

export const arrow = '<svg class="arr" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';

// Etiqueta de serviço com a forma e a cor do bloco correspondente
export const chip = (category, label) => `<span class="chip chip--${esc(category)}"><i aria-hidden="true"></i>${esc(label)}</span>`;

export function workCard(w, { eager = false, sizes } = {}) {
  return `<article class="card card--${esc(w.category)}">
    <a class="card__link" href="/trabalhos/${esc(w.slug)}">
      <div class="card__img">${picture(w.cover, { alt: `${w.client}: ${w.title}`, eager, sizes: sizes ?? '(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 31vw' })}</div>
      <div class="card__txt">
        <p class="card__meta">${chip(w.category, w.categoryLabel)}<span>${esc(w.client)} · ${w.year}</span></p>
        <h3>${esc(w.title)}</h3>
      </div>
    </a>
  </article>`;
}

export const pageHead = ({ kicker, title, lead, crumbs = [], aside = '' }) => `<header class="phead"><div class="wrap phead__grid">
  <div>
    ${crumbs.length ? `<nav class="crumbs" aria-label="Caminho"><a href="/">Início</a>${crumbs.map(([label, href]) => `<span aria-hidden="true">/</span>${href ? `<a href="${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`}`).join('')}</nav>` : ''}
    ${kicker ? `<p class="kicker">${kicker}</p>` : ''}
    <h1 class="display">${title}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ''}
  </div>
  ${aside}
</div></header>`;
