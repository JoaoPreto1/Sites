import { api, ApiError } from '../api.js';
import { currentUser } from '../session.js';
import { euros, groupPrice, shortDate } from '../shared/pricing.js';
import { params, showFieldErrors, submitting, toast } from '../utils.js';

const root = document.querySelector('[data-booking]');
const form = root.querySelector('[data-form]');
const times = form.querySelector('[data-times]');
const out = form.querySelector('[data-players-out]');
const msg = form.querySelector('[data-voucher-msg]');
const ticket = root.querySelector('[data-ticket]');
const t = (name) => root.querySelector(`[data-t-${name}]`);

const query = params();
const state = { room: null, date: query.data ?? '', time: query.hora ?? '', players: Number(query.pessoas) || 4, voucher: null };

const roomInput = () => form.querySelector('input[name="room"]:checked');

function render() {
  const input = roomInput();
  const min = Number(input?.dataset.min ?? 2);
  const max = Number(input?.dataset.max ?? 6);
  state.players = Math.min(max, Math.max(min, state.players));
  out.textContent = state.players;
  form.elements.players.value = state.players;
  form.elements.time.value = state.time;

  const price = groupPrice(state.players);
  const covered = state.voucher && state.players <= state.voucher.players;
  ticket.style.setProperty('--accent', input?.dataset.color ?? '');
  t('room').textContent = input?.dataset.name ?? 'Escolha uma sala';
  t('date').textContent = state.date ? shortDate(state.date) : '—';
  t('time').textContent = state.time || '—';
  t('players').textContent = `${state.players} pessoas`;
  t('duration').textContent = input ? `${input.dataset.duration} minutos` : '—';
  t('total').textContent = covered ? 'voucher' : euros(price.total);
  t('pp').textContent = covered ? state.voucher.code : `${euros(price.perPerson)} por pessoa`;
}

async function loadTimes() {
  const input = roomInput();
  if (!input || !state.date) {
    times.innerHTML = '<p class="hint">Escolha primeiro a sala e o dia.</p>';
    return;
  }
  times.innerHTML = '<p class="hint">A ver as horas livres…</p>';
  try {
    const { slots } = await api(`/salas/${input.value}/horarios?data=${state.date}`);
    if (!slots.length) {
      times.innerHTML = '<p class="hint">Neste dia estamos fechados. Escolha outro.</p>';
      state.time = '';
    } else {
      if (!slots.some((s) => s.free && s.time === state.time)) state.time = '';
      times.innerHTML = slots
        .map((s) => `<button type="button" class="slot" data-time="${s.time}" aria-pressed="${s.time === state.time}"${s.free ? '' : ` disabled aria-label="${s.time}, ocupada"`}>${s.time}</button>`)
        .join('');
      if (!slots.some((s) => s.free)) times.insertAdjacentHTML('beforeend', '<p class="hint">Este dia já está cheio nesta sala.</p>');
    }
  } catch {
    times.innerHTML = '<p class="hint">Não conseguimos ver as horas. Escolha outro dia.</p>';
  }
  render();
}

form.addEventListener('change', (event) => {
  if (event.target.name === 'room') {
    loadTimes();
    render();
  }
  if (event.target.name === 'date') {
    state.date = event.target.value;
    loadTimes();
  }
});

times.addEventListener('click', (event) => {
  const button = event.target.closest('.slot');
  if (!button || button.disabled) return;
  state.time = button.dataset.time;
  times.querySelectorAll('.slot').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
  render();
});

form.querySelectorAll('[data-players]').forEach((b) =>
  b.addEventListener('click', () => {
    state.players += Number(b.dataset.players);
    render();
  }),
);

