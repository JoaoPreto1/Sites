import { api, updateStoredUser } from '../api.js';
import { requireUser } from '../session.js';
import { escapeHtml, formatDate, img, money, plural, showFieldErrors, statusLabels, toast, todayIso } from '../utils.js';

const panels = Object.fromEntries([...document.querySelectorAll('[data-panel]')].map((el) => [el.dataset.panel, el]));
const tabs = document.querySelectorAll('[data-tab]');
const cancelDialog = document.querySelector('[data-cancel-dialog]');

let bookings = [];
let experiences = [];
const open = new Set();

function showTab(name) {
  tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.tab === name));
  Object.entries(panels).forEach(([key, panel]) => (panel.hidden = key !== name));
}

const isUpcoming = (b) => ['pendente', 'confirmada'].includes(b.status) && b.checkOut >= todayIso();

function priceBlock(booking) {
  const p = booking.price;
  return `
    <div class="price-lines">
      <div><span>Alojamento · ${plural(p.nights, 'noite', 'noites')}</span><span>${money(p.accommodation)}</span></div>
      <div><span>Limpeza</span><span>${money(p.cleaningFee)}</span></div>
      ${p.extras.map((e) => `<div><span>${escapeHtml(e.name)} × ${e.people}</span><span>${money(e.total)}</span></div>`).join('')}
      <div><span>Taxa turística</span><span>${money(p.touristTax)}</span></div>
      <div class="total"><span>Total</span><span>${money(p.total)}</span></div>
    </div>`;
}

function checkinBlock(booking) {
  if (booking.checkin) {
    return `
      <div class="checkin-done">
        <span class="badge badge--confirmada">Check-in feito</span>
        <span>Chegada prevista às <strong>${escapeHtml(booking.checkin.arrivalTime)}</strong></span>
        <span class="muted">${escapeHtml(booking.checkin.guestNames)}</span>
      </div>`;
  }

  if (booking.status !== 'confirmada') {
    return '<p class="muted">Fica disponível assim que a reserva for confirmada.</p>';
  }

  return `
    <form class="form-grid" data-checkin="${booking.code}" novalidate>
      <div class="field"><label>Hora de chegada</label><input class="input" name="arrivalTime" type="time" value="16:00"></div>
      <div class="field"><label>Telemóvel</label><input class="input" name="phone" type="tel" value="${escapeHtml(booking.guest.phone)}"></div>
      <div class="field"><label>Nomes dos hóspedes</label><textarea class="input" name="guestNames" rows="2" placeholder="Um nome por linha"></textarea></div>
      <button class="btn btn--sea btn--small" type="submit">Enviar check-in</button>
    </form>`;
}

