import { SITE } from '../config/site.js';
import { renderHead } from '../seo/head.js';

export const VERSION = Date.now().toString(36);

const NAV = [
  ['/trabalhos', 'Trabalhos'],
  ['/servicos', 'Serviços'],
  ['/estudio', 'Estúdio'],
  ['/diario', 'Diário'],
];

const isCurrent = (path, href) => path === href || path.startsWith(`${href}/`);
const current = (path, href) => (isCurrent(path, href) ? ' aria-current="page"' : '');

export const logo = () => `<a class="logo" href="/" aria-label="Pilha, página inicial">pilha<sup aria-hidden="true">®</sup></a>`;

function header(path) {
  return `<header class="site-head">
  <div class="wrap bar">
    ${logo()}
    <nav class="menu" aria-label="Principal">${NAV.map(([href, label]) => `<a href="${href}"${current(path, href)}>${label}</a>`).join('')}<a class="menu__cta" href="/contacto"${current(path, '/contacto')}>Falar</a></nav>
    <a class="enter" href="/entrar" data-account>Entrar</a>
    <button class="burger" type="button" aria-label="Abrir o menu" aria-expanded="false" aria-controls="gaveta"><span aria-hidden="true"></span></button>
  </div>
</header>
<div class="drawer" id="gaveta" role="dialog" aria-modal="true" aria-label="Menu" hidden>
  <div class="drawer__top">${logo()}<button class="burger burger--close" type="button" aria-label="Fechar o menu"><span aria-hidden="true"></span></button></div>
  <ul class="drawer__list">${[['/', 'Início'], ...NAV, ['/contacto', 'Falar connosco']].map(([href, label], i) => `<li class="dl dl--${i}"><a href="${href}"${href === '/' ? (path === '/' ? ' aria-current="page"' : '') : current(path, href)}>${label}</a></li>`).join('')}</ul>
  <a class="drawer__enter" href="/entrar" data-account>Entrar na área de cliente</a>
</div>`;
}

function footer() {
  return `<footer class="site-foot">
  <div class="wrap">
    <div class="foot-cta">
      <p class="foot-cta__big">Tens um problema<br>que não cabe em lado nenhum?</p>
      <a class="btn btn--yellow" href="/contacto">Atira-no-lo</a>
    </div>
    <div class="foot-grid">
      <div><h2 class="fh">Estúdio</h2><p>${SITE.area}<br>${SITE.hours}<br><a href="mailto:${SITE.email}">${SITE.email}</a></p></div>
      <div><h2 class="fh">Blocos</h2><ul><li><a href="/servicos/marcas">Marcas</a></li><li><a href="/servicos/sites">Sites e lojas</a></li><li><a href="/servicos/movimento">Movimento</a></li><li><a href="/servicos/rotulos">Rótulos</a></li><li><a href="/servicos/livros">Livros</a></li></ul></div>
      <div><h2 class="fh">Por aqui</h2><ul><li><a href="/trabalhos">Trabalhos</a></li><li><a href="/estudio">Quem somos</a></li><li><a href="/diario">Diário</a></li><li><a href="/contacto">Pedir orçamento</a></li><li><a href="/entrar">Área de cliente</a></li></ul></div>
    </div>
    <p class="foot-word" aria-hidden="true">pilha</p>
    <p class="fine">Estúdio fictício, criado para demonstração: pessoas, clientes e trabalhos são inventados.</p>
  </div>
</footer>`;
}

export function documentHtml({ page, body, path, scripts = [], data = '', bodyClass = '', chrome = true, preload = [] }) {
  return `<!doctype html>
<html lang="pt-PT">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${renderHead({ ...page, path: page.path ?? path })}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preload" href="/fonts/archivo.woff2" as="font" type="font/woff2" crossorigin>
  ${preload.map((p) => `<link rel="preload" as="image" href="${p}-800.webp" imagesrcset="${[480, 800, 1200].map((w) => `${p}-${w}.webp ${w}w`).join(', ')}" imagesizes="(max-width: 700px) 100vw, 60vw" fetchpriority="high">`).join('\n  ')}
  <link rel="stylesheet" href="/css/app.css?v=${VERSION}">
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
  <a class="skip" href="#conteudo">Saltar para o conteúdo</a>
  ${chrome ? header(path) : ''}
  <main id="conteudo">
${body}
  </main>
  ${chrome ? footer() : ''}
  ${data}
  <script type="module" src="/js/site.js?v=${VERSION}"></script>
  ${scripts.map((s) => `<script type="module" src="/js/pages/${s}.js?v=${VERSION}"></script>`).join('\n  ')}
</body>
</html>`;
}
