import { api } from '../api.js';
import { announce, euros } from '../utils.js';

const cart = document.querySelector('[data-cart]');
const form = cart.querySelector('[data-barra]');
const tipo = cart.dataset.tipo;
const cal = document.querySelector('[data-cal-quarto]');
const somar = (iso, n) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const noites = (n) => `${n} ${n === 1 ? 'noite' : 'noites'}`;

function marcar() {
  const [de, ate] = [form.chegada.value, form.saida.value];
  cal.querySelectorAll('[data-dia]').forEach((b) => {
    const d = b.dataset.dia;
    b.classList.toggle('a', d === de);
    b.classList.toggle('b', d === ate);
    b.classList.toggle('r', d > de && d < ate);
  });
}

// O cartão acompanha as datas: total, chaves livres e o botão de reservar
async function atualizar() {
  const params = new URLSearchParams({ chegada: form.chegada.value, saida: form.saida.value, hospedes: form.hospedes.value });
  marcar();
  try {
    const a = await api(`/disponibilidade?${params}`);
    const t = a.types.find((x) => x.slug === tipo);
    cart.querySelector('[data-cart-noites]').textContent = noites(a.nights);
    cart.querySelector('[data-cart-total]').textContent = euros(t.total);
    const ir = cart.querySelector('[data-cart-ir]');
    ir.href = `/reservar?tipo=${tipo}&${params}`;
    ir.textContent = t.free.length ? `Reservar a chave ${t.free[0]}` : 'Ver outras datas';
    const liv = cart.querySelector('[data-cart-liv]');
    liv.classList.toggle('cart__liv--nao', !t.free.length);
    liv.textContent = t.free.length ? `${t.free.length} ${t.free.length === 1 ? 'chave' : 'chaves'} no quadro nestas datas` : 'Nenhuma chave no quadro nestas datas';
    announce(liv.textContent);
  } catch (err) {
    cart.querySelector('[data-cart-liv]').textContent = err.details?.[0]?.message ?? err.message;
  }
}

form.addEventListener('change', (e) => {
  if (e.target.name === 'chegada' && form.saida.value <= form.chegada.value) form.saida.value = somar(form.chegada.value, 1);
  atualizar();
});
form.addEventListener('submit', (e) => {
  e.preventDefault();
  location.href = cart.querySelector('[data-cart-ir]').href;
});

// Tocar numa noite do calendário: começa a estadia aí, com o mesmo número de noites
cal.addEventListener('click', (e) => {
  const b = e.target.closest('[data-dia]');
  if (!b || b.getAttribute('aria-disabled') === 'true') return;
  const n = Math.max(1, Math.round((new Date(form.saida.value) - new Date(form.chegada.value)) / 864e5) || 2);
  form.chegada.value = b.dataset.dia;
  form.saida.value = somar(b.dataset.dia, n);
  atualizar();
  if (matchMedia('(max-width: 760px)').matches) cart.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
marcar();
