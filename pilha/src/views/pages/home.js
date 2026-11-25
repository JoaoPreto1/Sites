import { SERVICES } from '../../config/site.js';
import { arrow, dateShort, esc, workCard } from '../html.js';

// Medidas de cada bloco no computador (em px). No telemóvel tudo encolhe com a variável --s.
const SIZES = {
  pill: { w: 360, h: 164, fs: 3.4 },
  square: { w: 250, h: 250, fs: 2.6 },
  circle: { w: 210, h: 210, fs: 1.9 },
  arch: { w: 300, h: 150, fs: 2.7 },
  tall: { w: 190, h: 250, fs: 1.8 },
  rect: { w: 250, h: 110, fs: 1.25 },
  rounded: { w: 120, h: 120, fs: 2.6 },
};

const NAMES = { movimento: 'Movi-<br>mento' };

export const PILE = [
  ...SERVICES.map((s) => ({ key: s.slug, shape: s.shape, color: s.color, label: NAMES[s.slug] ?? esc(s.name), plain: s.name, sub: s.sub, href: `/servicos/${s.slug}`, tip: `abrir ${s.name.toLowerCase()}` })),
  { key: 'fala', shape: 'rect', color: 'green', label: 'Fala connosco&nbsp;→', plain: 'Fala connosco', sub: '', href: '/contacto', tip: 'atirar um problema' },
  { key: 'ao-calhas', shape: 'rounded', color: 'white', label: '?', plain: 'Um trabalho ao calhas', sub: '', href: '/trabalhos/ao-calhas', tip: 'trabalho ao calhas' },
];

function block(b) {
  const { w, h, fs } = SIZES[b.shape];
  return `<li><a class="blk blk--${b.shape} blk--${b.color}" href="${b.href}" data-shape="${b.shape}" data-tip="${esc(b.tip)}" draggable="false" style="--w:${w};--h:${h};--fs:${fs}" aria-label="${esc(b.plain)}${b.sub ? ` (${esc(b.sub)})` : ''}"><b aria-hidden="true">${b.label}</b>${b.sub ? `<span aria-hidden="true">${esc(b.sub)}</span>` : ''}</a></li>`;
}

export function homeBody({ featured, onTable, entries }) {
  const table = onTable.length
    ? onTable.slice(0, 2).map((t) => `${esc(t.charAt(0).toUpperCase() + t.slice(1))}.`).join(' ')
    : 'A mesa está vazia. Atira-nos um problema.';

  return `<section class="stage" data-pile aria-labelledby="titulo">
  <div class="wrap hero">
    <h1 class="display hero__title" id="titulo">Atira-nos<br>um <em>problema.</em></h1>
    <p class="hero__lead">Estúdio de marcas e sites em Lisboa. Tudo o que fazemos está aí no chão: pega num bloco e ele abre o trabalho.</p>
    <p class="hint" aria-hidden="true"><i></i>arrasta, atira, empilha</p>
    <p class="sr-only">Cada bloco da pilha é um link para um serviço. Com o rato ou com o dedo, os blocos podem ser arrastados e atirados.</p>
  </div>
  <aside class="table-now" aria-label="Em que estamos a trabalhar"><b>Agora em cima da mesa</b>${table}</aside>
  <ul class="pile" aria-label="Serviços">${PILE.map(block).join('')}</ul>
  <button class="restack" type="button" data-restack hidden>Voltar a empilhar</button>
  <div class="floor" aria-hidden="true"></div>
  <p class="tip" aria-hidden="true" hidden></p>
</section>

<div class="ticker" aria-hidden="true"><div class="ticker__run">${Array.from({ length: 2 }, () => `<span>Marcas</span><i class="t-pill"></i><span>Sites e lojas</span><i class="t-square"></i><span>Movimento</span><i class="t-circle"></i><span>Rótulos</span><i class="t-arch"></i><span>Livros</span><i class="t-tall"></i>`).join('')}</div></div>

<section class="section home-work" aria-labelledby="trabalho-recente">
  <div class="wrap">
    <div class="section-head">
      <h2 class="display" id="trabalho-recente">Trabalho<br>recente</h2>
      <a class="link" href="/trabalhos">Ver todos os trabalhos ${arrow}</a>
    </div>
    <div class="cards">${featured.map((w) => workCard(w)).join('')}</div>
  </div>
</section>

<section class="section home-how" aria-labelledby="como">
  <div class="wrap how">
    <h2 class="display" id="como">Como se<br>pega num<br><em>problema</em></h2>
    <ol class="how__steps">
      <li><b>Atiras.</b> Contas-nos o problema no formulário, sem jargão. Respondemos em dois dias úteis.</li>
      <li><b>Pesamos.</b> Uma conversa de meia hora e uma proposta de três linhas: o que fazemos, quando e quanto.</li>
      <li><b>Empilhamos.</b> Esboços, provas e mensagens ficam na tua área de cliente. Aprovas com um clique.</li>
      <li><b>Entregamos.</b> Ficheiros finais, guia de uso e uma hora para tirar dúvidas.</li>
    </ol>
  </div>
</section>

<section class="section home-diary" aria-labelledby="diario-titulo">
  <div class="wrap">
    <div class="section-head">
      <h2 class="display" id="diario-titulo">Do diário</h2>
      <a class="link" href="/diario">Ler o diário ${arrow}</a>
    </div>
    <ul class="diary-strip">${entries
      .map(
        (e) => `<li><a href="/diario/${esc(e.slug)}"><span class="ds__meta">${esc(e.tag)} · <time datetime="${e.publishedAt}">${dateShort(e.publishedAt)}</time></span><span class="ds__title">${esc(e.title)}</span><span class="ds__ex">${esc(e.excerpt)}</span></a></li>`,
      )
      .join('')}</ul>
  </div>
</section>`;
}
