import { VENUE } from '../../config/venue.js';
import { PER_PERSON, clock, euros, shortDate } from '../../../public/js/shared/pricing.js';
import { esc, locks, photo, players } from '../html.js';

export const FILTERS = [
  ['', 'Todas', () => true],
  ['estrear', 'Para estrear', (r) => r.difficulty <= 2],
  ['grupos', 'Para 6 pessoas', (r) => r.players.max >= 6],
  ['sem-degraus', 'Sem degraus', (r) => r.accessible],
  ['dificeis', 'Só para experientes', (r) => r.difficulty >= 4],
];

const crumbs = (items) =>
  `<nav aria-label="Caminho"><ol class="crumbs">${items.map(([label, href]) => `<li>${href ? `<a href="${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`}</li>`).join('')}</ol></nav>`;

function drawer(room, i, next) {
  return `<article class="drawer" style="--accent:${room.color}">
      <div class="drawer__tab type">Caso ${room.caseNo}<span>${esc(room.year)}</span></div>
      <div class="drawer__folder">
        <div class="drawer__photos">
          ${room.photos.map((p, k) => `<span class="drawer__ph drawer__ph--${k + 1}">${photo(p.id, { alt: k === 0 ? p.alt : '', widths: k === 0 ? [360, 540, 720] : [200, 300], sizes: k === 0 ? '(max-width: 760px) 90vw, 300px' : '140px', ratio: k === 0 ? 0.75 : 1, eager: i === 0 && k === 0 })}</span>`).join('')}
        </div>
        <div class="drawer__text">
          <h2 class="display drawer__name"><a href="/salas/${room.slug}">${esc(room.name)}</a></h2>
          <p class="drawer__tag type">${esc(room.tagline)}</p>
          <p class="drawer__story">${esc(room.story[0])}</p>
          <ul class="drawer__clues">${room.clues.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
        </div>
        <dl class="drawer__facts typed">
          <div><dt>Equipa</dt><dd>${players(room)}</dd></div>
          <div><dt>Tempo</dt><dd>${room.duration} minutos</dd></div>
          <div><dt>Idade</dt><dd>a partir dos ${room.minAge}</dd></div>
          <div><dt>Dificuldade</dt><dd>${locks(room.difficulty)}</dd></div>
          <div><dt>Saem a tempo</dt><dd>${room.escapeRate} em cada 100 equipas</dd></div>
          <div><dt>Sem degraus</dt><dd>${room.accessible ? 'sim' : 'não, tem escadas'}</dd></div>
        </dl>
        <div class="drawer__cta"><a class="btn btn--brass btn--small" href="/salas/${room.slug}">Abrir o dossier</a><span class="hint">${next ? `Livre: ${shortDate(next.date)}, ${next.time}` : 'Sem sessões livres'}</span></div>
      </div>
    </article>`;
}

export function roomsBody({ rooms, filter, nexts }) {
  return `<section class="page-head wrap">
    ${crumbs([['Início', '/'], ['Salas']])}
    <p class="kicker">O arquivo</p>
    <h1 class="display">As salas, caso a caso.</h1>
    <p class="lead">Quatro processos por fechar, guardados numa gaveta do arquivo. Cada um tem a sua história, a sua dificuldade e um número de pessoas certo. Abram o que vos chamar.</p>
    <nav class="chips cabinet__filters" aria-label="Filtrar salas">${FILTERS.map(
      ([value, label]) => `<a class="chip" href="/salas${value ? `?para=${value}` : ''}"${(filter ?? '') === value ? ' aria-current="page"' : ''}>${label}</a>`,
    ).join('')}</nav>
  </section>
  <section class="cabinet" aria-label="Salas">
    <div class="wrap cabinet__inner">
      ${rooms.length ? rooms.map((room, i) => drawer(room, i, nexts.get(room.id))).join('') : '<p class="empty">Nenhuma sala com este filtro.</p>'}
    </div>
  </section>`;
}

/* Dossier de uma sala */

export const HERO_WIDTHS = [480, 720, 960, 1200];
export const HERO_SIZES = '(max-width: 900px) 92vw, 640px';

