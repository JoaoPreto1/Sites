import { api } from './api.js';
import { addToBag, bagCount } from './bag.js';
import { currentUser, isStaff } from './session.js';
import { toast } from './utils.js';

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
    link.href = isStaff(user) ? '/painel' : '/conta';
    link.textContent = isStaff(user) ? 'Painel' : user.name.split(' ')[0];
  }
}

function updateCount({ bump = false } = {}) {
  const count = bagCount();
  for (const el of document.querySelectorAll('[data-bag-count]')) {
    el.textContent = count;
    el.toggleAttribute('data-zero', count === 0);
  }
  if (bump) {
    const pill = document.querySelector('.bag-pill');
    pill?.classList.remove('is-bump');
    void pill?.offsetWidth;
    pill?.classList.add('is-bump');
  }
}

// Qualquer botão com data-add junta o disco ao saco, em qualquer página
function setupAddButtons() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add]');
    if (!button) return;
    addToBag(button.dataset.add);
    toast(`${button.dataset.name ?? 'Disco'} no saco.`, { link: { href: '/saco', label: 'Ver saco' } });
  });
}

// Secções que entram com uma animação quando aparecem no ecrã
function setupReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) return items.forEach((el) => el.classList.add('is-in'));

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  items.forEach((el) => observer.observe(el));
}

function setupNewsletter() {
  const form = document.querySelector('[data-newsletter]');
  if (!form) return;
  const message = form.querySelector('[data-newsletter-msg]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const data = await api('/newsletter', { method: 'POST', body: { email: form.email.value.trim() } });
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
setupReveal();
setupNewsletter();
document.addEventListener('bag:change', () => updateCount({ bump: true }));
window.addEventListener('storage', () => updateCount());
