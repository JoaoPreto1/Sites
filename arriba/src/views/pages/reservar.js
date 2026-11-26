import { ROOM_TYPES, SITE } from '../../config/site.js';
import { dayLong, today } from '../../utils/dates.js';
import { esc, euros, photo } from '../html.js';
import { monthsCalendar } from './quartos.js';

const HOURS = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
const cap = (s) => s.replace(/^./, (c) => c.toUpperCase());

// A lista de chaves livres agrupada por tipo (o JavaScript volta a desenhá-la quando as datas mudam)
export function keyList(a, chosen) {
  const free = a.rooms.filter((r) => r.free);
  if (!free.length) return `<p class="vazio">Nenhuma chave no quadro para estas datas. Escolha outras noites no calendário.</p>`;
  return ROOM_TYPES.map((t) => {
    const list = free.filter((r) => r.type === t.slug);
    if (!list.length) return '';
    const at = a.types.find((x) => x.slug === t.slug);
    return `<div class="op${list.some((r) => r.num === chosen) ? ' on' : ''}">
      <div class="op__im foto-r">${photo(t.photos[0], { sizes: '(max-width: 760px) 30vw, 220px' })}</div>
      <div class="op__tx"><h3>${esc(t.name)}</h3><p>${t.size} m² · ${esc(t.bed.toLowerCase())} · ${esc(t.view.toLowerCase())} · até ${t.guests} pessoas</p>
        <div class="op__ks" role="radiogroup" aria-label="Chaves ${esc(t.name)}">${list.map((r) => `<label class="kr"><input type="radio" name="room" value="${r.num}" data-tipo="${esc(t.name)}" data-total="${r.total}" data-foto="${t.photos[0]}"${r.num === chosen ? ' checked' : ''}><span>${r.num}</span></label>`).join('')}</div></div>
      <p class="op__pr"><b>${euros(at.total)}</b><small>${euros(at.price)} / noite</small></p>
    </div>`;
  }).join('');
}

export function bookingBody({ a, chosen, nights }) {
  const pick = a.rooms.find((r) => r.num === chosen && r.free) ?? a.rooms.find((r) => r.free);
  return `<section class="grid res-pg">
  <div class="res-pg__esq">
    <ol class="passos" aria-label="Passos da reserva"><li class="ok" data-passo="1"><b>01</b> Datas</li><li class="on" data-passo="2" aria-current="step"><b>02</b> Chave</li><li data-passo="3"><b>03</b> Os seus dados</li></ol>
    <div data-etapa="chave">
      <p class="e c">Reserva</p>
      <h1>Escolha a <em>chave.</em></h1>
      <p class="res-pg__lead" data-lead>${a.free.length} ${a.free.length === 1 ? 'chave está' : 'chaves estão'} no quadro para estas datas. Sem pagamento agora: paga-se à saída.</p>
      <form class="res-datas" action="/reservar" method="get" data-datas>
        <label><span>Chegada</span><input type="date" name="chegada" value="${a.checkIn}" min="${today()}" required></label>
        <label><span>Saída</span><input type="date" name="saida" value="${a.checkOut}" required></label>
        <label><span>Hóspedes</span><select name="hospedes">${[1, 2, 3].map((n) => `<option value="${n}"${n === a.guests ? ' selected' : ''}>${n} ${n === 1 ? 'adulto' : 'adultos'}</option>`).join('')}</select></label>
        <button class="sr" type="submit">Ver chaves</button>
      </form>
      <p class="form-erro" data-erro role="alert" hidden></p>
      <div class="meses res-pg__cal" data-cal aria-label="Calendário: escolha a noite de chegada e depois a de saída">${monthsCalendar(nights, { label: (n) => (n.free ? String(n.from) : 'cheio'), selected: a })}</div>
      <p class="res-pg__dica c">Toque na noite de chegada e depois na de saída. Os números pequenos são o preço mais baixo dessa noite.</p>
      <div class="lista-ch"><h2>Chaves no quadro <span data-noites>preço por ${a.nights} ${a.nights === 1 ? 'noite' : 'noites'}</span></h2><div data-lista>${keyList(a, pick?.num)}</div></div>
    </div>
    <div data-etapa="dados" hidden>
      <p class="e c">Reserva</p>
      <h1>Os seus <em>dados.</em></h1>
      <div data-sessao><p class="res-pg__lead">Para confirmar, entre na sua conta ou crie uma. Serve depois para mudar a hora de chegada, fazer pedidos e cancelar.</p><p class="res-pg__acoes"><a class="bt" data-entrar href="/entrar">Entrar</a><a class="bt bt--linha" data-criar href="/criar-conta">Criar conta</a></p></div>
      <form class="form res-pg__form" data-confirmar-form novalidate hidden>
        <p class="form-erro" data-erro2 role="alert" tabindex="-1" hidden></p>
        <label class="campo"><span>A que horas conta chegar?</span><select name="arrivalTime">${HOURS.map((h) => `<option${h === '17:00' ? ' selected' : ''}>${h}</option>`).join('')}</select></label>
        <label class="campo"><span>Alguma coisa que a receção deva saber? <small>(opcional)</small></span><textarea name="notes" rows="3" maxlength="500"></textarea></label>
        <p class="campo__erro" data-error="notes"></p>
        <button class="bt" type="submit">Confirmar a reserva</button>
      </form>
      <p class="res-pg__voltar"><button type="button" class="lk lk--volta" data-voltar>Voltar às chaves</button></p>
    </div>
  </div>
  <aside class="resumo" aria-labelledby="h-resumo">
    <div class="resumo__im"><img src="/img/chave.webp" width="960" height="1200" alt="" decoding="async"><p data-r-legenda>${pick ? `CHAVE ${pick.num} · FORA DO QUADRO` : 'QUADRO DA RECEÇÃO'}</p></div>
    <div class="resumo__t">
      <h2 id="h-resumo" data-r-nome>${pick ? esc(pick.typeName) : 'Sem chave'}</h2>
      <dl><div><dt>Chegada</dt><dd data-r-chegada>${cap(dayLong(a.checkIn))} · a partir das ${SITE.checkIn.slice(0, 2)}h</dd></div><div><dt>Saída</dt><dd data-r-saida>${cap(dayLong(a.checkOut))} · até às ${SITE.checkOut.slice(0, 2)}h</dd></div><div><dt>Hóspedes</dt><dd data-r-hospedes>${a.guests} ${a.guests === 1 ? 'adulto' : 'adultos'}</dd></div><div><dt>Incluído</dt><dd>Pequeno-almoço, bicicletas</dd></div></dl>
      <p class="resumo__tot"><span>Total</span><b data-r-total>${pick ? euros(pick.total) : '—'}</b></p>
      <button class="bt bt--claro resumo__bt" type="button" data-continuar${pick ? '' : ' disabled'}>Continuar</button>
      <p class="resumo__n">Sem pagamento agora. Cancela sem custos até ${SITE.freeCancelDays} dias antes da chegada.</p>
    </div>
  </aside>
  <div class="res-fixo" data-fixo><p><span>Total</span><b data-r-total2>${pick ? euros(pick.total) : '—'}</b></p><button class="bt bt--claro" type="button" data-continuar2${pick ? '' : ' disabled'}>Continuar</button></div>
</section>`;
}
