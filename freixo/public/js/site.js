import { currentUser, homeFor } from './session.js';

const body = document.body;
const head = document.querySelector('.site-head');
const burger = document.querySelector('.burger');
const drawer = document.getElementById('drawer');

function setMenu(open) {
  body.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', String(open));
  if (open) drawer.querySelector('.close').focus();
  else if (document.activeElement && drawer.contains(document.activeElement)) burger.focus();
}

burger.addEventListener('click', () => setMenu(true));
drawer.querySelector('.close').addEventListener('click', () => setMenu(false));
drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && body.classList.contains('menu-open')) setMenu(false);
});
matchMedia('(min-width: 1181px)').addEventListener('change', (e) => e.matches && setMenu(false));
if (location.hash === '#menu') setMenu(true);

// Cabeçalho transparente sobre a fotografia; ganha fundo ao descer
const onScroll = () => head.classList.toggle('solid', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// "/" leva à pesquisa
document.addEventListener('keydown', (e) => {
  if (e.key !== '/' || /input|textarea|select/i.test(document.activeElement.tagName)) return;
  const input = document.querySelector('main form.search input') ?? document.querySelector('.fsearch input');
  if (input) {
    e.preventDefault();
    input.focus();
  }
});

// Com sessão, o botão do Balcão Online leva à área certa
const user = currentUser();
if (user) {
  document.querySelectorAll('[data-account]').forEach((a) => {
    a.href = homeFor(user);
    a.querySelector('span').textContent = user.role === 'admin' ? 'Painel da câmara' : `Olá, ${user.name.split(' ')[0]}`;
  });
}

// Navegação dentro da página: assinala a secção que está à vista
const links = [...document.querySelectorAll('.subnav a, .toc a')];
if (links.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === `#${e.target.id}`));
      }),
    { rootMargin: '-40% 0px -55% 0px' },
  );
  links
    .map((a) => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean)
    .forEach((s) => io.observe(s));
}
