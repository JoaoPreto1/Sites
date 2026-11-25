import { ROOM_TYPES } from '../../config/site.js';
import { dayShort, nights } from '../../utils/dates.js';
import { esc, euros, keyTags, pageHead, photo } from '../html.js';

export function roomsBody({ a }) {
  return `${pageHead({
    kicker: 'Quartos',
    title: 'Catorze portas, quatro maneiras de acordar.',
    lead: `Preços por noite para duas pessoas, com pequeno-almoço. As chaves riscadas já estão com hóspedes de ${dayShort(a.checkIn)} a ${dayShort(a.checkOut)}.`,
    crumbs: [['Quartos']],
  })}
<section class="sec sec--topo"><div class="cx lista">
  ${ROOM_TYPES.map((type, i) => {
    const at = a.types.find((x) => x.slug === type.slug);
    return `<article class="linha">
    <a class="linha__f" href="/quartos/${type.slug}" tabindex="-1" aria-hidden="true">${photo(type.photos[0], { sizes: '(max-width: 820px) 100vw, 40vw', eager: i === 0 })}</a>
    <div class="linha__t">
      ${keyTags(type.rooms, at.free)}
      <h2><a href="/quartos/${type.slug}">${esc(type.name)}</a></h2>
      <p>${esc(type.lead)} ${esc(type.text)}</p>
      <dl class="fichas"><div><dt>Tamanho</dt><dd>${type.size} m²</dd></div><div><dt>Cama</dt><dd>${esc(type.bed)}</dd></div><div><dt>Vista</dt><dd>${esc(type.view)}</dd></div><div><dt>Até</dt><dd>${type.guests} pessoas</dd></div></dl>
      <div class="tipo__rod"><p><b>${euros(at.price)}</b> <small>por noite · ${euros(at.total)} por ${nights(a.nights)}</small></p><a class="lnk" href="/quartos/${type.slug}">Ver o quarto</a></div>
    </div>
  </article>`;
  }).join('')}
</div></section>`;
}

const WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function roomBody({ type, price, calendar, a, table }) {
  const at = a.types.find((x) => x.slug === type.slug);
  const first = new Date(`${calendar[0].day}T12:00:00Z`).getUTCDay();
  return `${pageHead({ kicker: `Chaves ${type.rooms.join(' · ')}`, title: esc(type.name), lead: esc(type.lead), crumbs: [['Quartos', '/quartos'], [type.name]] })}
<section class="sec sec--topo"><div class="cx quarto">
  <div class="galeria">${type.photos.map((p, i) => photo(p, { sizes: i === 0 ? '(max-width: 820px) 100vw, 58vw' : '(max-width: 820px) 50vw, 28vw', eager: i === 0, cls: i === 0 ? 'galeria__a' : '' })).join('')}</div>
  <div class="quarto__t">
    <p class="quarto__txt">${esc(type.text)}</p>
    <dl class="fichas"><div><dt>Tamanho</dt><dd>${type.size} m²</dd></div><div><dt>Cama</dt><dd>${esc(type.bed)}</dd></div><div><dt>Vista</dt><dd>${esc(type.view)}</dd></div><div><dt>Exterior</dt><dd>${esc(type.outside)}</dd></div><div><dt>Até</dt><dd>${type.guests} pessoas</dd></div><div><dt>Preço</dt><dd>${euros(price)} por noite</dd></div></dl>
    <h2 class="quarto__h">O que tem</h2>
    <ul class="tem">${type.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
  </div>
</div></section>
<section class="sec sec--claro" aria-labelledby="h-cal"><div class="cx cal-g">
  <div>
    <p class="rot">Disponibilidade</p>
    <h2 id="h-cal" class="h2">Chaves no quadro nas próximas cinco semanas.</h2>
    <p class="cal__leg">Cada dia mostra quantos dos ${type.rooms.length} quartos ${esc(type.name)} estão livres nessa noite.</p>
    <div class="cal" role="table" aria-label="Quartos ${esc(type.name)} livres por noite">
      <div class="cal__sem" role="row">${WEEK.map((d) => `<span role="columnheader">${d}</span>`).join('')}</div>
      <div class="cal__dias" role="row">${'<span aria-hidden="true"></span>'.repeat(first)}${calendar.map((c) => `<span role="cell" class="cal__d${c.free ? '' : ' cal__d--cheio'}"><b>${Number(c.day.slice(8))}</b><small>${c.free ? `${c.free} livre${c.free > 1 ? 's' : ''}` : 'cheio'}</small><span class="sr"> ${dayShort(c.day)}</span></span>`).join('')}</div>
    </div>
  </div>
  <form class="reserva-cx" action="/reservar" method="get">
    <h2 class="h3">Reservar: ${esc(type.name)}</h2>
    <input type="hidden" name="tipo" value="${type.slug}">
    <label class="campo"><span>Chegada</span><input type="date" name="chegada" value="${a.checkIn}" required></label>
    <label class="campo"><span>Saída</span><input type="date" name="saida" value="${a.checkOut}" required></label>
    <label class="campo"><span>Hóspedes</span><select name="hospedes">${Array.from({ length: type.guests }, (_, i) => `<option value="${i + 1}"${i + 1 === 2 ? ' selected' : ''}>${i + 1} ${i ? 'adultos' : 'adulto'}</option>`).join('')}</select></label>
    <p class="reserva-cx__pr">${at.free.length ? `${at.free.length} ${at.free.length === 1 ? 'chave livre' : 'chaves livres'} de ${dayShort(a.checkIn)} a ${dayShort(a.checkOut)}: <b>${euros(at.total)}</b>` : `Sem chaves livres de ${dayShort(a.checkIn)} a ${dayShort(a.checkOut)}.`}</p>
    <button class="btn" type="submit">Ver chaves livres</button>
  </form>
</div></section>
<section class="sec"><div class="cx">
  <h2 class="h2">Os outros quartos</h2>
  <div class="outros">${ROOM_TYPES.filter((t) => t.slug !== type.slug)
    .map((t) => `<a class="outro" href="/quartos/${t.slug}">${photo(t.photos[0], { sizes: '(max-width: 820px) 100vw, 30vw' })}<span><b>${esc(t.name)}</b> desde ${euros(table[t.slug])}</span></a>`)
    .join('')}</div>
</div></section>`;
}
