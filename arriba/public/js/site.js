import { currentUser, homeFor } from './session.js';

// Menu do telemóvel: abre por cima, prende o foco e fecha com Esc
const abrir = document.querySelector('.topo .menu');
const gaveta = document.getElementById('gaveta');

if (abrir && gaveta) {
  const fechar = gaveta.querySelector('.menu--fechar');
  const focaveis = () => [...gaveta.querySelectorAll('a, button')];
  const mostrar = (open) => {
    gaveta.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    abrir.setAttribute('aria-expanded', String(open));
    (open ? fechar : abrir).focus();
  };
  abrir.addEventListener('click', () => mostrar(true));
  fechar.addEventListener('click', () => mostrar(false));
  gaveta.addEventListener('click', (e) => e.target.closest('a') && mostrar(false));
  gaveta.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') mostrar(false);
    if (e.key === 'Tab') {
      const lista = focaveis();
      const primeiro = lista[0];
      const ultimo = lista[lista.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }
  });
  matchMedia('(min-width: 1081px)').addEventListener('change', (e) => e.matches && !gaveta.hidden && mostrar(false));
}

// Com sessão, "Entrar" passa a levar à área certa
const user = currentUser();
if (user) {
  document.querySelectorAll('[data-account]').forEach((a) => {
    a.href = homeFor(user);
    a.textContent = user.role === 'rececao' ? 'Painel da receção' : 'As minhas reservas';
  });
}
