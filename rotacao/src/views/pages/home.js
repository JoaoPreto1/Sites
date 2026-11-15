import { hour, price } from '../../../public/js/shared/format.js';
import { icons } from '../../../public/js/shared/icons.js';
import { disc } from '../layout.js';
import { escapeHtml, gradeLegend, recordCard } from '../components.js';

// Desenho parado do caixote e do gira-discos, enquanto o 3D não chega (ou se não houver WebGL)
const poster = (records) => `
  <div class="poster" data-poster>
    <div class="poster__crate">
      ${records
        .slice(0, 5)
        .map((r, i) => `<span class="poster__sleeve" style="--i:${i};--c:${r.color}"></span>`)
        .join('')}
      <span class="poster__front"></span>
    </div>
    <div class="poster__deck"><span class="poster__platter">${disc('poster__vinyl')}</span><span class="poster__arm"></span></div>
    <button class="btn poster__start" type="button" data-deck-start>${icons.play} Abrir o caixote</button>
  </div>`;

const nowPanel = () => `
  <aside class="now" data-now aria-live="polite">
    <div class="now__head">
      <span class="now__state" data-now-state><i></i> No caixote</span>
      <span class="now__pos mono" data-now-pos></span>
    </div>
    <div class="now__empty" data-now-empty>
      <h2>Ainda nada no prato.</h2>
      <ol>
        <li><b>Folheia</b> com as setas, arrastando o caixote ou pelos separadores.</li>
        <li><b>Clica na capa levantada</b> e o disco vai para o prato.</li>
        <li><b>Ouve</b> 30 segundos de cada faixa. Se gostares, vai para o saco.</li>
      </ol>
    </div>
    <div class="now__record" data-now-record hidden>
      <div class="now__top">
        <img class="now__cover" data-now-cover alt="" width="120" height="120">
        <div>
          <p class="now__artist" data-now-artist></p>
          <h2 class="now__title" data-now-title></h2>
          <p class="now__meta mono" data-now-meta></p>
        </div>
      </div>
      <div class="now__chips" data-now-chips></div>
      <div class="now__player" data-now-player hidden>
        <p class="now__track" data-now-track></p>
        <div class="now__bar" data-now-bar role="slider" tabindex="0" aria-label="Posição na faixa" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i data-now-fill></i></div>
        <div class="now__times mono"><span data-now-time>0:00</span><span data-now-kind>pré-escuta</span><span data-now-dur>0:30</span></div>
        <div class="now__controls">
          <button type="button" data-now-prev aria-label="Faixa anterior">${icons.prev}</button>
          <button class="now__toggle" type="button" data-now-toggle aria-label="Tocar">${icons.play}${icons.pause}</button>
          <button type="button" data-now-next aria-label="Faixa seguinte">${icons.next}</button>
          <canvas class="now__vu" data-now-vu width="160" height="40" aria-hidden="true"></canvas>
          <label class="now__volume"><span class="sr-only">Volume</span>${icons.volume}<input type="range" min="0" max="1" step="0.05" data-now-volume></label>
        </div>
      </div>
      <ol class="now__tracks" data-now-tracks></ol>
      <div class="now__actions">
        <button class="btn" type="button" data-now-play>${icons.play} Pôr a tocar</button>
        <button class="btn btn--line" type="button" data-now-add>${icons.bag} <span data-now-price></span></button>
      </div>
      <a class="link now__link" data-now-link href="/discos">Ver o disco</a>
    </div>
  </aside>`;

