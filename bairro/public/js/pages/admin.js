import { api } from '../api.js';
import { logout, requireUser } from '../session.js';
import { dateLabel, escapeHtml as esc, euros, photoUrl, timeLabel } from '../shared/format.js';
import { formValues, showFieldErrors, submitting, toast } from '../utils.js';

const TABS = [
  ['pedidos', 'Pedidos'],
  ['trabalhos', 'Trabalhos'],
  ['portefolio', 'Portefólio'],
  ['vagas', 'Vagas'],
];

const badge = (status, label) => `<span class="badge badge--${esc(status)}">${esc(label)}</span>`;

function summaryLine(s) {
  const parts = [
    `${s.newRequests} ${s.newRequests === 1 ? 'pedido novo' : 'pedidos novos'}`,
    `${s.activeJobs} ${s.activeJobs === 1 ? 'trabalho em curso' : 'trabalhos em curso'}`,
    `${s.pendingProofs} ${s.pendingProofs === 1 ? 'prova à espera do cliente' : 'provas à espera dos clientes'}`,
    s.nextOpening ? `próxima vaga em ${s.nextOpening.name}` : 'sem vagas',
  ];
  return `<p class="admin__summary">${parts.map((p) => `<span>${esc(p)}</span>`).join('')}</p>`;
}

function requestsPanel(requests, statuses, filter, today) {
  return `<div class="admin__filters">
    <label class="field"><span>Estado</span><select data-filter><option value="">Todos</option>${statuses
      .map((s) => `<option value="${s.id}"${s.id === filter ? ' selected' : ''}>${esc(s.name)}</option>`)
      .join('')}</select></label>
  </div>
  ${
    requests.length
      ? `<ul class="requests">${requests
          .map(
            (r) => `<li class="request" data-request="${r.id}">
          <div class="request__main">
            <p class="request__who"><b>${esc(r.name)}</b>${r.company ? ` · ${esc(r.company)}` : ''} <span class="small mute">n.º ${r.number} · ${dateLabel(r.createdAt)}</span></p>
            <p class="small"><a class="link" href="mailto:${esc(r.email)}">${esc(r.email)}</a></p>
            <p>${esc(r.message)}</p>
            <p class="small mute">${esc(r.serviceNames.join(', ') || 'Serviços por definir')} · ${esc(r.budgetName)}${r.deadline ? ` · para ${dateLabel(r.deadline)}` : ''}${
              r.estimate.items.length ? ` · estimativa ${euros(r.estimate.min)} a ${euros(r.estimate.max)}` : ''
            }</p>
          </div>
          <div class="request__side">
            ${
              r.status === 'aceite'
                ? `${badge(r.status, r.statusName)}<p class="small mute">${esc(r.note)}</p>`
                : `<label class="field"><span>Estado</span><select data-status>${statuses
                    .map((s) => `<option value="${s.id}"${s.id === r.status ? ' selected' : ''}>${esc(s.name)}</option>`)
                    .join('')}</select></label>
                  <details class="request__job"><summary class="btn btn--small">Passar a trabalho</summary>
                    <form data-job-form novalidate>
                      <label class="field"><span>Nome do trabalho</span><input name="title" value="${esc(`${r.company || r.name} · ${r.serviceNames.join(' e ').toLowerCase() || 'projeto'}`)}"></label>
                      <label class="field"><span>Entrega</span><input name="dueDate" type="date" min="${today}"></label>
                      <button class="btn btn--primary btn--small" type="submit">Criar trabalho</button>
                    </form>
                  </details>`
            }
          </div>
        </li>`,
          )
          .join('')}</ul>`
      : '<p class="empty">Nenhum pedido com este estado.</p>'
  }`;
}

