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

// Versão da época: a escolha fica num cookie e o servidor desenha a página com ela
document.querySelectorAll('[data-epoca-set]').forEach((button) =>
  button.addEventListener('click', () => {
    document.cookie = `epoca=${button.dataset.epocaSet}; path=/; max-age=${60 * 24 * 60 * 60}; samesite=lax`;
    window.location.href = window.location.pathname + window.location.hash;
  }),
);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Decorações discretas da época, só no destaque
const epoca = document.documentElement.dataset.epoca;
const heroBox = document.querySelector('.hero, .phero:not(.phero--app)');
if (epoca && heroBox && !reduced) {
  const deco = document.createElement('div');
  deco.className = `deco deco--${epoca}`;
  deco.setAttribute('aria-hidden', 'true');
  const rand = (a, b) => a + Math.random() * (b - a);
  const fall = { natal: 22, amendoeira: 16, carnaval: 18 }[epoca] ?? 0;
  const colors = ['#f2c12e', '#e8584f', '#4fb3e8', '#7ad18b', '#f3b6cb'];
  for (let i = 0; i < fall; i++) {
    const p = document.createElement('i');
    p.style.cssText = `left:${rand(0, 100)}%;--s:${rand(3, epoca === 'natal' ? 7 : 11)}px;--x:${rand(-60, 60)}px;--r:${rand(-200, 200)}deg;--o:${rand(0.5, 0.9)};--c:${colors[i % colors.length]};animation-duration:${rand(9, 18)}s;animation-delay:${rand(-18, 0)}s`;
    deco.append(p);
  }
  if (epoca === 'halloween') {
    const bat = '<svg viewBox="0 0 64 28"><path d="M32 8c2-4 4-6 4-6s1 4 3 5c4-5 12-7 25-5-6 2-9 7-9 12-4-3-9-3-12 1-2-3-5-4-7-1h-8c-2-3-5-2-7 1-3-4-8-4-12-1 0-5-3-10-9-12 13-2 21 0 25 5 2-1 3-5 3-5s2 2 4 6z"/></svg>';
    [['8%', '22%', 46, 0], ['78%', '12%', 34, -2], ['64%', '30%', 26, -4]].forEach(([left, top, size, delay]) => {
      deco.insertAdjacentHTML('beforeend', bat);
      const svg = deco.lastElementChild;
      svg.style.cssText = `left:${left};top:${top};--s:${size}px;animation-delay:${delay}s`;
    });
  }
  heroBox.querySelector('img')?.after(deco);
}

// Blocos que aparecem ao descer: só se escondem os que ainda estão abaixo do ecrã
if ('IntersectionObserver' in window && !reduced) {
  const selector = '[data-reveal], main .h, main .info, main .card, main .photo, main .nrow, main .step, main .docs li, main .person, main .agenda, main .cta, main .box';
  const items = [...document.querySelectorAll(selector)].filter((el) => !el.closest('.hero, .phero, .drawer'));
  const below = items.filter((el) => el.getBoundingClientRect().top > window.innerHeight);
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }),
    { rootMargin: '0px 0px -8% 0px' },
  );
  below.forEach((el) => {
    if (!el.style.getPropertyValue('--d')) {
      const siblings = [...el.parentElement.children];
      el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 5) * 70}ms`);
    }
    el.classList.add('rv');
    io.observe(el);
  });
}
