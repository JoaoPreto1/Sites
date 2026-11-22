import { crest, pageHero, photo, subnav } from '../html.js';

export const visitarBody = () => `${pageHero({"photoKey":"douro","crumbs":[["Visitar"]],"title":"A vila mais <i>manuelina</i> de Portugal","lead":"Um centro histórico de portas e janelas manuelinas, debruçado sobre as arribas do Douro Internacional."})}
${subnav([["patrimonio","Património"],["natureza","Natureza"],["tradicoes","Tradições"],["roteiro","Um dia em Freixo"],["pratico","Informação prática"]])}

<section class="sec wrap" id="patrimonio">
  <div class="h"><div><p class="k">Património</p><h2>O que ver na vila</h2></div></div>
  <p class="lead">Nos anos 30, Reynaldo dos Santos chamou a Freixo “a vila mais manuelina de Portugal”. Hoje estão inventariadas 101 molduras manuelinas nas ruas do centro histórico — vale a pena andar devagar e olhar para cima.</p>
  <div class="grid2" style="margin-top:34px">
    <article class="photo" id="torre" style="min-height:420px">${photo('torre', 'Torre do Galo', { sizes: '(max-width: 640px) 92vw, 640px' })}<div><small>Castelo</small><h3>Torre do Galo</h3><p>A torre heptagonal do antigo castelo, com o relógio cujas doze badaladas dão início, à meia-noite, à Procissão dos Sete Passos.</p></div></article>
    <article class="photo" id="matriz" style="min-height:420px">${photo('matriz', 'Igreja Matriz', { sizes: '(max-width: 640px) 92vw, 640px' })}<div><small>Monumento Nacional desde 1910</small><h3>Igreja Matriz de São Miguel</h3><p>Igreja-salão manuelina na Praça Jorge Álvares. A moldura da porta lateral é atribuída a João de Castilho.</p></div></article>
  </div>
  <div class="split" style="margin-top:56px">
    <div class="prose">
      <h3>Dentro da Igreja Matriz</h3>
      <p>No interior estão dezasseis pequenos painéis de um antigo retábulo pintado entre cerca de 1520 e 1535, provavelmente por um discípulo de Grão Vasco. O retábulo foi desmontado na época barroca e as pinturas reaproveitadas na decoração da igreja.</p>
      <h3>Mais para descobrir no centro histórico</h3>
      <ul>
        <li><b>Pelourinho</b>, símbolo da autonomia municipal.</li>
        <li><b>Capela do Senhor da Rua Nova</b>.</li>
        <li><b>Convento de São Filipe Néri</b>, dos Oratorianos, começado em 1673.</li>
        <li>O <b>velho freixo</b> junto à Matriz, que a população aceita como a árvore da lenda.</li>
      </ul>
      <h3>No resto do concelho</h3>
      <ul>
        <li><b>Gravuras rupestres do Mazouco</b>, junto ao Douro.</li>
        <li><b>Calçada de Alpajares</b>, também chamada Calçada dos Mouros, um antigo caminho empedrado pelas arribas.</li>
        <li><b>Castelo de Alva</b>.</li>
      </ul>
    </div>
    <aside class="aside">
      <div class="box purple"><h3>Antes de ir</h3><p>Algumas igrejas e capelas abrem só para o culto. Para visitas fora desse horário, fale com o posto de turismo.</p><a class="btn gold" href="/contactos#mensagem">Pedir informação</a></div>
    </aside>
  </div>
</section>

<section class="band dark" id="natureza">
  <div class="wrap">
    <div class="h"><div><p class="k">Natureza</p><h2>Douro Internacional</h2></div></div>
    <p class="lead">Todas as freguesias do concelho estão, no todo ou em parte, dentro do Parque Natural do Douro Internacional. O rio corre encaixado entre arribas, com Espanha na outra margem.</p>
    <div class="grid3" style="margin-top:34px">
      <article class="photo" id="penedo" style="min-height:340px">${photo('penedo', 'Miradouro do Penedo Durão', { sizes: '(max-width: 640px) 92vw, 640px' })}<div><small>Miradouro</small><h3>Penedo Durão</h3><p>Vista larga sobre o Douro e um dos melhores pontos para ver aves de rapina.</p></div></article>
      <article class="photo" id="congida" style="min-height:340px">${photo('congida', 'Praia fluvial da Congida', { sizes: '(max-width: 640px) 92vw, 640px' })}<div><small>Praia fluvial</small><h3>Congida</h3><p>A poucos minutos da vila: bar, esplanada sobre o rio, piscina e parque infantil.</p></div></article>
      <article class="info"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 20l6-12 4 7 3-4 5 9z"/></svg></span><h3>Caminhar e explorar</h3><p>A Montanha de Lagoaça, com 884 m, é o ponto mais alto do concelho; a Calçada de Alpajares desce pelas arribas até ao rio. Junto à barragem de Saucelle pratica-se pesca desportiva.</p><ul><li>Montanha de Lagoaça</li><li>Calçada de Alpajares</li><li>Barragem de Saucelle</li></ul></article>
    </div>
  </div>
</section>

<section class="sec wrap" id="tradicoes">
  <div class="h"><div><p class="k">Tradições</p><h2>Seda, amendoeiras e a Procissão dos Sete Passos</h2></div></div>
  <div class="grid3">
    <article class="info" id="seda">${photo('seda', 'Casulos e fio de seda', { sizes: '(max-width: 640px) 92vw, 640px', cls: 'ph' })}<h3>A seda de Freixo</h3><p>A criação do bicho-da-seda e a tecelagem são uma tradição antiga do concelho. No século XIX distribuíram-se aqui milhares de pés de amoreira, e o Município continua a apoiar as tecedeiras e a mostrar a seda nas feiras.</p></article>
    <article class="info">${photo('amendoeiras', 'Amendoeiras em flor', { sizes: '(max-width: 640px) 92vw, 640px', cls: 'ph' })}<h3>Amendoeiras em flor</h3><p>Entre fevereiro e março as encostas ficam brancas e cor-de-rosa. É a melhor altura para os percursos a pé e de carro pelo concelho.</p><a class="more" href="/atualidade/amendoeiras-em-flor-percursos">Percursos de 2027 →</a></article>
    <article class="info"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><h3>Procissão dos Sete Passos</h3><p>A única do distrito de Bragança. Sai à meia-noite de todas as sextas-feiras da Quaresma, ao toque das doze badaladas do relógio da torre heptagonal, e dura cerca de duas horas, com cânticos em português e latim nas capelas e na igreja.</p></article>
  </div>
</section>

<section class="band" id="roteiro">
  <div class="wrap split">
    <div>
      <p class="k">Sugestão</p>
      <h2 class="t2">Um dia em Freixo</h2>
      <ol class="timeline">
        <li><b>9h30</b><p>Café na praça e passeio pelo centro histórico, à procura das janelas manuelinas.</p></li>
        <li><b>11h00</b><p>Igreja Matriz e os painéis do antigo retábulo; depois, a Torre do Galo.</p></li>
        <li><b>13h00</b><p>Almoço na vila, com azeite e amêndoa da terra à mesa.</p></li>
        <li><b>15h00</b><p>Miradouro do Penedo Durão, de binóculos na mão.</p></li>
        <li><b>17h00</b><p>Fim de tarde na Congida, à beira do Douro.</p></li>
      </ol>
    </div>
    <aside class="aside" id="pratico">
      <div class="box"><h3>Informação prática</h3><ul class="facts"><li><span>Do Porto</span><b>c. 180 km</b></li><li><span>Estradas</span><b>EN221 · EN325</b></li><li><span>Comboio</span><b>Estação do Pocinho</b></li><li><span>Fronteira</span><b>Douro, com Espanha</b></li></ul></div>
      <div class="box tint"><h3>Onde ficar</h3><p>Junto à Congida ficam as Moradias do Douro Internacional, dez bungalows com piscina. Na vila há alojamento local e casas de turismo rural.</p></div>
    </aside>
  </div>
</section>`;
