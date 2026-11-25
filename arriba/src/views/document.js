import { SITE } from '../config/site.js';
import { renderHead } from '../seo/head.js';

export const VERSION = Date.now().toString(36);

const NAV = [
  ['/quartos', 'Quartos'],
  ['/restaurante', 'Restaurante'],
  ['/#casa', 'A casa'],
  ['/#sagres', 'Sagres'],
  ['/#chegar', 'Como chegar'],
];

const isCurrent = (path, href) => !href.includes('#') && (path === href || path.startsWith(`${href}/`));
const current = (path, href) => (isCurrent(path, href) ? ' aria-current="page"' : '');

export const logo = () => `<a class="logo" href="/" aria-label="Arriba, página inicial"><b>Arriba</b><span aria-hidden="true">Sagres</span></a>`;

function header(path) {
  return `<header class="topo">
  <div class="cx topo__barra">
    ${logo()}
    <nav class="nav" aria-label="Principal">${NAV.map(([href, label]) => `<a href="${href}"${current(path, href)}>${label}</a>`).join('')}</nav>
    <a class="topo__conta" href="/entrar" data-account>Entrar</a>
    <a class="btn topo__reservar" href="/reservar">Reservar</a>
    <button class="menu" type="button" aria-expanded="false" aria-controls="gaveta">Menu <i aria-hidden="true"></i></button>
  </div>
</header>
<div class="gaveta" id="gaveta" role="dialog" aria-modal="true" aria-label="Menu" hidden>
  <div class="gaveta__topo">${logo()}<button class="menu menu--fechar" type="button">Fechar <i aria-hidden="true"></i></button></div>
  <ul>${[['/', 'Início'], ...NAV, ['/reservar', 'Reservar']].map(([href, label]) => `<li><a href="${href}"${href === '/' ? (path === '/' ? ' aria-current="page"' : '') : current(path, href)}>${label}</a></li>`).join('')}</ul>
  <a class="gaveta__conta" href="/entrar" data-account>Entrar na minha reserva</a>
</div>`;
}

function footer() {
  return `<footer class="rodape">
  <div class="cx rodape__grelha">
    <div>${logo()}<p>${SITE.tagline}, na ponta sudoeste de Portugal.</p></div>
    <div><h2>Hotel</h2><ul><li><a href="/quartos">Quartos</a></li><li><a href="/restaurante">Restaurante</a></li><li><a href="/#casa">A casa</a></li><li><a href="/#sagres">Sagres à volta</a></li></ul></div>
    <div><h2>Estadia</h2><ul><li><a href="/reservar">Reservar</a></li><li><a href="/entrar">Entrar na reserva</a></li><li><a href="/#chegar">Como chegar</a></li></ul></div>
    <div><h2>Contacto</h2><p><a href="mailto:${SITE.email}">${SITE.email}</a><br>Receção aberta 24 horas<br>Entrada a partir das 15h</p></div>
    <p class="rodape__aviso">Hotel fictício, criado para demonstração: nomes, preços e reservas são inventados. Fotografias do Unsplash, dos seus autores.</p>
  </div>
</footer>`;
}

export function documentHtml({ page, body, path, scripts = [], data = '', bodyClass = '', preload = [] }) {
  return `<!doctype html>
<html lang="pt-PT">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${renderHead({ ...page, path: page.path ?? path })}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preload" href="/fonts/newsreader.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/manrope.woff2" as="font" type="font/woff2" crossorigin>
  ${preload.map((p) => `<link rel="preload" as="image" href="${p.href}"${p.srcset ? ` imagesrcset="${p.srcset}" imagesizes="${p.sizes}"` : ''}${p.media ? ` media="${p.media}"` : ''} fetchpriority="high">`).join('\n  ')}
  <link rel="stylesheet" href="/css/app.css?v=${VERSION}">
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
  <a class="saltar" href="#conteudo">Saltar para o conteúdo</a>
  ${header(path)}
  <main id="conteudo">
${body}
  </main>
  ${footer()}
  <div class="sr" id="live" aria-live="polite"></div>
  ${data}
  <script type="module" src="/js/site.js?v=${VERSION}"></script>
  ${scripts.map((s) => `<script type="module" src="/js/pages/${s}.js?v=${VERSION}"></script>`).join('\n  ')}
</body>
</html>`;
}

// Pré-carregamento de uma fotografia com o mesmo srcset que a página usa
export const preloadPhoto = (name, sizes) => ({
  href: `/img/fotos/${name}-800.webp`,
  srcset: [480, 800, 1200].map((w) => `/img/fotos/${name}-${w}.webp ${w}w`).join(', '),
  sizes,
});
