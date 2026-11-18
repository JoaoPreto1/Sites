import { currentUser } from './session.js';

const button = document.querySelector('.menu-btn');
const panel = document.getElementById('menu');

button?.addEventListener('click', () => {
  const open = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(open));
  button.setAttribute('aria-label', open ? 'Fechar o menu' : 'Abrir o menu');
  panel.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && button?.getAttribute('aria-expanded') === 'true') button.click();
});

// Com sessão, "Entrar" passa a levar ao dossier do cliente ou ao painel da equipa
const user = currentUser();
const account = document.querySelector('[data-account]');
if (user && account) {
  account.href = user.role === 'admin' ? '/painel' : '/conta';
  account.textContent = user.role === 'admin' ? 'Painel' : 'O meu dossier';
}
