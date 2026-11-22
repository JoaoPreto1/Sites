import { crest, pageHero, photo, subnav } from '../html.js';

export const municipioBody = () => `${pageHero({"photoKey":"vila","crumbs":[["Município"]],"title":"O Município de <i>Freixo de Espada à Cinta</i>","lead":"Quem decide, como se organiza o concelho e de onde vêm o nome, a vila e o brasão."})}
${subnav([["camara","Câmara Municipal"],["assembleia","Assembleia Municipal"],["freguesias","Freguesias"],["historia","História"],["brasao","Brasão e lendas"],["transparencia","Transparência"]])}

<section class="sec wrap">
  <div class="split">
    <div class="prose">
      <h2 id="camara">Câmara Municipal</h2>
      <p>A Câmara Municipal é o órgão executivo do Município. É composta pelo presidente e pelos vereadores eleitos nas eleições autárquicas, e é ela que gere o dia a dia do concelho: obras, água e saneamento, educação, ação social, cultura, desporto e turismo.</p>
      <p>As reuniões da Câmara são públicas e anunciadas por edital. Qualquer munícipe pode assistir e intervir no período reservado ao público, inscrevendo-se no início da reunião.</p>
      <h3>Áreas de trabalho</h3>
      <div class="grid2" style="margin-top:14px">
        <div class="info"><h3>Presidência</h3><p>Coordenação geral, proteção civil, recursos humanos, finanças e relações com as freguesias.</p></div>
        <div class="info"><h3>Obras e ambiente</h3><p>Obras municipais, urbanismo, água, saneamento, recolha de resíduos e espaços verdes.</p></div>
        <div class="info"><h3>Educação e social</h3><p>Escolas, transportes escolares, ação social, saúde e apoio aos mais velhos.</p></div>
        <div class="info"><h3>Cultura e turismo</h3><p>Património, eventos, desporto, seda e promoção do Douro Internacional.</p></div>
      </div>

      <h2 id="assembleia">Assembleia Municipal</h2>
      <p>A Assembleia Municipal é o órgão deliberativo. Aprova o orçamento, as grandes opções do plano, os regulamentos e as taxas, e acompanha a atividade da Câmara.</p>
      <p>É composta por membros eleitos diretamente e pelos presidentes das quatro juntas de freguesia. Reúne em sessão ordinária cinco vezes por ano — fevereiro, abril, junho, setembro e novembro — e as sessões são abertas ao público.</p>
      <blockquote>Os munícipes podem intervir no período reservado ao público de cada sessão. As ordens de trabalhos são publicadas com antecedência na secção de editais.</blockquote>

      <h2 id="freguesias">Freguesias</h2>
      <p>Desde a reorganização administrativa de 2013, o concelho tem quatro freguesias. O rio Douro passa por todas elas.</p>
      <table class="table">
        <thead><tr><th>Freguesia</th><th>Residentes 2021</th><th>Residentes 2011</th><th>Destaque</th></tr></thead>
        <tbody>
          <tr><td><b>Freixo de Espada à Cinta e Mazouco</b></td><td>2 114</td><td>2 355</td><td>Sede do concelho; gravuras rupestres do Mazouco</td></tr>
          <tr><td><b>Lagoaça e Fornos</b></td><td>443</td><td>617</td><td>Montanha de Lagoaça, 884 m</td></tr>
          <tr><td><b>Ligares</b></td><td>332</td><td>397</td><td>Terra natal de Guerra Junqueiro</td></tr>
          <tr><td><b>Poiares</b></td><td>326</td><td>411</td><td>Calçada de Alpajares</td></tr>
        </tbody>
      </table>
      <p style="font-size:14px;color:var(--soft)">Fonte: Censos 2011 e 2021.</p>

      <h2 id="historia">História</h2>
      <p>A vila guarda a memória de séculos de fronteira. Foi atacada por Leão em 1211 e cercada por Castela em 1236, recebeu foral de D. Afonso III e uma feira mensal de D. Dinis. No tempo de D. Manuel I ganhou novo foral e grande parte do casario manuelino que ainda hoje se vê.</p>
      <ol class="timeline">
        <li><b>1248</b><p>Foral de D. Afonso III, a 27 de março, renovado em 1273.</p></li>
        <li><b>1307</b><p>D. Dinis concede à vila uma feira mensal.</p></li>
        <li><b>1512</b><p>Foral novo de D. Manuel I, a 1 de outubro.</p></li>
        <li><b>1673</b><p>Começa a construção do Convento de São Filipe Néri.</p></li>
        <li><b>1850</b><p>Nasce em Ligares o poeta Guerra Junqueiro.</p></li>
        <li><b>1898</b><p>O concelho, extinto dois anos antes, é restaurado a 13 de janeiro.</p></li>
        <li><b>1910</b><p>A Igreja Matriz é classificada como Monumento Nacional.</p></li>
        <li><b>1911</b><p>Inauguração da linha férrea Pocinho–Carviçais.</p></li>
      </ol>

      <h3>Personalidades</h3>
      <ul>
        <li><b>Guerra Junqueiro</b> (1850–1923), poeta, jornalista e deputado, nascido em Ligares e sepultado no Panteão Nacional.</li>
        <li><b>Jorge Álvares</b> (?–1521), navegador, o primeiro português a chegar à China por mar, em 1514. Dá nome à praça da Igreja Matriz.</li>
        <li><b>António José Antunes Navarro</b> (1803–1867), 1.º Conde de Lagoaça, nascido em Lagoaça.</li>
      </ul>

      <h2 id="brasao">Brasão e lendas</h2>
      <figure style="display:flex;gap:28px;align-items:center;margin-top:20px">${crest(150, 'crest-plain', 'Brasão do Município')}<figcaption style="font-size:15px;color:#3b3342;margin:0">Escudo de púrpura com um freixo de ouro folhado de verde, entre duas espadas de ouro e dois escudetes das quinas. Coroa mural de prata e listel com a legenda “Vila de Freixo de Espada à Cinta”.</figcaption></figure>
      <p>Há várias lendas para o nome. A mais contada diz que D. Dinis, cansado das lutas com o filho Afonso Sanches, descansou à sombra de um grande freixo e lhe cravou a espada. Outra fala de um nobre que, depois de combater os mouros à beira do Douro, pendurou a espada num freixo. João de Barros ligou o nome a um fidalgo chamado Freixo, que teria edificado a vila.</p>
      <p>Junto à Igreja Matriz há um velho freixo que a população aceita como a árvore da lenda.</p>

      <h2 id="transparencia">Transparência</h2>
      <p>Os documentos de gestão do Município estão disponíveis para consulta. Os contratos públicos são publicados no portal BASE.</p>
      <ul class="docs" style="margin:18px 0 0">
        <li><a href="#transparencia"><span class="ft">PDF</span><span><b>Grandes Opções do Plano e Orçamento 2027</b><small>Proposta para a Assembleia Municipal</small></span><span class="dt">30 out 2026</span><span class="dl">Abrir</span></a></li>
        <li><a href="#transparencia"><span class="ft">PDF</span><span><b>Prestação de contas 2025</b><small>Relatório de gestão e demonstrações financeiras</small></span><span class="dt">abr 2026</span><span class="dl">Abrir</span></a></li>
        <li><a href="#transparencia"><span class="ft">PDF</span><span><b>Mapa de pessoal 2026</b><small>Postos de trabalho por unidade orgânica</small></span><span class="dt">jan 2026</span><span class="dl">Abrir</span></a></li>
        <li><a href="#transparencia"><span class="ft">PDF</span><span><b>Regulamento e tabela de taxas municipais</b><small>Em vigor</small></span><span class="dt">2026</span><span class="dl">Abrir</span></a></li>
        <li><a href="#transparencia"><span class="ft">WEB</span><span><b>Contratação pública</b><small>Contratos do Município no portal BASE</small></span><span class="dt">atualizado</span><span class="dl">Abrir</span></a></li>
      </ul>
    </div>

    <aside class="aside">
      <div class="box purple"><h3>Paços do Concelho</h3><ul class="facts"><li><span>Atendimento</span><b>Dias úteis</b></li><li><span>Manhã</span><b>9h00–12h30</b></li><li><span>Tarde</span><b>14h00–17h30</b></li></ul><a class="btn gold" href="/contactos">Contactos</a></div>
      <div class="box"><h3>Nesta página</h3><ul class="toc"><li><a href="#camara">Câmara Municipal</a></li><li><a href="#assembleia">Assembleia Municipal</a></li><li><a href="#freguesias">Freguesias</a></li><li><a href="#historia">História</a></li><li><a href="#brasao">Brasão e lendas</a></li><li><a href="#transparencia">Transparência</a></li></ul></div>
      <div class="box tint"><h3>Próxima sessão</h3><p>Assembleia Municipal · sessão ordinária de novembro. A ordem de trabalhos sai por edital.</p><a class="btn ghost" href="/atualidade#editais">Ver editais</a></div>
    </aside>
  </div>
</section>`;
