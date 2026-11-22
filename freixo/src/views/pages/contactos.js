import { FREGUESIAS, ISSUE_TYPES, MUNICIPIO } from '../../config/municipio.js';
import { esc, icon, pageHero } from '../html.js';

const consent = '<label class="check full field"><input type="checkbox" name="consent" value="true" required>Aceito que o Município use estes dados para responder ao meu pedido.</label>';

export function contactosBody() {
  const { latitude: lat, longitude: lon } = MUNICIPIO.geo;
  return `${pageHero({ photoKey: 'vila', crumbs: [['Contactos']], title: 'Fale com o <i>Município</i>', lead: 'Presencialmente, pela mensagem abaixo ou no Balcão Online. Respondemos em até cinco dias úteis.' })}

<section class="sec wrap">
  <div class="grid3">
    <div class="info"><span class="ic">${icon.pin}</span><h3>Paços do Concelho</h3><p>${esc(MUNICIPIO.short)}<br>${MUNICIPIO.postalCode} ${esc(MUNICIPIO.short)}</p></div>
    <div class="info"><span class="ic">${icon.clock}</span><h3>Horário</h3><p>Dias úteis<br>${MUNICIPIO.hours.map(([, h]) => h).join(' · ')}</p></div>
    <div class="info"><span class="ic">${icon.phone}</span><h3>Telefone e email</h3><p>Telefone geral (indicativo ${MUNICIPIO.dialCode}) e email geral do Município.</p><p class="muted">Contactos a confirmar com o Município.</p></div>
  </div>
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
        <label class="field">Assunto<select name="subject"><option>Pedido de informação</option><option>Marcar atendimento</option><option>Sugestão</option><option>Habitação</option><option>Outro</option></select></label>
        <label class="field">Freguesia<select name="freguesia"><option value="">—</option>${FREGUESIAS.map((f) => `<option value="${f.slug}">${esc(f.name)}</option>`).join('')}</select></label>
        <label class="field full">Mensagem<textarea name="text" required minlength="10"></textarea></label>
        ${consent}
        <div class="full"><button class="btn purple" type="submit">Enviar mensagem</button><p class="ok" role="status">Mensagem recebida. Respondemos para o seu email em até cinco dias úteis.</p></div>
      </form>
    </div>
    <aside class="aside">
      <div class="box purple"><h2 class="bh">Emergências</h2><p>Em caso de perigo imediato, ligue 112. Para avarias graves na rede de água fora de horas, use a linha de piquete indicada na fatura.</p></div>
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

<section class="sec wrap">
  <div class="h"><div><p class="k">Localização</p><h2>Como chegar</h2></div></div>
  <iframe class="map" title="Mapa de Freixo de Espada à Cinta" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.03}%2C${lat - 0.02}%2C${lon + 0.03}%2C${lat + 0.02}&amp;layer=mapnik&amp;marker=${lat}%2C${lon}"></iframe>
  <p class="muted" style="margin-top:10px">Pela EN221 (Guarda – Figueira de Castelo Rodrigo – Freixo – Miranda do Douro) ou pela EN325 a partir do IP2 em Torre de Moncorvo. Mapa © colaboradores do OpenStreetMap.</p>
</section>

<section class="band" id="freguesias">
  <div class="wrap">
    <div class="h"><div><p class="k">Juntas de freguesia</p><h2>Perto de si</h2></div></div>
    <div class="grid4">
      ${FREGUESIAS.map((f) => `<div class="info"><h3>${esc(f.name)}</h3><p>${esc(f.note)}. Atestados, recenseamento e licenças de canídeos.</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="sec narrow">
  <div class="prose" style="max-width:none">
    <h2 id="acessibilidade">Acessibilidade</h2>
    <p>Este site foi pensado para ser usado por todos: o texto tem contraste suficiente, pode ser aumentado sem perder conteúdo, todas as funções se usam com o teclado e as imagens têm descrição. Se encontrar alguma barreira, <a href="#mensagem">diga-nos</a>.</p>
    <p>Os Paços do Concelho têm entrada acessível. Se precisar de apoio no atendimento, avise ao marcar.</p>
    <h2 id="dados">Proteção de dados</h2>
    <p>O Município trata os seus dados apenas para responder aos pedidos que faz e cumprir as suas obrigações legais, de acordo com o Regulamento Geral sobre a Proteção de Dados. Pode pedir para consultar, corrigir ou apagar os seus dados através do encarregado de proteção de dados.</p>
    <h2 id="reclamacoes">Livro de reclamações</h2>
    <p>Pode apresentar uma reclamação no livro físico, nos Paços do Concelho, ou no Livro de Reclamações Eletrónico.</p>
  </div>
</section>`;
}
