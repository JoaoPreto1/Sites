import { api, updateStoredUser } from '../api.js';
import { setupQuickPlay } from '../miniplayer.js';
import * as player from '../player.js';
import { logout, requireUser } from '../session.js';
import { cover, escapeHtml, hour, longDate, money, price, shortDate } from '../shared/format.js';
import { icons } from '../shared/icons.js';
import { setupTabs } from '../tabs.js';
import { formValues, showFieldErrors, submitting, toast } from '../utils.js';

const user = await requireUser();
let owned = [];

if (user) {
  document.querySelector('[data-hello]').textContent = `Olá, ${user.name.split(' ')[0]}.`;
  document.querySelectorAll('[data-logout]').forEach((b) => b.addEventListener('click', logout));
  setupQuickPlay((id) => owned.find((r) => r.id === id));

  const STATUS = { paga: 'Paga', pronta: 'Pronta a levantar', enviada: 'Enviada', entregue: 'Entregue', cancelada: 'Cancelada', confirmada: 'Confirmada', aberto: 'À procura', encontrado: 'Encontrado', fechado: 'Retirado' };
  const status = (s) => `<span class="status status--${s}">${STATUS[s] ?? s}</span>`;

  const tabs = setupTabs({
    // A discoteca: os discos que já compraste, prontos a tocar no teu gira-discos
    async discoteca(panel) {
      const box = panel.querySelector('[data-library]');
      ({ records: owned } = await api('/discoteca', { auth: true }));
      if (!owned.length) {
        box.innerHTML = `<p class="empty">Ainda não tens discos. Quando comprares, aparecem aqui e podes pô-los a tocar.</p><a class="btn" href="/discos">Ir aos caixotes</a>`;
        return;
      }
      const full = owned.some((r) => r.tracks.some((t) => t.hasFull));
      box.innerHTML = `
        <div class="library__head">
          <p>${owned.length} ${owned.length === 1 ? 'disco' : 'discos'} na tua discoteca. ${
            full ? 'Os que a loja já tem em ficheiro tocam inteiros.' : 'Por agora ouves as pré-escutas; as faixas completas aparecem aqui quando a loja as tiver com licença.'
          }</p>
          <button class="btn" type="button" data-open-deck>${icons.play} Abrir no meu gira-discos</button>
        </div>
        <div class="records-grid">${owned
          .map(
            (r) => `
          <article class="record-card">
            <div class="sleeve" style="--label:${r.color}">
              <span class="sleeve__vinyl" aria-hidden="true"></span>
              <img class="sleeve__cover" src="${cover(r, 300)}" width="300" height="300" alt="Capa de ${escapeHtml(r.title)}" loading="lazy">
              <button class="record-card__play" type="button" data-play="${r.id}" aria-pressed="false" aria-label="Ouvir ${escapeHtml(r.title)}">${icons.play}${icons.pause}</button>
            </div>
            <h3><a href="/discos/${r.id}">${escapeHtml(r.artist)}</a></h3>
            <p>${escapeHtml(r.title)}</p>
          </article>`,
          )
          .join('')}</div>`;

      box.querySelector('[data-open-deck]').addEventListener('click', async (event) => {
        event.currentTarget.hidden = true;
        player.prepare();
        const holder = panel.querySelector('[data-shelf-deck]');
        holder.hidden = false;
        const deckEl = holder.querySelector('[data-deck]');
        const tip = holder.querySelector('[data-tip]');
        const { createDeck } = await import('../deck/index.js');
        const crates = [...new Map(owned.map((r) => [r.crate, { slug: r.crate, name: r.crateName }])).values()];
        const deck = createDeck(deckEl, {
          records: owned,
          crates,
          onHover(info) {
            tip.hidden = !info;
            if (!info) return;
            tip.style.left = `${info.x}px`;
            tip.style.top = `${info.y}px`;
            tip.innerHTML = `<b>${escapeHtml(info.record.title)}</b>${escapeHtml(info.record.artist)}<small>${info.onDeck ? 'Clica para pausar' : info.selected ? 'Clica para tocar' : 'Clica para levantar'}</small>`;
          },
          onBusy: (on) => (holder.querySelector('[data-busy]').hidden = !on),
        });
        deckEl.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight') deck.next();
          else if (e.key === 'ArrowLeft') deck.prev();
          else if (e.key === 'Enter') deck.play();
          else if (e.key === ' ') player.toggle();
          else return;
          e.preventDefault();
        });
        holder.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    },

    async encomendas(panel) {
      const { orders } = await api('/encomendas', { auth: true });
      panel.innerHTML = orders.length
        ? `<div class="panel-grid">${orders
            .map(
              (o) => `
          <article class="box item-card">
            <div class="item-card__head"><h3>Encomenda n.º ${o.number}</h3>${status(o.status)}</div>
            <p class="mono">${shortDate(o.createdAt)} · ${o.method === 'envio' ? 'envio para casa' : 'levantar na loja'}</p>
            <p>${o.items.map((i) => `${escapeHtml(i.artist)} — ${escapeHtml(i.title)}${i.quantity > 1 ? ` × ${i.quantity}` : ''}`).join('<br>')}</p>
            <p class="mono">Total ${money(o.total)}</p>
          </article>`,
            )
            .join('')}</div>`
        : `<p class="empty">Ainda não fizeste nenhuma encomenda.</p><a class="btn" href="/discos">Ir aos caixotes</a>`;
    },

    async salas(panel) {
      const { bookings } = await api('/salas/reservas', { auth: true });
      panel.innerHTML = bookings.length
        ? `<div class="panel-grid">${bookings
            .map(
              (b) => `
          <article class="box item-card">
            <div class="item-card__head"><h3>${escapeHtml(b.room)}</h3>${status(b.status)}</div>
            <p>${longDate(b.date)}, ${hour(b.start)}–${hour(b.start + b.hours)}</p>
            <p class="mono">${escapeHtml(b.band)} · ${price(b.total)}${b.extras.length ? ` · ${b.extras.join(', ')}` : ''}</p>
            ${b.canCancel ? `<div class="item-card__actions"><button class="btn btn--line btn--small" type="button" data-cancel="${b.id}">Cancelar</button></div>` : ''}
          </article>`,
            )
            .join('')}</div><p style="margin-top:24px"><a class="btn" href="/salas">Marcar outra sala</a></p>`
        : `<p class="empty">Ainda não marcaste nenhuma sala.</p><a class="btn" href="/salas">Marcar uma sala</a>`;

      panel.onclick = async (event) => {
        const button = event.target.closest('[data-cancel]');
        if (!button || !confirm('Cancelar esta marcação?')) return;
        try {
          await api(`/salas/reservas/${button.dataset.cancel}`, { method: 'DELETE', auth: true });
          toast('Marcação cancelada.');
          tabs.reload('salas');
        } catch (error) {
          toast(error.message, { type: 'error' });
        }
      };
    },

    async procura(panel) {
      const { wants } = await api('/procura/minha', { auth: true });
      const open = wants.filter((w) => w.status !== 'fechado');
      panel.innerHTML = open.length
        ? `<div class="panel-grid">${open
            .map(
              (w) => `
          <article class="box item-card">
            <div class="item-card__head"><h3>${escapeHtml(w.artist)} — ${escapeHtml(w.title)}</h3>${status(w.status)}</div>
            <p class="mono">${w.minGrade} ou melhor · até ${w.maxPrice} € · desde ${shortDate(w.createdAt)}</p>
            ${w.status === 'encontrado' ? `<p>Apareceu! Está guardado com o teu nome até ${longDate(w.holdUntil)}. <a href="/discos/${w.recordId}">Ver o disco</a></p>` : ''}
            <div class="item-card__actions"><button class="btn btn--line btn--small" type="button" data-remove="${w.id}">Tirar da parede</button></div>
          </article>`,
            )
            .join('')}</div><p style="margin-top:24px"><a class="btn btn--yellow" href="/procura">Ir à parede</a></p>`
        : `<p class="empty">Não tens nenhum disco na parede.</p><a class="btn btn--yellow" href="/procura">Pendurar um</a>`;

      panel.onclick = async (event) => {
        const button = event.target.closest('[data-remove]');
        if (!button) return;
        await api(`/procura/${button.dataset.remove}`, { method: 'DELETE', auth: true });
        toast('Tirado da parede.');
        tabs.reload('procura');
      };
    },

    async dados(panel) {
      const { user: me } = await api('/auth/me', { auth: true });
      const field = (name, label, value = '', attrs = '') => `<label class="field"><span>${label}</span><input class="input" name="${name}" value="${escapeHtml(value ?? '')}" ${attrs}></label>`;
      panel.innerHTML = `
        <div class="profile">
          <form class="box" data-profile novalidate>
            <h2>Os teus dados</h2>
            ${field('name', 'Nome', me.name, 'autocomplete="name"')}
            <p class="mono">${escapeHtml(me.email)}</p>
            ${field('phone', 'Telemóvel', me.phone, 'type="tel" autocomplete="tel"')}
            ${field('band', 'Banda', me.band, 'maxlength="60"')}
            ${field('address', 'Morada', me.address, 'autocomplete="street-address"')}
            ${field('postalCode', 'Código postal', me.postalCode, 'placeholder="0000-000" inputmode="numeric"')}
            ${field('city', 'Localidade', me.city, 'autocomplete="address-level2"')}
            <button class="btn" type="submit">Guardar</button>
          </form>
          <form class="box" data-password novalidate>
            <h2>Palavra-passe</h2>
            ${field('currentPassword', 'Atual', '', 'type="password" autocomplete="current-password"')}
            ${field('newPassword', 'Nova', '', 'type="password" autocomplete="new-password" minlength="8"')}
            <button class="btn btn--line" type="submit">Mudar</button>
          </form>
        </div>`;

      const profile = panel.querySelector('[data-profile]');
      profile.addEventListener('submit', async (event) => {
        event.preventDefault();
        const values = Object.fromEntries(Object.entries(formValues(profile)).filter(([, v]) => v !== ''));
        await submitting(profile.querySelector('button'), async () => {
          try {
            const { user: updated } = await api('/auth/me', { method: 'PATCH', auth: true, body: values });
            updateStoredUser(updated);
            showFieldErrors(profile, []);
            toast('Dados guardados.');
          } catch (error) {
            showFieldErrors(profile, error.details);
          }
        });
      });

      const pass = panel.querySelector('[data-password]');
      pass.addEventListener('submit', async (event) => {
        event.preventDefault();
        await submitting(pass.querySelector('button'), async () => {
          try {
            await api('/auth/me/password', { method: 'PATCH', auth: true, body: formValues(pass) });
            pass.reset();
            showFieldErrors(pass, []);
            toast('Palavra-passe mudada.');
          } catch (error) {
            showFieldErrors(pass, error.details);
            if (!error.details?.length) toast(error.message, { type: 'error' });
          }
        });
      });
    },
  });

  tabs.start();
}
