// Preço por pessoa conforme o tamanho do grupo: quanto maior o grupo, mais barato fica a cada um.
// Usado no servidor (reservas e vouchers) e no browser (simulação antes de reservar).
export const PER_PERSON = { 2: 28, 3: 24, 4: 21, 5: 19, 6: 18 };

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

export function groupPrice(players) {
  const n = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, Number(players) || MIN_PLAYERS));
  return { players: n, perPerson: PER_PERSON[n], total: PER_PERSON[n] * n };
}

export const euros = (value) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: value % 1 ? 2 : 0 }).format(value);

const DAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function shortDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DAYS[day]}, ${d} ${MONTHS[m - 1]}`;
}

export const dayName = (iso) => DAYS[new Date(`${iso}T12:00:00Z`).getUTCDay()];

export const monthShort = (iso) => MONTHS[Number(iso.slice(5, 7)) - 1];

export const photoUrl = (id, width, height) =>
  `https://images.unsplash.com/photo-${id}?w=${width}${height ? `&h=${height}` : ''}&q=70&auto=format&fit=crop`;

export const photoSrcset = (id, widths, ratio) =>
  widths.map((w) => `${photoUrl(id, w, ratio ? Math.round(w * ratio) : undefined)} ${w}w`).join(', ');

// "41:07" ↔ segundos
export const clock = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
