import { FREGUESIAS, MUNICIPIO } from '../../config/municipio.js';
import { PHOTO_CREDITS, crest, dateLong, dateShort, dayNum, esc, facts, icon, monthShort, photo, searchForm, serviceArt } from '../html.js';

const FEATURED = [
  ['balcao', 'Balcão Online', 'Pedidos e requerimentos', '/balcao'],
  ['agua', 'Água e resíduos', 'Leituras e faturas', '/servicos?categoria=agua'],
  ['obras', 'Obras e urbanismo', 'Licenças e PDM', '/servicos?categoria=obras'],
  ['social', 'Ação social', 'Apoios e cartão social', '/servicos?categoria=social'],
  ['educacao', 'Educação', 'Matrículas e transportes', '/servicos?categoria=educacao'],
  ['ocorrencia', 'Reportar ocorrência', 'Buracos, luz, lixo', '/contactos#ocorrencia'],
];

const LIVE = [
  ['fixar', icon.home, 'Fixar-se', 'Apoios à habitação, à natalidade e a quem vem trabalhar para o interior.', ['Apoio à fixação', 'Habitação']],
  ['educacao', icon.school, 'Educação', 'Escolas, refeições e transporte escolar para todas as aldeias.', ['Matrículas', 'Bolsas de estudo']],
  ['saude', icon.heart, 'Saúde e apoio social', 'Centro de saúde, apoio domiciliário e respostas para os mais velhos.', ['Cartão social', 'Teleassistência']],
  ['mobilidade', icon.bus, 'Mobilidade', 'Transporte a pedido entre as aldeias e a vila, e ligações regionais.', ['Marcar viagem', 'Como chegar']],
];

const VISIT = [
  ['torre', 'torre', 'Castelo', 'Torre do Galo', 'A torre heptagonal do castelo, com o relógio que marca a meia-noite da Procissão dos Sete Passos.'],
  ['penedo', 'douro', 'Miradouro', 'Penedo Durão'],
  ['matriz', 'matriz', 'Monumento Nacional', 'Igreja Matriz'],
  ['congida', 'congida', 'Praia fluvial', 'Congida'],
  ['seda', 'seda', 'Tradição viva', 'Seda de Freixo'],
];

const NOTICE_DOT = { agua: '#e3b23c', transito: '#c0573a', ambiente: '#3d8b4f', geral: '#56307a' };

