import { crest, pageHero, photo, subnav } from '../html.js';

export const viverBody = () => `${pageHero({"photoKey":"amendoeiras","crumbs":[["Viver"]],"title":"Viver em <i>Freixo</i>","lead":"Casa, escola, saúde e transporte: o que uma família, um jovem ou um reformado precisa para viver no concelho."})}
${subnav([["fixar","Mudar-se para cá"],["habitacao","Habitação"],["educacao","Educação"],["saude","Saúde e apoio social"],["mobilidade","Mobilidade"],["tempo-livre","Tempo livre"]])}

<section class="sec wrap" id="fixar">
  <div class="split">
    <div>
      <p class="k">Mudar-se para cá</p>
      <h2 class="t2">Os primeiros passos de quem chega.</h2>
      <p class="lead" style="margin-top:14px">O concelho tem perdido população desde os anos 60. Por isso o Município apoia quem decide vir viver e trabalhar para cá — e acompanha cada família desde o primeiro dia.</p>
      <div class="steps">
        <div class="step"><div><h3>Fale connosco antes de vir</h3><p>Marque uma conversa com o gabinete de apoio ao munícipe. Ajudamos a encontrar casa, escola e trabalho.</p></div></div>
        <div class="step"><div><h3>Mude a morada</h3><p>Atualize a morada do Cartão de Cidadão. É o comprovativo que lhe vão pedir em quase todos os apoios.</p></div></div>
        <div class="step"><div><h3>Inscreva-se no centro de saúde e na escola</h3><p>Com a morada nova, inscreva a família no centro de saúde e os filhos na escola e no transporte escolar.</p></div></div>
        <div class="step"><div><h3>Peça o apoio à fixação</h3><p>Famílias que se mudam para o concelho podem candidatar-se a um apoio no primeiro ano. As regras estão no regulamento municipal.</p></div></div>
      </div>
    </div>
    <aside class="aside">
      <div class="box purple"><h3>Gabinete de apoio ao munícipe</h3><p>Uma só porta para quem chega: casa, emprego, escola e apoios.</p><ul class="facts"><li><span>Onde</span><b>Paços do Concelho</b></li><li><span>Quando</span><b>Dias úteis</b></li></ul><a class="btn gold" href="/contactos#mensagem">Marcar conversa</a></div>
      <div class="box"><h3>Nesta página</h3><ul class="toc"><li><a href="#fixar">Mudar-se para cá</a></li><li><a href="#habitacao">Habitação</a></li><li><a href="#educacao">Educação</a></li><li><a href="#saude">Saúde e apoio social</a></li><li><a href="#mobilidade">Mobilidade</a></li><li><a href="#tempo-livre">Tempo livre</a></li></ul></div>
    </aside>
  </div>
</section>

<section class="band" id="habitacao">
  <div class="wrap">
    <div class="h"><div><p class="k">Habitação</p><h2>Encontrar casa no concelho</h2></div></div>
    <div class="grid3">
      <div class="info"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 11l9-7 9 7v9H3z"/><path d="M9 20v-6h6v6"/></svg></span><h3>Habitação a custos controlados</h3><p>Casas municipais para arrendar, atribuídas por concurso público com critérios de rendimento e dimensão do agregado.</p><a class="more" href="/atualidade#editais">Ver concursos abertos →</a></div>
      <div class="info"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 20h16M6 20V9l6-4 6 4v11"/><path d="M10 13h4M10 16h4"/></svg></span><h3>Recuperar uma casa antiga</h3><p>Apoio técnico e financeiro para reabilitar casas no centro histórico e nas aldeias, respeitando as cantarias manuelinas.</p><a class="more" href="/servicos#licenca">Licenças de obras →</a></div>
      <div class="info"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></span><h3>Bolsa de casas disponíveis</h3><p>Lista de casas para venda ou arrendamento que os proprietários do concelho querem ver ocupadas.</p><a class="more" href="/contactos#mensagem">Pedir a lista →</a></div>
    </div>
  </div>
</section>

<section class="sec wrap" id="educacao">
  <div class="split">
    <div class="prose">
      <h2>Educação</h2>
      <p>Na vila funcionam a Escola Primária de Freixo de Espada à Cinta e a Escola Básica Santiago Gonçalves. O Município assegura o transporte escolar a partir de todas as aldeias e as refeições no pré-escolar e no 1.º ciclo.</p>
      <h3>O que o Município apoia</h3>
      <ul>
        <li>Transporte escolar gratuito para os alunos do ensino obrigatório.</li>
        <li>Refeições escolares e prolongamento de horário até às 17h30.</li>
        <li>Livros e material escolar para os escalões A e B.</li>
        <li>Bolsas de estudo para estudantes do ensino superior.</li>
      </ul>
      <p>As inscrições no transporte e nas refeições fazem-se até 31 de julho, no <a href="/servicos?q=escolar">Balcão Online</a>.</p>

      <h2 id="saude">Saúde e apoio social</h2>
      <p>A vila tem centro de saúde com médico de família e enfermagem. Para urgências, ligue 112; para aconselhamento, a linha SNS 24 (808 24 24 24) funciona 24 horas por dia.</p>
      <p>Para os mais velhos e para quem vive sozinho, há respostas próprias:</p>
      <ul>
        <li><a href="/servicos?q=teleassistência">Teleassistência</a>, com um botão de alerta ligado a uma central.</li>
        <li>Apoio domiciliário, em articulação com as instituições sociais do concelho.</li>
        <li><a href="/servicos?q=cartão social">Cartão social municipal</a>, com descontos em taxas e serviços.</li>
      </ul>
    </div>
    <aside class="aside">
      <div class="box tint"><h3>Números úteis</h3><ul class="facts"><li><span>Emergência</span><b>112</b></li><li><span>SNS 24</span><b>808 24 24 24</b></li><li><span>Linha do Idoso</span><b>800 203 531</b></li></ul></div>
    </aside>
  </div>
</section>

<section class="band dark" id="mobilidade">
  <div class="wrap">
    <div class="h"><div><p class="k">Mobilidade</p><h2>Transporte a pedido</h2></div></div>
    <p class="lead">Entre as aldeias e a vila não há autocarro a toda a hora, por isso existe o transporte a pedido: marca a viagem e um veículo vai buscá-lo à paragem da sua aldeia.</p>
    <div class="grid3" style="margin-top:34px">
      <div class="info"><h3>1. Marque</h3><p>Ligue ou use o Balcão Online até às 17h00 do dia útil anterior.</p></div>
      <div class="info"><h3>2. Espere na paragem</h3><p>À hora combinada, o veículo passa pela paragem da aldeia.</p></div>
      <div class="info"><h3>3. Pague o bilhete</h3><p>O bilhete tem um preço social e é pago ao motorista.</p></div>
    </div>
    <div class="grid2" style="margin-top:22px">
      <div class="info"><h3>Como chegar ao concelho</h3><p>Pela EN221, que liga Guarda, Pinhel e Figueira de Castelo Rodrigo a Freixo e segue para Miranda do Douro, ou pela EN325, a partir do IP2 em Torre de Moncorvo, passando por Ligares.</p></div>
      <div class="info"><h3>Comboio</h3><p>A estação mais próxima é a do Pocinho, na linha do Douro, a cerca de meia hora de carro. A antiga linha do Sabor fechou em 1988.</p></div>
    </div>
  </div>
</section>

<section class="sec wrap" id="tempo-livre">
  <div class="h"><div><p class="k">Tempo livre</p><h2>Cultura, desporto e natureza à porta</h2></div></div>
  <div class="grid3">
    <a class="photo" href="/visitar#congida" style="min-height:300px">${photo('congida', 'Praia fluvial da Congida', { sizes: '(max-width: 640px) 92vw, 640px' })}<div><small>Verão</small><h3>Praia fluvial da Congida</h3><p>Piscina, esplanada sobre o Douro e parque infantil.</p></div></a>
    <a class="photo" href="/atualidade#agenda" style="min-height:300px">${photo('matriz', 'Igreja Matriz', { sizes: '(max-width: 640px) 92vw, 640px' })}<div><small>Todo o ano</small><h3>Agenda cultural</h3><p>Concertos, feiras e festas nas quatro freguesias.</p></div></a>
    <a class="photo" href="/visitar#natureza" style="min-height:300px">${photo('douro', 'Arribas do Douro', { sizes: '(max-width: 640px) 92vw, 640px' })}<div><small>Ao fim de semana</small><h3>Caminhadas nas arribas</h3><p>Trilhos no Parque Natural do Douro Internacional.</p></div></a>
  </div>
</section>`;
