export const loginBody = () => `<section class="access wrap">
  <div class="access__intro">
    <p class="kicker">Área de cliente</p>
    <h1 class="display">Cartão de acesso.</h1>
    <p class="lead">Com uma conta, as reservas e os vouchers ficam guardados no seu dossier: muda o número de pessoas, cancela até 24 horas antes e vê os tempos de todas as fugas.</p>
    <p class="hint access__demo">Para experimentar: <b>cliente@fechadura.pt</b> ou <b>admin@fechadura.pt</b>, palavra-passe <b>fechadura123</b>.</p>
  </div>
  <div class="card-access paper" data-access>
    <span class="card-access__hole" aria-hidden="true"></span>
    <div class="card-access__tabs" role="tablist" aria-label="Entrar ou criar conta">
      <button type="button" role="tab" id="tab-login" aria-controls="panel-login" aria-selected="true" data-tab="login">Entrar</button>
      <button type="button" role="tab" id="tab-register" aria-controls="panel-register" aria-selected="false" data-tab="register" tabindex="-1">Criar conta</button>
    </div>
    <form id="panel-login" role="tabpanel" aria-labelledby="tab-login" class="card-access__form" data-form="login" novalidate>
      <div class="field"><label for="l-email">Email</label><input class="input" id="l-email" name="email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="l-pass">Palavra-passe</label><input class="input" id="l-pass" name="password" type="password" autocomplete="current-password" required></div>
      <button class="btn btn--ink" type="submit">Entrar</button>
    </form>
    <form id="panel-register" role="tabpanel" aria-labelledby="tab-register" class="card-access__form" data-form="register" novalidate hidden>
      <div class="field"><label for="r-name">Nome</label><input class="input" id="r-name" name="name" autocomplete="name" required maxlength="80"></div>
      <div class="field"><label for="r-email">Email</label><input class="input" id="r-email" name="email" type="email" autocomplete="email" required><span class="hint">Reservas e vouchers feitos antes com este email passam para a conta.</span></div>
      <div class="field"><label for="r-phone">Telemóvel <span class="hint">(opcional)</span></label><input class="input" id="r-phone" name="phone" type="tel" autocomplete="tel" maxlength="30"></div>
      <div class="field"><label for="r-pass">Palavra-passe</label><input class="input" id="r-pass" name="password" type="password" autocomplete="new-password" minlength="8" required><span class="hint">Pelo menos 8 caracteres.</span></div>
      <button class="btn btn--ink" type="submit">Criar conta</button>
    </form>
  </div>
</section>`;

export const accountBody = () => `<section class="page-head wrap">
  <p class="kicker" data-hello>O meu dossier</p>
  <h1 class="display">O meu dossier.</h1>
  <p class="lead">As vossas sessões, as fugas que já fizeram e os vouchers que ofereceram, tudo na mesma pasta.</p>
</section>
<section class="wrap mine" data-mine>
  <div class="mine__main">
    <section aria-labelledby="next-title">
      <h2 id="next-title" class="display mine__h">Próximas sessões</h2>
      <div class="mine__tickets" data-next><p class="hint">A abrir a pasta…</p></div>
    </section>
    <section aria-labelledby="past-title">
      <h2 id="past-title" class="display mine__h">Fugas</h2>
      <div data-past></div>
    </section>
    <section aria-labelledby="v-title">
      <h2 id="v-title" class="display mine__h">Vouchers</h2>
      <div class="mine__vouchers" data-vouchers></div>
    </section>
  </div>
  <aside class="mine__side">
    <form class="paper mine__profile" data-profile novalidate>
      <h2 class="display">Os meus dados</h2>
      <div class="field"><label for="p-name">Nome</label><input class="input" id="p-name" name="name" autocomplete="name" maxlength="80"></div>
      <div class="field"><label for="p-phone">Telemóvel</label><input class="input" id="p-phone" name="phone" type="tel" autocomplete="tel" maxlength="30"></div>
      <div class="field"><span class="label">Email</span><span data-email></span></div>
      <button class="btn btn--ink btn--small" type="submit">Guardar</button>
    </form>
    <div class="mine__links"><a class="btn btn--brass" href="/reservar">Reservar outra sala</a><button class="btn" type="button" data-logout>Sair da conta</button></div>
  </aside>
</section>`;

export const adminBody = () => `<section class="console wrap" data-console>
  <header class="console__head">
    <div>
      <p class="kicker">Consola do game master</p>
      <h1 class="display">Painel.</h1>
    </div>
    <div class="console__date">
      <button class="btn btn--small" type="button" data-day="-1" aria-label="Dia anterior">‹</button>
      <input class="input" type="date" data-date aria-label="Dia">
      <button class="btn btn--small" type="button" data-day="1" aria-label="Dia seguinte">›</button>
      <button class="btn btn--small" type="button" data-today>Hoje</button>
    </div>
  </header>
  <div class="console__board" data-board aria-live="polite"><p class="hint">A carregar o dia…</p></div>
  <p class="console__legend"><span class="lg lg--booked"></span>Reservada <span class="lg lg--played"></span>Jogada <span class="lg lg--blocked"></span>Bloqueada <span class="lg lg--free"></span>Livre (clique para bloquear)</p>

  <div class="console__tabs" role="tablist" aria-label="Listas">
    <button type="button" role="tab" aria-selected="true" data-list="confirmada">Próximas reservas</button>
    <button type="button" role="tab" aria-selected="false" data-list="jogada" tabindex="-1">Jogadas</button>
    <button type="button" role="tab" aria-selected="false" data-list="vouchers" tabindex="-1">Vouchers</button>
    <input class="input console__search" type="search" placeholder="Procurar código, nome ou equipa" data-search aria-label="Procurar">
  </div>
  <div class="console__list" data-list-box></div>

  <dialog class="console__dialog paper" data-dialog aria-labelledby="dlg-title">
    <form method="dialog" class="dlg" data-result novalidate>
      <h2 id="dlg-title" class="display" data-dlg-title>Sessão</h2>
      <p class="type" data-dlg-info></p>
      <fieldset class="dlg__result">
        <legend>Resultado</legend>
        <label class="check"><input type="radio" name="escaped" value="true" checked> Saíram a tempo</label>
        <label class="check"><input type="radio" name="escaped" value="false"> Não saíram</label>
        <div class="dlg__time">
          <div class="field"><label for="d-min">Minutos</label><input class="input" id="d-min" name="minutes" type="number" min="0" max="90" value="45"></div>
          <div class="field"><label for="d-sec">Segundos</label><input class="input" id="d-sec" name="seconds" type="number" min="0" max="59" value="0"></div>
          <div class="field"><label for="d-hints">Pistas</label><input class="input" id="d-hints" name="hints" type="number" min="0" max="10" value="0"></div>
        </div>
      </fieldset>
      <div class="dlg__actions">
        <button class="btn btn--ink" type="submit" value="save">Guardar no registo</button>
        <button class="btn btn--red btn--small" type="button" data-cancel-booking>Cancelar reserva</button>
        <button class="btn btn--small" type="button" data-close>Fechar</button>
      </div>
    </form>
  </dialog>
</section>`;
