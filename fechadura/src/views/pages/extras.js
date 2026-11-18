import { VENUE } from '../../config/venue.js';
import { clock } from '../../../public/js/shared/pricing.js';
import { esc } from '../html.js';

export function logBody(log) {
  return `<section class="page-head wrap">
    <p class="kicker">Registo de fugas</p>
    <h1 class="display">Quem saiu, e em quanto tempo.</h1>
    <p class="lead">O game master escreve cada fuga no livro assim que a porta abre. Só entram as equipas que saíram dentro do tempo. As três primeiras pistas não contam, as seguintes ficam apontadas.</p>
    <nav class="chips ledger__months" aria-label="Mês">${log.months
      .map((m) => `<a class="chip" href="/registo${m.value === log.months[0].value ? '' : `?mes=${m.value}`}"${m.value === log.month ? ' aria-current="page"' : ''}>${esc(m.name)}</a>`)
      .join('')}</nav>
  </section>
  <section class="ledger wrap" aria-label="Livro de registos de ${esc(log.monthName)}">
    ${log.pages
      .map(
        (p) => `<article class="ledger__page" style="--accent:${p.room.color}">
        <header><p class="type ledger__case">Caso ${p.room.caseNo} · ${esc(log.monthName)}</p><h2 class="display"><a href="/salas/${p.room.slug}">${esc(p.room.name)}</a></h2><p class="type ledger__count">${p.escaped} de ${p.games} equipas saíram a tempo</p></header>
        ${
          p.entries.length
            ? `<table class="typed"><thead><tr><th scope="col">N.º</th><th scope="col">Equipa</th><th scope="col">Pessoas</th><th scope="col">Pistas</th><th scope="col">Tempo</th></tr></thead>
          <tbody>${p.entries.map((e, i) => `<tr><td>${i + 1}</td><th scope="row">${esc(e.team)}</th><td>${e.players}</td><td>${e.hints}</td><td><b>${clock(e.seconds)}</b></td></tr>`).join('')}</tbody></table>`
            : '<p class="empty">Ninguém saiu desta sala este mês.</p>'
        }
        <p class="ledger__limit type">Limite: ${p.room.duration}:00</p>
      </article>`,
      )
      .join('')}
  </section>
  <section class="section wrap ledger__foot">
    <p class="lead">Querem o vosso nome aqui? Escrevam o nome da equipa quando reservarem.</p>
    <a class="btn btn--brass" href="/reservar">Reservar uma sala</a>
  </section>`;
}

export const FAQ = [
  ['Preciso de experiência?', 'Não. A Cave da Avó foi pensada para quem nunca fez uma escape room. O Quarto 207 é a única sala que recomendamos só a quem já fez pelo menos duas.'],
  ['Quantas pessoas devem vir?', 'Entre 2 e 6, conforme a sala. Com 4 pessoas toda a gente tem sempre alguma coisa para fazer; com 6 é mais barato para cada um, mas há mais confusão.'],
  ['A partir de que idade?', 'Depende da sala: a partir dos 8 anos n’A Cave da Avó, dos 12 no Banco, dos 14 no Farol e dos 16 no Quarto 207. Menores de 16 vêm sempre com um adulto.'],
  ['E se não conseguirmos sair?', 'Ao fim do tempo, o game master abre a porta e conta-vos o que faltava. Ninguém fica fechado: há sempre um botão de saída, em todas as salas.'],
  ['Há pistas?', 'Sim, pelo walkie-talkie. Pedem quando quiserem. As três primeiras não contam para o registo de fugas, as seguintes ficam apontadas.'],
  ['Como se paga?', 'No fim, ao balcão, por grupo: cartão, MB Way ou dinheiro. Com voucher não se paga nada.'],
  ['Posso cancelar?', `Sim, até ${VENUE.cancelHours} horas antes, sem custos, na sua conta ou por telefone. Depois disso pedimos que avisem, para darmos a sessão a outra equipa.`],
  ['É acessível?', 'O Banco e A Cave são no rés-do-chão, sem degraus, com espaço para uma cadeira de rodas. O Farol e o Quarto 207 têm escadas estreitas.'],
  ['Fazem eventos de empresa e aniversários?', 'Sim. Com as quatro salas em simultâneo cabem até 23 pessoas, e há uma sala de estar para o lanche depois. Escrevam-nos para ola@fechadura.pt.'],
];

export function beforeBody() {
  return `<section class="page-head wrap">
    <p class="kicker">Antes de vir</p>
    <h1 class="display">Instruções para a vossa sessão.</h1>
  </section>
  <section class="wrap before">
    <article class="letter paper typed">
      <p class="letter__date">Porto, à atenção da equipa que reservou</p>
      <p>Caros detetives,</p>
      <p>Obrigado por escolherem uma das nossas portas. Para que corra tudo bem, leiam estas regras com atenção. Não são muitas.</p>
      <ol class="letter__rules">
        <li><b>Cheguem 15 minutos antes.</b> A sessão começa à hora marcada e não pode passar da hora seguinte. Se chegarem tarde, jogam menos tempo.</li>
        <li><b>O telemóvel fica no cacifo.</b> Fotografias lá dentro estragam o jogo a quem vem depois. Tiramos nós a fotografia da equipa, no fim.</li>
        <li><b>Nada se força.</b> Nenhuma pista precisa de força. Se uma coisa não abre, ainda não é a altura dela.</li>
        <li><b>Os autocolantes vermelhos não se mexem.</b> São do cenário, das luzes e das tomadas.</li>
        <li><b>Há sempre saída.</b> Todas as portas têm um botão verde que as abre por dentro. Ninguém fica fechado.</li>
      </ol>
      <p>Até breve,</p>
      <p class="letter__sign">Marco, game master</p>
      <span class="stamp letter__stamp">Lido e aprovado</span>
    </article>
    <aside class="before__side">
      <div class="keytag before__tag"><strong>Fechadura</strong>${esc(VENUE.street)}<br>${esc(VENUE.postalCode)} ${esc(VENUE.city)}<br>${esc(VENUE.phone)}</div>
      <ul class="before__list">
        <li><b>Porta</b> Verde, com um cadeado pintado. Toquem à campainha do rés-do-chão.</li>
        <li><b>Metro</b> Trindade, a 8 minutos a pé</li>
        <li><b>Estacionamento</b> Parque da Praça de Lisboa</li>
        <li><b>Roupa</b> Confortável. Há quem se ajoelhe e quem suba a um banco.</li>
      </ul>
    </aside>
  </section>
  <section class="section wrap faq" aria-labelledby="faq-title">
    <h2 id="faq-title" class="display faq__title">Perguntas que nos fazem sempre</h2>
    <div class="faq__list">${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
  </section>`;
}
