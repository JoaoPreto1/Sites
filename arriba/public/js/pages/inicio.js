import { api } from '../api.js';
import { announce, esc, euros } from '../utils.js';

let { a } = JSON.parse(document.getElementById('initial-data').textContent);
const barra = document.querySelector('[data-barra]');
const sec = document.querySelector('[data-rececao]');
const lista = sec.querySelector('[data-chaves]');
const palco = sec.querySelector('[data-palco]');
let escolhida = lista.querySelector('[aria-pressed="true"]')?.dataset.num ?? a.free[0] ?? null;
let quadro = null;

const noites = (n) => `${n} ${n === 1 ? 'noite' : 'noites'}`;

function ficha() {
  const room = a.rooms.find((r) => r.num === escolhida && r.free);
  const el = sec.querySelector('[data-ficha]');
  el.innerHTML = room
    ? `<p class="rec__k"><span>Chave ${room.num}</span><b>${esc(room.typeName)}</b></p><p class="rec__pr"><span>${euros(room.total)} por ${noites(a.nights)}</span><a class="lk lk--claro" href="/reservar?quarto=${room.num}&chegada=${a.checkIn}&saida=${a.checkOut}&hospedes=${a.guests}">Reservar a chave ${room.num}</a></p>`
    : '<p class="rec__vazio">Não há chaves no quadro para estas datas. Experimente outras.</p>';
  sec.querySelector('[data-nota]').textContent = room ? `Chave ${room.num} · ${room.typeName}` : 'Quadro da receção';
}

function chaves() {
  lista.innerHTML = a.rooms
    .map((r) =>
      r.free
        ? `<li><button type="button" data-num="${r.num}" aria-pressed="${r.num === escolhida}"><b>${r.num}</b><span class="sr"> ${esc(r.typeName)}, livre</span></button></li>`
        : `<li class="fora"><span><b>${r.num}</b><span class="sr"> ocupado</span></span></li>`,
    )
    .join('');
}

function escolher(num, { de3d = false } = {}) {
  if (!a.free.includes(num)) return;
  escolhida = num;
  lista.querySelectorAll('[data-num]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.num === num)));
  ficha();
  if (!de3d) quadro?.escolher(num);
  ligar();
}

lista.addEventListener('click', (e) => {
  const b = e.target.closest('[data-num]');
  if (b) escolher(b.dataset.num);
});

// Mudar as datas na barra: o número de chaves, a lista e o quadro acompanham sem recarregar
let pedido = 0;
barra.addEventListener('change', async (e) => {
  if (e.target.name === 'chegada') {
    const d = new Date(`${barra.chegada.value}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    const min = d.toISOString().slice(0, 10);
    barra.saida.min = min;
    if (barra.saida.value < min) barra.saida.value = min;
  }
  const params = new URLSearchParams({ chegada: barra.chegada.value, saida: barra.saida.value, hospedes: barra.hospedes.value });
  const este = ++pedido;
  try {
    const novo = await api(`/disponibilidade?${params}`);
    if (este !== pedido) return;
    a = novo;
    if (!a.free.includes(escolhida)) escolhida = a.free.includes('03') ? '03' : (a.free[0] ?? null);
    barra.querySelector('[data-livres]').textContent = `${a.free.length} de 14`;
    chaves();
    ficha();
    quadro?.atualizar(a.free, escolhida);
    announce(`${a.free.length} quartos livres nessas datas`);
  } catch (err) {
    barra.querySelector('[data-livres]').textContent = 'datas inválidas';
    announce(err.message);
  }
});

// O quadro 3D: com rato, liga-se quando a secção se aproxima; no telemóvel, com um toque
function webgl() {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

let aCarregar = null;
function ligar() {
  if (!webgl()) return null;
  aCarregar ??= import('../quadro/chaves3d.js')
    .then(({ quadroDeChaves }) => {
      quadro = quadroDeChaves(palco.querySelector('[data-canvas]'), {
        quartos: a.rooms.map((r) => ({ num: r.num })),
        livres: a.free,
        escolhido: escolhida,
        aoEscolher: (q) => escolher(q.num, { de3d: true }),
      });
      return quadro.pronto;
    })
    .then(() => {
      palco.classList.add('is-3d');
      palco.querySelector('[data-ligar]').hidden = true;
    })
    .catch(() => {
      palco.querySelector('[data-ligar]').hidden = true;
    });
  return aCarregar;
}

if (webgl()) {
  if (matchMedia('(pointer: fine)').matches) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      ligar();
    }, { rootMargin: '300px 0px' });
    io.observe(palco);
  } else {
    const b = palco.querySelector('[data-ligar]');
    b.hidden = false;
    b.addEventListener('click', () => {
      b.textContent = 'A pendurar as chaves…';
      b.disabled = true;
      ligar();
    });
  }
}
