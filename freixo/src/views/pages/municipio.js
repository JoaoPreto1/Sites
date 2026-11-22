import { ASSEMBLEIA, EXECUTIVO, FREGUESIAS, MUNICIPIO } from '../../config/municipio.js';
import { documents } from '../../data/seed.js';
import { crest, esc, facts, num, pageHero, subnav, toc } from '../html.js';

const SECTIONS = [
  ['camara', 'Câmara Municipal'],
  ['assembleia', 'Assembleia Municipal'],
  ['freguesias', 'Juntas de freguesia'],
  ['historia', 'História'],
  ['brasao', 'Brasão e lendas'],
  ['transparencia', 'Transparência'],
];

const initials = (name) =>
  name
    .split(' ')
    .filter((w) => w.length > 2)
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

const member = (m, i) => `<article class="person${i === 0 ? ' person--lead' : ''}" data-reveal style="--d:${i * 60}ms">
  <span class="avatar" aria-hidden="true">${initials(m.name)}</span>
  <div>
    <p class="k">${esc(m.role)} · ${esc(m.party)}</p>
    <h3>${esc(m.name)}</h3>
    ${m.pelouros.length ? `<ul class="tags-list">${m.pelouros.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : '<p class="muted">Sem pelouros atribuídos.</p>'}
    ${m.email ? `<a class="link sm" href="mailto:${m.email}">${esc(m.email)}</a>` : ''}
  </div>
</article>`;

const junta = (f, i) => `<article class="info junta" data-reveal style="--d:${i * 60}ms">
  <p class="k">${esc(f.name)}</p>
  <h3>${esc(f.junta)}</h3>
  ${facts([
    ['Presidente', f.president],
    ['Morada', f.address],
    ['Telefone', f.phone],
    ['Residentes (2021)', num(f.residents2021)],
  ])}
  <p class="muted">${esc(f.hours)}</p>
  <a class="more" href="mailto:${f.email}">${esc(f.email)}</a>
</article>`;

export const municipioBody = () => `${pageHero({ photoKey: 'vila', crumbs: [['Município']], title: 'O Município de <i>Freixo de Espada à Cinta</i>', lead: 'Quem decide, como se organiza o concelho e de onde vêm o nome, a vila e o brasão.' })}
${subnav(SECTIONS)}

<section class="sec wrap" id="camara">
  <div class="split">
    <div>
      <p class="k">Órgão executivo</p>
      <h2 class="t2">Câmara Municipal</h2>
      <p class="lead" style="margin-top:12px">A Câmara gere o dia a dia do concelho: obras, água, educação, ação social, cultura, desporto e turismo. É composta pelo presidente e por quatro vereadores; as reuniões são públicas, anunciadas por edital e transmitidas em direto.</p>
      <div class="people">${EXECUTIVO.map(member).join('\n')}</div>
    </div>
    <aside class="aside">
      <div class="box purple"><h2 class="bh">Falar com o Município</h2>${facts([['Telefone', MUNICIPIO.phone], ['Email', MUNICIPIO.email], ['Morada', MUNICIPIO.address]])}<a class="btn gold" href="/contactos">Todos os contactos</a></div>
      <div class="box"><h2 class="bh">Nesta página</h2>${toc(SECTIONS)}</div>
    </aside>
  </div>
</section>

<section class="band" id="assembleia">
  <div class="wrap split">
    <div>
      <p class="k">Órgão deliberativo</p>
      <h2 class="t2">Assembleia Municipal</h2>
      <p class="lead" style="margin-top:12px">Aprova o orçamento, as grandes opções do plano, os regulamentos e as taxas, e acompanha o trabalho da Câmara. Tem ${ASSEMBLEIA.elected} membros eleitos diretamente e os quatro presidentes de junta.</p>
      <div class="grid2" style="margin-top:26px">
        <div class="info"><span class="ic">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>'}</span><h3>Sessões</h3><p>${esc(ASSEMBLEIA.sessions)} Qualquer pessoa pode assistir.</p></div>
        <div class="info"><span class="ic">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 5h16v11H8l-4 4z"/></svg>'}</span><h3>Intervir</h3><p>Os munícipes podem falar no período reservado ao público de cada sessão. As ordens de trabalhos saem por edital.</p><a class="more" href="/atualidade#editais">Ver editais →</a></div>
      </div>
    </div>
    <aside class="aside" style="position:static">
      <div class="box"><h2 class="bh">Mesa da Assembleia</h2>${facts([['Presidente', ASSEMBLEIA.president], ['1.ª secretária', ASSEMBLEIA.secretaries[0]], ['2.º secretário', ASSEMBLEIA.secretaries[1]]])}<a class="link sm" href="mailto:${ASSEMBLEIA.email}">${ASSEMBLEIA.email}</a></div>
    </aside>
  </div>
