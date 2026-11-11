import { currentUser, isOwner, logout } from './session.js';
import { escapeHtml, initials } from './utils.js';

const links = [
  ['/alojamentos', 'Alojamentos'],
  ['/experiencias', 'Experiências'],
  ['/regiao', 'A região'],
  ['/contactos', 'Contactos'],
];

function accountMarkup(user) {
  if (!user) return `<a class="btn btn--ghost btn--small" href="/entrar">Entrar</a>`;

  const firstName = escapeHtml(user.name.split(' ')[0]);
  return `
    <div class="account">
      <button class="account__button" type="button" aria-expanded="false" aria-haspopup="true">
        <span class="avatar">${initials(user.name)}</span>
        <span class="account__name">Olá, ${firstName}</span>
      </button>
      <div class="account__menu">
        <a href="/conta">As minhas reservas</a>
        <a href="/conta#perfil">Os meus dados</a>
        ${isOwner(user) ? '<a href="/painel">Painel de gestão</a>' : ''}
        <button type="button" data-logout>Terminar sessão</button>
      </div>
    </div>`;
}

function renderHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  const path = window.location.pathname;
  const nav = links
    .map(([href, label]) => `<a href="${href}"${path.startsWith(href) ? ' aria-current="page"' : ''}>${label}</a>`)
    .join('');

  header.className = 'site-header';
  header.innerHTML = `
    <div class="container site-header__inner">
      <a class="logo" href="/">Maré</a>
      <nav class="nav" aria-label="Principal">${nav}</nav>
      <div class="header-actions">
        ${accountMarkup(currentUser())}
        <button class="menu-toggle" type="button" aria-label="Abrir menu"><span></span></button>
      </div>
    </div>`;

  header.querySelector('.menu-toggle').addEventListener('click', () => header.classList.toggle('is-open'));

  const account = header.querySelector('.account');
  if (account) {
    const button = account.querySelector('.account__button');
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = account.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', () => account.classList.remove('is-open'));
    account.querySelector('[data-logout]').addEventListener('click', logout);
  }
}

function renderFooter() {
  const footer = document.querySelector('[data-footer]');
  if (!footer) return;

  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="container">
      <div class="site-footer__grid">
        <div class="site-footer__brand">
          <a class="logo" href="/">Maré</a>
          <p class="site-footer__about">Seis casas de férias em Lagos, geridas por uma família local. Reserve direto connosco, sem comissões.</p>
        </div>
        <div>
          <h4>Casas</h4>
          <ul>
            <li><a href="/alojamentos/casa-farol">Casa Farol</a></li>
            <li><a href="/alojamentos/refugio-da-ponta">Refúgio da Ponta</a></li>
            <li><a href="/alojamentos/vila-barlavento">Vila Barlavento</a></li>
            <li><a href="/alojamentos">Ver todas</a></li>
          </ul>
        </div>
        <div>
          <h4>Maré</h4>
          <ul>
            <li><a href="/experiencias">Experiências</a></li>
            <li><a href="/regiao">A região</a></li>
            <li><a href="/conta">A minha conta</a></li>
            <li><a href="/contactos">Contactos</a></li>
          </ul>
        </div>
        <div>
          <h4>Falar connosco</h4>
          <ul>
            <li>+351 282 000 000</li>
            <li>ola@mare.pt</li>
            <li>Rua da Barroca 12<br>8600-315 Lagos</li>
          </ul>
        </div>
      </div>
      <div class="site-footer__bottom">
        <span>© ${new Date().getFullYear()} Maré · Alojamento Local n.º 00000/AL</span>
        <span>Livro de reclamações · Política de privacidade</span>
      </div>
    </div>`;
}

renderHeader();
renderFooter();
