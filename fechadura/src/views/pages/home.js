import { VENUE } from '../../config/venue.js';
import { PER_PERSON, clock, euros, shortDate } from '../../../public/js/shared/pricing.js';
import { esc, locks, photo, players } from '../html.js';

export const CARD_WIDTHS = [320, 480, 640];
export const CARD_SIZES = '(max-width: 640px) 90vw, (max-width: 1100px) 45vw, 300px';

function dial(i) {
  return `<div class="dial" data-dial="${i}">
          <button type="button" class="dial__btn" data-step="1" aria-label="Algarismo ${i + 1}: subir">▲</button>
          <div class="dial__drum" aria-hidden="true"><span class="dial__prev">9</span><span class="dial__cur">0</span><span class="dial__next">1</span></div>
          <output class="sr-only" aria-live="polite">0</output>
          <button type="button" class="dial__btn" data-step="-1" aria-label="Algarismo ${i + 1}: descer">▼</button>
        </div>`;
}

function gate() {
  return `<section class="gate" aria-labelledby="gate-title">
    <div class="gate__top wrap">
      <span class="kicker">Escape rooms · ${esc(VENUE.street)}, Porto</span>
      <a class="gate__skip" href="#salas">Não quero jogar: ver as salas ↓</a>
    </div>
    <div class="gate__stage wrap">
      <div class="note note--1 torn typed" aria-hidden="true">Pista n.º 1<br><br>Os três primeiros números são o <b>número da nossa porta</b>. Estão escritos lá em cima.</div>
      <div class="lock" data-lock>
        <div class="lock__shackle" aria-hidden="true"></div>
        <div class="lock__body">
          <h1 id="gate-title" class="display lock__title"><span class="sr-only">Fechadura, escape rooms no Porto. </span><span data-lock-title>O site está fechado</span></h1>
          <div class="dials" role="group" aria-label="Cadeado de quatro algarismos">${[0, 1, 2, 3].map(dial).join('')}</div>
          <p class="lock__hint typed" data-lock-hint>Rode as rodas. Ninguém fica fechado aqui.</p>
        </div>
      </div>
      <div class="note note--2 torn typed" aria-hidden="true">Pista n.º 2<br><br>O último é o número de <b>salas</b> que temos. Contem as fichas no quadro.</div>
    </div>
    <div class="gate__foot wrap">
      <p>Cada sala é um enigma de sessenta minutos, e o site também. Resolva o cadeado, ou use o atalho: as salas estão logo aqui em baixo.</p>
      <div class="gate__actions"><a class="btn btn--brass" href="/reservar">Reservar uma sala</a><a class="btn" href="#salas">Saltar o enigma</a></div>
      <div class="gate__clock" aria-hidden="true"><b data-clock>60:00</b><span>o tempo já está a contar</span></div>
    </div>
  </section>`;
}

function card(room, i, { next, record }) {
  const label = room.status === 'nova' ? '<span class="stamp case__stamp">Nova</span>' : room.difficulty === 5 ? '<span class="stamp case__stamp">Só para experientes</span>' : '';
  return `<article class="case case--${i + 1}" style="--accent:${room.color}">
      <span class="pin case__pin" data-pin></span>
      <a class="case__photo" href="/salas/${room.slug}" tabindex="-1" aria-hidden="true">${photo(room.photos[0].id, { alt: '', widths: CARD_WIDTHS, sizes: CARD_SIZES, ratio: 0.62 })}</a>
      ${label}
      <p class="case__no type">Caso ${room.caseNo} · ${esc(room.year)}</p>
      <h3 class="display case__name"><a href="/salas/${room.slug}">${esc(room.name)}</a></h3>
      <p class="case__tag type">${esc(room.tagline)}</p>
      <dl class="case__meta">
        <div><dt>Equipa</dt><dd>${players(room)}</dd></div>
        <div><dt>Tempo</dt><dd>${room.duration} min</dd></div>
        <div><dt>Dificuldade</dt><dd>${locks(room.difficulty)}</dd></div>
      </dl>
      <p class="case__next">${next ? `Próxima sessão livre: <b>${shortDate(next.date)}, ${next.time}</b>` : 'Sem sessões livres nas próximas semanas'}</p>
      ${record ? `<p class="case__record type">Recorde: ${esc(record.team)}, ${clock(record.seconds)}</p>` : ''}
    </article>`;
}

function board(rooms, extras, log) {
  const best = log.pages
    .flatMap((p) => p.entries.slice(0, 2).map((e) => ({ ...e, room: p.room.short })))
    .sort((a, b) => a.seconds - b.seconds)
    .slice(0, 6);

  return `<section class="board" id="salas" aria-labelledby="salas-title">
    <div class="wrap board__head">
      <h2 id="salas-title" class="display board__title">Quatro salas.<br>Quatro casos por resolver.</h2>
      <p class="board__intro">Cada sala é um caso com uma história, um cenário construído à mão e sessenta minutos no relógio. Escolham pela dificuldade, pelo tamanho do grupo ou pela história que vos puxar mais.</p>
    </div>
    <div class="wrap board__cork">
      <svg class="board__strings" data-strings aria-hidden="true"></svg>
      ${rooms.map((room, i) => card(room, i, extras[i])).join('')}
      <aside class="log paper typed" aria-labelledby="log-title">
        <h3 id="log-title" class="display log__title">Registo de fugas · ${esc(log.monthName.split(' ')[0])}</h3>
        <ol>${best.map((e) => `<li><span>${esc(e.team)}<small>${esc(e.room)}</small></span><b>${clock(e.seconds)}</b></li>`).join('')}</ol>
        <a class="link" href="/registo">Ver o registo completo</a>
      </aside>
    </div>
  </section>`;
}

