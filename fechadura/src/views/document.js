import { renderHead } from '../seo/head.js';
import { VENUE } from '../config/venue.js';
import { esc } from './html.js';

export const VERSION = Date.now().toString(36);

const NAV = [
  ['/salas', 'Salas'],
  ['/reservar', 'Reservar'],
  ['/vouchers', 'Vouchers'],
  ['/registo', 'Registo de fugas'],
  ['/antes-de-vir', 'Antes de vir'],
];

const keyhole = '<svg viewBox="0 0 22 28" aria-hidden="true"><circle cx="11" cy="8" r="7" fill="#c9a24a"/><path d="M7 11h8l3 16H4z" fill="#c9a24a"/></svg>';

function header(path) {
  const current = (href) => (path === href || path.startsWith(`${href}/`) ? ' aria-current="page"' : '');
  return `<header class="header">
  <div class="wrap">
    <a class="logo" href="/" aria-label="Fechadura, página inicial">${keyhole}FECHADURA</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" aria-label="Abrir o menu"><span></span><span></span><span></span></button>
    <div class="header__panel" id="menu">
      <nav class="nav" aria-label="Principal">${NAV.map(([href, label]) => `<a href="${href}"${current(href)}>${label}</a>`).join('')}</nav>
      <div class="header__cta">
        <a class="header__account" href="/entrar" data-account>Entrar</a>
        <a class="btn btn--brass btn--small" href="/reservar">Reservar sala</a>
      </div>
    </div>
  </div>
</header>`;
}

function footer() {
  return `<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div><p class="keytag"><strong>Fechadura</strong>${esc(VENUE.street)}<br>${esc(VENUE.postalCode)} ${esc(VENUE.city)}</p></div>
      <div><h2>Salas</h2><ul><li><a href="/salas/banco-rua-das-flores">O Banco da Rua das Flores</a></li><li><a href="/salas/farol-apagado">O Farol Apagado</a></li><li><a href="/salas/quarto-207">Quarto 207</a></li><li><a href="/salas/cave-da-avo">A Cave da Avó</a></li></ul></div>
      <div><h2>Horário</h2><ul><li>Terça a sexta, 17h30 às 23h</li><li>Sábado e domingo, 10h30 às 23h</li><li>Fechado à segunda</li></ul></div>
      <div><h2>Contactos</h2><ul><li><a href="tel:${VENUE.phone.replace(/\s/g, '')}">${esc(VENUE.phone)}</a></li><li><a href="mailto:${VENUE.email}">${esc(VENUE.email)}</a></li><li><a href="/antes-de-vir">Perguntas frequentes</a></li><li><a href="/vouchers">Oferecer um voucher</a></li></ul></div>
    </div>
    <div class="footer__bottom"><span>Fechadura · escape rooms no Porto</span><span>Ninguém fica fechado aqui: há sempre um botão para sair.</span></div>
  </div>
</footer>`;
}

export function documentHtml({ page, body, path, scripts = [], data = '', bodyClass = '' }) {
  return `<!doctype html>
<html lang="pt-PT">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${renderHead({ ...page, path: page.path ?? path })}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/fonts/anton.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/css/app.css?v=${VERSION}">
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
  <a class="skip" href="#conteudo">Saltar para o conteúdo</a>
  ${header(path)}
  <main id="conteudo">
${body}
  </main>
  ${footer()}
  ${data}
  <script type="module" src="/js/site.js?v=${VERSION}"></script>
  ${scripts.map((s) => `<script type="module" src="/js/pages/${s}.js?v=${VERSION}"></script>`).join('\n  ')}
</body>
</html>`;
}
