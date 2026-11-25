import { PEOPLE, SITE } from '../../config/site.js';
import { arrow, dateLong, dateShort, esc, pageHead, paragraphs } from '../html.js';

const STEPS = [
  ['Briefing', 'Lemos o que nos atiraste e marcamos meia hora de conversa. Perguntamos o que acontece se o projeto não avançar.'],
  ['Proposta', 'Três linhas: o que fazemos, quando entregamos e quanto custa. O detalhe vai em anexo.'],
  ['Esboços', 'Dois ou três caminhos, testados à escala real: num autocolante, num telemóvel, numa prateleira.'],
  ['Provas', 'Cada versão aparece na tua área de cliente. Aprovas ou pedes alterações com um clique e um comentário.'],
  ['Artes finais', 'Ficheiros prontos para a gráfica, para o servidor ou para as redes. Acompanhamos a impressão.'],
  ['Entregue', 'Guia de uso, ficheiros organizados e uma hora para tirar dúvidas depois da entrega.'],
];

const initials = (name) => name.split(' ').map((p) => p[0]).join('');

export function studioBody() {
  return `${pageHead({
    kicker: 'Estúdio',
    title: 'Quatro<br>pessoas<br>e uma <em>mesa</em>',
    lead: `Somos um estúdio pequeno em ${SITE.area}. Trabalhamos com poucos clientes de cada vez, e é sempre a mesma pessoa que atende o telefone e que desenha.`,
  })}
<section class="wrap people" aria-labelledby="quem">
  <h2 class="sr-only" id="quem">Quem somos</h2>
  <ul class="people__list">${PEOPLE.map(
    (p) => `<li class="person">
      <div class="person__blk person__blk--${p.shape} person__blk--${p.color}" aria-hidden="true">${initials(p.name)}</div>
      <h3>${esc(p.name)}</h3>
      <p class="person__role">${esc(p.role)}</p>
      <p>${esc(p.note)}</p>
    </li>`,
  ).join('')}</ul>
  <p class="people__note">As pessoas do estúdio são fictícias e por isso não têm fotografia: cada uma é o bloco que mais desenha.</p>
</section>
<section class="section" aria-labelledby="como-trabalhamos">
  <div class="wrap">
    <div class="section-head"><h2 class="display" id="como-trabalhamos">Como<br>trabalhamos</h2><p class="section-note">Seis fases, sempre as mesmas, que vês a avançar na tua área de cliente.</p></div>
    <ol class="steps">${STEPS.map(([t, d], i) => `<li class="step step--${i}"><span class="step__n">${String(i + 1).padStart(2, '0')}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>
  </div>
</section>
<section class="wrap where" aria-labelledby="onde">
  <div class="where__box">
    <h2 class="display" id="onde">Onde<br>estamos</h2>
    <dl>
      <div><dt>Bairro</dt><dd>${SITE.area}</dd></div>
      <div><dt>Horário</dt><dd>${SITE.hours}</dd></div>
      <div><dt>Email</dt><dd><a href="mailto:${SITE.email}">${SITE.email}</a></dd></div>
    </dl>
    <p>Recebemos no estúdio com marcação. Também vamos ter contigo: já fizemos reuniões numa lota, num palco e numa padaria às seis da manhã.</p>
    <a class="btn btn--ink" href="/contacto">Atirar um problema ${arrow}</a>
  </div>
</section>`;
}

export function journalBody({ entries }) {
  const [first, ...rest] = entries;
  return `${pageHead({ kicker: 'Diário', title: 'O que<br>aprendemos <em>a<br>empilhar</em>', lead: 'Notas curtas sobre o trabalho: o que correu bem, o que mudámos e porquê.' })}
<section class="wrap diary" aria-label="Entradas do diário">
  ${first ? `<a class="diary__lead" href="/diario/${esc(first.slug)}"><span class="ds__meta">${esc(first.tag)} · <time datetime="${first.publishedAt}">${dateLong(first.publishedAt)}</time> · ${esc(first.author)}</span><span class="diary__lead-title">${esc(first.title)}</span><span class="ds__ex">${esc(first.excerpt)}</span><span class="link">Ler ${arrow}</span></a>` : '<p class="empty">Ainda não há entradas.</p>'}
  <ul class="diary__list">${rest
    .map((e) => `<li><a href="/diario/${esc(e.slug)}"><time datetime="${e.publishedAt}">${dateShort(e.publishedAt)}</time><span class="diary__tag">${esc(e.tag)}</span><span class="diary__title">${esc(e.title)}</span><span class="ds__ex">${esc(e.excerpt)}</span></a></li>`)
    .join('')}</ul>
</section>`;
}

export function entryBody({ entry: e, others }) {
  return `<article class="wrap entry">
  <header class="entry__head">
    <nav class="crumbs" aria-label="Caminho"><a href="/">Início</a><span aria-hidden="true">/</span><a href="/diario">Diário</a><span aria-hidden="true">/</span><span aria-current="page">${esc(e.tag)}</span></nav>
    <p class="ds__meta">${esc(e.tag)} · <time datetime="${e.publishedAt}">${dateLong(e.publishedAt)}</time></p>
    <h1 class="display">${esc(e.title)}</h1>
    <p class="entry__ex">${esc(e.excerpt)}</p>
    <p class="entry__by">Escrito por <b>${esc(e.author)}</b></p>
  </header>
  <div class="prose entry__body">${paragraphs(e.body)}</div>
</article>
${others.length ? `<aside class="wrap entry__more" aria-labelledby="mais"><h2 id="mais" class="kicker">Mais do diário</h2><ul class="diary-strip">${others.map((o) => `<li><a href="/diario/${esc(o.slug)}"><span class="ds__meta">${esc(o.tag)} · <time datetime="${o.publishedAt}">${dateShort(o.publishedAt)}</time></span><span class="ds__title">${esc(o.title)}</span><span class="ds__ex">${esc(o.excerpt)}</span></a></li>`).join('')}</ul></aside>` : ''}`;
}
