import { ROOM_TYPES, SITE } from '../../config/site.js';
import { addDays, dayLong, nights, today } from '../../utils/dates.js';
import { esc, euros, pageHead, photo } from '../html.js';

const HOURS = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

export function bookingBody({ a, chosen }) {
  const t = today();
  const freeRooms = a.rooms.filter((r) => r.free);
  const pick = freeRooms.find((r) => r.num === chosen) ?? freeRooms[0];
  return `${pageHead({ kicker: 'Reservar', title: 'Escolha a chave e confirme.', lead: `Sem pagamento agora. Cancela sem custos até ${SITE.freeCancelDays} dias antes da chegada.`, crumbs: [['Reservar']] })}
<section class="sec sec--topo"><div class="cx reservar">
  <div>
    <form class="datas datas--claro" action="/reservar" method="get" aria-label="Mudar as datas">
      <label class="datas__c"><span>Chegada</span><input type="date" name="chegada" value="${a.checkIn}" min="${t}" max="${addDays(t, 365)}" required></label>
      <label class="datas__c"><span>Saída</span><input type="date" name="saida" value="${a.checkOut}" min="${addDays(t, 1)}" required></label>
      <label class="datas__c"><span>Hóspedes</span><select name="hospedes">${[1, 2, 3].map((n) => `<option value="${n}"${n === a.guests ? ' selected' : ''}>${n} ${n === 1 ? 'adulto' : 'adultos'}</option>`).join('')}</select></label>
      <button class="btn btn--linha datas__ver" type="submit">Mudar datas</button>
    </form>

    <form class="reserva" data-reserva novalidate>
      <input type="hidden" name="checkIn" value="${a.checkIn}">
      <input type="hidden" name="checkOut" value="${a.checkOut}">
      <input type="hidden" name="guests" value="${a.guests}">
      <p class="form-erro" data-erro role="alert" tabindex="-1" hidden></p>
      <fieldset>
        <legend class="h3">${freeRooms.length ? `${freeRooms.length} ${freeRooms.length === 1 ? 'chave' : 'chaves'} no quadro para ${nights(a.nights)}` : 'Não há chaves no quadro para estas datas'}</legend>
        ${freeRooms.length ? '' : `<p>Experimente outras datas, ou escreva para <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>`}
        <div class="escolhas">${ROOM_TYPES.map((type) => {
          const list = freeRooms.filter((r) => r.type === type.slug);
          if (!list.length) return '';
          return `<div class="escolha-tipo">
            <div class="escolha-tipo__f">${photo(type.photos[0], { sizes: '(max-width: 820px) 30vw, 160px' })}</div>
            <div><h3>${esc(type.name)}</h3><p>${type.size} m² · ${esc(type.bed)} · ${esc(type.view)}</p>
            <div class="radios">${list.map((r) => `<label class="radio-chave"><input type="radio" name="room" value="${r.num}" data-total="${r.total}" data-tipo="${esc(type.name)}"${r.num === pick?.num ? ' checked' : ''}><span><b>${r.num}</b>${euros(r.total)}</span></label>`).join('')}</div></div>
          </div>`;
        }).join('')}</div>
        <p class="campo__erro" data-error="room"></p>
      </fieldset>
      ${freeRooms.length ? `<fieldset class="reserva__extra">
        <legend class="h3">A chegada</legend>
        <label class="campo"><span>A que horas conta chegar?</span><select name="arrivalTime">${HOURS.map((h) => `<option${h === '17:00' ? ' selected' : ''}>${h}</option>`).join('')}</select></label>
        <p class="campo__erro" data-error="arrivalTime"></p>
        <label class="campo"><span>Alguma coisa que a receção deva saber? <small>(opcional)</small></span><textarea name="notes" rows="3" maxlength="500"></textarea></label>
        <p class="campo__erro" data-error="notes"></p>
      </fieldset>
      <div class="sessao" data-sessao>
        <p>Para confirmar, entre na sua conta ou crie uma. Serve depois para ver a reserva, mudar a hora de chegada e fazer pedidos.</p>
        <p class="sessao__acoes"><a class="btn btn--verde" data-entrar href="/entrar">Entrar</a><a class="btn btn--linha" data-criar href="/criar-conta">Criar conta</a></p>
      </div>
      <button class="btn reserva__ok" type="submit" data-confirmar hidden>Confirmar reserva</button>` : ''}
    </form>
  </div>
  <aside class="resumo" aria-labelledby="h-resumo">
    <h2 id="h-resumo" class="h3">A sua estadia</h2>
    <dl>
      <div><dt>Chegada</dt><dd>${dayLong(a.checkIn)}</dd></div>
      <div><dt>Saída</dt><dd>${dayLong(a.checkOut)}</dd></div>
      <div><dt>Noites</dt><dd>${a.nights}</dd></div>
      <div><dt>Hóspedes</dt><dd>${a.guests}</dd></div>
      <div><dt>Chave</dt><dd data-r-chave>${pick ? `${pick.num} · ${esc(pick.typeName)}` : '—'}</dd></div>
    </dl>
    <p class="resumo__total"><span>Total</span><b data-r-total>${pick ? euros(pick.total) : '—'}</b></p>
    <p class="resumo__nota">Pequeno-almoço, bicicletas e estacionamento incluídos. Paga-se à saída.</p>
  </aside>
</div></section>`;
}
