import { ROOM_TYPES } from '../../config/site.js';
import { dayShort } from '../../utils/dates.js';
import { esc, euros, pageHero, photo } from '../html.js';
import { datesBar } from './home.js';

const keysLabel = (t) => t.rooms.join(', ').replace(/, (?=[^,]*$)/, ' e ');

export function roomsBody({ a, table }) {
  return `${pageHero({ photo: 'qmadeira', crumbs: [['Quartos']], title: 'Catorze portas,<br><em>quatro feitios.</em>', aside: '<b>130 — 290 €</b>Por noite, com pequeno-almoço' })}
<section class="sec lista-q">
  <div class="grid titulo"><h2 class="rv">Os quartos</h2><p class="rv">As chaves riscadas já estão com hóspedes de ${dayShort(a.checkIn)} a ${dayShort(a.checkOut)}. Mude as datas na página de cada quarto.</p></div>
  ${ROOM_TYPES.map((t, i) => {
    const at = a.types.find((x) => x.slug === t.slug);
    return `<article class="grid lq${i % 2 ? ' lq--inv' : ''}">
    <a class="lq__im foto-r rv-f" href="/quartos/${t.slug}" tabindex="-1" aria-hidden="true">${photo(t.photos[0], { sizes: '(max-width: 760px) 100vw, 50vw', eager: i === 0 })}</a>
    <div class="lq__tx rv">
      <p class="q__n"><span>0${i + 1}</span><span>Chaves ${keysLabel(t)}</span></p>
      <h2><a href="/quartos/${t.slug}">${esc(t.name)}</a></h2>
      <p class="c">${esc(t.lead)} ${esc(t.text)}</p>
      <ul class="chv" aria-label="Chaves de ${dayShort(a.checkIn)} a ${dayShort(a.checkOut)}">${t.rooms.map((n) => `<li class="${at.free.includes(n) ? '' : 'fora'}">${n}<span class="sr"> ${at.free.includes(n) ? 'livre' : 'ocupado'}</span></li>`).join('')}</ul>
      <div class="q__pr"><span>${euros(table[t.slug])} <small>por noite</small></span><a class="lk" href="/quartos/${t.slug}">Ver o quarto</a></div>
    </div>
  </article>`;
  }).join('')}
</section>`;
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Calendário de noites em meses (segunda a domingo), usado no quarto e na reserva
export function monthsCalendar(nights, { label = (n) => (n.free ? `${n.free} livre${n.free > 1 ? 's' : ''}` : 'cheio'), months = 2, selected = {} } = {}) {
  const byMonth = new Map();
  for (const n of nights) {
    const key = n.day.slice(0, 7);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key).push(n);
  }
  return [...byMonth.entries()]
    .slice(0, months)
    .map(([key, list]) => {
      const first = new Date(`${key}-01T12:00:00Z`);
      const lead = (new Date(`${list[0].day}T12:00:00Z`).getUTCDay() + 6) % 7;
      return `<div class="mes">
      <h3>${MONTHS[first.getUTCMonth()]} <span>${first.getUTCFullYear()}</span></h3>
      <div class="mes__sem" aria-hidden="true"><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span><span>D</span></div>
      <div class="mes__dias">${'<span class="v"></span>'.repeat(lead)}${list
        .map((n) => {
          const cls = [!n.free && 'x', n.day === selected.checkIn && 'a', n.day === selected.checkOut && 'b', selected.checkIn && n.day > selected.checkIn && n.day < selected.checkOut && 'r'].filter(Boolean).join(' ');
          return `<button type="button" class="dia${cls ? ` ${cls}` : ''}" data-dia="${n.day}"${n.free ? '' : ' aria-disabled="true"'}><b>${Number(n.day.slice(8))}</b><small>${label(n)}</small><span class="sr"> ${dayShort(n.day)}</span></button>`;
        })
        .join('')}</div>
    </div>`;
    })
    .join('');
}

