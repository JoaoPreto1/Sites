import { SITE } from '../config/platform.js';
import { renderHead } from '../seo/head.js';
import { isDemo } from '../services/payments/index.js';
import { icon } from './html.js';

export const VERSION = Date.now().toString(36);

const NAV = [
  ['/pedidos', 'Pedidos'],
  ['/como-funciona', 'Como funciona'],
  ['/manter', 'Manter a plataforma'],
  ['/transparencia', 'Transparência'],
];

const isCurrent = (path, href) => path === href || path.startsWith(`${href}/`);
const current = (path, href) => (isCurrent(path, href) ? ' aria-current="page"' : '');

export const brand = (tag = 'a') =>
  `<${tag} class="brand"${tag === 'a' ? ' href="/"' : ''}><svg class="brand__mark" viewBox="0 0 40 40" aria-hidden="true"><path d="M8 4h24v30l-4-3-4 3-4-3-4 3-4-3-4 3z" fill="#fbf8f1" stroke="#1c1a17" stroke-width="2.4" stroke-linejoin="round"/><path d="M13 13h14M13 19h9" stroke="#1c1a17" stroke-width="2.4" stroke-linecap="round"/><circle cx="25" cy="23" r="5.5" fill="#1d6b4f"/><path d="M22.6 23.2l1.8 1.8 3.2-3.6" fill="none" stroke="#fbf8f1" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${SITE.name.toLowerCase()}</span></${tag}>`;

const demoStrip = () =>
  isDemo
    ? `<div class="demo-strip" role="note"><div class="wrap"><b>Demonstração.</b> Pedidos, pessoas e montantes são fictícios. Nenhum pagamento é real e a plataforma ainda não aceita dinheiro. <a href="/transparencia#lancamento">O que falta definir</a></div></div>`
    : '';

function header(path) {
  return `${demoStrip()}<header class="site-head">
  <div class="wrap bar">
    ${brand()}
    <nav class="menu" aria-label="Principal">${NAV.map(([href, label]) => `<a href="${href}"${current(path, href)}>${label}</a>`).join('')}</nav>
    <div class="acts">
      <a class="btn btn--ghost btn--sm ask-cta" href="/conta/novo-pedido">Pedir ajuda</a>
      <a class="btn btn--ink btn--sm" href="/entrar" data-account>${icon.user}<span>Entrar</span></a>
      <button class="burger" type="button" aria-label="Abrir o menu" aria-expanded="false" aria-controls="drawer">${icon.menu}</button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Menu" hidden>
  <div class="drawer__top">${brand()}<button class="burger drawer__close" type="button" aria-label="Fechar o menu">${icon.close}</button></div>
  <ul>${[['/', 'Início'], ...NAV, ['/privacidade', 'Privacidade e segurança']].map(([href, label]) => `<li><a href="${href}"${href === '/' ? (path === '/' ? ' aria-current="page"' : '') : current(path, href)}>${label}</a></li>`).join('')}</ul>
  <div class="drawer__acts"><a class="btn btn--ink" href="/entrar" data-account>${icon.user}<span>Entrar</span></a><a class="btn btn--ghost" href="/conta/novo-pedido">Pedir ajuda</a></div>
</div>`;
}

function footer() {
  return `<footer class="site-foot"><div class="wrap">
  <div class="foot-grid">
    <div class="foot-brand">${brand()}<p>Uma conta serve para pedir ajuda e para ajudar. Os pedidos são moderados antes de aparecerem e os dados pessoais nunca são públicos.</p></div>
    <div><h2 class="fh">Pedidos</h2><ul><li><a href="/pedidos">Ver pedidos</a></li><li><a href="/conta/novo-pedido">Pedir ajuda</a></li><li><a href="/como-funciona#doar">Como doar</a></li><li><a href="/como-funciona#informacao">Pedir mais informação</a></li></ul></div>
    <div><h2 class="fh">A plataforma</h2><ul><li><a href="/manter">Manter a plataforma</a></li><li><a href="/transparencia">Transparência</a></li><li><a href="/transparencia#lancamento">Antes do lançamento</a></li><li><a href="/como-funciona#denunciar">Denunciar um pedido</a></li></ul></div>
    <div><h2 class="fh">Os seus dados</h2><ul><li><a href="/privacidade">Privacidade e segurança</a></li><li><a href="/condicoes">Condições de utilização</a></li><li><a href="/conta#dados">Descarregar ou apagar dados</a></li><li><a href="/como-funciona#comissoes">Comissões</a></li></ul></div>
  </div>
  <div class="fine"><span>Projeto de demonstração · dados fictícios · nenhum pagamento real</span><span>A segurança exige manutenção contínua: nenhuma plataforma é infalível.</span></div>
</div></footer>`;
}

export function documentHtml({ page, body, path, scripts = [], data = '', bodyClass = '', chrome = true }) {
  return `<!doctype html>
<html lang="pt-PT">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${renderHead({ ...page, path: page.path ?? path })}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preload" href="/fonts/bricolage.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/atkinson.woff2" as="font" type="font/woff2" crossorigin>
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
