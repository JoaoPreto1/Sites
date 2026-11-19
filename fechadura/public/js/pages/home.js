// O código do cadeado: número da porta (196) e o número de salas no quadro
const CODE = `196${document.querySelectorAll('.case').length}`;
const lock = document.querySelector('[data-lock]');
const dials = [...document.querySelectorAll('[data-dial]')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Cada fita tem 50 algarismos (0–9 cinco vezes). Começa a meio e volta ao meio
// sem animação quando se afasta muito, para poder rodar para sempre.
const MID = 20;
const state = dials.map(() => ({ pos: MID, touched: false }));
const value = (i) => ((state[i].pos % 10) + 10) % 10;

function render(i, animate = true) {
  const strip = dials[i].querySelector('.dial__strip');
  strip.classList.toggle('no-anim', !animate);
  strip.style.setProperty('--pos', state[i].pos);
  dials[i].querySelector('output').textContent = value(i);
}

function recenter(i) {
  const { pos } = state[i];
  if (pos > 10 && pos < 40) return;
  state[i].pos = MID + value(i);
  render(i, false);
}

dials.forEach((dial, i) => {
  dial.querySelector('.dial__strip').addEventListener('transitionend', () => recenter(i));
  render(i, false);
});

let wrongTimer;

function step(i, delta) {
  if (lock.classList.contains('is-open')) return;
  state[i].pos += delta;
  state[i].touched = true;
  render(i, !reduceMotion);
  if (reduceMotion) recenter(i);
  check();
}

function check() {
  clearTimeout(wrongTimer);
  const code = state.map((_, i) => value(i)).join('');
  if (code === CODE) return open();
  // Se já mexeram nas quatro rodas e pararam, o cadeado abana e as pistas dão sinal
  if (state.every((s) => s.touched)) {
    wrongTimer = setTimeout(() => {
      lock.classList.remove('is-wrong');
      void lock.offsetWidth;
      lock.classList.add('is-wrong');
      lock.querySelector('[data-lock-hint]').textContent = 'Ainda não. Leiam outra vez as pistas.';
      nudgeNotes();
    }, 1400);
  }
}

function open() {
  lock.classList.remove('is-wrong');
  lock.classList.add('is-open');
  lock.querySelector('[data-lock-title]').textContent = 'Aberto';
  lock.querySelector('[data-lock-hint]').textContent = 'Bem-vindos. A porta está aberta: as salas estão aqui em baixo.';
  dials.forEach((d) => d.querySelectorAll('button').forEach((b) => (b.disabled = true)));
  setTimeout(() => document.getElementById('salas').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }), 1600);
}

function nudgeNotes() {
  document.querySelectorAll('.note').forEach((note, k) => {
    note.classList.remove('is-nudged');
    void note.offsetWidth;
    setTimeout(() => note.classList.add('is-nudged'), k * 150);
  });
}

dials.forEach((dial, i) => {
  dial.addEventListener('click', (event) => {
    const button = event.target.closest('[data-step]');
    if (button) step(i, Number(button.dataset.step));
  });

  dial.addEventListener('keydown', (event) => {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    step(i, event.key === 'ArrowUp' ? 1 : -1);
  });

  const drum = dial.querySelector('.dial__drum');

  // Roda do rato e arrastar com o dedo, como num cadeado de verdade
  drum.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      step(i, event.deltaY < 0 ? 1 : -1);
    },
    { passive: false },
  );

  let startY = null;
  drum.addEventListener('pointerdown', (event) => {
    startY = event.clientY;
    drum.setPointerCapture(event.pointerId);
  });
  drum.addEventListener('pointermove', (event) => {
    if (startY === null) return;
    const size = drum.clientHeight / 3;
    const moved = Math.trunc((startY - event.clientY) / (size * 0.7));
    if (moved) {
      step(i, moved);
      startY = event.clientY;
    }
  });
  drum.addEventListener('pointerup', () => (startY = null));
  drum.addEventListener('pointercancel', () => (startY = null));
});

// Ao fim de uns segundos sem ninguém mexer, as pistas dão sinal
setTimeout(() => {
  if (!state.some((s) => s.touched)) nudgeNotes();
}, 7000);

// Lanterna: a luz segue o rato dentro da entrada
const gate = document.querySelector('[data-gate]');
if (gate && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  let frame = 0;
  gate.addEventListener('pointermove', (event) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const box = gate.getBoundingClientRect();
      gate.style.setProperty('--mx', `${event.clientX - box.left}px`);
      gate.style.setProperty('--my', `${event.clientY - box.top}px`);
    });
  });
}

// Relógio de 60 minutos a contar desde que a página abriu
const clock = document.querySelector('[data-clock]');
const start = Date.now();
setInterval(() => {
  const left = Math.max(0, 3600 - Math.floor((Date.now() - start) / 1000));
  clock.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
}, 1000);

// Fio vermelho entre os alfinetes dos casos
const board = document.querySelector('.board__cork');
const svg = document.querySelector('[data-strings]');
const PAIRS = [
  [0, 1],
  [1, 3],
  [0, 2],
  [2, 3],
  [1, 2],
];

function drawStrings() {
  const box = board.getBoundingClientRect();
  const pins = [...board.querySelectorAll('[data-pin]')].map((pin) => {
    const r = pin.getBoundingClientRect();
    return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top];
  });
  svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
  // O fio fica um pouco descaído, como um fio de verdade preso a dois alfinetes
  svg.innerHTML = PAIRS.filter(([a, b]) => pins[a] && pins[b])
    .map(([a, b]) => {
      const [x1, y1] = pins[a];
      const [x2, y2] = pins[b];
      const sag = Math.hypot(x2 - x1, y2 - y1) * 0.06;
      return `<path d="M${x1} ${y1} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag} ${x2} ${y2}"/>`;
    })
    .join('');
}

if (board && svg) {
  new ResizeObserver(drawStrings).observe(board);
}
