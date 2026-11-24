import { CATEGORIES, DISTRICTS, REPORT_REASONS } from '../../config/platform.js';
import {
  categoryChip, dateLong, daysUntil, deadlineDate, esc, euros, exampleTag, glyph, icon, meter, pageHead, paragraphs, since,
} from '../html.js';

const ORDERS = [
  ['recentes', 'Mais recentes'],
  ['falta', 'Falta menos'],
  ['prazo', 'Prazo mais próximo'],
];

const deadlineText = (ymd) => {
  const d = daysUntil(ymd);
  if (d < 0) return 'Prazo passou';
  if (d === 0) return 'Prazo: hoje';
  if (d === 1) return 'Prazo: amanhã';
  return `Prazo: ${deadlineDate(ymd)} (${d} dias)`;
};

const statementRow = (ad) => `<li class="srow${ad.status === 'concluido' ? ' srow--done' : ''}">
  <a href="/pedidos/${ad.slug}">
    ${glyph(ad.category, 40)}
    <span class="srow__main">
      <b>${esc(ad.title)}</b>
      <small>${esc(ad.categoryLabel)}${ad.alias ? ` · ${esc(ad.alias)}` : ''}${ad.district ? ` · ${esc(ad.district)}` : ''} · publicado ${since(ad.publishedAt)}${ad.deadline && ad.status === 'ativo' ? ` · <span class="due">${deadlineText(ad.deadline)}</span>` : ''}</small>
      ${meter(ad.percent, `${ad.percent}% recebido`)}
    </span>
    <span class="srow__nums mono">
      <span><small>Pedido</small>${euros(ad.amountCents)}</span>
      <span><small>Recebido</small>${euros(ad.raisedCents)}</span>
      <span class="hl"><small>${ad.status === 'concluido' ? 'Concluído' : 'Falta'}</small>${ad.status === 'concluido' ? icon.check : euros(ad.remainingCents)}</span>
    </span>
  </a>
</li>`;

