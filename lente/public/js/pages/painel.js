import { api } from '../api.js';
import { requireUser } from '../session.js';
import { daysUntil, escapeHtml, formatDate, img, showFieldErrors, toast } from '../utils.js';

const panels = Object.fromEntries([...document.querySelectorAll('[data-panel]')].map((el) => [el.dataset.panel, el]));
const tabs = document.querySelectorAll('[data-tab]');
const loaded = new Set();
let statuses = [];

const statusClass = { novo: 'novo', 'em conversa': 'conversa', aceite: 'aceite', recusado: 'recusado' };
const badge = (status) => `<span class="badge badge--${statusClass[status]}">${status}</span>`;

function greeting(name) {
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Bom dia' : hour < 20 ? 'Boa tarde' : 'Boa noite';
  return `${hello}, <span class="red">${escapeHtml(name.split(' ')[0])}.</span>`;
}

async function loadOverview() {
  const { stats, latestQuotes, expiringSoon } = await api('/admin/overview', { auth: true });
  document.querySelector('[data-new-count]').textContent = stats.newQuotes || '';

  panels.resumo.innerHTML = `
    <div class="kpis">
      <div><strong>${stats.newQuotes}</strong><span class="mono">Pedidos novos</span></div>
      <div><strong>${stats.activeGalleries}</strong><span class="mono">Galerias ativas</span></div>
      <div><strong>${stats.favorites}</strong><span class="mono">Favoritas a retocar</span></div>
      <div><strong>${stats.downloads}</strong><span class="mono">Downloads</span></div>
      <div><strong>${stats.clients}</strong><span class="mono">Clientes</span></div>
      <div><strong>${stats.projects}</strong><span class="mono">Projetos online</span></div>
    </div>
    <div class="overview-cols">
      <div class="box">
        <div class="box__head mono"><span>Últimos pedidos de orçamento</span><button class="link" type="button" data-go="pedidos">Ver todos</button></div>
        ${
          latestQuotes.length
            ? latestQuotes
                .map(
                  (q) => `
            <div class="box__row">
              <div><strong>${escapeHtml(q.name)}</strong>${q.company ? ` · ${escapeHtml(q.company)}` : ''}<small>${q.services.map(escapeHtml).join(', ')} · ${escapeHtml(q.budget)}</small></div>
              ${badge(q.status)}
            </div>`,
                )
                .join('')
            : '<p class="box__empty">Sem pedidos.</p>'
        }
      </div>
      <div class="box">
        <div class="box__head mono"><span>Galerias a expirar (21 dias)</span><button class="link" type="button" data-go="galerias">Gerir</button></div>
        ${
          expiringSoon.length
            ? expiringSoon
                .map(
                  (g) => `
            <div class="box__row">
              <div><strong>${escapeHtml(g.title)}</strong><small>Expira a ${formatDate(g.expiresAt)} · ${g.favorites.length} favoritas</small></div>
              <span class="mono red">${daysUntil(g.expiresAt)} dias</span>
            </div>`,
                )
                .join('')
            : '<p class="box__empty">Nenhuma galeria perto de expirar.</p>'
        }
      </div>
    </div>`;
}

