import { ApiError, api } from '../api.js';
import { logout, requireUser } from '../session.js';
import { toast } from '../utils.js';

const esc = (v = '') => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const short = (iso) => new Date(iso).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
const when = (iso) => new Date(iso).toLocaleString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const STATUS = [['novo', 'Novo'], ['conversa', 'Em conversa'], ['proposta', 'Proposta enviada'], ['arquivado', 'Arquivado']];
const SITUATION = { terreno: 'Um terreno', reabilitar: 'Casa para reabilitar', apartamento: 'Um apartamento', ideia: 'Só uma ideia' };
const BUDGET = { 'ate-150': 'Até 150 mil €', '150-300': '150 a 300 mil €', '300-mais': 'Mais de 300 mil €', 'nao-sei': 'Ainda não sei' };
const PHASES = ['A-100', 'A-200', 'A-300', 'A-400', 'A-500'];

const panels = Object.fromEntries([...document.querySelectorAll('[data-panel]')].map((p) => [p.dataset.panel, p]));
const tabs = [...document.querySelectorAll('[data-tab]')];

async function run(task, ok) {
  try {
    const result = await task();
    if (ok) toast(ok);
    return result;
  } catch (err) {
    toast(err instanceof ApiError ? err.message : 'Sem ligação. Tente outra vez.', { type: 'error' });
    return null;
  }
}

/* Resumo */
async function summary() {
  const data = await run(() => api('/admin/resumo', { auth: true }));
  if (!data) return;
  const next = data.meetings[0];
  document.querySelector('[data-summary]').innerHTML = `
    <div><b>${data.counts.novo ?? 0}</b>pedidos novos</div>
    <div><b>${data.counts.conversa ?? 0}</b>em conversa</div>
    <div><b>${data.unread}</b>mensagens por ler</div>
    <div><b>${next ? short(next.at) : '—'}</b>${next ? `próxima reunião · ${esc(next.client)}` : 'sem reuniões'}</div>`;
}

/* Pedidos */
let filter = '';
let selected = null;
let requests = [];

function requestDetail(r) {
  if (!r) return '<div class="detail"><p class="empty">Escolha um pedido na lista.</p></div>';
  return `<div class="detail">
    <span class="badge badge--${r.status}">${STATUS.find(([v]) => v === r.status)[1]}</span>
    <h2 style="margin-top:10px">${esc(r.name)}</h2>
    <dl class="spec">
      <div><dt>Email</dt><dd><a href="mailto:${esc(r.email)}">${esc(r.email)}</a></dd></div>
      ${r.phone ? `<div><dt>Telefone</dt><dd>${esc(r.phone)}</dd></div>` : ''}
      <div><dt>Tem</dt><dd>${SITUATION[r.situation]}</dd></div>
      <div><dt>Onde</dt><dd>${esc(r.place || '—')}</dd></div>
      <div><dt>Orçamento</dt><dd>${BUDGET[r.budget]}</dd></div>
      <div><dt>Chegou</dt><dd>${when(r.createdAt)}</dd></div>
    </dl>
    <blockquote>${esc(r.message)}</blockquote>
    <form data-request-form="${r.id}">
      <div class="field"><label for="notes">Notas internas</label><textarea class="input input--box" id="notes" name="notes" maxlength="1000">${esc(r.notes)}</textarea></div>
      <div class="actions">
        <select class="input input--box" name="status" aria-label="Estado do pedido" style="width:auto">${STATUS.map(([v, l]) => `<option value="${v}"${v === r.status ? ' selected' : ''}>${l}</option>`).join('')}</select>
        <button class="btn btn--small" type="submit">Guardar</button>
      </div>
    </form>
  </div>`;
}

function renderRequests(counts) {
  const filters = [['', `Todos · ${counts.total}`], ...STATUS.map(([v, l]) => [v, `${l} · ${counts[v] ?? 0}`])];
  panels.pedidos.innerHTML = `<div class="inbox">
    <div>
      <div class="inbox__filters">${filters.map(([v, l]) => `<button type="button" data-filter="${v}" aria-pressed="${v === filter}">${l}</button>`).join('')}</div>
      <ul class="inbox__list">${
        requests.length
          ? requests
              .map(
                (r) => `<li><button type="button" class="inbox__item${r.id === selected ? ' is-on' : ''}" data-request="${r.id}"><span><span class="badge badge--${r.status}">${STATUS.find(([v]) => v === r.status)[1]}</span></span><b>${esc(r.name)}</b><small>${SITUATION[r.situation]}${r.place ? ` · ${esc(r.place)}` : ''} · ${short(r.createdAt)}</small></button></li>`,
              )
              .join('')
          : '<li class="empty">Nenhum pedido neste estado.</li>'
      }</ul>
    </div>
    ${requestDetail(requests.find((r) => r.id === selected))}
  </div>`;
}

