import { api } from '../api.js';
import { bagItems, clearBag, removeFromBag, setQuantity } from '../bag.js';
import { currentUser, loginUrl } from '../session.js';
import { cover, escapeHtml, money } from '../shared/format.js';
import { formValues, showFieldErrors, submitting } from '../utils.js';

const root = document.querySelector('[data-bag]');
const lines = root.querySelector('[data-lines]');
const ticket = root.querySelector('[data-ticket]');
const form = root.querySelector('[data-checkout]');
const errorBox = root.querySelector('[data-checkout-error]');
const submit = root.querySelector('[data-checkout-submit]');
const user = currentUser();

const method = () => form.method.value;

function fillAddress() {
  if (!user) return;
  form.address.value ||= user.address ?? '';
  form.postalCode.value ||= user.postalCode ?? '';
  form.city.value ||= user.city ?? '';
}

async function render() {
  const items = bagItems();
  if (!items.length) {
    ticket.hidden = true;
    lines.innerHTML = `<div class="bag__empty"><h2>O saco está vazio.</h2><p>Os caixotes estão cheios. Ouve uns quantos antes de escolher.</p><a class="btn" href="/discos">Ir aos caixotes</a></div>`;
    return;
  }

  const quote = await api('/encomendas/orcamento', { method: 'POST', body: { items, method: method() } });
  const problem = Object.fromEntries(quote.problems.map((p) => [p.recordId, p.message]));

  lines.innerHTML = quote.lines
    .map(
      ({ record, quantity, available }) => `
      <article class="line">
        <img src="${cover(record, 200)}" width="96" height="96" alt="">
        <div>
          <h2><a href="/discos/${record.id}">${escapeHtml(record.title)}</a></h2>
          <p>${escapeHtml(record.artist)}</p>
          <p class="mono">${record.year} · ${escapeHtml(record.pressing)} · ${record.media}</p>
          ${problem[record.id] ? `<p class="mono line__warn">${escapeHtml(problem[record.id])}</p>` : ''}
        </div>
        <div class="qty"><button type="button" data-dec="${record.id}" aria-label="Menos um">−</button><span>${quantity}</span><button type="button" data-inc="${record.id}" aria-label="Mais um"${quantity >= available ? ' disabled' : ''}>+</button></div>
        <div class="line__end"><b>${money(record.price * quantity)}</b><button class="line__remove" type="button" data-remove="${record.id}">Tirar</button></div>
      </article>`,
    )
    .join('');

  const missing = quote.freeShippingFrom - quote.subtotal;
  root.querySelector('[data-totals]').innerHTML = `
    <div><dt>Discos</dt><dd>${money(quote.subtotal)}</dd></div>
    <div><dt>Envio</dt><dd>${quote.shipping ? money(quote.shipping) : 'grátis'}</dd></div>
    ${method() === 'envio' && missing > 0 ? `<div class="is-hint"><dt>Faltam ${money(missing)} para o envio grátis</dt></div>` : ''}
    <div class="is-total"><dt>Total</dt><dd>${money(quote.total)}</dd></div>`;
  ticket.hidden = false;
  root.querySelector('[data-address]').hidden = method() !== 'envio';
  submit.textContent = user ? `Encomendar · ${money(quote.total)}` : 'Entrar para encomendar';
}

lines.addEventListener('click', (event) => {
  const target = event.target.closest('button');
  if (!target) return;
  const items = bagItems();
  const find = (id) => items.find((i) => i.recordId === id);
  if (target.dataset.inc) setQuantity(target.dataset.inc, find(target.dataset.inc).quantity + 1);
  if (target.dataset.dec) setQuantity(target.dataset.dec, find(target.dataset.dec).quantity - 1);
  if (target.dataset.remove) removeFromBag(target.dataset.remove);
  render();
});

form.addEventListener('change', (event) => {
  if (event.target.name === 'method') render();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!user) {
    location.href = loginUrl('/saco');
    return;
  }
  errorBox.hidden = true;
  const values = formValues(form);
  const body = { items: bagItems(), method: values.method, notes: values.notes || undefined };
  if (values.method === 'envio') Object.assign(body, { address: values.address, postalCode: values.postalCode, city: values.city });

  await submitting(submit, async () => {
    try {
      const { order } = await api('/encomendas', { method: 'POST', auth: true, body });
      clearBag();
      root.querySelector('.bag__grid').hidden = true;
      const done = root.querySelector('[data-done]');
      done.hidden = false;
      done.innerHTML = `
        <span class="disc" style="--label:var(--led)"><span></span></span>
        <h2>Encomenda n.º ${order.number}</h2>
        <p>${order.method === 'envio' ? 'Embrulhamos os discos entre cartões e seguem amanhã.' : 'Ficam à tua espera no balcão a partir de amanhã.'} Os discos já estão na tua discoteca: podes pô-los a tocar na conta.</p>
        <a class="btn" href="/conta">Ir para a minha discoteca</a>`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      showFieldErrors(form, error.details);
      if (!error.details?.length || error.status === 409) {
        errorBox.textContent = error.message;
        errorBox.hidden = false;
        render();
      }
    }
  });
});

fillAddress();
render().catch(() => {
  lines.innerHTML = '<p class="empty">Não deu para abrir o saco. Tenta recarregar a página.</p>';
});
