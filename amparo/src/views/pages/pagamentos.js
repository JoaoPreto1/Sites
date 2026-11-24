import { esc, euros, glyph, icon, num } from '../html.js';

// Texto sobre o destino do dinheiro: honesto enquanto o modelo de entrega não estiver definido
export function fundsFlow(launch) {
  const entrega = launch.items.find((i) => i.id === 'entrega');
  const entidade = launch.items.find((i) => i.id === 'entidade');
  if (entrega.done && entidade.done) {
    return `<p>${esc(entidade.note)}</p><p>${esc(entrega.note)}</p>`;
  }
  return `<p><b>Ainda por definir.</b> Antes de a plataforma aceitar dinheiro real tem de ficar decidido quem recebe e gere os fundos e como o valor chega à despesa de quem pede (por exemplo, pagamento direto da fatura ao senhorio ou ao fornecedor). Por isso não dizemos que o dinheiro é entregue diretamente à pessoa.</p>`;
}

const conditions = (launch, fees) => {
  const done = (id) => launch.items.find((i) => i.id === id)?.done;
  return `<ul class="conds">
  <li><b>Comissões:</b> ${fees.confirmed ? 'valores confirmados pelo prestador de pagamentos.' : `estimativa com valores de exemplo (${num(fees.providerPercent)}% + ${euros(fees.providerFixedCents)} por pagamento). Os valores reais serão confirmados antes do lançamento.`}</li>
  <li><b>Reembolsos:</b> ${done('reembolsos') ? 'de acordo com as condições de utilização.' : 'política ainda por definir. Não há reembolsos porque nenhum pagamento real é feito nesta fase.'}</li>
  <li><b>Impostos:</b> não afirmamos que esta doação seja dedutível no IRS. ${done('fiscal') ? 'Veja as condições.' : 'O enquadramento fiscal ainda vai ser confirmado com um contabilista.'}</li>
  <li><b>Reclamações:</b> ${done('reclamacoes') ? 'veja como reclamar nas condições.' : 'processo ainda por definir; até lá pode escrever-nos.'}</li>
  <li><b>Dados do cartão:</b> nunca passam pela plataforma. Os pagamentos serão processados por um prestador autorizado.</li>
</ul>`;
};

