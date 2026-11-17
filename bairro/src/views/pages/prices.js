import { EXTRAS, SERVICES } from '../../../public/js/shared/estimate.js';
import { euros } from '../../../public/js/shared/format.js';
import { esc, win } from '../components.js';

export const FAQ = [
  ['Os preços incluem IVA?', 'Não. Os valores são sem IVA (23%). O orçamento final traz o valor com e sem IVA.'],
  ['Como funciona o pagamento?', 'Metade quando o projeto começa e metade na entrega. Em projetos com mais de três meses dividimos em três partes.'],
  ['Quantas propostas recebemos?', 'Mostramos duas ou três ideias na fase de esboços e depois afinamos a escolhida. Mudanças na fase de afinação estão incluídas.'],
  ['E se precisarmos de alterações depois da entrega?', 'Os primeiros 30 dias depois da entrega são por nossa conta. Depois disso cobramos 45 € por hora, sempre com orçamento antes.'],
  ['Trabalham com negócios fora do Porto?', 'Sim. A primeira conversa pode ser por videochamada e as provas são aprovadas na área de cliente do site.'],
];

const COLS = ['A', 'B', 'C', 'D', 'E'];

function row(n, cells, attrs = '') {
  return `<tr ${attrs}><th scope="row" class="sheet__n">${n}</th>${cells}</tr>`;
}

export function pricesWindows() {
  const serviceRows = SERVICES.map((s, i) =>
    row(
      i + 2,
      `<td class="sheet__check"><label class="check"><input type="checkbox" name="services" value="${s.id}"><span class="sr-only">Incluir ${esc(s.name)}</span></label></td>
      <td><b>${esc(s.name)}</b><span class="sheet__detail">${esc(s.detail)}</span></td>
      <td class="num">${euros(s.min)}</td>
      <td class="num">${euros(s.max)}</td>
      <td class="num">${s.weeks[0]}–${s.weeks[1]} sem.</td>`,
    ),
  ).join('');

  const extraStart = SERVICES.length + 3;
  const extraRows = EXTRAS.map((e, i) =>
    row(
      extraStart + i,
      `<td class="sheet__check"><label class="check"><input type="checkbox" name="extras" value="${e.id}"><span class="sr-only">Juntar ${esc(e.name)}</span></label></td>
      <td>${esc(e.name)}</td>
      <td class="num" colspan="2">${e.add ? `+ ${euros(e.add)}` : `+ ${e.percent}%`}</td>
      <td class="num">${e.percent ? '− 30% tempo' : ''}</td>`,
    ),
  ).join('');

  const totalRow = extraStart + EXTRAS.length;

  const body = `<div class="sheet-app">
    <div class="sheet__formula" aria-hidden="true"><span class="sheet__cell-ref">E${totalRow}</span><span class="sheet__fx">fx</span><span data-formula>=SOMA(C2:D${SERVICES.length + 1})</span></div>
    <div class="sheet__panels">
      <section class="sheet__panel" id="folha-precos" data-sheet="precos">
        <div class="sheet__head">
          <h1>Preços</h1>
          <p>Valores de referência para negócios pequenos, sem IVA. Marque o que precisa e a folha faz a conta. Dois ou mais serviços juntos têm 10% de desconto.</p>
        </div>
        <form class="sheet-form" data-sheet-form>
          <div class="table-wrap">
            <table class="table sheet">
              <thead><tr><th class="sheet__n" aria-hidden="true"></th>${COLS.map((c) => `<th scope="col" class="sheet__col">${c}</th>`).join('')}</tr></thead>
              <tbody>
                ${row(1, '<td class="sheet__label">Incluir</td><td class="sheet__label">Serviço</td><td class="sheet__label num">Desde</td><td class="sheet__label num">Até</td><td class="sheet__label num">Prazo</td>', 'class="sheet__labels"')}
                ${serviceRows}
                ${row(SERVICES.length + 2, '<td colspan="5" class="sheet__label">Extras</td>', 'class="sheet__labels"')}
                ${extraRows}
                ${row(
                  totalRow,
                  `<td></td><td><b>Estimativa</b><span class="sheet__detail" data-discount>Escolha pelo menos um serviço</span></td><td class="num sheet__total" colspan="2" data-total>—</td><td class="num sheet__total" data-weeks>—</td>`,
                  'class="sheet__totals"',
                )}
              </tbody>
            </table>
          </div>
          <p class="sheet__actions"><a class="btn btn--primary" href="/orcamento" data-to-quote>Levar para o orçamento</a><span class="small mute">A estimativa não compromete. O orçamento final chega por email em dois dias úteis.</span></p>
        </form>
      </section>
      <section class="sheet__panel" id="folha-perguntas" data-sheet="perguntas" hidden>
        <div class="sheet__head"><h2>Perguntas frequentes</h2></div>
        <dl class="faq">
          ${FAQ.map(([q, a]) => `<dt>${esc(q)}</dt><dd>${esc(a)}</dd>`).join('')}
        </dl>
      </section>
    </div>
    <div class="sheet__tabs" role="tablist" aria-label="Folhas">
      <button type="button" role="tab" aria-selected="true" aria-controls="folha-precos" data-tab="precos">Preços</button>
      <button type="button" role="tab" aria-selected="false" aria-controls="folha-perguntas" data-tab="perguntas">Perguntas</button>
    </div>
  </div>`;

  return [
    {
      id: 'precos',
      label: 'Preços',
      ico: 'sheet',
      html: win({
        id: 'precos',
        url: '/precos',
        title: 'preços.xls',
        label: 'Preços',
        ico: 'sheet',
        primary: true,
        x: 60,
        y: 30,
        w: 1000,
        cls: 'sheet-win',
        script: 'prices',
        flush: true,
        body,
        status: '<span>Pronto</span><span>Valores sem IVA · atualizados em novembro de 2026</span>',
      }),
    },
  ];
}