export function roomBody({ room, calendar, log, others }) {
  const [main, ...more] = room.photos;
  const prices = Object.entries(PER_PERSON).filter(([n]) => n >= room.players.min && n <= room.players.max);

  return `<section class="dossier" style="--accent:${room.color}">
    <div class="wrap">
      ${crumbs([['Início', '/'], ['Salas', '/salas'], [room.name]])}
      <div class="dossier__head">
        <p class="dossier__tab type">Caso ${room.caseNo} · ${esc(room.year)} · confidencial</p>
        <h1 class="display dossier__title">${esc(room.name)}</h1>
        <p class="dossier__tagline type">${esc(room.tagline)}</p>
      </div>
      <div class="dossier__grid">
        <div class="dossier__folder">
          <figure class="clipped">
            <span class="clip" aria-hidden="true"></span>
            ${photo(main.id, { alt: main.alt, widths: HERO_WIDTHS, sizes: HERO_SIZES, ratio: 0.66, eager: true })}
          </figure>
          <div class="polaroids">${more.map((p, i) => `<figure class="polaroid polaroid--${i + 1}">${photo(p.id, { alt: p.alt, widths: [280, 420], sizes: '(max-width: 600px) 44vw, 260px', ratio: 1 })}<figcaption class="type">${esc(p.alt)}</figcaption></figure>`).join('')}</div>
          <article class="sheet typed">
            <h2 class="display sheet__title">O caso</h2>
            ${room.story.map((p) => `<p>${esc(p)}</p>`).join('')}
            <span class="stamp sheet__stamp">${room.status === 'nova' ? 'Sala nova' : `Caso ${room.caseNo}`}</span>
          </article>
          <section class="evidence" aria-labelledby="ev-title">
            <h2 id="ev-title" class="display">O que vão encontrar</h2>
            <ul>${room.clues.map((c, i) => `<li><span class="evidence__no type">Prova ${String.fromCharCode(65 + i)}</span>${esc(c)}</li>`).join('')}</ul>
          </section>
          <section class="facts" aria-labelledby="facts-title">
            <h2 id="facts-title" class="display">Ficha técnica</h2>
            <dl class="typed">
              <div><dt>Equipa</dt><dd>${players(room)}</dd></div>
              <div><dt>Tempo</dt><dd>${room.duration} minutos</dd></div>
              <div><dt>Idade mínima</dt><dd>${room.minAge} anos${room.minAge < 12 ? ', com um adulto' : ''}</dd></div>
              <div><dt>Dificuldade</dt><dd>${locks(room.difficulty)} ${room.difficulty} em 5</dd></div>
              <div><dt>Saem a tempo</dt><dd>${room.escapeRate} em cada 100 equipas</dd></div>
              <div><dt>Acessibilidade</dt><dd>${room.accessible ? 'Rés-do-chão, sem degraus' : 'Tem escadas estreitas'}</dd></div>
            </dl>
          </section>
          <section class="room-prices" aria-labelledby="rp-title">
            <h2 id="rp-title" class="display">Quanto custa</h2>
            <table class="typed">
              <thead><tr><th scope="col">Equipa</th><th scope="col">Por pessoa</th><th scope="col">Total</th></tr></thead>
              <tbody>${prices.map(([n, pp]) => `<tr><th scope="row">${n} pessoas</th><td>${euros(pp)}</td><td>${euros(pp * n)}</td></tr>`).join('')}</tbody>
            </table>
            <p class="hint">Paga-se no fim, ao balcão. Pode usar um <a class="link" href="/vouchers">voucher</a>.</p>
          </section>
        </div>

        <aside class="agenda paper" aria-labelledby="agenda-title" data-agenda data-room="${room.slug}" data-min="${room.players.min}" data-max="${room.players.max}">
          <h2 id="agenda-title" class="display agenda__title">Agenda</h2>
          <p class="hint">Escolha o dia e a hora. Os números são as sessões livres.</p>
          <div class="agenda__days" role="group" aria-label="Dia">
            ${calendar
              .map(
                (d) =>
                  `<button type="button" class="day${d.closed ? ' day--closed' : ''}${!d.free && !d.closed ? ' day--full' : ''}" data-date="${d.date}"${d.closed || !d.free ? ' disabled' : ''} aria-pressed="false"><span>${shortDate(d.date).split(',')[0].slice(0, 3)}</span><b>${Number(d.date.slice(8))}</b><small>${d.closed ? 'fecha' : d.free ? `${d.free} livres` : 'cheio'}</small></button>`,
              )
              .join('')}
          </div>
          <p class="agenda__label" data-day-label></p>
          <div class="agenda__slots" data-slots aria-live="polite"><p class="hint">A carregar as horas…</p></div>
          <div class="agenda__players">
            <span class="label" id="players-label">Quantas pessoas</span>
            <div class="stepper" role="group" aria-labelledby="players-label"><button type="button" data-players="-1" aria-label="Menos uma pessoa">−</button><output data-players-out>${Math.max(room.players.min, Math.min(4, room.players.max))}</output><button type="button" data-players="1" aria-label="Mais uma pessoa">+</button></div>
          </div>
          <p class="agenda__price" data-price></p>
          <a class="btn btn--red agenda__go" href="/reservar?sala=${room.slug}" data-go>Reservar esta sessão</a>
          <p class="hint">Pode cancelar até ${VENUE.cancelHours} horas antes, sem custos.</p>
        </aside>
      </div>
    </div>
  </section>

  <section class="room-log section" aria-labelledby="rl-title">
    <div class="wrap room-log__grid">
      <div class="paper typed room-log__page">
        <h2 id="rl-title" class="display">Quem saiu em ${esc(log.monthName.split(' ')[0])}</h2>
        ${log.entries.length ? `<ol>${log.entries.slice(0, 6).map((e, i) => `<li><span>${i + 1}. ${esc(e.team)}</span><span>${e.players} pessoas · ${e.hints} pistas</span><b>${clock(e.seconds)}</b></li>`).join('')}</ol>` : '<p class="empty">Ninguém saiu desta sala este mês. Ainda.</p>'}
        <p class="hint">${log.escaped} de ${log.games} equipas saíram a tempo este mês. <a class="link" href="/registo">Ver o registo de todas as salas</a></p>
      </div>
      <div>
        <h2 class="display room-log__other">Outros casos</h2>
        <ul class="others">${others
          .map(
            (r) =>
              `<li style="--accent:${r.color}"><a href="/salas/${r.slug}">${photo(r.photos[0].id, { alt: '', widths: [160, 240], sizes: '120px', ratio: 0.75 })}<span><small class="type">Caso ${r.caseNo}</small><b class="display">${esc(r.name)}</b>${locks(r.difficulty)}</span></a></li>`,
          )
          .join('')}</ul>
      </div>
    </div>
  </section>`;
}
