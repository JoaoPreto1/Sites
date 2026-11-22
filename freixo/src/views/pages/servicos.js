import { SERVICE_CATEGORIES } from '../../config/municipio.js';
import { esc, facts, icon, pageHero } from '../html.js';

const ACTIONS = {
  leitura: ['Comunicar leitura', '/balcao#agua'],
  faturas: ['Ver as minhas faturas', '/balcao#agua'],
  ocorrencia: ['Reportar agora', '/contactos#ocorrencia'],
};

function action(s) {
  if (ACTIONS[s.action]) return ACTIONS[s.action];
  return s.online ? ['Pedir no Balcão Online', `/balcao?servico=${s.slug}#novo`] : ['Marcar atendimento', '/contactos#mensagem'];
}

const service = (s) => {
  const [label, href] = action(s);
  return `<details class="svc" id="${s.slug}" data-cat="${s.cat}"><summary><span><b>${esc(s.title)}</b><small>${esc(s.sub)}</small></span><span class="tag ${s.online ? 'on' : 'pres'}">${s.online ? 'Online' : 'Presencial'}</span><i aria-hidden="true">+</i></summary>
  <div class="in"><div><h3 class="sh">${esc(s.list.title)}</h3><ul>${s.list.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul><a class="btn purple" href="${href}">${label}</a></div>${facts(s.facts)}</div></details>`;
};

export function servicosBody({ services, cat, q }) {
  const count = (c) => services.filter((s) => s.cat === c).length;
  return `${pageHero({ photoKey: 'penedo', crumbs: [['Serviços']], title: 'Serviços <i>municipais</i>', lead: 'Para cada serviço: o que precisa de levar, quanto tempo demora e se o pode tratar online.', credit: false })}

<section class="sec wrap">
  <div class="cta" style="margin-bottom:56px"><div><h2>Balcão Online</h2><p>Entre na sua conta para fazer pedidos, acompanhar o estado de cada processo, pagar a fatura da água e comunicar leituras. Está disponível 24 horas por dia.</p></div><a class="btn gold" href="/balcao">Entrar no Balcão Online</a></div>

  <div class="catalog">
    <ul class="cats" aria-label="Categorias">
      <li><button type="button" data-cat="todos"${!cat ? ' class="on"' : ''}>Todos <span>${services.length}</span></button></li>
      ${SERVICE_CATEGORIES.map(([v, label]) => `<li><button type="button" data-cat="${v}"${cat === v ? ' class="on"' : ''}>${label} <span>${count(v)}</span></button></li>`).join('\n      ')}
    </ul>

    <div data-catalog>
      <label class="fsearch">${icon.search}<input type="search" value="${esc(q ?? '')}" placeholder="Procure um serviço (ex.: água, licença, cartão social)" aria-label="Procurar serviço"></label>
      <p class="muted" data-count aria-live="polite"></p>
      ${services.map(service).join('\n      ')}
      <p class="empty">Não encontrámos esse serviço. Tente outra palavra ou <a class="link" href="/contactos#mensagem">envie-nos uma mensagem</a>.</p>
    </div>
  </div>
</section>

<section class="sec wrap">
  <div class="grid3">
    <div class="info"><span class="ic">${icon.chat}</span><h3>Não encontra o que procura?</h3><p>Envie-nos uma mensagem e encaminhamos para o serviço certo.</p><a class="more" href="/contactos#mensagem">Escrever ao Município →</a></div>
    <div class="info"><span class="ic">${icon.doc}</span><h3>Taxas e regulamentos</h3><p>Valores das taxas municipais e regulamentos em vigor.</p><a class="more" href="/municipio#transparencia">Consultar →</a></div>
    <div class="info"><span class="ic">${icon.clock}</span><h3>Horários de atendimento</h3><p>Dias úteis, das 9h00 às 12h30 e das 14h00 às 17h30.</p><a class="more" href="/contactos">Ver contactos →</a></div>
  </div>
</section>`;
}
