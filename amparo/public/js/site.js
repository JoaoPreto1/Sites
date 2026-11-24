import { currentUser } from './session.js';

const burger = document.querySelector('.site-head .burger');
const drawer = document.getElementById('drawer');

if (burger && drawer) {
  const close = drawer.querySelector('.drawer__close');
  const setMenu = (open) => {
    drawer.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    burger.setAttribute('aria-expanded', String(open));
    if (open) close.focus();
    else burger.focus();
  };
  burger.addEventListener('click', () => setMenu(true));
  close.addEventListener('click', () => setMenu(false));
  drawer.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      drawer.hidden = true;
      document.body.style.overflow = '';
    }),
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer.hidden) setMenu(false);
  });
  matchMedia('(min-width: 1061px)').addEventListener('change', (e) => e.matches && !drawer.hidden && setMenu(false));
}

// Com sessão, o botão "Entrar" passa a levar à conta
const user = currentUser();
if (user) {
  document.querySelectorAll('[data-account]').forEach((a) => {
    a.href = '/conta';
    a.querySelector('span').textContent = user.name.split(' ')[0];
    a.setAttribute('aria-label', 'A minha conta');
  });
}
