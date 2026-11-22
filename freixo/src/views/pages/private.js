import { NEWS_CATEGORIES, NOTICE_TYPES, REQUEST_STATUS } from '../../config/municipio.js';
import { icon } from '../html.js';

const head = ({ crumb, title, lead, who = true }) => `<section class="phero phero--app">
  <div class="wrap app-head">
    <div>
      <nav class="crumbs" aria-label="Caminho"><a href="/">Início</a><span aria-hidden="true">›</span><span aria-current="page">${crumb}</span></nav>
      <h1>${title}</h1>
      ${lead ? `<p>${lead}</p>` : ''}
    </div>
    ${who ? `<div class="who">${icon.user}<span data-user-name>…</span><button class="btn ghost-light" type="button" data-logout>Sair</button></div>` : ''}
  </div>
</section>`;

export const loginBody = () => `${head({ crumb: 'Balcão Online', title: 'Balcão <i>Online</i>', lead: 'Faça pedidos, acompanhe cada processo, pague a água e comunique leituras, sem sair de casa.', who: false })}
<section class="sec wrap">
  <div class="access">
    <div class="access__card" data-access>
      <div class="tabs" role="tablist" aria-label="Entrar ou criar conta">
        <button type="button" role="tab" id="tab-login" aria-controls="panel-login" aria-selected="true" data-tab="login">Entrar</button>
        <button type="button" role="tab" id="tab-register" aria-controls="panel-register" aria-selected="false" tabindex="-1" data-tab="register">Criar conta</button>
      </div>
      <div id="panel-login" role="tabpanel" aria-labelledby="tab-login"><form class="form one" data-form="login" novalidate>
        <label class="field">Email<input name="email" type="email" autocomplete="email" required></label>
        <label class="field">Palavra-passe<input name="password" type="password" autocomplete="current-password" required></label>
        <button class="btn purple" type="submit">Entrar</button>
      </form></div>
      <div id="panel-register" role="tabpanel" aria-labelledby="tab-register" hidden><form class="form one" data-form="register" novalidate>
        <label class="field">Nome completo<input name="name" autocomplete="name" required></label>
        <label class="field">Email<input name="email" type="email" autocomplete="email" required></label>
        <label class="field">Telefone (opcional)<input name="phone" type="tel" autocomplete="tel"></label>
        <label class="field">Palavra-passe<input name="password" type="password" autocomplete="new-password" minlength="8" required></label>
        <button class="btn purple" type="submit">Criar conta</button>
      </form></div>
    </div>
    <aside class="aside">
      <div class="box purple"><h2 class="bh">No Balcão Online pode</h2><ul class="ticks"><li>Pedir licenças, certidões, transporte escolar e apoios</li><li>Ver o estado de cada pedido, passo a passo</li><li>Pagar a fatura da água e comunicar leituras</li><li>Reportar problemas na rua e acompanhá-los</li></ul></div>
      <div class="box tint"><h2 class="bh">Para experimentar</h2><p>Munícipe: <b>maria@exemplo.pt</b> · <b>freixo2026</b><br>Câmara: <b>camara@exemplo.pt</b> · <b>freixo2026</b></p></div>
    </aside>
  </div>
</section>`;

const statusOptions = REQUEST_STATUS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');

