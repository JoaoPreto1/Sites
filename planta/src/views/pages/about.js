import { BUDGETS, SITUATIONS, STUDIO } from '../../config/studio.js';
import { esc, northArrow, photo, stamp } from '../html.js';

const PATH = [
  ['DARQ', 'Mestrado em Arquitetura, Universidade de Coimbra', 'formação'],
  ['LX', 'Atelier de habitação em Lisboa', '3 anos'],
  ['BCN', 'Estágio num atelier em Barcelona', '1 ano'],
  [String(STUDIO.since), 'Abre o atelier em Matosinhos', 'até hoje'],
  ['2022', 'Abre um segundo escritório em Viseu', 'Beiras'],
];

const VALUES = [
  ['Primeiro o terreno', 'Antes de desenhar uma linha vamos ao sítio, a horas diferentes, para ver onde nasce o sol e de onde vem o vento.'],
  ['Desenho à mão', 'As primeiras plantas são feitas a lápis, em papel vegetal, em cima da mesa com o cliente. O computador vem depois.'],
  ['Uma pessoa do início ao fim', 'Quem desenha a casa é quem vai à obra. Não há passagem de testemunho a meio do projeto.'],
];

export function aboutBody() {
  return `<section class="sheet about" aria-labelledby="page-title">
  <div class="sheet__frame" aria-hidden="true"></div>
  <div class="wrap about__grid">
    <figure class="about__photo">${photo('casa-em-silvalde', { key: 'planta', alt: 'Planta da Casa em Silvalde em cima da mesa do atelier' }, { sizes: '(max-width: 900px) 92vw, 420px', eager: true, fit: 960 })}<figcaption>o desenho começa sempre à mão</figcaption></figure>
    <div>
      <p class="crumb"><a href="/">início</a> / <b>sobre</b></p>
      <h1 id="page-title" class="display">Leonor <em>Castelo</em></h1>
      <p class="about__lead">Arquiteta formada em Coimbra, com atelier próprio em Matosinhos desde ${STUDIO.since}. Desenha cada casa à mão antes de abrir o computador, e só depois de conhecer bem quem lá vai viver.</p>
      <ol class="path">
        ${PATH.map(([k, t, d]) => `<li><span>${esc(k)}</span><p>${esc(t)}</p><em>${esc(d)}</em></li>`).join('')}
      </ol>
      <div class="path__bar" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    </div>
  </div>
  ${stamp({ title: 'Sobre o atelier', code: 'LC-003', scale: '1:1', third: ['Desde', String(STUDIO.since)] })}
</section>

<section class="wrap values" aria-labelledby="values-title">
  <h2 id="values-title" class="display display--md">Três regras <em>da casa</em></h2>
  <ol>
    ${VALUES.map(([t, d], i) => `<li><span class="values__n">0${i + 1}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}
  </ol>
</section>`;
}

export function contactBody() {
  const [hq, branch] = STUDIO.offices;
  return `<section class="sheet page-head" aria-labelledby="page-title">
  <div class="sheet__frame" aria-hidden="true"></div>
  <div class="wrap">
    <p class="crumb"><a href="/">início</a> / <b>contactos</b></p>
    <div class="page-head__row">
      <h1 id="page-title" class="display">Comece pelo <em>terreno</em>.</h1>
      <p class="page-head__lead">Conte-nos o que tem e o que quer construir. Respondemos em dois dias úteis, e a primeira conversa não tem custos.</p>
    </div>
  </div>
</section>

