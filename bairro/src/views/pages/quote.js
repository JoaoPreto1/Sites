import { BUDGETS, EXTRAS, SERVICES } from '../../../public/js/shared/estimate.js';
import { STUDIO } from '../../config/studio.js';
import { esc, options, win } from '../components.js';

const STEPS = [
  ['Lemos o pedido', 'No próprio dia ou no seguinte.'],
  ['Conversa de 30 minutos', 'No estúdio ou por videochamada, sem custos.'],
  ['Orçamento fechado', 'Por email, com prazos e fases.'],
];

export function quoteWindows({ services = [], extras = [], today }) {
  const body = `<div class="quote">
    <div class="quote__main">
      <h1 class="quote__title">Pedir orçamento</h1>
      <p class="quote__lead">Escreva como escreveria a um amigo. Não precisa de saber o nome técnico do que quer: diga-nos o que tem e onde quer chegar.</p>
      <form class="quote-form" novalidate data-quote-form>
        <div class="form-grid">
          <label class="field"><span>Nome</span><input name="name" autocomplete="name" required></label>
          <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" required></label>
          <label class="field full"><span>Negócio <span class="mute">(opcional)</span></span><input name="company" autocomplete="organization"></label>
        </div>
        <fieldset class="quote__group">
          <legend class="legend">O que precisa? <span class="mute">(pode escolher vários, ou nenhum se ainda não sabe)</span></legend>
          <div class="quote__checks">
            ${SERVICES.map(
              (s) => `<label class="check tile"><input type="checkbox" name="services" value="${s.id}"${services.includes(s.id) ? ' checked' : ''}><span><b>${esc(s.name)}</b><span class="small mute">${esc(s.detail)}</span></span></label>`,
            ).join('')}
          </div>
        </fieldset>
        <fieldset class="quote__group">
          <legend class="legend">Extras</legend>
          <div class="quote__extras">
            ${EXTRAS.map((e) => `<label class="check"><input type="checkbox" name="extras" value="${e.id}"${extras.includes(e.id) ? ' checked' : ''}><span>${esc(e.name)}</span></label>`).join('')}
          </div>
        </fieldset>
        <div class="form-grid">
          <label class="field"><span>Valor aproximado</span><select name="budget" required><option value="">Escolher…</option>${options(BUDGETS)}</select></label>
          <label class="field"><span>Para quando? <span class="mute">(opcional)</span></span><input name="deadline" type="date" min="${today}"></label>
          <label class="field full"><span>Conte-nos o projeto</span><textarea name="message" rows="6" required placeholder="Abrimos uma padaria em março e precisamos de…"></textarea></label>
        </div>
        <p class="quote__submit"><button class="btn btn--primary" type="submit">Enviar pedido ⏎</button><span class="small mute">Respondemos em menos de dois dias úteis.</span></p>
      </form>
    </div>
    <aside class="quote__side" aria-label="Estimativa e próximos passos">
      <div class="calc">
        <p class="calc__title">calculadora</p>
        <p class="calc__screen" data-estimate aria-live="polite">0 €</p>
        <p class="small" data-estimate-note>Marque os serviços para ver uma estimativa.</p>
      </div>
      <ol class="steps">
        ${STEPS.map(([title, text], i) => `<li><span class="steps__n">${i + 1}</span><span><b>${title}</b><span class="small mute">${text}</span></span></li>`).join('')}
      </ol>
      <p class="small">Prefere falar? <a class="link" href="mailto:${STUDIO.email}">${STUDIO.email}</a> ou <a class="link" href="tel:${STUDIO.phone.replace(/\s/g, '')}">${STUDIO.phoneLabel}</a>.</p>
    </aside>
  </div>`;

  return [
    {
      id: 'orcamento',
      label: 'Pedir orçamento',
      ico: 'doc',
      html: win({
        id: 'orcamento',
        url: '/orcamento',
        title: 'orçamento.txt',
        label: 'Pedir orçamento',
        ico: 'doc',
        primary: true,
        x: 60,
        y: 30,
        w: 1040,
        cls: 'win--note quote-win',
        script: 'quote',
        body,
        status: '<span>Ln 1, Col 1</span><span>Os dados só servem para responder ao pedido</span>',
      }),
    },
  ];
}
