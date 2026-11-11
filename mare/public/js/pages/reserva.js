import { api } from '../api.js';
import { requireUser } from '../session.js';
import { escapeHtml, formatDate, img, money, params, plural, showFieldErrors } from '../utils.js';

const root = document.querySelector('[data-checkout]');
const query = params();

const stay = {
  checkIn: query.checkIn,
  checkOut: query.checkOut,
  adults: Number(query.adults) || 2,
  children: Number(query.children) || 0,
};

function priceLines(quote) {
  return `
    <div class="price-lines">
      <div><span>Alojamento · ${plural(quote.nights, 'noite', 'noites')}</span><span>${money(quote.accommodation)}</span></div>
      <div><span>Limpeza</span><span>${money(quote.cleaningFee)}</span></div>
      ${quote.extras.map((e) => `<div><span>${escapeHtml(e.name)} × ${e.people}</span><span>${money(e.total)}</span></div>`).join('')}
      <div><span>Taxa turística</span><span>${money(quote.touristTax)}</span></div>
      <div class="total"><span>Total</span><span>${money(quote.total)}</span></div>
    </div>`;
}

function render({ property, experiences, user }) {
  const totalGuests = stay.adults + stay.children;
  const peopleOptions = Array.from({ length: totalGuests }, (_, i) => i + 1)
    .map((n) => `<option value="${n}" ${n === totalGuests ? 'selected' : ''}>${plural(n, 'pessoa', 'pessoas')}</option>`)
    .join('');

  root.innerHTML = `
    <a class="checkout__back" href="/alojamentos/${property.slug}?checkIn=${stay.checkIn}&checkOut=${stay.checkOut}&guests=${totalGuests}">← Voltar à ${escapeHtml(property.name)}</a>
    <h1>Quase lá, <em>${escapeHtml(user.name.split(' ')[0])}.</em></h1>

    <div class="checkout__layout">
      <form data-form novalidate>
        <section class="step">
          <h2>A sua estadia</h2>
          <div class="stay-facts">
            <div><small>Entrada</small>${formatDate(stay.checkIn, { weekday: true })} · a partir das 16h</div>
            <div><small>Saída</small>${formatDate(stay.checkOut, { weekday: true })} · até às 11h</div>
            <div><small>Hóspedes</small>${plural(stay.adults, 'adulto', 'adultos')}${stay.children ? `, ${plural(stay.children, 'criança', 'crianças')}` : ''}</div>
          </div>
        </section>

        <section class="step">
          <h2>Junte experiências</h2>
          <p class="muted">Opcional. Pode juntar ou mudar mais tarde na sua área pessoal.</p>
          <div class="extras">
            ${experiences
              .map(
                (e) => `
              <label class="extra">
                <input type="checkbox" name="extra" value="${e.id}">
                <img src="${img(e.image, 200, 150)}" alt="" loading="lazy">
                <span><strong>${escapeHtml(e.name)}</strong><small>${e.duration} · ${money(e.price)} por pessoa</small></span>
                <select name="people-${e.id}" aria-label="Pessoas">${peopleOptions}</select>
              </label>`,
              )
              .join('')}
          </div>
        </section>

        <section class="step">
          <h2>Os seus dados</h2>
          <p class="muted">Usamos estes contactos para combinar a chegada.</p>
          <div class="form-grid form-grid--two">
            <div class="field">
              <label for="guest.name">Nome de quem fica na casa</label>
              <input class="input" id="guest.name" name="guest.name" value="${escapeHtml(user.name)}" autocomplete="name">
            </div>
            <div class="field">
              <label for="guest.phone">Telemóvel</label>
              <input class="input" id="guest.phone" name="guest.phone" type="tel" value="${escapeHtml(user.phone ?? '')}" autocomplete="tel">
            </div>
            <div class="field">
              <label for="email">Email</label>
              <input class="input" id="email" value="${escapeHtml(user.email)}" disabled>
            </div>
            <div class="field">
              <label for="notes">Pedidos especiais <span class="muted">(opcional)</span></label>
              <input class="input" id="notes" name="notes" placeholder="Berço, chegada tarde…">
            </div>
          </div>
        </section>

        <section class="step">
          <h2>Condições</h2>
          <div class="form-grid">
            <p class="policy">Cancelamento gratuito até 14 dias antes da entrada. Depois disso, o valor não é reembolsado. O pagamento só é pedido depois de confirmarmos a reserva, normalmente em menos de 24 horas.</p>
            <div class="field">
              <label class="terms"><input type="checkbox" name="acceptTerms"> Li e aceito as condições da reserva e a política de cancelamento.</label>
            </div>
            <p class="notice notice--error" data-error hidden></p>
          </div>
        </section>
      </form>

      <aside class="checkout__summary">
        <img src="${img(property.images[0], 840, 400)}" alt="${escapeHtml(property.name)}">
        <div class="checkout__summary-body">
          <h3>${escapeHtml(property.name)}</h3>
          <p class="muted">${escapeHtml(property.area)}, Lagos · ★ ${property.rating.toFixed(2)}</p>
          <div data-quote></div>
          <button class="btn btn--sea btn--block" type="button" data-submit>Pedir reserva</button>
          <p class="booking-note muted">Ainda não vai ser cobrado nada.</p>
        </div>
      </aside>
    </div>`;
}