function jobsPanel(jobs, phases) {
  if (!jobs.length) return '<p class="empty">Ainda não há trabalhos.</p>';
  return `<ul class="jobs">${jobs
    .map(
      (j) => `<li class="job" data-job="${j.id}">
      <div class="job__head">
        <div><p class="job__title">${esc(j.title)}</p><p class="small mute">${esc(j.client?.name ?? '')} · ${esc(j.client?.email ?? '')} · entrega ${dateLabel(j.dueDate)}</p></div>
        <label class="field"><span>Fase</span><select data-phase>${phases.map((p, i) => `<option value="${i}"${i === j.phase ? ' selected' : ''}>${i + 1}. ${esc(p)}</option>`).join('')}</select></label>
      </div>
      <div class="progress"><span style="--value:${j.progress}%"></span></div>
      <div class="job__grid">
        <div>
          <p class="legend">Provas (${j.proofs.length})</p>
          <ul class="job__proofs">${j.proofs
            .map((p) => `<li><img src="${photoUrl(p.photo, 120, 0.7)}" width="60" height="42" alt="" loading="lazy"><span>${esc(p.name)}<br>${badge(p.status, p.status === 'pendente' ? 'À espera do cliente' : p.statusName)}</span></li>`)
            .join('')}</ul>
          <form class="job__add" data-proof-form novalidate>
            <label class="field"><span>Ficheiro</span><input name="name" placeholder="menu_v2.jpg"></label>
            <label class="field"><span>Código da fotografia</span><input name="photo" placeholder="1612599316791-451087c7fe15"></label>
            <button class="btn btn--small" type="submit">Enviar prova</button>
          </form>
        </div>
        <div>
          <p class="legend">Mensagens</p>
          <ol class="chat__list chat__list--small">${j.messages
            .slice(-4)
            .map((m) => `<li class="msg msg--${m.from === 'equipa' ? 'cliente' : 'equipa'}"><p class="msg__meta small">${esc(m.author)} · ${timeLabel(m.at)}</p><p>${esc(m.text)}</p></li>`)
            .join('')}</ol>
          <form class="chat__form" data-reply-form novalidate>
            <label class="field"><span class="sr-only">Resposta</span><textarea name="text" rows="2" placeholder="Responder ao cliente…"></textarea></label>
            <button class="btn btn--small" type="submit">Enviar</button>
          </form>
        </div>
      </div>
    </li>`,
    )
    .join('')}</ul>`;
}

function portfolioPanel(projects) {
  return `<div class="table-wrap"><table class="table">
    <thead><tr><th>Projeto</th><th>Categoria</th><th>Ano</th><th>Publicado</th><th>Destaque</th></tr></thead>
    <tbody>${projects
      .map(
        (p) => `<tr data-project="${p.id}"><td><a class="link" href="/projetos/${p.slug}">${esc(p.title)}</a></td><td>${esc(p.categoryName)}</td><td>${p.year}</td>
        <td><label class="check"><input type="checkbox" data-flag="published"${p.published ? ' checked' : ''}><span class="sr-only">Publicado</span></label></td>
        <td><label class="check"><input type="checkbox" data-flag="featured"${p.featured ? ' checked' : ''}><span class="sr-only">Destaque</span></label></td></tr>`,
      )
      .join('')}</tbody>
  </table></div>
  <p class="small mute admin__note">O primeiro projeto em destaque aparece no visualizador da página inicial.</p>`;
}

function availabilityPanel(months) {
  return `<ul class="slots">${months
    .map(
      (m) => `<li class="slots__month" data-month="${m.id}">
      <p class="slots__name">${m.name} <span class="mute">${m.year}</span></p>
      <label class="field"><span>Vagas</span><input type="number" min="0" max="10" name="slots" value="${m.slots}"></label>
      <label class="field"><span>Ocupadas</span><input type="number" min="0" max="10" name="taken" value="${m.taken}"></label>
      <p class="small">${m.free ? `${m.free} livres` : 'cheio'}</p>
    </li>`,
    )
    .join('')}</ul>`;
}

