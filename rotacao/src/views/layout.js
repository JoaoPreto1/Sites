import { ADDRESS } from '../seo/pages.js';

const NAV = [
  ['/discos', 'Discos'],
  ['/salas', 'Salas de ensaio'],
  ['/procura', 'Procura-se'],
  ['/compramos', 'Compramos'],
];

const TICKER = [
  'Chegou esta semana: uma caixa de jazz de um baterista do Barreiro',
  'Ouve 30 segundos de qualquer disco antes de o levar',
  'Sábado: feira de usados no pátio, das 11h às 18h',
  'Salas de ensaio abertas todos os dias até à meia-noite',
  'Envio grátis a partir de 80 €',
];

const current = (path, href) => (path === href || path.startsWith(`${href}/`) ? ' aria-current="page"' : '');

export const disc = (className = '') => `<span class="disc ${className}" aria-hidden="true"><span></span></span>`;

export function header(path) {
  const links = NAV.map(([href, label]) => `<a href="${href}"${current(path, href)}>${label}</a>`).join('');
  const items = TICKER.map((t) => `<span>${t}</span>`).join('');

  return `
  <header class="top">
    <div class="top__bar">
      <a class="logo" href="/">${disc('logo__disc')}<span class="logo__name">Rotação</span><small>discos · salas de ensaio · Lisboa</small></a>
      <nav class="top__nav" aria-label="Principal">${links}</nav>
      <div class="top__tools">
        <a class="top__account" href="/entrar" data-account>Entrar</a>
        <a class="bag-pill" href="/saco">Saco <span class="bag-pill__count" data-bag-count data-zero>0</span></a>
        <button class="top__menu" type="button" aria-expanded="false" aria-controls="menu" data-menu-open><span></span><span class="sr-only">Menu</span></button>
      </div>
    </div>
    <div class="ticker" aria-hidden="true"><div class="ticker__track">${items}${items}</div></div>
  </header>
  <div class="menu" id="menu" data-menu hidden>
    <div class="menu__head">
      <a class="logo" href="/">${disc('logo__disc')}<span class="logo__name">Rotação</span></a>
      <button class="menu__close" type="button" data-menu-close>Fechar</button>
    </div>
    <nav class="menu__nav" aria-label="Menu">
      <a href="/">Início</a>
      ${links}
      <a href="/saco">Saco</a>
      <a href="/entrar" data-account>Entrar</a>
    </nav>
    <p class="menu__foot mono">${ADDRESS.street}, ${ADDRESS.city}<br>loja seg–sáb 11h–20h · salas 10h–00h</p>
  </div>`;
}

// O rodapé é a contracapa de um disco: lado A a loja, lado B as salas
export function footer() {
  const year = new Date().getFullYear();
  return `
  <footer class="sleeve-back">
    <div class="sleeve-back__news">
      <div>
        <p class="kicker">Novas entradas, às sextas</p>
        <h2 class="display">Os discos que chegaram,<br>antes de irem para o caixote.</h2>
      </div>
      <form class="news-form" data-newsletter novalidate>
        <label class="sr-only" for="news-email">Email</label>
        <input id="news-email" name="email" type="email" placeholder="o teu email" autocomplete="email" required>
        <button type="submit">Receber</button>
        <p class="news-form__msg" role="status" data-newsletter-msg></p>
      </form>
    </div>
    <div class="sleeve-back__grid">
      <div class="side">
        <h3>Lado A — Loja</h3>
        <ol>
          <li><span>A1</span><a href="/discos">Discos novos e usados</a><i></i>seg–sáb</li>
          <li><span>A2</span>Horário<i></i>11h–20h</li>
          <li><span>A3</span><a href="/procura">Lista de procura</a><i></i>48 h guardado</li>
          <li><span>A4</span><a href="/compramos">Compramos coleções</a><i></i>na hora</li>
        </ol>
      </div>
      <div class="side">
        <h3>Lado B — Salas</h3>
        <ol>
          <li><span>B1</span><a href="/salas">Sala Grave · Média · Aguda</a><i></i>todos os dias</li>
          <li><span>B2</span>Horário<i></i>10h–00h</li>
          <li><span>B3</span>Gravação multipista<i></i>+10 €</li>
          <li><span>B4</span>Cancelamento grátis<i></i>até 24 h</li>
        </ol>
      </div>
      <div class="sleeve-back__label">
        <div class="barcode" aria-hidden="true"></div>
        <p><strong>ROT-LP-001</strong></p>
        <p>${ADDRESS.street}, ${ADDRESS.postalCode} ${ADDRESS.city}<br>Metro Intendente</p>
        <p><a href="mailto:${ADDRESS.email}">${ADDRESS.email}</a> · <a href="tel:${ADDRESS.phone.replace(/\s/g, '')}">${ADDRESS.phoneLabel}</a></p>
        <p><a href="/conta">A minha conta</a> · <a href="/saco">Saco</a></p>
      </div>
    </div>
    <div class="sleeve-back__fine">
      <span>℗ &amp; © ${year} Rotação. Fabricado em Lisboa.</span>
      <span>Pré-escutas e capas: iTunes / Apple Music.</span>
      <span>33⅓ RPM · STEREO</span>
    </div>
  </footer>`;
}
