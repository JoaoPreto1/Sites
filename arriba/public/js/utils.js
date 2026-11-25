export const esc = (value = '') =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const DAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const asDate = (iso) => new Date(`${iso}T12:00:00Z`);

export const day = (iso) => {
  const d = asDate(iso);
  return `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
};
export const euros = (n) => `${Number(n).toLocaleString('pt-PT')} €`;
export const nights = (n) => `${n} ${n === 1 ? 'noite' : 'noites'}`;
export const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(new Date());

export const STATUS = { confirmada: 'Confirmada', 'em-casa': 'Em casa', terminada: 'Terminada', cancelada: 'Cancelada', pendente: 'Pendente', feito: 'Feito' };
export const badge = (status) => `<span class="estado estado--${esc(status)}">${esc(STATUS[status] ?? status)}</span>`;
export const REQUESTS = { bicicletas: 'Bicicletas', lancheira: 'Lancheira para a praia', massagem: 'Massagem', barco: 'Saída de barco', jantar: 'Mesa para jantar', outro: 'Outro pedido' };

export function announce(msg) {
  const live = document.getElementById('live');
  if (!live) return;
  live.textContent = '';
  setTimeout(() => (live.textContent = msg), 50);
}

let toastTimer;
export function toast(msg, { erro = false } = {}) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('p');
  el.className = `toast${erro ? ' toast--erro' : ''}`;
  el.setAttribute('role', 'status');
  el.textContent = msg;
  document.body.append(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 4000);
}
