import { currentUser } from '../session.js';
import { startDesktop } from './wm.js';

const DESK_KEY = 'bairro.desk';

// Fundo escolhido nas definições (só neste browser)
export function applyWallpaper() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(DESK_KEY));
  } catch {}
  if (saved?.color) document.body.style.setProperty('--desk', saved.color);
  if (saved?.pattern) document.body.dataset.pattern = saved.pattern;
}

function accountLinks() {
  const user = currentUser();
  if (!user) return;
  const href = user.role === 'admin' ? '/painel' : '/conta';
  const account = document.querySelector('[data-account]');
  if (account) {
    account.href = href;
    account.textContent = user.name.split(' ')[0];
  }
  const menu = document.querySelector('[data-account-menu]');
  if (menu) {
    menu.href = href;
    menu.lastChild.textContent = user.role === 'admin' ? 'Painel do estúdio' : 'O meu projeto';
  }
}

const clockFormat = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Lisbon' });

function clock() {
  const tick = () => document.querySelectorAll('[data-clock]').forEach((el) => (el.textContent = clockFormat.format(new Date())));
  tick();
  setInterval(tick, 20000);
}

function startMenu() {
  const button = document.querySelector('.start');
  const menu = document.getElementById('start-menu');
  const toggle = (open) => {
    menu.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    if (open) menu.querySelector('a')?.focus();
  };
  button.addEventListener('click', () => toggle(menu.hidden));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      toggle(false);
      button.focus();
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (!menu.hidden && !menu.contains(event.target) && !button.contains(event.target)) toggle(false);
  });
}

applyWallpaper();
accountLinks();
clock();
startMenu();
startDesktop();
