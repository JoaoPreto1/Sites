import { NEWS_CATEGORIES, NOTICE_TYPES } from '../../config/municipio.js';
import { dateLong, dateShort, dayNum, esc, facts, monthShort, pageHero, photo, subnav, toc } from '../html.js';

const noticeLabel = (type) => NOTICE_TYPES.find(([v]) => v === type)?.[1] ?? 'Aviso';

export function atualidadeBody({ news, events, yearly, notices, editais }) {
  return `${pageHero({ photoKey: 'matriz', crumbs: [['Atualidade']], title: 'O que se passa no <i>concelho</i>', lead: 'Notícias, agenda, avisos à população e editais, sempre atualizados.' })}
${subnav([['noticias', 'Notícias'], ['agenda', 'Agenda'], ['avisos', 'Avisos'], ['editais', 'Editais']])}

<section class="sec wrap" id="noticias">
  <div class="split">
    <div>
      <div class="h"><div><p class="k">Notícias</p><h2>Últimas notícias</h2></div></div>
      <div class="filters" data-filter="#lista" role="group" aria-label="Filtrar notícias">
        <button type="button" class="on" data-cat="todos" aria-pressed="true">Todas</button>${NEWS_CATEGORIES.map(([v, l]) => `<button type="button" data-cat="${v}" aria-pressed="false">${l}</button>`).join('')}
      </div>
      <div class="nlist" id="lista">
        ${news.map((n) => `<a class="nrow" href="/atualidade/${n.slug}" data-cat="${n.cat}">${photo(n.photo, '', { sizes: '(max-width: 640px) 92vw, 260px', fit: 480 })}<div><div class="meta"><b>${esc(n.label)}</b><time datetime="${n.date}">${dateShort(n.date)} ${new Date(n.date).getFullYear()}</time></div><h3>${esc(n.title)}</h3><p>${esc(n.summary)}</p></div></a>`).join('\n        ')}
      </div>
    </div>
    <aside class="aside">
      <div class="box purple"><h2 class="bh">Receba as notícias</h2><p>Uma vez por mês, no seu email: notícias, agenda e avisos.</p>
        <form class="news-form" data-api="/newsletter" novalidate><label class="field"><span class="sr">Email</span><input type="email" name="email" required placeholder="O seu email" autocomplete="email"></label><label class="check field"><input type="checkbox" name="consent" value="true" required>Aceito receber a newsletter do Município.</label><button class="btn gold" type="submit">Subscrever</button><p class="ok" role="status">Subscrição feita. Obrigado!</p></form></div>
      <div class="box"><h2 class="bh">Nesta página</h2>${toc([['noticias', 'Notícias'], ['agenda', 'Agenda'], ['avisos', 'Avisos à população'], ['editais', 'Editais e documentos']])}</div>
    </aside>
  </div>
</section>

<section class="band dark" id="agenda">
  <div class="wrap">
    <div class="h"><div><p class="k">Agenda</p><h2>Próximos eventos</h2></div></div>
    <div class="grid2">
      <div class="agenda soft">
        <h3 class="k">Próximas semanas</h3>
        ${events.length ? events.map((e) => `<div class="ev"><div class="d"><b>${dayNum(e.date)}</b><small>${monthShort(e.date)}</small></div><div><h4>${esc(e.title)}</h4><p>${esc(e.place)}</p></div></div>`).join('\n        ') : '<p>Sem eventos marcados para já.</p>'}
      </div>
      <div class="agenda soft">
        <h3 class="k">Ao longo do ano</h3>
        ${yearly.map(([a, b, title, text]) => `<div class="ev"><div class="d wide"><b>${a}</b><small>${b}</small></div><div><h4>${esc(title)}</h4><p>${esc(text)}</p></div></div>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>

<section class="sec wrap" id="avisos">
  <div class="h"><div><p class="k">Avisos</p><h2>Avisos à população</h2></div></div>
  ${notices.length ? `<div class="grid3">${notices.map((a) => `<article class="info"><span class="tag ${a.type === 'ambiente' ? 'on' : 'pres'}" style="align-self:flex-start">${noticeLabel(a.type)}</span><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p><p><b>${esc(a.when)}</b></p></article>`).join('')}</div>` : '<p class="empty-note">Não há avisos neste momento.</p>'}
</section>

<section class="sec wrap" id="editais">
  <div class="h"><div><p class="k">Editais</p><h2>Editais e documentos</h2></div><a href="/municipio#transparencia">Transparência →</a></div>
  <ul class="docs">
    ${editais.map((d) => `<li><a href="#editais"><span class="ft">${d.kind}</span><span><b>${esc(d.title)}</b><small>${esc(d.sub)}</small></span><span class="dt">${dateLong(d.date)}</span><span class="dl">Abrir</span></a></li>`).join('\n    ')}
  </ul>
</section>`;
}

const block = ([type, value]) => {
  if (type === 'lead') return `<p class="lead-p">${esc(value)}</p>`;
  if (type === 'h2') return `<h2>${esc(value)}</h2>`;
  if (type === 'quote') return `<blockquote>“${esc(value)}”</blockquote>`;
  if (type === 'ul' || type === 'ol') return `<${type}>${value.map((i) => `<li>${esc(i)}</li>`).join('')}</${type}>`;
  return `<p>${esc(value)}</p>`;
};

export function noticiaBody({ item, others }) {
  return `<section class="phero article">
  ${photo(item.photo, '', { eager: true, fit: 1600, sizes: '100vw' })}
  <div class="wrap">
    <nav class="crumbs" aria-label="Caminho"><a href="/">Início</a><span aria-hidden="true">›</span><a href="/atualidade">Atualidade</a><span aria-hidden="true">›</span><span aria-current="page">Notícia</span></nav>
    <h1>${esc(item.title)}</h1>
    <div class="meta"><span class="badge">${esc(item.label)}</span><time datetime="${item.date}">${dateLong(item.date)}</time></div>
  </div>
</section>

<section class="sec wrap">
  <div class="split">
    <article class="prose">
      ${item.body.map(block).join('\n      ')}
      <div class="share">Partilhar <button class="round-ic" type="button" data-share aria-label="Partilhar ou copiar a ligação">↗</button><a class="round-ic" href="mailto:?subject=${encodeURIComponent(item.title)}" aria-label="Enviar por email">@</a></div>
    </article>
    <aside class="aside">
      <div class="box purple"><h2 class="bh">Em resumo</h2><p>${esc(item.summary)}</p>${facts([['Publicada', dateShort(item.date)], ['Tema', item.label]])}<a class="btn gold" href="/servicos">Ver serviços</a></div>
      ${others.length ? `<div class="box"><h2 class="bh">Outras notícias</h2><ul class="toc">${others.map((o) => `<li><a href="/atualidade/${o.slug}">${esc(o.title)}</a></li>`).join('')}</ul></div>` : ''}
    </aside>
  </div>
</section>`;
}
