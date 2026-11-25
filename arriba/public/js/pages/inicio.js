import { api } from '../api.js';
import { announce, day, esc, euros, nights } from '../utils.js';

const { a: inicial, types } = JSON.parse(document.getElementById('initial-data').textContent);
let a = inicial;
const palco = document.querySelector('[data-palco]');
const lista = document.querySelector('[data-ganchos]');
const form = document.querySelector('[data-datas]');
const erro = form.querySelector('[data-erro]');
let escolhida = lista.querySelector('[aria-pressed="true"]')?.dataset.num ?? null;
let quadro = null;

const typeOf = (slug) => types.find((t) => t.slug === slug);
const srcset = (p) => [480, 800, 1200].map((w) => `/img/fotos/${p}-${w}.webp ${w}w`).join(', ');
const reserveHref = (num) => `/reservar?quarto=${num}&chegada=${a.checkIn}&saida=${a.checkOut}&hospedes=${a.guests}`;

function ficha() {
  const room = a.rooms.find((r) => r.num === escolhida && r.free);
  const el = document.querySelector('[data-ficha]');
  if (!room) {
    el.className = 'ficha ficha--vazia';
    el.innerHTML = `<div class="ficha__t"><p class="ficha__n">Quadro vazio</p><h2 class="ficha__h">Não há chaves para estas datas</h2><p>Experimente chegar um dia antes ou depois.</p></div>`;
    return;
  }
  const t = typeOf(room.type);
  el.className = 'ficha';
  el.innerHTML = `<img class="ficha__f" src="/img/fotos/${t.photo}-480.webp" srcset="${srcset(t.photo)}" sizes="(max-width: 820px) 120px, 160px" width="1200" height="900" alt="">
    <div class="ficha__t">
      <p class="ficha__n">Chave ${room.num}</p>
      <h2 class="ficha__h">${esc(t.name)}</h2>
      <p>${esc(t.lead)}</p>
      <div class="ficha__pr"><p><b>${euros(room.total)}</b> <small>${nights(a.nights)}</small></p><a class="btn btn--verde" href="${reserveHref(room.num)}">Reservar o ${room.num}</a></div>
    </div>`;
}

function ganchos() {
  lista.innerHTML = a.rooms
    .map((r) =>
      r.free
        ? `<li><button type="button" class="gancho" data-num="${r.num}" aria-pressed="${r.num === escolhida}"><b>${r.num}</b><span class="sr"> ${esc(r.typeName)}, ${euros(r.total)}</span></button></li>`
        : `<li><span class="gancho gancho--fora"><b>${r.num}</b><span class="sr"> ocupado</span></span></li>`,
    )
    .join('');
}

function escolher(num, { de3d = false } = {}) {
  if (!a.free.includes(num)) return;
  escolhida = num;
  lista.querySelectorAll('[data-num]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.num === num)));
  ficha();
  if (!de3d) quadro?.escolher(num);
  const room = a.rooms.find((r) => r.num === num);
  announce(`Chave ${num}, ${room.typeName}, ${euros(room.total)} por ${nights(a.nights)}`);
}

lista.addEventListener('click', (e) => {
  const b = e.target.closest('[data-num]');
  if (b) escolher(b.dataset.num);
});

// Datas novas sem recarregar: o quadro tira e repõe as chaves
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  erro.hidden = true;
  const dados = new FormData(form);
  const params = new URLSearchParams({ chegada: dados.get('chegada'), saida: dados.get('saida'), hospedes: dados.get('hospedes') });
  const botao = form.querySelector('[type=submit]');
  botao.disabled = true;
  try {
    a = await api(`/disponibilidade?${params}`);
    if (!a.free.includes(escolhida)) escolhida = a.free.includes('03') ? '03' : (a.free[0] ?? null);
    ganchos();
    ficha();
    document.querySelector('[data-conta] span').innerHTML = `<b>${a.free.length}</b> ${a.free.length === 1 ? 'chave' : 'chaves'} no quadro de ${day(a.checkIn)} a ${day(a.checkOut)} (${nights(a.nights)})`;
    quadro?.atualizar(a.free, escolhida);
    history.replaceState(null, '', `/?${params}`);
    announce(`${a.free.length} quartos livres de ${day(a.checkIn)} a ${day(a.checkOut)}`);
  } catch (err) {
    erro.textContent = err.details?.length ? err.details.map((d) => d.message).join('. ') : err.message;
    erro.hidden = false;
  } finally {
    botao.disabled = false;
  }
});

// A saída acompanha a chegada
form.chegada.addEventListener('change', () => {
  const minimo = new Date(`${form.chegada.value}T12:00:00Z`);
  minimo.setUTCDate(minimo.getUTCDate() + 1);
  const iso = minimo.toISOString().slice(0, 10);
  form.saida.min = iso;
  if (form.saida.value < iso) form.saida.value = iso;
});

// O quadro 3D chega depois do resto: sozinho em computadores, com um toque em telemóveis
function webgl() {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

let aCarregar = null;
function ligar() {
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
  const grande = matchMedia('(min-width: 821px) and (pointer: fine)').matches;
  if (grande) {
    // Com rato, o quadro liga-se ao primeiro movimento: a página fica pronta primeiro e o 3D vem logo a seguir
    const eventos = ['pointermove', 'pointerdown', 'scroll', 'keydown', 'wheel'];
    const uma = () => {
      eventos.forEach((ev) => removeEventListener(ev, uma));
      ligar();
    };
    eventos.forEach((ev) => addEventListener(ev, uma, { once: true, passive: true }));
  } else {
    const botao = palco.querySelector('[data-ligar]');
    botao.hidden = false;
    botao.addEventListener('click', () => {
      botao.disabled = true;
      botao.textContent = 'A pendurar as chaves…';
      ligar();
    });
  }
}
