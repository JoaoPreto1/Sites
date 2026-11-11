import { api } from '../api.js';
import { linkDateInputs } from '../date-range.js';
import { requireUser } from '../session.js';
import { escapeHtml, formatDate, money, shortDate, showFieldErrors, statusLabels, toast, todayIso } from '../utils.js';

const panels = Object.fromEntries([...document.querySelectorAll('[data-panel]')].map((el) => [el.dataset.panel, el]));
const tabs = document.querySelectorAll('[data-tab]');
const statusFilter = document.querySelector('[data-status-filter]');
const propertyFilter = document.querySelector('[data-property-filter]');
const blockForm = document.querySelector('[data-block-form]');

let properties = [];
const loaded = new Set();

const badge = (status) => `<span class="badge badge--${status}">${statusLabels[status]}</span>`;

function actionsFor(booking) {
  const buttons = {
    pendente: [['confirmada', 'Confirmar', 'btn--sea'], ['cancelada', 'Recusar', 'btn--danger']],
    confirmada: [['concluida', 'Concluir', 'btn--ghost'], ['cancelada', 'Cancelar', 'btn--danger']],
  }[booking.status];

  if (!buttons) return '';
  return `<div class="row-actions">${buttons
    .map(([status, label, style]) => `<button class="btn btn--small ${style}" type="button" data-status="${status}" data-code="${booking.code}">${label}</button>`)
    .join('')}</div>`;
}

function greeting(name) {
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Bom dia' : hour < 20 ? 'Boa tarde' : 'Boa noite';
  return `${hello}, <em>${escapeHtml(name.split(' ')[0])}.</em>`;
}

async function loadOverview() {
  const { stats, arrivals, pending } = await api('/owner/overview', { auth: true });

  const listItem = (b, extra = '') => `
    <div class="list-item">
      <div>
        <strong>${escapeHtml(b.guest.name)}</strong> · ${escapeHtml(b.property.name)}
        <small>${shortDate(b.checkIn)} → ${shortDate(b.checkOut)} · ${b.adults + b.children} hóspedes · ${money(b.price.total)}</small>
      </div>
      ${extra}
    </div>`;

  panels.resumo.innerHTML = `
    <div class="stats">
      <div class="stat stat--dark"><small>Pedidos por confirmar</small><strong>${stats.pending}</strong></div>
      <div class="stat"><small>Estadias confirmadas</small><strong>${stats.upcoming}</strong></div>
      <div class="stat"><small>Ocupação nos próximos 30 dias</small><strong>${stats.occupancy}%</strong></div>
      <div class="stat"><small>Faturado este ano</small><strong>${money(stats.revenue)}</strong></div>
    </div>
    <div class="overview">
      <div class="card">
        <h3>Pedidos por confirmar</h3>
        ${pending.length ? pending.map((b) => listItem(b, actionsFor(b))).join('') : '<p class="muted">Nada pendente. 🎉</p>'}
      </div>
      <div class="card">
        <h3>Chegadas nas próximas 2 semanas</h3>
        ${
          arrivals.length
            ? arrivals
                .map((b) =>
                  listItem(
                    b,
                    b.checkin
                      ? `<span class="badge badge--confirmada">Chega às ${escapeHtml(b.checkin.arrivalTime)}</span>`
                      : '<span class="badge badge--pendente">Sem check-in</span>',
                  ),
                )
                .join('')
            : '<p class="muted">Sem chegadas marcadas.</p>'
        }
      </div>
    </div>`;
}

