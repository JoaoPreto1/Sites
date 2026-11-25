import { currentUser, homeFor } from './session.js';

const burger = document.querySelector('.site-head .burger');
const drawer = document.getElementById('gaveta');

if (burger && drawer) {
  const close = drawer.querySelector('.burger--close');
  const focusables = () => [...drawer.querySelectorAll('a, button')];
  const setMenu = (open) => {
    drawer.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    burger.setAttribute('aria-expanded', String(open));
    (open ? close : burger).focus();
  };
  burger.addEventListener('click', () => setMenu(true));
  close.addEventListener('click', () => setMenu(false));
  drawer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
    // Mantém o foco dentro do menu aberto
    if (e.key === 'Tab') {
      const list = focusables();
      const first = list[0];
      const lastEl = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', (e) => e.matches && !drawer.hidden && setMenu(false));
}

// Com sessão, "Entrar" passa a levar à área certa
const user = currentUser();
if (user) {
  document.querySelectorAll('[data-account]').forEach((a) => {
    a.href = homeFor(user);
    a.textContent = user.role === 'estudio' ? 'Painel' : 'A minha área';
  });
}
