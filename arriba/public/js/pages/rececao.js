import { api } from '../api.js';
import { logout, requireRole } from '../session.js';
import { badge, day, esc, euros, nights, REQUESTS, toast } from '../utils.js';

document.querySelector('[data-sair]').addEventListener('click', logout);
const $ = (s) => document.querySelector(s);
const NEXT = { confirmada: [['em-casa', 'Dar entrada'], ['cancelada', 'Cancelar']], 'em-casa': [['terminada', 'Fechar conta']] };
let filtro = '';

// ---------- abas (com setas do teclado) ----------
const abas = [...document.querySelectorAll('[role=tab]')];
function abrir(tab, focar = false) {
  for (const t of abas) {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  }
  if (focar) tab.focus();
  RENDER[tab.id]();
}
abas.forEach((t, i) => {
  t.addEventListener('click', () => abrir(t));
  t.addEventListener('keydown', (e) => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (d) abrir(abas[(i + d + abas.length) % abas.length], true);
  });
});

const acoes = (r) => (NEXT[r.status] ?? []).map(([s, label]) => `<button class="bt ${s === 'cancelada' ? 'bt--linha bt--sem' : 'bt--sem'}" type="button" data-estado="${s}" data-id="${esc(r.id)}">${label}</button>`).join('');
const linhaHospede = (r, extra = '') => `<li><span><b>${esc(r.room)}</b> · ${esc(r.guestName)}<small>${esc(r.typeName)} · ${day(r.checkIn)} a ${day(r.checkOut)}${extra}</small></span><span class="acoes-linha">${acoes(r)}</span></li>`;

// ---------- hoje ----------
async function hoje() {
  const d = await api('/rececao/hoje', { auth: true });
  $('[data-dia]').textContent = `Hoje, ${day(d.day)}`;
  const livres = d.board.filter((b) => b.state === 'livre').length;
  $('#p-hoje').innerHTML = `<div class="painel-g">
    <div>
      <section class="bloco" aria-labelledby="h-q"><h2 id="h-q">O quadro esta noite <small>${livres} de 14 chaves</small></h2>
        <ul class="mini-quadro">${d.board.map((b) => `<li class="${b.state}" title="${esc(b.guest ?? 'Livre')}"><b>${b.num}</b><span>${b.state === 'livre' ? 'livre' : esc(b.guest.split(' ')[0])}</span><span class="sr">${b.state === 'livre' ? '' : b.state === 'em-casa' ? ', em casa' : ', chega hoje'}</span></li>`).join('')}</ul>
        <p class="legenda"><span>Latão: chave no quadro</span><span>Tracejado: reservado, ainda não chegou</span><span>Vazio: hóspede em casa</span></p>
      </section>
      <section class="bloco" aria-labelledby="h-p"><h2 id="h-p">Pedidos por tratar <small>${d.requests.length}</small></h2>
        ${d.requests.length ? `<ul class="lista-simples">${d.requests.map((q) => `<li><span><b>${esc(q.room)}</b> · ${esc(REQUESTS[q.kind] ?? q.kind)}<small>${day(q.date)} · ${esc(q.guestName)}${q.notes ? ` · ${esc(q.notes)}` : ''}</small></span><button class="bt bt--linha bt--sem" type="button" data-pedido="${esc(q.id)}" data-para="feito">Feito</button></li>`).join('')}</ul>` : '<p class="vazio">Nada por tratar.</p>'}
      </section>
    </div>
    <div>
      <section class="bloco" aria-labelledby="h-c"><h2 id="h-c">Chegadas <small>${d.arrivals.length}</small></h2>
        ${d.arrivals.length ? `<ul class="lista-simples">${d.arrivals.map((r) => linhaHospede(r, ` · chega às ${esc(r.arrivalTime || '?')}${r.notes ? ` · ${esc(r.notes)}` : ''}`)).join('')}</ul>` : '<p class="vazio">Ninguém chega hoje.</p>'}
      </section>
      <section class="bloco" aria-labelledby="h-s"><h2 id="h-s">Saídas <small>${d.departures.length}</small></h2>
        ${d.departures.length ? `<ul class="lista-simples">${d.departures.map((r) => linhaHospede(r, ` · ${euros(r.total)}`)).join('')}</ul>` : '<p class="vazio">Ninguém sai hoje.</p>'}
      </section>
      <section class="bloco" aria-labelledby="h-e"><h2 id="h-e">Em casa <small>${d.inHouse.length}</small></h2>
        ${d.inHouse.length ? `<ul class="lista-simples">${d.inHouse.map((r) => `<li><span><b>${esc(r.room)}</b> · ${esc(r.guestName)}<small>até ${day(r.checkOut)}</small></span></li>`).join('')}</ul>` : '<p class="vazio">A casa está vazia.</p>'}
      </section>
    </div>
  </div>`;
}

