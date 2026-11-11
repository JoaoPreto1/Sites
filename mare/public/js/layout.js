import { api } from './api.js';
import { icon } from './icons.js';
import { currentUser, isOwner, logout } from './session.js';
import { escapeHtml, initials, toast } from './utils.js';

const links = [
  ['/alojamentos', 'Alojamentos'],
  ['/experiencias', 'Experiências'],
  ['/regiao', 'A região'],
  ['/contactos', 'Contactos'],
];

const user = currentUser();
const path = window.location.pathname;

function accountMarkup() {
  if (!user) {
    return `<a class="nav-login" href="/entrar">${icon('user', 18)}<span>Entrar</span></a>`;
  }

  return `
    <div class="account">
      <button class="account__button" type="button" aria-expanded="false" aria-haspopup="true">
        <span class="avatar">${initials(user.name)}</span>
        <span class="account__name">${escapeHtml(user.name.split(' ')[0])}</span>
      </button>
      <div class="account__menu">
        <p class="account__who"><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.email)}</small></p>
        <a href="/conta">${icon('calendar', 16)} As minhas reservas</a>
        <a href="/conta#perfil">${icon('user', 16)} Os meus dados</a>
        ${isOwner(user) ? `<a href="/painel">${icon('key', 16)} Painel de gestão</a>` : ''}
        <button type="button" data-logout>${icon('arrow', 16)} Terminar sessão</button>
      </div>
    </div>`;
}

function drawerMarkup() {
  const accountLinks = user
    ? `<a href="/conta">As minhas reservas</a>${isOwner(user) ? '<a href="/painel">Painel de gestão</a>' : ''}<button type="button" data-logout>Terminar sessão</button>`
    : '<a href="/entrar">Entrar</a><a href="/entrar?tab=registo">Criar conta</a>';

  return `
    <div class="drawer" data-drawer aria-hidden="true">
      <div class="drawer__panel" role="dialog" aria-label="Menu">
        <div class="drawer__head">
          <a class="brand" href="/"><span class="brand__mark">${icon('wave', 20)}</span><span class="brand__text"><strong>Maré</strong><small>Lagos · Algarve</small></span></a>
          <button class="icon-button" type="button" data-close-drawer aria-label="Fechar menu">${icon('close', 22)}</button>
        </div>
        <nav class="drawer__nav">
          <a href="/">Início ${icon('arrow', 20)}</a>
          ${links.map(([href, label]) => `<a href="${href}">${label} ${icon('arrow', 20)}</a>`).join('')}
        </nav>
        <div class="drawer__account">${accountLinks}</div>
        <a class="btn btn--sea btn--block" href="/alojamentos">Ver disponibilidade</a>
        <div class="drawer__contacts">
          <a href="tel:+351282000000">${icon('phone', 16)} +351 282 000 000</a>
          <a href="mailto:ola@mare.pt">${icon('mail', 16)} ola@mare.pt</a>
        </div>
      </div>
    </div>`;
}

function renderHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  const nav = links
    .map(([href, label]) => `<a href="${href}"${path.startsWith(href) ? ' aria-current="page"' : ''}>${label}</a>`)
    .join('');

  header.className = 'site-header';
  header.innerHTML = `
    <div class="topbar">
      <div class="container topbar__inner">
        <p>${icon('shield', 15)} Reserva direta, sem comissões · Cancelamento grátis até 14 dias</p>
        <div class="topbar__links">
          <a href="tel:+351282000000">${icon('phone', 15)} +351 282 000 000</a>
          <a href="mailto:ola@mare.pt">${icon('mail', 15)} ola@mare.pt</a>
        </div>
      </div>
    </div>
    <div class="navbar">
      <div class="container navbar__inner">
        <a class="brand" href="/" aria-label="Maré, página inicial">
          <span class="brand__mark">${icon('wave', 20)}</span>
          <span class="brand__text"><strong>Maré</strong><small>Lagos · Algarve</small></span>
        </a>
        <nav class="nav" aria-label="Principal">${nav}</nav>
        <div class="header-actions">
          ${accountMarkup()}
          <a class="btn btn--sea btn--small nav-cta" href="/alojamentos">Reservar</a>
          <button class="icon-button menu-toggle" type="button" aria-label="Abrir menu">${icon('menu', 22)}</button>
        </div>
      </div>
    </div>`;

  header.insertAdjacentHTML('afterend', drawerMarkup());
  setupAccountMenu(header);
  setupDrawer(header);
  setupScroll(header);
  document.querySelectorAll('[data-logout]').forEach((button) => button.addEventListener('click', logout));
}

