import { CATEGORIES, DISTRICTS, LIMITS, RETENTION } from '../../config/platform.js';
import { brand } from '../document.js';
import { esc, glyph, icon } from '../html.js';

export const loginBody = () => `<div class="wrap auth">
  <div class="paper-shadow auth__wrap"><div class="receipt auth__paper">
    <header class="receipt__head">${brand('span')}<h1>Entrar</h1><p class="mono">A mesma conta serve para pedir e para ajudar</p></header>
    <form id="login" novalidate>
      <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="password">Palavra-passe</label><input id="password" name="password" type="password" autocomplete="current-password" required></div>
      <button class="btn btn--ink btn--block btn--lg" type="submit">Entrar${icon.arrow}</button>
    </form>
    <p class="auth__alt">Ainda não tem conta? <a class="link" href="/registar" data-keep-next>Criar conta</a></p>
    <details class="auth__demo"><summary>Contas de demonstração</summary><p>Todas fictícias, com a palavra-passe <code>amparo2026</code>: <code>ana@exemplo.pt</code> (tem um pedido e uma conversa), <code>rui@exemplo.pt</code> (já doou e perguntou), <code>joao@exemplo.pt</code> (tem um pedido de informação por responder).</p></details>
  </div></div>
</div>`;

export const registerBody = () => `<div class="wrap auth">
  <div class="paper-shadow auth__wrap"><div class="receipt auth__paper">
    <header class="receipt__head">${brand('span')}<h1>Criar conta</h1><p class="mono">Só pedimos o necessário</p></header>
    <form id="register" novalidate>
      <div class="field"><label for="name">Nome</label><input id="name" name="name" autocomplete="name" required maxlength="80"><small>Não aparece em público. Nos pedidos escolhe se mostra só o primeiro nome.</small></div>
      <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required><small>Para entrar e receber avisos sobre os seus pedidos. Ninguém o vê.</small></div>
      <div class="field"><label for="password">Palavra-passe</label><input id="password" name="password" type="password" autocomplete="new-password" minlength="10" required><small>Pelo menos 10 caracteres. Uma frase curta é mais fácil de lembrar e mais segura.</small></div>
      <div class="hp" aria-hidden="true"><label for="website">Não preencha este campo</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div>
      <label class="check"><input type="checkbox" name="accept" required> Li as <a href="/condicoes" target="_blank">condições de utilização</a> e a <a href="/privacidade" target="_blank">política de privacidade</a>.</label>
      <button class="btn btn--ink btn--block btn--lg" type="submit">Criar conta${icon.arrow}</button>
    </form>
    <p class="auth__alt">Já tem conta? <a class="link" href="/entrar" data-keep-next>Entrar</a></p>
  </div></div>
</div>`;

const visibility = [
  ['alias', 'Mostrar o nome que escrevi acima', true],
  ['district', 'Mostrar o distrito', true],
  ['deadline', 'Mostrar o prazo', true],
  ['proofs', 'Mostrar a lista de provas verificadas (sem os documentos)', true],
  ['donors', 'Mostrar os nomes de quem doou e escolheu aparecer', true],
];

