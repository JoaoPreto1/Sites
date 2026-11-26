import { currentUser, homeFor } from './session.js';

document.documentElement.classList.add('js');
const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Menu em ecrã inteiro: prende o foco, fecha com Esc e devolve o foco a quem o abriu
const menu = document.getElementById('menu');
const abrir = document.querySelector('[data-abrir-menu]');
if (menu && abrir) {
  const fechar = menu.querySelector('[data-fechar-menu]');
  const mostrar = (open) => {
    menu.hidden = !open;
    menu.classList.toggle('abre', open);
    document.body.style.overflow = open ? 'hidden' : '';
    abrir.setAttribute('aria-expanded', String(open));
    (open ? fechar : abrir).focus();
  };
  abrir.addEventListener('click', () => mostrar(true));
  fechar.addEventListener('click', () => mostrar(false));
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') mostrar(false);
    if (e.key !== 'Tab') return;
    const f = [...menu.querySelectorAll('a, button')];
    if (e.shiftKey && document.activeElement === f[0]) {
      e.preventDefault();
      f.at(-1).focus();
    } else if (!e.shiftKey && document.activeElement === f.at(-1)) {
      e.preventDefault();
      f[0].focus();
    }
  });
}

// Cabeçalho: transparente por cima da fotografia, sólido depois dela; esconde-se a descer e volta a subir
const cab = document.querySelector('[data-cab]');
const heroi = document.querySelector('[data-heroi]');
if (cab && !cab.classList.contains('cab--solido')) {
  let ultimo = scrollY;
  let pedido = false;
  const atualizar = () => {
    pedido = false;
    const limite = heroi ? heroi.offsetHeight - cab.offsetHeight : 40;
    const y = scrollY;
    cab.classList.toggle('rolou', y > limite);
    cab.classList.toggle('esconde', !calmo && y > limite + 200 && y > ultimo);
    ultimo = y;
  };
  addEventListener('scroll', () => {
    if (!pedido) {
      pedido = true;
      requestAnimationFrame(atualizar);
    }
  }, { passive: true });
  atualizar();
}

// Entradas ao rolar: o texto sobe e as fotografias assentam
const entradas = document.querySelectorAll('.rv, .rv-f');
if (calmo || !('IntersectionObserver' in window)) {
  entradas.forEach((el) => el.classList.add('vis'));
} else {
  const io = new IntersectionObserver(
    (lista) => {
      for (const e of lista) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('vis');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  entradas.forEach((el) => io.observe(el));
}

// Com sessão, "A minha reserva" leva à área certa
const user = currentUser();
if (user) {
  document.querySelectorAll('[data-account]').forEach((a) => {
    a.href = homeFor(user);
    a.textContent = user.role === 'rececao' ? 'Painel da receção' : 'A minha reserva';
  });
}
