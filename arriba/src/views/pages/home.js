import { PLACES, ROOM_TYPES, SITE } from '../../config/site.js';
import { dayLong, dayShort, nights, today, addDays } from '../../utils/dates.js';
import { esc, euros, keyTags, photo } from '../html.js';
import { menuList } from './restaurante.js';

const reserveHref = (num, a) => `/reservar?quarto=${num}&chegada=${a.checkIn}&saida=${a.checkOut}&hospedes=${a.guests}`;

// A ficha da chave escolhida (a mesma que o JavaScript atualiza quando se tira outra chave)
export function keyCard(a, num) {
  const room = a.rooms.find((r) => r.num === num);
  if (!room) {
    return `<article class="ficha ficha--vazia" data-ficha><div class="ficha__t"><p class="ficha__n">Quadro vazio</p><h2 class="ficha__h">Não há chaves para estas datas</h2><p>Experimente chegar um dia antes ou depois, ou escreva para <a href="mailto:${SITE.email}">${SITE.email}</a>.</p></div></article>`;
  }
  const type = ROOM_TYPES.find((t) => t.slug === room.type);
  return `<article class="ficha" data-ficha aria-live="polite">
    ${photo(type.photos[0], { sizes: '(max-width: 820px) 120px, 160px', cls: 'ficha__f' })}
    <div class="ficha__t">
      <p class="ficha__n">Chave ${room.num}</p>
      <h2 class="ficha__h">${esc(type.name)}</h2>
      <p>${esc(type.lead)}</p>
      <div class="ficha__pr"><p><b>${euros(room.total)}</b> <small>${nights(a.nights)}</small></p><a class="btn btn--verde" href="${reserveHref(room.num, a)}">Reservar o ${room.num}</a></div>
    </div>
  </article>`;
}

export function pickDefault(a) {
  return a.free.find((n) => n === '03') ?? a.free[0] ?? null;
}

const field = (name, label, value, attrs = '') => `<label class="datas__c"><span>${label}</span><input type="date" name="${name}" value="${value}" ${attrs} required></label>`;

