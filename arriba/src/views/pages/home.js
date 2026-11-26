import { PLACES, ROOM_TYPES, SITE } from '../../config/site.js';
import { addDays, dayLong, today } from '../../utils/dates.js';
import { esc, euros, photo } from '../html.js';
import { menuList } from './restaurante.js';

const longDay = (iso) => dayLong(iso).replace(/^./, (c) => c.toUpperCase());

// A barra das datas: o mesmo formulário serve o início e a página de cada quarto
export function datesBar(a, { action = '/reservar', extra = '', dark = true } = {}) {
  const t = today();
  return `<form class="barra${dark ? '' : ' barra--clara'}" action="${action}" method="get" data-barra>
    ${extra}
    <label class="barra__c"><span>Chegada</span><input type="date" name="chegada" value="${a.checkIn}" min="${t}" max="${addDays(t, 365)}" required></label>
    <label class="barra__c"><span>Saída</span><input type="date" name="saida" value="${a.checkOut}" min="${addDays(t, 1)}" required></label>
    <label class="barra__c barra__c--h"><span>Hóspedes</span><select name="hospedes">${[1, 2, 3].map((n) => `<option value="${n}"${n === a.guests ? ' selected' : ''}>${n} ${n === 1 ? 'adulto' : 'adultos'}</option>`).join('')}</select></label>
    <button class="barra__ir" type="submit"><span>Ver quartos livres</span><em data-livres>${a.free.length} de 14</em></button>
  </form>`;
}

