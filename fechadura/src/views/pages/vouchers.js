import { VENUE } from '../../config/venue.js';
import { PER_PERSON, euros } from '../../../public/js/shared/pricing.js';
import { esc } from '../html.js';

export function vouchersBody({ rooms }) {
  return `<section class="page-head wrap">
    <p class="kicker">Vouchers</p>
    <h1 class="display">Ofereça uma hora fechada.</h1>
    <p class="lead">Um voucher é um envelope lacrado com uma mensagem sua. Vale para uma sessão, numa sala à escolha ou em qualquer uma, durante um ano. Quem recebe escolhe o dia.</p>
  </section>
  <section class="gift wrap" data-gift>
    <form class="gift__form" novalidate data-form>
      <div class="row-2">
        <div class="field"><label for="g-to">Para quem</label><input class="input" id="g-to" name="to" maxlength="40" required placeholder="Ex.: Pai e Mãe"></div>
        <div class="field"><label for="g-from">De quem</label><input class="input" id="g-from" name="from" maxlength="40" required placeholder="Ex.: Rita"></div>
      </div>
      <div class="field"><label for="g-msg">Mensagem <span class="hint">(até 240 caracteres)</span></label><textarea class="textarea" id="g-msg" name="message" maxlength="240" placeholder="Ex.: Para os 35 anos de casados. Vejam se conseguem sair juntos de um sítio fechado sem discutir."></textarea></div>
      <div class="row-2">
        <div class="field"><label for="g-room">Sala</label><select class="select" id="g-room" name="room">
          <option value="" data-max="6">Qualquer sala (escolhem eles)</option>
          ${rooms.map((r) => `<option value="${r.slug}" data-max="${r.players.max}">${esc(r.name)}</option>`).join('')}
        </select></div>
        <div class="field">
          <span class="label" id="g-players-label">Para quantas pessoas</span>
          <div class="stepper" role="group" aria-labelledby="g-players-label"><button type="button" data-players="-1" aria-label="Menos uma pessoa">−</button><output data-players-out>4</output><button type="button" data-players="1" aria-label="Mais uma pessoa">+</button></div>
        </div>
      </div>
      <div class="row-2">
        <div class="field"><label for="g-name">O seu nome</label><input class="input" id="g-name" name="buyerName" autocomplete="name" maxlength="80" required></div>
        <div class="field"><label for="g-email">O seu email</label><input class="input" id="g-email" name="buyerEmail" type="email" autocomplete="email" required></div>
      </div>
      <div class="gift__end">
        <button class="btn btn--red" type="submit">Lacrar o envelope · <span data-g-price>${euros(PER_PERSON[4] * 4)}</span></button>
        <p class="hint">Paga-se ao balcão, por MB Way ou transferência. O voucher fica ativo quando recebermos o pagamento.</p>
      </div>
    </form>

    <div class="envelope-preview" aria-live="polite">
      <div class="env" data-env>
        <div class="env__card paper">
          <p class="type env__kicker">Fechadura · vale uma hora fechada</p>
          <p class="env__msg" data-g-msg>A sua mensagem aparece aqui.</p>
          <p class="type env__sign">— <span data-g-from>quem oferece</span></p>
          <dl class="env__data">
            <div><dt>Sala</dt><dd data-g-room>qualquer sala</dd></div>
            <div><dt>Equipa</dt><dd data-g-players>até 4 pessoas</dd></div>
            <div><dt>Código</dt><dd class="env__code" data-g-code>CHAVE-····</dd></div>
          </dl>
        </div>
        <div class="env__back" aria-hidden="true"></div>
        <div class="env__front">
          <p class="type env__to">Para: <span data-g-to>…</span></p>
          <p class="type env__addr">Abrir só no dia certo.</p>
        </div>
        <span class="env__seal" aria-hidden="true">F</span>
      </div>
    </div>
  </section>
  <section class="section gift-faq">
    <div class="wrap gift-faq__grid">
      <div><h2 class="display">Como funciona</h2></div>
      <ol class="typed">
        <li>Escreve a mensagem e escolhe a sala e o número de pessoas.</li>
        <li>Paga ao balcão, por MB Way para o ${esc(VENUE.phone)} ou por transferência, com o código no descritivo.</li>
        <li>Quando o pagamento chegar, o voucher fica ativo e mandamos o envelope em PDF, pronto a imprimir.</li>
        <li>Quem recebe reserva no site, escreve o código no fim da ficha e não paga nada no dia.</li>
      </ol>
    </div>
  </section>`;
}
