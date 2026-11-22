import { renderHead } from '../seo/head.js';
import { MUNICIPIO } from '../config/municipio.js';
import { crest, esc, icon } from './html.js';

export const VERSION = Date.now().toString(36);

const NAV = [
  ['/municipio', 'Município'],
  ['/servicos', 'Serviços'],
  ['/viver', 'Viver'],
  ['/visitar', 'Visitar'],
  ['/investir', 'Investir'],
  ['/atualidade', 'Atualidade'],
];

const isCurrent = (path, href) => (href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`));
const current = (path, href) => (isCurrent(path, href) ? ' aria-current="page"' : '');

// Gradientes usados pelos ícones ilustrados dos serviços
const GRADIENTS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4fa6"/><stop offset="1" stop-color="#4a2669"/></linearGradient>
<linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4cf6a"/><stop offset="1" stop-color="#d79f22"/></linearGradient>
<linearGradient id="gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fc2ec"/><stop offset="1" stop-color="#4f7fc4"/></linearGradient>
</defs></svg>`;

const brand = (alt = 'Brasão de Freixo de Espada à Cinta') =>
  `<a class="brand" href="/">${crest(46, '', alt)}<span><b>Freixo de Espada à Cinta</b><small>Município</small></span></a>`;

function header(path) {
  return `<header class="site-head">
  <div class="util"><div class="wrap">
    <span>Município de Freixo de Espada à Cinta · Distrito de ${MUNICIPIO.district}</span>
    <nav aria-label="Ajuda"><span><b>PT</b> · EN · ES</span><a href="/contactos#acessibilidade">Acessibilidade</a><a href="/contactos">Contactos</a></nav>
  </div></div>
  <div class="bar"><div class="wrap">
    ${brand()}
    <nav class="menu" aria-label="Principal">${NAV.map(([href, label]) => `<a href="${href}"${current(path, href)}>${label}</a>`).join('')}</nav>
    <div class="acts">
      <a class="round find" href="/servicos" aria-label="Procurar um serviço">${icon.search}</a>
      <a class="bo" href="/balcao" data-account>${icon.calendar}<span>Balcão Online</span></a>
      <button class="round burger" type="button" aria-label="Abrir o menu" aria-expanded="false" aria-controls="drawer">${icon.menu}</button>
    </div>
  </div></div>
</header>
<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Menu">
  <div class="top">
    ${brand('')}
    <button class="round close" type="button" aria-label="Fechar o menu">${icon.close}</button>
  </div>
  <div class="body">
    <form class="search" role="search" action="/servicos" method="get">${icon.search}<input type="search" name="q" placeholder="O que precisa de tratar?" aria-label="O que precisa de tratar?" autocomplete="off"></form>
    <ul>${[['/', 'Início'], ...NAV, ['/contactos', 'Contactos']].map(([href, label]) => `<li><a href="${href}"${current(path, href)}>${label}</a></li>`).join('')}</ul>
    <a class="bo" href="/balcao" data-account>${icon.calendar}<span>Balcão Online</span></a>
    <div class="lang"><b>PT</b><span>EN</span><span>ES</span><a href="/contactos#acessibilidade">Acessibilidade</a></div>
  </div>
</div>`;
}

function footer() {
  return `<footer><div class="wrap">
  <div class="fg">
    <div>${brand('')}<p>Paços do Concelho · atendimento nos dias úteis, das ${esc(MUNICIPIO.hours[0][1].split('–')[0])} às ${esc(MUNICIPIO.hours[0][1].split('–')[1])} e das ${esc(MUNICIPIO.hours[1][1].split('–')[0])} às ${esc(MUNICIPIO.hours[1][1].split('–')[1])}.</p></div>
    <div><h2 class="fh">Município</h2><ul><li><a href="/municipio#camara">Câmara Municipal</a></li><li><a href="/municipio#assembleia">Assembleia Municipal</a></li><li><a href="/municipio#freguesias">Freguesias</a></li><li><a href="/municipio#historia">História e brasão</a></li><li><a href="/contactos">Contactos</a></li></ul></div>
    <div><h2 class="fh">Serviços</h2><ul><li><a href="/balcao">Balcão Online</a></li><li><a href="/servicos?categoria=agua">Água e resíduos</a></li><li><a href="/servicos?categoria=obras">Obras e urbanismo</a></li><li><a href="/contactos#ocorrencia">Reportar ocorrência</a></li><li><a href="/viver#mobilidade">Transporte a pedido</a></li></ul></div>
    <div><h2 class="fh">Informação</h2><ul><li><a href="/municipio#transparencia">Transparência</a></li><li><a href="/atualidade#editais">Editais e avisos</a></li><li><a href="/contactos#dados">Proteção de dados</a></li><li><a href="/contactos#acessibilidade">Acessibilidade</a></li><li><a href="/contactos#reclamacoes">Livro de reclamações</a></li></ul></div>
  </div>
  <p class="credits">Fotografias via Wikimedia Commons: Penedo Durão e rio Douro — VetK2O3, CC BY-SA 4.0 · Torre do Galo e praia da Congida — Vitor Oliveira, CC BY-SA 2.0 · Igreja Matriz — Maragato1976, CC BY-SA 3.0 · A vila vista do alto — Carlos Cunha, CC BY-SA 3.0 · Casulos de seda — Guy Moll, CC BY 2.0 · Amendoeiras em flor — ManuelBarreira, CC BY-SA 3.0. Notícias, agenda, avisos e prazos são conteúdo de exemplo.</p>
  <div class="fine"><span>Proposta de redesign não oficial · conceito de portefólio, sem ligação ao Município</span><span>Brasão do Município de Freixo de Espada à Cinta</span></div>
</div></footer>`;
}

export function documentHtml({ page, body, path, scripts = [], data = '', bodyClass = '' }) {
  return `<!doctype html>
<html lang="pt-PT">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${renderHead({ ...page, path: page.path ?? path })}
  <link rel="icon" href="/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preload" href="/fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/public-sans.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/css/app.css?v=${VERSION}">
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
  <a class="skip" href="#conteudo">Saltar para o conteúdo</a>
  ${GRADIENTS}
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
