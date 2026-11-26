import { SITE } from '../../config/site.js';
import { esc, pageHero, photo } from '../html.js';

// A casa: os espaços comuns
const SPACES = [
  { photo: 'piscina', name: 'A piscina', when: 'Aberta das 9h às 20h', text: 'Água salgada, entre palmeiras, abrigada do vento norte por um muro de pedra. Toalhas e espreguiçadeiras não se reservam: chegam para todos.' },
  { photo: 'terraco2', name: 'O terraço coberto', when: 'Café de saco até ao meio-dia', text: 'Sofás, mantas e uma vista que vai da baía da Baleeira ao cabo. Ao fim da tarde serve-se o vinho da casa e há petiscos da cozinha.' },
  { photo: 'sala', name: 'A sala', when: 'Sempre aberta', text: 'Livros deixados pelos hóspedes, jogos de tabuleiro e um sítio sossegado para os dias de vento, que em Sagres não faltam.' },
  { photo: 'massagem', name: 'Massagens', when: 'Por marcação, até à véspera', text: 'Duas terapeutas da vila vêm ao hotel. Uma hora custa 70 euros e pede-se na área da reserva.' },
];

export function houseBody() {
  return `${pageHero({ photo: 'arcosbrancos', crumbs: [['A casa']], title: 'Uma casa de <em>pescadores.</em>', aside: '<b>14 quartos</b>Piscina, terraço, sala e restaurante' })}
<section class="sec abre-pg">
  <div class="grid"><p class="e c abre__e">A casa</p><p class="d abre__p rv">Paredes de meio metro, chão de tijoleira e janelas pequenas do lado do vento. A casa foi feita para aguentar o inverno de Sagres e por isso é fresca no verão e calma o ano inteiro.</p></div>
  <div class="grid abre-pg__t"><p class="c rv">Há sempre alguém na receção, de dia e de noite. Bicicletas, pranchas e lancheiras para a praia estão incluídas: peça-as na véspera e ficam prontas à porta às nove.</p><p class="c rv">Não há televisões nos quartos nem música nos espaços comuns. Há rede em toda a casa, para quem precisar.</p></div>
</section>
${SPACES.map((s, i) => `<section class="grid espaco${i % 2 ? ' espaco--inv' : ''}" aria-labelledby="h-esp-${i}">
  <div class="espaco__im foto-r rv-f">${photo(s.photo, { sizes: '(max-width: 760px) 100vw, 58vw' })}</div>
  <div class="espaco__tx rv"><p class="q__n"><span>0${i + 1}</span><span>${esc(s.when)}</span></p><h2 id="h-esp-${i}">${esc(s.name)}</h2><p class="c">${esc(s.text)}</p></div>
</section>`).join('')}
<section class="sec sec--noite incluido" aria-labelledby="h-inc">
  <div class="grid titulo"><h2 id="h-inc" class="rv">Já está <em>no preço.</em></h2><p class="rv">Paga-se o quarto à saída. Isto não se paga à parte.</p></div>
  <ul class="grid incluido__l">
    <li class="rv"><b>Pequeno-almoço</b><span>Das 8h às 11h, na sala ou no quarto das suites</span></li>
    <li class="rv"><b>Bicicletas</b><span>Pedidas na véspera, prontas às 9h</span></li>
    <li class="rv"><b>Pranchas e lancheiras</b><span>Para a praia do Tonel ou da Mareta</span></li>
    <li class="rv"><b>Estacionamento</b><span>No pátio, sem marcação</span></li>
  </ul>
</section>`;
}

const PLACES_FULL = [
  { photo: 'praia', name: 'Praia do Tonel', when: '8 min a pé', text: 'A praia dos surfistas: ondas quase todo o ano, areia grossa e pouco vento ao fim do dia. A escola da praia empresta fatos.' },
  { photo: 'falesia', name: 'Fortaleza de Sagres', when: '12 min a pé', text: 'Vai-se pelo caminho da falésia. Chegue cedo, antes dos autocarros, e leve água: no promontório não há sombra.' },
  { photo: 'pordosol', name: 'Cabo de São Vicente', when: '20 min de bicicleta', text: 'O farol e o pôr do sol mais concorrido do Algarve. Leve um casaco, mesmo em agosto, e volte de luz acesa.' },
  { photo: 'veleiro', name: 'Barco à costa', when: 'Porto da Baleeira', text: 'Saídas de duas horas com pescadores da vila, para ver golfinhos e as grutas. Marcam-se na área da reserva.' },
  { photo: 'baia', name: 'Praia da Mareta', when: '10 min a pé', text: 'Abrigada, de água calma, boa para quem vem com crianças. No inverno é a praia com mais sol da vila.' },
  { photo: 'costa', name: 'Costa Vicentina', when: '30 min de carro', text: 'Para norte, praias sem nome no fim de estradas de terra. Peça o mapa desenhado à mão que está na receção.' },
];