async function loadBookings() {
  const query = new URLSearchParams();
  if (statusFilter.value) query.set('status', statusFilter.value);
  if (propertyFilter.value) query.set('propertyId', propertyFilter.value);

  const { bookings } = await api(`/owner/bookings?${query}`, { auth: true });
  const target = document.querySelector('[data-bookings]');

  if (!bookings.length) {
    target.innerHTML = '<p class="muted">Não há reservas com estes filtros.</p>';
    return;
  }

  target.innerHTML = `
    <table class="table">
      <thead><tr><th>Reserva</th><th>Casa</th><th>Hóspede</th><th>Datas</th><th>Total</th><th>Estado</th><th></th></tr></thead>
      <tbody>
        ${bookings
          .map(
            (b) => `
          <tr>
            <td><strong>${b.code}</strong><small>${formatDate(b.createdAt.slice(0, 10))}</small></td>
            <td>${escapeHtml(b.property.name)}</td>
            <td>${escapeHtml(b.guest.name)}<small>${escapeHtml(b.guest.phone)}</small></td>
            <td>${shortDate(b.checkIn)} → ${shortDate(b.checkOut)}<small>${b.adults + b.children} hóspedes${b.extras.length ? ` · ${b.extras.length} extra(s)` : ''}</small></td>
            <td>${money(b.price.total)}</td>
            <td>${badge(b.status)}</td>
            <td>${actionsFor(b)}</td>
          </tr>`,
          )
          .join('')}
      </tbody>
    </table>`;
}

function renderProperties() {
  document.querySelector('[data-properties]').innerHTML = properties
    .map(
      (p) => `
      <form class="owner-property" data-property-form="${p.id}">
        <img src="${p.images[0]}?w=300&h=360&q=70&auto=format&fit=crop" alt="">
        <div>
          <h3>${escapeHtml(p.name)}</h3>
          <div class="form-grid">
            <div class="field"><label>Preço base / noite</label><input class="input" name="pricePerNight" type="number" min="20" value="${p.pricePerNight}"></div>
            <div class="field"><label>Limpeza</label><input class="input" name="cleaningFee" type="number" min="0" value="${p.cleaningFee}"></div>
            <div class="field"><label>Mín. noites</label><input class="input" name="minNights" type="number" min="1" value="${p.minNights}"></div>
          </div>
          <div class="owner-property__footer">
            <label class="switch"><input type="checkbox" name="active" ${p.active ? 'checked' : ''}> Visível no site</label>
            <button class="btn btn--small" type="submit">Guardar</button>
          </div>
        </div>
      </form>`,
    )
    .join('');
}

async function loadBlocks() {
  const { blocks } = await api('/owner/blocks', { auth: true });
  const names = Object.fromEntries(properties.map((p) => [p.id, p.name]));
  const target = document.querySelector('[data-blocks]');

  target.innerHTML = blocks.length
    ? `<table class="table">
        <thead><tr><th>Casa</th><th>Datas</th><th>Motivo</th><th></th></tr></thead>
        <tbody>${blocks
          .map(
            (k) => `
          <tr>
            <td>${escapeHtml(names[k.propertyId] ?? '')}</td>
            <td>${formatDate(k.from)} → ${formatDate(k.to)}</td>
            <td>${escapeHtml(k.reason || '—')}</td>
            <td><div class="row-actions"><button class="btn btn--ghost btn--small" type="button" data-remove-block="${k.id}">Remover</button></div></td>
          </tr>`,
          )
          .join('')}</tbody>
      </table>`
    : '<p class="muted">Não há datas bloqueadas.</p>';
}

async function loadMessages() {
  const { messages } = await api('/owner/messages', { auth: true });
  const unread = messages.filter((m) => m.status === 'nova').length;
  const counter = document.querySelector('[data-unread]');
  counter.textContent = unread;
  counter.hidden = !unread;

  document.querySelector('[data-messages]').innerHTML = messages.length
    ? messages
        .map(
          (m) => `
        <article class="message${m.status === 'nova' ? ' is-new' : ''}">
          <header>
            <div><strong>${escapeHtml(m.subject)}</strong><small>${escapeHtml(m.name)} · ${escapeHtml(m.email)} · ${formatDate(m.createdAt.slice(0, 10))}</small></div>
            <span class="badge">${m.status}</span>
          </header>
          <p>${escapeHtml(m.message)}</p>
          <div class="row-actions">
            <a class="btn btn--small" href="mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(`Re: ${m.subject}`)}">Responder por email</a>
            ${m.status === 'nova' ? `<button class="btn btn--ghost btn--small" type="button" data-message="${m.id}" data-message-status="lida">Marcar como lida</button>` : ''}
            ${m.status !== 'respondida' ? `<button class="btn btn--ghost btn--small" type="button" data-message="${m.id}" data-message-status="respondida">Já respondi</button>` : ''}
          </div>
        </article>`,
        )
        .join('')
    : '<div class="empty"><h3>Sem mensagens</h3></div>';
}

