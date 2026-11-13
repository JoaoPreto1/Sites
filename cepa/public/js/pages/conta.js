import { api, updateStoredUser } from '../api.js';
import { logout, requireUser } from '../session.js';
import { escapeHtml, longDate, money, shortDate } from '../shared/format.js';
import { setupTabs } from '../tabs.js';
import { formValues, showFieldErrors, submitting, toast } from '../utils.js';

const statusClass = (status) => `tag status-${status.replace(/\s/g, '-')}`;

async function orders(panel) {
  const { orders: list } = await api('/orders', { auth: true });
  if (!list.length) {
    panel.innerHTML = '<p class="empty">Ainda não fez nenhuma encomenda. <a href="/carta">Abrir a carta</a></p>';
    return;
  }
  panel.innerHTML = list
    .map(
      (o) => `
    <article class="order">
      <div><p class="order__code">${o.code}</p><p class="order__date">${shortDate(o.createdAt)}</p></div>
      <div>
        <ul>${o.items.map((i) => `<li><span>${i.quantity} × ${escapeHtml(i.name)}</span><span class="mono">${money(i.price * i.quantity)}</span></li>`).join('')}</ul>
        <p class="order__delivery">${o.delivery.method === 'loja' ? 'Levantamento na loja' : `Envio para ${escapeHtml(o.delivery.address)}, ${escapeHtml(o.delivery.city)}`}${o.discount ? ` · desconto de sócio ${money(o.discount)}` : ''}</p>
      </div>
      <div class="order__side">
        <span class="${statusClass(o.status)}">${o.status}</span>
        <span class="order__total">${money(o.total)}</span>
        ${o.status === 'recebida' ? `<button class="small-btn" type="button" data-cancel-order="${o.id}">Cancelar</button>` : ''}
      </div>
    </article>`,
    )
    .join('');
}

async function club(panel) {
  const [{ subscription }, { plans }] = await Promise.all([api('/club/me', { auth: true }), api('/club')]);
  if (!subscription) {
    panel.innerHTML = '<p class="empty">Ainda não é sócio do clube. Uma caixa por mês, escolhida por nós, a partir de 39 €. <a href="/clube">Saber mais</a></p>';
    return;
  }

  const paused = subscription.status === 'em pausa';
  panel.innerHTML = `
    <div class="member-card">
      <div class="member-card__plan">
        <p class="mono">Sócio desde ${shortDate(subscription.since)}</p>
        <h2>${escapeHtml(subscription.planInfo.name)}</h2>
        <p>${money(subscription.planInfo.price)} por mês · ${subscription.planInfo.discount}% de desconto na loja</p>
        <p>${paused ? 'A subscrição está em pausa. Não enviamos nem cobramos nada até a retomar.' : `Próxima caixa: ${longDate(subscription.nextBox)}.`}</p>
      </div>
      <form data-club-form>
        <label class="field"><span>Plano</span>
          <select class="input" name="plan">${plans.map((p) => `<option value="${p.slug}"${p.slug === subscription.plan ? ' selected' : ''}>${escapeHtml(p.name)} · ${money(p.price)}</option>`).join('')}</select>
        </label>
        <label class="field"><span>O que prefere receber</span>
          <select class="input" name="preference">
            ${[['misto', 'Um pouco de tudo'], ['tintos', 'Só tintos'], ['brancos', 'Só brancos e espumantes']].map(([v, l]) => `<option value="${v}"${v === subscription.preference ? ' selected' : ''}>${l}</option>`).join('')}
          </select>
        </label>
        <div class="member-card__actions">
          <button class="btn" type="submit">Guardar</button>
          <button class="btn btn--line" type="button" data-club-status="${paused ? 'ativa' : 'em pausa'}">${paused ? 'Retomar' : 'Pausar'}</button>
          <button class="small-btn" type="button" data-club-status="cancelada">Cancelar subscrição</button>
        </div>
      </form>
    </div>`;
}

async function tastings(panel) {
  const { reservations } = await api('/tastings/mine', { auth: true });
  if (!reservations.length) {
    panel.innerHTML = '<p class="empty">Não tem lugares reservados. <a href="/provas">Ver as próximas provas</a></p>';
    return;
  }
  panel.innerHTML = reservations
    .map(
      (r) => `
    <article class="booking">
      <img src="${r.tasting.photo}?w=180&h=180&q=70&auto=format&fit=crop" alt="" width="90" height="90" loading="lazy">
      <div>
        <h3><a href="/provas#${r.tasting.slug}">${escapeHtml(r.tasting.title)}</a></h3>
        <p>${longDate(r.tasting.date)} · ${r.tasting.time} · ${r.people === 1 ? '1 lugar' : `${r.people} lugares`} · ${money(r.tasting.price * r.people)}</p>
      </div>
      <button class="small-btn" type="button" data-cancel-booking="${r.id}">Cancelar</button>
    </article>`,
    )
    .join('');
}

