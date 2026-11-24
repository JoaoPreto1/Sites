import { CATEGORIES } from '../../config/platform.js';
import { brand } from '../document.js';
import { dateNum, esc, euros, eurosShort, glyph, icon, meter, num, timeNum } from '../html.js';

const sum = (list, key) => list.reduce((s, a) => s + a[key], 0);

export const receiptLine = (ad) => `<li><a class="rline" href="/pedidos/${ad.slug}">
  ${glyph(ad.category, 30)}
  <span class="rline__what"><b>${esc(ad.title)}</b><small>${esc(ad.categoryLabel)}${ad.district ? ` · ${esc(ad.district)}` : ''}${ad.alias ? ` · ${esc(ad.alias)}` : ''}</small></span>
  <span class="rline__dots" aria-hidden="true"></span>
  <span class="rline__amt"><small>falta</small>${euros(ad.remainingCents)}</span>
</a></li>`;

function heroReceipt(active, now, demo) {
  const lines = active.slice(0, 7);
  return `<article class="receipt receipt--hero" aria-labelledby="conta-t">
  <header class="receipt__head">
    ${brand('span')}
    <p class="mono">Ajuda entre pessoas · Portugal</p>
    <h2 id="conta-t">Conta desta semana</h2>
    <p class="mono receipt__meta"><span>${dateNum(now)}</span><span>${timeNum(now)}</span><span>${active.length} pedidos ativos</span></p>
  </header>
  <ol class="rlines">${lines.map(receiptLine).join('')}</ol>
  ${active.length > lines.length ? `<p class="receipt__more"><a href="/pedidos">+ ${active.length - lines.length} pedidos na lista completa</a></p>` : ''}
  <dl class="totals mono">
    <div><dt>Pedido</dt><dd>${euros(sum(active, 'amountCents'))}</dd></div>
    <div><dt>Já recebido</dt><dd>${euros(sum(active, 'raisedCents'))}</dd></div>
    <div class="totals__big"><dt>Ainda por pagar</dt><dd>${euros(sum(active, 'remainingCents'))}</dd></div>
  </dl>
  <footer class="receipt__foot">
    <p>Pague uma linha, ou só parte de uma.</p>
    <div class="barcode" aria-hidden="true"></div>
    <p class="mono">Moderado antes de publicar · dados pessoais fora da vista</p>
  </footer>
  ${demo ? '<p class="stamp stamp--demo" aria-hidden="true">Exemplo<br>fictício</p>' : ''}
</article>`;
}

function anatomy(ad) {
  if (!ad) return '';
  return `<section class="band band--paper" aria-labelledby="ler-t">
  <div class="wrap">
    <div class="section-head"><p class="kicker">Antes de doar</p><h2 id="ler-t">Como se lê uma linha</h2><p>Cada pedido mostra o mesmo, pela mesma ordem. O resto fica entre quem pede e a moderação.</p></div>
    <div class="anatomy">
      <a class="anatomy__line" href="/pedidos/${ad.slug}">
        ${glyph(ad.category, 44)}
        <span class="anatomy__what"><b>${esc(ad.title)}</b><small>${esc(ad.categoryLabel)}${ad.district ? ` · ${esc(ad.district)}` : ''}</small></span>
        <span class="anatomy__nums mono"><span><small>pedido</small>${euros(ad.amountCents)}</span><span><small>recebido</small>${euros(ad.raisedCents)}</span><span class="hl"><small>falta</small>${euros(ad.remainingCents)}</span></span>
      </a>
      ${meter(ad.percent, 'Percentagem já recebida')}
      <ol class="anatomy__notes">
        <li><b>O motivo</b><span>Escrito por quem pede, com as palavras dessa pessoa. A moderação confirma que não expõe dados pessoais.</span></li>
        <li><b>Pedido, recebido e falta</b><span>Atualizados depois de cada doação. Quando o pedido é atingido, o pedido fecha sozinho.</span></li>
        <li><b>Provas verificadas</b><span>Faturas e recibos vistos pela moderação. Só aparecem imagens se a pessoa autorizar e a moderação confirmar que não mostram dados.</span></li>
        <li><b>Nome e distrito, se quiser</b><span>Quem pede escolhe se mostra o primeiro nome e o distrito. Morada, contactos e documentos nunca aparecem.</span></li>
      </ol>
    </div>
  </div>
</section>`;
}

const ledger = () => `<section class="band" aria-labelledby="duas-t">
  <div class="wrap">
    <div class="section-head"><p class="kicker">Uma só conta</p><h2 id="duas-t">Deve e haver</h2><p>Não há contas de “beneficiário” e contas de “doador”. Hoje pode precisar, amanhã pode ajudar.</p></div>
    <div class="ledger">
      <div class="ledger__col">
        <h3><span class="mono">Deve</span>Quando precisa de ajuda</h3>
        <ol>
          <li><b>Escreve o motivo e o montante</b><span>Só o que quer que os outros leiam. Pode juntar provas, se quiser.</span></li>
          <li><b>Escolhe o que fica visível</b><span>Primeiro nome, distrito, prazo, provas e lista de quem doou.</span></li>
          <li><b>A moderação revê</b><span>Antes de aparecer. Pode pedir alterações se o texto tiver dados pessoais.</span></li>
          <li><b>Responde se quiser</b><span>Quem doa pode pedir mais informação. Decide se responde, o quê, ou se recusa.</span></li>
        </ol>
        <a class="btn btn--ink" href="/conta/novo-pedido">Pedir ajuda${icon.arrow}</a>
      </div>
      <div class="ledger__col ledger__col--haver">
        <h3><span class="mono">Haver</span>Quando pode ajudar</h3>
        <ol>
          <li><b>Escolhe uma linha</b><span>Por tipo de despesa, distrito ou o que falta menos.</span></li>
          <li><b>Vê o resumo antes de pagar</b><span>Montante, para onde vai, comissões e condições, tudo antes de confirmar.</span></li>
          <li><b>Anónimo por defeito</b><span>O seu nome só aparece se escolher mostrá-lo.</span></li>
          <li><b>Pergunta dentro da plataforma</b><span>Sem trocar telefones nem emails. Contactos escritos nas mensagens são retirados.</span></li>
        </ol>
        <a class="btn btn--green" href="/pedidos">Ver pedidos${icon.arrow}</a>
      </div>
    </div>
  </div>
</section>`;

