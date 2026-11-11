import { api } from './api.js';
import { icon } from './icons.js';
import { currentUser, isAdmin, logout } from './session.js';
import { escapeHtml, initials, toast } from './utils.js';

const links = [
  ['/trabalho', 'Trabalho'],
  ['/servicos', 'Serviços'],
  ['/estudio', 'Estúdio'],
  ['/galerias', 'Galerias'],
];

const user = currentUser();
const path = window.location.pathname;

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
  return `
    <div class="overlay" data-overlay aria-hidden="true">
      <div class="overlay__head">
        <a class="brand" href="/"><span class="brand__dot"></span>LENTE<sup>®</sup></a>
        <button class="menu-toggle" type="button" data-close-overlay>Fechar ${icon('close', 18)}</button>
      </div>
      <nav class="overlay__nav">
        <a href="/"><span class="mono">(00)</span>Início</a>
        ${links.map(([href, label], i) => `<a href="${href}"><span class="mono">(0${i + 1})</span>${label}</a>`).join('')}
        <a href="/orcamento"><span class="mono">(05)</span>Orçamento</a>
      </nav>
      <div class="overlay__foot">
        ${user ? `<a class="btn btn--light" href="${isAdmin(user) ? '/painel' : '/galerias'}">${icon('user', 16)} ${escapeHtml(user.name)}</a>` : `<a class="btn btn--light" href="/entrar">${icon('lock', 16)} Área de cliente</a>`}
        <div class="overlay__links mono">
          <a href="mailto:ola@lente.studio">ola@lente.studio</a>
          <a href="tel:+351220000000">+351 220 000 000</a>
          <span>Rua do Almada 300, Porto</span>
        </div>
      </div>
    </div>`;
}

function startClock(el) {
  const update = () => {
    const time = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Lisbon' }).format(new Date());
    el.textContent = `Porto — ${time}`;
  };
  update();
  setInterval(update, 30000);
}

function renderHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  const nav = links
    .map(([href, label], i) => `<a href="${href}"${path.startsWith(href) ? ' aria-current="page"' : ''}><span class="mono">(0${i + 1})</span>${label}</a>`)
    .join('');

  header.className = 'site-header';
  header.innerHTML = `
    <div class="navbar">
      <a class="brand" href="/" aria-label="Lente Studio, página inicial"><span class="brand__dot"></span>LENTE<sup>®</sup></a>
      <nav class="nav" aria-label="Principal">${nav}</nav>
      <div class="header-actions">
        <span class="clock mono" data-clock></span>
        ${accountMarkup()}
        <a class="btn btn--small nav-cta" href="/orcamento">Pedir orçamento ${icon('arrow', 16)}</a>
        <button class="menu-toggle" type="button" aria-label="Abrir menu">Menu ${icon('menu', 20)}</button>
      </div>
    </div>`;

  header.insertAdjacentHTML('afterend', overlayMarkup());
  startClock(header.querySelector('[data-clock]'));
  setupAccount(header);
  setupOverlay(header);
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
  const toggle = (open) => {
    overlay.classList.toggle('is-open', open);
    overlay.setAttribute('aria-hidden', !open);
    document.documentElement.classList.toggle('no-scroll', open);
  };

  header.querySelector('.menu-toggle').addEventListener('click', () => toggle(true));
  overlay.querySelector('[data-close-overlay]').addEventListener('click', () => toggle(false));
  document.addEventListener('keydown', (event) => event.key === 'Escape' && toggle(false));
}

function renderFooter() {
  const footer = document.querySelector('[data-footer]');
  if (!footer) return;

  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="footer-cta">
      <h2>Tem um projeto?<br><span class="red">Vamos falar.</span></h2>
      <a class="btn" href="/orcamento">Pedir orçamento ${icon('arrow', 18)}</a>
    </div>
    <div class="footer-grid">
      <div>
        <h4>Newsletter</h4>
        <p>Um email por mês com trabalho novo, bastidores e vagas na agenda.</p>
        <form class="newsletter" data-newsletter novalidate>
          <label class="sr-only" for="newsletter-email">Email</label>
          <input id="newsletter-email" name="email" type="email" placeholder="O seu email" autocomplete="email">
          <button type="submit">Subscrever →</button>
        </form>
      </div>
      <div>
        <h4>Estúdio</h4>
        <ul>
          <li>Rua do Almada 300</li>
          <li>4050-032 Porto</li>
          <li>Seg–Sex, 10h–19h</li>
        </ul>
      </div>
      <div>
        <h4>Contacto</h4>
        <ul>
          <li><a href="mailto:ola@lente.studio">ola@lente.studio</a></li>
          <li><a href="tel:+351220000000">+351 220 000 000</a></li>
          <li><a href="/orcamento">Pedir orçamento</a></li>
        </ul>
      </div>
      <div>
        <h4>Redes</h4>
        <ul>
          <li><a href="#">Instagram ↗</a></li>
          <li><a href="#">Vimeo ↗</a></li>
          <li><a href="#">Behance ↗</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-word" aria-hidden="true">LENTE<sup>®</sup></div>
    <div class="footer-bottom mono">
      <span>© ${new Date().getFullYear()} Lente Studio, Lda.</span>
      <span>Fotografia e vídeo · Porto</span>
      <a href="/entrar">Área de cliente ↗</a>
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
