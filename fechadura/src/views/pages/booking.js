import { VENUE } from '../../config/venue.js';
import { esc, locks, photo } from '../html.js';

export function bookingBody({ rooms, window }) {
  return `<section class="page-head wrap">
    <p class="kicker">Reservar</p>
    <h1 class="display">Ficha de entrada.</h1>
    <p class="lead">Preencham a ficha como se fosse um auto: sala, dia, hora e quem vem. O bilhete ao lado vai-se escrevendo sozinho. Paga-se no fim, ao balcão.</p>
  </section>
  <section class="intake wrap" data-booking data-from="${window.from}" data-to="${window.to}">
    <form class="form-sheet paper" novalidate data-form>
      <p class="form-sheet__no type">Ficha n.º <span data-sheet-no>—</span> · ${esc(VENUE.street)}</p>

      <fieldset class="block">
        <legend class="display">1. A sala</legend>
        <div class="room-pick">${rooms
          .map(
            (r) => `<label class="room-opt" style="--accent:${r.color}">
              <input type="radio" name="room" value="${r.slug}" data-min="${r.players.min}" data-max="${r.players.max}" data-name="${esc(r.name)}" data-short="${esc(r.short)}" data-duration="${r.duration}" data-color="${r.color}">
              ${photo(r.photos[0].id, { alt: '', widths: [160, 240], sizes: '96px', ratio: 0.75 })}
              <span><small class="type">Caso ${r.caseNo}</small><b>${esc(r.name)}</b><em>${r.players.min} a ${r.players.max} pessoas · ${locks(r.difficulty)}</em></span>
            </label>`,
          )
          .join('')}</div>
      </fieldset>

      <fieldset class="block">
        <legend class="display">2. O dia e a hora</legend>
        <div class="field">
          <label for="f-date">Dia</label>
          <input class="input" type="date" id="f-date" name="date" min="${window.from}" max="${window.to}" required>
          <span class="hint">Fechamos à segunda. Aceitamos reservas para as próximas seis semanas.</span>
        </div>
        <div class="field">
          <span class="label" id="time-label">Hora</span>
          <div class="slot-row" role="group" aria-labelledby="time-label" data-times><p class="hint">Escolha primeiro a sala e o dia.</p></div>
          <input type="hidden" name="time">
        </div>
      </fieldset>

      <fieldset class="block">
        <legend class="display">3. A equipa</legend>
        <div class="row-2">
          <div class="field">
            <span class="label" id="players-label">Quantas pessoas</span>
            <div class="stepper" role="group" aria-labelledby="players-label"><button type="button" data-players="-1" aria-label="Menos uma pessoa">−</button><output data-players-out>4</output><button type="button" data-players="1" aria-label="Mais uma pessoa">+</button></div>
            <input type="hidden" name="players" value="4">
          </div>
          <div class="field">
            <label for="f-team">Nome da equipa <span class="hint">(aparece no registo de fugas)</span></label>
            <input class="input" id="f-team" name="team" maxlength="40" placeholder="Ex.: Os Primos Silva">
          </div>
        </div>
      </fieldset>

      <fieldset class="block">
        <legend class="display">4. Quem reserva</legend>
        <div class="row-2">
          <div class="field"><label for="f-name">Nome</label><input class="input" id="f-name" name="name" autocomplete="name" required maxlength="80"></div>
          <div class="field"><label for="f-phone">Telemóvel <span class="hint">(opcional)</span></label><input class="input" id="f-phone" name="phone" type="tel" autocomplete="tel" maxlength="30"></div>
        </div>
        <div class="field"><label for="f-email">Email</label><input class="input" id="f-email" name="email" type="email" autocomplete="email" required><span class="hint">Mandamos o bilhete para aqui. Com uma conta com este email, a reserva aparece no seu dossier.</span></div>
      </fieldset>

      <fieldset class="block">
        <legend class="display">5. Voucher <span class="hint">(se tiver)</span></legend>
        <div class="voucher-row">
          <div class="field"><label for="f-voucher">Código</label><input class="input" id="f-voucher" name="voucher" placeholder="CHAVE-XXXX" maxlength="10" autocapitalize="characters"></div>
          <button type="button" class="btn btn--ink btn--small" data-check-voucher>Confirmar</button>
        </div>
        <p class="hint" data-voucher-msg></p>
      </fieldset>

      <div class="form-sheet__end">
        <button class="btn btn--red" type="submit">Confirmar a reserva</button>
        <p class="hint">Pode mudar o número de pessoas ou cancelar até ${VENUE.cancelHours} horas antes, sem custos.</p>
      </div>
    </form>

    <aside class="ticket-preview" aria-live="polite">
      <div class="ticket" data-ticket>
        <div class="ticket__main">
          <p class="type ticket__kicker">Fechadura · bilhete de entrada</p>
          <p class="display ticket__room" data-t-room>Escolha uma sala</p>
          <dl class="ticket__data">
            <div><dt>Dia</dt><dd data-t-date>—</dd></div>
            <div><dt>Hora</dt><dd data-t-time>—</dd></div>
            <div><dt>Equipa</dt><dd data-t-players>4 pessoas</dd></div>
            <div><dt>Duração</dt><dd data-t-duration>—</dd></div>
          </dl>
        </div>
        <div class="ticket__stub"><span class="type">a pagar</span><b data-t-total>—</b><span class="hint" data-t-pp></span></div>
      </div>
      <p class="ticket-preview__note type">Cheguem 15 minutos antes. A porta é verde, no n.º ${VENUE.door}.</p>
    </aside>
  </section>`;
}