export function homeBody({ news, events, notices, editais, desk }) {
  const [lead, second] = news;
  const notice = notices[0];
  const next = events[0];

  return `<section class="hero">
  ${photo('penedo', 'O vale do Douro visto do miradouro do Penedo Durão', { eager: true, fit: 1600, sizes: '100vw' })}
  <div class="center wrap">
    ${crest(132, 'crest')}
    <p class="k">Município de</p>
    <h1>Freixo de <i>Espada à Cinta</i></h1>
    <p class="sub">Vila manuelina debruçada sobre as arribas do Douro Internacional.</p>
    ${searchForm()}
    <div class="chips"><em>Mais procurados</em><a href="/servicos#leitura-agua">Leitura da água</a><a href="/servicos#licenca-obras">Licença de obras</a><a href="/viver#mobilidade">Transporte a pedido</a><a href="/atualidade#editais">Editais</a></div>
  </div>
  <p class="credit">${esc(PHOTO_CREDITS.penedo)}</p>
</section>

<div class="wrap">
  <nav class="services" aria-label="Serviços mais usados">
    ${FEATURED.map(([art, title, sub, href], i) => `<a class="s${i === 0 ? ' on' : ''}" href="${href}">${serviceArt[art]}<b>${title}</b><small>${sub}</small></a>`).join('\n    ')}
  </nav>

  <section class="today" aria-label="Hoje no concelho">
    <h2 class="lab">Hoje no concelho</h2>
    ${notice ? `<a class="i" href="/atualidade#avisos"><i class="dot" style="background:${NOTICE_DOT[notice.type]}"></i><span><b>${esc(notice.title)}</b><span>${esc(notice.when)}</span></span></a>` : ''}
    <a class="i" href="/contactos"><i class="dot" style="background:${desk.open ? '#3d8b4f' : '#a99bb8'}"></i><span><b>Paços do Concelho</b><span>${esc(desk.text)}</span></span></a>
    ${next ? `<a class="i" href="/atualidade#agenda"><i class="dot" style="background:#56307a"></i><span><b>${esc(next.title)}</b><span>${dateShort(next.date)} · ${esc(next.place.split(' · ')[0])}</span></span></a>` : ''}
  </section>
</div>

<section class="sec wrap">
  <div class="split">
    <div>
      <p class="k">O concelho</p>
      <h2 class="t2">Uma vila raiana entre o Douro e Espanha.</h2>
      <div class="prose" style="margin-top:18px">
        <p>Freixo de Espada à Cinta fica no extremo sul do distrito de Bragança, na sub-região do Douro. A leste e a sul, o rio Douro faz a fronteira com Castela e Leão; todas as freguesias estão, no todo ou em parte, dentro do Parque Natural do Douro Internacional.</p>
        <p>Nos anos 30, o historiador Reynaldo dos Santos chamou-lhe <em>“a vila mais manuelina de Portugal”</em>: estão inventariadas 101 molduras manuelinas em portas e janelas do centro histórico. A Igreja Matriz, de São Miguel, é Monumento Nacional desde 1910.</p>
        <p>É também a terra natal do poeta Guerra Junqueiro, nascido em Ligares em 1850, e de uma tradição de seda que o Município continua a apoiar junto das tecedeiras.</p>
      </div>
      <a class="btn ghost" href="/municipio#historia" style="margin-top:26px">História e brasão do concelho</a>
    </div>
    <aside class="box purple">
      <h2 class="bh">Ficha do concelho</h2>
      ${facts([
        ['Distrito', MUNICIPIO.district],
        ['Sub-região', MUNICIPIO.subregion],
        ['Área', `${MUNICIPIO.areaKm2.toLocaleString('pt-PT')} km²`],
        ['Freguesias', String(FREGUESIAS.length)],
        ['Residentes (Censos 2021)', MUNICIPIO.residents2021.toLocaleString('pt-PT')],
        ['Padroeiro', MUNICIPIO.patron],
        ['Feriado municipal', MUNICIPIO.holiday],
        ['Código postal', MUNICIPIO.postalCode],
      ])}
    </aside>
  </div>
</section>

<section class="sec wrap">
  <div class="h"><div><p class="k">Atualidade</p><h2>Notícias e agenda</h2></div><a href="/atualidade">Todas as notícias →</a></div>
  <div class="news">
    ${lead ? `<a class="card" href="/atualidade/${lead.slug}"><div class="im">${photo(lead.photo, '', { sizes: '(max-width: 640px) 92vw, (max-width: 1180px) 46vw, 560px' })}<span class="badge">${esc(lead.label)}</span></div><time datetime="${lead.date}">${dateLong(lead.date)}</time><h3>${esc(lead.title)}</h3><p>${esc(lead.summary)}</p></a>` : ''}
    ${second ? `<a class="card sm" href="/atualidade/${second.slug}"><div class="im">${photo(second.photo, '', { sizes: '(max-width: 640px) 92vw, (max-width: 1180px) 46vw, 430px' })}<span class="badge">${esc(second.label)}</span></div><time datetime="${second.date}">${dateLong(second.date)}</time><h3>${esc(second.title)}</h3></a>` : ''}
    <aside class="agenda"><h3 class="k">Agenda</h3>
      ${events.slice(0, 4).map((e) => `<div class="ev"><div class="d"><b>${dayNum(e.date)}</b><small>${monthShort(e.date)}</small></div><div><h4>${esc(e.title)}</h4><p>${esc(e.place)}</p></div></div>`).join('\n      ')}
      <a class="all" href="/atualidade#agenda">Ver a agenda completa →</a></aside>
  </div>
</section>

<section class="band dark">
  <div class="wrap">
    <div class="h"><div><p class="k">Viver em Freixo</p><h2>Tudo o que precisa para viver no concelho</h2></div><a href="/viver" style="color:var(--gl)">Guia para novos residentes →</a></div>
    <div class="grid4">
      ${LIVE.map(([id, ic, title, text, list]) => `<a class="info" href="/viver#${id}"><span class="ic">${ic}</span><h3>${title}</h3><p>${text}</p><ul>${list.map((l) => `<li>${l}</li>`).join('')}</ul></a>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="sec wrap">
  <div class="h"><div><p class="k">Visitar</p><h2>Património e natureza</h2></div><a href="/visitar">Guia do visitante →</a></div>
  <div class="visit">
    ${VISIT.map(([id, key, small, title, text], i) => `<a class="photo${i === 0 ? ' big' : ''}" href="/visitar#${id}">${photo(key, '', { sizes: i === 0 ? '(max-width: 1180px) 92vw, 520px' : '(max-width: 640px) 92vw, (max-width: 1180px) 46vw, 380px' })}<span class="go" aria-hidden="true">↗</span><div><small>${small}</small><h3>${title}</h3>${text ? `<p>${text}</p>` : ''}</div></a>`).join('\n    ')}
  </div>
</section>

<section class="sec wrap" id="freguesias">
  <div class="h"><div><p class="k">Território</p><h2>As quatro freguesias</h2></div><a href="/municipio#freguesias">Juntas de freguesia →</a></div>
  <div class="grid4">
    ${FREGUESIAS.map((f) => `<a class="info" href="/municipio#freguesias"><h3>${esc(f.name)}</h3><p>${esc(f.text)}</p><span class="more">${f.residents2021.toLocaleString('pt-PT')} residentes →</span></a>`).join('\n    ')}
  </div>
  <p class="muted" style="margin-top:12px">Residentes segundo os Censos 2021.</p>
</section>

<section class="sec wrap">
  <div class="split">
    <div>
      <div class="h"><div><p class="k">Transparência</p><h2>Editais e avisos recentes</h2></div><a href="/atualidade#editais">Todos →</a></div>
      <ul class="docs">
        ${editais.slice(0, 4).map((d) => `<li><a href="/atualidade#editais"><span class="ft">${d.kind}</span><span><b>${esc(d.title)}</b><small>${esc(d.sub)}</small></span><span class="dt">${dateShort(d.date)}</span><span class="dl">Abrir</span></a></li>`).join('\n        ')}
      </ul>
    </div>
    <aside class="aside" style="top:120px">
      <div class="box tint"><h2 class="bh">Atendimento presencial</h2><p>Paços do Concelho, nos dias úteis das 9h00 às 12h30 e das 14h00 às 17h30.</p><a class="btn purple" href="/contactos">Contactos e horários</a></div>
      <div class="box"><h2 class="bh">Viu um problema na rua?</h2><p>Buracos, iluminação pública avariada ou lixo fora do sítio: diga-nos onde e tratamos.</p><a class="btn ghost" href="/contactos#ocorrencia">Reportar ocorrência</a></div>
    </aside>
  </div>
</section>

<section class="sec wrap">
  <div class="cta"><div><h2>Trate do que precisa sem sair de casa.</h2><p>Pedidos, faturas e leituras da água, licenças e o estado de cada processo no Balcão Online, a qualquer hora.</p></div><a class="btn gold" href="/balcao">Entrar no Balcão Online</a></div>
</section>`;
}
