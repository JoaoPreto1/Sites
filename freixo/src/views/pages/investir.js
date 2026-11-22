import { crest, pageHero, photo, subnav } from '../html.js';

export const investirBody = () => `${pageHero({"photoKey":"penedo","crumbs":[["Investir"]],"title":"Investir no <i>Douro Internacional</i>","lead":"Terra de amêndoa, azeite, vinho e seda, na fronteira com Espanha. O Município acompanha cada projeto do primeiro contacto à abertura."})}

<section class="sec wrap">
  <div class="h"><div><p class="k">Porquê aqui</p><h2>O que o concelho tem para oferecer</h2></div></div>
  <div class="grid4">
    <div class="info"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg></span><h3>Na fronteira</h3><p>Vila raiana, com Castela e Leão do outro lado do Douro e ligação a Salamanca.</p></div>
    <div class="info"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21c-5-3-8-7-8-11a8 8 0 0 1 16 0c0 4-3 8-8 11z"/><path d="M12 7v7"/></svg></span><h3>Produtos da terra</h3><p>Amêndoa, azeite e vinho do Douro Superior, com cooperativas já instaladas, e uma tradição de seda feita à mão.</p></div>
    <div class="info"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 20l6-12 4 7 3-4 5 9z"/></svg></span><h3>Turismo de natureza</h3><p>Parque Natural do Douro Internacional, aves de rapina, rio e centro histórico manuelino.</p></div>
    <div class="info"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></svg></span><h3>Trabalho remoto</h3><p>Custo de vida baixo, casas para recuperar e tranquilidade para quem trabalha à distância.</p></div>
  </div>
</section>

<section class="band">
  <div class="wrap split">
    <div>
      <p class="k">Apoios</p>
      <h2 class="t2">O que o Município pode fazer pelo seu projeto</h2>
      <div class="grid2" style="margin-top:28px">
        <div class="info"><h3>Área de Reabilitação Urbana</h3><p>Quem reabilita edifícios dentro da ARU do centro histórico tem acesso a benefícios fiscais e a taxas reduzidas.</p></div>
        <div class="info"><h3>Gabinete de Apoio ao Agricultor</h3><p>Ajuda com candidaturas, parcelário e licenças para quem trabalha a amêndoa, o olival, a vinha ou o gado.</p></div>
        <div class="info"><h3>Candidaturas e desenvolvimento</h3><p>O Município acompanha candidaturas a fundos europeus e programas de apoio ao investimento no interior.</p></div>
        <div class="info"><h3>Espaço do Artesão</h3><p>Um espaço municipal para artesãos produzirem e venderem, a começar pela seda feita à mão.</p></div>
      </div>
      <p style="font-size:14px;color:var(--soft);margin-top:16px">No concelho já trabalham a Adega Cooperativa de Freixo, a CoopaFreixo e a associação de artesanato AEDPAFEC: contacte o Município para conhecer parceiros locais.</p>
    </div>
    <aside class="aside">
      <div class="box purple"><h3>Gabinete de apoio ao investidor</h3><p>Conte-nos a sua ideia. Respondemos em até cinco dias úteis com os próximos passos.</p><a class="btn gold" href="#contacto">Falar com o gabinete</a></div>
    </aside>
  </div>
</section>

<section class="sec narrow">
  <p class="k">Como funciona</p>
  <h2 class="t2">Do primeiro contacto à abertura</h2>
  <div class="steps">
    <div class="step"><div><h3>Conversa inicial</h3><p>Apresente a ideia ao gabinete, por email, telefone ou numa reunião nos Paços do Concelho.</p></div></div>
    <div class="step"><div><h3>Plano de acompanhamento</h3><p>Identificamos o local, as licenças necessárias e os apoios a que pode concorrer.</p></div></div>
    <div class="step"><div><h3>Licenciamento</h3><p>Um técnico acompanha o processo e articula com as entidades de fora do Município.</p></div></div>
    <div class="step"><div><h3>Abertura e divulgação</h3><p>Ajudamos a dar a conhecer o novo negócio nos canais do Município.</p></div></div>
  </div>
</section>

<section class="sec narrow" id="contacto">
  <p class="k">Contacto</p>
  <h2 class="t2">Fale-nos do seu projeto</h2>
  <form class="form" data-api="/mensagens" novalidate style="margin-top:24px">
    <label class="field">Nome<input name="name" required autocomplete="name"></label>
    <label class="field">Email<input name="email" type="email" required autocomplete="email"></label>
    <label class="field">Setor<select name="subject"><option>Investir: agroalimentar</option><option>Investir: turismo</option><option>Investir: comércio e serviços</option><option>Investir: artesanato e seda</option><option>Investir: outro</option></select></label>
    <label class="field">Empresa (opcional)<input name="extra" autocomplete="organization"></label>
    <label class="field full">A sua ideia<textarea name="text" required minlength="10"></textarea></label>
    <label class="check full field"><input type="checkbox" name="consent" value="true" required>Aceito que o Município use estes dados para responder ao meu pedido.</label>
    <div class="full"><button class="btn purple" type="submit">Enviar</button><p class="ok" role="status">Obrigado. O gabinete responde em até cinco dias úteis.</p></div>
  </form>
</section>`;