export function donateBody({ ad, cents, launch, fees, demo }) {
  return `<div class="wrap pay">
  <nav class="crumbs" aria-label="Caminho"><a href="/">Início</a><span aria-hidden="true">/</span><a href="/pedidos">Pedidos</a><span aria-hidden="true">/</span><a href="/pedidos/${ad.slug}">${esc(ad.title)}</a><span aria-hidden="true">/</span><span aria-current="page">Doar</span></nav>
  <div class="pay__grid">
    <div class="pay__form">
      <p class="kicker">Antes de confirmar</p>
      <h1>Resumo da doação</h1>
      ${demo ? '<p class="notice notice--demo"><b>Demonstração.</b> No passo seguinte não é pedido nenhum cartão e nenhum dinheiro é movimentado. A doação fica registada como simulação.</p>' : ''}
      <form id="donate" data-ad="${ad.id}" data-remaining="${ad.remainingCents}" novalidate>
        <div class="field"><label for="amount">Quanto quer dar?</label><div class="euro-input"><input id="amount" name="amount" inputmode="decimal" autocomplete="off" value="${(cents / 100).toFixed(2).replace('.', ',')}" required></div><small>Este pedido ainda precisa de ${euros(ad.remainingCents)}.</small></div>
        <label class="check"><input type="checkbox" name="coverFee" checked> Acrescentar a comissão, para que o pedido receba o valor inteiro</label>
        <label class="check"><input type="checkbox" name="showName" data-toggle="#public-name"> Mostrar o meu primeiro nome na lista de quem ajudou</label>
        <div class="field" id="public-name" hidden><label for="publicName">Nome a mostrar</label><input id="publicName" name="publicName" maxlength="40" autocomplete="given-name"><small>Por defeito é o seu primeiro nome. Pode usar outro, ou não mostrar nada.</small></div>

        <section class="box" aria-labelledby="destino-t">
          <h2 id="destino-t">${icon.pin}Para onde vai a doação</h2>
          <p>Para o pedido <a href="/pedidos/${ad.slug}">“${esc(ad.title)}”</a> (${esc(ad.categoryLabel)}). O valor fica associado a este pedido e conta para o que falta.</p>
          ${fundsFlow(launch)}
        </section>
        <section class="box" aria-labelledby="cond-t">
          <h2 id="cond-t">${icon.doc}Condições</h2>
          ${conditions(launch, fees)}
        </section>

        <label class="check"><input type="checkbox" name="accept" required> Li o resumo, as comissões e as condições.</label>
        <div class="login-needed notice" hidden><p>Para doar precisa de entrar na sua conta (é a mesma conta com que se pede ajuda). <a class="link" href="/entrar?next=${encodeURIComponent(`/doar/${ad.slug}`)}">Entrar ou criar conta</a></p></div>
        <button class="btn btn--green btn--lg btn--block" type="submit">${demo ? 'Continuar para a simulação' : 'Continuar para o pagamento'}${icon.arrow}</button>
      </form>
    </div>
    <aside class="paper-shadow pay__receipt-wrap">
      <div class="receipt pay__receipt" aria-live="polite">
        <p class="mono till__k">Pré-visualização</p>
        <p class="pay__to">${glyph(ad.category, 28)}<b>${esc(ad.title)}</b></p>
        <dl class="totals mono" id="quote">
          <div><dt>Paga</dt><dd data-q="charged">—</dd></div>
          <div><dt>Comissão do prestador${fees.confirmed ? '' : '*'}</dt><dd data-q="provider">—</dd></div>
          <div><dt>Comissão da plataforma</dt><dd data-q="platform">—</dd></div>
          <div class="totals__big"><dt>O pedido recebe</dt><dd data-q="toAd">—</dd></div>
          <div><dt>Falta depois</dt><dd data-q="after">—</dd></div>
        </dl>
        <p class="hint" data-q="error" role="alert"></p>
        ${fees.confirmed ? '' : '<p class="hint">* Estimativa com valores de exemplo, ainda não confirmados com um prestador.</p>'}
        <p class="mono pay__anon" data-q="anon">Doação anónima</p>
      </div>
    </aside>
  </div>
</div>`;
}

export const simulationBody = ({ kind, id }) => `<div class="wrap sim" data-kind="${esc(kind)}" data-id="${esc(id)}">
  <div class="sim__card">
    <p class="stamp sim__stamp" aria-hidden="true">Simulação</p>
    <p class="kicker">Prestador de pagamentos de demonstração</p>
    <h1>Isto não é um pagamento</h1>
    <p class="lead">A plataforma ainda não tem um prestador de pagamentos configurado. Aqui não se pede cartão, não se contacta nenhum banco e não sai dinheiro de lado nenhum. Escolha como quer que a simulação termine.</p>
    <dl class="totals mono sim__sum" data-sum><div><dt>A carregar…</dt><dd></dd></div></dl>
    <div class="sim__acts">
      <button class="btn btn--green btn--lg" type="button" data-outcome="concluir">${icon.check}Simular pagamento concluído</button>
      <button class="btn btn--ghost btn--lg" type="button" data-outcome="falhar">Simular pagamento recusado</button>
    </div>
    <p class="hint">Quando houver um prestador real, este passo é substituído pela página segura do prestador, e o valor só conta depois de ele confirmar o pagamento.</p>
  </div>
</div>`;

export const receiptBody = ({ kind, id }) => `<div class="wrap rcpt" data-kind="${esc(kind)}" data-id="${esc(id)}">
  <div class="paper-shadow rcpt__wrap"><div class="receipt rcpt__paper" data-receipt><p class="mono">A carregar…</p></div></div>
</div>`;
