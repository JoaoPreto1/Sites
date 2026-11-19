import { VENUE } from '../../config/venue.js';
import { PER_PERSON, clock, euros, shortDate } from '../../../public/js/shared/pricing.js';
import { esc, locks, photo, players } from '../html.js';

export const CARD_WIDTHS = [320, 480, 640];
export const CARD_SIZES = '(max-width: 640px) 90vw, (max-width: 1100px) 45vw, 300px';

// Cada roda tem uma fita com os algarismos repetidos, que desliza para cima e para baixo
const STRIP = Array.from({ length: 50 }, (_, i) => `<span>${i % 10}</span>`).join('');

function dial(i) {
  return `<div class="dial" data-dial="${i}">
          <button type="button" class="dial__btn" data-step="1" aria-label="Algarismo ${i + 1}: subir"><svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 7 6 2l5 5"/></svg></button>
          <div class="dial__drum" aria-hidden="true"><div class="dial__strip">${STRIP}</div></div>
          <output class="sr-only" aria-live="polite">0</output>
          <button type="button" class="dial__btn" data-step="-1" aria-label="Algarismo ${i + 1}: descer"><svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1l5 5 5-5"/></svg></button>
        </div>`;
}

const shackle = `<svg class="lock__shackle" viewBox="0 0 300 230" aria-hidden="true">
          <defs>
            <linearGradient id="steel" x1="0" x2="1">
              <stop offset="0" stop-color="#6f7378"/><stop offset=".18" stop-color="#e9ecef"/><stop offset=".32" stop-color="#9aa0a6"/>
              <stop offset=".5" stop-color="#5d6166"/><stop offset=".68" stop-color="#b9bec3"/><stop offset=".84" stop-color="#f4f6f8"/><stop offset="1" stop-color="#70757a"/>
            </linearGradient>
          </defs>
          <path d="M42 230V120a108 108 0 0 1 216 0v110" fill="none" stroke="#1d1a16" stroke-width="58" stroke-linecap="butt" opacity=".35" transform="translate(6 8)"/>
          <path d="M42 230V120a108 108 0 0 1 216 0v110" fill="none" stroke="url(#steel)" stroke-width="52"/>
          <path d="M28 230V120a122 122 0 0 1 244 0" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2"/>
        </svg>`;