function extrasBlock(booking) {
  if (!booking.cancellable) return '<p class="muted">Sem alterações possíveis.</p>';

  const people = booking.adults + booking.children;
  return `
    <form class="form-grid" data-extra="${booking.code}">
      <div class="field">
        <label>Experiência</label>
        <select class="select" name="experienceId">
          ${experiences.map((e) => `<option value="${e.id}">${escapeHtml(e.name)} · ${money(e.price)}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Pessoas</label>
        <select class="select" name="people">${Array.from({ length: people }, (_, i) => `<option ${i + 1 === people ? 'selected' : ''}>${i + 1}</option>`).join('')}</select>
      </div>
      <button class="btn btn--ghost btn--small" type="submit">Juntar à reserva</button>
    </form>`;
}

function bookingCard(booking) {
  const expanded = open.has(booking.code);
  const guests = `${plural(booking.adults, 'adulto', 'adultos')}${booking.children ? `, ${plural(booking.children, 'criança', 'crianças')}` : ''}`;

  return `
    <article class="booking">
      <div class="booking__summary">
        <img src="${img(booking.property.image, 480, 340)}" alt="">
        <div>
          <span class="badge badge--${booking.status}">${statusLabels[booking.status]}</span>
          <h3>${escapeHtml(booking.property.name)}</h3>
          <p class="booking__meta">${formatDate(booking.checkIn, { weekday: true })} → ${formatDate(booking.checkOut, { weekday: true })}</p>
          <p class="booking__meta">${guests} · Reserva ${booking.code}</p>
        </div>
        <div class="booking__side">
          <span class="booking__total">${money(booking.price.total)}</span>
          ${booking.status === 'cancelada' && booking.refund ? `<span class="muted">Reembolso de ${money(booking.refund)}</span>` : ''}
          <button class="btn btn--ghost btn--small" type="button" data-toggle="${booking.code}">${expanded ? 'Fechar' : 'Ver detalhes'}</button>
        </div>
      </div>
      ${
        expanded
          ? `
        <div class="booking__details">
          <div><h4>Pagamento</h4>${priceBlock(booking)}</div>
          <div><h4>Check-in online</h4>${checkinBlock(booking)}</div>
          <div>
            <h4>Experiências</h4>
            ${extrasBlock(booking)}
            ${booking.cancellable ? `<div class="booking__actions"><button class="btn btn--danger btn--small" type="button" data-cancel="${booking.code}">Cancelar reserva</button></div>` : ''}
          </div>
        </div>`
          : ''
      }
    </article>`;
}

function renderBookings() {
  const upcoming = bookings.filter(isUpcoming).sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const past = bookings.filter((b) => !isUpcoming(b));

  panels.proximas.innerHTML = upcoming.length
    ? `<div class="booking-list">${upcoming.map(bookingCard).join('')}</div>`
    : '<div class="empty"><h3>Ainda não tem estadias marcadas</h3><p><a class="link" href="/alojamentos">Escolher uma casa</a></p></div>';

  panels.anteriores.innerHTML = past.length
    ? `<div class="booking-list">${past.map(bookingCard).join('')}</div>`
    : '<div class="empty"><h3>Sem estadias anteriores</h3></div>';
}

function replaceBooking(updated) {
  bookings = bookings.map((b) => (b.code === updated.code ? updated : b));
  renderBookings();
}

function askToCancel(booking) {
  cancelDialog.querySelector('[data-cancel-text]').textContent = booking.freeCancellation
    ? `Ainda está dentro do prazo de cancelamento gratuito. O valor de ${money(booking.price.total)} é devolvido na totalidade.`
    : 'Faltam menos de 14 dias para a entrada, por isso o valor da reserva não é reembolsado.';
  cancelDialog.returnValue = '';
  cancelDialog.showModal();

  return new Promise((resolve) => cancelDialog.addEventListener('close', () => resolve(cancelDialog.returnValue === 'yes'), { once: true }));
}

document.querySelector('.account-page').addEventListener('click', async (event) => {
  const toggle = event.target.closest('[data-toggle]');
  if (toggle) {
    const code = toggle.dataset.toggle;
    open.has(code) ? open.delete(code) : open.add(code);
    return renderBookings();
  }

  const cancel = event.target.closest('[data-cancel]');
  if (cancel) {
    const booking = bookings.find((b) => b.code === cancel.dataset.cancel);
    if (!(await askToCancel(booking))) return;
    try {
      const { booking: updated } = await api(`/bookings/${booking.code}/cancel`, { method: 'POST', auth: true });
      replaceBooking(updated);
      toast('Reserva cancelada');
    } catch (error) {
      toast(error.message, 'error');
    }
  }
});

document.querySelector('.account-page').addEventListener('submit', async (event) => {
  const form = event.target;
  const code = form.dataset.checkin ?? form.dataset.extra;
  if (!code) return;
  event.preventDefault();

  const data = Object.fromEntries(new FormData(form));
  const isCheckin = Boolean(form.dataset.checkin);
  if (!isCheckin) data.people = Number(data.people);

  showFieldErrors(form);
  try {
    const { booking } = await api(`/bookings/${code}/${isCheckin ? 'checkin' : 'extras'}`, { method: 'POST', auth: true, body: data });
    replaceBooking(booking);
    toast(isCheckin ? 'Check-in enviado. Até breve!' : 'Experiência adicionada à reserva');
  } catch (error) {
    showFieldErrors(form, error.details);
    toast(error.message, 'error');
  }
});

function setupProfile(user) {
  const profile = document.querySelector('[data-profile]');
  const password = document.querySelector('[data-password]');
  profile.name.value = user.name;
  profile.email.value = user.email;
  profile.phone.value = user.phone ?? '';

  profile.addEventListener('submit', async (event) => {
    event.preventDefault();
    showFieldErrors(profile);
    try {
      const { user: updated } = await api('/auth/me', {
        method: 'PATCH',
        auth: true,
        body: { name: profile.name.value, phone: profile.phone.value },
      });
      updateStoredUser(updated);
      document.querySelector('[data-greeting]').innerHTML = `Olá, <em>${escapeHtml(updated.name.split(' ')[0])}.</em>`;
      toast('Dados guardados');
    } catch (error) {
      showFieldErrors(profile, error.details);
    }
  });

  password.addEventListener('submit', async (event) => {
    event.preventDefault();
    const error = password.querySelector('[data-error]');
    error.hidden = true;
    showFieldErrors(password);
    try {
      await api('/auth/me/password', { method: 'PATCH', auth: true, body: Object.fromEntries(new FormData(password)) });
      password.reset();
      toast('Palavra-passe alterada');
    } catch (err) {
      showFieldErrors(password, err.details);
      if (!err.details?.length) {
        error.textContent = err.message;
        error.hidden = false;
      }
    }
  });
}

async function init() {
  const user = await requireUser();
  if (!user) return;

  document.querySelector('[data-greeting]').innerHTML = `Olá, <em>${escapeHtml(user.name.split(' ')[0])}.</em>`;
  tabs.forEach((tab) => tab.addEventListener('click', () => showTab(tab.dataset.tab)));
  if (window.location.hash === '#perfil') showTab('perfil');
  setupProfile(user);

  try {
    [{ bookings }, { experiences }] = await Promise.all([api('/bookings/mine', { auth: true }), api('/experiences')]);
    const next = bookings.filter(isUpcoming).sort((a, b) => a.checkIn.localeCompare(b.checkIn))[0];
    if (next) open.add(next.code);
    renderBookings();
  } catch (error) {
    panels.proximas.innerHTML = `<p class="notice notice--error">${escapeHtml(error.message)}</p>`;
  }
}

window.addEventListener('hashchange', () => window.location.hash === '#perfil' && showTab('perfil'));
init();
