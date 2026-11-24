import { dateLong, dateShort, dateTime, esc, euros, monthName, toCents } from '../format.js';
import { toast } from '../utils.js';

// A sessão da equipa vive só neste separador (sessionStorage) e expira em 30 minutos
const KEY = 'amparo.staff';
const token = () => {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
};
const setToken = (t) => {
  try {
    t ? sessionStorage.setItem(KEY, t) : sessionStorage.removeItem(KEY);
  } catch {}
};

async function gapi(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api/gestao${path}`, {
    method,
    headers: { Accept: 'application/json', ...(body && { 'Content-Type': 'application/json' }), ...(token() && { Authorization: `Bearer ${token()}` }) },
    body: body && JSON.stringify(body),
  });
  if (res.status === 401 && path !== '/entrar') {
    setToken(null);
    window.location.replace('/gestao');
    throw new Error('Sessão expirada');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.details?.[0]?.message ?? data.error ?? 'Erro'), { status: res.status });
  return data;
}

const $ = (s, r = document) => r.querySelector(s);
const STATUS = { em_analise: 'Em análise', alteracoes: 'Alterações pedidas', ativo: 'Ativo', recusado: 'Recusado', suspenso: 'Suspenso', concluido: 'Concluído' };
const PUBLIC = { privado: 'privada', pedido: 'pede partilha pública', aprovado: 'imagem pública', recusado: 'partilha recusada' };
const FLAG = { email: 'email', iban: 'IBAN', telefone: 'telefone', identificacao: 'nº de identificação', morada: 'morada', codigo_postal: 'código postal' };

/* Entrar */
const loginForm = $('#staff-login');
if (loginForm) {
  if (token()) window.location.replace('/gestao/painel');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = loginForm.querySelector('[type=submit]');
    button.disabled = true;
    try {
      const { token: t } = await gapi('/entrar', { method: 'POST', body: { email: loginForm.email.value, password: loginForm.password.value } });
      setToken(t);
      window.location.href = '/gestao/painel';
    } catch (err) {
      toast(err.message, { type: 'error' });
    } finally {
      button.disabled = false;
    }
  });
}

/* Painel */
const view = $('[data-view]');
let me;

const SECTIONS = [
  ['resumo', 'Resumo', null],
  ['moderacao', 'Moderação', 'moderar'],
  ['denuncias', 'Denúncias', 'denuncias'],
  ['fundos', 'Doações e entregas', 'fundos'],
  ['plataforma', 'Custos da plataforma', 'plataforma'],
  ['dados', 'Contas e dados', 'utilizadores'],
  ['registos', 'Registo de ações', 'registos'],
  ['equipa', 'Equipa', 'equipa'],
  ['lancamento', 'Lançamento', 'lancamento'],
  ['sessao', 'A minha sessão', null],
];
const can = (p) => !p || me.permissions.includes(p);

if (view) {
  if (!token()) window.location.replace('/gestao');
  else start();
}

async function start() {
  const { member, demo } = await gapi('/eu');
  me = member;
  $('[data-who]').innerHTML = `<b>${esc(me.name)}</b><small>${me.role === 'dono' ? 'Dono da plataforma' : 'Equipa'}</small>`;
  $('[data-demo]').hidden = !demo;
  const nav = $('[data-nav]');
  nav.innerHTML = SECTIONS.filter(([, , p]) => can(p)).map(([id, l]) => `<a href="#${id}">${l}</a>`).join('');
  $('[data-logout]').addEventListener('click', () => {
    setToken(null);
    window.location.href = '/gestao';
  });
  window.addEventListener('hashchange', route);
  route();
}

function route() {
  const id = location.hash.slice(1) || 'resumo';
  const section = SECTIONS.find(([s, , p]) => s === id && can(p)) ?? SECTIONS[0];
  document.querySelectorAll('[data-nav] a').forEach((a) => a.toggleAttribute('aria-current', a.getAttribute('href') === `#${section[0]}`));
  view.innerHTML = '<p class="empty">A carregar…</p>';
  RENDER[section[0]]().catch((err) => (view.innerHTML = `<p class="notice notice--error">${esc(err.message)}</p>`));
}

