import { api } from '../api.js';
import { createCalendar } from '../calendar.js';
import { linkDateInputs } from '../date-range.js';
import { amenityIcon, icon } from '../icons.js';
import { addDays, escapeHtml, formatDate, img, initials, money, params, plural, propertyCard, tagLabels, todayIso } from '../utils.js';

const root = document.querySelector('[data-property]');
const slug = decodeURIComponent(window.location.pathname.split('/')[2] ?? '');
const query = params();

const options = (from, to, selected) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i)
    .map((n) => `<option value="${n}" ${n === selected ? 'selected' : ''}>${n}</option>`)
    .join('');

const monthDay = (value) => formatDate(`2000-${value}`, { year: false });

function seasonRows(property) {
  const names = [...new Set(property.seasons.map((s) => s.name))];
  const rows = names.map((name) => {
    const periods = property.seasons.filter((s) => s.name === name);
    const when = periods.map((s) => `${monthDay(s.from)} a ${monthDay(s.to)}`).join(' e ');
    return [`${name} <span class="muted">· ${when}</span>`, periods[0].price];
  });
  rows.push(['Resto do ano', property.pricePerNight]);
  return rows.map(([name, price]) => `<tr><td>${name}</td><td>${money(price)}</td></tr>`).join('');
}

function highlights(property) {
  const items = property.tags.map((tag) => [tag === 'piscina' ? 'pool' : tag === 'vista-mar' ? 'wave' : 'heart', tagLabels[tag]]);
  items.push(['calendar', 'Cancelamento grátis até 14 dias'], ['key', 'Entrada autónoma']);
  return items.map(([name, label]) => `<span class="highlight">${icon(name, 16)} ${label}</span>`).join('');
}

const rules = [
  ['clock', 'Check-in', 'A partir das 16h'],
  ['clock', 'Check-out', 'Até às 11h'],
  ['moon', 'Silêncio', 'Entre as 23h e as 8h'],
  ['heart', 'Animais', 'Só com pedido prévio'],
  ['flame', 'Fumar', 'Só no exterior'],
  ['users', 'Festas', 'Não são permitidas'],
];

