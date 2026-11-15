// Botões de ouvir nas capas e o mini leitor fixo em baixo do ecrã
import * as player from './player.js';
import { cover } from './shared/format.js';
import { icons } from './shared/icons.js';

// `records` pode ser uma lista ou uma função que encontra o disco pelo id
export function setupQuickPlay(records, { hideWhen } = {}) {
  const byId = Array.isArray(records) ? Object.fromEntries(records.map((r) => [r.id, r])) : null;
  const find = (id) => (byId ? byId[id] : records(id));

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-play]');
    if (!button) return;
    event.preventDefault();
    const record = find(button.dataset.play);
    if (!record) return;
    player.prepare();
    const state = player.snapshot();
    if (state.record?.id === record.id) player.toggle();
    else player.playRecord(record, Number(button.dataset.track ?? 0));
  });

  const bar = document.createElement('div');
  bar.className = 'mini';
  bar.hidden = true;
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Leitor');
  bar.innerHTML = `
    <img class="mini__cover" alt="" width="52" height="52">
    <a class="mini__text"><b></b><span></span></a>
    <button class="mini__toggle" type="button" aria-label="Tocar ou pausar">${icons.play}${icons.pause}</button>
    <button class="mini__close" type="button" aria-label="Parar">${icons.close}</button>
    <div class="mini__bar"><i></i></div>`;
  document.body.append(bar);
  bar.querySelector('.mini__toggle').addEventListener('click', () => player.toggle());
  bar.querySelector('.mini__close').addEventListener('click', () => player.stop());

  let hidden = false;
  if (hideWhen) {
    new IntersectionObserver(([entry]) => {
      hidden = entry.isIntersecting;
      render(player.snapshot());
    }).observe(hideWhen);
  }

  function render(state) {
    bar.hidden = !state.record || hidden;
    bar.classList.toggle('is-playing', state.playing);
    for (const button of document.querySelectorAll('[data-play]')) {
      const on = state.playing && state.record?.id === button.dataset.play;
      button.setAttribute('aria-pressed', on);
      button.closest('.sleeve')?.classList.toggle('is-playing', on);
    }
    if (!state.record) return;
    const img = bar.querySelector('img');
    const src = cover(state.record, 100);
    if (img.getAttribute('src') !== src) img.src = src;
    bar.querySelector('.mini__text').href = `/discos/${state.record.id}`;
    bar.querySelector('b').textContent = state.track?.title ?? state.record.title;
    bar.querySelector('span').textContent = `${state.record.artist} · ${state.record.title}`;
    bar.querySelector('.mini__bar i').style.width = `${(state.time / (state.duration || 30)) * 100}%`;
  }

  player.on('change', render);
}
