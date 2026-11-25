import { REQUEST_KINDS } from '../../config/site.js';
import { esc } from '../html.js';

const campo = (name, label, type = 'text', attrs = '') => `<label class="campo"><span>${label}</span><input name="${name}" type="${type}" ${attrs}></label><p class="campo__erro" data-error="${name}"></p>`;

export function loginBody() {
  return `<section class="porta"><div class="cx porta__g">
  <div class="porta__t">
    <p class="rot">A sua reserva</p>
    <h1>Entrar</h1>
    <p>Para ver a reserva, mudar a hora de chegada e pedir bicicletas, lancheiras ou uma mesa para jantar.</p>
    <form class="form" id="login" novalidate>
      <p class="form-erro" id="login-erro" role="alert" tabindex="-1" hidden></p>
      ${campo('email', 'Email', 'email', 'autocomplete="email" required')}
      ${campo('password', 'Palavra-passe', 'password', 'autocomplete="current-password" required')}
      <button class="btn btn--verde" type="submit">Entrar</button>
    </form>
    <p class="porta__alt">Ainda não tem conta? <a class="lnk" href="/criar-conta" data-manter-next>Criar conta</a></p>
    <details class="demo"><summary>Contas de demonstração</summary><p>Hóspede: hospede@arriba.exemplo · arriba-hospede-2026<br>Receção: rececao@arriba.exemplo · arriba-rececao-2026</p></details>
  </div>
  <div class="porta__chave" aria-hidden="true"><img src="/img/chave.webp" width="600" height="900" alt="" decoding="async"></div>
</div></section>`;
}

export function registerBody() {
  return `<section class="porta"><div class="cx porta__g">
  <div class="porta__t">
    <p class="rot">Nova conta</p>
    <h1>Criar conta</h1>
    <p>Só pedimos o necessário para a receção o reconhecer à chegada.</p>
    <form class="form" id="registo" novalidate>
      <p class="form-erro" id="registo-erro" role="alert" tabindex="-1" hidden></p>
      ${campo('name', 'Nome', 'text', 'autocomplete="name" required maxlength="80"')}
      ${campo('email', 'Email', 'email', 'autocomplete="email" required')}
      ${campo('phone', 'Telemóvel <small>(opcional)</small>', 'tel', 'autocomplete="tel" maxlength="18"')}
      ${campo('password', 'Palavra-passe <small>(10 caracteres ou mais)</small>', 'password', 'autocomplete="new-password" required minlength="10"')}
      <div class="isca" aria-hidden="true"><label>Não preencher <input name="website" tabindex="-1" autocomplete="off"></label></div>
      <button class="btn btn--verde" type="submit">Criar conta</button>
    </form>
    <p class="porta__alt">Já tem conta? <a class="lnk" href="/entrar" data-manter-next>Entrar</a></p>
  </div>
  <div class="porta__chave" aria-hidden="true"><img src="/img/chave.webp" width="600" height="900" alt="" decoding="async"></div>
</div></section>`;
}

export function guestBody() {
  return `<section class="area"><div class="cx">
  <div class="area__cab"><div><p class="rot">A minha área</p><h1 data-ola>As suas reservas</h1></div><button class="btn btn--linha" type="button" data-sair>Sair</button></div>
  <div data-reservas aria-busy="true"><p class="vazio">A carregar…</p></div>
  <template id="t-pedido"><form class="pedido" novalidate>
    <h4 class="h4">Fazer um pedido</h4>
    <label class="campo"><span>O quê</span><select name="kind">${REQUEST_KINDS.map(([k, l]) => `<option value="${k}">${esc(l)}</option>`).join('')}</select></label>
    <label class="campo"><span>Para que dia</span><input type="date" name="date" required></label>
    <p class="campo__erro" data-error="date"></p>
    <label class="campo"><span>Detalhes <small>(opcional)</small></span><input name="notes" maxlength="500"></label>
    <button class="btn btn--verde" type="submit">Pedir</button>
  </form></template>
</div></section>`;
}

export function deskBody() {
  return `<section class="area area--rececao"><div class="cx">
  <div class="area__cab"><div><p class="rot">Painel da receção</p><h1 data-dia>Hoje</h1></div><button class="btn btn--linha" type="button" data-sair>Sair</button></div>
  <div class="abas" role="tablist" aria-label="Secções do painel">
    <button role="tab" id="aba-hoje" aria-controls="p-hoje" aria-selected="true" type="button">Hoje</button>
    <button role="tab" id="aba-reservas" aria-controls="p-reservas" aria-selected="false" tabindex="-1" type="button">Reservas</button>
    <button role="tab" id="aba-pedidos" aria-controls="p-pedidos" aria-selected="false" tabindex="-1" type="button">Pedidos</button>
    <button role="tab" id="aba-ementa" aria-controls="p-ementa" aria-selected="false" tabindex="-1" type="button">Ementa e preços</button>
  </div>
  <div role="tabpanel" id="p-hoje" aria-labelledby="aba-hoje" tabindex="0"><p class="vazio">A carregar…</p></div>
  <div role="tabpanel" id="p-reservas" aria-labelledby="aba-reservas" tabindex="0" hidden></div>
  <div role="tabpanel" id="p-pedidos" aria-labelledby="aba-pedidos" tabindex="0" hidden></div>
  <div role="tabpanel" id="p-ementa" aria-labelledby="aba-ementa" tabindex="0" hidden></div>
</div></section>`;
}
