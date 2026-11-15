import { api } from '../api.js';
import { logout, requireUser } from '../session.js';
import { cover, escapeHtml, hour, longDate, money, price, shortDate, weekdayShort, dayNumber } from '../shared/format.js';
import { setupTabs } from '../tabs.js';
import { toast } from '../utils.js';

const user = await requireUser({ roles: ['staff', 'admin'] });

const LABEL = { paga: 'Paga', pronta: 'Pronta', enviada: 'Enviada', entregue: 'Entregue', cancelada: 'Cancelada', nova: 'Nova', marcada: 'Marcada', fechada: 'Fechada', confirmada: 'Confirmada', aberto: 'Aberto', encontrado: 'Encontrado', fechado: 'Fechado' };
const status = (s) => `<span class="status status--${s}">${LABEL[s] ?? s}</span>`;
const select = (name, options, current, attrs = '') =>
  `<select class="input select-small" name="${name}" ${attrs}>${options.map((o) => `<option value="${o}"${o === current ? ' selected' : ''}>${LABEL[o] ?? o}</option>`).join('')}</select>`;

async function safe(task, ok) {
  try {
    await task();
    if (ok) toast(ok);
  } catch (error) {
    toast(error.message, { type: 'error' });
  }
}

if (user) {
  document.querySelectorAll('[data-logout]').forEach((b) => b.addEventListener('click', logout));

  const tabs = setupTabs({
    async resumo(panel) {
      const s = await api('/admin/resumo', { auth: true });
      panel.innerHTML = `
        <div class="stats">
          <div class="box"><b>${s.toShip.length}</b><span>encomendas por preparar</span></div>
          <div class="box"><b>${s.bookings.length}</b><span>ensaios marcados hoje</span></div>
          <div class="box"><b>${s.wantsOpen}</b><span>discos na parede da procura</span></div>
          <div class="box"><b>${s.offers.length}</b><span>pedidos de avaliação novos</span></div>
        </div>
        <div class="panel-grid">
          <section class="box item-card">
            <h2>Hoje nas salas</h2>
            ${s.bookings.length ? s.bookings.map((b) => `<p><b>${hour(b.start)}–${hour(b.start + b.hours)}</b> · ${escapeHtml(b.room)} · ${escapeHtml(b.band)}</p>`).join('') : '<p class="empty">Nenhum ensaio hoje.</p>'}
          </section>
          <section class="box item-card">
            <h2>Por preparar</h2>
            ${s.toShip.length ? s.toShip.map((o) => `<p><b>n.º ${o.number}</b> · ${escapeHtml(o.customer)} · ${o.items.length} ${o.items.length === 1 ? 'disco' : 'discos'} · ${o.method === 'envio' ? 'envio' : 'loja'}</p>`).join('') : '<p class="empty">Tudo despachado.</p>'}
          </section>
          <section class="box item-card">
            <h2>Stock a acabar</h2>
            ${s.lowStock.length ? s.lowStock.map((r) => `<p>${escapeHtml(r.artist)} — ${escapeHtml(r.title)} · <b>${r.stock}</b></p>`).join('') : '<p class="empty">Nada a acabar.</p>'}
          </section>
        </div>`;
    },

    async encomendas(panel) {
      const { orders } = await api('/admin/encomendas', { auth: true });
      panel.innerHTML = `
        <div class="table-scroll"><table class="table">
          <thead><tr><th>N.º</th><th>Data</th><th>Cliente</th><th>Discos</th><th>Entrega</th><th>Total</th><th>Estado</th></tr></thead>
          <tbody>${orders
            .map(
              (o) => `<tr>
            <td><b>${o.number}</b></td><td>${shortDate(o.createdAt)}</td><td>${escapeHtml(o.customer)}</td>
            <td>${o.items.map((i) => escapeHtml(i.title)).join(', ')}</td><td>${o.method === 'envio' ? escapeHtml(o.address) : 'Loja'}</td>
            <td>${money(o.total)}</td>
            <td>${o.status === 'cancelada' ? status('cancelada') : select('status', ['paga', 'pronta', 'enviada', 'entregue', 'cancelada'], o.status, `data-order="${o.id}" aria-label="Estado da encomenda ${o.number}"`)}</td>
          </tr>`,
            )
            .join('')}</tbody>
        </table></div>`;
      panel.onchange = (event) => {
        const el = event.target.closest('[data-order]');
        if (!el) return;
        if (el.value === 'cancelada' && !confirm('Cancelar a encomenda? Os discos voltam ao stock.')) return tabs.reload('encomendas');
        safe(() => api(`/admin/encomendas/${el.dataset.order}`, { method: 'PATCH', auth: true, body: { status: el.value } }), 'Estado atualizado.').then(() => tabs.reload('encomendas'));
      };
    },

    async discos(panel) {
      const { records } = await api('/admin/discos', { auth: true });
      panel.innerHTML = `
        <div class="table-scroll"><table class="table">
          <thead><tr><th></th><th>Disco</th><th>Caixote</th><th>Estado</th><th>Preço (€)</th><th>Stock</th><th>Destaque</th></tr></thead>
          <tbody>${records
            .map(
              (r) => `<tr data-record="${r.id}">
            <td><img src="${cover(r, 100)}" width="44" height="44" alt="" loading="lazy"></td>
            <td><b>${escapeHtml(r.artist)}</b><br>${escapeHtml(r.title)}</td><td>${escapeHtml(r.crateName)}</td><td>${r.media} / ${r.sleeve}</td>
            <td><input class="input inline-input" type="number" min="1" max="999" step="0.5" name="price" value="${r.price}" aria-label="Preço de ${escapeHtml(r.title)}"></td>
            <td><input class="input inline-input" type="number" min="0" max="99" name="stock" value="${r.stock}" aria-label="Stock de ${escapeHtml(r.title)}"></td>
            <td><input type="checkbox" name="featured"${r.featured ? ' checked' : ''} aria-label="Destaque"></td>
          </tr>`,
            )
            .join('')}</tbody>
        </table></div>`;
      panel.onchange = (event) => {
        const row = event.target.closest('[data-record]');
        if (!row) return;
        const input = event.target;
        const value = input.type === 'checkbox' ? input.checked : Number(input.value);
        safe(() => api(`/admin/discos/${row.dataset.record}`, { method: 'PATCH', auth: true, body: { [input.name]: value } }), 'Guardado.');
      };
    },

    async salas(panel) {
      const load = async (date) => {
        const { date: day, days, bookings } = await api(`/admin/salas${date ? `?data=${date}` : ''}`, { auth: true });
        panel.innerHTML = `
          <div class="desk__days" style="margin-bottom:20px">${days.map((d) => `<button type="button" class="pad" data-day="${d}" aria-pressed="${d === day}"><span>${weekdayShort(d)}</span><b>${dayNumber(d)}</b></button>`).join('')}</div>
          <h2>${longDate(day)}</h2>
          ${
            bookings.length
              ? `<div class="table-scroll"><table class="table"><thead><tr><th>Hora</th><th>Sala</th><th>Banda</th><th>Extras</th><th>Total</th><th>Estado</th><th></th></tr></thead><tbody>${bookings
                  .map(
                    (b) =>
                      `<tr><td><b>${hour(b.start)}–${hour(b.start + b.hours)}</b></td><td>${escapeHtml(b.room)}</td><td>${escapeHtml(b.band)}</td><td>${b.extras.join(', ') || '—'}</td><td>${price(b.total)}</td><td>${status(b.status)}</td><td>${
                        b.status === 'confirmada' ? `<button class="link" type="button" data-cancel="${b.id}">Cancelar</button>` : ''
                      }</td></tr>`,
                  )
                  .join('')}</tbody></table></div>`
              : '<p class="empty">Sem marcações neste dia.</p>'
          }`;
      };
      panel.onclick = (event) => {
        const pad = event.target.closest('[data-day]');
        if (pad) return load(pad.dataset.day);
        const cancel = event.target.closest('[data-cancel]');
        if (cancel && confirm('Cancelar esta marcação?')) {
          safe(() => api(`/admin/salas/reservas/${cancel.dataset.cancel}`, { method: 'DELETE', auth: true }), 'Marcação cancelada.').then(() =>
            load(panel.querySelector('.pad[aria-pressed="true"]')?.dataset.day),
          );
        }
      };
      await load();
    },

    async procura(panel) {
      const { wants, records } = await api('/admin/procura', { auth: true });
      const options = records.map((r) => `<option value="${r.id}">${escapeHtml(r.artist)} — ${escapeHtml(r.title)}</option>`).join('');
      panel.innerHTML = `
        <div class="table-scroll"><table class="table">
          <thead><tr><th>Quem</th><th>Procura</th><th>Estado mín.</th><th>Até</th><th>Estado</th><th>Encontrámos?</th></tr></thead>
          <tbody>${wants
            .map(
              (w) => `<tr data-want="${w.id}">
            <td>${escapeHtml(w.name)}</td><td><b>${escapeHtml(w.artist)}</b> — ${escapeHtml(w.title)}${w.note ? `<br><small>${escapeHtml(w.note)}</small>` : ''}</td>
            <td>${w.minGrade}</td><td>${w.maxPrice} €</td><td>${status(w.status)}</td>
            <td>${
              w.status === 'aberto'
                ? `<select class="input select-small" data-found aria-label="Disco encontrado"><option value="">Escolher disco…</option>${options}</select> <button class="link" type="button" data-close>Fechar</button>`
                : w.status === 'encontrado'
                  ? `guardado até ${shortDate(w.holdUntil)}`
                  : ''
            }</td>
          </tr>`,
            )
            .join('')}</tbody>
        </table></div>`;
      panel.onchange = (event) => {
        const el = event.target.closest('[data-found]');
        if (!el?.value) return;
        const id = el.closest('[data-want]').dataset.want;
        safe(() => api(`/admin/procura/${id}`, { method: 'PATCH', auth: true, body: { status: 'encontrado', recordId: el.value } }), 'Guardado 48 h com o nome do cliente.').then(() => tabs.reload('procura'));
      };
      panel.onclick = (event) => {
        const el = event.target.closest('[data-close]');
        if (!el) return;
        const id = el.closest('[data-want]').dataset.want;
        safe(() => api(`/admin/procura/${id}`, { method: 'PATCH', auth: true, body: { status: 'fechado' } }), 'Tirado da parede.').then(() => tabs.reload('procura'));
      };
    },

    async avaliacoes(panel) {
      const { offers } = await api('/admin/avaliacoes', { auth: true });
      panel.innerHTML = offers.length
        ? `<div class="panel-grid">${offers
            .map(
              (o) => `
          <article class="box item-card" data-offer="${o.id}">
            <div class="item-card__head"><h3>${escapeHtml(o.name)}</h3>${status(o.status)}</div>
            <p class="mono">${shortDate(o.createdAt)} · ${o.method === 'casa' ? `em casa${o.area ? `, ${escapeHtml(o.area)}` : ''}` : 'na loja'} · ${escapeHtml(o.count)}</p>
            <p>${escapeHtml(o.genres || '—')}</p>
            ${o.notes ? `<p>${escapeHtml(o.notes)}</p>` : ''}
            <p class="mono"><a href="mailto:${escapeHtml(o.email)}">${escapeHtml(o.email)}</a>${o.phone ? ` · ${escapeHtml(o.phone)}` : ''}</p>
            <div class="item-card__actions">
              ${select('status', ['nova', 'marcada', 'fechada'], o.status, 'aria-label="Estado"')}
              <input class="input select-small" type="date" name="date" value="${o.date ?? ''}" aria-label="Data da avaliação">
            </div>
          </article>`,
            )
            .join('')}</div>`
        : '<p class="empty">Sem pedidos de avaliação.</p>';
      panel.onchange = (event) => {
        const card = event.target.closest('[data-offer]');
        if (!card) return;
        const body = { status: card.querySelector('[name="status"]').value };
        const date = card.querySelector('[name="date"]').value;
        if (date) body.date = date;
        safe(() => api(`/admin/avaliacoes/${card.dataset.offer}`, { method: 'PATCH', auth: true, body }), 'Avaliação atualizada.');
      };
    },
  });

  tabs.start();
}