export async function mount(win) {
  const root = win.querySelector('[data-admin]');
  win.querySelector('[data-logout]').addEventListener('click', logout);

  const user = await requireUser({ roles: ['admin'] });
  if (!user) return;

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(new Date());
  const state = { tab: 'pedidos', filter: '', summary: null, requests: [], statuses: [], jobs: [], phases: [], projects: [], months: [] };

  const load = async () => {
    const query = state.filter ? `?estado=${state.filter}` : '';
    const [summary, req, jobs, projects, months] = await Promise.all([
      api('/admin/resumo', { auth: true }),
      api(`/admin/pedidos${query}`, { auth: true }),
      api('/admin/trabalhos', { auth: true }),
      api('/admin/projetos', { auth: true }),
      api('/admin/vagas', { auth: true }),
    ]);
    Object.assign(state, { summary, requests: req.requests, statuses: req.statuses, jobs: jobs.jobs, phases: jobs.phases, projects: projects.projects, months: months.availability });
  };

  const render = () => {
    const panels = {
      pedidos: () => requestsPanel(state.requests, state.statuses, state.filter, today),
      trabalhos: () => jobsPanel(state.jobs, state.phases),
      portefolio: () => portfolioPanel(state.projects),
      vagas: () => availabilityPanel(state.months),
    };
    root.querySelector('[data-loading]')?.remove();
    root.querySelector('.account__body')?.remove();
    root.insertAdjacentHTML(
      'beforeend',
      `<div class="account__body">
        ${summaryLine(state.summary)}
        <div class="tabs" role="tablist">${TABS.map(
          ([id, label]) =>
            `<button type="button" role="tab" aria-selected="${id === state.tab}" data-tab="${id}">${label}${id === 'pedidos' && state.summary.newRequests ? `<span class="count">${state.summary.newRequests}</span>` : ''}</button>`,
        ).join('')}</div>
        <div class="panel" role="tabpanel">${panels[state.tab]()}</div>
      </div>`,
    );
  };

  const refresh = async (message) => {
    await load();
    render();
    if (message) toast(message);
  };

  root.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-tab]');
    if (!tab) return;
    state.tab = tab.dataset.tab;
    render();
    root.querySelector(`[data-tab="${state.tab}"]`)?.focus();
  });

  root.addEventListener('change', async (event) => {
    const el = event.target;
    try {
      if (el.matches('[data-filter]')) {
        state.filter = el.value;
        await refresh();
      } else if (el.matches('[data-status]')) {
        await api(`/admin/pedidos/${el.closest('[data-request]').dataset.request}`, { method: 'PATCH', auth: true, body: { status: el.value } });
        await refresh('Estado do pedido atualizado.');
      } else if (el.matches('[data-phase]')) {
        await api(`/admin/trabalhos/${el.closest('[data-job]').dataset.job}`, { method: 'PATCH', auth: true, body: { phase: Number(el.value) } });
        await refresh('Fase atualizada. O cliente já vê a mudança.');
      } else if (el.matches('[data-flag]')) {
        await api(`/admin/projetos/${el.closest('[data-project]').dataset.project}`, { method: 'PATCH', auth: true, body: { [el.dataset.flag]: el.checked } });
        await refresh('Portefólio atualizado.');
      } else if (el.closest('[data-month]')) {
        const month = el.closest('[data-month]');
        const body = { slots: Number(month.querySelector('[name="slots"]').value), taken: Number(month.querySelector('[name="taken"]').value) };
        await api(`/admin/vagas/${month.dataset.month}`, { method: 'PATCH', auth: true, body });
        await refresh('Vagas atualizadas.');
      }
    } catch (error) {
      toast(error.details?.[0]?.message ?? error.message, { type: 'error' });
      await refresh();
    }
  });

  root.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    await submitting(form.querySelector('[type="submit"]'), async () => {
      try {
        if (form.matches('[data-job-form]')) {
          await api(`/admin/pedidos/${form.closest('[data-request]').dataset.request}/trabalho`, { method: 'POST', auth: true, body: formValues(form) });
          state.tab = 'trabalhos';
          await refresh('Trabalho criado. O cliente já o vê na conta.');
        } else if (form.matches('[data-proof-form]')) {
          await api(`/admin/trabalhos/${form.closest('[data-job]').dataset.job}/provas`, { method: 'POST', auth: true, body: formValues(form) });
          await refresh('Prova enviada ao cliente.');
        } else if (form.matches('[data-reply-form]')) {
          await api(`/trabalhos/${form.closest('[data-job]').dataset.job}/mensagens`, { method: 'POST', auth: true, body: formValues(form) });
          await refresh('Mensagem enviada.');
        }
      } catch (error) {
        if (error.details?.length) showFieldErrors(form, error.details);
        else toast(error.message, { type: 'error' });
      }
    });
  });

  await refresh();
}
