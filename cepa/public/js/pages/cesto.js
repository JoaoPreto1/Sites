import { api } from '../api.js';
import { cartItems, clearCart, removeFromCart, setQuantity } from '../cart.js';
import { currentUser, loginUrl } from '../session.js';
import { bottle } from '../shared/bottle.js';
import { escapeHtml, money, vintage } from '../shared/format.js';
import { showFieldErrors, submitting } from '../utils.js';

const lines = document.querySelector('[data-lines]');
const receipt = document.querySelector('[data-receipt]');
const totals = document.querySelector('[data-totals]');
const form = document.querySelector('[data-checkout]');
const errorBox = document.querySelector('[data-checkout-error]');
const done = document.querySelector('[data-done]');
const user = currentUser();
let wines = {};

const method = () => form.method.value;

function renderLines(items) {
  if (!items.length) {
    receipt.hidden = true;
    lines.innerHTML = '<p class="empty">O cesto está vazio. <a href="/carta">Abrir a carta</a> ou <a href="/">pedir uma sugestão para o jantar</a>.</p>';
    return;
  }

  receipt.hidden = false;
  lines.innerHTML = items
    .map(({ wineId, quantity }) => {
      const wine = wines[wineId];
      if (!wine) return '';
      return `
      <article class="cart-line">
        <a href="/carta/${wine.slug}" tabindex="-1">${bottle(wine, { title: false })}</a>
        <div>
          <h2><a href="/carta/${wine.slug}">${escapeHtml(wine.name)} <em>${vintage(wine)}</em></a></h2>
          <p>${escapeHtml(wine.producer.name)} · ${money(wine.price)} a garrafa</p>
          <button class="cart-line__remove" type="button" data-remove="${wineId}">Tirar do cesto</button>
        </div>
        <div class="qty">
          <button type="button" data-change="${wineId}" data-step="-1" aria-label="Menos uma garrafa de ${escapeHtml(wine.name)}">−</button>
          <span aria-live="polite">${quantity}</span>
          <button type="button" data-change="${wineId}" data-step="1" aria-label="Mais uma garrafa de ${escapeHtml(wine.name)}">+</button>
        </div>
        <span class="cart-line__total">${money(wine.price * quantity)}</span>
      </article>`;
    })
    .join('');
}

async function renderTotals(items) {
  if (!items.length) return;
  try {
    const quote = await api('/orders/quote', { method: 'POST', auth: Boolean(user), body: { items, method: method() } });
    const missing = quote.shipping > 0 ? 60 - (quote.subtotal - quote.discount) : 0;
    totals.innerHTML = `
      <div><dt>${items.reduce((s, i) => s + i.quantity, 0)} garrafas</dt><dd>${money(quote.subtotal)}</dd></div>
      ${quote.discount ? `<div class="is-discount"><dt>Desconto de sócio (${quote.discountPercent}%)</dt><dd>−${money(quote.discount)}</dd></div>` : ''}
      <div><dt>${method() === 'loja' ? 'Levantamento na loja' : 'Envio'}</dt><dd>${quote.shipping ? money(quote.shipping) : 'grátis'}</dd></div>
      <div class="is-total"><dt>Total</dt><dd>${money(quote.total)}</dd></div>
      ${missing > 0 ? `<p class="receipt__hint">Faltam ${money(missing)} para o envio ser grátis.</p>` : ''}`;
  } catch (error) {
    totals.innerHTML = `<p class="form-error">${escapeHtml(error.message)}</p>`;
  }
}

function render() {
  const items = cartItems().filter((i) => wines[i.wineId]);
  renderLines(items);
  renderTotals(items);
}

lines.addEventListener('click', (event) => {
  const change = event.target.closest('[data-change]');
  const remove = event.target.closest('[data-remove]');
  if (change) {
    const item = cartItems().find((i) => i.wineId === change.dataset.change);
    const stock = wines[item.wineId].stock;
    setQuantity(item.wineId, Math.min(stock, item.quantity + Number(change.dataset.step)));
    render();
  }
  if (remove) {
    removeFromCart(remove.dataset.remove);
    render();
  }
});

form.addEventListener('change', (event) => {
  if (event.target.name !== 'method') return;
  document.querySelector('[data-address]').hidden = method() === 'loja';
  renderTotals(cartItems());
});

function showDone(order) {
  document.querySelector('.cart__grid').hidden = true;
  done.hidden = false;
  done.innerHTML = `
    <p class="mono">Encomenda recebida</p>
    <p class="done__code">${order.code}</p>
    <h2>Obrigado, ${escapeHtml(user.name.split(' ')[0])}.</h2>
    <p>${order.delivery.method === 'loja' ? 'Avisamos por SMS quando estiver pronta a levantar na Rua de Cedofeita.' : 'Vai receber um email quando a caixa sair da loja.'}</p>
    <div class="receipt">
      <dl class="receipt__totals">
        ${order.items.map((i) => `<div><dt>${i.quantity} × ${escapeHtml(i.name)}</dt><dd>${money(i.price * i.quantity)}</dd></div>`).join('')}
        ${order.discount ? `<div class="is-discount"><dt>Desconto de sócio</dt><dd>−${money(order.discount)}</dd></div>` : ''}
        <div><dt>Entrega</dt><dd>${order.shipping ? money(order.shipping) : 'grátis'}</dd></div>
        <div class="is-total"><dt>Total</dt><dd>${money(order.total)}</dd></div>
      </dl>
    </div>
    <a class="btn" href="/conta">Ver as minhas encomendas</a>`;
  window.scrollTo({ top: 0 });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorBox.hidden = true;

  if (!user) {
    window.location.href = loginUrl('/cesto');
    return;
  }

  const delivery = method() === 'loja'
    ? { method: 'loja' }
    : { method: 'envio', address: form.address.value, postalCode: form.postalCode.value, city: form.city.value };
  if (form.notes.value.trim()) delivery.notes = form.notes.value.trim();

  const body = { items: cartItems(), delivery, confirmAge: form.confirmAge.checked };

  await submitting(form.querySelector('[data-checkout-submit]'), async () => {
    try {
      const { order } = await api('/orders', { method: 'POST', auth: true, body });
      clearCart();
      showDone(order);
    } catch (error) {
      if (error.status === 401) return (window.location.href = loginUrl('/cesto'));
      showFieldErrors(form, error.details);
      errorBox.textContent = error.message;
      errorBox.hidden = false;
    }
  });
});

async function start() {
  if (!user) {
    form.querySelector('[data-checkout-submit]').textContent = 'Entrar para encomendar';
  } else {
    try {
      const { user: me } = await api('/auth/me', { auth: true });
      form.address.value = me.address ?? '';
      form.postalCode.value = me.postalCode ?? '';
      form.city.value = me.city ?? '';
    } catch {}
  }

  const { wines: list } = await api('/wines');
  wines = Object.fromEntries(list.map((w) => [w.id, w]));
  render();
}

start();