export const balcaoBody = () => `${head({ crumb: 'Balcão Online', title: 'O meu <i>balcão</i>', lead: 'Os seus pedidos, a água e as ocorrências, num só lugar.' })}
<nav class="subnav" aria-label="Secções"><div class="wrap"><a href="#pedidos">Pedidos</a><a href="#novo">Novo pedido</a><a href="#agua">Água</a><a href="#ocorrencias">Ocorrências</a><a href="#dados">Os meus dados</a></div></nav>

<section class="sec wrap">
  <div class="stats" data-stats aria-live="polite"></div>
</section>

<section class="sec wrap" id="pedidos">
  <div class="h"><div><p class="k">Pedidos</p><h2>Os meus pedidos</h2></div><a href="#novo">Fazer um pedido →</a></div>
  <div class="reqs" data-requests><p class="muted">A carregar…</p></div>
</section>

<section class="band" id="novo">
  <div class="narrow">
    <p class="k">Novo pedido</p>
    <h2 class="t2">Do que precisa?</h2>
    <form class="form" data-new-request novalidate style="margin-top:22px">
      <label class="field full">Serviço<select name="service" required data-services></select></label>
      <p class="full muted" data-service-hint></p>
      <label class="field full">Explique o pedido<textarea name="text" required minlength="10" placeholder="Morada, datas, o que precisa e qualquer informação útil"></textarea></label>
      <div class="full"><button class="btn purple" type="submit">Enviar pedido</button></div>
    </form>
  </div>
</section>

<section class="sec wrap" id="agua">
  <div class="h"><div><p class="k">Água</p><h2>Faturas e leituras</h2></div></div>
  <div class="split">
    <div>
      <table class="table" data-invoices><thead><tr><th>Fatura</th><th>Período</th><th>Consumo</th><th>Valor</th><th>Estado</th></tr></thead><tbody></tbody></table>
    </div>
    <aside class="aside" style="position:static">
      <div class="box purple"><h2 class="bh">Comunicar leitura</h2><p>Leia os números a preto do contador. Conta para a fatura deste mês se comunicar entre os dias 20 e 25.</p>
        <form class="reading" data-reading novalidate><label class="field"><span class="sr">Leitura em m³</span><input name="value" inputmode="numeric" pattern="[0-9]*" required placeholder="m³"></label><button class="btn gold" type="submit">Enviar</button></form>
        <p class="last" data-last-reading></p></div>
    </aside>
  </div>
</section>

<section class="sec wrap" id="ocorrencias">
  <div class="h"><div><p class="k">Ocorrências</p><h2>Problemas que reportei</h2></div><a href="/contactos#ocorrencia">Reportar outro →</a></div>
  <div class="grid3" data-issues></div>
</section>

<section class="sec narrow" id="dados">
  <p class="k">Conta</p>
  <h2 class="t2">Os meus dados</h2>
  <form class="form" data-profile novalidate style="margin-top:22px">
    <label class="field">Nome<input name="name" autocomplete="name" required></label>
    <label class="field">Telefone<input name="phone" type="tel" autocomplete="tel"></label>
    <label class="field full">Email<input name="email" type="email" disabled></label>
    <div class="full"><button class="btn purple" type="submit">Guardar</button></div>
  </form>
  <form class="form" data-password novalidate style="margin-top:34px">
    <label class="field">Palavra-passe atual<input name="currentPassword" type="password" autocomplete="current-password" required></label>
    <label class="field">Nova palavra-passe<input name="newPassword" type="password" autocomplete="new-password" minlength="8" required></label>
    <div class="full"><button class="btn ghost" type="submit">Mudar palavra-passe</button></div>
  </form>
</section>`;

