import { api, ApiError } from '../api.js';
import { requireUser } from '../session.js';
import { clock, euros, shortDate } from '../shared/pricing.js';
import { toast } from '../utils.js';

const root = document.querySelector('[data-console]');
const board = root.querySelector('[data-board]');
const dateInput = root.querySelector('[data-date]');
const listBox = root.querySelector('[data-list-box]');
const search = root.querySelector('[data-search]');
const dialog = root.querySelector('[data-dialog]');
const resultForm = root.querySelector('[data-result]');
const esc = (v = '') => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

let day = null;
let list = 'confirmada';
let current = null;
const bookingsById = new Map();

const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(new Date());
const shift = (iso, n) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

function cell(row, s) {
  const b = s.booking;
  if (b) {
    bookingsById.set(b.id, { ...b, roomShort: row.room.short });
    const played = b.status === 'jogada';
    const cls = played ? (b.result?.escaped ? 'cell--played' : 'cell--failed') : 'cell--booked';
    const detail = played ? (b.result?.escaped ? `saíram em ${clock(b.result.seconds)}` : 'não saíram') : `${b.players} pessoas · ${b.code}`;
    return `<button type="button" class="cell ${cls}" data-booking="${b.id}"><b>${esc(b.team)}</b><span>${detail}</span></button>`;
  }
  if (s.blocked || row.blockedDay) return `<button type="button" class="cell cell--blocked" data-block="${row.room.id}" data-time="${s.time}" ${row.blockedDay ? 'disabled' : ''}>${row.blockedDay ? esc(row.blockedDay) : 'bloqueada'}</button>`;
  return `<button type="button" class="cell cell--free" data-block="${row.room.id}" data-time="${s.time}" aria-label="${row.room.short} às ${s.time}: livre, bloquear">livre</button>`;
}

async function loadDay(date) {
  day = date;
  dateInput.value = date;
  board.innerHTML = '<p class="hint" style="padding:20px">A carregar o dia…</p>';
  const data = await api(`/admin/dia?data=${date}`, { auth: true });
  if (data.closed) {
    board.innerHTML = `<p class="day-closed">${shortDate(date)}: fechado.</p>`;
    return;
  }
  board.innerHTML = `<table class="grid-day"><caption class="sr-only">Sessões de ${shortDate(date)}</caption>
    <thead><tr><th scope="col">${shortDate(date)}</th>${data.slots.map((t) => `<th scope="col">${t}</th>`).join('')}</tr></thead>
    <tbody>${data.rows
      .map((row) => `<tr><th scope="row" style="--accent:${row.room.color}"><small>Caso ${row.room.caseNo}</small><b>${esc(row.room.short)}</b></th>${row.sessions.map((s) => `<td>${cell(row, s)}</td>`).join('')}</tr>`)
      .join('')}</tbody></table>`;
}

async function loadList() {
  listBox.innerHTML = '<p class="hint">A carregar…</p>';
  if (list === 'vouchers') {
    const { vouchers } = await api('/admin/vouchers', { auth: true });
    listBox.innerHTML = `<table class="rows"><thead><tr><th>Código</th><th>De / para</th><th>Sala</th><th>Pessoas</th><th>Valor</th><th>Estado</th><th></th></tr></thead><tbody>${vouchers
      .map(
        (v) =>
          `<tr><td class="code">${v.code}</td><td>${esc(v.from)} → ${esc(v.to)}<br><small class="hint">${esc(v.buyerEmail)}</small></td><td>${v.roomName ? esc(v.roomName) : 'qualquer'}</td><td>${v.players}</td><td>${euros(v.amount)}</td><td>${v.status}</td><td>${v.status === 'por pagar' ? `<button class="btn btn--brass btn--small" data-activate="${v.id}">Marcar como pago</button>` : ''}</td></tr>`,
      )
      .join('')}</tbody></table>`;
    return;
  }
  const q = search.value.trim();
  const { bookings } = await api(`/admin/reservas?estado=${list}${q ? `&q=${encodeURIComponent(q)}` : ''}`, { auth: true });
  bookings.forEach((b) => bookingsById.set(b.id, { ...b, roomShort: b.room.short }));
  listBox.innerHTML = bookings.length
    ? `<table class="rows"><thead><tr><th>Código</th><th>Dia</th><th>Sala</th><th>Equipa</th><th>Pessoas</th><th>${list === 'jogada' ? 'Resultado' : 'Contacto'}</th><th></th></tr></thead><tbody>${bookings
        .map(
          (b) =>
            `<tr><td class="code">${b.code}</td><td>${shortDate(b.date)}, ${b.time}</td><td>${esc(b.room.short)}</td><td>${esc(b.team)}</td><td>${b.players}</td><td>${list === 'jogada' ? (b.result?.escaped ? clock(b.result.seconds) : 'não saíram') : esc(b.email)}</td><td><button class="btn btn--small" data-open="${b.id}">Abrir</button></td></tr>`,
        )
        .join('')}</tbody></table>`
    : '<p class="empty">Nada para mostrar.</p>';
}

