import { addToBag } from '../bag.js';
import { setupQuickPlay } from '../miniplayer.js';
import * as player from '../player.js';
import { cover, duration, escapeHtml, grade, price } from '../shared/format.js';
import { initialData, toast } from '../utils.js';

const { records, crates } = initialData();
const $ = (selector) => document.querySelector(selector);

const stage = $('.stage');
const deckEl = $('[data-deck]');
const now = $('[data-now]');
const tip = $('[data-tip]');

let deck = null;
let selected = records.find((r) => r.crate === crates[0].slug) ?? records[0];

setupQuickPlay(records, { hideWhen: stage });

// Painel: mostra o disco que está a tocar ou, se nada toca, o que está levantado no caixote
function focus() {
  const state = player.snapshot();
  return state.record ?? selected;
}

// Igual ao servidor: cada faixa vai para o lado onde cai o seu meio
function sides(record) {
  const { tracks } = record;
  const count = tracks.length > 12 ? 4 : 2;
  const total = tracks.reduce((s, t) => s + t.ms, 0) || 1;
  let before = 0;
  let last = -1;
  return tracks.map((t) => {
    const side = Math.min(count - 1, Math.floor(((before + t.ms / 2) / total) * count));
    before += t.ms;
    const first = side !== last;
    last = side;
    return { ...t, side: 'ABCD'[side], first };
  });
}

let shownId = null;
let shownBefore = false;
function renderPanel() {
  const state = player.snapshot();
  const record = focus();
  const playingThis = state.record?.id === record.id;
  now.classList.toggle('is-playing', state.playing);
  $('[data-now-state]').lastChild.textContent = state.record ? (state.playing ? ' A tocar' : ' Em pausa') : ' No caixote';
  const idle = !state.record && !hasSelected;
  $('[data-now-empty]').hidden = !idle;
  $('[data-now-record]').hidden = idle;

  if (shownId !== record.id) {
    shownId = record.id;
    $('[data-now-cover]').src = cover(record, 300);
    $('[data-now-artist]').textContent = record.artist;
    $('[data-now-title]').textContent = record.title;
    $('[data-now-meta]').textContent = `${record.year} · ${record.label} · ${record.pressing}`;
    $('[data-now-chips]').innerHTML = `<span class="chip chip--led">Disco ${record.media}</span><span class="chip">Capa ${record.sleeve}</span>${
      record.stock <= 1 ? '<span class="chip chip--warn">Último exemplar</span>' : ''
    }`;
    $('[data-now-price]').textContent = price(record.price);
    $('[data-now-link]').href = `/discos/${record.id}`;
    $('[data-now-tracks]').innerHTML = sides(record)
      .map(
        (t, i) =>
          `${t.first ? `<li class="side">Lado ${t.side}</li>` : ''}<li><button type="button" data-track="${i}"><span>${t.side}${t.number}</span><span>${escapeHtml(t.title)}</span><span>${duration(t.ms)}</span></button></li>`,
      )
      .join('');
    // Repete a animação de entrada do painel quando muda de disco (não no primeiro desenho)
    if (shownBefore) {
      $('[data-now-record]').style.animation = 'none';
      void $('[data-now-record]').offsetWidth;
      $('[data-now-record]').style.animation = '';
    }
    shownBefore = true;
  }

  $('[data-now-player]').hidden = !playingThis;
  $('[data-now-play]').hidden = playingThis;
  for (const button of document.querySelectorAll('[data-track]')) {
    button.setAttribute('aria-current', playingThis && Number(button.dataset.track) === state.index);
  }
  if (playingThis) {
    $('[data-now-track]').textContent = `${state.index + 1}. ${state.track?.title ?? ''}`;
    const progress = state.time / (state.duration || 30);
    $('[data-now-fill]').style.width = `${progress * 100}%`;
    $('[data-now-bar]').setAttribute('aria-valuenow', Math.round(progress * 100));
    $('[data-now-time]').textContent = duration(state.time * 1000);
    $('[data-now-dur]').textContent = duration((state.duration || 30) * 1000);
    $('[data-now-kind]').textContent = state.full ? 'faixa completa' : 'pré-escuta';
  }
}

let hasSelected = false;
function onSelect(record) {
  if (!record) return;
  selected = record;
  hasSelected = true;
  for (const button of document.querySelectorAll('[data-crate]')) button.setAttribute('aria-pressed', button.dataset.crate === record.crate);
  if (deck) $('[data-flip-pos]').textContent = `${deck.position.index + 1} / ${deck.position.total}`;
  renderPanel();
}

function onHover(info) {
  if (!info) {
    tip.hidden = true;
    return;
  }
  const { record, onDeck, selected: isSelected, x, y } = info;
  tip.hidden = false;
  tip.style.left = `${x}px`;
  tip.style.top = `${y}px`;
  tip.innerHTML = `<b>${escapeHtml(record.title)}</b>${escapeHtml(record.artist)} · ${price(record.price)}<small>${
    onDeck ? 'Clica para pausar ou continuar' : isSelected ? 'Clica para pôr a tocar' : 'Clica para levantar'
  }</small>`;
}