function envelopes() {
  const items = [
    ['Reservem a sala', 'Escolham a sala, o dia e a hora. Paga-se no fim, ao balcão, por grupo e não por bilhete. Até 24 horas antes podem mudar o número de pessoas ou cancelar sem custos.'],
    ['Cheguem 15 minutos antes', 'Guardam as coisas num cacifo, o telemóvel fica de fora e o game master conta-vos o caso. Não é preciso trazer nada, nem saber nada.'],
    ['Sessenta minutos', 'A porta fecha e o relógio começa. Têm um walkie-talkie para pedir pistas: as três primeiras não contam para o registo. Se o tempo acabar, nós abrimos.'],
  ];
  return `<section class="how section" aria-labelledby="how-title">
    <div class="wrap">
      <p class="kicker">Como funciona</p>
      <h2 id="how-title" class="display how__title">Três envelopes, por ordem.</h2>
      <ol class="envelopes">${items
        .map(([title, text], i) => `<li class="envelope"><span class="envelope__no display">${i + 1}</span><h3 class="display">${title}</h3><p>${text}</p></li>`)
        .join('')}</ol>
    </div>
  </section>`;
}

function prices() {
  const rows = Object.entries(PER_PERSON)
    .map(([n, pp]) => `<li><span>${n} pessoas</span><span class="dots"></span><span>${euros(pp)} cada</span><b>${euros(pp * n)}</b></li>`)
    .join('');
  return `<section class="money section" aria-labelledby="money-title">
    <div class="wrap money__grid">
      <div>
        <p class="kicker">Preços</p>
        <h2 id="money-title" class="display money__title">Paga-se por grupo. Quantos mais, mais barato.</h2>
        <p class="lead">O preço é igual em todas as salas e em todos os horários. Paga-se no fim, ao balcão, com cartão, MB Way ou dinheiro.</p>
      </div>
      <div class="receipt typed">
        <p class="receipt__head">FECHADURA<br>${esc(VENUE.street)} · Porto<br>— talão de exemplo —</p>
        <ul>${rows}</ul>
        <p class="receipt__foot">Pistas incluídas · fotografia da equipa incluída<br>IVA incluído à taxa legal</p>
      </div>
      <a class="seal" href="/vouchers">
        <span class="seal__wax" aria-hidden="true">F</span>
        <span class="display seal__title">Ofereça uma hora fechada</span>
        <span class="seal__text">Vouchers para qualquer sala, válidos durante um ano, com uma mensagem escrita por si.</span>
        <span class="link">Escrever um voucher</span>
      </a>
    </div>
  </section>`;
}

function visit() {
  return `<section class="visit section" aria-labelledby="visit-title">
    <div class="wrap visit__grid">
      <div>
        <p class="kicker">Onde fica</p>
        <h2 id="visit-title" class="display visit__title">Uma porta verde em Cedofeita.</h2>
        <p class="lead">A oito minutos a pé do metro da Trindade e a cinco da Praça de Carlos Alberto. A porta é verde e tem um cadeado pintado. Toquem à campainha do rés-do-chão.</p>
        <ul class="visit__list">
          <li><b>Metro</b> Trindade (todas as linhas) ou Lapa</li>
          <li><b>Autocarro</b> 200, 201 e 207, paragem Cedofeita</li>
          <li><b>Carro</b> Parque da Praça de Lisboa, a 6 minutos</li>
          <li><b>Acessibilidade</b> O Banco e A Cave são no rés-do-chão, sem degraus</li>
        </ul>
      </div>
      <figure class="map" aria-label="Mapa simples da zona de Cedofeita">
        <svg viewBox="0 0 520 420" role="img" aria-labelledby="map-title"><title id="map-title">Mapa de Cedofeita com a Fechadura marcada no número 196</title>
          <rect width="520" height="420" fill="#1b1814"/>
          <g stroke="#3a332a" stroke-width="16" fill="none" stroke-linecap="round">
            <path d="M40 60 L470 380"/><path d="M60 330 L470 120"/><path d="M250 20 L230 400"/><path d="M20 200 L500 230"/>
          </g>
          <g stroke="#c9a24a" stroke-width="18" fill="none" stroke-linecap="round"><path d="M120 40 L330 400"/></g>
          <g font-family="Courier New, monospace" font-size="14" fill="#a69c8b">
            <text x="300" y="300" transform="rotate(60 300 300)" fill="#e6c46e">Rua de Cedofeita</text>
            <text x="360" y="225">Rua de Ceuta</text><text x="40" y="190">Rua da Boavista</text><text x="270" y="60">Praça Carlos Alberto</text>
          </g>
          <circle cx="430" cy="360" r="12" fill="#3e8a55"/><text x="352" y="398" font-family="Courier New, monospace" font-size="13" fill="#a69c8b">Metro Trindade</text>
          <g transform="translate(232 222)"><circle r="26" fill="#c6281d" opacity=".25"/><circle r="11" fill="#c6281d"/><text x="22" y="-16" font-family="Anton, Impact, sans-serif" font-size="22" fill="#efe6d2">196</text></g>
        </svg>
      </figure>
    </div>
  </section>`;
}

export const homeBody = ({ rooms, extras, log }) => `${gate()}
${board(rooms, extras, log)}
${envelopes()}
${prices()}
${visit()}`;