export function homePage({ records, crates, grades, arrivals, rooms, wants }) {
  const dividers = crates
    .map((c) => `<button type="button" data-crate="${c.slug}" aria-pressed="false">${escapeHtml(c.name)}</button>`)
    .join('');

  const channel = (room) => `
    <div class="mini-ch">
      <span class="tape">${room.name}</span>
      <div class="mini-ch__leds">${room.slots.map((s) => `<i class="is-${s.state}" title="${hour(s.hour)}"></i>`).join('')}</div>
      <span class="mono">${price(room.price)}/h</span>
    </div>`;

  return `
  <section class="stage" aria-labelledby="stage-title">
    <div class="stage__intro wrap">
      <p class="kicker reveal is-in">Loja de discos usados e novos · Rua dos Anjos 58, Lisboa</p>
      <div class="stage__head">
        <h1 class="display stage__title" id="stage-title"><span>Vem</span> <em>escavar.</em></h1>
        <p class="stage__lead">Folheia o caixote, clica num disco e ele sai da capa para o prato. Ouves trinta segundos de cada faixa antes de o levares para casa.</p>
      </div>
    </div>
    <div class="stage__body wrap">
      <div class="stage__deck">
        <div class="deck" data-deck tabindex="0" aria-label="Gira-discos: setas para folhear, Enter para tocar o disco levantado, espaço para pausar">
          ${poster(records)}
          <div class="deck__tip" data-tip hidden></div>
          <p class="deck__busy mono" data-busy hidden>${disc('is-spinning')} A pousar o disco…</p>
        </div>
        <div class="stage__controls">
          <div class="dividers" role="group" aria-label="Separadores do caixote">${dividers}</div>
          <div class="stage__flip">
            <button type="button" data-flip="-1" aria-label="Disco anterior">${icons.left}</button>
            <span class="mono" data-flip-pos>1 / ${records.length}</span>
            <button type="button" data-flip="1" aria-label="Disco seguinte">${icons.right}</button>
          </div>
        </div>
      </div>
      ${nowPanel()}
    </div>
  </section>

  <section class="arrivals wrap" aria-labelledby="arrivals-title">
    <header class="section-head reveal">
      <div>
        <p class="kicker">Novas entradas</p>
        <h2 class="display" id="arrivals-title">Chegaram<br>esta semana.</h2>
      </div>
      ${gradeLegend(grades)}
    </header>
    <div class="records-grid">${arrivals.map((r, i) => recordCard(r, { index: i })).join('')}</div>
    <p class="arrivals__more reveal"><a class="btn btn--line" href="/discos">Ir a todos os caixotes ${icons.right}</a></p>
  </section>

  <section class="rooms-teaser" aria-labelledby="rooms-title">
    <div class="wrap rooms-teaser__grid">
      <div class="reveal">
        <p class="kicker">Salas de ensaio · no piso de baixo</p>
        <h2 class="display" id="rooms-title">Ensaia<br><em>alto.</em></h2>
        <p>Três salas insonorizadas, com backline e café da loja. Escolhes a sala, acendes as horas que queres e está marcado. Cancelas sem custo até 24 horas antes.</p>
        <a class="btn" href="/salas">Marcar uma sala</a>
      </div>
      <div class="mini-desk reveal" style="--d:.1s" aria-label="Ocupação das salas hoje">
        <p class="mono mini-desk__head"><span>Hoje</span><span><i class="is-livre"></i> livre <i class="is-ocupada"></i> ocupada</span></p>
        <div class="mini-desk__channels">${rooms.map(channel).join('')}</div>
      </div>
    </div>
  </section>

  <section class="wall-teaser wrap" aria-labelledby="wall-title">
    <div class="reveal">
      <p class="kicker">Lista de procura</p>
      <h2 class="display" id="wall-title">Procura-se.</h2>
      <p>Há discos que não aparecem por mais que se escave. Deixa o teu na parede: quando entrar, guardamo-lo 48 horas com o teu nome.</p>
      <a class="btn btn--yellow" href="/procura">Ver a parede</a>
    </div>
    <div class="cork reveal" style="--d:.1s">
      ${wants
        .map(
          (w, i) => `
        <div class="card-note${w.status === 'encontrado' ? ' card-note--found' : ''}" style="--r:${[-3, 2.5, -1.5, 3][i % 4]}deg">
          <span class="card-note__head">${w.status === 'encontrado' ? 'Encontrado ✓' : 'Procura-se'}</span>
          <p>${escapeHtml(w.artist)} — ${escapeHtml(w.title)}</p>
          <small>— ${escapeHtml(w.name)}${w.maxPrice ? ` · até ${w.maxPrice} €` : ''}</small>
        </div>`,
        )
        .join('')}
    </div>
  </section>

  <section class="sell-band" aria-labelledby="sell-title">
    <div class="wrap sell-band__grid">
      <div class="reveal">
        <p class="kicker">Compramos discos</p>
        <h2 class="display" id="sell-title">Tens uma caixa<br>no sótão?</h2>
        <p>Vamos a casa ou trazes à loja. Ouvimos, classificamos à tua frente e pagamos na hora — ou em crédito para a loja, com mais 20%.</p>
        <a class="btn btn--ink" href="/compramos">Marcar avaliação ${icons.right}</a>
      </div>
      <div class="sell-band__stack" aria-hidden="true">
        ${disc('sell-band__disc sell-band__disc--1')}${disc('sell-band__disc sell-band__disc--2')}${disc('sell-band__disc sell-band__disc--3')}
      </div>
    </div>
  </section>`;
}