function openBooking(id) {
  const b = bookingsById.get(id);
  if (!b) return;
  current = b;
  root.querySelector('[data-dlg-title]').textContent = `${b.team}`;
  root.querySelector('[data-dlg-info]').textContent = `${b.roomShort} · ${shortDate(b.date)}, ${b.time} · ${b.players} pessoas · ${b.code} · ${b.email}`;
  if (b.result) {
    resultForm.elements.escaped.value = String(b.result.escaped);
    resultForm.elements.minutes.value = Math.floor(b.result.seconds / 60);
    resultForm.elements.seconds.value = b.result.seconds % 60;
    resultForm.elements.hints.value = b.result.hints;
  }
  root.querySelector('[data-cancel-booking]').hidden = b.status !== 'confirmada';
  dialog.showModal();
}

const refresh = () => Promise.all([loadDay(day), loadList()]);

board.addEventListener('click', async (event) => {
  const booking = event.target.closest('[data-booking]');
  if (booking) return openBooking(booking.dataset.booking);
  const block = event.target.closest('[data-block]');
  if (!block || block.disabled) return;
  try {
    const { blocked } = await api('/admin/bloqueios', { method: 'POST', body: { roomId: block.dataset.block, date: day, time: block.dataset.time }, auth: true });
    toast(blocked ? `Sessão das ${block.dataset.time} bloqueada.` : `Sessão das ${block.dataset.time} livre outra vez.`);
    await loadDay(day);
  } catch (err) {
    toast(err instanceof ApiError ? err.message : 'Sem ligação.', { type: 'error' });
  }
});

listBox.addEventListener('click', async (event) => {
  const open = event.target.closest('[data-open]');
  if (open) return openBooking(open.dataset.open);
  const activate = event.target.closest('[data-activate]');
  if (activate) {
    try {
      await api(`/admin/vouchers/${activate.dataset.activate}`, { method: 'PATCH', body: { status: 'ativo' }, auth: true });
      toast('Voucher ativo.');
      await loadList();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Sem ligação.', { type: 'error' });
    }
  }
});

resultForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const body = {
    escaped: resultForm.elements.escaped.value === 'true',
    minutes: Number(resultForm.elements.minutes.value),
    seconds: Number(resultForm.elements.seconds.value),
    hints: Number(resultForm.elements.hints.value),
  };
  try {
    await api(`/admin/reservas/${current.id}/resultado`, { method: 'POST', body, auth: true });
    dialog.close();
    toast('Resultado guardado no registo.');
    await refresh();
  } catch (err) {
    toast(err instanceof ApiError ? err.message : 'Sem ligação.', { type: 'error' });
  }
});

root.querySelector('[data-cancel-booking]').addEventListener('click', async () => {
  if (!window.confirm(`Cancelar a reserva ${current.code}?`)) return;
  try {
    await api(`/admin/reservas/${current.id}/cancelar`, { method: 'POST', auth: true });
    dialog.close();
    toast('Reserva cancelada.');
    await refresh();
  } catch (err) {
    toast(err instanceof ApiError ? err.message : 'Sem ligação.', { type: 'error' });
  }
});

root.querySelector('[data-close]').addEventListener('click', () => dialog.close());
root.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => loadDay(shift(day, Number(b.dataset.day)))));
root.querySelector('[data-today]').addEventListener('click', () => loadDay(todayIso()));
dateInput.addEventListener('change', () => dateInput.value && loadDay(dateInput.value));

root.querySelectorAll('[data-list]').forEach((tab) =>
  tab.addEventListener('click', () => {
    list = tab.dataset.list;
    root.querySelectorAll('[data-list]').forEach((t) => {
      t.setAttribute('aria-selected', String(t === tab));
      t.tabIndex = t === tab ? 0 : -1;
    });
    search.hidden = list === 'vouchers';
    loadList();
  }),
);

let timer;
search.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(loadList, 250);
});

const user = await requireUser({ roles: ['admin'] });
if (user) {
  await loadDay(todayIso());
  await loadList();
}
