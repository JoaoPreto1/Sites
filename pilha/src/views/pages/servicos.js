import { PHASES, SERVICES } from '../../config/site.js';
import { arrow, esc, pageHead, workCard } from '../html.js';

const label = (s) => (s.slug === 'movimento' ? 'Movi-<br>mento' : esc(s.name));
const shape = (s, size = '') => `<div class="svc-blk svc-blk--${s.shape} svc-blk--${s.color} ${size}" aria-hidden="true"><b>${label(s)}</b><span>${esc(s.sub)}</span></div>`;

export function servicesBody({ counts }) {
  return `${pageHead({
    kicker: 'Serviços',
    title: 'Cinco<br>blocos, <em>uma</em><br>pilha',
    lead: 'Fazemos poucas coisas e fazemo-las do princípio ao fim. Muitas vezes os projetos juntam dois blocos: uma marca e o site, um rótulo e o vídeo.',
  })}
<section class="wrap svc-list" aria-label="Serviços">
  ${SERVICES.map(
    (s, i) => `<article class="svc svc--${i % 2 ? 'r' : 'l'}" id="${s.slug}">
    <a class="svc__shape" href="/servicos/${s.slug}" tabindex="-1" aria-hidden="true">${shape(s)}</a>
    <div class="svc__txt">
      <h2 class="display"><a href="/servicos/${s.slug}">${esc(s.name)}</a></h2>
      <p class="svc__lead">${esc(s.lead)}</p>
      <ul class="svc__inc">${s.includes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <p class="svc__facts"><span><b>Prazo</b>${esc(s.duration)}</span><span><b>Ordem de grandeza</b>${esc(s.from)}</span><span><b>Trabalhos</b>${counts[s.slug] ?? 0} publicados</span></p>
      <a class="link" href="/servicos/${s.slug}">Ver ${esc(s.name.toLowerCase())} ${arrow}</a>
    </div>
  </article>`,
  ).join('')}
  <p class="svc-note">Os valores são indicativos e servem para começar a conversa. Cada proposta é feita depois de percebermos o problema.</p>
</section>`;
}

export function serviceBody({ service: s, works }) {
  return `<header class="wrap svc-head">
    <div>
      <nav class="crumbs" aria-label="Caminho"><a href="/">Início</a><span aria-hidden="true">/</span><a href="/servicos">Serviços</a><span aria-hidden="true">/</span><span aria-current="page">${esc(s.name)}</span></nav>
      <h1 class="display">${esc(s.name)}<span class="svc-head__sub">${esc(s.sub)}</span></h1>
      <p class="lead">${esc(s.lead)}</p>
      <p class="svc-head__acts"><a class="btn btn--ink" href="/contacto?bloco=${s.slug}">Pedir ${esc(s.name.toLowerCase())} ${arrow}</a></p>
    </div>
    ${shape(s, 'svc-blk--big')}
  </header>
  <section class="wrap svc-detail" aria-label="O que inclui">
    <div class="svc-box"><h2>O que inclui</h2><ul class="svc__inc">${s.includes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="svc-box svc-box--facts"><h2>Contas por alto</h2><dl><div><dt>Prazo habitual</dt><dd>${esc(s.duration)}</dd></div><div><dt>Ordem de grandeza</dt><dd>${esc(s.from)}</dd></div><div><dt>Fases</dt><dd>${PHASES.map((p) => esc(p.label)).join(' → ')}</dd></div></dl></div>
  </section>
  <section class="section wrap" aria-labelledby="feitos">
    <div class="section-head"><h2 class="display" id="feitos">${esc(s.name)} que<br>já fizemos</h2><a class="link" href="/trabalhos?tipo=${s.slug}">Todos os trabalhos de ${esc(s.name.toLowerCase())} ${arrow}</a></div>
    ${works.length ? `<div class="cards">${works.map((w) => workCard(w)).join('')}</div>` : '<p class="empty">Ainda não publicámos trabalhos deste bloco.</p>'}
  </section>
  <nav class="wrap other-svc" aria-label="Outros serviços">${SERVICES.filter((x) => x.slug !== s.slug)
    .map((x) => `<a class="svc-blk svc-blk--${x.shape} svc-blk--${x.color} svc-blk--mini" href="/servicos/${x.slug}"><b>${label(x)}</b></a>`)
    .join('')}</nav>`;
}
