import { dayNumber, escapeHtml, hour, price, weekdayShort } from '../../../public/js/shared/format.js';

export const ROOM_QUESTIONS = [
  ['Posso cancelar uma marcação?', 'Sim, sem custos até 24 horas antes, na tua conta. Depois disso, liga-nos e vemos o que se pode fazer.'],
  ['O que está incluído no preço?', 'A sala, o backline que aparece em cada canal e café da loja. Cabos e baquetas também temos, mas traz as tuas se fores esquisito.'],
  ['Dá para gravar o ensaio?', 'Dá. Ligamos a mesa a um gravador multipista e no fim levas as pistas separadas numa pen ou por link. São mais 10 €.'],
  ['Até que horas estão abertas?', 'Todos os dias das 10h à meia-noite, incluindo domingos e feriados.'],
];

// Um canal da mesa por sala: fita-cola com o nome, botões, LEDs das horas e o fader
export function channel(room, { hours }) {
  return `
    <div class="ch" data-room="${room.id}">
      <span class="tape">${escapeHtml(room.name)}</span>
      <p class="ch__spec mono">${room.size} m² · até ${room.capacity} pessoas<br>${room.gear.map(escapeHtml).join(' · ')}</p>
      <div class="ch__knobs" aria-hidden="true">${room.knobs.map((k, i) => `<span class="knob" style="--r:${[-50, 30, 110][i]}deg"><i></i>${k}</span>`).join('')}</div>
      <div class="ch__fader">
        <div class="ch__hours mono" aria-hidden="true">${hours.map((h) => `<span>${hour(h)}</span>`).join('')}</div>
        <div class="ch__slots" role="group" aria-label="Horas da ${escapeHtml(room.name)}">
          ${room.slots
            .map(
              (s) =>
                `<button type="button" class="slot is-${s.state}" data-hour="${s.hour}" ${s.state === 'livre' ? '' : 'disabled'} aria-label="${hour(s.hour)} ${s.state === 'livre' ? 'livre' : s.state}">${s.state === 'ocupada' ? '<i>ocupado</i>' : s.state === 'tua' ? '<i>tua</i>' : ''}</button>`,
            )
            .join('')}
        </div>
        <div class="ch__track" aria-hidden="true"><b class="ch__cap"></b></div>
      </div>
      <p class="ch__price"><b>${price(room.price)}/h</b><span class="mono">${escapeHtml(room.note)}</span></p>
    </div>`;
}

export function roomsPage({ date, days, hours, rooms, extras, maxHours }) {
  const pads = days
    .map((d) => `<button type="button" class="pad" data-day="${d}" aria-pressed="${d === date}"><span>${weekdayShort(d)}</span><b>${dayNumber(d)}</b></button>`)
    .join('');

  return `
  <section class="rooms wrap">
    <header class="page-head rooms__head">
      <div>
        <p class="kicker">Salas de ensaio · no piso de baixo da loja</p>
        <h1 class="display">Ensaia <em>alto.</em></h1>
      </div>
      <p>Três salas insonorizadas com backline. Escolhe o dia, carrega na primeira e na última hora do ensaio no canal da sala, e confirma no master. Até ${maxHours} horas seguidas.</p>
    </header>

    <div class="desk" data-desk>
      <div class="desk__pads" role="group" aria-label="Dia"><span class="mono">Dia</span><div class="desk__days">${pads}</div></div>
      <div class="desk__mix">
        <div class="desk__channels" data-channels>${rooms.map((r) => channel(r, { hours })).join('')}</div>
        <aside class="master" data-master aria-live="polite">
          <span class="tape">Master</span>
          <p class="master__empty" data-master-empty>Carrega numa hora livre de uma sala. Para um ensaio mais comprido, carrega depois na última hora.</p>
          <dl class="master__sum" data-master-sum hidden>
            <div><dt>Sala</dt><dd data-sum-room></dd></div>
            <div><dt>Dia</dt><dd data-sum-day></dd></div>
            <div><dt>Horas</dt><dd data-sum-hours></dd></div>
            <div><dt data-sum-rate></dt><dd data-sum-base></dd></div>
          </dl>
          <div class="master__extras">
            ${Object.entries(extras)
              .map(([key, e]) => `<label class="switch"><input type="checkbox" name="extras" value="${key}"><i></i><span>${e.label}</span><em>+${price(e.price)}</em></label>`)
              .join('')}
            <label class="field master__band"><span>Banda ou nome</span><input class="input" name="band" maxlength="60" placeholder="Os Fósforos" data-band></label>
          </div>
          <div class="master__total"><span class="mono">Total</span><b data-sum-total>0 €</b></div>
          <button class="btn" type="button" data-book disabled>Escolhe as horas</button>
          <p class="master__note mono">Cancelas sem custo até 24 h antes. Pagas na loja.</p>
        </aside>
      </div>
      <p class="desk__legend mono"><span><i class="is-livre"></i>Livre</span><span><i class="is-ocupada"></i>Ocupado</span><span><i class="is-sel"></i>A tua escolha</span><span><i class="is-tua"></i>Já marcado por ti</span></p>
    </div>
  </section>

  <section class="rooms-info wrap">
    <div class="rooms-info__steps reveal">
      <p class="kicker">Como funciona</p>
      <ol>
        <li><b>Escolhe o dia</b> nos botões de cima. Dá para marcar com duas semanas de antecedência.</li>
        <li><b>Acende as horas</b> no canal da sala: primeira e última hora do ensaio.</li>
        <li><b>Confirma no master.</b> Recebes a marcação na conta e podes cancelar até 24 h antes.</li>
      </ol>
    </div>
    <div class="faq reveal" style="--d:.1s">
      <p class="kicker">Perguntas</p>
      ${ROOM_QUESTIONS.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}
    </div>
  </section>`;
}
