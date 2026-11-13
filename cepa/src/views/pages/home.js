import { bottle } from '../../../public/js/shared/bottle.js';
import { carta, entry, pairingResult, peopleWord } from '../../../public/js/shared/carta.js';
import { dayNumber, escapeHtml, longDate, money, monthName, plural } from '../../../public/js/shared/format.js';
import { cartaNumber, glasses, photo } from '../helpers.js';

const BUDGETS = [
  [12, 'até 12 €'],
  [20, 'até 20 €'],
  [30, 'até 30 €'],
  [60, 'até 60 €'],
  ['', 'o que for preciso'],
];

const options = (list, selected) =>
  list.map(([value, label]) => `<option value="${value}"${String(value) === String(selected) ? ' selected' : ''}>${escapeHtml(label)}</option>`).join('');

function hero({ pairing, dishes }) {
  const people = Array.from({ length: 12 }, (_, i) => [i + 1, i === 0 ? 'eu sozinho' : peopleWord(i + 1)]);

  return `
  <section class="hero wrap">
    <div class="hero__main">
      <p class="kicker mono"><span>Carta n.º ${cartaNumber()} · o que vai para a mesa?</span></p>
      <h1 class="sr-only">Cepa, garrafeira de vinhos portugueses no Porto</h1>
      <form class="sentence" data-pairing>
        <p>Esta noite há
          <span class="pick-word"><select name="prato" aria-label="Prato">${options(dishes.map((d) => [d.slug, d.name]), pairing.dish.slug)}</select></span>,
          somos <span class="pick-word"><select name="pessoas" aria-label="Quantas pessoas">${options(people, pairing.people)}</select></span>
          e cada garrafa pode custar
          <span class="pick-word"><select name="orcamento" aria-label="Orçamento por garrafa">${options(BUDGETS, pairing.budget ?? '')}</select></span>.
        </p>
      </form>
      <div class="pairing" data-pairing-result aria-live="polite">${pairingResult(pairing)}</div>
    </div>
    <figure class="hero__aside">
      ${photo('https://images.unsplash.com/photo-1553361371-9b22f78e8b1d', { widths: [240, 400, 600, 800], ratio: 1.4, sizes: '(max-width: 900px) 120px, 34vw', alt: 'Copo de vinho tinto numa mesa posta para jantar', eager: true })}
      <figcaption>Ninguém sabe tudo sobre vinho. Diga-nos o que vai cozinhar e nós tratamos do resto — na loja é igual, só que com provas.</figcaption>
    </figure>
  </section>`;
}

function weekly({ featured, types, total }) {
  return `
  <section class="weekly wrap" aria-labelledby="weekly-title">
    <header class="weekly__head">
      <h2 id="weekly-title" class="title-lg">A carta <em>desta semana</em></h2>
      <p>Os vinhos que estamos a abrir ao balcão e que mais temos recomendado. Muda às quintas, como a montra.</p>
      <a class="link" href="/carta">Ver os ${total} vinhos da carta</a>
    </header>
    <div class="weekly__list">${carta(types, featured, { note: true })}</div>
  </section>`;
}

function regions(list) {
  return `
  <section class="route" aria-labelledby="route-title">
    <div class="wrap route__grid">
      <div class="route__photos" aria-hidden="true">
        ${list
          .map(
            (r, i) =>
              `<figure class="route__photo${i === 0 ? ' is-active' : ''}" data-region-photo="${r.slug}">${photo(r.photo, { widths: [500, 800, 1100], ratio: 1.2, sizes: '(max-width: 900px) 100vw, 45vw', alt: '' })}<figcaption class="mono">${escapeHtml(r.name)} · ${escapeHtml(r.soil)}</figcaption></figure>`,
          )
          .join('')}
      </div>
      <div class="route__list">
        <p class="kicker mono"><span>De norte a sul</span></p>
        <h2 id="route-title" class="title-lg">Sete regiões, <em>uma garrafeira</em></h2>
        <ol>
          ${list
            .map(
              (r) => `
          <li>
            <a href="/carta?regiao=${r.slug}" data-region="${r.slug}">
              <span class="mono route__lat">${r.latitude}</span>
              <span class="route__name">${escapeHtml(r.name)}</span>
              <span class="route__count mono">${plural(r.count, 'vinho', 'vinhos')}</span>
            </a>
          </li>`,
            )
            .join('')}
        </ol>
      </div>
    </div>
  </section>`;
}

