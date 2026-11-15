import { api } from '../api.js';
import { setupQuickPlay } from '../miniplayer.js';
import * as player from '../player.js';
import { currentUser } from '../session.js';
import { initialData } from '../utils.js';

const { record, related } = initialData();
const pull = document.querySelector('[data-pull]');
const label = document.querySelector('[data-play-label]');

setupQuickPlay([record, ...related]);

function play(index) {
  player.prepare();
  const state = player.snapshot();
  if (state.record?.id === record.id && state.index === index) player.toggle();
  else player.playRecord(record, index);
}

document.querySelector('[data-tracks]').addEventListener('click', (event) => {
  const button = event.target.closest('[data-track]');
  if (button) play(Number(button.dataset.track));
});

document.querySelector('[data-play-all]').addEventListener('click', () => {
  const state = player.snapshot();
  if (state.record?.id === record.id) player.toggle();
  else play(0);
});

player.on('change', (state) => {
  const mine = state.record?.id === record.id;
  pull.classList.toggle('is-playing', mine && state.playing);
  label.textContent = mine ? (state.playing ? 'Pausar' : 'Continuar') : 'Ouvir o lado A';
  for (const button of document.querySelectorAll('[data-track]')) {
    button.setAttribute('aria-pressed', mine && state.playing && Number(button.dataset.track) === state.index);
  }
});

// Quem já comprou este disco vê um aviso (e ouve as faixas completas, se existirem)
if (currentUser()) {
  api('/discoteca', { auth: true })
    .then(({ records }) => {
      if (records.some((r) => r.id === record.id)) document.querySelector('[data-owned]').hidden = false;
    })
    .catch(() => {});
}
