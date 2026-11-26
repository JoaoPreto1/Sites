import { SITE } from '../config/site.js';
import { renderHead } from '../seo/head.js';
import { photo, srcsetOf } from './html.js';

export const VERSION = Date.now().toString(36);

const NAV = [
  ['/quartos', 'Quartos'],
  ['/a-casa', 'A casa'],
  ['/restaurante', 'Restaurante'],
  ['/sagres', 'Sagres'],
  ['/como-chegar', 'Como chegar'],
];

const current = (path, href) => (path === href || path.startsWith(`${href}/`) ? ' aria-current="page"' : '');

function header(path, solid) {
  return `<header class="cab${solid ? ' cab--solido' : ''}" data-cab>
  <button class="cab__menu" type="button" aria-expanded="false" aria-controls="menu" data-abrir-menu><i aria-hidden="true"></i><span>Menu</span></button>
  <a class="cab__logo" href="/" aria-label="Arriba, página inicial">Arriba</a>
  <div class="cab__dir">
    <a class="cab__conta" href="/entrar" data-account>A minha reserva</a>
    <a class="cab__reservar" href="/reservar">Reservar</a>
  </div>
</header>
<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu" hidden>
  <div class="menu__topo"><button class="cab__menu" type="button" data-fechar-menu><i aria-hidden="true" class="x"></i><span>Fechar</span></button><a class="cab__logo" href="/">Arriba</a><a class="cab__reservar" href="/reservar">Reservar</a></div>
  <div class="menu__corpo">
    <ol class="menu__lista">${[['/', 'Início'], ...NAV].map(([href, label], i) => `<li><a href="${href}"${href === '/' ? (path === '/' ? ' aria-current="page"' : '') : current(path, href)}><span>0${i + 1}</span>${label}</a></li>`).join('')}</ol>
    <div class="menu__foto" aria-hidden="true">${photo('arcosbrancos', { sizes: '30vw', alt: '' })}</div>
  </div>
  <div class="menu__pe"><span>${SITE.email}</span><span>Receção aberta 24 horas</span><a href="/entrar" data-account>A minha reserva</a></div>
</div>`;
}

function footer() {
  return `<footer class="rod">
  <div class="rod__t">
    <p class="rod__big">Até breve,<br><em>no fim da estrada.</em></p>
    <div><h2>Hotel</h2><ul><li><a href="/quartos">Quartos</a></li><li><a href="/a-casa">A casa</a></li><li><a href="/restaurante">Restaurante</a></li><li><a href="/sagres">Sagres</a></li></ul></div>
    <div><h2>Estadia</h2><ul><li><a href="/reservar">Reservar</a></li><li><a href="/entrar">A minha reserva</a></li><li><a href="/como-chegar">Como chegar</a></li></ul></div>
    <div><h2>Escrever</h2><p><a href="mailto:${SITE.email}">${SITE.email}</a><br>Receção aberta 24 horas<br>Sagres, Vila do Bispo</p></div>
  </div>
  <p class="rod__w" aria-hidden="true">Arriba</p>
  <div class="rod__b"><span>Hotel fictício, criado para demonstração: nomes, preços e reservas são inventados.</span><span>Fotografias do Unsplash, dos seus autores.</span></div>
</footer>`;
}

export function documentHtml({ page, body, path, scripts = [], data = '', bodyClass = '', preload = [], solid = false }) {
  return `<!doctype html>
<html lang="pt-PT">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${renderHead({ ...page, path: page.path ?? path })}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preload" href="/fonts/instrument-serif.woff2" as="font" type="font/woff2" crossorigin>
  ${preload.map((p) => `<link rel="preload" as="image" href="${p.href}"${p.srcset ? ` imagesrcset="${p.srcset}" imagesizes="${p.sizes}"` : ''}${p.media ? ` media="${p.media}"` : ''} fetchpriority="high">`).join('\n  ')}
  <link rel="stylesheet" href="/css/app.css?v=${VERSION}">
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
  <a class="saltar" href="#conteudo">Saltar para o conteúdo</a>
  ${header(path, solid)}
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
export const preloadPhoto = (name, sizes = '100vw') => ({
  href: `/img/fotos/${name}-800.webp`,
  srcset: srcsetOf(name),
  sizes,
});
