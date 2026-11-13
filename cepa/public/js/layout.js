import { api } from './api.js';
import { addToCart, cartCount } from './cart.js';
import { currentUser, isAdmin } from './session.js';
import { bottle } from './shared/bottle.js';
import { initialData, toast } from './utils.js';

function setupMenu() {
  const menu = document.querySelector('[data-menu]');
  const openButton = document.querySelector('[data-menu-open]');
  if (!menu || !openButton) return;

  const toggle = (open) => {
    menu.hidden = !open;
    openButton.setAttribute('aria-expanded', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) menu.querySelector('[data-menu-close]').focus();
    else openButton.focus();
  };

  openButton.addEventListener('click', () => toggle(true));
  menu.querySelector('[data-menu-close]').addEventListener('click', () => toggle(false));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && !menu.hidden && toggle(false));
}

function setupAccount() {
  const user = currentUser();
  if (!user) return;
  for (const link of document.querySelectorAll('[data-account]')) {
    link.href = isAdmin(user) ? '/painel' : '/conta';
    link.textContent = isAdmin(user) ? 'Painel' : user.name.split(' ')[0];
  }
}

function updateCount() {
  const count = cartCount();
  for (const el of document.querySelectorAll('[data-cart-count]')) {
    el.textContent = count;
    el.toggleAttribute('data-zero', count === 0);
  }
}

// Qualquer botão com data-add junta o vinho ao cesto, em qualquer página
function setupAddButtons() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add]');
    if (!button) return;
    const quantity = Number(button.dataset.qty) || 1;
    addToCart(button.dataset.add, quantity);
    const name = button.dataset.name ?? 'Vinho';
    toast(`${quantity > 1 ? `${quantity} × ` : ''}${name} no cesto.`, { link: { href: '/cesto', label: 'Ver cesto' } });
  });
}

// Junta todos os vinhos que vêm nos dados iniciais da página, estejam onde estiverem
function collectWines(data, found = {}) {
  if (Array.isArray(data)) data.forEach((item) => collectWines(item, found));
  else if (data && typeof data === 'object') {
    if (data.id && data.shape && data.label) found[data.id] = data;
    Object.values(data).forEach((value) => collectWines(value, found));
  }
  return found;
}

// Ao passar o rato numa linha da carta aparece a garrafa ao lado do cursor
function setupFloatingBottle() {
  if (!window.matchMedia('(hover: hover) and (min-width: 901px)').matches) return;
  const wines = collectWines(initialData());
  if (!Object.keys(wines).length) return;

  const holder = document.createElement('div');
  holder.className = 'float-bottle';
  holder.setAttribute('aria-hidden', 'true');
  document.body.append(holder);
  let current = null;

  document.addEventListener('mouseover', (event) => {
    const row = event.target.closest('.entry[data-wine]');
    if (row === current) return;
    current = row;
    const wine = row && wines[row.dataset.wine];
    if (!wine) return holder.classList.remove('is-on');
    holder.innerHTML = bottle(wine, { title: false });
    holder.classList.add('is-on');
  });

  document.addEventListener('mousemove', (event) => {
    if (!current) return;
    holder.style.left = `${event.clientX + 90}px`;
    holder.style.top = `${event.clientY - 20}px`;
  });
}

function setupNewsletter() {
  const form = document.querySelector('[data-newsletter]');
  if (!form) return;
  const message = form.querySelector('[data-newsletter-msg]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = form.email.value.trim();
    try {
      const data = await api('/newsletter', { method: 'POST', body: { email } });
      message.textContent = data.message;
      form.reset();
    } catch (error) {
      message.textContent = error.details?.[0]?.message ?? error.message;
    }
  });
}

setupMenu();
setupAccount();
updateCount();
setupAddButtons();
setupFloatingBottle();
setupNewsletter();
document.addEventListener('cart:change', updateCount);
window.addEventListener('storage', updateCount);

