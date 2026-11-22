import { api } from '../api.js';
import { logout, requireUser } from '../session.js';
import { dateTime, esc, shortDate } from '../format.js';
import { formValues, showFieldErrors, submitting, toast } from '../utils.js';

const user = await requireUser({ roles: ['admin'] });
if (user) start(user);

const ISSUE_TYPES = { via: 'Buraco ou pavimento', luz: 'Iluminação pública', lixo: 'Lixo ou limpeza', sinal: 'Sinalização', agua: 'Fuga de água', outro: 'Outro' };

async function start(me) {
  const $ = (sel) => document.querySelector(sel);
  const statusOptions = $('#status-options').innerHTML;
  const withSelected = (value) => statusOptions.replace(`value="${value}"`, `value="${value}" selected`);
  let statusFilter = '';

  $('[data-user-name]').textContent = me.name;
  $('[data-logout]').addEventListener('click', logout);

  async function loadStats() {
    const s = await api('/admin/resumo', { auth: true });
    $('[data-stats]').innerHTML = [
      ['Pedidos por tratar', s.counts.recebido + s.counts['em-analise'] + s.counts.aguarda, '#pedidos'],
      ['Ocorrências abertas', s.openIssues, '#ocorrencias'],
      ['Mensagens por ler', s.unread, '#mensagens'],
      ['Notícias', s.news, '#noticias'],
    ]
      .map(([label, value, href]) => `<a class="stat" href="${href}"><span>${label}</span><b>${value}</b></a>`)
      .join('');
  }

  async function loadRequests() {
    const { requests } = await api(`/admin/pedidos${statusFilter ? `?estado=${statusFilter}` : ''}`, { auth: true });
    $('[data-requests]').innerHTML = requests.length
      ? requests
          .map(
            (r) => `<details class="req"${r.status === 'recebido' ? ' open' : ''}>
  <summary><span><b>${esc(r.serviceTitle)}</b><small>${esc(r.number)} · ${esc(r.person ?? 'Munícipe')} · ${shortDate(r.createdAt)}</small></span><span class="st st--${r.status}">${esc(r.statusLabel)}</span></summary>
  <div class="req__in"><p>${esc(r.text)}</p>
    <ol class="steps-line">${r.history.map((h) => `<li><time>${shortDate(h.at)}</time><span>${esc(h.note)}</span></li>`).join('')}</ol>
    <form class="req__tools" data-request="${r.id}"><label class="sr" for="st-${r.id}">Estado</label><select id="st-${r.id}" name="status">${withSelected(r.status)}</select><label class="sr" for="no-${r.id}">Nota para o munícipe</label><input id="no-${r.id}" name="note" maxlength="300" placeholder="Nota para o munícipe (opcional)"><button class="btn purple sm" type="submit">Atualizar</button></form>
  </div>
</details>`,
          )
          .join('')
      : '<p class="empty-note">Não há pedidos neste estado.</p>';
  }

  async function loadIssues() {
    const { issues } = await api('/admin/ocorrencias', { auth: true });
    $('[data-issues]').innerHTML = issues
      .map(
        (o) => `<article class="info"><span class="st st--${o.status}" style="align-self:flex-start">${esc(o.statusLabel)}</span><h3>${esc(ISSUE_TYPES[o.type] ?? o.type)}</h3><p><b>${esc(o.place)}</b></p><p>${esc(o.text)}</p><p class="muted">${esc(o.number)} · ${esc(o.person ?? 'Munícipe')} · ${shortDate(o.createdAt)}</p>
  <form class="req__tools" data-issue="${o.id}"><label class="sr" for="is-${o.id}">Estado</label><select id="is-${o.id}" name="status">${withSelected(o.status)}</select><button class="btn purple sm" type="submit">Guardar</button></form></article>`,
      )
      .join('');
  }

  async function loadMessages() {
    const { messages } = await api('/admin/mensagens', { auth: true });
    $('[data-messages]').innerHTML = messages.length
      ? messages
          .map(
            (m) => `<article class="msg${m.read ? '' : ' unread'}"><header><b>${esc(m.name)}</b><span>${esc(m.subject)} · ${dateTime(m.createdAt)}</span></header><p>${esc(m.text)}</p><div class="row"><a class="icon-btn" href="mailto:${esc(m.email)}">Responder a ${esc(m.email)}</a>${m.read ? '<span class="muted">Lida</span>' : `<button class="icon-btn" type="button" data-read="${m.id}">Marcar como lida</button>`}</div></article>`,
          )
          .join('')
      : '<p class="empty-note">Sem mensagens.</p>';
  }

  async function loadNews() {
    const { news } = await api('/admin/noticias', { auth: true });
    $('[data-news]').innerHTML = news
      .map(
        (n) => `<li class="${n.published ? '' : 'muted-row'}"><span><b>${esc(n.title)}</b><small>${esc(n.label)} · ${shortDate(n.date)} · ${n.published ? 'publicada' : 'escondida'}</small></span><span class="tools">${n.published ? `<a class="icon-btn" href="/atualidade/${n.slug}">Ver</a>` : ''}<button class="icon-btn" type="button" data-publish="${n.id}" data-value="${!n.published}">${n.published ? 'Esconder' : 'Publicar'}</button><button class="icon-btn danger" type="button" data-delete-news="${n.id}">Apagar</button></span></li>`,
      )
      .join('');
  }

  async function loadNotices() {
    const { notices } = await api('/admin/avisos', { auth: true });
    const now = new Date().toISOString();
    $('[data-notices]').innerHTML = notices.length
      ? notices
          .map((a) => `<li class="${a.until < now ? 'muted-row' : ''}"><span><b>${a.pinned ? '★ ' : ''}${esc(a.title)}</b><small>${esc(a.when)} · até ${shortDate(a.until)}</small></span><span class="tools"><button class="icon-btn danger" type="button" data-delete-notice="${a.id}">Retirar</button></span></li>`)
          .join('')
      : '<li><span class="muted">Sem avisos.</span></li>';
  }

  async function loadEvents() {
    const { events } = await api('/admin/agenda', { auth: true });
    $('[data-events]').innerHTML = events.length
      ? events.map((e) => `<li><span><b>${esc(e.title)}</b><small>${dateTime(e.date)} · ${esc(e.place)}</small></span><span class="tools"><button class="icon-btn danger" type="button" data-delete-event="${e.id}">Apagar</button></span></li>`).join('')
      : '<li><span class="muted">Sem eventos.</span></li>';
  }

  const run = async (button, task, done) => {
    await submitting(button, async () => {
      try {
        await task();
        if (done) toast(done);
      } catch (err) {
        toast(err.message, { type: 'error' });
      }
    });
  };

  // Filtro por estado
  const filterButtons = [...document.querySelectorAll('[data-status-filter] button')];
  filterButtons.forEach((b) =>
    b.addEventListener('click', async () => {
      filterButtons.forEach((x) => x.classList.toggle('on', x === b));
      statusFilter = b.dataset.status;
      await loadRequests();
    }),
  );

  // Formulários dentro das listas (estado dos pedidos e das ocorrências)
  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (form.dataset.request) {
      event.preventDefault();
      await run(form.querySelector('button'), async () => {
        const { status, note } = formValues(form);
        await api(`/admin/pedidos/${form.dataset.request}`, { method: 'PATCH', body: { status, ...(note && { note }) }, auth: true });
        await Promise.all([loadRequests(), loadStats()]);
      }, 'Pedido atualizado');
    } else if (form.dataset.issue) {
      event.preventDefault();
      await run(form.querySelector('button'), async () => {
        await api(`/admin/ocorrencias/${form.dataset.issue}`, { method: 'PATCH', body: formValues(form), auth: true });
        await Promise.all([loadIssues(), loadStats()]);
      }, 'Ocorrência atualizada');
    }
  });

  // Botões das listas
  document.addEventListener('click', async (event) => {
    const b = event.target.closest('button');
    if (!b) return;
    if (b.dataset.read) await run(b, async () => {
      await api(`/admin/mensagens/${b.dataset.read}/lida`, { method: 'POST', auth: true });
      await Promise.all([loadMessages(), loadStats()]);
    });
    if (b.dataset.publish) await run(b, async () => {
      await api(`/admin/noticias/${b.dataset.publish}`, { method: 'PATCH', body: { published: b.dataset.value === 'true' }, auth: true });
      await loadNews();
    }, b.dataset.value === 'true' ? 'Notícia publicada' : 'Notícia escondida');
    if (b.dataset.deleteNews && confirm('Apagar esta notícia? Não pode ser desfeito.')) await run(b, async () => {
      await api(`/admin/noticias/${b.dataset.deleteNews}`, { method: 'DELETE', auth: true });
      await Promise.all([loadNews(), loadStats()]);
    }, 'Notícia apagada');
    if (b.dataset.deleteNotice) await run(b, async () => {
      await api(`/admin/avisos/${b.dataset.deleteNotice}`, { method: 'DELETE', auth: true });
      await loadNotices();
    }, 'Aviso retirado');
    if (b.dataset.deleteEvent && confirm('Apagar este evento da agenda?')) await run(b, async () => {
      await api(`/admin/agenda/${b.dataset.deleteEvent}`, { method: 'DELETE', auth: true });
      await loadEvents();
    }, 'Evento apagado');
  });

  // Formulários de criação
  const create = (selector, path, after, done, transform = (d) => d) => {
    const form = $(selector);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      await submitting(form.querySelector('[type="submit"]'), async () => {
        try {
          await api(path, { method: 'POST', body: transform(formValues(form)), auth: true });
          showFieldErrors(form, []);
          form.reset();
          await after();
          toast(done);
        } catch (err) {
          showFieldErrors(form, err.details);
          toast(err.message, { type: 'error' });
        }
      });
    });
  };

  create('[data-news-form]', '/admin/noticias', () => Promise.all([loadNews(), loadStats()]), 'Notícia publicada no site');
  create('[data-notice-form]', '/admin/avisos', loadNotices, 'Aviso publicado', (d) => ({ ...d, pinned: d.pinned === 'true' }));
  create('[data-event-form]', '/admin/agenda', loadEvents, 'Evento adicionado', (d) => ({ ...d, date: d.date ? new Date(d.date).toISOString() : '' }));

  await Promise.all([loadStats(), loadRequests(), loadIssues(), loadMessages(), loadNews(), loadNotices(), loadEvents()]);
}
