import { api } from '../api.js';
import { clearErrors, showErrors } from '../forms.js';
import { currentUser, loginUrl } from '../session.js';
import { announce, esc, euros } from '../utils.js';

const dados = JSON.parse(document.getElementById('initial-data').textContent);
let { a, chosen } = dados;
const { types } = dados;
const $ = (s) => document.querySelector(s);
const form = $('[data-datas]');
const cal = $('[data-cal]');
const lista = $('[data-lista]');
const erro = $('[data-erro]');
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const longo = (iso) => {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${DIAS[d.getUTCDay()].replace(/^./, (c) => c.toUpperCase())}, ${d.getUTCDate()} de ${MESES[d.getUTCMonth()].toLowerCase()}`;
};
const noites = (n) => `${n} ${n === 1 ? 'noite' : 'noites'}`;
let chegadaSo = null; // primeiro toque no calendário: chegada escolhida, à espera da saída

// ---------- calendário ----------
function marcar() {
  const de = chegadaSo ?? a.checkIn;
  const ate = chegadaSo ? null : a.checkOut;
  cal.querySelectorAll('[data-dia]').forEach((b) => {
    const d = b.dataset.dia;
    b.classList.toggle('a', d === de);
    b.classList.toggle('b', d === ate);
    b.classList.toggle('r', Boolean(ate) && d > de && d < ate);
    b.setAttribute('aria-pressed', String(d === de || d === ate));
  });
}

async function mesesDe(inicio) {
  const { nights } = await api(`/calendario?desde=${inicio.slice(0, 7)}-01&dias=62&hospedes=${form.hospedes.value}`);
  const porMes = new Map();
  for (const n of nights) {
    const k = n.day.slice(0, 7);
    if (!porMes.has(k)) porMes.set(k, []);
    porMes.get(k).push(n);
  }
  cal.innerHTML = [...porMes.entries()]
    .slice(0, 2)
    .map(([k, l]) => {
      const lead = (new Date(`${l[0].day}T12:00:00Z`).getUTCDay() + 6) % 7;
      return `<div class="mes"><h3>${MESES[Number(k.slice(5)) - 1]} <span>${k.slice(0, 4)}</span></h3><div class="mes__sem" aria-hidden="true"><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span><span>D</span></div><div class="mes__dias">${'<span class="v"></span>'.repeat(lead)}${l
        .map((n) => `<button type="button" class="dia${n.free ? '' : ' x'}" data-dia="${n.day}"${n.free ? '' : ' aria-disabled="true"'}><b>${Number(n.day.slice(8))}</b><small>${n.free ? n.from : 'cheio'}</small><span class="sr"> ${longo(n.day)}</span></button>`)
        .join('')}</div></div>`;
    })
    .join('');
  marcar();
}

const visivel = (iso) => Boolean(cal.querySelector(`[data-dia="${iso}"]`));

cal.addEventListener('click', (e) => {
  const b = e.target.closest('[data-dia]');
  if (!b) return;
  const d = b.dataset.dia;
  if (!chegadaSo || d <= chegadaSo) {
    if (b.getAttribute('aria-disabled') === 'true') return;
    chegadaSo = d;
    marcar();
    announce(`Chegada ${longo(d)}. Escolha agora a noite de saída.`);
    return;
  }
  form.chegada.value = chegadaSo;
  form.saida.value = d;
  chegadaSo = null;
  carregar();
});

// ---------- lista de chaves e resumo ----------
const srcset = (p) => [480, 800, 1200].map((w) => `/img/fotos/${p}-${w}.webp ${w}w`).join(', ');
function desenharLista() {
  const livres = a.rooms.filter((r) => r.free);
  if (!livres.some((r) => r.num === chosen)) chosen = livres.find((r) => r.num === '03')?.num ?? livres[0]?.num ?? null;
  lista.innerHTML = livres.length
    ? types
        .map((t) => {
          const l = livres.filter((r) => r.type === t.slug);
          if (!l.length) return '';
          const at = a.types.find((x) => x.slug === t.slug);
          return `<div class="op${l.some((r) => r.num === chosen) ? ' on' : ''}"><div class="op__im foto-r"><img src="/img/fotos/${t.photo}-480.webp" srcset="${srcset(t.photo)}" sizes="(max-width: 760px) 30vw, 220px" width="1200" height="900" alt="" loading="lazy" decoding="async"></div><div class="op__tx"><h3>${esc(t.name)}</h3><p>${t.size} m² · ${esc(t.bed.toLowerCase())} · ${esc(t.view.toLowerCase())} · até ${t.guests} pessoas</p><div class="op__ks" role="radiogroup" aria-label="Chaves ${esc(t.name)}">${l
            .map((r) => `<label class="kr"><input type="radio" name="room" value="${r.num}" data-tipo="${esc(t.name)}" data-total="${r.total}"${r.num === chosen ? ' checked' : ''}><span>${r.num}</span></label>`)
            .join('')}</div></div><p class="op__pr"><b>${euros(at.total)}</b><small>${euros(at.price)} / noite</small></p></div>`;
        })
        .join('')
    : '<p class="vazio">Nenhuma chave no quadro para estas datas. Escolha outras noites no calendário.</p>';
  $('[data-noites]').textContent = `preço por ${noites(a.nights)}`;
  $('[data-lead]').textContent = `${a.free.length} ${a.free.length === 1 ? 'chave está' : 'chaves estão'} no quadro para estas datas. Sem pagamento agora: paga-se à saída.`;
  resumo();
}

function resumo() {
  const r = a.rooms.find((x) => x.num === chosen);
  $('[data-r-nome]').textContent = r ? r.typeName : 'Sem chave';
  $('[data-r-legenda]').textContent = r ? `CHAVE ${r.num} · FORA DO QUADRO` : 'QUADRO DA RECEÇÃO';
  $('[data-r-chegada]').textContent = `${longo(a.checkIn)} · a partir das 15h`;
  $('[data-r-saida]').textContent = `${longo(a.checkOut)} · até às 12h`;
  $('[data-r-hospedes]').textContent = `${a.guests} ${a.guests === 1 ? 'adulto' : 'adultos'}`;
  $('[data-r-total]').textContent = r ? euros(r.total) : '—';
  $('[data-continuar]').disabled = !r;
  $('[data-continuar2]').disabled = !r;
  $('[data-r-total2]').textContent = r ? euros(r.total) : '—';
  lista.querySelectorAll('.op').forEach((op) => op.classList.toggle('on', Boolean(op.querySelector('input:checked'))));
}

lista.addEventListener('change', (e) => {
  if (e.target.name !== 'room') return;
  chosen = e.target.value;
  resumo();
  announce(`Chave ${chosen}, ${e.target.dataset.tipo}, ${euros(e.target.dataset.total)}`);
});

let pedido = 0;
async function carregar() {
  erro.hidden = true;
  const params = new URLSearchParams({ chegada: form.chegada.value, saida: form.saida.value, hospedes: form.hospedes.value });
  const este = ++pedido;
  try {
    const novo = await api(`/disponibilidade?${params}`);
    if (este !== pedido) return;
    a = novo;
    if (!visivel(a.checkIn) || !visivel(a.checkOut)) await mesesDe(a.checkIn);
    marcar();
    desenharLista();
    history.replaceState(null, '', `/reservar?${params}${chosen ? `&quarto=${chosen}` : ''}`);
    announce(`${a.free.length} chaves no quadro de ${longo(a.checkIn)} a ${longo(a.checkOut)}`);
  } catch (err) {
    erro.textContent = err.details?.length ? err.details.map((d) => d.message).join('. ') : err.message;
    erro.hidden = false;
  }
}

form.addEventListener('change', async (e) => {
  if (e.target.name === 'hospedes') await mesesDe(form.chegada.value);
  if (e.target.name === 'chegada' && form.saida.value <= form.chegada.value) {
    const d = new Date(`${form.chegada.value}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    form.saida.value = d.toISOString().slice(0, 10);
  }
  chegadaSo = null;
  carregar();
});
form.addEventListener('submit', (e) => {
  e.preventDefault();
  carregar();
});