function gate() {
  return `<section class="gate" aria-labelledby="gate-title" data-gate>
    <div class="gate__beam" aria-hidden="true"></div>
    <div class="gate__top wrap">
      <span class="kicker">Escape rooms · ${esc(VENUE.street)}, Porto</span>
      <a class="gate__skip" href="#salas">Não quero jogar: ver as salas ↓</a>
    </div>
    <div class="gate__stage wrap">
      <div class="note note--1 torn typed" aria-hidden="true"><span class="note__tape"></span>Pista n.º 1<br><br>Os três primeiros números são o <b>número da nossa porta</b>. Estão escritos lá em cima.</div>
      <div class="lock" data-lock>
        ${shackle}
        <div class="lock__body">
          <i class="screw screw--tl"></i><i class="screw screw--tr"></i><i class="screw screw--bl"></i><i class="screw screw--br"></i>
          <span class="lock__sheen" aria-hidden="true"></span>
          <p class="lock__brand type" aria-hidden="true">Fechadura · Porto · n.º ${esc(VENUE.door)}</p>
          <h1 id="gate-title" class="display lock__title"><span class="sr-only">Fechadura, escape rooms no Porto. </span><span data-lock-title>O site está fechado</span></h1>
          <div class="lock__window">
            <div class="dials" role="group" aria-label="Cadeado de quatro algarismos">${[0, 1, 2, 3].map(dial).join('')}</div>
          </div>
          <p class="lock__hint typed" data-lock-hint>Rode as rodas. Ninguém fica fechado aqui.</p>
          <span class="lock__keyhole" aria-hidden="true"></span>
        </div>
        <div class="lock__sparks" aria-hidden="true">${'<i></i>'.repeat(12)}</div>
      </div>
      <div class="note note--2 torn typed" aria-hidden="true"><span class="note__tape"></span>Pista n.º 2<br><br>O último é o número de <b>salas</b> que temos. Contem as fichas no quadro.</div>
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
      <figure class="map">
        <svg viewBox="0 0 600 470" role="img" aria-labelledby="map-title map-desc">
          <title id="map-title">Mapa de Cedofeita</title>
          <desc id="map-desc">A Fechadura fica no número 196 da Rua de Cedofeita, a oito minutos a pé da estação de metro da Trindade e perto da Praça de Carlos Alberto.</desc>
          <defs>
            <pattern id="map-grain" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="#b9a67c" opacity=".35"/></pattern>
            <pattern id="map-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v8" stroke="#8fa06d" stroke-width="2" opacity=".5"/></pattern>
          </defs>
          <rect width="600" height="470" fill="#e4d3ac"/>
          <rect width="600" height="470" fill="url(#map-grain)"/>

          <!-- quarteirões: o fundo é o quarteirão, as ruas recortam-no -->
          <g fill="#d6c294" stroke="#c4ad79" stroke-width="1">
            <path d="M0 0h600v470H0z" opacity=".55"/>
          </g>
          <path d="M18 290 C 60 270, 110 300, 150 286 L 170 360 C 120 380, 60 370, 26 380Z" fill="#b7c492"/>
          <path d="M18 290 C 60 270, 110 300, 150 286 L 170 360 C 120 380, 60 370, 26 380Z" fill="url(#map-hatch)"/>
          <rect x="14" y="30" width="78" height="56" rx="6" fill="#efe4c6" stroke="#c4ad79"/>

          <g fill="none" stroke-linecap="round" stroke-linejoin="round">
            <g stroke="#f6eedb" stroke-width="20">
              <path d="M0 132 L 600 176"/>
              <path d="M0 244 C 140 236, 260 250, 600 236"/>
              <path d="M0 352 L 360 384 L 600 360"/>
              <path d="M330 0 L 300 470"/>
              <path d="M488 0 L 520 470"/>
              <path d="M40 0 L 190 470"/>
            </g>
            <g stroke="#c4ad79" stroke-width="22" opacity=".35">
              <path d="M96 0 L 392 470"/>
            </g>
            <path d="M96 0 L 392 470" stroke="#f3dd9a" stroke-width="24"/>
            <path d="M96 0 L 392 470" stroke="#d8b24f" stroke-width="2" stroke-dasharray="2 10" opacity=".9"/>
          </g>

          <g font-family="Special Elite, Courier New, monospace" fill="#6a5a3c" font-size="13" letter-spacing=".5">
            <text transform="translate(116 44) rotate(57.8)" fill="#6b4c10" font-size="15">RUA DE CEDOFEITA</text>
            <text x="404" y="168" transform="rotate(4.2 404 168)">Rua de Ceuta</text>
            <text x="20" y="232">Rua da Boavista</text>
            <text x="196" y="362" transform="rotate(5 196 362)">R. Miguel Bombarda</text>
            <text transform="translate(321 128) rotate(-86)">R. do Breiner</text>
            <text transform="translate(510 120) rotate(86)">R. Mártires da Liberdade</text>
            <text x="22" y="54" font-size="11.5">Pr. Carlos</text><text x="22" y="70" font-size="11.5">Alberto</text>
            <text x="44" y="316" font-size="12" fill="#56663a">Jardim</text>
          </g>

          <!-- caminho a pé desde a Trindade -->
          <path class="map__route" d="M548 424 C 520 400, 500 372, 452 360 S 360 330, 330 300 S 290 268, 268 262" fill="none" stroke="#c6281d" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="7 8"/>
          <g transform="translate(440 318)">
            <rect x="-6" y="-16" width="94" height="24" rx="4" fill="#fbf6e8" stroke="#c6281d"/>
            <text x="41" y="1" text-anchor="middle" font-family="Special Elite, Courier New, monospace" font-size="13" fill="#9c1f16">8 min a pé</text>
          </g>

          <!-- metro -->
          <g transform="translate(556 432)">
            <circle r="17" fill="#1d3a6e"/><text y="6" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="18" fill="#fff">M</text>
          </g>
          <text x="488" y="462" font-family="Special Elite, Courier New, monospace" font-size="12" fill="#1d3a6e">Trindade</text>

          <!-- a porta -->
          <g transform="translate(266 260)">
            <circle class="map__pulse" r="16" fill="#c6281d" opacity=".35"/>
            <path d="M0 0 C -14 -16, -18 -24, -18 -34 A 18 18 0 0 1 18 -34 C 18 -24, 14 -16, 0 0Z" fill="#c6281d" stroke="#7d160f" stroke-width="1.5"/>
            <circle cy="-36" r="5" fill="#fbe9e6"/><path d="M-3 -33h6l1.5 10h-9z" fill="#fbe9e6"/>
            <g transform="translate(20 -66)">
              <rect width="94" height="40" rx="4" fill="#1b1814"/>
              <text x="47" y="18" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="17" fill="#efe6d2" letter-spacing="1">FECHADURA</text>
              <text x="47" y="33" text-anchor="middle" font-family="Special Elite, Courier New, monospace" font-size="11" fill="#c9a24a">n.º 196</text>
            </g>
          </g>

          <!-- rosa dos ventos e escala -->
          <g transform="translate(560 44)" fill="#6a5a3c">
            <circle r="22" fill="none" stroke="#8a7650" stroke-width="1"/>
            <path d="M0 -26 L6 0 L0 6 L-6 0Z" fill="#c6281d"/><path d="M0 26 L6 0 L0 -6 L-6 0Z" fill="#8a7650"/>
            <text y="-30" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="12">N</text>
          </g>
          <g transform="translate(24 440)" font-family="Special Elite, Courier New, monospace" font-size="11" fill="#6a5a3c">
            <path d="M0 0h80M0 -5v10M40 -3v6M80 -5v10" stroke="#6a5a3c" stroke-width="1.5"/>
            <text x="0" y="-10">0</text><text x="66" y="-10">100 m</text>
          </g>

          <!-- vincos do mapa dobrado -->
          <g opacity=".5">
            <path d="M200 0v470M400 0v470" stroke="#fff8e6" stroke-width="1.5"/>
            <path d="M201.5 0v470M401.5 0v470" stroke="#a8925f" stroke-width="1" opacity=".5"/>
            <path d="M0 235h600" stroke="#fff8e6" stroke-width="1.5"/>
            <path d="M0 236.5h600" stroke="#a8925f" stroke-width="1" opacity=".5"/>
          </g>
        </svg>
        <figcaption class="type">Rua de Cedofeita 196 · porta verde, campainha do rés-do-chão</figcaption>
      </figure>
    </div>
  </section>`;
}

export const homeBody = ({ rooms, extras, log }) => `${gate()}
${board(rooms, extras, log)}
${envelopes()}
${prices()}
${visit()}`;
