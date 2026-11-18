// O código do cadeado: número da porta (196) e o número de salas no quadro
const CODE = `196${document.querySelectorAll('.case').length}`;
const lock = document.querySelector('[data-lock]');
const dials = [...document.querySelectorAll('[data-dial]')];
const values = dials.map(() => 0);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function render(i) {
  const v = values[i];
  const dial = dials[i];
  dial.querySelector('.dial__prev').textContent = (v + 9) % 10;
  dial.querySelector('.dial__cur').textContent = v;
  dial.querySelector('.dial__next').textContent = (v + 1) % 10;
  dial.querySelector('output').textContent = v;
}

function check() {
  if (values.join('') !== CODE || lock.classList.contains('is-open')) return;
  lock.classList.add('is-open');
  lock.querySelector('[data-lock-title]').textContent = 'Aberto';
  lock.querySelector('[data-lock-hint]').textContent = 'Bem-vindos. A porta está aberta: as salas estão aqui em baixo.';
  dials.forEach((d) => d.querySelectorAll('button').forEach((b) => (b.disabled = true)));
  setTimeout(() => document.getElementById('salas').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }), 1400);
}

dials.forEach((dial, i) => {
  dial.addEventListener('click', (event) => {
    const step = Number(event.target.closest('[data-step]')?.dataset.step);
    if (!step) return;
    values[i] = (values[i] + step + 10) % 10;
    render(i);
    check();
  });
  dial.addEventListener('keydown', (event) => {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    values[i] = (values[i] + (event.key === 'ArrowUp' ? 1 : -1) + 10) % 10;
    render(i);
    check();
  });
  // Rodar com a roda do rato, como num cadeado de verdade
  dial.querySelector('.dial__drum').addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      values[i] = (values[i] + (event.deltaY < 0 ? 1 : -1) + 10) % 10;
      render(i);
      check();
    },
    { passive: false },
  );
});

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
  svg.innerHTML = PAIRS.filter(([a, b]) => pins[a] && pins[b])
    .map(([a, b]) => `<line x1="${pins[a][0]}" y1="${pins[a][1]}" x2="${pins[b][0]}" y2="${pins[b][1]}"/>`)
    .join('');
}

if (board && svg) {
  new ResizeObserver(drawStrings).observe(board);
}