export function listBody({ active, done, filters }) {
  const q = (extra) => {
    const p = new URLSearchParams({ ...filters, ...extra });
    [...p.keys()].forEach((k) => !p.get(k) && p.delete(k));
    const s = p.toString();
    return s ? `/pedidos?${s}` : '/pedidos';
  };
  const filtered = Boolean(filters.categoria || filters.distrito || filters.q);

  return `${pageHead({
    crumbs: [['Pedidos']],
    kicker: 'Extrato de pedidos ativos',
    title: 'Contas por pagar, uma linha de cada vez',
    lead: 'Todos os pedidos foram revistos pela moderação antes de aparecerem. Escolha uma linha para ler o motivo, ver as provas verificadas e o que ainda falta.',
  })}
<section class="band band--tight">
  <div class="wrap">
    <nav class="cats" aria-label="Tipo de despesa">
      <a href="${q({ categoria: '' })}"${!filters.categoria ? ' aria-current="true"' : ''}>Todas</a>
      ${CATEGORIES.map(([id, label]) => `<a href="${q({ categoria: id })}"${filters.categoria === id ? ' aria-current="true"' : ''}>${glyph(id, 20)}${label}</a>`).join('')}
    </nav>
    <form class="filters" method="get" action="/pedidos">
      ${filters.categoria ? `<input type="hidden" name="categoria" value="${esc(filters.categoria)}">` : ''}
      <label class="filters__q">${icon.search}<span class="visually-hidden">Procurar</span><input type="search" name="q" value="${esc(filters.q ?? '')}" placeholder="Procurar no motivo ou no título" maxlength="80"></label>
      <label><span class="visually-hidden">Distrito</span><select name="distrito"><option value="">Todos os distritos</option>${DISTRICTS.map((d) => `<option${filters.distrito === d ? ' selected' : ''}>${d}</option>`).join('')}</select></label>
      <label><span class="visually-hidden">Ordenar</span><select name="ordem">${ORDERS.map(([v, l]) => `<option value="${v}"${(filters.ordem ?? 'recentes') === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
      <button class="btn btn--ink btn--sm" type="submit">Filtrar</button>
      ${filtered ? '<a class="link" href="/pedidos">Limpar filtros</a>' : ''}
    </form>

    <div class="statement">
      <div class="statement__head mono" aria-hidden="true"><span>Pedido</span><span>Pedido · Recebido · Falta</span></div>
      ${active.length ? `<ol class="srows">${active.map(statementRow).join('')}</ol>` : `<p class="empty">Não há pedidos ativos com estes filtros.${filtered ? ' <a href="/pedidos">Ver todos</a>.' : ''}</p>`}
    </div>

    ${done.length ? `<details class="done-list"><summary><b>Pedidos concluídos</b> <span class="mono">${done.length}</span></summary><ol class="srows">${done.map(statementRow).join('')}</ol></details>` : ''}

    <aside class="aside-note">
      ${icon.shield}
      <p><b>O que nunca aparece num pedido:</b> morada, telefone, email, dados bancários, números de identificação ou documentos completos. Se encontrar algum destes dados, <a href="/como-funciona#denunciar">denuncie o pedido</a> e a moderação retira-o.</p>
    </aside>
  </div>
</section>`;
}

function proofsBlock(ad) {
  if (!ad.proofs.length) return '';
  return `<section class="sheet__sec" aria-labelledby="provas-t">
    <h2 id="provas-t">Provas vistas pela moderação</h2>
    <p class="hint">A moderação viu estes documentos. As imagens só aparecem quando quem pede autorizou e a moderação confirmou que não mostram dados pessoais.</p>
    <ul class="proofs">${ad.proofs
      .map(
        (p) => `<li>${p.image ? `<a class="proof-img" href="/api/anuncios/${ad.slug}/provas/${p.id}" target="_blank" rel="noopener"><img src="/api/anuncios/${ad.slug}/provas/${p.id}" alt="${esc(p.description)} (imagem partilhada com autorização)" width="360" height="260" loading="lazy" decoding="async"></a>` : `<span class="proof-doc">${icon.doc}</span>`}<span><b>${esc(p.description)}</b><small>${icon.check} Verificada${p.image ? ' · imagem partilhada com autorização' : ' · documento privado'}</small></span></li>`,
      )
      .join('')}</ul>
  </section>`;
}

const updatesBlock = (ad) =>
  ad.updates.length
    ? `<section class="sheet__sec" aria-labelledby="atual-t"><h2 id="atual-t">Atualizações</h2><ol class="updates">${[...ad.updates]
        .reverse()
        .map((u) => `<li><time datetime="${u.at}">${dateLong(u.at)}</time><p>${esc(u.text)}</p></li>`)
        .join('')}</ol></section>`
    : '';

const donorsBlock = (ad) => {
  if (!ad.donors || !ad.donationsCount) return '';
  const { named, anonymous } = ad.donors;
  return `<section class="sheet__sec" aria-labelledby="quem-t"><h2 id="quem-t">Quem ajudou</h2>
    <p class="donors">${named.map((d) => `<span class="pill">${esc(d.name)}</span>`).join('')}${anonymous ? `<span class="pill pill--anon">${anonymous} ${anonymous === 1 ? 'pessoa anónima' : 'pessoas anónimas'}</span>` : ''}</p></section>`;
};

function till(ad) {
  const open = ad.status === 'ativo';
  const presets = [500, 1000, 2000].filter((c) => c < ad.remainingCents);
  return `<aside class="till-wrap paper-shadow" id="doar" aria-label="Doar para este pedido">
  <div class="receipt till">
    <p class="mono till__k">${open ? 'Por pagar' : 'Pedido concluído'}</p>
    <dl class="totals mono">
      <div><dt>Pedido</dt><dd>${euros(ad.amountCents)}</dd></div>
      <div><dt>Recebido</dt><dd>${euros(ad.raisedCents)}</dd></div>
      <div class="totals__big"><dt>Falta</dt><dd>${euros(ad.remainingCents)}</dd></div>
    </dl>
    ${meter(ad.percent, `${ad.percent}% recebido`)}
    <p class="till__meta"><span>${ad.donationsCount} ${ad.donationsCount === 1 ? 'doação' : 'doações'}</span>${ad.deadline && open ? `<span>${icon.clock}${deadlineText(ad.deadline)}</span>` : ''}</p>
    ${
      open
        ? `<form class="give" method="get" action="/doar/${ad.slug}">
      <fieldset><legend class="label">Quanto quer dar?</legend>
        <div class="presets">${presets.map((c) => `<button type="button" class="preset" data-cents="${c}">${euros(c).replace(',00', '')}</button>`).join('')}<button type="button" class="preset" data-cents="${ad.remainingCents}">O que falta</button></div>
        <div class="euro-input"><label class="visually-hidden" for="valor">Outro valor em euros</label><input id="valor" name="valor" inputmode="decimal" autocomplete="off" placeholder="Outro valor" value="${presets[1] ? presets[1] / 100 : ad.remainingCents / 100}"></div>
      </fieldset>
      <button class="btn btn--green btn--block btn--lg" type="submit">Ver o resumo antes de pagar${icon.arrow}</button>
      <p class="hint">Vê o montante, as comissões e as condições antes de confirmar. Doa anónimo, a menos que escolha mostrar o nome.</p>
    </form>`
        : `<p class="notice notice--ok">Este pedido já não recebe doações.${ad.closedAt ? ` Fechou a ${dateLong(ad.closedAt)}.` : ''}</p><a class="btn btn--block" href="/pedidos">Ver outros pedidos</a>`
    }
  </div>
  ${
    open
      ? `<div class="till__more">
    <button class="btn btn--ghost btn--block" type="button" data-open="ask">${icon.chat}Pedir mais informação</button>
    <button class="linkbtn" type="button" data-open="report">${icon.flag}Denunciar este pedido</button>
  </div>`
      : ''
  }
</aside>`;
}

function dialogs(ad) {
  return `<dialog id="ask" aria-labelledby="ask-t"><form class="dialog__in" method="dialog" data-ask="${ad.id}">
  <div class="dialog__head"><h2 id="ask-t">Pedir mais informação</h2><button class="x" type="button" data-close aria-label="Fechar">${icon.close}</button></div>
  <p>A pergunta vai para quem criou o pedido, dentro da plataforma. Essa pessoa decide se responde, o que partilha, ou se recusa. Não verá o seu email nem o seu apelido.</p>
  <div class="field"><label for="question">A sua pergunta</label><textarea id="question" name="question" minlength="10" maxlength="1000" required placeholder="Por exemplo: o valor inclui a parte que já tinha guardada?"></textarea><small>Não escreva telefones, emails ou moradas: são retirados automaticamente.</small></div>
  <div class="ask-login notice" hidden><p>Para perguntar precisa de entrar na sua conta. <a href="/entrar?next=/pedidos/${ad.slug}">Entrar ou criar conta</a></p></div>
  <button class="btn btn--ink btn--block" type="submit">Enviar pergunta</button>
</form></dialog>
<dialog id="report" aria-labelledby="report-t"><form class="dialog__in" method="dialog" data-report="${ad.id}">
  <div class="dialog__head"><h2 id="report-t">Denunciar este pedido</h2><button class="x" type="button" data-close aria-label="Fechar">${icon.close}</button></div>
  <p>A denúncia vai só para a moderação. Quem criou o pedido não sabe quem denunciou. Dados pessoais expostos são tratados primeiro.</p>
  <fieldset class="field"><legend class="label">Motivo</legend>${REPORT_REASONS.map(([v, l], i) => `<label class="check"><input type="radio" name="reason" value="${v}"${i === 0 ? ' required' : ''}>${l}</label>`).join('')}</fieldset>
  <div class="field"><label for="details">O que viu? <small>(opcional)</small></label><textarea id="details" name="details" maxlength="1000"></textarea></div>
  <button class="btn btn--danger btn--block" type="submit">Enviar denúncia</button>
</form></dialog>`;
}

export function detailBody(ad) {
  const meta = [
    ad.alias ? `${icon.user}${esc(ad.alias)}` : `${icon.user}Pessoa que preferiu não mostrar o nome`,
    ad.district ? `${icon.pin}${esc(ad.district)}` : null,
    `${icon.clock}Publicado ${since(ad.publishedAt)}`,
  ].filter(Boolean);

  return `<div class="wrap detail">
  <nav class="crumbs" aria-label="Caminho"><a href="/">Início</a><span aria-hidden="true">/</span><a href="/pedidos">Pedidos</a><span aria-hidden="true">/</span><span aria-current="page">${esc(ad.categoryLabel)}</span></nav>
  <div class="detail__grid">
    <article class="sheet">
      <header class="sheet__head">
        <p class="sheet__tags">${categoryChip(ad.category)} ${exampleTag(ad.example)}</p>
        <h1>${esc(ad.title)}</h1>
        <ul class="sheet__meta">${meta.map((m) => `<li>${m}</li>`).join('')}</ul>
        <p class="stamp stamp--ok sheet__stamp" aria-hidden="true">Revisto pela<br>moderação</p>
      </header>
      <section class="sheet__sec sheet__story" aria-label="Motivo do pedido">${paragraphs(ad.story)}</section>
      ${proofsBlock(ad)}
      ${updatesBlock(ad)}
      ${donorsBlock(ad)}
      <footer class="sheet__foot">
        <p>${icon.lock}<span>Morada, contactos, dados bancários, números de identificação e documentos completos de quem pede não são públicos. Ficam só com a moderação, durante o tempo indicado na <a href="/privacidade">política de privacidade</a>.</span></p>
      </footer>
    </article>
    ${till(ad)}
  </div>
</div>
${ad.status === 'ativo' ? `${dialogs(ad)}<a class="mobile-give" href="#doar"><span>Falta <b>${euros(ad.remainingCents)}</b></span><span>Doar</span></a>` : ''}`;
}
