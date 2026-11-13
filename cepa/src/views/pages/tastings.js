import { bottle } from '../../../public/js/shared/bottle.js';
import { dayNumber, escapeHtml, longDate, money, monthName, plural } from '../../../public/js/shared/format.js';
import { glasses, photo } from '../helpers.js';

const QUESTIONS = [
  ['Preciso de perceber de vinho?', 'Não. As provas são conversas à volta de uma mesa, não exames. Quem sabe mais aprende com o produtor; quem sabe menos aprende com todos.'],
  ['O que está incluído no preço?', 'Todos os vinhos da prova, comida para acompanhar e água. Se gostar de alguma garrafa, tem 10% de desconto nesse dia.'],
  ['E se não puder ir?', 'Cancele na sua conta até 48 horas antes e o lugar volta para a lista. Depois disso, pode mandar outra pessoa no seu lugar.'],
  ['Onde é?', 'Na sala do fundo da loja, na Rua de Cedofeita 212, com uma mesa comprida para dezasseis pessoas.'],
];

export function tastingsPage({ tastings }) {
  return `
  <section class="tastings wrap">
    <header class="tastings__head">
      <p class="kicker mono"><span>Provas na loja</span></p>
      <h1 class="title-xl">Um produtor, <em>uma mesa comprida</em> e os vinhos dele.</h1>
      <p>Duas ou três vezes por mês, convidamos quem faz o vinho a vir contá-lo. Lugares contados: cada copo abaixo é uma cadeira.</p>
    </header>

    <ol class="tickets">
      ${tastings
        .map(
          (t) => `
      <li class="ticket" id="${t.slug}">
        <div class="ticket__photo">${photo(t.photo, { widths: [400, 700, 1000], ratio: 0.75, sizes: '(max-width: 900px) 100vw, 40vw', alt: t.title })}</div>
        <div class="ticket__body">
          <p class="ticket__date"><span class="ticket__day">${dayNumber(t.date)}</span><span class="mono">${monthName(t.date)}<br>${t.time}</span></p>
          <h2>${escapeHtml(t.title)}</h2>
          <p class="ticket__host">com ${escapeHtml(t.host)}</p>
          <p>${escapeHtml(t.description)}</p>
          <div class="ticket__lineup" aria-label="Vinhos da prova">
            ${t.lineup.map((w) => `<a href="/carta/${w.slug}" title="${escapeHtml(w.name)}">${bottle(w, { title: true })}</a>`).join('')}
          </div>
        </div>
        <div class="ticket__stub">
          <p class="ticket__price">${money(t.price)}<span class="mono">por pessoa</span></p>
          ${glasses(t.seats, t.taken)}
          <p class="mono ticket__left" data-left="${t.id}">${t.seatsLeft ? plural(t.seatsLeft, 'lugar livre', 'lugares livres') : 'Esgotada'}</p>
          ${
            t.seatsLeft
              ? `<form class="ticket__form" data-reserve="${t.id}" data-title="${escapeHtml(t.title)}">
            <label class="field"><span>Lugares</span>
              <select class="input" name="people">${Array.from({ length: Math.min(4, t.seatsLeft) }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}</select>
            </label>
            <button class="btn" type="submit">Reservar</button>
          </form>`
              : '<p class="ticket__full">Esgotada. Fique atento à newsletter: abrimos sempre uma segunda data.</p>'
          }
          <p class="ticket__when mono">${longDate(t.date)}</p>
        </div>
      </li>`,
        )
        .join('')}
    </ol>

    <section class="questions" aria-labelledby="q-title">
      <h2 id="q-title" class="title-lg">Antes de <em>vir</em></h2>
      ${QUESTIONS.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}
    </section>
  </section>`;
}

export const TASTING_QUESTIONS = QUESTIONS;
