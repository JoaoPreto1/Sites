import { BUDGETS, SERVICES, SITE } from '../../config/site.js';
import { esc } from '../html.js';

const LABEL = { movimento: 'Movi-<br>mento' };

export function contactBody({ preselect }) {
  return `<section class="wrap contact">
  <header class="contact__head">
    <p class="kicker">Contacto</p>
    <h1 class="display">Atira-nos<br>um <em>problema.</em></h1>
    <p class="lead">Conta-nos o que se passa, sem jargão. Respondemos em dois dias úteis, por email, com perguntas ou com uma proposta.</p>
    <dl class="contact__facts">
      <div><dt>Email</dt><dd><a href="mailto:${SITE.email}">${SITE.email}</a></dd></div>
      <div><dt>Estúdio</dt><dd>${SITE.area}</dd></div>
      <div><dt>Horário</dt><dd>${SITE.hours}</dd></div>
    </dl>
  </header>

  <form class="brief" id="briefing" novalidate>
    <div class="notice notice--error" role="alert" id="brief-error" tabindex="-1" hidden></div>

    <fieldset class="brief__step">
      <legend><span class="brief__n">1</span>Que blocos precisas?</legend>
      <p class="hint" id="services-hint">Escolhe um ou mais. Se não sabes, escolhe o “?” e nós ajudamos.</p>
      <div class="pick" aria-describedby="services-hint">${SERVICES.map(
        (s) => `<label class="pick__item pick__item--${s.shape} pick__item--${s.color}"><input type="checkbox" name="services" value="${s.slug}"${preselect === s.slug ? ' checked' : ''}><span aria-hidden="true">${LABEL[s.slug] ?? esc(s.name)}</span><b class="sr-only">${esc(s.name)}</b></label>`,
      ).join('')}<label class="pick__item pick__item--rounded pick__item--white"><input type="checkbox" name="unsure" value="1"><span aria-hidden="true">?</span><b class="sr-only">Ainda não sei</b></label></div>
      <p class="error-text" data-error="services"></p>
    </fieldset>

    <fieldset class="brief__step">
      <legend><span class="brief__n">2</span>O problema</legend>
      <div class="field">
        <label for="b-message">O que se passa e o que gostavas que mudasse?</label>
        <textarea class="textarea" id="b-message" name="message" maxlength="3000" required aria-describedby="b-message-hint b-message-err"></textarea>
        <p class="hint" id="b-message-hint">Pelo menos 20 caracteres. Uma frase sobre o negócio ajuda muito.</p>
        <p class="error-text" id="b-message-err" data-error="message"></p>
      </div>
      <div class="brief__row">
        <fieldset class="field">
          <legend class="label">Orçamento aproximado</legend>
          <div class="chips">${BUDGETS.map(([k, l], i) => `<label class="chip-radio"><input type="radio" name="budget" value="${k}"${i === 4 ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div>
          <p class="error-text" data-error="budget"></p>
        </fieldset>
        <div class="field">
          <label for="b-deadline">Para quando? <span class="hint">(opcional)</span></label>
          <input class="input" type="date" id="b-deadline" name="deadline">
          <p class="error-text" data-error="deadline"></p>
        </div>
      </div>
    </fieldset>

    <fieldset class="brief__step">
      <legend><span class="brief__n">3</span>Quem és</legend>
      <div class="brief__row">
        <div class="field"><label for="b-name">Nome</label><input class="input" id="b-name" name="name" autocomplete="name" maxlength="80" required aria-describedby="b-name-err"><p class="error-text" id="b-name-err" data-error="name"></p></div>
        <div class="field"><label for="b-email">Email</label><input class="input" id="b-email" name="email" type="email" autocomplete="email" maxlength="120" required aria-describedby="b-email-err"><p class="error-text" id="b-email-err" data-error="email"></p></div>
        <div class="field"><label for="b-company">Empresa ou projeto <span class="hint">(opcional)</span></label><input class="input" id="b-company" name="company" autocomplete="organization" maxlength="80"></div>
      </div>
      <div class="hp" aria-hidden="true"><label for="b-website">Não preencher</label><input id="b-website" name="website" tabindex="-1" autocomplete="off"></div>
      <label class="check"><input type="checkbox" name="consent" value="true" required><span>Autorizo a Pilha a guardar estes dados para responder a este pedido. São apagados ao fim de um ano se não trabalharmos juntos.</span></label>
      <p class="error-text" data-error="consent"></p>
    </fieldset>

    <button class="btn btn--ink brief__send" type="submit">Atirar o problema</button>
  </form>

  <div class="brief-done" id="brief-done" tabindex="-1" hidden>
    <div class="brief-done__blk" aria-hidden="true">✓</div>
    <h2 class="display">Apanhado!</h2>
    <p>O teu pedido ficou com a referência <b id="brief-ref"></b>. Respondemos em dois dias úteis para o email que nos deste.</p>
    <p><a class="btn" href="/trabalhos">Ver trabalhos enquanto esperas</a></p>
  </div>
</section>`;
}