// ---------- reservas ----------
async function reservas() {
  const { reservations } = await api(`/rececao/reservas${filtro ? `?estado=${filtro}` : ''}`, { auth: true });
  const op = [['', 'Todas'], ['confirmada', 'Confirmadas'], ['em-casa', 'Em casa'], ['terminada', 'Terminadas'], ['cancelada', 'Canceladas']];
  $('#p-reservas').innerHTML = `<div class="filtro" role="group" aria-label="Filtrar por estado">${op.map(([k, l]) => `<button type="button" data-filtro="${k}" aria-pressed="${k === filtro}">${l}</button>`).join('')}</div>
  <div class="tabela-cx"><table class="tabela"><caption class="sr">Reservas</caption><thead><tr><th scope="col">Chave</th><th scope="col">Hóspede</th><th scope="col">Datas</th><th scope="col">Total</th><th scope="col">Estado</th><th scope="col"><span class="sr">Ações</span></th></tr></thead>
  <tbody>${reservations.map((r) => `<tr><td><b>${esc(r.room)}</b><small>${esc(r.typeName)}</small></td><td>${esc(r.guestName)}<small>${esc(r.code)} · ${r.guests} pess.</small></td><td>${day(r.checkIn)} a ${day(r.checkOut)}<small>${nights(r.nights)}</small></td><td>${euros(r.total)}</td><td>${badge(r.status)}</td><td><span class="acoes-linha">${acoes(r)}</span></td></tr>`).join('')}</tbody></table></div>
  ${reservations.length ? '' : '<p class="vazio">Sem reservas neste estado.</p>'}`;
}

// ---------- pedidos ----------
async function pedidos() {
  const { requests } = await api('/rececao/pedidos', { auth: true });
  $('#p-pedidos').innerHTML = `<section class="bloco"><h2>Todos os pedidos <small>${requests.length}</small></h2><ul class="lista-simples">${requests
    .map((q) => `<li><span><b>${esc(q.room)}</b> · ${esc(REQUESTS[q.kind] ?? q.kind)} ${badge(q.status)}<small>${day(q.date)} · ${esc(q.guestName)}${q.notes ? ` · ${esc(q.notes)}` : ''}</small></span><button class="bt bt--linha bt--sem" type="button" data-pedido="${esc(q.id)}" data-para="${q.status === 'feito' ? 'pendente' : 'feito'}">${q.status === 'feito' ? 'Reabrir' : 'Feito'}</button></li>`)
    .join('')}</ul></section>`;
}

// ---------- ementa e preços ----------
const pratoHtml = (p = {}, i = 0) => `<div class="prato" data-prato>
  <label class="campo"><span>Prato ${i + 1}</span><input name="name" value="${esc(p.name ?? '')}" maxlength="60" required></label>
  <label class="campo"><span>Detalhe</span><input name="detail" value="${esc(p.detail ?? '')}" maxlength="90"></label>
  <label class="campo"><span>Preço (€)</span><input name="price" type="number" min="1" max="200" value="${p.price ?? ''}" required></label>
</div>`;

