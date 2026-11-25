export const esc = (value = '') =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const pad = (n) => String(n).padStart(2, '0');

export const day = (iso) => {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
export const dayTime = (iso) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const SERVICE = { marcas: 'Marcas', sites: 'Sites', movimento: 'Movimento', rotulos: 'Rótulos', livros: 'Livros' };
export const STATUS = { pendente: 'À espera de resposta', aprovada: 'Aprovada', alteracoes: 'Alterações pedidas', novo: 'Novo', 'em-conversa': 'Em conversa', aceite: 'Aceite', recusado: 'Recusado' };
export const BUDGET = { 'ate-3000': 'Até 3 000 €', '3000-8000': '3 000 a 8 000 €', '8000-15000': '8 000 a 15 000 €', 'mais-15000': 'Mais de 15 000 €', 'nao-sei': 'Ainda não sabe' };

export const chip = (slug) => `<span class="chip chip--${esc(slug)}"><i aria-hidden="true"></i>${esc(SERVICE[slug] ?? slug)}</span>`;
export const badge = (status) => `<span class="badge badge--${esc(status)}">${esc(STATUS[status] ?? status)}</span>`;

export const img = (base, alt, sizes = '(max-width: 700px) 92vw, 420px') =>
  `<img src="${esc(base)}-800.webp" srcset="${[480, 800, 1200].map((w) => `${esc(base)}-${w}.webp ${w}w`).join(', ')}" sizes="${sizes}" width="1200" height="900" alt="${esc(alt)}" loading="lazy" decoding="async">`;

export const paragraphs = (text = '') =>
  esc(text)
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');

export function announce(msg) {
  const live = document.getElementById('live');
  if (!live) return;
  live.textContent = '';
  setTimeout(() => (live.textContent = msg), 50);
}
