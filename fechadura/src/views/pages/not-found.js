import { esc } from '../html.js';

export const notFoundBody = (path) => `<section class="nf section">
  <div class="wrap nf__grid">
    <div class="nf__door" aria-hidden="true"><span class="nf__hole"></span><span class="nf__plate type">${esc(path.slice(0, 28))}</span></div>
    <div>
      <p class="kicker">Erro 404</p>
      <h1 class="display nf__title">Esta porta está trancada.</h1>
      <p class="lead">A página que procura não existe, ou mudou de sítio. Não há pista que a abra, mas há outras portas.</p>
      <div class="nf__actions"><a class="btn btn--brass" href="/salas">Ver as salas</a><a class="btn" href="/">Voltar ao cadeado</a></div>
    </div>
  </div>
</section>`;
