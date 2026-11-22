import { APOIOS, EMERGENCY, EQUIPAMENTOS } from '../../config/municipio.js';
import { esc, facts, icon, pageHero, photo, subnav, toc } from '../html.js';

const SECTIONS = [
  ['chegar', 'Mudar-se para cá'],
  ['apoios', 'Apoios do Município'],
  ['educacao', 'Educação'],
  ['saude', 'Saúde'],
  ['ambiente', 'Resíduos e água'],
  ['tempo-livre', 'Tempo livre'],
];

export const viverBody = () => `${pageHero({ photoKey: 'amendoeiras', crumbs: [['Viver']], title: 'Viver em <i>Freixo</i>', lead: 'Casa, escola, saúde, apoios e tempo livre: o que uma família, um estudante ou um reformado precisa para viver no concelho.' })}
${subnav(SECTIONS)}

<section class="sec wrap" id="chegar">
  <div class="split">
    <div>
      <p class="k">Mudar-se para cá</p>
      <h2 class="t2">Os primeiros passos de quem chega.</h2>
      <p class="lead" style="margin-top:14px">Eram 7 288 residentes em 1960 e 3 216 nos Censos 2021. Quem vem viver para o concelho encontra uma vila tranquila, escola até ao 9.º ano, equipamentos desportivos e o Douro à porta.</p>
      <div class="steps">
        <div class="step" data-reveal><div><h3>Mude a morada</h3><p>Atualize a morada do Cartão de Cidadão: é o comprovativo de residência que lhe vão pedir para os apoios do Município.</p></div></div>
        <div class="step" data-reveal style="--d:60ms"><div><h3>Ligue a água</h3><p>Peça o contrato de água e saneamento no Balcão Online ou no serviço de Águas e Saneamento.</p></div></div>
        <div class="step" data-reveal style="--d:120ms"><div><h3>Escola e transporte</h3><p>Matricule os filhos e peça o transporte escolar, gratuito do pré-escolar ao secundário.</p></div></div>
        <div class="step" data-reveal style="--d:180ms"><div><h3>Conheça os apoios</h3><p>Do Enxoval do Bebé ao Fundo Social de Apoio à Habitação: veja abaixo o que se aplica à sua família.</p></div></div>
      </div>
    </div>
    <aside class="aside">
      <div class="box purple"><h2 class="bh">Atendimento</h2><p>Para qualquer dúvida sobre apoios, escola ou casa, fale com o Município.</p>${facts([['Telefone', '279 658 160'], ['Email', 'geral@cm-fec.pt']])}<a class="btn gold" href="/contactos#mensagem">Escrever ao Município</a></div>
      <div class="box"><h2 class="bh">Nesta página</h2>${toc(SECTIONS)}</div>
    </aside>
  </div>
</section>

<section class="band" id="apoios">
  <div class="wrap">
    <div class="h"><div><p class="k">Apoios do Município</p><h2>O que o Município pode fazer por si</h2></div><a href="/servicos?categoria=social">Ver no catálogo →</a></div>
    <div class="grid4">
      ${APOIOS.map((a, i) => `<a class="info apoio" href="/servicos#${a.service}" data-reveal style="--d:${(i % 4) * 60}ms"><span class="ic">${icon[a.icon]}</span><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p>${a.amount ? `<span class="amount">${esc(a.amount)}</span>` : ''}<span class="more">Como pedir →</span></a>`).join('\n      ')}
    </div>
    <p class="muted" style="margin-top:16px">Cada apoio tem um regulamento municipal, com as condições e os documentos necessários.</p>
  </div>
</section>

<section class="sec wrap">
  <div class="split">
    <div class="prose">
      <h2 id="educacao">Educação</h2>
      <p>Na vila funcionam o pré-escolar e a Escola EB 2,3 de Freixo de Espada à Cinta. O transporte escolar é gratuito para os alunos da rede pública, do pré-escolar ao secundário, e as rotas de cada aldeia estão no Plano de Transporte Escolar publicado todos os anos.</p>
      <ul>
        <li><a href="/servicos#transporte-escolar">Transporte escolar</a> gratuito, com rotas e horários por aldeia.</li>
        <li><a href="/servicos#transporte-estudantes">Apoio ao transporte</a> para estudantes do secundário e do superior que estudam fora.</li>
        <li>Biblioteca Municipal com ludoteca, sala de leitura e internet.</li>
        <li>Férias desportivas e culturais no verão, para crianças e jovens.</li>
      </ul>
      <p>O Município faz parte do Conselho Municipal de Educação e acompanha a Comissão de Proteção de Crianças e Jovens (CPCJ).</p>

      <h2 id="saude">Saúde</h2>
      <p>Para urgências ligue 112; para aconselhamento, a linha SNS 24 funciona a qualquer hora. O Município apoia quem precisa de ir a consultas fora do concelho e quem tem despesas de medicação difíceis de pagar.</p>
      <ul>
        <li><a href="/servicos#transporte-consultas">Transporte para consultas e exames</a> fora do concelho.</li>
        <li><a href="/servicos#apoio-medicacao">Apoio às despesas de medicação</a>.</li>
        <li><a href="/servicos#psicologia">Gabinete de Psicologia</a> e apoio a <a href="/servicos#cuidador-informal">cuidadores informais</a>.</li>
      </ul>

      <h2 id="ambiente">Resíduos e água</h2>
      <p>A recolha do lixo é feita com a Resíduos do Nordeste, a empresa da Associação de Municípios do Douro Superior. Os monos, como móveis, colchões e eletrodomésticos, recolhem-se por marcação ou entregam-se no Ecocentro Municipal.</p>
      <ul>
        <li><b>Ecocentro</b>: EN 325, Lameiros dos Freixos · dias úteis 10h00–13h00 e 14h30–18h30 · sábado 8h30–13h30.</li>
        <li><b>Águas e Saneamento</b>: dias úteis 9h00–12h30 e 13h30–17h00, pelo telefone 279 658 160.</li>
        <li><a href="/servicos#tarifario-social">Tarifário social</a> para famílias com poucos recursos.</li>
      </ul>
    </div>
    <aside class="aside">
      <div class="box tint"><h2 class="bh">Números úteis</h2>${facts(EMERGENCY)}</div>
    </aside>
  </div>
</section>

<section class="band dark" id="mobilidade">
  <div class="wrap">
    <div class="h"><div><p class="k">Como chegar</p><h2>Estradas, comboio e distâncias</h2></div></div>
    <div class="grid3">
      <div class="info"><span class="ic">${icon.pin}</span><h3>Pela estrada</h3><p>Pela EN221, que liga Guarda e Figueira de Castelo Rodrigo a Freixo e segue para Miranda do Douro, ou pela EN325, a partir do IP2 em Torre de Moncorvo, passando por Ligares.</p></div>
      <div class="info"><span class="ic">${icon.bus}</span><h3>Comboio</h3><p>A estação mais próxima é a do Pocinho, na linha do Douro. A antiga linha do Sabor, que servia o concelho, fechou em 1988.</p></div>
      <div class="info"><span class="ic">${icon.globe}</span><h3>Distâncias</h3><p>Cerca de 140 km de Bragança, 235 km do Porto e 420 km de Lisboa. Do outro lado do Douro fica a província de Salamanca.</p></div>
    </div>
  </div>
</section>

<section class="sec wrap" id="tempo-livre">
  <div class="h"><div><p class="k">Tempo livre</p><h2>Cultura, desporto e natureza à porta</h2></div><a href="/equipamentos">Equipamentos municipais →</a></div>
  <div class="grid3">
    <a class="photo" href="/visitar#congida" style="min-height:300px" data-reveal>${photo('congida', 'Praia fluvial da Congida', { sizes: '(max-width: 640px) 92vw, 420px' })}<div><small>Verão</small><h3>Praia fluvial da Congida</h3><p>Piscina, esplanada sobre o Douro e parque infantil.</p></div></a>
    <a class="photo" href="/equipamentos#cultura" style="min-height:300px;--d:60ms" data-reveal>${photo('seda', 'Casulos e fio de seda', { sizes: '(max-width: 640px) 92vw, 420px' })}<div><small>Todo o ano</small><h3>Museus e biblioteca</h3><p>Museu da Seda, Casa Junqueiro, auditório e biblioteca.</p></div></a>
    <a class="photo" href="/equipamentos#desporto" style="min-height:300px;--d:120ms" data-reveal>${photo('douro', 'Arribas do Douro', { sizes: '(max-width: 640px) 92vw, 420px' })}<div><small>Desporto</small><h3>Piscinas e pavilhão</h3><p>Piscina coberta todo o ano, piscina de verão, pavilhão e estádio.</p></div></a>
  </div>
  <p class="muted" style="margin-top:14px">${EQUIPAMENTOS.length} equipamentos municipais, com morada e telefone, na página de equipamentos.</p>
</section>`;
