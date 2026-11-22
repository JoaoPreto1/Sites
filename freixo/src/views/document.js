import { renderHead } from '../seo/head.js';
import { MUNICIPIO, SOCIAL } from '../config/municipio.js';
import { crest, esc, icon } from './html.js';

export const VERSION = Date.now().toString(36);

const NAV = [
  ['/municipio', 'Município', 'Quem decide, as freguesias e a história do concelho.', [
    ['/municipio#camara', 'Câmara Municipal', 'Presidente, vereadores e pelouros'],
    ['/municipio#assembleia', 'Assembleia Municipal', 'Sessões e como intervir'],
    ['/municipio#freguesias', 'Juntas de freguesia', 'Moradas, telefones e horários'],
    ['/municipio#historia', 'História e brasão', 'Forais, lendas e personalidades'],
    ['/municipio#transparencia', 'Transparência', 'Taxas, PDM, contratos e ética'],
  ]],
  ['/servicos', 'Serviços', 'O que pode tratar, o que levar e quanto demora.', [
    ['/balcao', 'Balcão Online', 'Pedidos, faturas e leituras'],
    ['/servicos?categoria=agua', 'Água e resíduos', 'Contratos, tarifário social, monos'],
    ['/servicos?categoria=obras', 'Obras e urbanismo', 'Licenças, plantas, queimas, BUPi'],
    ['/servicos?categoria=social', 'Ação social', 'Habitação, bebé, saúde, cuidadores'],
    ['/servicos?categoria=educacao', 'Educação', 'Transporte escolar e estudantes'],
    ['/contactos#ocorrencia', 'Reportar ocorrência', 'Um problema na rua'],
  ]],
  ['/viver', 'Viver', 'Casa, escola, saúde, apoios e tempo livre.', [
    ['/viver#chegar', 'Mudar-se para cá', 'Os primeiros passos'],
    ['/viver#apoios', 'Apoios do Município', 'Oito apoios para famílias'],
    ['/viver#educacao', 'Educação e saúde', 'Escolas, consultas e medicação'],
    ['/equipamentos', 'Equipamentos municipais', 'Museus, piscinas, biblioteca'],
    ['/viver#ambiente', 'Resíduos e água', 'Ecocentro e recolhas'],
  ]],
  ['/visitar', 'Visitar', 'A vila mais manuelina de Portugal e o Douro Internacional.', [
    ['/visitar#patrimonio', 'Património', 'Torre do Galo e Igreja Matriz'],
    ['/equipamentos#cultura', 'Museus', 'Seda, Casa Junqueiro, biblioteca'],
    ['/visitar#natureza', 'Natureza', 'Penedo Durão e Congida'],
    ['/visitar#tradicoes', 'Tradições', 'Seda, amendoeiras, Sete Passos'],
    ['/visitar#roteiro', 'Um dia em Freixo', 'Roteiro e informação prática'],
  ]],
  ['/investir', 'Investir', 'Apoios e acompanhamento para quem quer investir.', [
    ['/investir', 'Porquê aqui', 'Produtos, turismo e fronteira'],
    ['/investir#contacto', 'Falar com o Município', 'Conte-nos o seu projeto'],
  ]],
  ['/atualidade', 'Atualidade', 'Notícias, agenda, avisos e editais.', [
    ['/atualidade#noticias', 'Notícias', 'O que se passa no concelho'],
    ['/atualidade#agenda', 'Agenda', 'Eventos e festas do ano'],
    ['/atualidade#avisos', 'Avisos', 'Cortes, trânsito e recolhas'],
    ['/atualidade#editais', 'Editais', 'Documentos oficiais'],
  ]],
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

const seasonPill = (epoca) => {
  if (epoca?.active) return `<button class="season-pill on" type="button" data-epoca-set="normal">Voltar à versão habitual</button>`;
  if (epoca?.offer) return `<button class="season-pill" type="button" data-epoca-set="${epoca.offer.id}"><span class="season-dot" aria-hidden="true"></span>${epoca.offer.pill}</button>`;
  return '';
};

function header(path, epoca) {
  return `<header class="site-head">
  <div class="util"><div class="wrap">
    <span>Município de Freixo de Espada à Cinta · Distrito de ${MUNICIPIO.district}</span>
    <nav aria-label="Ajuda">${seasonPill(epoca)}<span><b>PT</b> · EN · ES</span><a href="/contactos#acessibilidade">Acessibilidade</a><a href="/contactos">Contactos</a></nav>
  </div></div>
  <div class="bar"><div class="wrap">
    ${brand()}
    <nav class="menu" aria-label="Principal">${NAV.map(([href, label, lead, items]) => `<div class="menu__item"><a href="${href}"${current(path, href)}>${label}</a><div class="mega"><div class="mega__in"><div class="mega__lead"><p class="k">${label}</p><p>${lead}</p><a class="link" href="${href}">Ver tudo →</a></div><ul>${items.map(([h, l, s]) => `<li><a href="${h}"><b>${l}</b><small>${s}</small></a></li>`).join('')}</ul></div></div></div>`).join('')}</nav>
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
    <ul>${[['/', 'Início'], ...NAV, ['/contactos', 'Contactos'], ['/equipamentos', 'Equipamentos']].map(([href, label]) => `<li><a href="${href}"${current(path, href)}>${label}</a></li>`).join('')}</ul>
    <a class="bo" href="/balcao" data-account>${icon.calendar}<span>Balcão Online</span></a>
    ${seasonPill(epoca)}
    <div class="lang"><b>PT</b><span>EN</span><span>ES</span><a href="/contactos#acessibilidade">Acessibilidade</a></div>
  </div>
</div>`;
}

function footer() {
  return `<footer><div class="wrap">
  <div class="fg">
    <div>${brand('')}<p>${esc(MUNICIPIO.address)} · ${esc(MUNICIPIO.postal)}<br><a href="tel:+351${MUNICIPIO.phone.replace(/\s/g, '')}">${esc(MUNICIPIO.phone)}</a> · <a href="mailto:${MUNICIPIO.email}">${esc(MUNICIPIO.email)}</a><br>Dias úteis, ${MUNICIPIO.hours.map(([, h]) => h).join(' e ')}</p><p class="socials">${SOCIAL.map(([n, u]) => `<a href="${u}" rel="noopener">${n}</a>`).join('')}</p></div>
    <div><h2 class="fh">Município</h2><ul><li><a href="/municipio#camara">Câmara Municipal</a></li><li><a href="/municipio#assembleia">Assembleia Municipal</a></li><li><a href="/municipio#freguesias">Freguesias</a></li><li><a href="/municipio#historia">História e brasão</a></li><li><a href="/contactos">Contactos</a></li></ul></div>
    <div><h2 class="fh">Serviços</h2><ul><li><a href="/balcao">Balcão Online</a></li><li><a href="/servicos?categoria=agua">Água e resíduos</a></li><li><a href="/servicos?categoria=obras">Obras e urbanismo</a></li><li><a href="/contactos#ocorrencia">Reportar ocorrência</a></li><li><a href="/viver#mobilidade">Transporte a pedido</a></li></ul></div>
    <div><h2 class="fh">Informação</h2><ul><li><a href="/municipio#transparencia">Transparência</a></li><li><a href="/atualidade#editais">Editais e avisos</a></li><li><a href="/contactos#dados">Proteção de dados</a></li><li><a href="/contactos#acessibilidade">Acessibilidade</a></li><li><a href="/contactos#reclamacoes">Livro de reclamações</a></li></ul></div>
  </div>
  <p class="credits">Fotografias via Wikimedia Commons: Penedo Durão e rio Douro — VetK2O3, CC BY-SA 4.0 · Torre do Galo e praia da Congida — Vitor Oliveira, CC BY-SA 2.0 · Igreja Matriz — Maragato1976, CC BY-SA 3.0 · A vila vista do alto — Carlos Cunha, CC BY-SA 3.0 · Casulos de seda — Guy Moll, CC BY 2.0 · Amendoeiras em flor — ManuelBarreira, CC BY-SA 3.0. Notícias, agenda, avisos e prazos são conteúdo de exemplo.</p>
  <div class="fine"><span>Proposta de redesign não oficial · conceito de portefólio, sem ligação ao Município</span><span>Brasão do Município de Freixo de Espada à Cinta</span></div>
</div></footer>`;
}

export function documentHtml({ page, body, path, scripts = [], data = '', bodyClass = '', epoca = null }) {
  return `<!doctype html>
<html lang="pt-PT"${epoca?.active ? ` data-epoca="${epoca.active.id}"` : ''}>
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
  ${header(path, epoca)}
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