<section class="wrap contact">
  <figure class="map" aria-labelledby="map-title">
    <span class="drawing__label" id="map-title">Dois escritórios · esquema sem escala</span>
    <svg viewBox="0 0 640 560" role="img" aria-label="Esquema com a sede em Matosinhos, junto ao mar, e o escritório de Viseu, a uma hora e vinte pela A25">
      <path class="map__sea" d="M90 40C110 140 70 240 100 340S90 480 120 540"/>
      <text class="map__label" x="40" y="300" transform="rotate(-80 40 300)">OCEANO ATLÂNTICO</text>
      <path class="map__river" d="M150 330C260 300 380 340 470 300S580 250 620 240"/>
      <text class="map__label map__label--river" x="520" y="300">rio Douro</text>
      <path class="map__route" d="M150 300L470 440"/>
      <text class="map__label map__label--route" x="250" y="330" transform="rotate(23 250 330)">≈ 1 h 20 min pela A25</text>
      <g transform="translate(150 300)"><circle class="map__halo" r="26"/><circle class="map__pin" r="9"/><text class="map__city" x="10" y="-60">${esc(hq.label)} · ${esc(hq.city)}</text><text class="map__street" x="10" y="-40">${esc(hq.street)}</text></g>
      <g transform="translate(470 440)"><circle class="map__halo" r="26"/><circle class="map__pin" r="9"/><text class="map__city" x="-200" y="60">${esc(branch.city)}</text><text class="map__street" x="-200" y="80">${esc(branch.street)}</text></g>
      <g transform="translate(590 70)">${northArrow('north north--svg')}</g>
    </svg>
  </figure>

  <form class="request" data-request novalidate>
    <h2 class="display display--sm">Pedir uma reunião</h2>
    <div class="field"><label for="f-name">O seu nome</label><input class="input" id="f-name" name="name" autocomplete="name" required maxlength="80"></div>
    <div class="field-row">
      <div class="field"><label for="f-email">Email</label><input class="input" id="f-email" name="email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="f-phone">Telefone <small>(opcional)</small></label><input class="input" id="f-phone" name="phone" type="tel" autocomplete="tel" maxlength="30"></div>
    </div>
    <fieldset class="field chips-field">
      <legend>O que tem</legend>
      <div class="chips">${SITUATIONS.map(([v, l], i) => `<label class="chip-radio"><input type="radio" name="situation" value="${v}"${i === 0 ? ' checked' : ''}><span>${esc(l)}</span></label>`).join('')}</div>
    </fieldset>
    <div class="field-row">
      <div class="field"><label for="f-place">Onde fica <small>(opcional)</small></label><input class="input" id="f-place" name="place" maxlength="80" placeholder="Concelho ou freguesia"></div>
      <div class="field"><label for="f-budget">Orçamento para a obra</label><select class="input" id="f-budget" name="budget">${BUDGETS.map(([v, l]) => `<option value="${v}"${v === 'nao-sei' ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
    </div>
    <div class="field"><label for="f-message">O que quer construir</label><textarea class="input" id="f-message" name="message" rows="5" maxlength="2000" required placeholder="Ex.: uma casa térrea com três quartos, perto do mar"></textarea></div>
    <button class="btn" type="submit">Enviar pedido</button>
    <p class="request__direct">Ou diretamente: <a href="mailto:${STUDIO.email}">${esc(STUDIO.email)}</a> · <a href="tel:${STUDIO.phone.replace(/\s/g, '')}">${esc(STUDIO.phone)}</a></p>
    <div class="receipt" data-receipt hidden tabindex="-1">
      <p class="receipt__stamp">recebido</p>
      <h3 class="display display--sm">Obrigada, <span data-receipt-name></span>.</h3>
      <p>O seu pedido ficou registado com o número <b data-receipt-number></b>. Respondemos em dois dias úteis para marcar a primeira conversa.</p>
      <button class="link" type="button" data-receipt-again>Enviar outro pedido</button>
    </div>
  </form>
</section>

<section class="wrap offices offices--plain" aria-label="Moradas">
  ${STUDIO.offices.map((o) => `<div><p class="kicker">${esc(o.label)}</p><h2 class="display display--sm">${esc(o.city)}</h2><p>${esc(o.street)}<br>${esc(o.postalCode)} ${esc(o.city)}</p><p class="muted">${esc(o.hours)}</p></div>`).join('')}
</section>`;
}