async function loadRequests() {
  const data = await run(() => api(`/admin/pedidos${filter ? `?estado=${filter}` : ''}`, { auth: true }));
  if (!data) return;
  requests = data.requests;
  if (!requests.some((r) => r.id === selected)) selected = requests[0]?.id ?? null;
  renderRequests(data.counts);
}

panels.pedidos.addEventListener('click', (event) => {
  const f = event.target.closest('[data-filter]');
  if (f) {
    filter = f.dataset.filter;
    loadRequests();
    return;
  }
  const item = event.target.closest('[data-request]');
  if (item) {
    selected = item.dataset.request;
    panels.pedidos.querySelectorAll('[data-request]').forEach((b) => b.classList.toggle('is-on', b === item));
    panels.pedidos.querySelector('.detail').outerHTML = requestDetail(requests.find((r) => r.id === selected));
  }
});

panels.pedidos.addEventListener('submit', async (event) => {
  const form = event.target.closest('[data-request-form]');
  if (!form) return;
  event.preventDefault();
  const body = { status: form.elements.status.value, notes: form.elements.notes.value };
  if (await run(() => api(`/admin/pedidos/${form.dataset.requestForm}`, { method: 'PATCH', body, auth: true }), 'Pedido atualizado')) {
    await Promise.all([loadRequests(), summary()]);
  }
});

/* Obras */
function renderWorks(works) {
  panels.obras.innerHTML = `<div class="works">${works
    .map(
      (w) => `<article class="work-card" data-work="${w.id}">
    <div>
      <p class="kicker">${esc(w.owner?.name ?? '')}${w.unread ? ` · <span class="unread">${w.unread} mensagem${w.unread > 1 ? 's' : ''} nova${w.unread > 1 ? 's' : ''}</span>` : ''}</p>
      <h3>${esc(w.title)}</h3>
      <p>${esc(w.summary)}</p>
      <ol class="strip" aria-label="Fases">${w.phases.map((p, i) => `<li class="${p.status}" title="${esc(p.label)}">${PHASES[i]}</li>`).join('')}</ol>
      <p style="font-size:13px">Agora: <b style="font-weight:500">${esc(w.phases[w.phase].label)}</b></p>
      <div class="actions" style="display:flex;gap:10px;margin-top:12px">
        <button class="btn btn--small" type="button" data-step="recuar"${w.phase === 0 ? ' disabled' : ''}>← Fase anterior</button>
        <button class="btn btn--small" type="button" data-step="avancar"${w.phase === w.phases.length - 1 ? ' disabled' : ''}>Fase seguinte →</button>
      </div>
      <form data-meeting>
        <p style="margin-top:20px;font-size:12px;color:var(--mute);letter-spacing:.14em;text-transform:uppercase">Marcar reunião</p>
        <div class="row-2"><label>Dia e hora<input class="input input--box" type="datetime-local" name="at" required></label><label>Onde<input class="input input--box" name="where" value="Atelier de Matosinhos" required></label></div>
        <label>Assunto<input class="input input--box" name="topic" required maxlength="120"></label>
        <button class="btn btn--small" type="submit" style="justify-self:start">Marcar</button>
      </form>
    </div>
    <div>
      <p style="font-size:12px;color:var(--mute);letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px">Mensagens</p>
      <div class="thread">${w.messages.map((m) => `<div class="msg msg--${m.from === 'cliente' ? 'arquiteta' : 'cliente'}">${esc(m.text)}<small>${m.from === 'cliente' ? esc(w.owner?.name.split(' ')[0]) : 'eu'} · ${short(m.at)}</small></div>`).join('')}</div>
      <form class="reply" data-message><textarea class="input input--box" name="text" aria-label="Responder a ${esc(w.owner?.name)}" required maxlength="1000"></textarea><button class="btn btn--small" type="submit">Responder</button></form>
      ${w.unread ? '<button class="link" type="button" data-read style="margin-top:8px">Marcar como lidas</button>' : ''}
      <p style="margin-top:18px;font-size:12px;color:var(--mute);letter-spacing:.14em;text-transform:uppercase">Próximas reuniões</p>
      ${w.meetings.filter((m) => !m.past).map((m) => `<div class="meeting"><b>${when(m.at)}</b><p>${esc(m.topic)}</p><p class="muted">${esc(m.where)} · ${m.confirmed ? 'confirmada' : 'por confirmar'}</p></div>`).join('') || '<p class="muted" style="font-size:13px">Nenhuma.</p>'}
    </div>
  </article>`,
    )
    .join('')}</div>`;
  panels.obras.querySelectorAll('.thread').forEach((t) => (t.scrollTop = t.scrollHeight));
}

