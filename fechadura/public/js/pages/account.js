import { api, ApiError, updateStoredUser } from '../api.js';
import { logout, requireUser } from '../session.js';
import { clock, euros, groupPrice, shortDate } from '../shared/pricing.js';
import { formValues, submitting, toast } from '../utils.js';

const root = document.querySelector('[data-mine]');
const esc = (v = '') => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function ticket(b) {
  const actions = b.canChange
    ? `<div class="ticket__actions"><div class="stepper" role="group" aria-label="Pessoas"><button type="button" data-step="-1" aria-label="Menos uma pessoa">−</button><output>${b.players}</output><button type="button" data-step="1" aria-label="Mais uma pessoa">+</button></div><button class="btn btn--ink btn--small" type="button" data-save>Guardar pessoas</button><button class="btn btn--red btn--small" type="button" data-cancel>Cancelar</button></div>`
    : '<p class="ticket__locked">Já não dá para alterar online: faltam menos de 24 horas. Ligue-nos se precisar.</p>';
  return `<div class="ticket" data-id="${b.id}" data-players="${b.players}" style="--accent:${b.room.color}">
    <div class="ticket__main">
      <p class="type ticket__kicker">Caso ${b.room.caseNo} · bilhete de entrada</p>
      <p class="display ticket__room">${esc(b.room.name)}</p>
      <dl class="ticket__data">
        <div><dt>Dia</dt><dd>${shortDate(b.date)}</dd></div>
        <div><dt>Hora</dt><dd>${b.time}</dd></div>
        <div><dt>Equipa</dt><dd>${esc(b.team)}</dd></div>
        <div><dt>Pessoas</dt><dd data-p>${b.players}</dd></div>
      </dl>
      ${actions}
    </div>
    <div class="ticket__stub"><span class="type">código</span><b>${b.code}</b><span class="hint" data-total>${b.voucherCode ? 'voucher' : euros(b.total)}</span></div>
  </div>`;
}

function render({ bookings, vouchers }) {
  const next = bookings.filter((b) => b.status === 'confirmada').reverse();
  const past = bookings.filter((b) => b.status === 'jogada');

  root.querySelector('[data-next]').innerHTML = next.length
    ? next.map(ticket).join('')
    : '<p class="empty">Não tem sessões marcadas. <a class="link" href="/salas">Escolher uma sala</a></p>';

  root.querySelector('[data-past]').innerHTML = past.length
    ? `<table class="escapes"><thead><tr><th scope="col">Sala</th><th scope="col">Dia</th><th scope="col">Resultado</th><th scope="col">Pistas</th></tr></thead><tbody>${past
        .map(
          (b) =>
            `<tr><th scope="row">${esc(b.room.name)}</th><td>${shortDate(b.date)}</td><td>${b.result?.escaped ? `<span class="ok">Saíram em ${clock(b.result.seconds)}</span>` : '<span class="ko">Não saíram</span>'}</td><td>${b.result?.hints ?? '—'}</td></tr>`,
        )
        .join('')}</tbody></table>`
    : '<p class="empty">Ainda não fizeram nenhuma fuga connosco.</p>';

  const label = { ativo: ['Ativo', 'stamp--ok'], usado: ['Usado', 'stamp--used'], 'por pagar': ['Por pagar', ''] };
  root.querySelector('[data-vouchers]').innerHTML = vouchers.length
    ? vouchers
        .map(
          (v) =>
            `<div class="v-card"><span class="stamp ${label[v.status][1]}">${label[v.status][0]}</span><b>${v.code}</b><p>Para ${esc(v.to)}, de ${esc(v.from)}</p><p>${v.roomName ? esc(v.roomName) : 'Qualquer sala'} · até ${v.players} pessoas · ${euros(v.amount)}</p></div>`,
        )
        .join('')
    : '<p class="empty">Nenhum voucher. <a class="link" href="/vouchers">Oferecer uma hora fechada</a></p>';
}

async function load() {
  render(await api('/conta', { auth: true }));
}

root.querySelector('[data-next]').addEventListener('click', async (event) => {
  const el = event.target.closest('.ticket');
  if (!el) return;
  const id = el.dataset.id;
  const step = event.target.closest('[data-step]');

  if (step) {
    const players = Math.min(6, Math.max(2, Number(el.dataset.players) + Number(step.dataset.step)));
    el.dataset.players = players;
    el.querySelector('output').textContent = players;
    return;
  }

  try {
    if (event.target.closest('[data-save]')) {
      const players = Number(el.dataset.players);
      await api(`/conta/reservas/${id}`, { method: 'PATCH', body: { players }, auth: true });
      toast(`Guardado: ${players} pessoas, ${euros(groupPrice(players).total)}.`);
      await load();
    }
    if (event.target.closest('[data-cancel]')) {
      if (!window.confirm('Cancelar esta sessão? A hora fica livre para outra equipa.')) return;
      await api(`/conta/reservas/${id}/cancelar`, { method: 'POST', auth: true });
      toast('Sessão cancelada.');
      await load();
    }
  } catch (err) {
    toast(err instanceof ApiError ? err.message : 'Sem ligação.', { type: 'error' });
  }
});

const profile = root.querySelector('[data-profile]');
profile.addEventListener('submit', async (event) => {
  event.preventDefault();
  await submitting(profile.querySelector('[type="submit"]'), async () => {
    try {
      const { user } = await api('/auth/me', { method: 'PATCH', body: formValues(profile), auth: true });
      updateStoredUser(user);
      toast('Dados guardados.');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Sem ligação.', { type: 'error' });
    }
  });
});

root.querySelector('[data-logout]').addEventListener('click', logout);

const user = await requireUser();
if (user) {
  if (user.role === 'admin') window.location.replace('/painel');
  document.querySelector('[data-hello]').textContent = `Dossier de ${user.name}`;
  profile.elements.name.value = user.name;
  profile.elements.phone.value = user.phone ?? '';
  profile.querySelector('[data-email]').textContent = user.email;
  await load();
}