// ---------- passos: chave → os seus dados ----------
const etapaChave = $('[data-etapa="chave"]');
const etapaDados = $('[data-etapa="dados"]');
function passo(n) {
  etapaChave.hidden = n !== 2;
  etapaDados.hidden = n !== 3;
  document.querySelectorAll('[data-passo]').forEach((li) => {
    const k = Number(li.dataset.passo);
    li.className = k < n ? 'ok' : k === n ? 'on' : '';
    if (k === n) li.setAttribute('aria-current', 'step');
    else li.removeAttribute('aria-current');
  });
  $('[data-continuar]').hidden = n === 3;
  $('[data-fixo]').hidden = n === 3;
  scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  (n === 3 ? etapaDados : etapaChave).querySelector('h1').focus({ preventScroll: true });
}
document.querySelectorAll('[data-etapa] h1').forEach((h) => (h.tabIndex = -1));

const aqui = () => `/reservar?chegada=${a.checkIn}&saida=${a.checkOut}&hospedes=${a.guests}&quarto=${chosen}&passo=dados`;
function prepararDados() {
  const user = currentUser();
  const sessao = $('[data-sessao]');
  const conf = $('[data-confirmar-form]');
  if (user?.role === 'hospede') {
    sessao.innerHTML = `<p class="res-pg__lead">Vai reservar como <strong>${esc(user.name)}</strong>. Depois pode mudar a hora de chegada, fazer pedidos e cancelar na sua área.</p>`;
    conf.hidden = false;
  } else if (user?.role === 'rececao') {
    sessao.innerHTML = '<p class="res-pg__lead">Está com a conta da receção. As reservas são feitas pelos hóspedes, com a conta deles.</p>';
  } else {
    sessao.querySelector('[data-entrar]').href = loginUrl(aqui());
    sessao.querySelector('[data-criar]').href = `/criar-conta?next=${encodeURIComponent(aqui())}`;
  }
}

const continuar = () => {
  if (!chosen) return;
  prepararDados();
  passo(3);
};
$('[data-continuar]').addEventListener('click', continuar);
$('[data-continuar2]').addEventListener('click', continuar);
$('[data-voltar]').addEventListener('click', () => passo(2));

$('[data-confirmar-form]').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const box = f.querySelector('[data-erro2]');
  clearErrors(f, box);
  const b = f.querySelector('[type=submit]');
  b.disabled = true;
  try {
    const { reservation } = await api('/hospede/reservas', {
      method: 'POST',
      auth: true,
      body: { room: chosen, checkIn: a.checkIn, checkOut: a.checkOut, guests: a.guests, arrivalTime: f.arrivalTime.value, notes: f.notes.value },
    });
    location.href = `/hospede#${reservation.code}`;
  } catch (err) {
    if (err.status === 401) {
      location.href = loginUrl(aqui());
      return;
    }
    showErrors(f, box, err);
    b.disabled = false;
  }
});

marcar();
if (new URLSearchParams(location.search).get('passo') === 'dados' && chosen) {
  prepararDados();
  passo(3);
}