const loaders = { resumo: loadOverview, reservas: loadBookings, casas: async () => renderProperties(), bloqueios: loadBlocks, mensagens: loadMessages };

async function showTab(name, { force = false } = {}) {
  tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.tab === name));
  Object.entries(panels).forEach(([key, panel]) => (panel.hidden = key !== name));

  if (loaded.has(name) && !force) return;
  try {
    await loaders[name]();
    loaded.add(name);
  } catch (error) {
    toast(error.message, 'error');
  }
}

document.querySelector('.panel').addEventListener('click', async (event) => {
  const statusButton = event.target.closest('[data-status]');
  if (statusButton) {
    statusButton.disabled = true;
    try {
      await api(`/owner/bookings/${statusButton.dataset.code}`, { method: 'PATCH', auth: true, body: { status: statusButton.dataset.status } });
      toast(`Reserva ${statusButton.dataset.code}: ${statusLabels[statusButton.dataset.status].toLowerCase()}`);
      loaded.clear();
      const current = document.querySelector('[data-tab].is-active').dataset.tab;
      await showTab(current, { force: true });
    } catch (error) {
      toast(error.message, 'error');
      statusButton.disabled = false;
    }
    return;
  }

  const removeButton = event.target.closest('[data-remove-block]');
  if (removeButton) {
    await api(`/owner/blocks/${removeButton.dataset.removeBlock}`, { method: 'DELETE', auth: true });
    toast('Bloqueio removido');
    return loadBlocks();
  }

  const messageButton = event.target.closest('[data-message]');
  if (messageButton) {
    await api(`/owner/messages/${messageButton.dataset.message}`, { method: 'PATCH', auth: true, body: { status: messageButton.dataset.messageStatus } });
    return loadMessages();
  }
});

document.querySelector('[data-properties]').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const id = form.dataset.propertyForm;

  try {
    const { property } = await api(`/owner/properties/${id}`, {
      method: 'PATCH',
      auth: true,
      body: {
        pricePerNight: Number(form.pricePerNight.value),
        cleaningFee: Number(form.cleaningFee.value),
        minNights: Number(form.minNights.value),
        active: form.active.checked,
      },
    });
    properties = properties.map((p) => (p.id === id ? property : p));
    toast(`${property.name} atualizada`);
  } catch (error) {
    toast(error.details?.[0]?.message ?? error.message, 'error');
  }
});

blockForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const error = blockForm.querySelector('[data-error]');
  error.hidden = true;
  showFieldErrors(blockForm);

  try {
    await api('/owner/blocks', { method: 'POST', auth: true, body: Object.fromEntries(new FormData(blockForm)) });
    blockForm.reset();
    toast('Datas bloqueadas');
    loadBlocks();
  } catch (err) {
    showFieldErrors(blockForm, err.details);
    if (!err.details?.length) {
      error.textContent = err.message;
      error.hidden = false;
    }
  }
});

[statusFilter, propertyFilter].forEach((select) => select.addEventListener('change', loadBookings));

async function init() {
  const user = await requireUser({ roles: ['proprietario', 'admin'] });
  if (!user) return;

  document.querySelector('[data-greeting]').innerHTML = greeting(user.name);
  document.querySelector('[data-today]').textContent = formatDate(todayIso(), { weekday: true });

  ({ properties } = await api('/owner/properties', { auth: true }));
  const options = properties.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
  propertyFilter.insertAdjacentHTML('beforeend', options);
  blockForm.propertyId.innerHTML = options;
  linkDateInputs(blockForm.from, blockForm.to);

  tabs.forEach((tab) => tab.addEventListener('click', () => showTab(tab.dataset.tab)));
  await showTab('resumo');
  loadMessages();
}

init();
