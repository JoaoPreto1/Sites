// Páginas com dados da conta: o servidor só desenha a estrutura, o resto vem da API

export const cartView = () => `
  <section class="cart wrap" data-cart>
    <header class="private-head">
      <p class="kicker mono"><span>O seu cesto</span></p>
      <h1 class="title-xl">Cesto</h1>
    </header>
    <div class="cart__grid">
      <div class="cart__lines" data-lines><p class="empty">A abrir o cesto…</p></div>
      <aside class="receipt" data-receipt hidden>
        <p class="receipt__head mono">Cepa · Rua de Cedofeita 212 · Porto</p>
        <dl class="receipt__totals" data-totals></dl>
        <form class="checkout" data-checkout novalidate>
          <fieldset class="checkout__method">
            <legend class="mono">Entrega</legend>
            <label><input type="radio" name="method" value="envio" checked> <span>Enviar para casa <small>24 a 48 h</small></span></label>
            <label><input type="radio" name="method" value="loja"> <span>Levantar na loja <small>no dia seguinte, grátis</small></span></label>
          </fieldset>
          <div class="checkout__address" data-address>
            <label class="field"><span>Morada</span><input class="input" name="address" autocomplete="street-address"></label>
            <div class="checkout__row">
              <label class="field"><span>Código postal</span><input class="input" name="postalCode" placeholder="0000-000" autocomplete="postal-code" inputmode="numeric"></label>
              <label class="field"><span>Localidade</span><input class="input" name="city" autocomplete="address-level2"></label>
            </div>
          </div>
          <label class="field"><span>Notas para nós</span><textarea class="input" name="notes" rows="2" maxlength="300" placeholder="É para oferta, toquem à campainha do 2.º…"></textarea></label>
          <label class="check"><input type="checkbox" name="confirmAge"> <span>Confirmo que tenho 18 anos ou mais.</span></label>
          <p class="form-error" data-checkout-error hidden></p>
          <button class="btn btn--wine checkout__submit" type="submit" data-checkout-submit>Encomendar</button>
          <p class="checkout__note">Pagamento na entrega ou por MB WAY quando confirmarmos a encomenda.</p>
        </form>
      </aside>
    </div>
    <div class="done" data-done hidden></div>
  </section>`;

export const loginView = () => `
  <section class="door wrap">
    <header class="private-head">
      <p class="kicker mono"><span>Conta Cepa</span></p>
      <h1 class="title-xl">Entre, <em>a casa é sua.</em></h1>
    </header>
    <div class="door__grid">
      <form class="door__form" data-login novalidate>
        <h2>Já tenho conta</h2>
        <label class="field"><span>Email</span><input class="input" type="email" name="email" autocomplete="email" required></label>
        <label class="field"><span>Palavra-passe</span><input class="input" type="password" name="password" autocomplete="current-password" required></label>
        <p class="form-error" data-error hidden></p>
        <button class="btn" type="submit">Entrar</button>
        <div class="door__demo">
          <p class="mono">Contas de demonstração · palavra-passe cepa1234</p>
          <p><button type="button" data-demo="cliente@cepa.pt">cliente@cepa.pt</button> <button type="button" data-demo="socio@cepa.pt">socio@cepa.pt</button> <button type="button" data-demo="admin@cepa.pt">admin@cepa.pt</button></p>
        </div>
      </form>
      <p class="door__or" aria-hidden="true">ou</p>
      <form class="door__form" data-register novalidate>
        <h2>Criar conta</h2>
        <label class="field"><span>Nome</span><input class="input" name="name" autocomplete="name" required></label>
        <label class="field"><span>Email</span><input class="input" type="email" name="email" autocomplete="email" required></label>
        <div class="door__row">
          <label class="field"><span>Data de nascimento</span><input class="input" type="date" name="birthDate" autocomplete="bday" required></label>
          <label class="field"><span>Telemóvel</span><input class="input" type="tel" name="phone" autocomplete="tel"></label>
        </div>
        <label class="field"><span>Palavra-passe</span><input class="input" type="password" name="password" autocomplete="new-password" minlength="8" required></label>
        <p class="form-error" data-error hidden></p>
        <button class="btn btn--wine" type="submit">Criar conta</button>
        <p class="door__note">Só vendemos vinho a maiores de 18 anos, por isso pedimos a data de nascimento.</p>
      </form>
    </div>
  </section>`;

export const accountView = () => `
  <section class="account wrap" data-account-page>
    <header class="private-head account__head">
      <div>
        <p class="kicker mono"><span>A minha conta</span></p>
        <h1 class="title-xl" data-hello>Olá.</h1>
      </div>
      <button class="link" type="button" data-logout>Terminar sessão</button>
    </header>
    <nav class="tabs" role="tablist" aria-label="Secções da conta">
      <button role="tab" type="button" data-tab="encomendas" aria-selected="true">Encomendas</button>
      <button role="tab" type="button" data-tab="clube" aria-selected="false">Clube</button>
      <button role="tab" type="button" data-tab="provas" aria-selected="false">Provas</button>
      <button role="tab" type="button" data-tab="dados" aria-selected="false">Dados</button>
    </nav>
    <div class="panel" role="tabpanel" data-panel="encomendas"><p class="empty">A carregar…</p></div>
    <div class="panel" role="tabpanel" data-panel="clube" hidden></div>
    <div class="panel" role="tabpanel" data-panel="provas" hidden></div>
    <div class="panel" role="tabpanel" data-panel="dados" hidden></div>
  </section>`;

export const adminView = () => `
  <section class="admin wrap" data-admin>
    <header class="private-head account__head">
      <div>
        <p class="kicker mono"><span>Painel da garrafeira</span></p>
        <h1 class="title-xl">Painel</h1>
      </div>
      <button class="link" type="button" data-logout>Terminar sessão</button>
    </header>
    <nav class="tabs" role="tablist" aria-label="Secções do painel">
      <button role="tab" type="button" data-tab="resumo" aria-selected="true">Resumo</button>
      <button role="tab" type="button" data-tab="encomendas" aria-selected="false">Encomendas</button>
      <button role="tab" type="button" data-tab="vinhos" aria-selected="false">Vinhos e stock</button>
      <button role="tab" type="button" data-tab="provas" aria-selected="false">Provas</button>
      <button role="tab" type="button" data-tab="socios" aria-selected="false">Sócios</button>
    </nav>
    <div class="panel" role="tabpanel" data-panel="resumo"><p class="empty">A carregar…</p></div>
    <div class="panel" role="tabpanel" data-panel="encomendas" hidden></div>
    <div class="panel" role="tabpanel" data-panel="vinhos" hidden></div>
    <div class="panel" role="tabpanel" data-panel="provas" hidden></div>
    <div class="panel" role="tabpanel" data-panel="socios" hidden></div>
  </section>`;
