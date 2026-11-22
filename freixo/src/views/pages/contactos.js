import { EMERGENCY, EQUIPAMENTOS, FREGUESIAS, ISSUE_TYPES, MUNICIPIO, SOCIAL } from '../../config/municipio.js';
import { esc, facts, icon, pageHero } from '../html.js';

const consent = '<label class="check full field"><input type="checkbox" name="consent" value="true" required>Aceito que o Município use estes dados para responder ao meu pedido.</label>';
const tel = (n) => `<a href="tel:+351${n.replace(/\s/g, '')}">${esc(n)}</a>`;

export function contactosBody() {
  const { latitude: lat, longitude: lon } = MUNICIPIO.geo;
  const useful = EQUIPAMENTOS.filter((e) => e.phone);
  return `${pageHero({ photoKey: 'vila', crumbs: [['Contactos']], title: 'Fale com o <i>Município</i>', lead: 'Por telefone, por email, no atendimento ou pela mensagem abaixo. Respondemos em até cinco dias úteis.' })}

<section class="sec wrap">
  <h2 class="sr">Morada, horário e contactos</h2>
  <div class="grid4 contact-cards">
    <div class="info" data-reveal><span class="ic">${icon.pin}</span><h3>Morada</h3><p>${esc(MUNICIPIO.address)}<br>${esc(MUNICIPIO.postal)}</p></div>
    <div class="info" data-reveal style="--d:60ms"><span class="ic">${icon.phone}</span><h3>Telefone</h3><p class="big-line">${tel(MUNICIPIO.phone)}</p><p class="muted">Fax ${esc(MUNICIPIO.fax)}</p></div>
    <div class="info" data-reveal style="--d:120ms"><span class="ic">${icon.chat}</span><h3>Email</h3><p class="big-line"><a href="mailto:${MUNICIPIO.email}">${esc(MUNICIPIO.email)}</a></p></div>
    <div class="info" data-reveal style="--d:180ms"><span class="ic">${icon.clock}</span><h3>Horário</h3><p>Dias úteis<br>${MUNICIPIO.hours.map(([, h]) => h).join(' · ')}</p></div>
  </div>
  <div class="social-row">${SOCIAL.map(([n, u]) => `<a class="chip-link" href="${u}" rel="noopener">${n}</a>`).join('')}</div>
</section>

<section class="sec wrap" id="mensagem">
  <div class="split">
    <div>
      <p class="k">Mensagem</p>
      <h2 class="t2">Escreva-nos</h2>
      <p class="lead" style="margin-top:10px">Pedidos de informação, sugestões ou marcações. A mensagem chega ao serviço certo.</p>
      <form class="form" data-api="/mensagens" novalidate style="margin-top:26px">
        <label class="field">Nome<input name="name" required autocomplete="name"></label>
        <label class="field">Email<input name="email" type="email" required autocomplete="email"></label>
        <label class="field">Assunto<select name="subject"><option>Pedido de informação</option><option>Marcar atendimento</option><option>Apoios sociais</option><option>Águas e saneamento</option><option>Obras e urbanismo</option><option>Sugestão</option><option>Outro</option></select></label>
        <label class="field">Freguesia<select name="freguesia"><option value="">—</option>${FREGUESIAS.map((f) => `<option value="${f.slug}">${esc(f.name)}</option>`).join('')}</select></label>
        <label class="field full">Mensagem<textarea name="text" required minlength="10"></textarea></label>
        ${consent}
        <div class="full"><button class="btn purple" type="submit">Enviar mensagem</button><p class="ok" role="status">Mensagem recebida. Respondemos para o seu email em até cinco dias úteis.</p></div>
      </form>
    </div>
    <aside class="aside">
      <div class="box purple"><h2 class="bh">Emergência</h2>${facts(EMERGENCY.slice(0, 4))}</div>
      <div class="box tint"><h2 class="bh">Já tem conta?</h2><p>No Balcão Online faz pedidos e acompanha cada um até estar concluído.</p><a class="btn purple" href="/balcao">Entrar no Balcão Online</a></div>
    </aside>
  </div>
</section>

<section class="band" id="ocorrencia">
  <div class="narrow">
    <p class="k">Ocorrências</p>
    <h2 class="t2">Reportar um problema na rua</h2>
    <p class="lead" style="margin-top:10px">Buracos, iluminação pública, lixo ou sinalização. Diga-nos onde é: recebe um número para acompanhar.</p>
    <form class="form" data-api="/ocorrencias" novalidate style="margin-top:26px">
      <label class="field">Tipo de problema<select name="type">${ISSUE_TYPES.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></label>
      <label class="field">O seu nome (opcional)<input name="name" autocomplete="name"></label>
      <label class="field full">Onde é<input name="place" required minlength="4" placeholder="Rua, aldeia ou ponto de referência"></label>
      <label class="field full">O que se passa<textarea name="text" required minlength="10"></textarea></label>
      <div class="full"><button class="btn purple" type="submit">Enviar ocorrência</button><p class="ok" role="status">Ocorrência registada. Obrigado por ajudar a cuidar do concelho.</p></div>
    </form>
  </div>
</section>

<section class="sec wrap" id="telefones">
  <div class="h"><div><p class="k">Contactos úteis</p><h2>Equipamentos e serviços</h2></div><a href="/equipamentos">Equipamentos →</a></div>
  <ul class="phonebook">
    ${useful.map((e) => `<li><span>${esc(e.name)}</span>${tel(e.phone)}</li>`).join('\n    ')}
    <li><span>Águas e Saneamento</span>${tel(MUNICIPIO.phone)}</li>
    <li><span>Escola EB 2,3 de Freixo de Espada à Cinta</span>${tel('279 653 452')}</li>
    <li><span>Pré-escolar</span>${tel('279 653 342')}</li>
    <li><span>Santa Casa da Misericórdia</span>${tel('279 653 016')}</li>
  </ul>
</section>

<section class="sec wrap">
  <div class="h"><div><p class="k">Localização</p><h2>Como chegar</h2></div></div>
  <div class="map map--off" data-map="https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.03}%2C${lat - 0.02}%2C${lon + 0.03}%2C${lat + 0.02}&amp;layer=mapnik&amp;marker=${lat}%2C${lon}">
    <p>O mapa é do OpenStreetMap e só carrega se o pedir.</p>
    <button class="btn purple" type="button">${icon.pin}Mostrar o mapa</button>
  </div>
  <p class="muted" style="margin-top:10px">Pela EN221 (Guarda – Figueira de Castelo Rodrigo – Freixo – Miranda do Douro) ou pela EN325 a partir do IP2 em Torre de Moncorvo. Cerca de 140 km de Bragança e 235 km do Porto.</p>
</section>

<section class="band" id="freguesias">
  <div class="wrap">
    <div class="h"><div><p class="k">Juntas de freguesia</p><h2>Perto de si</h2></div><a href="/municipio#freguesias">Presidentes e moradas →</a></div>
    <div class="grid4">
      ${FREGUESIAS.map((f) => `<div class="info"><h3>${esc(f.name)}</h3><p>${esc(f.address)}</p><p class="big-line">${tel(f.phone)}</p><p class="muted">${esc(f.hours)}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="sec narrow">
  <div class="prose" style="max-width:none">
    <h2 id="acessibilidade">Acessibilidade</h2>
    <p>Este site foi pensado para ser usado por todos: o texto tem contraste suficiente, pode ser aumentado sem perder conteúdo, todas as funções se usam com o teclado, as animações param se o sistema pedir menos movimento e as imagens têm descrição. Se encontrar alguma barreira, <a href="#mensagem">diga-nos</a>.</p>
    <h2 id="dados">Proteção de dados</h2>
    <p>O Município trata os seus dados apenas para responder aos pedidos que faz e cumprir as suas obrigações legais, de acordo com o Regulamento Geral sobre a Proteção de Dados. Pode pedir para consultar, corrigir ou apagar os seus dados através do encarregado de proteção de dados.</p>
    <h2 id="reclamacoes">Livro de reclamações e denúncias</h2>
    <p>Pode reclamar no livro físico, no atendimento do Município, ou no Livro de Reclamações Eletrónico. Para denunciar uma irregularidade com garantia de confidencialidade, use o Canal de Denúncias.</p>
  </div>
</section>`;
}