export function homeBody({ a, menu }) {
  const chosen = pickDefault(a);
  const t = today();
  return `<section class="heroi" aria-labelledby="h-heroi">
  <div class="heroi__esq">
    <p class="rot rot--claro">Receção · ${SITE.tagline.toLowerCase()}</p>
    <h1 id="h-heroi">Tire uma chave <em>do quadro.</em></h1>
    <p class="heroi__lead">Cada chave pendurada é um quarto livre nas suas datas. Os ganchos vazios são quartos que já têm hóspedes.</p>
    <form class="datas" action="/" method="get" data-datas>
      ${field('chegada', 'Chegada', a.checkIn, `min="${t}" max="${addDays(t, 365)}"`)}
      ${field('saida', 'Saída', a.checkOut, `min="${addDays(t, 1)}"`)}
      <label class="datas__c"><span>Hóspedes</span><select name="hospedes">${[1, 2, 3].map((n) => `<option value="${n}"${n === a.guests ? ' selected' : ''}>${n} ${n === 1 ? 'adulto' : 'adultos'}</option>`).join('')}</select></label>
      <button class="btn datas__ver" type="submit">Ver chaves</button>
      <p class="datas__erro" data-erro role="alert" hidden></p>
    </form>
    <p class="conta" data-conta><i aria-hidden="true"></i><span><b>${a.free.length}</b> ${a.free.length === 1 ? 'chave' : 'chaves'} no quadro de ${dayShort(a.checkIn)} a ${dayShort(a.checkOut)} (${nights(a.nights)})</span></p>
    ${keyCard(a, chosen)}
  </div>
  <div class="palco" data-palco>
    <picture class="palco__poster" data-poster>
      <source media="(max-width: 820px)" srcset="/img/quadro-telemovel.webp" width="780" height="900">
      <img src="/img/quadro.webp" width="1200" height="1000" alt="" fetchpriority="high" decoding="async">
    </picture>
    <canvas class="palco__3d" data-canvas aria-hidden="true"></canvas>
    <button class="palco__ligar btn" type="button" data-ligar hidden>Ligar o quadro 3D</button>
    <div class="palco__chaves">
      <p class="palco__dica" id="dica-chaves">Escolha uma chave do quadro:</p>
      <ul class="ganchos" data-ganchos aria-describedby="dica-chaves">${a.rooms
        .map((r) =>
          r.free
            ? `<li><button type="button" class="gancho" data-num="${r.num}" aria-pressed="${r.num === chosen}"><b>${r.num}</b><span class="sr"> ${esc(r.typeName)}, ${euros(r.total)}</span></button></li>`
            : `<li><span class="gancho gancho--fora"><b>${r.num}</b><span class="sr"> ocupado</span></span></li>`,
        )
        .join('')}</ul>
    </div>
  </div>
</section>

<section class="sec" id="quartos" aria-labelledby="h-quartos"><div class="cx">
  <div class="cab"><div><p class="rot">Os quartos</p><h2 id="h-quartos">Catorze portas, quatro maneiras de acordar.</h2></div><p>Todas as camas têm lençóis de linho e todas as janelas abrem. Muda a vista, o tamanho e o que fica do lado de fora. As chaves riscadas já estão com hóspedes de ${dayShort(a.checkIn)} a ${dayShort(a.checkOut)}.</p></div>
  ${ROOM_TYPES.slice(0, 2)
    .map((type, i) => {
      const at = a.types.find((x) => x.slug === type.slug);
      return `<article class="tipo${i % 2 ? ' tipo--inv' : ''}">
    <div class="tipo__fot">${photo(type.photos[0], { sizes: '(max-width: 820px) 100vw, 56vw' })}${photo(type.photos[1], { sizes: '(max-width: 820px) 46vw, 24vw', cls: 'tipo__mini' })}</div>
    <div>
      ${keyTags(type.rooms, at.free)}
      <h3>${esc(type.name)}</h3>
      <p>${esc(type.lead)} ${esc(type.text.split('. ')[0])}.</p>
      <dl class="fichas"><div><dt>Tamanho</dt><dd>${type.size} m²</dd></div><div><dt>Cama</dt><dd>${esc(type.bed)}</dd></div><div><dt>Vista</dt><dd>${esc(type.view)}</dd></div><div><dt>Exterior</dt><dd>${esc(type.outside)}</dd></div></dl>
      <div class="tipo__rod"><p><b>${euros(at.price)}</b> <small>por noite</small></p><a class="lnk" href="/quartos/${type.slug}">Ver o quarto ${esc(type.name)}</a></div>
    </div>
  </article>`;
    })
    .join('')}
  <div class="pares">${ROOM_TYPES.slice(2)
    .map((type) => {
      const at = a.types.find((x) => x.slug === type.slug);
      return `<article class="par"><div class="par__fot">${photo(type.photos[0], { sizes: '(max-width: 820px) 100vw, 44vw' })}</div>${keyTags(type.rooms, at.free)}<h3>${esc(type.name)}</h3><p>${esc(type.lead)} ${esc(type.text.split('. ')[0])}.</p><div class="tipo__rod"><p><b>${euros(at.price)}</b> <small>por noite</small></p><a class="lnk" href="/quartos/${type.slug}">Ver o quarto ${esc(type.name)}</a></div></article>`;
    })
    .join('')}</div>
</div></section>

<section class="casa" id="casa" aria-labelledby="h-casa">
  <div class="casa__grande">${photo('piscina', { sizes: '100vw' })}<div class="casa__leg"><p class="rot">A casa</p><h2 id="h-casa">Uma casa de pescadores a vinte metros da beira.</h2><p>Paredes de meio metro, chão de tijoleira e uma piscina de água salgada entre palmeiras. Há sempre alguém na receção, de dia e de noite.</p></div></div>
  <div class="cx tres">
    <div>${photo('terraco2', { sizes: '(max-width: 820px) 100vw, 30vw' })}<h3>O terraço</h3><p>Sofás, mantas e café de saco até ao meio-dia. Ao fim da tarde serve-se o vinho da casa.</p></div>
    <div>${photo('sala', { sizes: '(max-width: 820px) 100vw, 30vw' })}<h3>A sala</h3><p>Livros deixados pelos hóspedes, jogos de tabuleiro e um sítio sossegado para os dias de vento.</p></div>
    <div>${photo('massagem', { sizes: '(max-width: 820px) 100vw, 30vw' })}<h3>Massagens</h3><p>Duas terapeutas da vila vêm ao hotel por marcação. Peça na área da reserva até à véspera.</p></div>
  </div>
</section>

<section class="mesa" id="mesa" aria-labelledby="h-mesa"><div class="cx mesa__g">
  <div>
    <p class="rot rot--claro">Restaurante</p>
    <h2 id="h-mesa">Ao jantar, o que o barco trouxe.</h2>
    <p class="mesa__intro">Doze mesas, abertas também a quem não dorme cá. A ementa muda todos os dias conforme a lota de Sagres.</p>
    ${menuList(menu)}
    <p><a class="lnk lnk--claro" href="/restaurante">Horários e reservas de mesa</a></p>
  </div>
  <div class="mesa__fotos">${photo('mesa', { sizes: '(max-width: 820px) 50vw, 24vw', cls: 'mesa__a' })}${photo('prato', { sizes: '(max-width: 820px) 50vw, 24vw' })}${photo('cocktail', { sizes: '(max-width: 820px) 50vw, 24vw' })}</div>
</div></section>

<section class="sec" id="sagres" aria-labelledby="h-sagres"><div class="cx">
  <div class="cab"><div><p class="rot">Sagres à volta</p><h2 id="h-sagres">Sai pela porta e vira à esquerda.</h2></div><p>O hotel fica no fim da estrada. Daqui faz-se quase tudo a pé ou de bicicleta, e as bicicletas estão no pátio.</p></div>
  <div class="passeios">${PLACES.map((p) => `<article class="passeio"><div class="passeio__f">${photo(p.photo, { sizes: '(max-width: 820px) 50vw, 24vw' })}<span>${esc(p.when)}</span></div><h3>${esc(p.name)}</h3><p>${esc(p.text)}</p></article>`).join('')}</div>
  <div class="pedir"><p><strong>Bicicletas, pranchas e lancheiras para a praia</strong> estão incluídas. Peça-as na área da sua reserva na véspera e ficam prontas à porta às 9h.</p><a class="btn btn--linha" href="/entrar">Entrar na minha reserva</a></div>
</div></section>

<section class="chegar" id="chegar" aria-labelledby="h-chegar"><div class="cx chegar__g">
  <div>
    <p class="rot">Como chegar</p>
    <h2 id="h-chegar">No fim da estrada, antes do mar.</h2>
    <dl class="fichas fichas--grandes">
      <div><dt>Entrada</dt><dd>${SITE.checkIn.replace(':00', 'h')} às ${SITE.checkInUntil.replace(':00', 'h')}</dd></div><div><dt>Saída</dt><dd>Até às ${SITE.checkOut.replace(':00', 'h')}</dd></div>
      <div><dt>De Faro</dt><dd>1h20 de carro</dd></div><div><dt>De Lisboa</dt><dd>3h de carro</dd></div>
      <div><dt>Estacionamento</dt><dd>No pátio, sem custo</dd></div><div><dt>Cães</dt><dd>Nos quartos Pátio</dd></div>
    </dl>
    <p class="chegar__acoes"><a class="btn" href="/reservar">Reservar</a><a class="btn btn--linha" href="mailto:${SITE.email}">${SITE.email}</a></p>
  </div>
  <div class="mapa" role="img" aria-label="Mapa simplificado: o hotel fica no fim da estrada que vem de Vila do Bispo, entre a fortaleza e a baía da Baleeira">
    <svg viewBox="0 0 600 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="600" height="520" fill="#a9c4c4"/>
      <path d="M0 0H600V150C560 170 540 220 500 230 450 245 430 210 380 230 340 248 330 300 280 310 230 320 200 290 160 300 120 312 110 360 60 370 30 376 10 360 0 362Z" fill="#e2d8c4"/>
      <path d="M280 310C300 340 330 360 320 400 312 430 280 440 270 470 262 495 290 520 290 520H120C120 520 150 470 140 440 130 410 160 380 160 300Z" fill="#e2d8c4"/>
      <path d="M40 40C120 90 200 140 260 210 290 245 300 280 280 310" stroke="#b8925a" stroke-width="5" fill="none"/>
      <path d="M40 40C120 90 200 140 260 210" stroke="#fff" stroke-width="1.5" stroke-dasharray="6 6" fill="none"/>
      <circle cx="282" cy="306" r="11" fill="#13241f"/><circle cx="282" cy="306" r="4" fill="#d9b77d"/>
      <text x="300" y="300" font-family="Newsreader,Georgia,serif" font-size="24" fill="#13241f">Arriba</text>
      <text x="196" y="470" font-family="Manrope,Arial" font-size="13" fill="#4f483f" letter-spacing="2">FORTALEZA</text>
      <text x="400" y="290" font-family="Manrope,Arial" font-size="13" fill="#2f4747" letter-spacing="2">BAÍA DA BALEEIRA</text>
      <text x="40" y="440" font-family="Manrope,Arial" font-size="13" fill="#2f4747" letter-spacing="2">OCEANO</text>
      <text x="60" y="80" font-family="Manrope,Arial" font-size="13" fill="#4f483f" letter-spacing="2">VINDO DE VILA DO BISPO</text>
    </svg>
  </div>
</div></section>

<section class="fim" aria-labelledby="h-fim"><div class="cx">
  <p class="rot rot--claro">Reservas</p>
  <h2 id="h-fim">As chaves ficam no quadro até alguém as levar.</h2>
  <p>Sem pagamento até ${SITE.freeCancelDays} dias antes da chegada. Até lá, cancela-se na área da reserva com um clique.</p>
  <a class="btn" href="/reservar">Ver quartos livres</a>
</div></section>`;
}

export const homeDescription = (a) => `Hotel de 14 quartos em Sagres, à beira da falésia. As chaves no quadro são os quartos livres: ${a.free.length} para ${dayLong(a.checkIn)}. Restaurante com o peixe da lota e piscina de água salgada.`;
