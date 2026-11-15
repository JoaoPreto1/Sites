// Mesa de mistura das salas: carregar numa hora livre acende-a; uma segunda hora na mesma sala estende o ensaio
import { api } from '../api.js';
import { currentUser, loginUrl } from '../session.js';
import { hour, longDate, price } from '../shared/format.js';
import { initialData, toast } from '../utils.js';

const data = initialData();
const desk = document.querySelector('[data-desk]');
const channels = document.querySelector('[data-channels]');
const bookButton = document.querySelector('[data-book]');
const $ = (s) => desk.querySelector(s);

let state = { date: data.date, rooms: data.rooms, extras: data.extras, maxHours: data.maxHours };
let pick = null; // { roomId, start, hours }

const room = (id) => state.rooms.find((r) => r.id === id);
const free = (r, h) => r.slots.find((s) => s.hour === h)?.state === 'livre';

function paint() {
  for (const el of channels.querySelectorAll('[data-room]')) {
    const r = room(el.dataset.room);
    const active = pick?.roomId === r.id;
    el.classList.toggle('is-active', active);
    for (const slot of el.querySelectorAll('.slot')) {
      const h = Number(slot.dataset.hour);
      const on = active && h >= pick.start && h < pick.start + pick.hours;
      slot.classList.toggle('is-sel', on);
      slot.setAttribute('aria-pressed', on);
    }
    // O fader desce até à hora escolhida
    const cap = el.querySelector('.ch__cap');
    const index = active ? r.slots.findIndex((s) => s.hour === pick.start) + pick.hours / 2 : r.slots.length * 0.86;
    cap.style.setProperty('--y', `${(index / r.slots.length) * 100}%`);
  }
  summary();
}

function extras() {
  return [...desk.querySelectorAll('[name="extras"]:checked')].map((i) => i.value);
}

function summary() {
  const empty = !pick;
  $('[data-master-empty]').hidden = !empty;
  $('[data-master-sum]').hidden = empty;
  bookButton.disabled = empty;
  if (empty) {
    $('[data-sum-total]').textContent = price(0);
    bookButton.textContent = 'Escolhe as horas';
    return;
  }
  const r = room(pick.roomId);
  const extra = extras().reduce((s, key) => s + state.extras[key].price, 0);
  $('[data-sum-room]').textContent = r.name;
  $('[data-sum-day]').textContent = longDate(state.date);
  $('[data-sum-hours]').textContent = `${hour(pick.start)} → ${hour(pick.start + pick.hours)}`;
  $('[data-sum-rate]').textContent = `${pick.hours} h × ${price(r.price)}`;
  $('[data-sum-base]').textContent = price(r.price * pick.hours);
  $('[data-sum-total]').textContent = price(r.price * pick.hours + extra);
  bookButton.textContent = `Marcar a ${r.name}`;
}

channels.addEventListener('click', (event) => {
  const slot = event.target.closest('.slot');
  if (!slot || slot.disabled) return;
  const roomId = slot.closest('[data-room]').dataset.room;
  const h = Number(slot.dataset.hour);
  const r = room(roomId);

  // Segunda hora na mesma sala: estende até lá, se todas as horas pelo meio estiverem livres
  if (pick?.roomId === roomId && pick.hours === 1 && h !== pick.start) {
    const start = Math.min(h, pick.start);
    const end = Math.max(h, pick.start) + 1;
    const span = Array.from({ length: end - start }, (_, i) => start + i);
    if (end - start > state.maxHours) toast(`No máximo ${state.maxHours} horas seguidas.`, { type: 'error' });
    else if (!span.every((x) => free(r, x))) toast('Há horas ocupadas pelo meio. Escolhe outro bloco.', { type: 'error' });
    else pick = { roomId, start, hours: end - start };
  } else if (pick?.roomId === roomId && h >= pick.start && h < pick.start + pick.hours) {
    pick = null;
  } else {
    pick = { roomId, start: h, hours: 1 };
  }
  paint();
});

desk.addEventListener('change', (event) => {
  if (event.target.name === 'extras') summary();
});

function renderChannels() {
  for (const el of channels.querySelectorAll('[data-room]')) {
    const r = room(el.dataset.room);
    el.querySelectorAll('.slot').forEach((slot, i) => {
      const s = r.slots[i];
      slot.className = `slot is-${s.state}`;
      slot.disabled = s.state !== 'livre';
      slot.innerHTML = s.state === 'ocupada' ? '<i>ocupado</i>' : s.state === 'tua' ? '<i>tua</i>' : '';
      slot.setAttribute('aria-label', `${hour(s.hour)} ${s.state}`);
    });
  }
}

async function load(date) {
  channels.classList.add('is-loading');
  try {
    const result = await api(`/salas?data=${date}`, { auth: Boolean(currentUser()) });
    state = { ...state, date: result.date, rooms: result.rooms };
    pick = null;
    renderChannels();
    paint();
    for (const pad of desk.querySelectorAll('[data-day]')) pad.setAttribute('aria-pressed', pad.dataset.day === result.date);
  } catch (error) {
    toast(error.message, { type: 'error' });
  } finally {
    channels.classList.remove('is-loading');
  }
}

desk.querySelector('.desk__days').addEventListener('click', (event) => {
  const pad = event.target.closest('[data-day]');
  if (pad) load(pad.dataset.day);
});

bookButton.addEventListener('click', async () => {
  if (!pick) return;
  if (!currentUser()) {
    sessionStorage.setItem('rotacao.sala', JSON.stringify({ ...pick, date: state.date }));
    location.href = loginUrl('/salas');
    return;
  }
  bookButton.disabled = true;
  try {
    const { booking } = await api('/salas/reservas', {
      method: 'POST',
      auth: true,
      body: { roomId: pick.roomId, date: state.date, start: pick.start, hours: pick.hours, extras: extras(), band: $('[data-band]').value.trim() || undefined },
    });
    toast(`Marcado: ${room(booking.roomId).name}, ${longDate(booking.date)}, ${hour(booking.start)}–${hour(booking.start + booking.hours)}.`, { link: { href: '/conta#salas', label: 'Ver na conta' } });
    desk.classList.add('is-booked');
    setTimeout(() => desk.classList.remove('is-booked'), 900);
    await load(state.date);
  } catch (error) {
    toast(error.message, { type: 'error' });
    await load(state.date);
  } finally {
    summary();
  }
});

// Quem foi entrar a meio de uma marcação volta com as horas já escolhidas
try {
  const saved = JSON.parse(sessionStorage.getItem('rotacao.sala'));
  sessionStorage.removeItem('rotacao.sala');
  if (saved && currentUser()) {
    load(saved.date).then(() => {
      pick = { roomId: saved.roomId, start: saved.start, hours: saved.hours };
      paint();
    });
  } else if (currentUser()) load(state.date);
} catch {}

paint();