function selectedExtras(form) {
  return [...form.querySelectorAll('input[name="extra"]:checked')].map((input) => ({
    experienceId: input.value,
    people: Number(form.elements[`people-${input.value}`].value),
  }));
}

function renderConfirmation(booking) {
  window.scrollTo({ top: 0 });
  root.innerHTML = `
    <section class="confirmation">
      <p class="eyebrow muted">Pedido enviado</p>
      <h1>Obrigado, <em>até já!</em></h1>
      <p class="muted">Recebemos o seu pedido para a ${escapeHtml(booking.property.name)}, de ${formatDate(booking.checkIn)} a ${formatDate(booking.checkOut)}. A Rita confirma a disponibilidade e envia os dados de pagamento em menos de 24 horas.</p>
      <div class="confirmation__code">${booking.code}</div>
      <p class="muted">Total: <strong>${money(booking.price.total)}</strong></p>
      <div class="confirmation__actions">
        <a class="btn" href="/conta">Ver as minhas reservas</a>
        <a class="btn btn--ghost" href="/regiao">Preparar a viagem</a>
      </div>
    </section>`;
}

async function init() {
  const user = await requireUser();
  if (!user) return;

  if (!query.casa || !stay.checkIn || !stay.checkOut) {
    window.location.replace('/alojamentos');
    return;
  }

  try {
    const [{ property }, { experiences }] = await Promise.all([api(`/properties/${encodeURIComponent(query.casa)}`), api('/experiences')]);
    render({ property, experiences, user });

    const form = root.querySelector('[data-form]');
    const quoteBox = root.querySelector('[data-quote]');
    const submit = root.querySelector('[data-submit]');
    const error = root.querySelector('[data-error]');
    const body = () => ({ propertyId: property.id, ...stay, extras: selectedExtras(form) });

    async function refreshQuote() {
      try {
        const { available, quote } = await api('/bookings/quote', { method: 'POST', body: body() });
        quoteBox.innerHTML = priceLines(quote);
        submit.disabled = !available;
        if (!available) quoteBox.insertAdjacentHTML('beforeend', '<p class="notice notice--error">Estas datas já não estão livres.</p>');
      } catch (err) {
        quoteBox.innerHTML = `<p class="notice notice--error">${escapeHtml(err.message)}</p>`;
        submit.disabled = true;
      }
    }

    form.addEventListener('change', (event) => {
      if (event.target.name === 'extra' || event.target.name?.startsWith('people-')) refreshQuote();
    });

    submit.addEventListener('click', async () => {
      error.hidden = true;
      showFieldErrors(form);
      submit.disabled = true;

      try {
        const { booking } = await api('/bookings', {
          method: 'POST',
          auth: true,
          body: {
            ...body(),
            guest: { name: form.elements['guest.name'].value, phone: form.elements['guest.phone'].value },
            notes: form.notes.value || undefined,
            acceptTerms: form.acceptTerms.checked,
          },
        });
        renderConfirmation(booking);
      } catch (err) {
        showFieldErrors(form, err.details);
        error.textContent = err.details?.length ? 'Reveja os campos assinalados.' : err.message;
        error.hidden = false;
        submit.disabled = false;
      }
    });

    refreshQuote();
  } catch {
    root.innerHTML = '<div class="empty"><h3>Não foi possível preparar a reserva</h3><p><a class="link" href="/alojamentos">Voltar aos alojamentos</a></p></div>';
  }
}

init();