const adForm = () => `<form id="ad-form" class="adform" novalidate>
  <input type="hidden" name="adId">
  <fieldset class="adform__sec">
    <legend><span class="mono">1</span>Para que despesa é?</legend>
    <div class="catpick">${CATEGORIES.map(([id, l, h], i) => `<label><input type="radio" name="category" value="${id}"${i === 0 ? ' required' : ''}><span>${glyph(id, 30)}<b>${l}</b><small>${h}</small></span></label>`).join('')}</div>
  </fieldset>
  <fieldset class="adform__sec">
    <legend><span class="mono">2</span>O que precisa</legend>
    <div class="field"><label for="ad-title">Título</label><input id="ad-title" name="title" maxlength="90" required placeholder="Ex.: Fatura da luz de novembro"><small>Curto e concreto. 8 a 90 caracteres.</small></div>
    <div class="field"><label for="ad-story">Motivo</label><textarea id="ad-story" name="story" maxlength="3000" required rows="7" placeholder="Explique a situação com as suas palavras: o que aconteceu, para que é o dinheiro e se já tem uma parte."></textarea><small><span data-count>0</span> / 3000 · mínimo 80 caracteres. Não escreva moradas, telefones, emails, NIF ou IBAN.</small></div>
    <div class="sens notice notice--warn" data-sensitive hidden role="status"></div>
    <div class="row2">
      <div class="field"><label for="ad-amount">Montante necessário</label><div class="euro-input"><input id="ad-amount" name="amount" inputmode="decimal" required placeholder="0,00"></div><small>Entre ${LIMITS.adMinCents / 100} € e ${LIMITS.adMaxCents / 100} €.</small></div>
      <div class="field"><label for="ad-deadline">Prazo <small>(opcional)</small></label><input id="ad-deadline" name="deadline" type="date"><small>Por exemplo, a data limite da fatura.</small></div>
    </div>
  </fieldset>
  <fieldset class="adform__sec">
    <legend><span class="mono">3</span>O que fica visível</legend>
    <div class="row2">
      <div class="field"><label for="ad-alias">Nome a mostrar <small>(opcional)</small></label><input id="ad-alias" name="alias" maxlength="30" placeholder="Ex.: o seu primeiro nome"><small>Deixe vazio para aparecer como “pessoa que preferiu não mostrar o nome”.</small></div>
      <div class="field"><label for="ad-district">Distrito</label><select id="ad-district" name="district" required><option value="">Escolha</option>${DISTRICTS.map((d) => `<option>${d}</option>`).join('')}</select><small>Serve para quem quer ajudar perto de si. Pode escondê-lo.</small></div>
    </div>
    <div class="vis">${visibility.map(([k, l, on]) => `<label class="check"><input type="checkbox" name="vis-${k}"${on ? ' checked' : ''}> ${l}</label>`).join('')}</div>
    <p class="hint">${icon.lock} Morada, contactos, dados bancários, números de identificação e documentos completos nunca ficam visíveis.</p>
  </fieldset>
  <fieldset class="adform__sec">
    <legend><span class="mono">4</span>Só para a moderação</legend>
    <div class="field"><label for="ad-note">Nota privada <small>(opcional)</small></label><textarea id="ad-note" name="privateNote" maxlength="1000" rows="3" placeholder="Algo que ajude a moderação a perceber o pedido. Não aparece em público."></textarea></div>
    <p class="hint">Depois de enviar pode juntar provas (fotografia de uma fatura, recibo ou orçamento). São opcionais e ficam privadas.</p>
  </fieldset>
  <label class="check"><input type="checkbox" name="confirm" required> Confirmo que a informação é verdadeira e que o texto não tem dados pessoais meus nem de outras pessoas.</label>
  <p class="notice" data-edit-warning hidden>Este pedido está publicado. Se guardar alterações, sai do ar até a moderação as aprovar. As doações já recebidas mantêm-se.</p>
  <div class="adform__acts"><button class="btn btn--green btn--lg" type="submit">Enviar para moderação${icon.arrow}</button><button class="btn btn--ghost" type="button" data-cancel-edit hidden>Cancelar</button></div>
</form>`;

