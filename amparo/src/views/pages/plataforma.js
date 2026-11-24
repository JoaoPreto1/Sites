import { esc, euros, eurosShort, glyph, icon, meter, monthName, num, pageHead, since } from '../html.js';

const months = (n) => `${num(n)} ${n === 1 ? 'mês' : 'meses'}`;

export function manterBody({ fund, demo }) {
  const example = Math.round(fund.monthlyCents * 3);
  return `${pageHead({
    crumbs: [['Manter a plataforma']],
    kicker: 'Separado das doações para pedidos',
    title: 'A fatura da própria plataforma',
    lead: `Manter a Amparo a funcionar custa ${eurosShort(fund.monthlyCents)} por mês. Este dinheiro só paga alojamento, domínio, segurança e manutenção. Nunca vai para pedidos, e o dinheiro dos pedidos nunca vem para aqui.`,
  })}
<section class="band band--tight">
  <div class="wrap upkeep">
    <div class="paper-shadow"><article class="receipt upkeep__bill" aria-labelledby="fat-t">
      <header class="receipt__head"><p class="mono">Fatura mensal · ${esc(monthName(fund.month))}</p><h2 id="fat-t">Custos de funcionamento</h2><p class="mono">Valores de exemplo definidos pelo dono da plataforma</p></header>
      <ul class="bill__rows">${fund.costs.map((c) => `<li><span>${esc(c.label)}</span><b class="mono">${euros(c.cents)}</b></li>`).join('')}</ul>
      <p class="bill__total"><span>Meta mensal</span><b class="mono">${euros(fund.monthlyCents)}</b></p>
      <div class="upkeep__month">
        <p><span>Recebido em ${esc(monthName(fund.month).split(' ')[0])}</span><b class="mono">${euros(fund.monthCents)} de ${euros(fund.monthlyCents)}</b></p>
        ${meter(fund.monthPercent, 'Meta mensal')}
      </div>
      <dl class="totals mono">
        <div><dt>Recebido desde o início</dt><dd>${euros(fund.receivedCents)}</dd></div>
        <div><dt>Já gasto em custos</dt><dd>${euros(fund.spentCents)}</dd></div>
        <div class="totals__big"><dt>Saldo</dt><dd>${euros(fund.balanceCents)}</dd></div>
      </dl>
      <p class="upkeep__cover">Com o saldo atual, a plataforma funciona <b>cerca de ${months(fund.monthsCovered)}</b>.</p>
      ${demo ? '<p class="stamp stamp--demo" aria-hidden="true">Exemplo<br>fictício</p>' : ''}
    </article></div>

    <div class="upkeep__side">
      <form class="box contribute" id="contribute" novalidate>
        <h2>${icon.shield}Contribuir para a plataforma</h2>
        <div class="presets">${[500, 1000, 2000, 4000].map((c) => `<button type="button" class="preset" data-cents="${c}">${eurosShort(c)}</button>`).join('')}</div>
        <div class="field"><label for="c-amount">Valor</label><div class="euro-input"><input id="c-amount" name="amount" inputmode="decimal" value="10" required></div></div>
        <p class="calc" aria-live="polite" data-calc data-monthly="${fund.monthlyCents}">10 € cobrem cerca de 0,3 meses de funcionamento.</p>
        <label class="check"><input type="checkbox" name="showName" data-toggle="#c-name"> Mostrar o meu primeiro nome em “quem contribuiu”</label>
        <div class="field" id="c-name" hidden><label for="c-public">Nome a mostrar</label><input id="c-public" name="publicName" maxlength="40"></div>
        <label class="check"><input type="checkbox" name="accept" required> Percebi que este dinheiro é só para os custos da plataforma e não para pedidos.</label>
        <p class="login-needed notice" hidden>Para contribuir precisa de entrar na sua conta. <a class="link" href="/entrar?next=/manter">Entrar ou criar conta</a></p>
        <button class="btn btn--ink btn--block" type="submit">${demo ? 'Continuar para a simulação' : 'Continuar para o pagamento'}${icon.arrow}</button>
        ${demo ? '<p class="hint">Demonstração: nenhum cartão é pedido e nenhum dinheiro é movimentado.</p>' : ''}
      </form>
      <div class="box">
        <h2>${icon.clock}Como se conta</h2>
        <p>Os meses cobertos são o saldo a dividir pelo custo mensal. Com ${eurosShort(fund.monthlyCents)} por mês, uma contribuição de ${eurosShort(example)} corresponde a cerca de três meses. O cálculo usa os custos definidos pelo dono da plataforma e atualiza depois de cada contribuição.</p>
      </div>
    </div>
  </div>
</section>

<section class="band band--paper">
  <div class="wrap uses">
    <div class="section-head"><p class="kicker">Para que serve</p><h2>Onde é gasto cada euro</h2></div>
    <div class="uses__grid">
      <div><h3>Alojamento</h3><p>O servidor onde a plataforma corre e a base de dados com os pedidos. É o maior custo.</p></div>
      <div><h3>Domínio e email</h3><p>O endereço do site e o email para onde escreve quem precisa de falar connosco.</p></div>
      <div><h3>Segurança</h3><p>Certificados HTTPS, cópias de segurança cifradas e armazenamento privado para as provas.</p></div>
      <div><h3>Manutenção</h3><p>Atualizações de segurança e correções. Uma plataforma que guarda dados pessoais nunca está “acabada”.</p></div>
    </div>
    <p class="uses__note">${icon.lock}Se um mês sobrar dinheiro, fica para os meses seguintes e aparece no saldo. Não é usado para mais nada sem ser anunciado aqui primeiro.</p>
  </div>
</section>

<section class="band">
  <div class="wrap twocol">
    <div>
      <h2>Despesas pagas</h2>
      ${fund.expenses.length ? `<div class="table-wrap"><table class="data"><thead><tr><th>Mês</th><th>Despesa</th><th class="num">Valor</th></tr></thead><tbody>${fund.expenses.map((e) => `<tr><td>${esc(monthName(e.month))}</td><td>${esc(e.label)}${e.example ? ' <span class="tag-example">Exemplo</span>' : ''}</td><td class="num">${euros(e.cents)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">Ainda não há despesas registadas.</p>'}
    </div>
    <div>
      <h2>Quem contribuiu</h2>
      <p class="hint">Só aparece quem escolheu mostrar o nome. ${fund.contributionsCount} contribuições no total.</p>
      ${fund.supporters.length ? `<ul class="supporters">${fund.supporters.map((s) => `<li><b>${esc(s.name)}</b><small>${since(s.at)}</small></li>`).join('')}</ul>` : '<p class="empty">Ainda ninguém escolheu mostrar o nome.</p>'}
    </div>
  </div>
</section>`;
}

export function transparenciaBody({ t, launch, fees, demo }) {
  const maxCat = Math.max(1, ...t.byCategory.map((c) => c.raisedCents));
  const maxMonth = Math.max(1, ...t.byMonth.map((m) => m.raisedCents));
  return `${pageHead({
    crumbs: [['Transparência']],
    kicker: 'Números agregados, sem identificar ninguém',
    title: 'O que entrou, o que saiu e o que ainda falta decidir',
    lead: 'Os totais das doações para pedidos e das contribuições para a plataforma estão sempre separados. Nenhum número aqui permite identificar uma pessoa ou um pedido.',
  })}
${demo ? '<div class="wrap"><p class="notice notice--demo t-demo"><b>Demonstração:</b> todos os valores desta página vêm de doações simuladas com dados fictícios.</p></div>' : ''}
<section class="band band--tight">
  <div class="wrap">
    <h2 class="visually-hidden">Totais</h2>
    <div class="ledger-strip">
      <div><span class="mono">Recebido para pedidos</span><b>${euros(t.raisedCents)}</b><small>${t.donationsCount} doações</small></div>
      <div><span class="mono">Entregue</span><b>${euros(t.deliveredCents)}</b><small>Registado pela equipa</small></div>
      <div><span class="mono">Por entregar</span><b>${euros(t.awaitingCents)}</b><small>Pedidos ainda ativos ou à espera de entrega</small></div>
      <div><span class="mono">Comissões pagas</span><b>${euros(t.feesCents)}</b><small>Ao prestador de pagamentos</small></div>
    </div>
    <p class="hint">Pedidos ativos: ${t.ads.active} · concluídos: ${t.ads.done} · recusados: ${t.ads.refused} · suspensos pela moderação: ${t.ads.suspended}.</p>
  </div>
</section>

<section class="band band--paper">
  <div class="wrap twocol">
    <div>
      <h2>Por tipo de despesa</h2>
      <ul class="bars">${t.byCategory.map((c) => `<li>${glyph(c.id, 26)}<span class="bars__l">${esc(c.label)}<small>${c.ads} ${c.ads === 1 ? 'pedido' : 'pedidos'}</small></span><span class="bars__b"><span style="width:${Math.round((c.raisedCents / maxCat) * 100)}%"></span></span><b class="mono">${euros(c.raisedCents)}</b></li>`).join('')}</ul>
    </div>
    <div>
      <h2>Por mês</h2>
      <ul class="bars bars--month">${t.byMonth.map((m) => `<li><span class="bars__l">${esc(monthName(m.month))}<small>entregue ${euros(m.deliveredCents)}</small></span><span class="bars__b"><span style="width:${Math.round((m.raisedCents / maxMonth) * 100)}%"></span></span><b class="mono">${euros(m.raisedCents)}</b></li>`).join('')}</ul>
      <p class="hint">Recebido para pedidos em cada mês. As entregas são registadas pela equipa com permissão para isso, e cada registo fica associado a quem o fez.</p>
    </div>
  </div>
</section>

<section class="band band--tight">
  <div class="wrap">
    <div class="section-head section-head--row"><h2>Fundo da plataforma</h2><a class="link" href="/manter">Ver a fatura →</a></div>
    <div class="ledger-strip ledger-strip--green">
      <div><span class="mono">Recebido</span><b>${euros(t.fund.receivedCents)}</b></div>
      <div><span class="mono">Gasto</span><b>${euros(t.fund.spentCents)}</b></div>
      <div><span class="mono">Saldo</span><b>${euros(t.fund.balanceCents)}</b></div>
      <div><span class="mono">Dá para</span><b>${months(t.fund.monthsCovered)}</b></div>
    </div>
  </div>
</section>

<section class="band band--paper" id="lancamento">
  <div class="wrap">
    <div class="section-head"><p class="kicker">Antes de aceitar dinheiro real</p><h2>Lista do lançamento</h2><p>Enquanto houver pontos por definir, a plataforma só funciona em demonstração. O servidor recusa ligar um prestador de pagamentos real antes disso. Faltam ${launch.pending} de ${launch.items.length}.</p></div>
    <ol class="launch">${launch.items.map((i) => `<li class="${i.done ? 'is-done' : ''}"><span class="todo__box" aria-hidden="true">${i.done ? icon.check : ''}</span><div><h3>${esc(i.title)} <span class="status status--${i.done ? 'concluido' : 'pendente'}">${i.done ? 'Definido' : 'Por definir'}</span></h3><p>${esc(i.done && i.note ? i.note : i.text)}</p></div></li>`).join('')}</ol>
    <div class="box"><h2>${icon.doc}Comissões atuais</h2><p>Prestador de pagamentos: ${num(fees.providerPercent)}% + ${euros(fees.providerFixedCents)} por pagamento · Plataforma: ${num(fees.platformPercent)}% ${fees.confirmed ? '(confirmadas)' : '<b>(valores de exemplo, por confirmar)</b>'}. São sempre mostradas antes de cada doação, e quem doa pode acrescentá-las para que o pedido receba o valor inteiro.</p></div>
  </div>
</section>`;
}
