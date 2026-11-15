// Páginas com dados da conta: o servidor só desenha a estrutura, o resto vem da API
import { icons } from '../../../public/js/shared/icons.js';
import { disc } from '../layout.js';

const head = (kicker, title, extra = '') => `
  <header class="page-head private-head">
    <div><p class="kicker">${kicker}</p><h1 class="display">${title}</h1></div>
    ${extra}
  </header>`;

export const bagView = () => `
  <section class="bag wrap" data-bag>
    ${head('O teu saco', 'Saco')}
    <div class="bag__grid">
      <div class="bag__lines" data-lines><p class="empty">A abrir o saco…</p></div>
      <aside class="ticket" data-ticket hidden>
        <p class="ticket__head mono"><span>Rotação</span><span>Rua dos Anjos 58</span></p>
        <dl class="ticket__totals" data-totals></dl>
        <form class="checkout" data-checkout novalidate>
          <fieldset class="checkout__method">
            <legend class="mono">Como queres receber</legend>
            <label><input type="radio" name="method" value="envio" checked><span><b>Enviar para casa</b><small>48 h, embalado entre cartões</small></span></label>
            <label><input type="radio" name="method" value="loja"><span><b>Levantar na loja</b><small>no dia seguinte, sem custos</small></span></label>
          </fieldset>
          <div class="checkout__address" data-address>
            <label class="field"><span>Morada</span><input class="input" name="address" autocomplete="street-address"></label>
            <div class="checkout__row">
              <label class="field"><span>Código postal</span><input class="input" name="postalCode" placeholder="0000-000" autocomplete="postal-code" inputmode="numeric"></label>
              <label class="field"><span>Localidade</span><input class="input" name="city" autocomplete="address-level2"></label>
            </div>
          </div>
          <label class="field"><span>Notas (opcional)</span><textarea class="input" name="notes" rows="2" maxlength="300" placeholder="É para oferta, toquem à campainha do 2.º…"></textarea></label>
          <p class="form-error" data-checkout-error hidden></p>
          <button class="btn checkout__submit" type="submit" data-checkout-submit>Encomendar</button>
          <p class="checkout__note">Pagamento por MB WAY quando confirmarmos (simulado nesta versão).</p>
        </form>
      </aside>
    </div>
    <div class="done" data-done hidden></div>
  </section>`;

export const loginView = () => `
  <section class="door wrap">
    ${head('Conta Rotação', 'Entra, <em>a loja é tua.</em>')}
    <div class="door__grid">
      <form class="door__form box" data-login novalidate>
        <h2>Já tenho conta</h2>
        <label class="field"><span>Email</span><input class="input" type="email" name="email" autocomplete="email" required></label>
        <label class="field"><span>Palavra-passe</span><input class="input" type="password" name="password" autocomplete="current-password" required></label>
        <p class="form-error" data-error hidden></p>
        <button class="btn" type="submit">Entrar</button>
        <div class="door__demo">
          <p class="mono">Contas de demonstração · palavra-passe rotacao1</p>
          <p><button type="button" data-demo="cliente@rotacao.pt">cliente@rotacao.pt</button><button type="button" data-demo="musico@rotacao.pt">musico@rotacao.pt</button><button type="button" data-demo="staff@rotacao.pt">staff@rotacao.pt</button><button type="button" data-demo="admin@rotacao.pt">admin@rotacao.pt</button></p>
        </div>
      </form>
      <div class="door__or" aria-hidden="true">${disc('door__disc')}</div>
      <form class="door__form box" data-register novalidate>
        <h2>Criar conta</h2>
        <label class="field"><span>Nome</span><input class="input" name="name" autocomplete="name" required></label>
        <label class="field"><span>Email</span><input class="input" type="email" name="email" autocomplete="email" required></label>
        <div class="door__row">
          <label class="field"><span>Telemóvel (opcional)</span><input class="input" type="tel" name="phone" autocomplete="tel"></label>
          <label class="field"><span>Banda (opcional)</span><input class="input" name="band" maxlength="60"></label>
        </div>
        <label class="field"><span>Palavra-passe</span><input class="input" type="password" name="password" autocomplete="new-password" minlength="8" required></label>
        <p class="form-error" data-error hidden></p>
        <button class="btn btn--yellow" type="submit">Criar conta</button>
        <p class="door__note">A banda aparece nas marcações das salas. Se não tens, deixa em branco.</p>
      </form>
    </div>
  </section>`;

export const accountView = () => `
  <section class="account wrap" data-account-page>
    ${head('A minha conta', '<span data-hello>Olá.</span>', '<button class="link" type="button" data-logout>Terminar sessão</button>')}
    <nav class="tabs" role="tablist" aria-label="Secções da conta">
      <button role="tab" type="button" data-tab="discoteca" aria-selected="true">A minha discoteca</button>
      <button role="tab" type="button" data-tab="encomendas" aria-selected="false">Encomendas</button>
      <button role="tab" type="button" data-tab="salas" aria-selected="false">Salas</button>
      <button role="tab" type="button" data-tab="procura" aria-selected="false">Procura</button>
      <button role="tab" type="button" data-tab="dados" aria-selected="false">Dados</button>
    </nav>
    <div class="panel" role="tabpanel" data-panel="discoteca">
      <div class="shelf-deck" data-shelf-deck hidden>
        <div class="deck deck--account" data-deck tabindex="0" role="application" aria-label="O teu gira-discos: setas para folhear, Enter para tocar">
          <div class="deck__tip" data-tip hidden></div>
          <p class="deck__busy mono" data-busy hidden>${disc('is-spinning')} A pousar o disco…</p>
        </div>
      </div>
      <div data-library><p class="empty">A carregar…</p></div>
    </div>
    <div class="panel" role="tabpanel" data-panel="encomendas" hidden></div>
    <div class="panel" role="tabpanel" data-panel="salas" hidden></div>
    <div class="panel" role="tabpanel" data-panel="procura" hidden></div>
    <div class="panel" role="tabpanel" data-panel="dados" hidden></div>
  </section>`;

export const adminView = () => `
  <section class="admin wrap" data-admin>
    ${head('Painel da loja', 'Painel', '<button class="link" type="button" data-logout>Terminar sessão</button>')}
    <nav class="tabs" role="tablist" aria-label="Secções do painel">
      <button role="tab" type="button" data-tab="resumo" aria-selected="true">Hoje</button>
      <button role="tab" type="button" data-tab="encomendas" aria-selected="false">Encomendas</button>
      <button role="tab" type="button" data-tab="discos" aria-selected="false">Discos e stock</button>
      <button role="tab" type="button" data-tab="salas" aria-selected="false">Salas</button>
      <button role="tab" type="button" data-tab="procura" aria-selected="false">Procura</button>
      <button role="tab" type="button" data-tab="avaliacoes" aria-selected="false">Avaliações</button>
    </nav>
    <div class="panel" role="tabpanel" data-panel="resumo"><p class="empty">A carregar…</p></div>
    <div class="panel" role="tabpanel" data-panel="encomendas" hidden></div>
    <div class="panel" role="tabpanel" data-panel="discos" hidden></div>
    <div class="panel" role="tabpanel" data-panel="salas" hidden></div>
    <div class="panel" role="tabpanel" data-panel="procura" hidden></div>
    <div class="panel" role="tabpanel" data-panel="avaliacoes" hidden></div>
  </section>`;

export { icons };