form.querySelector('[data-check-voucher]').addEventListener('click', async () => {
  const code = form.elements.voucher.value.trim().toUpperCase();
  msg.className = 'hint';
  state.voucher = null;
  if (!/^CHAVE-[A-Z0-9]{4}$/.test(code)) {
    msg.textContent = 'O código tem este formato: CHAVE-XXXX.';
    return render();
  }
  try {
    const { voucher } = await api(`/vouchers/${code}`);
    if (voucher.status !== 'ativo') msg.textContent = voucher.status === 'usado' ? 'Este voucher já foi usado.' : 'Este voucher ainda está por pagar.';
    else {
      state.voucher = voucher;
      msg.className = 'hint ok';
      msg.textContent = `Voucher válido para ${voucher.players} pessoas${voucher.room ? ', só nesta sala' : ', em qualquer sala'}.`;
      if (voucher.room) {
        const radio = form.querySelector(`input[value="${voucher.room}"]`);
        if (radio && !radio.checked) {
          radio.checked = true;
          loadTimes();
        }
      }
    }
  } catch {
    msg.textContent = 'Não encontrámos este voucher. Confirme o código.';
  }
  render();
});

function done(booking) {
  root.innerHTML = `<div class="done">
    <p class="kicker">Reserva confirmada</p>
    <h2 class="display">A porta fica à vossa espera.</h2>
    <div class="ticket" style="--accent:${booking.room.color}">
      <div class="ticket__main">
        <p class="type ticket__kicker">Fechadura · bilhete de entrada</p>
        <p class="display ticket__room">${booking.room.name}</p>
        <dl class="ticket__data">
          <div><dt>Dia</dt><dd>${shortDate(booking.date)}</dd></div>
          <div><dt>Hora</dt><dd>${booking.time}</dd></div>
          <div><dt>Equipa</dt><dd>${booking.players} pessoas</dd></div>
          <div><dt>Nome da equipa</dt><dd></dd></div>
        </dl>
      </div>
      <div class="ticket__stub"><span class="type">código</span><b>${booking.code}</b><span class="hint">${booking.total ? `${euros(booking.total)} no balcão` : 'pago com voucher'}</span></div>
    </div>
    <ul>
      <li>Cheguem 15 minutos antes. A porta é verde, na Rua de Cedofeita 196.</li>
      <li>Mandámos o bilhete para <b></b>.</li>
      <li>Para mudar o número de pessoas ou cancelar, use o código ou a sua conta.</li>
    </ul>
    <div class="chips">${currentUser() ? '<a class="btn btn--brass" href="/conta">Ver no meu dossier</a>' : '<a class="btn btn--brass" href="/entrar?modo=criar&next=/conta">Criar conta para guardar a reserva</a>'}<a class="btn" href="/salas">Ver outras salas</a></div>
  </div>`;
  root.querySelector('.ticket__data div:last-child dd').textContent = booking.team;
  root.querySelector('ul b').textContent = booking.email;
  root.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = {
    room: roomInput()?.value ?? '',
    date: state.date,
    time: state.time,
    players: state.players,
    team: form.elements.team.value.trim(),
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim(),
    phone: form.elements.phone.value.trim(),
    voucher: form.elements.voucher.value.trim().toUpperCase(),
  };
  if (!data.room) return toast('Escolha uma sala.', { type: 'error' });
  if (!data.date || !data.time) return toast('Escolha o dia e a hora.', { type: 'error' });

  await submitting(form.querySelector('[type="submit"]'), async () => {
    try {
      const { booking } = await api('/reservas', { method: 'POST', body: data, auth: true });
      done(booking);
    } catch (err) {
      if (err instanceof ApiError) {
        showFieldErrors(form, err.details);
        toast(err.message, { type: 'error' });
        if (err.status === 409) loadTimes();
      } else toast('Sem ligação. Tente outra vez.', { type: 'error' });
    }
  });
});

// Valores vindos da agenda da sala, de um voucher ou da sessão iniciada
const preset = form.querySelector(`input[name="room"][value="${query.sala}"]`) ?? null;
if (preset) preset.checked = true;
if (state.date) form.elements.date.value = state.date;
if (query.voucher) form.elements.voucher.value = query.voucher;
const user = currentUser();
if (user) {
  form.elements.name.value = user.name ?? '';
  form.elements.email.value = user.email ?? '';
  form.elements.phone.value = user.phone ?? '';
}
form.querySelector('[data-sheet-no]').textContent = String(Date.now()).slice(-5);
render();
loadTimes();
if (query.voucher) form.querySelector('[data-check-voucher]').click();
