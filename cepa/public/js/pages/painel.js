import { api } from '../api.js';
import { logout, requireUser } from '../session.js';
import { escapeHtml, longDate, money, shortDate } from '../shared/format.js';
import { setupTabs } from '../tabs.js';
import { toast } from '../utils.js';

let statuses = [];

async function overview(panel) {
  const data = await api('/admin/overview', { auth: true });
  panel.innerHTML = `
    <div class="ledger">
      <div><span class="mono">Encomendas por tratar</span><strong>${data.open}</strong><small>recebidas ou em preparação</small></div>
      <div><span class="mono">Vendas do mês</span><strong>${money(data.monthTotal)}</strong><small>${data.monthOrders} encomendas</small></div>
      <div><span class="mono">Sócios do clube</span><strong>${data.members.total}</strong><small>${data.members.paused} em pausa</small></div>
      <div><span class="mono">Próxima prova</span><strong>${data.nextTasting ? `${data.nextTasting.taken}/${data.nextTasting.seats}` : '—'}</strong><small>${data.nextTasting ? `${escapeHtml(data.nextTasting.title)}, ${longDate(data.nextTasting.date)}` : 'sem provas marcadas'}</small></div>
    </div>
    <div class="admin-cols">
      <section>
        <h2>Stock a acabar</h2>
        ${data.lowStock.length ? `<ul class="list-plain">${data.lowStock.map((w) => `<li><span>${escapeHtml(w.name)} ${w.year ?? ''}</span><span class="mono${w.stock <= 3 ? ' low' : ''}">${w.stock} garrafas</span></li>`).join('')}</ul>` : '<p class="empty">Tudo com stock.</p>'}
      </section>
      <section>
        <h2>Atalhos</h2>
        <ul class="list-plain">
          <li><a href="#encomendas">Tratar encomendas</a><span class="mono">${data.open}</span></li>
          <li><a href="#vinhos">Atualizar preços e stock</a><span class="mono">→</span></li>
          <li><a href="#provas">Lista de convidados das provas</a><span class="mono">→</span></li>
        </ul>
      </section>
    </div>`;
}