export function sagresBody() {
  return `${pageHero({ photo: 'pordosol', crumbs: [['Sagres']], title: 'Sai pela porta e<br><em>vira à esquerda.</em>', aside: '<b>A pé ou de bicicleta</b>As bicicletas estão no pátio' })}
<section class="sec sg-pg">
  <div class="grid titulo"><h2 class="rv">Sagres à volta</h2><p class="rv">O hotel fica no fim da estrada. Quase tudo se faz a pé ou de bicicleta. Os tempos contam a partir da porta da receção.</p></div>
  <div class="grid sg-pg__g">${PLACES_FULL.map(
    (p, i) => `<article class="lugar rv${i % 3 === 1 ? ' lugar--baixo' : ''}"><div class="foto-r rv-f lugar__im">${photo(p.photo, { sizes: '(max-width: 760px) 100vw, 30vw' })}</div><p class="q__n"><span>0${i + 1}</span><span>${esc(p.when)}</span></p><h3>${esc(p.name)}</h3><p class="c">${esc(p.text)}</p></article>`,
  ).join('')}</div>
</section>`;
}

export function arrivalBody() {
  return `${pageHero({ photo: 'falesia', crumbs: [['Como chegar']], title: 'No fim da estrada,<br><em>antes do mar.</em>', aside: '<b>Sagres</b>Vila do Bispo, Algarve' })}
<section class="sec">
  <div class="grid chegar-pg">
    <div class="chegar-pg__tx">
      <p class="d abre__p rv">Em Sagres, siga as placas para a Baleeira e continue até a estrada acabar. A casa branca de janelas verdes é a última antes da falésia.</p>
      <dl class="specs rv">
        <div><dt>De Faro</dt><dd>1h20 de carro</dd></div><div><dt>De Lisboa</dt><dd>3h de carro</dd></div>
        <div><dt>Autocarro</dt><dd>Lagos — Sagres, 50 min</dd></div><div><dt>Estacionamento</dt><dd>No pátio, sem custo</dd></div>
        <div><dt>Entrada</dt><dd>${SITE.checkIn.slice(0, 2)}h às ${SITE.checkInUntil.slice(0, 2)}h</dd></div><div><dt>Saída</dt><dd>Até às ${SITE.checkOut.slice(0, 2)}h</dd></div>
      </dl>
      <p class="c rv chegar-pg__n">Chega depois das 23h? Diga-nos a hora na área da reserva: a chave fica num envelope com o seu nome e há sempre alguém de noite.</p>
      <p class="rv"><a class="lk" href="mailto:${SITE.email}">${SITE.email}</a></p>
    </div>
    <div class="mapa rv" role="img" aria-label="Mapa simplificado: a estrada vem de Vila do Bispo e acaba no hotel, entre a fortaleza e a baía da Baleeira">
      <svg viewBox="0 0 600 720" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="600" height="720" fill="#c9d2cc"/>
        <path d="M0 0H600V210C560 230 540 290 500 300 450 315 430 280 380 300 340 318 330 380 280 390 230 400 200 370 160 380 120 392 110 450 60 460 30 466 10 450 0 452Z" fill="#ebe5da"/>
        <path d="M280 390C300 420 330 450 320 500 312 540 280 560 270 600 262 640 290 720 290 720H120C120 720 150 650 140 610 130 570 160 520 160 380Z" fill="#ebe5da"/>
        <path d="M40 40C120 110 200 180 260 270 290 315 300 350 280 390" stroke="#1b1b19" stroke-width="1.5" fill="none"/>
        <circle cx="282" cy="388" r="7" fill="#1b1b19"/>
        <text x="300" y="384" font-family="Instrument Serif,Georgia,serif" font-size="30" fill="#1b1b19">Arriba</text>
        <text x="180" y="640" font-family="Inter,Arial" font-size="12" fill="#67625a" letter-spacing="3">FORTALEZA</text>
        <text x="400" y="372" font-family="Inter,Arial" font-size="12" fill="#3b4a45" letter-spacing="3">BALEEIRA</text>
        <text x="30" y="560" font-family="Inter,Arial" font-size="12" fill="#3b4a45" letter-spacing="3">OCEANO</text>
        <text x="60" y="80" font-family="Inter,Arial" font-size="12" fill="#67625a" letter-spacing="3">VILA DO BISPO</text>
      </svg>
    </div>
  </div>
</section>`;
}