function producerFeature({ producer, wines }) {
  const [first, ...rest] = producer.story.split('. ');
  return `
  <section class="feature" aria-labelledby="feature-title">
    <div class="wrap feature__grid">
      <figure class="feature__photo">
        ${photo(producer.photo, { widths: [500, 800, 1100], ratio: 1.3, sizes: '(max-width: 900px) 100vw, 50vw', alt: `Vinhas da ${producer.name}` })}
        <figure class="feature__portrait">${photo(producer.portrait, { widths: [240, 360], ratio: 1.25, sizes: '180px', alt: producer.winemaker })}</figure>
      </figure>
      <div class="feature__text">
        <p class="kicker mono"><span>Quem faz o vinho</span></p>
        <h2 id="feature-title" class="title-lg">${escapeHtml(producer.name)}</h2>
        <p class="feature__by mono">${escapeHtml(producer.winemaker)} · Douro</p>
        <p class="feature__story"><span class="dropcap">${escapeHtml(first[0])}</span>${escapeHtml(first.slice(1))}. ${escapeHtml(rest.join('. '))}</p>
        <blockquote>“${escapeHtml(producer.quote)}”</blockquote>
        <div class="feature__wines">${wines.map((w) => entry(w)).join('')}</div>
        <a class="link" href="/produtores#${producer.slug}">Conhecer os outros produtores</a>
      </div>
    </div>
  </section>`;
}

function clubBox({ current, plans }) {
  const from = Math.min(...plans.map((p) => p.price));
  return `
  <section class="box" aria-labelledby="box-title">
    <div class="wrap box__grid">
      <div class="box__text">
        <p class="mono box__kicker">O clube · caixa de ${monthName(`${current.month}-01`)}</p>
        <h2 id="box-title" class="title-lg">${escapeHtml(current.title.split(':')[1]?.trim() ?? current.title)}</h2>
        <p>${escapeHtml(current.intro)}</p>
        <p class="box__terms">Todos os meses uma caixa escolhida por nós, a partir de ${money(from)}. Pausa ou cancela na sua conta, sem telefonemas.</p>
        <a class="btn btn--paper" href="/clube">Como funciona o clube</a>
      </div>
      <ol class="box__shelf">
        ${current.picks
          .map(
            ({ wine, note }) => `
        <li>
          <a href="/carta/${wine.slug}" class="box__bottle">${bottle(wine)}</a>
          <p class="box__note">${escapeHtml(note)}</p>
        </li>`,
          )
          .join('')}
      </ol>
    </div>
  </section>`;
}

function tastingsProgramme(list) {
  return `
  <section class="programme wrap" aria-labelledby="programme-title">
    <header class="programme__head">
      <h2 id="programme-title" class="title-lg">À mesa <em>connosco</em></h2>
      <a class="link" href="/provas">Todas as provas</a>
    </header>
    <ol class="programme__list">
      ${list
        .map(
          (t) => `
      <li class="programme__item">
        <p class="programme__date"><span>${dayNumber(t.date)}</span><span class="mono">${monthName(t.date).slice(0, 3)}</span></p>
        <div>
          <h3><a href="/provas#${t.slug}">${escapeHtml(t.title)}</a></h3>
          <p class="programme__meta mono">${longDate(t.date)} · ${t.time} · ${money(t.price)}</p>
          <p>${escapeHtml(t.description)}</p>
        </div>
        <div class="programme__seats">
          ${glasses(t.seats, t.taken)}
          <span class="mono">${t.seatsLeft ? plural(t.seatsLeft, 'lugar livre', 'lugares livres') : 'Esgotada'}</span>
        </div>
      </li>`,
        )
        .join('')}
    </ol>
  </section>`;
}

function shop() {
  return `
  <section class="shop wrap" aria-labelledby="shop-title">
    <figure class="shop__photo">${photo('https://images.unsplash.com/photo-1774684047298-193cd2f986d9', { widths: [600, 1000, 1400], ratio: 0.55, sizes: '(max-width: 900px) 100vw, 1240px', alt: 'Clientes a provar vinho ao balcão da loja' })}</figure>
    <div class="shop__card">
      <h2 id="shop-title">A loja</h2>
      <p>Rua de Cedofeita 212, no Porto. Há sempre quatro garrafas abertas ao balcão: prove antes de levar.</p>
      <p class="mono">terça a sábado · 11h–20h</p>
    </div>
  </section>`;
}

export function homePage(data) {
  return [hero(data), weekly(data), regions(data.regions), producerFeature(data.feature), clubBox(data.club), tastingsProgramme(data.tastings), shop()].join('');
}