</section>

<section class="sec wrap" id="freguesias">
  <div class="h"><div><p class="k">Território</p><h2>As quatro juntas de freguesia</h2></div></div>
  <p class="lead">Desde a reorganização de 2013, o concelho tem quatro freguesias. O rio Douro passa por todas, e todas ficam, no todo ou em parte, no Parque Natural do Douro Internacional.</p>
  <div class="grid2" style="margin-top:30px">${FREGUESIAS.map(junta).join('\n')}</div>
</section>

<section class="sec wrap">
  <div class="split">
    <div class="prose">
      <h2 id="historia">História</h2>
      <p>A origem da vila perde-se nas lendas. Os historiadores ligam a região aos narbassos, um povo pré-romano citado por Ptolomeu. Na Idade Média foi terra de fronteira: atacada por Leão em 1211, cercada por Castela em 1236 e concedida como vila em 1240.</p>
      <ol class="timeline">
        <li><b>1248</b><p>Foral de D. Afonso III, a 27 de março, renovado em 1273.</p></li>
        <li><b>1307</b><p>Carta de feira de D. Dinis: a vila passa a ter uma feira mensal.</p></li>
        <li><b>1512</b><p>Foral novo de D. Manuel I, a 1 de outubro. Muito do casario manuelino é desta época.</p></li>
        <li><b>1673</b><p>Começa a construção do Convento de São Filipe Néri.</p></li>
        <li><b>1850</b><p>Nasce em Ligares o poeta Guerra Junqueiro.</p></li>
        <li><b>1898</b><p>O concelho, suprimido em 1896, é restaurado a 13 de janeiro.</p></li>
        <li><b>1910</b><p>A Igreja Matriz é classificada como Monumento Nacional.</p></li>
        <li><b>2015</b><p>Abre o Museu da Seda e do Território, na antiga Casa da Cadeia.</p></li>
      </ol>
      <h3>Personalidades</h3>
      <ul>
        <li><b>Guerra Junqueiro</b> (1850–1923), poeta, jornalista e deputado, nascido em Ligares e sepultado no Panteão Nacional.</li>
        <li><b>Jorge Álvares</b> (?–1521), navegador, o primeiro português a chegar à China por mar, em 1514. Dá nome à praça da Igreja Matriz.</li>
        <li><b>António José Antunes Navarro</b> (1803–1867), 1.º Conde de Lagoaça.</li>
      </ul>

      <h2 id="brasao">Brasão e lendas</h2>
      <figure class="crest-fig">${crest(150, 'crest-plain', 'Brasão do Município')}<figcaption>Escudo de púrpura com um freixo de ouro folhado de verde, entre duas espadas de ouro e dois escudetes das quinas. Coroa mural de prata e listel com a legenda “Vila de Freixo de Espada à Cinta”.</figcaption></figure>
      <p>Há várias lendas para o nome. A mais contada diz que D. Dinis, cansado das lutas com o filho Afonso Sanches, descansou à sombra de um grande freixo e lhe cravou a espada. Outra fala de um nobre que, depois de combater os mouros à beira do Douro, pendurou a espada num freixo. João de Barros ligou o nome a um fidalgo chamado Freixo, que teria edificado a vila.</p>
      <p>Junto à Igreja Matriz há um velho freixo que a população aceita como a árvore da lenda.</p>

      <h2 id="transparencia">Transparência</h2>
      <p>Os documentos de gestão, os regulamentos e os contratos do Município estão disponíveis para consulta. Os contratos públicos são publicados no portal BASE.</p>
      <ul class="docs">
        ${documents.map((d) => `<li><a href="#transparencia"><span class="ft">${d.kind}</span><span><b>${esc(d.title)}</b><small>${esc(d.sub)}</small></span><span class="dt"></span><span class="dl">Abrir</span></a></li>`).join('\n        ')}
      </ul>
    </div>
    <aside class="aside">
      <div class="box tint"><h2 class="bh">O concelho em resumo</h2>${facts([
        ['Área', `${num(MUNICIPIO.areaKm2)} km²`],
        ['Altitude média', `${MUNICIPIO.altitude} m`],
        ['Residentes (2021)', num(MUNICIPIO.residents2021)],
        ...MUNICIPIO.distances.map(([c, d]) => [`Até ${c}`, d]),
      ])}</div>
    </aside>
  </div>
</section>`;