export const painelBody = () => `${head({ crumb: 'Painel da câmara', title: 'Painel da <i>câmara</i>', lead: 'Pedidos dos munícipes, ocorrências, mensagens e os conteúdos do site.' })}
<nav class="subnav" aria-label="Secções"><div class="wrap"><a href="#pedidos">Pedidos</a><a href="#ocorrencias">Ocorrências</a><a href="#mensagens">Mensagens</a><a href="#noticias">Notícias</a><a href="#avisos">Avisos</a><a href="#agenda">Agenda</a></div></nav>

<section class="sec wrap">
  <div class="stats" data-stats aria-live="polite"></div>
</section>

<section class="sec wrap" id="pedidos">
  <div class="h"><div><p class="k">Pedidos</p><h2>Pedidos dos munícipes</h2></div></div>
  <div class="filters" data-status-filter role="group" aria-label="Filtrar por estado"><button type="button" class="on" data-status="">Todos</button>${REQUEST_STATUS.map(([v, l]) => `<button type="button" data-status="${v}">${l}</button>`).join('')}</div>
  <div class="reqs" data-requests></div>
  <template id="status-options">${statusOptions}</template>
</section>

<section class="band" id="ocorrencias">
  <div class="wrap">
    <div class="h"><div><p class="k">Ocorrências</p><h2>Problemas na via pública</h2></div></div>
    <div class="grid3" data-issues></div>
  </div>
</section>

<section class="sec wrap" id="mensagens">
  <div class="h"><div><p class="k">Mensagens</p><h2>Formulário de contacto</h2></div></div>
  <div class="msgs" data-messages></div>
</section>

<section class="band" id="noticias">
  <div class="wrap split">
    <div>
      <div class="h"><div><p class="k">Notícias</p><h2>Notícias publicadas</h2></div></div>
      <ul class="admin-list" data-news></ul>
    </div>
    <aside class="aside" style="position:static">
      <div class="box"><h2 class="bh">Nova notícia</h2>
        <form class="form one" data-news-form novalidate>
          <label class="field">Título<input name="title" required minlength="10" maxlength="140"></label>
          <label class="field">Resumo<textarea name="summary" required minlength="20" maxlength="280" style="min-height:80px"></textarea></label>
          <label class="field">Tema<select name="cat">${NEWS_CATEGORIES.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></label>
          <label class="field">Etiqueta<input name="label" required placeholder="Ex.: Cultura"></label>
          <label class="field">Fotografia<select name="photo"><option value="vila">A vila vista do alto</option><option value="matriz">Igreja Matriz</option><option value="torre">Torre do Galo</option><option value="douro">O Douro</option><option value="penedo">Penedo Durão</option><option value="congida">Congida</option><option value="amendoeiras">Amendoeiras</option><option value="seda">Seda</option></select></label>
          <label class="field">Texto<textarea name="text" required minlength="40" placeholder="Separe os parágrafos com uma linha em branco"></textarea></label>
          <button class="btn purple" type="submit">Publicar</button>
        </form></div>
    </aside>
  </div>
</section>

<section class="sec wrap" id="avisos">
  <div class="split">
    <div>
      <div class="h"><div><p class="k">Avisos</p><h2>Avisos à população</h2></div></div>
      <ul class="admin-list" data-notices></ul>
    </div>
    <aside class="aside" style="position:static">
      <div class="box"><h2 class="bh">Novo aviso</h2>
        <form class="form one" data-notice-form novalidate>
          <label class="field">Tipo<select name="type">${NOTICE_TYPES.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></label>
          <label class="field">Título<input name="title" required placeholder="Ex.: Corte de água em Poiares"></label>
          <label class="field">Aviso<input name="text" required></label>
          <label class="field">Quando<input name="when" required placeholder="Ex.: quinta, 9h00–12h00"></label>
          <label class="field">Mostrar até<input name="until" type="date" required></label>
          <label class="check field"><input type="checkbox" name="pinned" value="true">Destacar na página inicial</label>
          <button class="btn purple" type="submit">Publicar aviso</button>
        </form></div>
    </aside>
  </div>
</section>

<section class="band" id="agenda">
  <div class="wrap split">
    <div>
      <div class="h"><div><p class="k">Agenda</p><h2>Próximos eventos</h2></div></div>
      <ul class="admin-list" data-events></ul>
    </div>
    <aside class="aside" style="position:static">
      <div class="box"><h2 class="bh">Novo evento</h2>
        <form class="form one" data-event-form novalidate>
          <label class="field">Nome<input name="title" required></label>
          <label class="field">Data e hora<input name="date" type="datetime-local" required></label>
          <label class="field">Onde e a que horas<input name="place" required placeholder="Ex.: Praça da vila · 10h00"></label>
          <button class="btn purple" type="submit">Adicionar</button>
        </form></div>
    </aside>
  </div>
</section>`;
