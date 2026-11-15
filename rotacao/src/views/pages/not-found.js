import { disc } from '../layout.js';

export const notFoundView = () => `
  <section class="lost wrap">
    <div class="lost__disc">${disc('lost__vinyl')}</div>
    <p class="kicker">Erro 404 · a agulha saltou</p>
    <h1 class="display">Esta faixa<br><em>não existe.</em></h1>
    <p>Pode ter sido um disco que já foi para casa de alguém, ou um link mal copiado. Os caixotes continuam cheios.</p>
    <div class="lost__links"><a class="btn" href="/discos">Ir aos caixotes</a><a class="link" href="/">Voltar ao início</a></div>
  </section>`;
