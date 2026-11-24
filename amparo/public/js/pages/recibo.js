import { api } from '../api.js';
import { dateTime, esc, euros } from '../format.js';
import { requireUser } from '../session.js';

const box = document.querySelector('.rcpt');
const paper = box.querySelector('[data-receipt]');
const { kind, id } = box.dataset;

const TITLES = {
  simulado: ['Simulação concluída', 'Nenhum dinheiro foi movimentado. Nesta demonstração, o valor conta como “recebido” para mostrar como a plataforma funciona.'],
  pago: ['Pagamento confirmado', 'O prestador de pagamentos confirmou o pagamento.'],
  falhado: ['Pagamento não concluído', 'Nada foi cobrado.'],
  pendente: ['À espera de confirmação', 'O valor só conta depois de o prestador confirmar o pagamento.'],
};

if (await requireUser()) {
  try {
    const p = await api(`/pagamentos/${kind}/${id}`, { auth: true });
    const [title, text] = TITLES[p.status] ?? TITLES.pendente;
    const rows =
      kind === 'doacao'
        ? [['Pedido', esc(p.ad?.title ?? '—')], ['Pago', euros(p.chargedCents)], ['Comissões', euros(p.feeCents)], ['Para o pedido', euros(p.amountCents)], ['Nome público', p.showName ? esc(p.publicName) : 'Anónimo']]
        : [['Destino', 'Manter a plataforma'], ['Valor', euros(p.amountCents)], ['Nome público', p.showName ? esc(p.publicName) : 'Anónimo']];

    paper.innerHTML = `
      <header class="receipt__head"><p class="mono">${p.status === 'simulado' ? 'Comprovativo de simulação · sem valor' : 'Comprovativo'}</p><h1>${title}</h1><p class="mono">${dateTime(p.createdAt)} · ref. ${esc(id.slice(0, 8))}</p></header>
      <dl class="totals mono">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      <p class="rcpt__text">${text}</p>
      ${p.status === 'simulado' ? '<p class="stamp rcpt__stamp" aria-hidden="true">Simulação<br>sem valor</p>' : ''}
      <div class="rcpt__acts">${kind === 'doacao' && p.ad ? `<a class="btn btn--ink" href="/pedidos/${esc(p.ad.slug)}">Voltar ao pedido</a>` : '<a class="btn btn--ink" href="/manter">Voltar</a>'}<a class="btn btn--ghost" href="/conta#doacoes">As minhas doações</a></div>`;
  } catch (err) {
    paper.innerHTML = `<p class="notice notice--error">${esc(err.message)}</p>`;
  }
}