export const accountBody = () => `<section class="phead phead--account"><div class="wrap">
  <p class="kicker">A minha conta</p>
  <h1 data-hello>Olá</h1>
  <p class="lead">Aqui estão os seus pedidos, as conversas, as doações e os seus dados. Ninguém além de si vê esta página.</p>
</div></section>
<div class="wrap account">
  <nav class="tabs" role="tablist" aria-label="Secções da conta">
    <button role="tab" id="tab-pedidos" aria-controls="pedidos" aria-selected="true">Os meus pedidos</button>
    <button role="tab" id="tab-novo" aria-controls="novo" aria-selected="false">Novo pedido</button>
    <button role="tab" id="tab-mensagens" aria-controls="mensagens" aria-selected="false">Mensagens <span class="count" data-unread hidden></span></button>
    <button role="tab" id="tab-doacoes" aria-controls="doacoes" aria-selected="false">Doações</button>
    <button role="tab" id="tab-dados" aria-controls="dados" aria-selected="false">Dados e privacidade</button>
  </nav>

  <section id="pedidos" role="tabpanel" aria-labelledby="tab-pedidos"><div data-ads><p class="empty">A carregar…</p></div></section>

  <section id="novo" role="tabpanel" aria-labelledby="tab-novo" hidden>
    <div class="account__two">
      <div>${adForm()}</div>
      <aside class="account__aside">
        <div class="box"><h2>${icon.shield}Como é revisto</h2><p>A moderação confirma que o texto não tem dados pessoais, que o pedido é coerente e que a categoria está certa. Pode pedir alterações e diz sempre porquê.</p></div>
        <div class="box"><h2>${icon.eye}O que os outros veem</h2><p>O título, o motivo, o montante, o que já recebeu e o que falta. O resto só se escolher mostrar.</p></div>
      </aside>
    </div>
  </section>

  <section id="mensagens" role="tabpanel" aria-labelledby="tab-mensagens" hidden>
    <div class="inbox"><ul class="inbox__list" data-convs></ul><div class="inbox__thread" data-thread><p class="empty">Escolha uma conversa.</p></div></div>
  </section>

  <section id="doacoes" role="tabpanel" aria-labelledby="tab-doacoes" hidden><div data-donations></div></section>

  <section id="dados" role="tabpanel" aria-labelledby="tab-dados" hidden>
    <div class="account__two">
      <div>
        <form id="profile" class="box" novalidate><h2>${icon.user}Nome e email</h2>
          <div class="field"><label for="p-name">Nome</label><input id="p-name" name="name" autocomplete="name" required></div>
          <div class="field"><label for="p-email">Email</label><input id="p-email" name="email" type="email" autocomplete="email" required></div>
          <button class="btn btn--ink" type="submit">Guardar</button>
        </form>
        <form id="password" class="box" novalidate><h2>${icon.lock}Palavra-passe</h2>
          <div class="field"><label for="p-current">Palavra-passe atual</label><input id="p-current" name="currentPassword" type="password" autocomplete="current-password" required></div>
          <div class="field"><label for="p-new">Nova palavra-passe</label><input id="p-new" name="newPassword" type="password" autocomplete="new-password" minlength="10" required><small>Ao mudar, as sessões noutros dispositivos terminam.</small></div>
          <button class="btn btn--ink" type="submit">Mudar palavra-passe</button>
        </form>
      </div>
      <div>
        <div class="box"><h2>${icon.doc}Descarregar os meus dados</h2><p>Um ficheiro com tudo o que guardamos sobre si: conta, pedidos, lista de provas, doações e mensagens que enviou.</p><button class="btn" type="button" data-export>Descarregar ficheiro</button></div>
        <div class="box box--danger"><h2>${icon.flag}Apagar a conta</h2><p>Apagamos as provas, as mensagens e os pedidos, e retiramos o seu nome das doações. Os registos de pagamento podem ter de ser guardados sem dados pessoais. O pedido é tratado em até ${RETENTION.deletedAccountDays} dias.</p>
          <form id="delete" novalidate><div class="field"><label for="d-reason">Motivo <small>(opcional)</small></label><textarea id="d-reason" name="reason" rows="2" maxlength="500"></textarea></div><label class="check"><input type="checkbox" name="confirm" required> Percebo que isto não se pode desfazer.</label><button class="btn btn--danger" type="submit">Pedir eliminação da conta</button></form>
          <p class="notice notice--warn" data-deletion-pending hidden>O seu pedido de eliminação está a ser tratado.</p>
        </div>
        <p><button class="btn btn--ghost" type="button" data-logout>Terminar sessão</button></p>
      </div>
    </div>
  </section>
</div>
<dialog id="upload" aria-labelledby="up-t"><form class="dialog__in" novalidate>
  <div class="dialog__head"><h2 id="up-t">Juntar uma prova</h2><button class="x" type="button" data-close aria-label="Fechar">${icon.close}</button></div>
  <p>Fotografia ou PDF até 5 MB. Fica guardada em armazenamento privado. Se for uma fotografia, retiramos a localização e outros dados escondidos no ficheiro.</p>
  <div class="field"><label for="up-file">Ficheiro</label><input id="up-file" name="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required></div>
  <div class="field"><label for="up-desc">O que é?</label><input id="up-desc" name="description" maxlength="80" required placeholder="Ex.: Fatura da água de outubro"><small>Esta descrição pode aparecer no pedido como “prova verificada”.</small></div>
  <label class="check"><input type="checkbox" name="shareRequested"> Autorizo mostrar esta imagem no pedido, depois de a moderação confirmar que não tem dados pessoais visíveis.</label>
  <p class="hint">Se não marcar, só a moderação vê o ficheiro. Pode mudar de ideias a qualquer momento.</p>
  <button class="btn btn--ink btn--block" type="submit">Enviar prova</button>
</form></dialog>`;
