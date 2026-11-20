// A planta: passar por uma divisão mostra a fotografia desse projeto
const rooms = [...document.querySelectorAll('.room[data-room]')];
const peek = document.querySelector('[data-peek]');
const img = peek?.querySelector('img');
const caption = peek?.querySelector('[data-peek-caption]');
let current = rooms[0];
let timer;

function show(room) {
  if (!peek || room === current) return;
  current = room;
  rooms.forEach((r) => r.classList.toggle('is-on', r === room));
  clearTimeout(timer);
  peek.classList.add('is-changing');
  timer = setTimeout(() => {
    img.srcset = room.dataset.srcset;
    img.src = room.dataset.src;
    img.alt = room.dataset.alt;
    caption.textContent = room.dataset.caption;
    // A fotografia muda só quando a nova já chegou, para não piscar
    (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).finally(() => peek.classList.remove('is-changing'));
  }, 120);
}

rooms.forEach((room) => {
  room.addEventListener('pointerenter', () => show(room));
  room.addEventListener('focus', () => show(room));
});

// As fotografias das outras divisões carregam quando o rato chega perto da planta
const plan = document.querySelector('.plan');
plan?.addEventListener(
  'pointerenter',
  () => {
    rooms.forEach((room) => {
      const pre = new Image();
      pre.srcset = room.dataset.srcset;
      pre.sizes = '300px';
    });
  },
  { once: true },
);
