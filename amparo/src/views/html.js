import { categoryLabel } from '../config/platform.js';
import { euros, eurosShort } from '../utils/money.js';

export { euros, eurosShort };

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
const pad = (n) => String(n).padStart(2, '0');

export const dateLong = (iso) => {
  const d = local(iso);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
};
export const dateShort = (iso) => `${local(iso).getDate()} ${MONTHS[local(iso).getMonth()].slice(0, 3)}`;
export const dateNum = (iso) => {
  const d = local(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};
export const timeNum = (iso) => {
  const d = local(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const monthName = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS[m - 1]} de ${y}`;
};
export const deadlineDate = (ymd) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return `${d} de ${MONTHS[m - 1]}`;
};

export const daysUntil = (ymd) => Math.ceil((new Date(`${ymd}T23:59:59Z`).getTime() - Date.now()) / 86400000);

export function since(iso) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return 'hoje';
  if (days === 1) return 'ontem';
  if (days < 30) return `há ${days} dias`;
  return dateShort(iso);
}

export const num = (n) => String(n).replace('.', ',');

// Ícones das sete despesas: desenhos simples a duas cores, usados nas linhas da conta
const GLYPHS = {
  renda: '<path d="M4 12 16 4l12 8v14H4z" fill="var(--g1)"/><path d="M4 12 16 4l12 8" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round"/><rect x="13" y="17" width="6" height="9" rx="1" fill="var(--g2)"/><path d="M4 26h24" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/>',
  eletricidade: '<circle cx="16" cy="13" r="8" fill="var(--g1)"/><path d="M12 21h8v3a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" fill="var(--g2)"/><path d="M17 8l-4 6h5l-3 5" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  agua: '<path d="M16 4c6 8 9 12 9 16a9 9 0 0 1-18 0c0-4 3-8 9-16z" fill="var(--g1)"/><path d="M11 21c2 2 5 3 8 1" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/><circle cx="22" cy="9" r="2.5" fill="var(--g2)"/>',
  alimentacao: '<path d="M5 12h22l-3 14H8z" fill="var(--g1)"/><path d="M11 12l4-7M21 12l-4-7" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="18" r="2" fill="var(--g2)"/><circle cx="19" cy="20" r="2.5" fill="var(--g2)"/><path d="M5 12h22" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/>',
  saude: '<rect x="5" y="5" width="22" height="22" rx="6" fill="var(--g1)"/><path d="M16 10v12M10 16h12" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="24" r="4" fill="var(--g2)"/>',
  transportes: '<rect x="6" y="5" width="20" height="18" rx="4" fill="var(--g1)"/><path d="M6 14h20" stroke="var(--ink)" stroke-width="2"/><circle cx="11" cy="26" r="2.5" fill="var(--ink)"/><circle cx="21" cy="26" r="2.5" fill="var(--ink)"/><rect x="9" y="8" width="14" height="3" rx="1" fill="var(--g2)"/>',
  educacao: '<path d="M4 9c5-2 9-2 12 1v16c-3-3-7-3-12-1z" fill="var(--g1)"/><path d="M28 9c-5-2-9-2-12 1v16c3-3 7-3 12-1z" fill="var(--g2)"/><path d="M16 10v16" stroke="var(--ink)" stroke-width="2"/>',
};

export const glyph = (category, size = 32) =>
  `<svg class="glyph glyph--${category}" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true">${GLYPHS[category] ?? GLYPHS.renda}</svg>`;

export const categoryChip = (category) => `<span class="chip chip--${category}">${glyph(category, 18)}${esc(categoryLabel(category))}</span>`;

export const icon = {
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  arrow: '<svg class="arr" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
  flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
};

// Barra de progresso desenhada como uma fila de pontos que se vão preenchendo
export const meter = (percent, label) =>
  `<div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}" aria-label="${esc(label)}"><span style="width:${percent}%"></span></div>`;

export const exampleTag = (example) => (example ? '<span class="tag-example">Exemplo fictício</span>' : '');

export const pageHead = ({ kicker, title, lead, crumbs = [] }) => `<header class="phead"><div class="wrap">
  ${crumbs.length ? `<nav class="crumbs" aria-label="Caminho"><a href="/">Início</a>${crumbs.map(([label, href]) => `<span aria-hidden="true">/</span>${href ? `<a href="${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`}`).join('')}</nav>` : ''}
  ${kicker ? `<p class="kicker">${kicker}</p>` : ''}
  <h1>${title}</h1>
  ${lead ? `<p class="lead">${lead}</p>` : ''}
</div></header>`;