function render(property) {
  document.title = `${property.name} · Maré`;
  const adults = Math.min(Number(query.guests) || 2, property.guests);
  const photos = property.images.slice(0, 5);

  root.innerHTML = `
    <nav class="crumbs"><a href="/">Início</a> / <a href="/alojamentos">Alojamentos</a> / <span>${escapeHtml(property.name)}</span></nav>

    <header class="property__head">
      <div>
        <p class="property__area">${icon('pin', 16)} ${escapeHtml(property.area)}, Lagos</p>
        <h1>${escapeHtml(property.name)}</h1>
        <p class="property__tagline">${escapeHtml(property.tagline)}</p>
      </div>
      <div class="property__score">
        <strong>${icon('star', 20)} ${property.rating.toFixed(2)}</strong>
        <a href="#avaliacoes">${plural(property.reviewsCount, 'avaliação', 'avaliações')}</a>
      </div>
    </header>

    <div class="gallery gallery--${photos.length}">
      ${photos
        .map((url, i) => `<button type="button" data-photo="${i}"><img src="${img(url, i === 0 ? 1400 : 700, i === 0 ? 1000 : 520)}" alt="${escapeHtml(property.name)}, fotografia ${i + 1}"></button>`)
        .join('')}
      <button class="btn btn--light btn--small gallery__all" type="button" data-photo="0">${icon('area', 16)} Ver as ${property.images.length} fotografias</button>
    </div>

    <div class="highlights">${highlights(property)}</div>

    <div class="property__body">
      <div class="property__main">
        <section>
          <div class="facts">
            <div>${icon('bed', 22)}<strong>${property.bedrooms}</strong><span>${property.bedrooms === 1 ? 'quarto' : 'quartos'}</span></div>
            <div>${icon('bath', 22)}<strong>${property.bathrooms}</strong><span>${property.bathrooms === 1 ? 'casa de banho' : 'casas de banho'}</span></div>
            <div>${icon('users', 22)}<strong>${property.guests}</strong><span>hóspedes</span></div>
            <div>${icon('area', 22)}<strong>${property.size} m²</strong><span>de área</span></div>
          </div>
          <h2>Sobre a casa</h2>
          <p class="property__description">${escapeHtml(property.description)}</p>
        </section>

        <section>
          <h2>O que tem</h2>
          <ul class="amenities">${property.amenities.map((item) => `<li>${icon(amenityIcon(item), 20)} ${escapeHtml(item)}</li>`).join('')}</ul>
        </section>

        <section id="disponibilidade">
          <h2>Disponibilidade</h2>
          <p class="muted section-note">Escolha a data de entrada e depois a de saída. Os dias riscados já estão ocupados.</p>
          <div class="cal" data-calendar><p class="muted">A carregar o calendário…</p></div>
        </section>

        <section>
          <h2>Preço por noite</h2>
          <div class="table-wrap">
            <table class="table seasons">
              <thead><tr><th>Época</th><th>Por noite</th></tr></thead>
              <tbody>${seasonRows(property)}</tbody>
            </table>
          </div>
          <p class="muted section-note">Limpeza final: ${money(property.cleaningFee)} · Estadia mínima: ${property.minNights} noites · Taxa turística municipal: 1,50 € por adulto/noite (máx. 7 noites)</p>
        </section>

        <section>
          <h2>Regras da casa</h2>
          <ul class="rules">${rules.map(([name, title, text]) => `<li>${icon(name, 20)}<span><strong>${title}</strong>${text}</span></li>`).join('')}</ul>
        </section>

        <section id="avaliacoes">
          <h2>${icon('star', 26)} ${property.rating.toFixed(2)} · ${plural(property.reviewsCount, 'avaliação', 'avaliações')}</h2>
          <div class="score-bars">
            ${[['Limpeza', 4.9], ['Localização', 5], ['Comunicação', 5], ['Relação qualidade/preço', 4.8]]
              .map(([label, value]) => `<div><span>${label}</span><i><b style-width="${value}"></b></i><span>${value.toFixed(1)}</span></div>`)
              .join('')}
          </div>
          <div class="reviews">
            ${property.reviews
              .map(
                (review) => `
              <article class="review">
                <header>
                  <span class="avatar">${initials(review.author)}</span>
                  <div><strong>${escapeHtml(review.author)}</strong><small>${escapeHtml(review.from)} · ${formatDate(`${review.date}-01`).split(' ').slice(1).join(' ')}</small></div>
                </header>
                <p>${escapeHtml(review.text)}</p>
              </article>`,
              )
              .join('')}
          </div>
        </section>

        <section>
          <h2>Onde fica</h2>
          <div class="location">
            <div class="location__map">
              <img src="${img('https://images.unsplash.com/photo-1759783640223-a893fa1e7e1b', 900, 600)}" alt="Vista aérea da costa de Lagos" loading="lazy">
              <span class="location__pin">${icon('pin', 18)} ${escapeHtml(property.area)}</span>
            </div>
            <div>
              <p class="muted">A morada exata é enviada depois da reserva confirmada.</p>
              <ul class="nearby">${property.nearby.map((n) => `<li><span>${escapeHtml(n.place)}</span><span>${escapeHtml(n.distance)}</span></li>`).join('')}</ul>
            </div>
          </div>
        </section>

        <section>
          <div class="host">
            <span class="avatar host__avatar">RM</span>
            <div class="host__text">
              <h3>A sua anfitriã é a Rita</h3>
              <p class="muted">Nasceu em Lagos e cuida pessoalmente de cada casa. Vai recebê-lo com dicas de praias, restaurantes e o melhor sítio para ver o pôr do sol.</p>
              <ul class="host__stats">
                <li><strong>12</strong> anos a receber</li>
                <li><strong>&lt;1h</strong> tempo de resposta</li>
                <li><strong>4.9</strong> avaliação média</li>
              </ul>
            </div>
            <a class="btn btn--ghost" href="/contactos">${icon('chat', 18)} Falar com a Rita</a>
          </div>
        </section>
      </div>

      <aside class="booking-box" id="reservar">
        <form data-booking>
          <div class="booking-box__price"><span><strong>${money(property.pricePerNight)}</strong> / noite</span><small>${icon('star', 14)} ${property.rating.toFixed(2)}</small></div>
          <div class="booking-box__fields">
            <div class="field"><label for="checkIn">Check-in</label><input id="checkIn" name="checkIn" type="date" required></div>
            <div class="field"><label for="checkOut">Check-out</label><input id="checkOut" name="checkOut" type="date" required></div>
            <div class="field"><label for="adults">Adultos</label><select id="adults" name="adults">${options(1, property.guests, adults)}</select></div>
            <div class="field"><label for="children">Crianças</label><select id="children" name="children">${options(0, property.guests - 1, 0)}</select></div>
          </div>
          <div class="booking-box__quote" data-quote><p class="muted">Escolha as datas para ver o preço total. Estadia mínima de ${property.minNights} noites.</p></div>
          <button class="btn btn--sea btn--block" type="submit" data-book disabled>Reservar</button>
          <p class="booking-box__note">Ainda não vai ser cobrado nada.</p>
          <ul class="booking-box__perks">
            <li>${icon('check', 16)} Cancelamento grátis até 14 dias antes</li>
            <li>${icon('check', 16)} Melhor preço garantido ao reservar direto</li>
            <li>${icon('check', 16)} Pagamento por Multibanco, MB Way ou cartão</li>
          </ul>
        </form>
      </aside>
    </div>

    <section class="more-homes">
      <div class="section-head">
        <h2>Também pode <em>gostar.</em></h2>
        <a class="link" href="/alojamentos">Ver todas as casas</a>
      </div>
      <div class="property-grid" data-more></div>
    </section>

    <div class="mobile-book">
      <div><strong>${money(property.pricePerNight)}</strong> / noite<small>${icon('star', 12)} ${property.rating.toFixed(2)} · mín. ${property.minNights} noites</small></div>
      <a class="btn btn--sea" href="#reservar">Ver datas</a>
    </div>`;

  root.querySelectorAll('[style-width]').forEach((bar) => (bar.style.width = `${(Number(bar.getAttribute('style-width')) / 5) * 100}%`));
}

