import { bottle } from '../../../public/js/shared/bottle.js';
import { escapeHtml, money, monthName } from '../../../public/js/shared/format.js';

const boxTitle = (box) => {
  const title = box.title.split(':')[1]?.trim() ?? box.title;
  return title[0].toUpperCase() + title.slice(1);
};

const QUESTIONS = [
  ['Posso escolher os vinhos?', 'Pode dizer-nos se prefere só tintos, só brancos ou uma mistura. O resto é connosco — é essa a graça. Se uma garrafa não lhe agradar, trocamos na loja.'],
  ['Quando é cobrado?', 'No dia 1 de cada mês, antes de prepararmos a caixa. Se pausar antes disso, nesse mês não paga nada.'],
  ['E se não estiver em casa?', 'A transportadora tenta duas vezes e depois deixa num ponto de recolha perto de si. Também pode levantar na loja.'],
  ['Tem compromisso?', 'Nenhum. Pausa, muda de plano ou cancela na sua conta, quando quiser.'],
];

// O calendário do mês do clube, numa régua de 30 dias
const STEPS = [
  [1, 'Escolhemos', 'Provamos tudo o que entrou e fechamos a caixa do mês.'],
  [5, 'Enviamos', 'A caixa sai do Porto com as notas de prova escritas à mão.'],
  [12, 'Prova à distância', 'Uma conversa online com um dos produtores do mês, para quem quiser.'],
  [20, 'Desconto na loja', 'Até ao fim do mês, os vinhos da caixa têm o desconto do seu plano.'],
];

export function clubPage({ current, past, plans }) {
  return `
  <section class="club-hero">
    <div class="wrap club-hero__grid">
      <div>
        <p class="mono club-hero__kicker">O clube Cepa</p>
        <h1 class="title-xl">Todos os meses, <em>uma caixa</em> que escolhemos por si.</h1>
        <p>Vinhos que andámos a provar, de produtores que visitámos, com uma nota escrita sobre cada um. Este mês:</p>
      </div>
      <figure class="crate" aria-label="A caixa de ${monthName(`${current.month}-01`)}">
        <div class="crate__bottles">${current.picks.map(({ wine }) => `<a href="/carta/${wine.slug}">${bottle(wine)}</a>`).join('')}</div>
        <div class="crate__front"><span class="mono">Cepa · ${monthName(`${current.month}-01`)}</span><strong>${escapeHtml(boxTitle(current))}</strong></div>
      </figure>
    </div>
  </section>

  <section class="wrap notes" aria-label="Notas da caixa deste mês">
    ${current.picks
      .map(
        ({ wine, note }, i) => `
    <article class="note-card">
      <span class="note-card__n mono">${i + 1}</span>
      <h2><a href="/carta/${wine.slug}">${escapeHtml(wine.name)}${wine.year ? ` <em>${wine.year}</em>` : ''}</a></h2>
      <p>${escapeHtml(note)}</p>
    </article>`,
      )
      .join('')}
  </section>

  <section class="wrap month" aria-labelledby="month-title">
    <h2 id="month-title" class="title-lg">Um mês <em>no clube</em></h2>
    <ol class="ruler">
      ${STEPS.map(([day, title, text]) => `<li><span class="ruler__day mono">dia ${day}</span><h3>${title}</h3><p>${text}</p></li>`).join('')}
    </ol>
  </section>

  <section class="wrap join" id="aderir" aria-labelledby="join-title">
    <div class="join__intro">
      <h2 id="join-title" class="title-lg">Escolha <em>o tamanho</em> da caixa</h2>
      <p>O desconto vale para tudo o que comprar na loja ou no site enquanto for sócio.</p>
    </div>
    <form class="join__form" data-join>
      <fieldset class="plans">
        <legend class="sr-only">Plano</legend>
        ${plans
          .map(
            (p, i) => `
        <label class="plan">
          <input type="radio" name="plan" value="${p.slug}"${i === 1 ? ' checked' : ''}>
          <span class="plan__name">${escapeHtml(p.name)}</span>
          <span class="plan__price">${money(p.price)}<small class="mono">por mês</small></span>
          <span class="plan__text">${escapeHtml(p.description)}</span>
          <span class="plan__discount mono">${p.discount}% na loja</span>
        </label>`,
          )
          .join('')}
      </fieldset>
      <fieldset class="prefs">
        <legend class="mono">O que prefere receber</legend>
        <label><input type="radio" name="preference" value="misto" checked> <span>Um pouco de tudo</span></label>
        <label><input type="radio" name="preference" value="tintos"> <span>Só tintos</span></label>
        <label><input type="radio" name="preference" value="brancos"> <span>Só brancos e espumantes</span></label>
      </fieldset>
      <div class="join__actions">
        <button class="btn btn--wine" type="submit">Tornar-me sócio</button>
        <p class="join__msg" data-join-msg role="status"></p>
      </div>
    </form>
  </section>

  <section class="wrap archive" aria-labelledby="archive-title">
    <h2 id="archive-title" class="title-lg">Caixas <em>anteriores</em></h2>
    <ol>
      ${past
        .map(
          (box) => `
      <li>
        <span class="mono archive__month">${monthName(`${box.month}-01`)}</span>
        <div><h3>${escapeHtml(boxTitle(box))}</h3><p>${escapeHtml(box.intro)}</p></div>
        <span class="archive__bottles">${box.picks.map(({ wine }) => `<a href="/carta/${wine.slug}">${bottle(wine)}</a>`).join('')}</span>
      </li>`,
        )
        .join('')}
    </ol>
  </section>

  <section class="wrap questions" aria-labelledby="club-q">
    <h2 id="club-q" class="title-lg">Perguntas <em>frequentes</em></h2>
    ${QUESTIONS.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}
  </section>`;
}

export const CLUB_QUESTIONS = QUESTIONS;
