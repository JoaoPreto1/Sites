import { renderHead } from '../seo/head.js';
import { STUDIO } from '../config/studio.js';
import { esc } from './html.js';

export const VERSION = Date.now().toString(36);

const NAV = [
  ['/', 'Início'],
  ['/projetos', 'Projetos'],
  ['/sobre', 'Sobre'],
  ['/contactos', 'Contactos'],
];

function header(path) {
  const current = (href) => (href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`)) ? ' aria-current="page"' : '';
  return `<header class="header">
  <div class="wrap header__row">
    <a class="logo" href="/"><span>LEONOR CASTELO</span><small>ARQUITETURA</small></a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" aria-label="Abrir o menu"><span></span><span></span></button>
    <div class="header__panel" id="menu">
      <nav class="nav" aria-label="Principal">${NAV.map(([href, label]) => `<a href="${href}"${current(href)}>${label}</a>`).join('')}</nav>
      <a class="header__account" href="/entrar" data-account>Área de cliente</a>
    </div>
  </div>
</header>`;
}

function footer() {
  const [hq, branch] = STUDIO.offices;
  return `<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div><p class="footer__brand">Leonor Castelo<br><em>arquitetura</em></p><p class="footer__lead">Casas desenhadas à mão, do primeiro esboço à entrega das chaves.</p></div>
      ${[hq, branch].map((o) => `<div><h2>${esc(o.label)}</h2><p>${esc(o.street)}<br>${esc(o.postalCode)} ${esc(o.city)}</p><p class="footer__muted">${esc(o.hours)}</p></div>`).join('')}
      <div><h2>Contactos</h2><p><a href="mailto:${STUDIO.email}">${esc(STUDIO.email)}</a><br><a href="tel:${STUDIO.phone.replace(/\s/g, '')}">${esc(STUDIO.phone)}</a></p><p class="footer__muted">${STUDIO.social.map(([n, u]) => `<a href="${u}" rel="noopener">${n}</a>`).join(' · ')}</p></div>
    </div>
    <div class="footer__bottom"><span>© ${new Date().getFullYear()} ${esc(STUDIO.brand)}</span><span>Folha LC-000 · desenhada à escala 1:1</span></div>
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
  <link rel="preload" href="/fonts/newsreader-300.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/plex-mono-400.woff2" as="font" type="font/woff2" crossorigin>
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
