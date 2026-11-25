import { SITE } from '../../config/site.js';
import { dayLong } from '../../utils/dates.js';
import { esc, euros, pageHead, photo } from '../html.js';

export function menuList(menu) {
  if (!menu) return '<p class="ementa">A ementa de hoje ainda não foi escrita. Pergunte na receção.</p>';
  return `<div class="ementa">
    <p class="ementa__d"><span>Ementa de hoje</span><span>${dayLong(menu.date)}</span></p>
    <ul>${menu.items.map((i) => `<li><span>${esc(i.name)}${i.detail ? `<small>${esc(i.detail)}</small>` : ''}</span><b>${euros(i.price)}</b></li>`).join('')}</ul>
    <p class="ementa__h">Jantar das 19h30 às 22h30 · pequeno-almoço das 8h às 11h</p>
  </div>`;
}

export function restaurantBody({ menu }) {
  return `${pageHead({ kicker: 'Restaurante', title: 'Ao jantar, o que o barco trouxe.', lead: 'Doze mesas na sala de baixo e mais seis no terraço quando não há vento. Abertas também a quem não dorme no hotel.', crumbs: [['Restaurante']] })}
<section class="sec sec--topo"><div class="cx rest">
  <div class="rest__ementa">${menuList(menu)}<p class="rest__nota">A ementa muda todos os dias conforme a lota de Sagres. Diga-nos se tem alergias quando reservar a mesa.</p></div>
  <div class="rest__fotos">${photo('petiscos', { sizes: '(max-width: 820px) 100vw, 46vw', eager: true })}${photo('jantar', { sizes: '(max-width: 820px) 50vw, 23vw' })}${photo('cafe', { sizes: '(max-width: 820px) 50vw, 23vw' })}</div>
</div></section>
<section class="sec sec--claro"><div class="cx">
  <div class="cab"><div><p class="rot">Horários</p><h2>Três momentos à mesa.</h2></div><p>Os hóspedes têm o pequeno-almoço incluído. O jantar paga-se à parte, no fim da estadia ou à mesa.</p></div>
  <div class="tres tres--texto">
    <div>${photo('pasteis', { sizes: '(max-width: 820px) 100vw, 30vw' })}<h3>Pequeno-almoço</h3><p>Das 8h às 11h. Pão da padaria de Vila do Bispo, fruta, ovos como quiser e pastéis de nata ao domingo.</p></div>
    <div>${photo('cocktail', { sizes: '(max-width: 820px) 100vw, 30vw' })}<h3>Fim de tarde</h3><p>Das 17h às 19h30, no terraço. Vinho do Algarve, cocktails com medronho e petiscos.</p></div>
    <div>${photo('mesa', { sizes: '(max-width: 820px) 100vw, 30vw' })}<h3>Jantar</h3><p>Das 19h30 às 22h30. Para reservar mesa, os hóspedes pedem na área da reserva; os outros escrevem para ${SITE.email}.</p></div>
  </div>
</div></section>`;
}

export const restaurantDescription = (menu) =>
  `Restaurante do hotel Arriba, em Sagres: jantar das 19h30 às 22h30 com o peixe da lota. ${menu ? `Hoje: ${menu.items.map((i) => i.name.toLowerCase()).join(', ')}.` : ''}`;
