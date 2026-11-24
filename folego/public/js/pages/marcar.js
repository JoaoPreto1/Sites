import { AULAS, PROFESSORAS, proximas, retiros, diaCurto, dataLonga, dataCurta } from '../dados.js';

const form = document.getElementById('form');
const select = document.getElementById('aula');
const params = new URLSearchParams(location.search);
const hora = (h) => h.replace(/^0/, '');

// as aulas dos próximos sete dias (e os retiros, se se vier dessa página)
const aulas = proximas(7);
const lista = retiros();
const retiro = lista.find((r) => r.id === params.get('retiro'));
if (retiro) {
  document.getElementById('titulo').textContent = 'Reservar o retiro.';
  select.innerHTML = lista.map((r) => `<option value="retiro:${r.id}" ${r === retiro ? 'selected' : ''}>Retiro ${r.nome} · ${dataCurta(r.inicio)} a ${dataCurta(r.fim)}</option>`).join('');
} else {
  select.innerHTML = '<option value="">Escolhe no horário…</option>' + aulas.map((a) =>
    `<option value="${a.id}">${AULAS[a.aula].nome} · ${diaCurto(a.quando)}, ${dataCurta(a.quando)} às ${hora(a.hora)} · ${PROFESSORAS[a.prof].nome}${a.livres ? '' : ' (lista de espera)'}</option>`).join('');
  const pedida = params.get('aula');
  if (pedida && aulas.some((a) => a.id === pedida)) select.value = pedida;
  else if (!pedida) {
    const primeira = aulas.find((a) => a.nivel === 'iniciação' && a.livres);
    if (primeira) select.value = primeira.id;
  }
}

const REGRAS = {
  aula: (v) => (v ? '' : 'Escolhe uma aula.'),
  nome: (v) => (v.trim().length >= 2 ? '' : 'Escreve o teu nome.'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Este email não parece certo.'),
  aceito: (_, el) => (el.checked ? '' : 'Precisamos da tua autorização para guardar o pedido.'),
};

function validar(nome) {
  const el = form.elements[nome];
  const msg = REGRAS[nome](el.value, el);
  document.getElementById(`e-${nome}`).textContent = msg;
  el.setAttribute('aria-invalid', String(Boolean(msg)));
  return !msg;
}
Object.keys(REGRAS).forEach((n) => form.elements[n].addEventListener('blur', () => form.elements[n].getAttribute('aria-invalid') && validar(n)));

const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const ok = Object.keys(REGRAS).map(validar).every(Boolean);
  if (!ok) { form.querySelector('[aria-invalid="true"]')?.focus(); return; }
  const dados = Object.fromEntries(new FormData(form));
  const pedido = { ...dados, nome: dados.nome.trim(), email: dados.email.trim(), feito: new Date().toISOString() };
  try {
    const guardados = JSON.parse(localStorage.getItem('folego.pedidos') || '[]');
    guardados.push(pedido);
    localStorage.setItem('folego.pedidos', JSON.stringify(guardados.slice(-10)));
  } catch {}
  const escolha = select.options[select.selectedIndex].textContent;
  const caixa = document.getElementById('caixa');
  caixa.innerHTML = `<div class="confirmado vidro" tabindex="-1" id="ok">
    <span class="etiqueta">Pedido guardado neste browser</span>
    <h2>Até já, ${esc(pedido.nome.split(' ')[0])}.</h2>
    <dl><dt>Aula</dt><dd>${esc(escolha)}</dd><dt>Email</dt><dd>${esc(pedido.email)}</dd><dt>Já fez yoga</dt><dd>${{ nunca: 'Nunca', pouco: 'Um pouco', muito: 'Há anos' }[pedido.nivel]}</dd></dl>
    <p class="nota">Como esta versão é só a parte visual, ninguém recebeu o pedido nem vai ser enviado nenhum email. Na versão completa o estúdio confirma a marcação.</p>
    <p><a class="btn btn--vidro" href="/respirar">Enquanto esperas, respira</a></p>
  </div>`;
  document.getElementById('ok').focus();
});
