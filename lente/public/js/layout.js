import { api } from './api.js';
import { icon } from './icons.js';
import { currentUser, isAdmin, logout } from './session.js';
import { escapeHtml, initials, toast } from './utils.js';

const links = [
  ['/trabalho', 'Trabalho'],
  ['/servicos', 'Serviços'],
  ['/estudio', 'Estúdio'],
  ['/galerias', 'Clientes'],
];

const user = currentUser();
const path = window.location.pathname;

const brand = '<a class="brand" href="/"><span class="brand__mark" aria-hidden="true"></span><span>Lente <em>Studio</em></span></a>';

function accountMarkup() {
  if (!user) return `<a class="nav-login" href="/entrar" aria-label="Área de cliente">${icon('lock', 16)}<span>Área de cliente</span></a>`;

  return `
    <div class="account">
      <button class="account__button" type="button" aria-expanded="false" aria-haspopup="true">
        <span class="avatar">${initials(user.name)}</span>
        <span class="account__name">${escapeHtml(user.name.split(' ')[0])}</span>
      </button>
      <div class="account__menu">
        <p><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.company || user.email)}</small></p>
        <a href="/galerias">${icon('grid', 16)} As minhas galerias</a>
        ${isAdmin(user) ? `<a href="/painel">${icon('eye', 16)} Painel do estúdio</a>` : ''}
        <button type="button" data-logout>${icon('logout', 16)} Terminar sessão</button>
      </div>
    </div>`;
}

function overlayMarkup() {
  const account = user
    ? `<a class="btn btn--line" href="${isAdmin(user) ? '/painel' : '/galerias'}">${icon('user', 16)} ${escapeHtml(user.name)}</a>`
    : `<a class="btn btn--line" href="/entrar">${icon('lock', 16)} Área de cliente</a>`;

  return `
    <div class="overlay" data-overlay aria-hidden="true" inert>
      <div class="overlay__head">
        ${brand}
        <button class="icon-button" type="button" data-close-overlay aria-label="Fechar menu">${icon('close', 20)}</button>
      </div>
      <nav class="overlay__nav" aria-label="Menu">
        <a href="/">Início</a>
        ${links.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}
        <a href="/orcamento">Pedir orçamento</a>
      </nav>
      <div class="overlay__foot">
        ${account}
        <div class="overlay__links">
          <a href="mailto:ola@lente.studio">ola@lente.studio</a>
          <a href="tel:+351220000000">+351 220 000 000</a>
          <span>Rua do Almada 300, Porto</span>
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
    <div class="navbar">
      ${brand}
      <nav class="nav" aria-label="Principal">${nav}</nav>
      <div class="header-actions">
        ${accountMarkup()}
        <a class="btn btn--small btn--red nav-cta" href="/orcamento">Pedir orçamento</a>
        <button class="icon-button menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false">${icon('menu', 20)}</button>
      </div>
    </div>`;

  header.insertAdjacentHTML('afterend', overlayMarkup());
  setupAccount(header);
  setupOverlay(header);
  setupScroll(header);
  document.querySelectorAll('[data-logout]').forEach((button) => button.addEventListener('click', logout));
}

function setupAccount(header) {
  const account = header.querySelector('.account');
  if (!account) return;

  const button = account.querySelector('.account__button');
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    button.setAttribute('aria-expanded', account.classList.toggle('is-open'));
  });
  document.addEventListener('click', () => {
    account.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
  });
}

function setupOverlay(header) {
  const overlay = document.querySelector('[data-overlay]');
  const toggleButton = header.querySelector('.menu-toggle');
  const toggle = (open) => {
    overlay.inert = !open;
    overlay.classList.toggle('is-open', open);
    overlay.setAttribute('aria-hidden', !open);
    toggleButton.setAttribute('aria-expanded', open);
    document.documentElement.classList.toggle('no-scroll', open);
  };

  toggleButton.addEventListener('click', () => toggle(true));
  overlay.querySelector('[data-close-overlay]').addEventListener('click', () => toggle(false));
  document.addEventListener('keydown', (event) => event.key === 'Escape' && toggle(false));
}

// Na página inicial a navbar começa transparente sobre a fotografia e ganha fundo ao descer
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
          <p class="mono muted">Próximo projeto</p>
          <h2>Tem uma ideia? <span class="red">Vamos fotografá-la.</span></h2>
        </div>
        <a class="btn btn--red" href="/orcamento">Pedir orçamento ${icon('arrow', 18)}</a>
      </div>

      <div class="footer-grid">
        <div class="footer-brand">
          ${brand}
          <p>Estúdio de fotografia e vídeo no Porto, para marcas de moda, música e editorial.</p>
          <form class="newsletter" data-newsletter novalidate>
            <label class="sr-only" for="newsletter-email">Email</label>
            <input id="newsletter-email" name="email" type="email" placeholder="O seu email" autocomplete="email">
            <button class="btn btn--small" type="submit">Subscrever</button>
          </form>
        </div>
        <div>
          <h3>Estúdio</h3>
          <ul>
            <li>Rua do Almada 300</li>
            <li>4050-032 Porto</li>
            <li>Seg–Sex, 10h–19h</li>
          </ul>
        </div>
        <div>
          <h3>Contacto</h3>
          <ul>
            <li><a href="mailto:ola@lente.studio">ola@lente.studio</a></li>
            <li><a href="tel:+351220000000">+351 220 000 000</a></li>
            <li><a href="/orcamento">Pedir orçamento</a></li>
          </ul>
        </div>
        <div>
          <h3>Seguir</h3>
          <ul>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">Vimeo</a></li>
            <li><a href="#">Behance</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} Lente Studio, Lda.</span>
        <a href="/entrar">Área de cliente</a>
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
