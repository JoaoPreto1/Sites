export function loginBody() {
  return `<section class="wrap login">
  <div class="login__art" aria-hidden="true">
    <span class="lb lb--pill">Provas</span><span class="lb lb--square">Mensa-<br>gens</span><span class="lb lb--circle">Fases</span><span class="lb lb--arch">Pedidos</span>
  </div>
  <div class="login__box">
    <p class="kicker">Área privada</p>
    <h1 class="display">Entrar</h1>
    <p class="lead">Clientes acompanham o projeto, aprovam provas e falam connosco. A equipa entra no painel do estúdio.</p>
    <form class="login__form" id="login" novalidate>
      <div class="notice notice--error" role="alert" id="login-error" tabindex="-1" hidden></div>
      <div class="field"><label for="l-email">Email</label><input class="input" id="l-email" name="email" type="email" autocomplete="username" required aria-describedby="l-email-err"><p class="error-text" id="l-email-err" data-error="email"></p></div>
      <div class="field"><label for="l-pass">Palavra-passe</label><input class="input" id="l-pass" name="password" type="password" autocomplete="current-password" required aria-describedby="l-pass-err"><p class="error-text" id="l-pass-err" data-error="password"></p></div>
      <button class="btn btn--ink" type="submit">Entrar</button>
    </form>
    <details class="demo">
      <summary>Contas de demonstração</summary>
      <p>Cliente: <code>teatro@cliente.exemplo</code> ou <code>lota@cliente.exemplo</code>, palavra-passe <code>pilha-cliente-2026</code>.</p>
      <p>Estúdio: <code>ines@pilha.exemplo</code>, palavra-passe <code>pilha-estudio-2026</code>.</p>
    </details>
  </div>
</section>`;
}

export function clientBody() {
  return `<section class="wrap area" aria-busy="true">
  <header class="area__head">
    <div><p class="kicker">Área de cliente</p><h1 class="display" id="area-title">Olá</h1></div>
    <button class="btn btn--sm" type="button" data-logout>Sair</button>
  </header>
  <nav class="area__tabs" id="project-tabs" aria-label="Os seus projetos"></nav>
  <div id="project" class="area__body"><p class="loading">A carregar o projeto…</p></div>
  <p class="sr-only" aria-live="polite" id="live"></p>
</section>`;
}

export function panelBody() {
  return `<section class="wrap area panel" aria-busy="true">
  <header class="area__head">
    <div><p class="kicker">Painel do estúdio</p><h1 class="display" id="area-title">A mesa</h1></div>
    <button class="btn btn--sm" type="button" data-logout>Sair</button>
  </header>
  <div class="ptabs" role="tablist" aria-label="Secções do painel">
    <button role="tab" id="tab-pedidos" aria-controls="sec-pedidos" aria-selected="true" class="ptab ptab--red" data-tab="pedidos">Pedidos <span data-count="pedidos"></span></button>
    <button role="tab" id="tab-projetos" aria-controls="sec-projetos" aria-selected="false" tabindex="-1" class="ptab ptab--blue" data-tab="projetos">Projetos <span data-count="projetos"></span></button>
    <button role="tab" id="tab-trabalhos" aria-controls="sec-trabalhos" aria-selected="false" tabindex="-1" class="ptab ptab--yellow" data-tab="trabalhos">Trabalhos <span data-count="trabalhos"></span></button>
    <button role="tab" id="tab-diario" aria-controls="sec-diario" aria-selected="false" tabindex="-1" class="ptab ptab--pink" data-tab="diario">Diário <span data-count="diario"></span></button>
  </div>
  <div role="tabpanel" id="sec-pedidos" aria-labelledby="tab-pedidos" class="psec"></div>
  <div role="tabpanel" id="sec-projetos" aria-labelledby="tab-projetos" class="psec" hidden></div>
  <div role="tabpanel" id="sec-trabalhos" aria-labelledby="tab-trabalhos" class="psec" hidden></div>
  <div role="tabpanel" id="sec-diario" aria-labelledby="tab-diario" class="psec" hidden></div>
  <p class="sr-only" aria-live="polite" id="live"></p>
</section>`;
}