export function homeBody({ a, menu, table }) {
  const [farol, falesia, patio, duna] = ROOM_TYPES;
  const big = (t, inv) => {
    const at = a.types.find((x) => x.slug === t.slug);
    return `<article class="grid q${inv ? ' q--inv' : ''}">
    <a class="q__im foto-r rv-f" href="/quartos/${t.slug}" tabindex="-1" aria-hidden="true">${photo(t.photos[0], { sizes: '(max-width: 760px) 100vw, 58vw' })}</a>
    <div class="q__tx rv">
      <p class="q__n"><span>Chaves ${t.rooms.join(', ').replace(/, (?=[^,]*$)/, ' e ')}</span><span>${at.free.length ? `${at.free.length} no quadro` : 'sem chaves'} de ${a.checkIn.slice(8)} a ${a.checkOut.slice(8)}</span></p>
      <h3><a href="/quartos/${t.slug}">${esc(t.name)}</a></h3>
      <p>${esc(t.lead)} ${esc(t.text.split('. ')[0])}.</p>
      <dl class="q__dl"><dt>Área</dt><dd>${t.size} m²</dd><dt>Cama</dt><dd>${esc(t.bed)}</dd><dt>Exterior</dt><dd>${esc(t.outside)}</dd></dl>
      <div class="q__pr"><span>${euros(table[t.slug])}</span><a class="lk" href="/quartos/${t.slug}">Ver o quarto</a></div>
    </div>
  </article>`;
  };
  const small = (t) => `<article class="duo__q rv">
      <a class="duo__im foto-r rv-f" href="/quartos/${t.slug}" tabindex="-1" aria-hidden="true">${photo(t.photos[0], { sizes: '(max-width: 760px) 100vw, 40vw' })}</a>
      <p class="q__n"><span>Chaves ${t.rooms.join(', ').replace(/, (?=[^,]*$)/, ' e ')}</span><span>${euros(table[t.slug])}</span></p>
      <h3><a href="/quartos/${t.slug}">${esc(t.name)}</a></h3>
      <p>${esc(t.lead)}</p>
    </article>`;

  return `<section class="heroi" data-heroi>
  ${photo('costa', { sizes: '100vw', eager: true, cls: 'heroi__f' })}
  <div class="heroi__tx"><h1>Catorze quartos<br>sobre o <em>Atlântico.</em></h1><p>Uma casa de pescadores no fim da estrada de Sagres, recuperada para receber poucas pessoas de cada vez.</p></div>
  ${datesBar(a)}
</section>

<section class="abre">
  <div class="grid"><p class="e c abre__e">A casa</p><p class="d abre__p rv">Paredes de meio metro, chão de tijoleira, uma piscina de água salgada e um restaurante pequeno. <em>Não há muito mais, e é por isso que se vem.</em></p></div>
  <div class="grid pares">
    <figure class="pares__a"><div class="foto-r rv-f">${photo('terraco2', { sizes: '(max-width: 760px) 75vw, 30vw' })}</div><figcaption class="leg"><span>O terraço coberto</span><span>01</span></figcaption></figure>
    <div class="pares__b">
      <figure><div class="foto-r rv-f">${photo('lencois', { sizes: '(max-width: 760px) 75vw, 38vw' })}</div><figcaption class="leg"><span>Linho lavado em Vila do Bispo</span><span>02</span></figcaption></figure>
      <p class="pares__t rv">Catorze quartos, quatro feitios. Os da frente dão para a falésia, os de baixo para o pátio. Todos têm janelas que abrem e camas feitas com linho.<br><br><a class="lk" href="/a-casa">Conhecer a casa</a></p>
    </div>
  </div>
</section>

<section class="qs" aria-labelledby="h-quartos">
  <div class="grid titulo"><h2 id="h-quartos" class="rv">Os quartos</h2><p class="rv">Preços por noite, para duas pessoas, com pequeno-almoço servido até às onze.</p></div>
  ${big(farol, false)}
  ${big(falesia, true)}
  <div class="grid duo">${small(patio)}${small(duna)}</div>
  <p class="grid qs__todos"><a class="lk" href="/quartos">Ver os catorze quartos</a></p>
</section>

<section class="rec" aria-labelledby="h-rec" data-rececao>
  <div class="grid">
    <div class="rec__tx">
      <p class="e rec__e">A receção</p>
      <h2 id="h-rec" class="rv">A chave está<br><em>no quadro.</em></h2>
      <p class="rec__p rv">Num hotel pequeno, o quadro atrás do balcão diz tudo: se a chave está pendurada, o quarto está livre. De ${dayLong(a.checkIn)} a ${dayLong(a.checkOut)} há ${a.free.length} chaves no quadro. Escolha uma.</p>
      <ul class="chaves" data-chaves aria-label="Chaves de ${dayLong(a.checkIn)} a ${dayLong(a.checkOut)}">${a.rooms
        .map((r) =>
          r.free
            ? `<li><button type="button" data-num="${r.num}" aria-pressed="${r.num === '03'}"><b>${r.num}</b><span class="sr"> ${esc(r.typeName)}, livre</span></button></li>`
            : `<li class="fora"><span><b>${r.num}</b><span class="sr"> ocupado</span></span></li>`,
        )
        .join('')}</ul>
      <div class="rec__ficha" data-ficha aria-live="polite">${keyCard(a, a.free.includes('03') ? '03' : a.free[0])}</div>
    </div>
    <div class="rec__palco" data-palco>
      <img class="rec__poster" src="/img/chave.webp" width="960" height="1200" alt="Chave 03 do hotel, de latão, com o porta-chaves gravado" loading="lazy" decoding="async" data-poster>
      <canvas class="rec__3d" data-canvas aria-hidden="true"></canvas>
      <button class="rec__ligar" type="button" data-ligar hidden>Ver o quadro em 3D</button>
      <p class="rec__nota"><span data-nota>${(() => { const r = a.rooms.find((x) => x.num === (a.free.includes('03') ? '03' : a.free[0])); return r ? `Chave ${r.num} · ${esc(r.typeName)}` : 'Quadro da receção'; })()}</span><span>${a.checkIn.slice(8)} — ${a.checkOut.slice(8)} ${['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][Number(a.checkOut.slice(5, 7)) - 1]}</span></p>
    </div>
  </div>
</section>

<section class="sg" aria-labelledby="h-sg">
  <div class="grid titulo"><h2 id="h-sg" class="rv">Sagres, a pé</h2><p class="rv">O hotel fica no fim da estrada. Quase tudo se faz a pé ou de bicicleta, e as bicicletas estão no pátio.</p></div>
  <div class="tri">${PLACES.slice(0, 3)
    .map((p, i) => `<figure class="rv"><div class="foto-r rv-f tri__im">${photo(i === 0 ? 'baia' : p.photo, { sizes: i === 0 ? '(max-width: 760px) 100vw, 42vw' : '(max-width: 760px) 50vw, 28vw' })}</div><figcaption><b>${esc(p.name)}</b><span>${esc(p.when)}</span></figcaption></figure>`)
    .join('')}</div>
  <p class="grid qs__todos"><a class="lk" href="/sagres">O que fazer à volta</a></p>
</section>

<section class="grid mesa" aria-labelledby="h-mesa">
  <div class="mesa__im foto-r rv-f">${photo('mesa', { sizes: '(max-width: 760px) 100vw, 48vw' })}</div>
  <div class="mesa__tx">
    <p class="e c">Restaurante</p>
    <h2 id="h-mesa" class="rv">O que o barco<br><em>trouxe.</em></h2>
    <p class="mesa__p rv">Doze mesas, abertas também a quem não dorme cá. A ementa muda todos os dias, conforme a lota.</p>
    ${menuList(menu, { short: true })}
    <a class="lk" href="/restaurante">Ver o restaurante</a>
  </div>
</section>

<section class="ch" aria-labelledby="h-ch"><div class="grid">
  <h2 id="h-ch">No fim da estrada,<br>antes do mar.</h2>
  <div class="ch__c"><h3 class="e">Chegar</h3><p>1h20 de Faro<br>3h de Lisboa<br>Estacionamento no pátio</p></div>
  <div class="ch__c"><h3 class="e">Horas</h3><p>Entrada das ${SITE.checkIn.slice(0, 2)}h às ${SITE.checkInUntil.slice(0, 2)}h<br>Saída até às ${SITE.checkOut.slice(0, 2)}h<br>Receção 24 horas</p></div>
  <div class="ch__c"><h3 class="e">Mais</h3><p><a class="lk" href="/como-chegar">Como chegar</a></p></div>
</div></section>`;
}

// A ficha da chave escolhida no quadro (o JavaScript troca-a quando se escolhe outra)
export function keyCard(a, num) {
  const room = a.rooms.find((r) => r.num === num && r.free);
  if (!room) return `<p class="rec__vazio">Não há chaves no quadro para estas datas. Experimente outras.</p>`;
  return `<p class="rec__k"><span>Chave ${room.num}</span><b>${esc(room.typeName)}</b></p><p class="rec__pr"><span>${euros(room.total)} por ${a.nights} ${a.nights === 1 ? 'noite' : 'noites'}</span><a class="lk lk--claro" href="/reservar?quarto=${room.num}&chegada=${a.checkIn}&saida=${a.checkOut}&hospedes=${a.guests}">Reservar a chave ${room.num}</a></p>`;
}

export const homeDescription = (a) => `Hotel de 14 quartos em Sagres, numa casa de pescadores à beira da falésia, com piscina de água salgada e restaurante. ${a.free.length} quartos livres para ${dayLong(a.checkIn)}.`;
export { longDay };