async function details(panel, user) {
  const v = (key) => escapeHtml(user[key] ?? '');
  panel.innerHTML = `
    <div class="forms-2">
      <form data-profile novalidate>
        <h2>Dados e morada de entrega</h2>
        <div class="grid-2">
          <label class="field"><span>Nome</span><input class="input" name="name" value="${v('name')}" autocomplete="name"></label>
          <label class="field"><span>Telemóvel</span><input class="input" name="phone" value="${v('phone')}" autocomplete="tel"></label>
        </div>
        <label class="field"><span>Morada</span><input class="input" name="address" value="${v('address')}" autocomplete="street-address"></label>
        <div class="grid-2">
          <label class="field"><span>Código postal</span><input class="input" name="postalCode" value="${v('postalCode')}" placeholder="0000-000" autocomplete="postal-code"></label>
          <label class="field"><span>Localidade</span><input class="input" name="city" value="${v('city')}" autocomplete="address-level2"></label>
        </div>
        <p class="mono">Email: ${v('email')}</p>
        <button class="btn" type="submit">Guardar dados</button>
      </form>
      <form data-password novalidate>
        <h2>Palavra-passe</h2>
        <label class="field"><span>Atual</span><input class="input" type="password" name="currentPassword" autocomplete="current-password"></label>
        <label class="field"><span>Nova</span><input class="input" type="password" name="newPassword" autocomplete="new-password"></label>
        <button class="btn btn--line" type="submit">Mudar palavra-passe</button>
      </form>
    </div>`;
}

async function start() {
  const user = await requireUser();
  if (!user) return;
  if (user.role === 'admin') return window.location.replace('/painel');

  document.querySelector('[data-hello]').innerHTML = `Olá, <em>${escapeHtml(user.name.split(' ')[0])}</em>.`;
  const tabs = setupTabs({
    encomendas: orders,
    clube: club,
    provas: tastings,
    dados: (panel) => details(panel, user),
  });
  tabs.start();

  const page = document.querySelector('[data-account-page]');

  page.addEventListener('click', async (event) => {
    const cancelOrder = event.target.closest('[data-cancel-order]');
    const cancelBooking = event.target.closest('[data-cancel-booking]');
    const clubStatus = event.target.closest('[data-club-status]');

    try {
      if (cancelOrder && confirm('Cancelar esta encomenda?')) {
        await api(`/orders/${cancelOrder.dataset.cancelOrder}/cancel`, { method: 'POST', auth: true });
        toast('Encomenda cancelada.');
        tabs.reload('encomendas');
      }
      if (cancelBooking && confirm('Cancelar a reserva nesta prova?')) {
        await api(`/tastings/reservations/${cancelBooking.dataset.cancelBooking}`, { method: 'DELETE', auth: true });
        toast('Reserva cancelada. O lugar volta a ficar livre.');
        tabs.reload('provas');
      }
      if (clubStatus) {
        const status = clubStatus.dataset.clubStatus;
        if (status === 'cancelada' && !confirm('Cancelar a subscrição do clube?')) return;
        await api('/club/me', { method: 'PATCH', auth: true, body: { status } });
        toast({ ativa: 'Subscrição retomada.', 'em pausa': 'Subscrição em pausa.', cancelada: 'Subscrição cancelada.' }[status]);
        tabs.reload('clube');
      }
    } catch (error) {
      toast(error.message, { type: 'error' });
    }
  });

  page.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('[type="submit"]');
    showFieldErrors(form);

    await submitting(button, async () => {
      try {
        if (form.matches('[data-club-form]')) {
          await api('/club/me', { method: 'PATCH', auth: true, body: formValues(form) });
          toast('Preferências do clube guardadas.');
          tabs.reload('clube');
        }
        if (form.matches('[data-profile]')) {
          const values = Object.fromEntries(Object.entries(formValues(form)).filter(([, value]) => value.trim()));
          const { user: updated } = await api('/auth/me', { method: 'PATCH', auth: true, body: values });
          updateStoredUser(updated);
          Object.assign(user, updated);
          toast('Dados guardados.');
        }
        if (form.matches('[data-password]')) {
          await api('/auth/me/password', { method: 'PATCH', auth: true, body: formValues(form) });
          form.reset();
          toast('Palavra-passe alterada.');
        }
      } catch (error) {
        showFieldErrors(form, error.details);
        if (!error.details?.length) toast(error.message, { type: 'error' });
      }
    });
  });

  document.querySelector('[data-logout]').addEventListener('click', logout);
}

start();