async function loadQuotes() {
  const data = await api('/admin/quotes', { auth: true });
  statuses = data.statuses;

  panels.pedidos.innerHTML = data.quotes.length
    ? `<div class="quotes-list">${data.quotes
        .map(
          (q) => `
        <article class="quote-card${q.status === 'novo' ? ' is-new' : ''}">
          <div>
            <h3>${escapeHtml(q.name)}${q.company ? ` — ${escapeHtml(q.company)}` : ''}</h3>
            <div class="quote-card__meta mono">
              <span>${q.services.map(escapeHtml).join(' + ')}</span>
              <span>${escapeHtml(q.budget)}</span>
              ${q.date ? `<span>Para ${formatDate(q.date)}</span>` : ''}
              <span>Recebido a ${formatDate(q.createdAt)}</span>
            </div>
            <p>${escapeHtml(q.message)}</p>
          </div>
          <div class="quote-card__side">
            <select class="select select--box" data-quote-status="${q.id}" aria-label="Estado do pedido">
              ${statuses.map((s) => `<option ${s === q.status ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
            <a class="btn btn--small" href="mailto:${encodeURIComponent(q.email)}?subject=${encodeURIComponent('Proposta Lente Studio')}">Responder por email</a>
          </div>
        </article>`,
        )
        .join('')}</div>`
    : '<div class="empty"><h3>Sem pedidos de orçamento</h3></div>';
}

async function loadGalleries() {
  const { galleries } = await api('/admin/galleries', { auth: true });
  document.querySelector('[data-galleries]').innerHTML = `
    <table class="table">
      <thead><tr><th></th><th>Galeria</th><th>Cliente</th><th>Fotos</th><th>♥</th><th>Download</th><th>Expira</th><th></th></tr></thead>
      <tbody>${galleries
        .map(
          (g) => `
        <tr>
          <td><img class="thumb" src="${img(g.cover, 128, 96)}" alt=""></td>
          <td><a class="link" href="/galerias/${g.id}">${escapeHtml(g.title)}</a><small>${escapeHtml(g.project)}</small></td>
          <td>${escapeHtml(g.clientName)}</td>
          <td>${g.photoCount}</td>
          <td>${g.favorites.length}</td>
          <td><input type="checkbox" data-allow="${g.id}" ${g.allowDownload ? 'checked' : ''} aria-label="Permitir download"></td>
          <td class="${g.expired ? 'red' : ''}">${formatDate(g.expiresAt)}</td>
          <td><div class="row-actions">
            <button class="btn btn--small btn--line" type="button" data-extend="${g.id}" data-expires="${g.expiresAt}">+30 dias</button>
            <button class="btn btn--small btn--line" type="button" data-remove-gallery="${g.id}">Apagar</button>
          </div></td>
        </tr>`,
        )
        .join('')}</tbody>
    </table>`;
}

async function loadClients() {
  const { clients } = await api('/admin/clients', { auth: true });
  document.querySelector('[data-clients]').innerHTML = `
    <table class="table">
      <thead><tr><th>Cliente</th><th>Email</th><th>Telemóvel</th><th>Galerias</th><th>Desde</th></tr></thead>
      <tbody>${clients
        .map(
          (c) => `
        <tr>
          <td><strong>${escapeHtml(c.name)}</strong><small>${escapeHtml(c.company)}</small></td>
          <td>${escapeHtml(c.email)}</td>
          <td>${escapeHtml(c.phone || '—')}</td>
          <td>${c.galleries}</td>
          <td>${formatDate(c.createdAt)}</td>
        </tr>`,
        )
        .join('')}</tbody>
    </table>`;

  document.querySelector('#g-client').innerHTML = clients
    .map((c) => `<option value="${c.id}">${escapeHtml(c.company || c.name)} — ${escapeHtml(c.email)}</option>`)
    .join('');
}

async function loadProjects() {
  const { projects } = await api('/admin/projects', { auth: true });
  panels.projetos.innerHTML = `
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th></th><th>Projeto</th><th>Cliente</th><th>Categoria</th><th>Ano</th><th>Online</th><th>Destaque</th></tr></thead>
        <tbody>${projects
          .map(
            (p) => `
          <tr>
            <td><img class="thumb" src="${img(p.cover, 128, 96)}" alt=""></td>
            <td><a class="link" href="/trabalho/${p.slug}">${escapeHtml(p.title)}</a></td>
            <td>${escapeHtml(p.client)}</td>
            <td>${escapeHtml(p.category)}</td>
            <td>${p.year}</td>
            <td><input type="checkbox" data-project="${p.id}" data-field="published" ${p.published ? 'checked' : ''} aria-label="Publicado"></td>
            <td><input type="checkbox" data-project="${p.id}" data-field="featured" ${p.featured ? 'checked' : ''} aria-label="Em destaque"></td>
          </tr>`,
          )
          .join('')}</tbody>
      </table>
    </div>`;
}

const loaders = { resumo: loadOverview, pedidos: loadQuotes, galerias: () => Promise.all([loadGalleries(), loadClients()]), clientes: loadClients, projetos: loadProjects };

async function showTab(name, { force = false } = {}) {
  tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.tab === name));
  Object.entries(panels).forEach(([key, panel]) => (panel.hidden = key !== name));
  if (loaded.has(name) && !force) return;
  try {
    await loaders[name]();
    loaded.add(name);
  } catch (error) {
    toast(error.message, 'error');
  }
}

function addDays(iso, days) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const main = document.querySelector('.panel');

main.addEventListener('click', async (event) => {
  const go = event.target.closest('[data-go]');
  if (go) return showTab(go.dataset.go);

  const extend = event.target.closest('[data-extend]');
  if (extend) {
    const base = extend.dataset.expires > new Date().toISOString().slice(0, 10) ? extend.dataset.expires : new Date().toISOString().slice(0, 10);
    await api(`/admin/galleries/${extend.dataset.extend}`, { method: 'PATCH', auth: true, body: { expiresAt: addDays(base, 30) } });
    toast('Galeria prolongada por mais 30 dias');
    loaded.delete('resumo');
    return loadGalleries();
  }

  const remove = event.target.closest('[data-remove-gallery]');
  if (remove && window.confirm('Apagar esta galeria? O cliente deixa de a ver.')) {
    await api(`/admin/galleries/${remove.dataset.removeGallery}`, { method: 'DELETE', auth: true });
    toast('Galeria apagada');
    loaded.delete('resumo');
    loadGalleries();
  }
});

main.addEventListener('change', async (event) => {
  const target = event.target;
  try {
    if (target.dataset.quoteStatus) {
      await api(`/admin/quotes/${target.dataset.quoteStatus}`, { method: 'PATCH', auth: true, body: { status: target.value } });
      toast(`Pedido marcado como "${target.value}"`);
      loaded.delete('resumo');
      return loadQuotes();
    }
    if (target.dataset.allow) {
      await api(`/admin/galleries/${target.dataset.allow}`, { method: 'PATCH', auth: true, body: { allowDownload: target.checked } });
      return toast(target.checked ? 'Download ativado' : 'Download desativado');
    }
    if (target.dataset.project) {
      await api(`/admin/projects/${target.dataset.project}`, { method: 'PATCH', auth: true, body: { [target.dataset.field]: target.checked } });
      toast('Projeto atualizado');
    }
  } catch (error) {
    toast(error.message, 'error');
  }
});

function setupForm(form, { url, body, done }) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const error = form.querySelector('[data-error]');
    error.hidden = true;
    showFieldErrors(form);
    try {
      await api(url, { method: 'POST', auth: true, body: body(form) });
      form.reset();
      done();
    } catch (err) {
      showFieldErrors(form, err.details);
      error.textContent = err.details?.length ? err.details[0].message : err.message;
      error.hidden = false;
    }
  });
}

setupForm(document.querySelector('[data-gallery-form]'), {
  url: '/admin/galleries',
  body: (f) => ({
    title: f.title.value,
    clientId: f.clientId.value,
    project: f.project.value || undefined,
    shotOn: f.shotOn.value,
    expiresAt: f.expiresAt.value,
    allowDownload: f.allowDownload.checked,
    photoUrls: f.photoUrls.value.split('\n').map((line) => line.trim()).filter(Boolean),
  }),
  done: () => {
    toast('Galeria criada. O cliente já a vê na área de cliente.');
    loaded.delete('resumo');
    loadGalleries();
  },
});

setupForm(document.querySelector('[data-client-form]'), {
  url: '/admin/clients',
  body: (f) => Object.fromEntries([...new FormData(f)].filter(([, v]) => v)),
  done: () => {
    toast('Acesso criado. Envie o email e a palavra-passe ao cliente.');
    loaded.delete('resumo');
    loaded.delete('galerias');
    loadClients();
  },
});

const user = await requireUser({ roles: ['admin'] });
if (user) {
  document.querySelector('[data-greeting]').innerHTML = greeting(user.name);
  document.querySelector('[data-today]').textContent = formatDate(new Date().toISOString());
  tabs.forEach((tab) => tab.addEventListener('click', () => showTab(tab.dataset.tab)));
  showTab('resumo');
}