const keys = (counts) => `<section class="band band--tight" aria-labelledby="teclas-t">
  <div class="wrap">
    <div class="section-head section-head--row"><h2 id="teclas-t">Sete tipos de conta</h2><p>Os pedidos são sempre para uma despesa concreta.</p></div>
    <div class="keys">${CATEGORIES.map(([id, label, hint]) => `<a class="key" href="/pedidos?categoria=${id}">${glyph(id, 34)}<b>${label}</b><small>${hint}</small><span class="key__n mono">${counts[id] ?? 0} ativos</span></a>`).join('')}</div>
  </div>
</section>`;

function platformBill(fund) {
  return `<section class="band band--green" aria-labelledby="casa-t">
  <div class="wrap house">
    <div class="house__txt">
      <p class="kicker">Separado dos pedidos</p>
      <h2 id="casa-t">A própria plataforma também tem contas</h2>
      <p>Servidor, domínio, cópias de segurança e manutenção custam ${eurosShort(fund.monthlyCents)} por mês. Há uma forma de contribuir só para isso, que nunca se mistura com o dinheiro dos pedidos.</p>
      <a class="btn btn--paper" href="/manter">Ver a fatura da plataforma${icon.arrow}</a>
    </div>
    <div class="bill">
      <p class="bill__k mono">Custos mensais · valores de exemplo</p>
      <ul class="bill__rows">${fund.costs.map((c) => `<li><span>${esc(c.label)}</span><b class="mono">${euros(c.cents)}</b></li>`).join('')}</ul>
      <p class="bill__total"><span>Por mês</span><b class="mono">${euros(fund.monthlyCents)}</b></p>
      <div class="bill__month">
        <p><span>Recebido este mês</span><b class="mono">${euros(fund.monthCents)}</b></p>
        ${meter(fund.monthPercent, 'Meta mensal da plataforma')}
        <p class="bill__cover">O saldo atual dá para <b>cerca de ${num(fund.monthsCovered)} ${fund.monthsCovered === 1 ? 'mês' : 'meses'}</b> de funcionamento.</p>
      </div>
    </div>
  </div>
</section>`;
}

const honesty = (launch) => `<section class="band band--paper" aria-labelledby="falta-t">
  <div class="wrap honesty">
    <div class="section-head"><p class="kicker">Sem promessas que não podemos cumprir</p><h2 id="falta-t">Ainda não aceitamos dinheiro real</h2><p>Antes de abrir, há ${launch.pending} pontos que têm de estar definidos e confirmados. Enquanto isso, tudo o que vê aqui é uma demonstração com dados fictícios.</p></div>
    <ul class="todo">${launch.items.slice(0, 6).map((i) => `<li class="${i.done ? 'is-done' : ''}"><span class="todo__box" aria-hidden="true">${i.done ? icon.check : ''}</span><span><b>${esc(i.title)}</b><small>${i.done ? 'Definido' : 'Por definir'}</small></span></li>`).join('')}</ul>
    <a class="link" href="/transparencia#lancamento">Ver a lista completa →</a>
  </div>
</section>`;

export function homeBody({ active, fund, launch, demo }) {
  const counts = active.reduce((acc, a) => ({ ...acc, [a.category]: (acc[a.category] ?? 0) + 1 }), {});
  const now = new Date().toISOString();
  const sample = [...active].sort((a, b) => b.percent - a.percent)[1] ?? active[0];

  return `<section class="desk">
  <div class="wrap desk__in">
    <div class="desk__intro">
      <p class="kicker">Ajuda entre pessoas, em Portugal</p>
      <h1>Há contas que <mark>não esperam</mark> pelo fim do mês.</h1>
      <p class="lead">Renda, luz, água, comida, saúde, transportes, escola. Quem precisa publica o que falta pagar; quem pode, paga uma parte. A mesma conta serve para pedir e para ajudar.</p>
      <div class="actions"><a class="btn btn--ink btn--lg" href="/pedidos">Ver pedidos${icon.arrow}</a><a class="btn btn--ghost btn--lg" href="/conta/novo-pedido">Pedir ajuda</a></div>
      <ul class="promises">
        <li>${icon.shield}Moderado antes de aparecer</li>
        <li>${icon.lock}Morada, contactos e documentos nunca públicos</li>
        <li>${icon.eye}Doa anónimo, a menos que escolha o contrário</li>
      </ul>
    </div>
    <div class="desk__paper">
      ${heroReceipt(active, now, demo)}
      <p class="note note--a" aria-hidden="true">cada linha é<br>uma pessoa</p>
      <p class="note note--b" aria-hidden="true">o que ainda falta,<br>já descontado</p>
    </div>
  </div>
</section>
${anatomy(sample)}
${ledger()}
${keys(counts)}
${platformBill(fund)}
${honesty(launch)}`;
}
