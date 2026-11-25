import { SERVICES } from '../../config/site.js';
import { arrow, chip, esc, pageHead, paragraphs, picture, workCard } from '../html.js';

export function worksBody({ works, category, counts }) {
  const filters = [['', 'Tudo', counts.total], ...SERVICES.map((s) => [s.slug, s.name, counts[s.slug] ?? 0])];
  return `${pageHead({
    kicker: 'Trabalhos',
    title: category ? `${esc(SERVICES.find((s) => s.slug === category).name)}` : 'O que já<br><em>empilhámos</em>',
    lead: 'Projetos para clientes pequenos e teimosos: uma conserveira, um teatro de bairro, uma padaria, uma editora de poesia. Cada um começou com um problema concreto.',
  })}
<section class="wrap works" aria-label="Lista de trabalhos">
  <nav class="filters" aria-label="Filtrar por serviço">${filters
    .map(([slug, label, n]) => `<a class="filter filter--${slug || 'tudo'}" href="/trabalhos${slug ? `?tipo=${slug}` : ''}"${(category ?? '') === slug ? ' aria-current="page"' : ''}><i aria-hidden="true"></i>${label}<span>${n}</span></a>`)
    .join('')}</nav>
  ${works.length ? `<div class="cards">${works.map((w, i) => workCard(w, { eager: i < 2, level: 2 })).join('')}</div>` : '<p class="empty">Ainda não há trabalhos publicados neste bloco.</p>'}
</section>`;
}

export function workBody({ work: w, next, prev }) {
  return `<article class="work">
  <header class="wrap work__head">
    <nav class="crumbs" aria-label="Caminho"><a href="/">Início</a><span aria-hidden="true">/</span><a href="/trabalhos">Trabalhos</a><span aria-hidden="true">/</span><span aria-current="page">${esc(w.client)}</span></nav>
    <p class="work__chip">${chip(w.category, w.categoryLabel)}</p>
    <h1 class="display work__title">${esc(w.title)}</h1>
    <dl class="work__meta">
      <div><dt>Cliente</dt><dd>${esc(w.client)}</dd></div>
      <div><dt>Onde</dt><dd>${esc(w.place)}</dd></div>
      <div><dt>Ano</dt><dd>${w.year}</dd></div>
      <div><dt>Bloco</dt><dd><a href="/servicos/${esc(w.category)}">${esc(w.categoryLabel)}</a></dd></div>
    </dl>
  </header>
  <figure class="wrap work__cover work__cover--${esc(w.category)}">${picture(w.cover, { alt: `${w.client}: ${w.summary}`, eager: true, sizes: '(max-width: 1400px) 94vw, 1300px' })}</figure>
  <div class="wrap work__body">
    <p class="work__summary">${esc(w.summary)}</p>
    <div class="prose">${paragraphs(w.body)}</div>
  </div>
  ${w.images.length ? `<div class="wrap work__gallery">${w.images.map((src, i) => `<figure class="work__shot work__shot--${i}">${picture(src, { alt: `${w.client}: pormenor ${i + 1}`, sizes: '(max-width: 800px) 94vw, 46vw' })}</figure>`).join('')}</div>` : ''}
  <nav class="wrap work__next" aria-label="Outros trabalhos">
    <a class="next-blk next-blk--prev" href="/trabalhos/${esc(prev.slug)}" rel="prev"><span>Anterior</span><b>${esc(prev.client)}</b></a>
    <a class="next-blk next-blk--${esc(next.category)}" href="/trabalhos/${esc(next.slug)}" rel="next"><span>Próximo trabalho</span><b>${esc(next.client)}</b>${arrow}</a>
  </nav>
</article>`;
}