async function loadWorks() {
  const data = await run(() => api('/admin/obras', { auth: true }));
  if (data) renderWorks(data.works);
}

panels.obras.addEventListener('click', async (event) => {
  const card = event.target.closest('[data-work]');
  if (!card) return;
  const step = event.target.closest('[data-step]');
  if (step && (await run(() => api(`/admin/obras/${card.dataset.work}/fase`, { method: 'POST', body: { direction: step.dataset.step }, auth: true }), 'Fase atualizada'))) loadWorks();
  if (event.target.closest('[data-read]') && (await run(() => api(`/admin/obras/${card.dataset.work}/lida`, { method: 'POST', auth: true })))) {
    await Promise.all([loadWorks(), summary()]);
  }
});

panels.obras.addEventListener('submit', async (event) => {
  event.preventDefault();
  const card = event.target.closest('[data-work]');
  const form = event.target;
  if (form.matches('[data-message]')) {
    if (await run(() => api(`/admin/obras/${card.dataset.work}/mensagens`, { method: 'POST', body: { text: form.elements.text.value }, auth: true }), 'Mensagem enviada')) {
      await Promise.all([loadWorks(), summary()]);
    }
  }
  if (form.matches('[data-meeting]')) {
    const at = form.elements.at.value ? new Date(form.elements.at.value).toISOString() : '';
    const body = { at, where: form.elements.where.value, topic: form.elements.topic.value };
    if (await run(() => api(`/admin/obras/${card.dataset.work}/reunioes`, { method: 'POST', body, auth: true }), 'Reunião marcada')) {
      await Promise.all([loadWorks(), summary()]);
    }
  }
});

/* Portefólio */
function renderFolio(projects) {
  panels.portfolio.innerHTML = `<p class="muted" style="font-size:13px;margin-bottom:16px">A ordem desta lista é a ordem do índice e das divisões da planta na página inicial.</p>
  <ul class="folio">${projects
    .map(
      (p, i) => `<li class="${p.published ? '' : 'is-hidden'}" data-project="${p.id}">
      <span class="order"><button type="button" data-move="cima" aria-label="Subir ${esc(p.name)}"${i === 0 ? ' disabled' : ''}>↑</button><button type="button" data-move="baixo" aria-label="Descer ${esc(p.name)}"${i === projects.length - 1 ? ' disabled' : ''}>↓</button></span>
      <img src="/img/${p.slug}/${p.cover.key}-480.webp" alt="" width="110" height="66" loading="lazy">
      <span><b>${esc(p.name)}</b><br><small class="muted">${esc(p.place)} · ${p.year}</small></span>
      <a class="link meta" href="/projetos/${p.slug}">ver</a>
      <button class="switch" type="button" data-publish aria-pressed="${p.published}">${p.published ? 'Publicado' : 'Escondido'}</button>
    </li>`,
    )
    .join('')}</ul>`;
}

async function loadFolio() {
  const data = await run(() => api('/admin/projetos', { auth: true }));
  if (data) renderFolio(data.projects);
}

panels.portfolio.addEventListener('click', async (event) => {
  const row = event.target.closest('[data-project]');
  if (!row) return;
  const move = event.target.closest('[data-move]');
  if (move) {
    const data = await run(() => api(`/admin/projetos/${row.dataset.project}/mover`, { method: 'POST', body: { direction: move.dataset.move }, auth: true }));
    if (data) renderFolio(data.projects);
  }
  const publish = event.target.closest('[data-publish]');
  if (publish) {
    const published = publish.getAttribute('aria-pressed') !== 'true';
    if (await run(() => api(`/admin/projetos/${row.dataset.project}`, { method: 'PATCH', body: { published }, auth: true }), published ? 'Projeto publicado' : 'Projeto escondido do site')) loadFolio();
  }
});

/* Separadores */
const loaders = { pedidos: loadRequests, obras: loadWorks, portfolio: loadFolio };

function select(name) {
  tabs.forEach((tab) => {
    const on = tab.dataset.tab === name;
    tab.setAttribute('aria-selected', String(on));
    tab.tabIndex = on ? 0 : -1;
    panels[tab.dataset.tab].hidden = !on;
  });
  loaders[name]();
}

tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => select(tab.dataset.tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    const other = tabs[(i + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    other.focus();
    select(other.dataset.tab);
  });
});

document.querySelectorAll('[data-logout]').forEach((b) => b.addEventListener('click', logout));

const user = await requireUser({ roles: ['admin'] });
if (user) {
  document.querySelector('[data-user-name]').textContent = user.name;
  summary();
  select('pedidos');
}
