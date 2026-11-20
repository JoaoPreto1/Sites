import { esc } from '../html.js';

export const loginBody = () => `<section class="sheet access" aria-labelledby="page-title">
  <div class="sheet__frame" aria-hidden="true"></div>
  <div class="wrap access__grid">
    <div>
      <p class="crumb"><a href="/">início</a> / <b>área de cliente</b></p>
      <h1 id="page-title" class="display">A sua casa, <em>folha a folha</em>.</h1>
      <p class="page-head__lead">Na área de cliente acompanha as fases do projeto, as reuniões marcadas, os desenhos entregues e as mensagens com a arquiteta.</p>
      <p class="demo">Para experimentar:<br>cliente <b>ana@exemplo.pt</b> · <b>cliente2026</b><br>arquiteta <b>leonor@leonorcastelo.pt</b> · <b>planta2026</b></p>
    </div>
    <div class="access__card" data-access>
      <div class="tabs" role="tablist" aria-label="Entrar ou criar conta">
        <button type="button" role="tab" id="tab-login" aria-controls="panel-login" aria-selected="true" data-tab="login">Entrar</button>
        <button type="button" role="tab" id="tab-register" aria-controls="panel-register" aria-selected="false" tabindex="-1" data-tab="register">Criar conta</button>
      </div>
      <div id="panel-login" role="tabpanel" aria-labelledby="tab-login"><form class="stack" data-form="login" novalidate>
        <div class="field"><label for="l-email">Email</label><input class="input" id="l-email" name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="l-pass">Palavra-passe</label><input class="input" id="l-pass" name="password" type="password" autocomplete="current-password" required></div>
        <button class="btn" type="submit">Entrar</button>
      </form></div>
      <div id="panel-register" role="tabpanel" aria-labelledby="tab-register" hidden><form class="stack" data-form="register" novalidate>
        <div class="field"><label for="r-name">Nome</label><input class="input" id="r-name" name="name" autocomplete="name" required></div>
        <div class="field"><label for="r-email">Email</label><input class="input" id="r-email" name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="r-phone">Telefone <small>(opcional)</small></label><input class="input" id="r-phone" name="phone" type="tel" autocomplete="tel"></div>
        <div class="field"><label for="r-pass">Palavra-passe</label><input class="input" id="r-pass" name="password" type="password" autocomplete="new-password" minlength="8" required></div>
        <button class="btn" type="submit">Criar conta</button>
      </form></div>
    </div>
  </div>
</section>`;

export const workBody = () => `<section class="sheet page-head page-head--slim" aria-labelledby="page-title">
  <div class="sheet__frame" aria-hidden="true"></div>
  <div class="wrap">
    <p class="crumb"><a href="/">início</a> / <b>a minha obra</b></p>
    <div class="page-head__row">
      <h1 id="page-title" class="display" data-work-title>A minha <em>obra</em></h1>
      <div class="who"><span data-user-name></span><button class="link" type="button" data-logout>Sair</button></div>
    </div>
    <p class="page-head__lead" data-work-summary></p>
  </div>
</section>
<section class="wrap work" data-work aria-busy="true">
  <p class="loading">A abrir o caderno de obra…</p>
</section>`;

export const panelBody = () => `<section class="sheet page-head page-head--slim" aria-labelledby="page-title">
  <div class="sheet__frame" aria-hidden="true"></div>
  <div class="wrap">
    <p class="crumb"><a href="/">início</a> / <b>painel</b></p>
    <div class="page-head__row">
      <h1 id="page-title" class="display">Mesa de <em>trabalho</em></h1>
      <div class="who"><span data-user-name></span><button class="link" type="button" data-logout>Sair</button></div>
    </div>
    <div class="summary" data-summary aria-live="polite"></div>
  </div>
</section>
<section class="wrap panel">
  <div class="tabs tabs--line" role="tablist" aria-label="Secções do painel">
    <button type="button" role="tab" aria-selected="true" aria-controls="tab-pedidos" id="t-pedidos" data-tab="pedidos">Pedidos</button>
    <button type="button" role="tab" aria-selected="false" aria-controls="tab-obras" id="t-obras" data-tab="obras" tabindex="-1">Obras</button>
    <button type="button" role="tab" aria-selected="false" aria-controls="tab-portfolio" id="t-portfolio" data-tab="portfolio" tabindex="-1">Portefólio</button>
  </div>
  <div role="tabpanel" id="tab-pedidos" aria-labelledby="t-pedidos" data-panel="pedidos"></div>
  <div role="tabpanel" id="tab-obras" aria-labelledby="t-obras" data-panel="obras" hidden></div>
  <div role="tabpanel" id="tab-portfolio" aria-labelledby="t-portfolio" data-panel="portfolio" hidden></div>
</section>`;

export const notFoundBody = (path) => `<section class="sheet lost" aria-labelledby="page-title">
  <div class="sheet__frame" aria-hidden="true"></div>
  <div class="wrap lost__grid">
    <div>
      <p class="kicker">Erro 404 · folha em falta</p>
      <h1 id="page-title" class="display">Esta divisão <em>não está</em> na planta.</h1>
      <p class="page-head__lead">Não encontrámos <code>${esc(path)}</code>. Pode ter mudado de nome ou nunca ter sido desenhada.</p>
      <div class="hero__actions"><a class="btn" href="/">Voltar à planta</a><a class="link" href="/projetos">Ver os projetos</a></div>
    </div>
    <svg class="lost__plan" viewBox="0 0 400 300" aria-hidden="true"><path d="M20 20H380V280H20Z"/><path d="M200 20V120M200 190V280M20 150H120"/><path class="lost__hole" d="M230 60h110v120h-110z"/><text x="246" y="128">?</text></svg>
  </div>
</section>`;