async function ementa() {
  const [{ menu }, { prices }] = await Promise.all([api('/rececao/ementa', { auth: true }), api('/rececao/precos', { auth: true })]);
  $('#p-ementa').innerHTML = `<div class="painel-g">
    <form class="bloco" data-ementa novalidate><h2>Ementa de hoje <small>aparece no site</small></h2>
      <p class="form-erro" data-erro role="alert" hidden></p>
      <div data-pratos>${(menu?.items ?? [{}]).map(pratoHtml).join('')}</div>
      <p class="sessao__acoes"><button class="bt bt--linha bt--sem" type="button" data-mais>Mais um prato</button><button class="bt bt--sem" type="submit">Publicar ementa</button></p>
    </form>
    <section class="bloco"><h2>Preço por noite <small>só para reservas novas</small></h2>
      <ul class="precos">${prices.map((p) => `<li><span><b>${esc(p.name)}</b><small>Chaves ${p.rooms.join(', ')}</small></span><label class="campo"><span class="sr">Preço do ${esc(p.name)} em euros</span><input type="number" min="40" max="900" value="${p.price}" data-preco="${p.slug}"></label><button class="bt bt--linha bt--sem" type="button" data-guardar-preco="${p.slug}">Guardar</button></li>`).join('')}</ul>
    </section>
  </div>`;
}

const RENDER = { 'aba-hoje': hoje, 'aba-reservas': reservas, 'aba-pedidos': pedidos, 'aba-ementa': ementa };
const atual = () => RENDER[abas.find((t) => t.getAttribute('aria-selected') === 'true').id]();

document.addEventListener('click', async (e) => {
  const b = e.target.closest('button');
  if (!b || !b.closest('.area')) return;
  try {
    if (b.dataset.estado) {
      b.disabled = true;
      await api(`/rececao/reservas/${b.dataset.id}/estado`, { method: 'PATCH', auth: true, body: { status: b.dataset.estado } });
      toast({ 'em-casa': 'Entrada registada. A chave saiu do quadro.', terminada: 'Conta fechada. A chave voltou ao quadro.', cancelada: 'Reserva cancelada.' }[b.dataset.estado]);
      await atual();
    } else if (b.dataset.pedido) {
      b.disabled = true;
      await api(`/rececao/pedidos/${b.dataset.pedido}`, { method: 'PATCH', auth: true, body: { status: b.dataset.para } });
      await atual();
    } else if ('filtro' in b.dataset) {
      filtro = b.dataset.filtro;
      await reservas();
    } else if ('mais' in b.dataset) {
      const lista = $('[data-pratos]');
      if (lista.children.length < 8) lista.insertAdjacentHTML('beforeend', pratoHtml({}, lista.children.length));
    } else if (b.dataset.guardarPreco) {
      const slug = b.dataset.guardarPreco;
      await api(`/rececao/precos/${slug}`, { method: 'PATCH', auth: true, body: { price: Number($(`[data-preco="${slug}"]`).value) } });
      toast('Preço guardado.');
    }
  } catch (err) {
    toast(err.message, { erro: true });
    b.disabled = false;
  }
});

document.addEventListener('submit', async (e) => {
  if (!e.target.matches('[data-ementa]')) return;
  e.preventDefault();
  const form = e.target;
  const box = form.querySelector('[data-erro]');
  box.hidden = true;
  const items = [...form.querySelectorAll('[data-prato]')]
    .map((p) => ({ name: p.querySelector('[name=name]').value.trim(), detail: p.querySelector('[name=detail]').value.trim(), price: Number(p.querySelector('[name=price]').value) }))
    .filter((p) => p.name);
  try {
    await api('/rececao/ementa', { method: 'PUT', auth: true, body: { items } });
    toast('Ementa publicada no site.');
  } catch (err) {
    box.textContent = err.details?.length ? `${err.message}: ${[...new Set(err.details.map((d) => d.message))].join('; ')}.` : err.message;
    box.hidden = false;
  }
});

if (await requireRole('rececao')) hoje().catch((err) => toast(err.message, { erro: true }));
