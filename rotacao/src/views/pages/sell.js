import { icons } from '../../../public/js/shared/icons.js';
import { disc } from '../layout.js';

export const SELL_QUESTIONS = [
  ['Que discos compram?', 'Quase tudo em vinil: jazz, soul, rock, fado, música brasileira e africana, electrónica. Compramos menos música clássica e discos muito riscados, mas vale sempre a pena perguntar.'],
  ['Como chegam ao preço?', 'Ouvimos e classificamos cada disco à tua frente (M, NM, VG+, VG, G), vemos a prensagem e o que costuma valer. Propomos um valor pelo lote, sem compromisso.'],
  ['Pagam como?', 'Na hora, por transferência ou MB WAY. Se preferires crédito para gastar na loja, dá mais 20%.'],
  ['Vão a casa?', 'Sim, na área de Lisboa e Setúbal, para coleções a partir de cinquenta discos. Para menos, trazes à loja quando te der jeito.'],
];

export function sellPage({ counts }) {
  return `
  <section class="sell-hero">
    <div class="wrap sell-hero__grid">
      <div>
        <p class="kicker">Compramos discos · coleções e discos soltos</p>
        <h1 class="display">Tens uma caixa<br>no sótão?</h1>
        <p>Vamos a casa ou trazes à loja. Ouvimos, classificamos à tua frente e pagamos na hora — ou em crédito para a loja, com mais 20%.</p>
      </div>
      <div class="sell-hero__box" aria-hidden="true">
        ${disc('sell-hero__disc sell-hero__disc--1')}${disc('sell-hero__disc sell-hero__disc--2')}${disc('sell-hero__disc sell-hero__disc--3')}
        <span class="sell-hero__crate"><b>Frágil</b></span>
      </div>
    </div>
  </section>

  <section class="sell wrap">
    <ol class="sell__steps">
      <li class="reveal"><span>1</span><h2>Diz-nos o que tens</h2><p>Mais ou menos quantos discos e de que géneros. Uma fotografia das lombadas ajuda muito.</p></li>
      <li class="reveal" style="--d:.08s"><span>2</span><h2>Marcamos a avaliação</h2><p>Em tua casa ou na loja, à hora que te der jeito. Demora entre meia hora e uma tarde.</p></li>
      <li class="reveal" style="--d:.16s"><span>3</span><h2>Pagamos na hora</h2><p>Transferência, MB WAY ou crédito na loja com mais 20%. Os que não quisermos ficam contigo.</p></li>
    </ol>

    <div class="sell__grid">
      <form class="sell__form box" data-sell novalidate>
        <h2>Pedido de avaliação</h2>
        <div class="sell__row">
          <label class="field"><span>Nome</span><input class="input" name="name" autocomplete="name" required></label>
          <label class="field"><span>Email</span><input class="input" type="email" name="email" autocomplete="email" required></label>
        </div>
        <div class="sell__row">
          <label class="field"><span>Telemóvel (opcional)</span><input class="input" type="tel" name="phone" autocomplete="tel"></label>
          <label class="field"><span>Quantos discos, mais ou menos</span><select class="input" name="count" required>${counts.map((c) => `<option>${c}</option>`).join('')}</select></label>
        </div>
        <label class="field"><span>Géneros (opcional)</span><input class="input" name="genres" maxlength="120" placeholder="Jazz, fado, rock dos anos 70…"></label>
        <fieldset class="sell__method">
          <legend class="mono">Onde fazemos a avaliação</legend>
          <label><input type="radio" name="method" value="casa" checked><span><b>Em minha casa</b><small>Lisboa e Setúbal, a partir de 50 discos</small></span></label>
          <label><input type="radio" name="method" value="loja"><span><b>Levo à loja</b><small>Rua dos Anjos 58, quando te der jeito</small></span></label>
        </fieldset>
        <label class="field"><span>Localidade (opcional)</span><input class="input" name="area" maxlength="60" placeholder="Almada"></label>
        <label class="field"><span>Mais alguma coisa? (opcional)</span><textarea class="input" name="notes" maxlength="500" rows="3" placeholder="Eram do meu pai, estão num armário desde os anos 90…"></textarea></label>
        <p class="form-error" data-error hidden></p>
        <button class="btn btn--ink" type="submit">Pedir avaliação ${icons.right}</button>
        <div class="sell__done" data-done hidden></div>
      </form>

      <div class="faq">
        <p class="kicker">Perguntas</p>
        ${SELL_QUESTIONS.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}
      </div>
    </div>
  </section>`;
}
