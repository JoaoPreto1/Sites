import { api } from '../api.js';
import { euros, groupPrice, shortDate } from '../shared/pricing.js';

const agenda = document.querySelector('[data-agenda]');
const room = agenda.dataset.room;
const min = Number(agenda.dataset.min);
const max = Number(agenda.dataset.max);
const slotsBox = agenda.querySelector('[data-slots]');
const label = agenda.querySelector('[data-day-label]');
const out = agenda.querySelector('[data-players-out]');
const price = agenda.querySelector('[data-price]');
const go = agenda.querySelector('[data-go]');

const state = { date: null, time: null, players: Number(out.textContent) };

function update() {
  const { total, perPerson } = groupPrice(state.players);
  out.textContent = state.players;
  price.innerHTML = `${state.players} pessoas × ${euros(perPerson)} =<b>${euros(total)}</b>`;
  const params = new URLSearchParams({ sala: room, pessoas: state.players });
  if (state.date) params.set('data', state.date);
  if (state.time) params.set('hora', state.time);
  go.href = `/reservar?${params}`;
  go.setAttribute('aria-disabled', String(!state.time));
  go.textContent = state.time ? `Reservar ${shortDate(state.date).split(',')[0]} às ${state.time}` : 'Escolha uma hora';
}

async function pickDay(button) {
  agenda.querySelectorAll('.day').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
  state.date = button.dataset.date;
  state.time = null;
  label.textContent = shortDate(state.date);
  slotsBox.innerHTML = '<p class="hint">A carregar as horas…</p>';
  update();
  try {
    const { slots } = await api(`/salas/${room}/horarios?data=${state.date}`);
    slotsBox.innerHTML = slots
      .map((s) => `<button type="button" class="slot" data-time="${s.time}" aria-pressed="false"${s.free ? '' : ' disabled aria-label="' + s.time + ', ocupada"'}>${s.time}</button>`)
      .join('');
  } catch {
    slotsBox.innerHTML = '<p class="hint">Não conseguimos ver as horas. Tente outra vez.</p>';
  }
}

agenda.querySelector('.agenda__days').addEventListener('click', (event) => {
  const button = event.target.closest('.day');
  if (button && !button.disabled) pickDay(button);
});

slotsBox.addEventListener('click', (event) => {
  const button = event.target.closest('.slot');
  if (!button || button.disabled) return;
  slotsBox.querySelectorAll('.slot').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
  state.time = button.dataset.time;
  update();
});

agenda.querySelectorAll('[data-players]').forEach((button) =>
  button.addEventListener('click', () => {
    state.players = Math.min(max, Math.max(min, state.players + Number(button.dataset.players)));
    update();
  }),
);

const first = agenda.querySelector('.day:not([disabled])');
if (first) pickDay(first);
else slotsBox.innerHTML = '<p class="hint">Sem sessões livres nas próximas semanas. Ligue-nos.</p>';
update();