export function roomBody({ type, price, calendar, a, table }) {
  const at = a.types.find((x) => x.slug === type.slug);
  const extra = `<input type="hidden" name="tipo" value="${type.slug}">`;
  return `${pageHero({ photo: type.photos[0], crumbs: [['Quartos', '/quartos'], [type.name]], title: esc(type.name).replace(/ (\S+)$/, ' <em>$1</em>'), aside: `<b>${type.rooms.join(' · ')}</b>${type.rooms.length} quartos com esta chave` })}
<section class="grid corpo">
  <div class="corpo__tx">
    <p class="d corpo__lead rv">${esc(type.lead)}</p>
    <p class="c rv">${esc(type.text)}</p>
    <dl class="specs rv"><div><dt>Área</dt><dd>${type.size} m²</dd></div><div><dt>Cama</dt><dd>${esc(type.bed)}</dd></div><div><dt>Vista</dt><dd>${esc(type.view)}</dd></div><div><dt>Exterior</dt><dd>${esc(type.outside)}</dd></div><div><dt>Pessoas</dt><dd>Até ${type.guests}</dd></div><div><dt>Preço</dt><dd>${euros(price)} por noite</dd></div></dl>
    <div class="tem rv"><h2 class="e">No quarto</h2><ul>${type.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>
  </div>
  <aside class="cart" aria-labelledby="h-cart" data-cart data-tipo="${type.slug}">
    <p class="e c" id="h-cart">A partir de</p>
    <p class="cart__pr"><b>${euros(price)}</b><span>por noite, com pequeno-almoço</span></p>
    ${datesBar(a, { action: '/reservar', extra, dark: false })}
    <p class="cart__tot"><span data-cart-noites>${a.nights} ${a.nights === 1 ? 'noite' : 'noites'}</span><b data-cart-total>${euros(at.total)}</b></p>
    <a class="bt cart__bt" data-cart-ir href="/reservar?tipo=${type.slug}&chegada=${a.checkIn}&saida=${a.checkOut}&hospedes=${a.guests}">${at.free.length ? `Reservar a chave ${at.free[0]}` : 'Ver outras datas'}</a>
    <p class="cart__liv${at.free.length ? '' : ' cart__liv--nao'}" data-cart-liv>${at.free.length ? `${at.free.length === type.rooms.length ? 'Todas as chaves' : `${at.free.length} de ${type.rooms.length} chaves`} no quadro nestas datas` : 'Nenhuma chave no quadro nestas datas'}</p>
  </aside>
</section>
<section class="gal">
  <figure class="gal__a foto-r rv-f">${photo(type.photos[1], { sizes: '(max-width: 760px) 100vw, 56vw' })}</figure>
  <figure class="gal__b foto-r rv-f">${photo(type.photos[2], { sizes: '(max-width: 760px) 75vw, 38vw' })}</figure>
  <p class="gal__nota d rv">${esc(type.view)}. ${esc(type.outside)}.<span>${esc(type.name)} · chaves ${keysLabel(type)}</span></p>
</section>
<section class="sec sec--claro" aria-labelledby="h-cal">
  <div class="grid cal-q">
    <div class="cal-q__tx"><h2 id="h-cal" class="rv">Noites livres</h2><p class="c rv">Quantas das ${type.rooms.length} chaves estão no quadro em cada noite, nas próximas semanas. Toque numa noite para começar a reserva aí.</p></div>
    <div class="meses" data-cal-quarto data-tipo="${type.slug}">${monthsCalendar(calendar)}</div>
  </div>
</section>
<section class="sec outros" aria-labelledby="h-outros">
  <div class="grid titulo"><h2 id="h-outros" class="rv">Os outros quartos</h2></div>
  <div class="grid outros__g">${ROOM_TYPES.filter((t) => t.slug !== type.slug)
    .map((t) => `<a class="outro rv" href="/quartos/${t.slug}"><div class="foto-r">${photo(t.photos[0], { sizes: '(max-width: 760px) 100vw, 30vw' })}</div><p><b>${esc(t.name)}</b><span>desde ${euros(table[t.slug])}</span></p></a>`)
    .join('')}</div>
</section>`;
}
