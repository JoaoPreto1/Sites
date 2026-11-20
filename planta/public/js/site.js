import { currentUser } from './session.js';

const button = document.querySelector('.menu-btn');
const panel = document.getElementById('menu');

button?.addEventListener('click', () => {
  const open = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(open));
  button.setAttribute('aria-label', open ? 'Fechar o menu' : 'Abrir o menu');
  panel.classList.toggle('is-open', open);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && button?.getAttribute('aria-expanded') === 'true') {
    button.click();
    button.focus();
  }
});

// Linha por baixo do cabeçalho só depois de começar a descer
const header = document.querySelector('.header');
const onScroll = () => header?.classList.toggle('is-stuck', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Com sessão, a área de cliente leva à obra ou ao painel
const user = currentUser();
const account = document.querySelector('[data-account]');
if (user && account) {
  account.href = user.role === 'admin' ? '/painel' : '/obra';
  account.textContent = user.role === 'admin' ? 'Painel' : 'A minha obra';
}