const head = (title, text = '') => `<header class="gest__head"><h1>${title}</h1>${text ? `<p class="hint">${text}</p>` : ''}</header>`;
const act = async (fn, okMessage) => {
  try {
    await fn();
    if (okMessage) toast(okMessage);
    route();
  } catch (err) {
    toast(err.message, { type: 'error' });
  }
};

// Provas privadas: abertas a partir de um blob com o token da equipa, e cada abertura fica registada
async function openDoc(id) {
  const win = window.open('', '_blank');
  const res = await fetch(`/api/gestao/documentos/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
  if (!res.ok) {
    win?.close();
    return toast('Sem permissão para ver provas privadas.', { type: 'error' });
  }
  const url = URL.createObjectURL(await res.blob());
  if (win) win.location.href = url;
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

const RENDER = {
  async resumo() {
    const r = await gapi('/resumo');
    const tiles = [
      r.pendingAds !== undefined && ['#moderacao', 'Pedidos por moderar', r.pendingAds],
      r.pendingReports !== undefined && ['#denuncias', 'Denúncias por tratar', r.pendingReports],
      r.pendingDataRequests !== undefined && ['#dados', 'Pedidos de eliminação', r.pendingDataRequests],
      r.awaitingDeliveryCents !== undefined && ['#fundos', 'Por entregar', euros(r.awaitingDeliveryCents)],
      r.fund && ['#plataforma', 'Fundo da plataforma', `${euros(r.fund.balanceCents)} · ${String(r.fund.monthsCovered).replace('.', ',')} meses`],
      r.launch && ['#lancamento', 'Lançamento', `${r.launch.items.length - r.launch.pending} de ${r.launch.items.length} definidos`],
    ].filter(Boolean);
    view.innerHTML = `${head(`Olá, ${esc(me.name.split(' ')[0])}`, `Vê apenas as funções que o dono lhe atribuiu: ${me.permissions.length} permissões. Tudo o que fizer aqui fica registado.`)}
      <div class="tiles">${tiles.map(([h, l, v]) => `<a class="tile" href="${h}"><small>${l}</small><b>${v}</b></a>`).join('') || '<p class="empty">Sem funções atribuídas. Fale com o dono da plataforma.</p>'}</div>`;
  },

  async moderacao() {
    const estado = sessionStorage.getItem('gest.estado') ?? 'em_analise';
    const { ads } = await gapi(`/anuncios?estado=${estado}`);
    view.innerHTML = `${head('Moderação', 'Antes de aprovar confirme os três pontos. Abrir uma prova privada fica registado com o seu nome.')}
      <div class="seg">${[['em_analise', 'Por moderar'], ['ativo', 'Ativos'], ['alteracoes', 'Com alterações pedidas'], ['suspenso', 'Suspensos'], ['recusado', 'Recusados'], ['todos', 'Todos']].map(([v, l]) => `<button type="button" data-estado="${v}" aria-pressed="${v === estado}">${l}</button>`).join('')}</div>
      ${ads.length ? ads.map(modCard).join('') : '<p class="empty">Nada nesta lista.</p>'}`;
    view.querySelectorAll('[data-estado]').forEach((b) => b.addEventListener('click', () => (sessionStorage.setItem('gest.estado', b.dataset.estado), route())));
    view.querySelectorAll('[data-doc-view]').forEach((b) => b.addEventListener('click', () => openDoc(b.dataset.docView)));
    view.querySelectorAll('[data-doc]').forEach((b) =>
      b.addEventListener('click', () => act(() => gapi(`/documentos/${b.dataset.doc}`, { method: 'PATCH', body: JSON.parse(b.dataset.body) }), 'Prova atualizada.')),
    );
    view.querySelectorAll('form[data-decide]').forEach((f) =>
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const decision = e.submitter.value;
        const checks = [...f.querySelectorAll('[name=check]:checked')].map((c) => c.value);
        act(() => gapi(`/anuncios/${f.dataset.decide}/decisao`, { method: 'POST', body: { decision, note: f.note.value, checks } }), 'Decisão registada.');
      }),
    );
  },

  async denuncias() {
    const { reports } = await gapi('/denuncias?estado=pendente');
    view.innerHTML = `${head('Denúncias', 'Dados pessoais expostos aparecem primeiro. Quem criou o pedido nunca sabe quem denunciou.')}
      ${reports.length ? reports.map((r) => `<article class="gcard${r.priority === 'alta' ? ' gcard--urgent' : ''}">
        <header><span class="status status--${r.priority === 'alta' ? 'recusado' : 'pendente'}">${r.priority === 'alta' ? 'Prioridade alta' : 'Normal'}</span><h2>${esc(r.reasonLabel)}</h2><p class="hint">${dateTime(r.createdAt)} · pedido: <a href="/pedidos/${esc(r.ad?.slug)}" target="_blank">${esc(r.ad?.title)}</a> (${STATUS[r.ad?.status]})</p></header>
        ${r.details ? `<blockquote>${esc(r.details)}</blockquote>` : ''}
        <details><summary>Ver o texto do pedido</summary><p>${esc(r.ad?.story)}</p></details>
        <form data-resolve="${r.id}"><div class="field"><label>Nota <small>(enviada a quem criou o pedido se pedir alterações)</small></label><textarea name="note" rows="2" maxlength="600"></textarea></div>
        <div class="gacts"><button class="btn btn--sm" name="r" value="sem_fundamento">Sem fundamento</button><button class="btn btn--sm" name="r" value="pedir_alteracoes">Suspender e pedir alterações</button><button class="btn btn--sm btn--danger" name="r" value="suspender">Suspender o pedido</button></div></form>
      </article>`).join('') : '<p class="empty">Não há denúncias por tratar.</p>'}`;
    view.querySelectorAll('[data-resolve]').forEach((f) =>
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        act(() => gapi(`/denuncias/${f.dataset.resolve}/resolver`, { method: 'POST', body: { resolution: e.submitter.value, note: f.note.value } }), 'Denúncia tratada.');
      }),
    );
  },

  async fundos() {
    const [{ ads, payouts }, { donations }] = await Promise.all([gapi('/entregas'), gapi('/doacoes')]);
    view.innerHTML = `${head('Doações e entregas', 'Quem doou nunca aparece aqui. Cada entrega fica registada com o nome de quem a registou.')}
      <h2 class="gest__h2">Por entregar</h2>
      <div class="table-wrap"><table class="data"><thead><tr><th>Pedido</th><th>Estado</th><th class="num">Recebido</th><th class="num">Entregue</th><th class="num">Por entregar</th></tr></thead><tbody>${ads.map((a) => `<tr><td>${esc(a.title)}</td><td><span class="status status--${a.status}">${esc(a.statusLabel)}</span></td><td class="num">${euros(a.raisedCents)}</td><td class="num">${euros(a.deliveredCents)}</td><td class="num"><b>${euros(a.pendingCents)}</b></td></tr>`).join('')}</tbody></table></div>
      <form class="box" id="payout"><h2>Registar uma entrega</h2>
        <div class="row2"><div class="field"><label for="po-ad">Pedido</label><select id="po-ad" name="adId" required>${ads.filter((a) => a.pendingCents > 0).map((a) => `<option value="${a.id}">${esc(a.title)} · ${euros(a.pendingCents)}</option>`).join('')}</select></div>
        <div class="field"><label for="po-amount">Montante</label><div class="euro-input"><input id="po-amount" name="amount" inputmode="decimal" required></div></div></div>
        <div class="field"><label for="po-method">Como foi entregue</label><input id="po-method" name="method" required placeholder="Ex.: pagamento direto da fatura ao fornecedor"></div>
        <div class="field"><label for="po-note">Nota</label><input id="po-note" name="note" maxlength="300"></div>
        <button class="btn btn--ink" type="submit">Registar entrega</button></form>
      <h2 class="gest__h2">Últimas entregas</h2>
      <div class="table-wrap"><table class="data"><thead><tr><th>Data</th><th>Pedido</th><th>Como</th><th class="num">Valor</th></tr></thead><tbody>${payouts.map((p) => `<tr><td>${dateShort(p.createdAt)}</td><td>${esc(ads.find((a) => a.id === p.adId)?.title ?? p.adId)}</td><td>${esc(p.method)}</td><td class="num">${euros(p.cents)}</td></tr>`).join('') || '<tr><td colspan="4">Ainda não há entregas.</td></tr>'}</tbody></table></div>
      <h2 class="gest__h2">Últimas doações</h2>
      <div class="table-wrap"><table class="data"><thead><tr><th>Data</th><th>Pedido</th><th>Estado</th><th class="num">Pago</th><th class="num">Comissão</th><th class="num">Para o pedido</th></tr></thead><tbody>${donations.slice(0, 30).map((d) => `<tr><td>${dateShort(d.createdAt)}</td><td>${esc(d.ad)}</td><td><span class="status status--${d.status}">${esc(d.status)}</span></td><td class="num">${euros(d.chargedCents)}</td><td class="num">${euros(d.feeCents)}</td><td class="num">${euros(d.amountCents)}</td></tr>`).join('')}</tbody></table></div>`;
    $('#payout').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      act(() => gapi('/entregas', { method: 'POST', body: { adId: f.adId.value, amount: toCents(f.amount.value) / 100, method: f.elements.method.value, note: f.note.value } }), 'Entrega registada.');
    });
  },

  async plataforma() {
    const fund = await gapi('/plataforma');
    const now = new Date().toISOString().slice(0, 7);
    view.innerHTML = `${head('Custos da plataforma', 'Dinheiro separado dos pedidos. Os custos mensais são definidos pelo dono em “Lançamento”.')}
      <div class="tiles"><div class="tile"><small>Custo mensal</small><b>${euros(fund.monthlyCents)}</b></div><div class="tile"><small>Recebido este mês</small><b>${euros(fund.monthCents)}</b></div><div class="tile"><small>Saldo</small><b>${euros(fund.balanceCents)}</b></div><div class="tile"><small>Meses cobertos</small><b>${String(fund.monthsCovered).replace('.', ',')}</b></div></div>
      <form class="box" id="expense"><h2>Registar despesa paga</h2><div class="row2"><div class="field"><label for="ex-month">Mês</label><input id="ex-month" name="month" type="month" value="${now}" required></div><div class="field"><label for="ex-amount">Valor</label><div class="euro-input"><input id="ex-amount" name="amount" inputmode="decimal" required></div></div></div>
      <div class="field"><label for="ex-label">Despesa</label><input id="ex-label" name="label" required placeholder="Ex.: Alojamento de novembro"></div><div class="field"><label for="ex-note">Nota</label><input id="ex-note" name="note"></div><button class="btn btn--ink" type="submit">Registar</button></form>
      <div class="table-wrap"><table class="data"><thead><tr><th>Mês</th><th>Despesa</th><th class="num">Valor</th></tr></thead><tbody>${fund.expenses.map((e) => `<tr><td>${esc(monthName(e.month))}</td><td>${esc(e.label)}</td><td class="num">${euros(e.cents)}</td></tr>`).join('')}</tbody></table></div>`;
    $('#expense').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      act(() => gapi('/despesas', { method: 'POST', body: { month: f.month.value, label: f.label.value, amount: toCents(f.amount.value) / 100, note: f.note.value } }), 'Despesa registada.');
    });
  },

  async dados() {
    const { requests } = await gapi('/pedidos-dados');
    view.innerHTML = `${head('Contas e dados', 'Pedidos de eliminação feitos pelas pessoas na sua conta. Ao concluir, apagam-se provas e mensagens, fecham-se os pedidos e as doações ficam sem nome.')}
      ${requests.length ? `<div class="table-wrap"><table class="data"><thead><tr><th>Data</th><th>Conta</th><th>Motivo</th><th>Pedidos ativos</th><th>Estado</th><th></th></tr></thead><tbody>${requests.map((r) => `<tr><td>${dateShort(r.createdAt)}</td><td>${esc(r.user?.email ?? '')}</td><td>${esc(r.reason || '—')}</td><td>${r.activeAds}</td><td><span class="status status--${r.status === 'pendente' ? 'pendente' : 'concluido'}">${r.status}</span></td><td>${r.status === 'pendente' ? `<button class="btn btn--sm btn--danger" data-del="${r.id}">Eliminar conta</button>` : esc(r.handledBy ?? '')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">Não há pedidos de eliminação.</p>'}`;
    view.querySelectorAll('[data-del]').forEach((b) =>
      b.addEventListener('click', () => confirm('Eliminar esta conta? Não se pode desfazer.') && act(() => gapi(`/pedidos-dados/${b.dataset.del}/concluir`, { method: 'POST' }), 'Conta eliminada.')),
    );
  },

  async registos() {
    const filter = sessionStorage.getItem('gest.staff') ?? '';
    const { entries, staff } = await gapi(`/registos${filter ? `?staffId=${encodeURIComponent(filter)}` : ''}`);
    view.innerHTML = `${head('Registo de ações', 'Só de leitura: as entradas não podem ser alteradas nem apagadas.')}
      <div class="field field--inline"><label for="lg-staff">Pessoa</label><select id="lg-staff"><option value="">Toda a equipa</option>${staff.map((s) => `<option value="${s.id}"${s.id === filter ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
      <div class="table-wrap"><table class="data"><thead><tr><th>Quando</th><th>Quem</th><th>Ação</th><th>Alvo</th><th>Detalhe</th><th>IP</th></tr></thead><tbody>${entries.map((e) => `<tr><td>${dateTime(e.createdAt)}</td><td>${esc(e.staffName)}</td><td><code>${esc(e.action)}</code></td><td><code>${esc(e.target.slice(0, 14))}</code></td><td>${esc(e.details)}</td><td>${esc(e.ip ?? '')}</td></tr>`).join('')}</tbody></table></div>`;
    $('#lg-staff').addEventListener('change', (e) => (sessionStorage.setItem('gest.staff', e.target.value), route()));
  },

  async equipa() {
    const { staff } = await gapi('/equipa');
    const perms = PERMS;
    view.innerHTML = `${head('Equipa', 'Só o dono cria credenciais. Cada pessoa tem email e palavra-passe próprios e só vê as funções marcadas.')}
      ${staff.map((m) => `<article class="gcard"><header><h2>${esc(m.name)}</h2><p class="hint">${esc(m.email)} · ${m.role === 'dono' ? 'Dono: todas as funções' : m.active ? 'Ativo' : 'Desativado'}${m.locked ? ' · bloqueado por tentativas falhadas' : ''}${m.lastLoginAt ? ` · última entrada ${dateTime(m.lastLoginAt)}` : ''}</p></header>
        ${m.role === 'dono' ? '' : `<form data-member="${m.id}"><div class="perms">${perms.map(([p, l, h]) => `<label class="check"><input type="checkbox" name="perm" value="${p}"${m.permissions.includes(p) ? ' checked' : ''}><span><b>${l}</b><small>${h}</small></span></label>`).join('')}</div>
        <div class="gacts"><button class="btn btn--sm btn--ink" value="save">Guardar permissões</button><button class="btn btn--sm" value="${m.active ? 'off' : 'on'}">${m.active ? 'Desativar' : 'Reativar'}</button><button class="btn btn--sm btn--ghost" value="pass">Nova palavra-passe</button></div></form>`}
      </article>`).join('')}
      <form class="box" id="new-member"><h2>Criar credenciais</h2><div class="row2"><div class="field"><label for="nm-name">Nome</label><input id="nm-name" name="name" required></div><div class="field"><label for="nm-email">Email</label><input id="nm-email" name="email" type="email" required></div></div>
      <div class="field"><label for="nm-pass">Palavra-passe inicial</label><input id="nm-pass" name="password" type="text" minlength="10" required autocomplete="off"><small>Pelo menos 10 caracteres. Entregue-a por um canal seguro e peça que a mude.</small></div>
      <div class="perms">${perms.map(([p, l, h]) => `<label class="check"><input type="checkbox" name="perm" value="${p}"><span><b>${l}</b><small>${h}</small></span></label>`).join('')}</div>
      <button class="btn btn--ink" type="submit">Criar credenciais</button></form>`;
    view.querySelectorAll('[data-member]').forEach((f) =>
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = e.submitter.value;
        const id = f.dataset.member;
        if (v === 'save') return act(() => gapi(`/equipa/${id}`, { method: 'PATCH', body: { permissions: [...f.querySelectorAll('[name=perm]:checked')].map((c) => c.value) } }), 'Permissões guardadas.');
        if (v === 'on' || v === 'off') return act(() => gapi(`/equipa/${id}`, { method: 'PATCH', body: { active: v === 'on' } }), v === 'on' ? 'Credenciais reativadas.' : 'Credenciais desativadas.');
        const password = prompt('Nova palavra-passe (pelo menos 10 caracteres):');
        if (password) act(() => gapi(`/equipa/${id}`, { method: 'PATCH', body: { password } }), 'Palavra-passe alterada.');
      }),
    );
    $('#new-member').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      act(() => gapi('/equipa', { method: 'POST', body: { name: f.name.value, email: f.email.value, password: f.password.value, permissions: [...f.querySelectorAll('[name=perm]:checked')].map((c) => c.value) } }), 'Credenciais criadas.');
    });
  },

  async lancamento() {
    const { fees, costs, launch, demo } = await gapi('/lancamento');
    view.innerHTML = `${head('Lançamento', `Enquanto faltarem pontos, a plataforma só aceita o prestador de demonstração${demo ? ' (é o que está ligado agora)' : ''}. Faltam ${launch.pending} de ${launch.items.length}.`)}
      <form class="box" id="fees"><h2>Comissões</h2><div class="row3">
        <div class="field"><label for="f-pp">Prestador (%)</label><input id="f-pp" name="providerPercent" inputmode="decimal" value="${fees.providerPercent}"></div>
        <div class="field"><label for="f-pf">Prestador, fixo (cêntimos)</label><input id="f-pf" name="providerFixedCents" inputmode="numeric" value="${fees.providerFixedCents}"></div>
        <div class="field"><label for="f-pl">Plataforma (%)</label><input id="f-pl" name="platformPercent" inputmode="decimal" value="${fees.platformPercent}"></div></div>
        <label class="check"><input type="checkbox" name="confirmed"${fees.confirmed ? ' checked' : ''}> Valores confirmados com o prestador (deixam de aparecer como “exemplo”)</label>
        <button class="btn btn--ink" type="submit">Guardar comissões</button></form>
      <form class="box" id="costs"><h2>Custos mensais da plataforma</h2><p class="hint">A meta mensal e os meses cobertos são calculados a partir destes valores.</p>
        ${costs.map((c, i) => `<div class="row2 cost-row"><div class="field"><label for="c-l${i}">Custo</label><input id="c-l${i}" name="label" data-id="${esc(c.id)}" value="${esc(c.label)}"></div><div class="field"><label for="c-v${i}">Valor por mês</label><div class="euro-input"><input id="c-v${i}" name="value" inputmode="decimal" value="${(c.cents / 100).toFixed(2).replace('.', ',')}"></div></div></div>`).join('')}
        <p class="mono" data-total></p><button class="btn btn--ink" type="submit">Guardar custos</button></form>
      <form class="box" id="launch"><h2>Antes de aceitar dinheiro real</h2>
        ${launch.items.map((i) => `<div class="launch-item"><label class="check"><input type="checkbox" name="${i.id}"${i.done ? ' checked' : ''}><span><b>${esc(i.title)}</b><small>${esc(i.text)}</small></span></label><input name="${i.id}-note" value="${esc(i.note)}" placeholder="O que foi decidido (aparece no site quando marcado)" aria-label="Decisão: ${esc(i.title)}"></div>`).join('')}
        <button class="btn btn--ink" type="submit">Guardar lista</button></form>`;
    const sumCosts = () => {
      const total = [...view.querySelectorAll('#costs [name=value]')].reduce((s, i) => s + (toCents(i.value) || 0), 0);
      $('[data-total]').textContent = `Total: ${euros(total)} por mês`;
    };
    $('#costs').addEventListener('input', sumCosts);
    sumCosts();
    $('#fees').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      act(() => gapi('/lancamento', { method: 'PATCH', body: { fees: { providerPercent: Number(f.providerPercent.value.replace(',', '.')), providerFixedCents: Number(f.providerFixedCents.value), platformPercent: Number(f.platformPercent.value.replace(',', '.')), confirmed: f.confirmed.checked } } }), 'Comissões guardadas.');
    });
    $('#costs').addEventListener('submit', (e) => {
      e.preventDefault();
      const rows = [...view.querySelectorAll('.cost-row')].map((r) => ({ id: r.querySelector('[name=label]').dataset.id, label: r.querySelector('[name=label]').value, cents: toCents(r.querySelector('[name=value]').value) }));
      act(() => gapi('/lancamento', { method: 'PATCH', body: { costs: rows } }), 'Custos guardados. A meta e os meses cobertos foram recalculados.');
    });
    $('#launch').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const body = Object.fromEntries(launch.items.map((i) => [i.id, { done: f[i.id].checked, note: f[`${i.id}-note`].value }]));
      act(() => gapi('/lancamento', { method: 'PATCH', body: { launch: body } }), 'Lista guardada.');
    });
  },

  async sessao() {
    view.innerHTML = `${head('A minha sessão', 'A sessão da gestão expira ao fim de 30 minutos e termina ao fechar o separador.')}
      <form class="box" id="own-pass"><h2>Mudar palavra-passe</h2><div class="field"><label for="op-c">Atual</label><input id="op-c" name="currentPassword" type="password" autocomplete="current-password" required></div><div class="field"><label for="op-n">Nova</label><input id="op-n" name="newPassword" type="password" autocomplete="new-password" minlength="10" required></div><button class="btn btn--ink" type="submit">Mudar</button></form>
      <div class="box"><h2>As minhas permissões</h2><ul>${me.permissions.map((p) => `<li>${esc(PERMS.concat(OWNER).find(([v]) => v === p)?.[1] ?? p)}</li>`).join('')}</ul></div>`;
    $('#own-pass').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      act(() => gapi('/eu/password', { method: 'PATCH', body: { currentPassword: f.currentPassword.value, newPassword: f.newPassword.value } }), 'Palavra-passe alterada.');
    });
  },
};

const PERMS = [
  ['moderar', 'Moderar pedidos', 'Aprovar, pedir alterações ou recusar'],
  ['documentos', 'Ver provas privadas', 'Cada abertura fica registada'],
  ['denuncias', 'Tratar denúncias', 'E suspender pedidos'],
  ['fundos', 'Doações e entregas', 'Registar entregas de dinheiro'],
  ['plataforma', 'Custos da plataforma', 'Registar despesas'],
  ['utilizadores', 'Contas e dados', 'Pedidos de eliminação'],
  ['registos', 'Registo de ações', 'Ver o que a equipa fez'],
];
const OWNER = [['equipa', 'Equipa'], ['lancamento', 'Lançamento']];

function modCard(ad) {
  const canDocs = me.permissions.includes('documentos');
  const decisions = {
    em_analise: [['aprovar', 'Aprovar', 'btn--green'], ['alteracoes', 'Pedir alterações', ''], ['recusar', 'Recusar', 'btn--danger']],
    ativo: [['suspender', 'Suspender', 'btn--danger']],
    suspenso: [['reativar', 'Reativar', 'btn--green'], ['alteracoes', 'Pedir alterações', ''], ['recusar', 'Recusar', 'btn--danger']],
    alteracoes: [['recusar', 'Recusar', 'btn--danger']],
  }[ad.status] ?? [];
  return `<article class="gcard">
    <header><span class="status status--${ad.status}">${STATUS[ad.status]}</span><h2>${esc(ad.title)}</h2>
    <p class="hint">${esc(ad.categoryLabel)} · ${esc(ad.district)} · ${euros(ad.amountCents)} pedidos · ${euros(ad.raisedCents)} recebidos · criado ${dateLong(ad.createdAt)} · mostra: ${Object.entries(ad.visibility).filter(([, v]) => v).map(([k]) => ({ alias: 'nome', district: 'distrito', deadline: 'prazo', proofs: 'provas', donors: 'doadores' })[k]).join(', ') || 'só o essencial'}${ad.alias ? ` · nome público “${esc(ad.alias)}”` : ''}</p></header>
    ${ad.flags?.length ? `<p class="notice notice--warn"><b>Atenção:</b> o texto parece conter ${ad.flags.map((f) => FLAG[f]).join(', ')}.</p>` : ''}
    <div class="gcard__story">${esc(ad.story).replace(/\n/g, '<br>')}</div>
    ${ad.privateNote ? `<p class="private"><b>Nota privada:</b> ${esc(ad.privateNote)}</p>` : ''}
    ${ad.documents.length ? `<ul class="docs">${ad.documents.map((d) => `<li><span><b>${esc(d.description)}</b><small>${d.mime} · ${d.verified ? 'verificada' : 'por verificar'} · ${PUBLIC[d.publicStatus]}</small></span><span class="doc-acts">
      ${canDocs ? `<button class="linkbtn linkbtn--ink" type="button" data-doc-view="${d.id}">Abrir</button>` : '<small>Sem permissão para abrir</small>'}
      ${d.verified ? '' : `<button class="linkbtn linkbtn--ink" type="button" data-doc="${d.id}" data-body='{"verified":true}'>Marcar verificada</button>`}
      ${d.shareRequested && d.publicStatus === 'pedido' ? `<button class="linkbtn linkbtn--ink" type="button" data-doc="${d.id}" data-body='{"publicStatus":"aprovado","verified":true}'>Aprovar imagem pública</button><button class="linkbtn" type="button" data-doc="${d.id}" data-body='{"publicStatus":"recusado"}'>Recusar imagem</button>` : ''}
    </span></li>`).join('')}</ul>` : '<p class="hint">Sem provas.</p>'}
    ${ad.reviews.length ? `<details><summary>Histórico (${ad.reviews.length})</summary><ul>${ad.reviews.map((r) => `<li>${dateTime(r.at)} · ${esc(r.by)} · ${esc(r.decision)}${r.note ? `: ${esc(r.note)}` : ''}</li>`).join('')}</ul></details>` : ''}
    ${decisions.length ? `<form data-decide="${ad.id}">
      ${ad.status === 'em_analise' ? `<fieldset class="checks"><legend>Antes de aprovar</legend><label class="check"><input type="checkbox" name="check" value="sem_dados"> O texto não tem dados pessoais (moradas, contactos, números, nomes de terceiros)</label><label class="check"><input type="checkbox" name="check" value="coerente"> O pedido é coerente com as provas, quando existem</label><label class="check"><input type="checkbox" name="check" value="categoria"> A categoria e o montante fazem sentido</label></fieldset>` : ''}
      <div class="field"><label>Nota para a pessoa <small>(obrigatória para pedir alterações, recusar ou suspender)</small></label><textarea name="note" rows="2" maxlength="1000"></textarea></div>
      <div class="gacts">${decisions.map(([v, l, c]) => `<button class="btn btn--sm ${c}" name="decision" value="${v}">${l}</button>`).join('')}</div>
    </form>` : ''}
  </article>`;
}