const play = (record = selected, index = 0) => {
  player.prepare();
  if (deck) deck.play(record.id, index);
  else player.playRecord(record, index);
};

// Controlos do painel
$('[data-now-play]').addEventListener('click', () => play(focus()));
$('[data-now-toggle]').addEventListener('click', () => player.toggle());
$('[data-now-prev]').addEventListener('click', () => player.prev());
$('[data-now-next]').addEventListener('click', () => player.next());
$('[data-now-add]').addEventListener('click', () => {
  const record = focus();
  addToBag(record.id);
  toast(`${record.title} no saco.`, { link: { href: '/saco', label: 'Ver saco' } });
});
$('[data-now-tracks]').addEventListener('click', (event) => {
  const button = event.target.closest('[data-track]');
  if (button) play(focus(), Number(button.dataset.track));
});
const volume = $('[data-now-volume]');
volume.value = player.snapshot().volume;
volume.addEventListener('input', () => player.setVolume(Number(volume.value)));

const bar = $('[data-now-bar]');
bar.addEventListener('click', (event) => {
  const rect = bar.getBoundingClientRect();
  player.seek((event.clientX - rect.left) / rect.width);
});
bar.addEventListener('keydown', (event) => {
  const state = player.snapshot();
  const step = event.key === 'ArrowRight' ? 0.1 : event.key === 'ArrowLeft' ? -0.1 : 0;
  if (step) player.seek(state.time / (state.duration || 30) + step);
});

// Separadores e setas
document.querySelector('.stage__controls').addEventListener('click', (event) => {
  const crate = event.target.closest('[data-crate]');
  const flip = event.target.closest('[data-flip]');
  if (crate) {
    if (deck) deck.selectCrate(crate.dataset.crate);
    else onSelect(records.find((r) => r.crate === crate.dataset.crate));
  }
  if (flip && deck) Number(flip.dataset.flip) > 0 ? deck.next() : deck.prev();
});

deckEl.addEventListener('keydown', (event) => {
  if (!deck) return;
  if (event.key === 'ArrowRight') deck.next();
  else if (event.key === 'ArrowLeft') deck.prev();
  else if (event.key === 'Enter') play(deck.selected);
  else if (event.key === ' ') player.toggle();
  else return;
  event.preventDefault();
});

// Medidor: barras que dançam com o som
const vu = $('[data-now-vu]');
const vuCtx = vu.getContext('2d');
// Só desenha enquanto há som, para não gastar o processador com a página parada
let vuFrame = 0;
function drawVu() {
  const { bins } = player.level();
  vuCtx.clearRect(0, 0, vu.width, vu.height);
  if (!bins) {
    vuFrame = 0;
    return;
  }
  vuFrame = requestAnimationFrame(drawVu);
  const count = 20;
  const w = vu.width / count;
  for (let i = 0; i < count; i++) {
    const v = bins[Math.floor(2 + i * 2.6)] / 255;
    const h = Math.max(2, v * vu.height);
    vuCtx.fillStyle = v > 0.82 ? '#ff4b3a' : v > 0.6 ? '#ffd23f' : '#4be37d';
    vuCtx.fillRect(i * w + 1, vu.height - h, w - 2, h);
  }
}
player.on('play', () => {
  if (!vuFrame) vuFrame = requestAnimationFrame(drawVu);
});

player.on('change', renderPanel);
for (const button of document.querySelectorAll('[data-crate]')) button.setAttribute('aria-pressed', button.dataset.crate === selected.crate);
renderPanel();

// O 3D chega depois do resto: sozinho em computadores, com um toque em telemóveis
function webgl() {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

let loading = null;
function startDeck() {
  loading ??= import('../deck/index.js')
    .then(({ createDeck }) => {
      deck = createDeck(deckEl, {
        records,
        crates,
        onSelect,
        onHover,
        onBusy: (on) => ($('[data-busy]').hidden = !on),
      });
      $('[data-poster]').classList.add('is-gone');
      deckEl.classList.remove('is-manual');
      renderPanel();
    })
    .catch(() => {
      deckEl.classList.remove('is-manual');
      toast('Não deu para ligar o gira-discos 3D neste aparelho. As capas continuam a tocar.', { type: 'error' });
    });
  return loading;
}

if (webgl()) {
  const auto = window.matchMedia('(pointer: fine) and (min-width: 900px)').matches;
  if (auto) {
    // Carrega ao primeiro sinal de que há alguém do outro lado (rato, scroll, teclado):
    // a página abre logo e o 3D chega antes de se chegar ao caixote
    const events = ['pointermove', 'pointerdown', 'scroll', 'keydown', 'wheel'];
    const go = () => {
      events.forEach((e) => window.removeEventListener(e, go));
      startDeck();
    };
    events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
  } else {
    deckEl.classList.add('is-manual');
    $('[data-deck-start]').addEventListener('click', () => {
      player.prepare();
      startDeck();
    });
  }
}