function setupGallery(property) {
  const dialog = document.querySelector('[data-lightbox]');
  const image = dialog.querySelector('img');
  const count = dialog.querySelector('.lightbox__count');
  let index = 0;

  const show = (i) => {
    index = (i + property.images.length) % property.images.length;
    image.src = img(property.images[index], 1600);
    image.alt = `${property.name}, fotografia ${index + 1}`;
    count.textContent = `${index + 1} / ${property.images.length}`;
  };

  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-photo]');
    if (!button) return;
    show(Number(button.dataset.photo));
    dialog.showModal();
  });

  dialog.addEventListener('click', (event) => {
    if (event.target.closest('[data-close]') || event.target === dialog) dialog.close();
    const step = event.target.closest('[data-step]');
    if (step) show(index + Number(step.dataset.step));
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') show(index + 1);
    if (event.key === 'ArrowLeft') show(index - 1);
  });
}

function quoteMarkup(quote) {
  const nightlyAverage = quote.accommodation / quote.nights;
  return `
    <div class="price-lines">
      <div><span>${money(Math.round(nightlyAverage))} × ${plural(quote.nights, 'noite', 'noites')}</span><span>${money(quote.accommodation)}</span></div>
      <div><span>Limpeza</span><span>${money(quote.cleaningFee)}</span></div>
      <div><span>Taxa turística</span><span>${money(quote.touristTax)}</span></div>
      <div class="total"><span>Total</span><span>${money(quote.total)}</span></div>
    </div>`;
}

