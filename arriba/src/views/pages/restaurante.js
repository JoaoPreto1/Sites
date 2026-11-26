import { SITE } from '../../config/site.js';
import { dayLong } from '../../utils/dates.js';
import { esc, pageHero, photo } from '../html.js';

const cap = (s) => s.replace(/^./, (c) => c.toUpperCase());

export function menuList(menu, { short = false } = {}) {
  if (!menu) return '<p class="vazio">A ementa de hoje ainda não foi escrita. Pergunte na receção.</p>';
  const items = short ? menu.items.slice(0, 3) : menu.items;
  return `<div class="ementa">
    <p class="ementa__h"><span>${cap(dayLong(menu.date))}</span><span>19h30 — 22h30</span></p>
    <ul>${items.map((i) => `<li><b>${esc(i.name)}</b><span>${i.price}</span>${i.detail ? `<small>${esc(i.detail)}</small>` : ''}</li>`).join('')}</ul>
  </div>`;
}

export function restaurantBody({ menu }) {
  return `${pageHero({ photo: 'petiscos', crumbs: [['Restaurante']], title: 'O que o barco <em>trouxe.</em>', aside: '<b>12 mesas</b>Abertas também a quem não dorme cá' })}
<section class="grid rest">
  <div class="rest__tx">
    <p class="d rest__lead rv">A ementa escreve-se de manhã, depois de a cozinha ir à lota de Sagres. Peixe do dia, marisco da costa vicentina e legumes das hortas de Vila do Bispo.</p>
    <p class="c rv">Há sempre uma alternativa sem peixe. Diga-nos se tem alergias quando reservar a mesa: a cozinha é pequena e consegue adaptar quase tudo.</p>
  </div>
  <div class="rest__ementa rv">${menuList(menu)}<p class="rest__n">Preços em euros. A ementa muda todos os dias.</p></div>
</section>
<section class="grid rest-fotos">
  <figure class="rest-fotos__a foto-r rv-f">${photo('jantar', { sizes: '(max-width: 760px) 100vw, 40vw' })}</figure>
  <figure class="rest-fotos__b foto-r rv-f">${photo('prato', { sizes: '(max-width: 760px) 100vw, 50vw' })}</figure>
</section>
<section class="sec sec--claro" aria-labelledby="h-horas">
  <div class="grid titulo"><h2 id="h-horas" class="rv">Três momentos<br>à mesa.</h2><p class="rv">Os hóspedes têm o pequeno-almoço incluído. O jantar paga-se à parte, à mesa ou à saída.</p></div>
  <div class="grid horas">
    <article class="rv"><div class="foto-r">${photo('pasteis', { sizes: '(max-width: 760px) 100vw, 30vw' })}</div><p class="horas__h"><span>08h — 11h</span></p><h3>Pequeno-almoço</h3><p>Pão da padaria de Vila do Bispo, fruta, ovos como quiser e pastéis de nata ao domingo.</p></article>
    <article class="rv"><div class="foto-r">${photo('cocktail', { sizes: '(max-width: 760px) 100vw, 30vw' })}</div><p class="horas__h"><span>17h — 19h30</span></p><h3>Fim de tarde</h3><p>No terraço: vinho do Algarve, cocktails com medronho e petiscos.</p></article>
    <article class="rv"><div class="foto-r">${photo('cafe', { sizes: '(max-width: 760px) 100vw, 30vw' })}</div><p class="horas__h"><span>19h30 — 22h30</span></p><h3>Jantar</h3><p>Os hóspedes reservam mesa na área da reserva. Os outros escrevem para ${SITE.email}.</p></article>
  </div>
</section>`;
}

export const restaurantDescription = (menu) =>
  `Restaurante do hotel Arriba, em Sagres: jantar das 19h30 às 22h30 com o peixe da lota. ${menu ? `Hoje: ${menu.items.map((i) => i.name.toLowerCase()).join(', ')}.` : ''}`;