function setupAccountMenu(header) {
  const account = header.querySelector('.account');
  if (!account) return;

  const button = account.querySelector('.account__button');
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = account.classList.toggle('is-open');
    button.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', () => {
    account.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
  });
}

function setupDrawer(header) {
  const drawer = document.querySelector('[data-drawer]');
  const toggle = (open) => {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', !open);
    document.documentElement.classList.toggle('no-scroll', open);
  };

  header.querySelector('.menu-toggle').addEventListener('click', () => toggle(true));
  drawer.querySelector('[data-close-drawer]').addEventListener('click', () => toggle(false));
  drawer.addEventListener('click', (event) => event.target === drawer && toggle(false));
  document.addEventListener('keydown', (event) => event.key === 'Escape' && toggle(false));
}

// Na página inicial o cabeçalho começa transparente e ganha fundo ao descer
function setupScroll(header) {
  if (!document.body.classList.contains('has-hero')) return;
  const update = () => header.classList.toggle('is-solid', window.scrollY > 40);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function renderFooter() {
  const footer = document.querySelector('[data-footer]');
  if (!footer) return;

  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="container">
      <div class="footer-cta">
        <div>
          <h3>Datas livres e novidades, <em>uma vez por mês.</em></h3>
          <p>Sem spam. Pode sair quando quiser.</p>
        </div>
        <form class="newsletter" data-newsletter novalidate>
          <label class="sr-only" for="newsletter-email">Email</label>
          <input id="newsletter-email" name="email" type="email" placeholder="O seu email" autocomplete="email" required>
          <button class="btn btn--light" type="submit">Subscrever</button>
        </form>
      </div>

      <div class="site-footer__grid">
        <div class="site-footer__brand">
          <a class="brand brand--light" href="/"><span class="brand__mark">${icon('wave', 20)}</span><span class="brand__text"><strong>Maré</strong><small>Lagos · Algarve</small></span></a>
          <p class="site-footer__about">Seis casas de férias em Lagos, geridas por uma família local desde 2014. Reserve direto connosco, sem comissões.</p>
          <div class="socials">
            <a href="#" aria-label="Instagram">${icon('instagram', 18)}</a>
            <a href="#" aria-label="Facebook">${icon('facebook', 18)}</a>
            <a href="mailto:ola@mare.pt" aria-label="Email">${icon('mail', 18)}</a>
          </div>
        </div>
        <div>
          <h4>Casas</h4>
          <ul>
            <li><a href="/alojamentos/casa-farol">Casa Farol</a></li>
            <li><a href="/alojamentos/refugio-da-ponta">Refúgio da Ponta</a></li>
            <li><a href="/alojamentos/vila-barlavento">Vila Barlavento</a></li>
            <li><a href="/alojamentos/casa-azulejo">Casa Azulejo</a></li>
            <li><a href="/alojamentos">Ver todas</a></li>
          </ul>
        </div>
        <div>
          <h4>Maré</h4>
          <ul>
            <li><a href="/experiencias">Experiências</a></li>
            <li><a href="/regiao">Guia de Lagos</a></li>
            <li><a href="/conta">A minha conta</a></li>
            <li><a href="/contactos">Contactos</a></li>
          </ul>
        </div>
        <div>
          <h4>Falar connosco</h4>
          <ul class="footer-contacts">
            <li>${icon('phone', 16)} <a href="tel:+351282000000">+351 282 000 000</a></li>
            <li>${icon('mail', 16)} <a href="mailto:ola@mare.pt">ola@mare.pt</a></li>
            <li>${icon('pin', 16)} <span>Rua da Barroca 12<br>8600-315 Lagos</span></li>
            <li>${icon('clock', 16)} <span>Todos os dias, 9h–20h</span></li>
          </ul>
        </div>
      </div>

      <div class="site-footer__bottom">
        <span>© ${new Date().getFullYear()} Maré · Alojamento Local n.º 00000/AL</span>
        <span class="payments"><span>Multibanco</span><span>MB Way</span><span>Visa</span><span>Mastercard</span></span>
        <span>Livro de reclamações · Privacidade</span>
      </div>
    </div>`;

  const form = footer.querySelector('[data-newsletter]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const { message } = await api('/newsletter', { method: 'POST', body: { email: form.email.value } });
      form.reset();
      toast(message);
    } catch (error) {
      toast(error.details?.[0]?.message ?? error.message, 'error');
    }
  });
}

renderHeader();
renderFooter();
