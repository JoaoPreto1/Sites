import { api } from '../api.js';
import { clearErrors, showErrors } from '../forms.js';
import { logout, requireRole } from '../session.js';
import { badge, day, esc, euros, nights, REQUESTS, toast, todayIso } from '../utils.js';

const lista = document.querySelector('[data-reservas]');
const HOURS = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
const ACTIVE = ['confirmada', 'em-casa'];

document.querySelector('[data-sair]').addEventListener('click', logout);

function estadia(r) {
  const ativa = ACTIVE.includes(r.status);
  const minPedido = r.checkIn > todayIso() ? r.checkIn : todayIso();
  return `<article class="estadia${ativa ? '' : ' estadia--passada'}" id="${esc(r.code)}" aria-labelledby="t-${esc(r.id)}">
    <div class="estadia__chave"><small>Chave</small><b>${esc(r.room)}</b></div>
    <div class="estadia__t">
      <div class="estadia__topo"><h2 id="t-${esc(r.id)}">${esc(r.typeName)}</h2>${badge(r.status)}</div>
      <p class="estadia__datas">${day(r.checkIn)} a ${day(r.checkOut)} · ${nights(r.nights)}</p>
      <dl class="specs"><div><dt>Código</dt><dd>${esc(r.code)}</dd></div><div><dt>Hóspedes</dt><dd>${r.guests}</dd></div><div><dt>Chegada</dt><dd>${esc(r.arrivalTime || '—')}</dd></div><div><dt>Total</dt><dd>${euros(r.total)}</dd></div></dl>
      ${r.notes ? `<p class="estadia__nota">Nota para a receção: ${esc(r.notes)}</p>` : ''}
      ${
        r.status === 'confirmada'
          ? `<div class="estadia__acoes">${r.canCancel ? `<button class="bt bt--linha bt--sem" type="button" data-cancelar="${esc(r.id)}">Cancelar reserva</button><span class="estadia__nota">Sem custos até ${day(r.cancelUntil)}.</span>` : `<span class="estadia__nota">O cancelamento sem custos terminou a ${day(r.cancelUntil)}. Para mudar alguma coisa, escreva para a receção.</span>`}</div>`
          : ''
      }
      ${
        ativa
          ? `<div class="estadia__extra">
        <div>
          <form class="chegada" data-chegada="${esc(r.id)}" novalidate>
            <h3 class="e">A chegada</h3>
            <label class="campo"><span>Hora prevista</span><select name="arrivalTime">${HOURS.map((h) => `<option${h === r.arrivalTime ? ' selected' : ''}>${h}</option>`).join('')}</select></label>
            <label class="campo"><span>Nota para a receção</span><input name="notes" maxlength="500" value="${esc(r.notes)}"></label>
            <p class="campo__erro" data-error="notes"></p>
            <button class="bt bt--linha bt--sem" type="submit">Guardar</button>
          </form>
          <h3 class="e" style="margin-top:32px">Pedidos</h3>
          ${r.requests.length ? `<ul class="pedidos">${r.requests.map((q) => `<li><span>${esc(REQUESTS[q.kind] ?? q.kind)}<small>${day(q.date)}${q.notes ? ` · ${esc(q.notes)}` : ''}</small></span>${badge(q.status)}</li>`).join('')}</ul>` : '<p class="estadia__nota">Ainda não fez pedidos para esta estadia.</p>'}
        </div>
        <div data-pedido="${esc(r.id)}" data-min="${minPedido}" data-max="${r.checkOut}"></div>
      </div>`
          : ''
      }
    </div>
  </article>`;
}

async function carregar() {
  const { reservations } = await api('/hospede/reservas', { auth: true });
  lista.removeAttribute('aria-busy');
  if (!reservations.length) {
    lista.innerHTML = '<p class="vazio">Ainda não tem reservas. <a class="lnk" href="/reservar">Ver as chaves livres</a></p>';
    return;
  }
  lista.innerHTML = `<div class="estadias">${reservations.map(estadia).join('')}</div>`;
  // O formulário de pedido vem de um <template> para não repetir o HTML das opções
  for (const slot of lista.querySelectorAll('[data-pedido]')) {
    const node = document.getElementById('t-pedido').content.cloneNode(true);
    const date = node.querySelector('[name=date]');
    date.min = slot.dataset.min;
    date.max = slot.dataset.max;
    date.value = slot.dataset.min;
    slot.append(node);
  }
  const alvo = location.hash && document.getElementById(location.hash.slice(1));
  if (alvo) {
    alvo.scrollIntoView();
    toast('Reserva confirmada. A chave fica guardada para si.');
  }
}

lista.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  clearErrors(form);
  const botao = form.querySelector('[type=submit]');
  botao.disabled = true;
  try {
    if (form.dataset.chegada) {
      await api(`/hospede/reservas/${form.dataset.chegada}`, { method: 'PATCH', auth: true, body: { arrivalTime: form.arrivalTime.value, notes: form.notes.value } });
      toast('Hora de chegada guardada.');
    } else {
      const id = form.closest('[data-pedido]').dataset.pedido;
      await api(`/hospede/reservas/${id}/pedidos`, { method: 'POST', auth: true, body: { kind: form.kind.value, date: form.date.value, notes: form.notes.value } });
      toast('Pedido enviado à receção.');
    }
    await carregar();
  } catch (err) {
    showErrors(form, null, err);
    toast(err.message, { erro: true });
    botao.disabled = false;
  }
});

lista.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-cancelar]');
  if (!b) return;
  if (!window.confirm('Cancelar esta reserva? A chave volta ao quadro e fica livre para outras pessoas.')) return;
  b.disabled = true;
  try {
    await api(`/hospede/reservas/${b.dataset.cancelar}/cancelar`, { method: 'POST', auth: true });
    toast('Reserva cancelada.');
    await carregar();
  } catch (err) {
    toast(err.message, { erro: true });
    b.disabled = false;
  }
});

const user = await requireRole('hospede');
if (user) {
  document.querySelector('[data-ola]').textContent = `Olá, ${user.name.split(' ')[0]}`;
  carregar().catch((err) => {
    lista.innerHTML = `<p class="form-erro">${esc(err.message)}</p>`;
  });
}