async function orders(panel) {
  const data = await api('/admin/orders', { auth: true });
  statuses = data.statuses;
  panel.innerHTML = `
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Encomenda</th><th>Cliente</th><th>Vinhos</th><th>Entrega</th><th>Total</th><th>Estado</th></tr></thead>
        <tbody>
          ${data.orders
            .map(
              (o) => `
          <tr>
            <td><span class="mono">${o.code}</span><small>${shortDate(o.createdAt)}</small></td>
            <td>${escapeHtml(o.customer.name ?? '—')}<small>${escapeHtml(o.customer.email ?? '')}</small></td>
            <td>${o.items.map((i) => `${i.quantity} × ${escapeHtml(i.name)}`).join('<br>')}</td>
            <td>${o.delivery.method === 'loja' ? 'Loja' : escapeHtml(o.delivery.city)}${o.delivery.notes ? `<small>${escapeHtml(o.delivery.notes)}</small>` : ''}</td>
            <td class="num">${money(o.total)}</td>
            <td>
              <label class="sr-only" for="st-${o.id}">Estado de ${o.code}</label>
              <select class="input" id="st-${o.id}" data-order-status="${o.id}"${o.status === 'cancelada' ? ' disabled' : ''}>
                ${statuses.map((s) => `<option${s === o.status ? ' selected' : ''}>${s}</option>`).join('')}
              </select>
            </td>
          </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>`;
}

async function wines(panel) {
  const { wines: list } = await api('/admin/wines', { auth: true });
  panel.innerHTML = `
    <p class="empty">As alterações gravam sozinhas. A “carta da semana” é o que aparece na página inicial.</p>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Vinho</th><th>Tipo</th><th>Preço (€)</th><th>Stock</th><th>Carta da semana</th></tr></thead>
        <tbody>
          ${list
            .map(
              (w) => `
          <tr data-wine-row="${w.id}">
            <td><a href="/carta/${w.slug}">${escapeHtml(w.name)} ${w.year ?? ''}</a><small>${escapeHtml(w.producer.name)}</small></td>
            <td>${escapeHtml(w.typeName)}</td>
            <td><input class="input" type="number" step="0.1" min="3" max="1000" name="price" value="${w.price}" aria-label="Preço de ${escapeHtml(w.name)}"></td>
            <td><input class="input${w.stock <= 6 ? ' low' : ''}" type="number" min="0" max="999" name="stock" value="${w.stock}" aria-label="Stock de ${escapeHtml(w.name)}"></td>
            <td><label class="check"><input type="checkbox" name="featured"${w.featured ? ' checked' : ''}><span class="sr-only">Carta da semana</span></label></td>
          </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>`;
}

async function tastings(panel) {
  const { tastings: list } = await api('/admin/tastings', { auth: true });
  panel.innerHTML = list
    .map(
      (t) => `
    <section class="guests">
      <header><h2 class="section-title">${escapeHtml(t.title)}</h2><span class="mono">${longDate(t.date)} · ${t.taken}/${t.seats} lugares</span></header>
      ${
        t.guests.length
          ? `<ul class="list-plain">${t.guests.map((g) => `<li><span>${escapeHtml(g.name)} <small class="mono">· ${g.people} ${g.people === 1 ? 'lugar' : 'lugares'}</small></span><button class="small-btn" type="button" data-cancel-guest="${g.id}">Cancelar</button></li>`).join('')}</ul>`
          : '<p class="empty">Ainda sem reservas.</p>'
      }
    </section>`,
    )
    .join('');
}

async function members(panel) {
  const { members: list } = await api('/admin/members', { auth: true });
  panel.innerHTML = list.length
    ? `<div class="table-wrap"><table class="table">
      <thead><tr><th>Sócio</th><th>Plano</th><th>Prefere</th><th>Desde</th><th>Estado</th></tr></thead>
      <tbody>${list
        .map(
          (m) => `<tr><td>${escapeHtml(m.name)}<small>${escapeHtml(m.email)} · ${escapeHtml(m.city ?? '')}</small></td><td>${escapeHtml(m.planInfo.name)}<small>${money(m.planInfo.price)}/mês</small></td><td>${m.preference}</td><td class="num">${shortDate(m.since)}</td><td><span class="tag status-${m.status.replace(/\s/g, '-')}">${m.status}</span></td></tr>`,
        )
        .join('')}</tbody></table></div>`
    : '<p class="empty">Ainda não há sócios.</p>';
}

async function start() {
  const user = await requireUser({ roles: ['admin'] });
  if (!user) return;

  const tabs = setupTabs({ resumo: overview, encomendas: orders, vinhos: wines, provas: tastings, socios: members });
  tabs.start();

  const page = document.querySelector('[data-admin]');

  page.addEventListener('change', async (event) => {
    const status = event.target.closest('[data-order-status]');
    const row = event.target.closest('[data-wine-row]');
    try {
      if (status) {
        await api(`/admin/orders/${status.dataset.orderStatus}`, { method: 'PATCH', auth: true, body: { status: status.value } });
        toast(`Encomenda marcada como “${status.value}”.`);
        if (status.value === 'cancelada') status.disabled = true;
        tabs.reload('resumo');
      }
      if (row) {
        const input = event.target;
        const value = input.type === 'checkbox' ? input.checked : Number(input.value);
        await api(`/admin/wines/${row.dataset.wineRow}`, { method: 'PATCH', auth: true, body: { [input.name]: value } });
        toast('Vinho atualizado.');
      }
    } catch (error) {
      toast(error.details?.[0]?.message ?? error.message, { type: 'error' });
      if (row) tabs.reload('vinhos');
    }
  });

  page.addEventListener('click', async (event) => {
    const guest = event.target.closest('[data-cancel-guest]');
    if (!guest || !confirm('Cancelar esta reserva?')) return;
    try {
      await api(`/admin/reservations/${guest.dataset.cancelGuest}`, { method: 'DELETE', auth: true });
      toast('Reserva cancelada.');
      tabs.reload('provas');
    } catch (error) {
      toast(error.message, { type: 'error' });
    }
  });

  document.querySelector('[data-logout]').addEventListener('click', logout);
}

start();