function setupBooking(property, calendar) {
  const form = root.querySelector('[data-booking]');
  const quoteBox = root.querySelector('[data-quote]');
  const bookButton = root.querySelector('[data-book]');
  let requestId = 0;

  linkDateInputs(form.checkIn, form.checkOut, { minNights: property.minNights });

  async function updateQuote() {
    const { checkIn, checkOut } = form;
    bookButton.disabled = true;
    if (!checkIn.value || !checkOut.value) {
      quoteBox.innerHTML = `<p class="muted">Escolha as datas para ver o preço total. Estadia mínima de ${property.minNights} noites.</p>`;
      return;
    }

    const current = ++requestId;
    quoteBox.innerHTML = '<p class="muted">A calcular…</p>';

    try {
      const { available, quote } = await api('/bookings/quote', {
        method: 'POST',
        body: {
          propertyId: property.id,
          checkIn: checkIn.value,
          checkOut: checkOut.value,
          adults: Number(form.adults.value),
          children: Number(form.children.value),
        },
      });
      if (current !== requestId) return;

      if (!available) {
        quoteBox.innerHTML = '<p class="notice notice--error">A casa já está ocupada em parte destas datas. Veja o calendário.</p>';
        return;
      }
      quoteBox.innerHTML = quoteMarkup(quote);
      bookButton.disabled = false;
    } catch (error) {
      if (current === requestId) quoteBox.innerHTML = `<p class="notice notice--error">${escapeHtml(error.message)}</p>`;
    }
  }

  form.addEventListener('change', (event) => {
    if (['checkIn', 'checkOut'].includes(event.target.name)) calendar?.setRange(form.checkIn.value, form.checkOut.value);
    updateQuote();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const next = new URLSearchParams({
      casa: property.slug,
      checkIn: form.checkIn.value,
      checkOut: form.checkOut.value,
      adults: form.adults.value,
      children: form.children.value,
    });
    window.location.href = `/reserva?${next}`;
  });

  return {
    setDates(checkIn, checkOut) {
      form.checkIn.value = checkIn;
      form.checkOut.value = checkOut;
      updateQuote();
    },
  };
}

async function loadMoreHomes(property) {
  const target = root.querySelector('[data-more]');
  try {
    const { properties } = await api('/properties');
    const others = properties.filter((p) => p.slug !== property.slug);
    const similar = [...others.filter((p) => p.tags.some((t) => property.tags.includes(t))), ...others].filter((p, i, list) => list.indexOf(p) === i);
    target.innerHTML = similar.slice(0, 3).map((p) => propertyCard(p)).join('');
  } catch {
    target.closest('section').remove();
  }
}

async function init() {
  try {
    const { property } = await api(`/properties/${encodeURIComponent(slug)}`);
    render(property);
    setupGallery(property);
    loadMoreHomes(property);

    let booking;
    const { nights } = await api(`/properties/${property.slug}/calendar?from=${todayIso()}&to=${addDays(todayIso(), 365)}`);
    const calendar = createCalendar(root.querySelector('[data-calendar]'), {
      nights,
      onSelect: (checkIn, checkOut) => booking.setDates(checkIn, checkOut),
    });
    booking = setupBooking(property, calendar);

    if (query.checkIn && query.checkOut) {
      calendar.setRange(query.checkIn, query.checkOut);
      booking.setDates(query.checkIn, query.checkOut);
    }
  } catch (error) {
    root.innerHTML = `
      <div class="empty">
        <h3>${error.status === 404 ? 'Esta casa não existe' : 'Não foi possível abrir esta casa'}</h3>
        <p><a class="link" href="/alojamentos">Ver todos os alojamentos</a></p>
      </div>`;
  }
}

init();
