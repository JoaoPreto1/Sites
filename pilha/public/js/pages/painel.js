import { api } from '../api.js';
import { clearErrors, showErrors } from '../forms.js';
import { logout, requireRole } from '../session.js';
import { announce, BUDGET, badge, chip, day, dayTime, esc, img, paragraphs, SERVICE, STATUS } from '../utils.js';

const sec = (name) => document.getElementById(`sec-${name}`);
const state = { opts: null, briefs: [], projects: [], works: [], entries: [], open: new Set() };
const PHASE = { briefing: 'Briefing', proposta: 'Proposta', esbocos: 'Esboços', provas: 'Provas', 'artes-finais': 'Artes finais', entregue: 'Entregue' };

document.querySelector('[data-logout]').addEventListener('click', logout);

const options = (list, selected, label = (x) => x) => list.map((v) => `<option value="${esc(v)}"${v === selected ? ' selected' : ''}>${esc(label(v))}</option>`).join('');

// ---------- Separadores (teclado: setas, Home e End) ----------
const tabButtons = [...document.querySelectorAll('[role=tab]')];
function selectTab(name, focus = false) {
  tabButtons.forEach((b) => {
    const on = b.dataset.tab === name;
    b.setAttribute('aria-selected', String(on));
    b.tabIndex = on ? 0 : -1;
    sec(b.dataset.tab).hidden = !on;
    if (on && focus) b.focus();
  });
  history.replaceState(null, '', `#${name}`);
}
tabButtons.forEach((b, i) => {
  b.addEventListener('click', () => selectTab(b.dataset.tab));
  b.addEventListener('keydown', (e) => {
    const n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabButtons.length - 1 }[e.key];
    if (n === undefined) return;
    e.preventDefault();
    selectTab(tabButtons[(n + tabButtons.length) % tabButtons.length].dataset.tab, true);
  });
});

function counts() {
  const set = (k, v) => (document.querySelector(`[data-count=${k}]`).textContent = v);
  set('pedidos', state.briefs.filter((b) => b.status === 'novo').length || '');
  set('projetos', state.projects.reduce((n, p) => n + p.unread, 0) || '');
  set('trabalhos', state.works.length);
  set('diario', state.entries.length);
}

// ---------- Pedidos ----------
function renderBriefs() {
  sec('pedidos').innerHTML = `<p class="psec__intro">Pedidos que chegaram pelo formulário de contacto. Aceitar cria o projeto e, se preciso, a conta do cliente.</p>
  ${state.briefs.length ? state.briefs.map(briefCard).join('') : '<p class="empty">Nenhum pedido por agora.</p>'}`;
}

const briefCard = (b) => `<article class="pcard" id="b-${b.id}">
  <header class="pcard__head"><div><p class="pcard__ref">${esc(b.ref)} · ${dayTime(b.createdAt)}</p><h3>${esc(b.name)}${b.company ? ` <span>· ${esc(b.company)}</span>` : ''}</h3><p><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></p></div>${badge(b.status)}</header>
  <p class="pcard__chips">${b.services.map(chip).join(' ')}${b.unsure ? ' <span class="badge">Não sabe bem</span>' : ''}<span>${esc(BUDGET[b.budget] ?? b.budget)}</span>${b.deadline ? `<span>Prazo: ${day(b.deadline)}</span>` : ''}</p>
  <div class="pcard__msg">${paragraphs(b.message)}</div>
  ${
    b.status === 'aceite'
      ? `<p class="pcard__note">Projeto criado. <button class="linkish" type="button" data-goto="projetos">Ver em projetos</button></p>`
      : `<form class="pform" data-brief="${b.id}" novalidate>
    <div class="pform__row">
      <div class="field"><label for="bs-${b.id}">Estado</label><select class="select" id="bs-${b.id}" name="status">${options(state.opts.briefStatus.filter((s) => s !== 'aceite'), b.status, (s) => STATUS[s])}</select></div>
      <div class="field pform__grow"><label for="bn-${b.id}">Nota interna</label><input class="input" id="bn-${b.id}" name="note" maxlength="1000" value="${esc(b.note)}"></div>
      <button class="btn btn--sm" type="submit">Guardar</button>
    </div>
  </form>
  <details class="accept"><summary>Aceitar e criar projeto</summary>
    <form class="pform" data-accept="${b.id}" novalidate>
      <div class="notice notice--error" role="alert" tabindex="-1" hidden></div>
      <div class="pform__row">
        <div class="field pform__grow"><label for="at-${b.id}">Nome do projeto</label><input class="input" id="at-${b.id}" name="title" maxlength="120" value="${esc(b.company || b.name)}: ${esc(SERVICE[b.services[0]] ?? 'projeto').toLowerCase()}"><p class="error-text" data-error="title"></p></div>
        <div class="field"><label for="as-${b.id}">Serviço</label><select class="select" id="as-${b.id}" name="service">${options(state.opts.services, b.services[0], (s) => SERVICE[s])}</select></div>
        <div class="field"><label for="al-${b.id}">Quem lidera</label><select class="select" id="al-${b.id}" name="lead">${options(state.opts.leads, state.opts.leads[0])}</select></div>
        <button class="btn btn--sm btn--ink" type="submit">Aceitar</button>
      </div>
    </form>
  </details>`
  }
</article>`;

// ---------- Projetos ----------
function renderProjects() {
  sec('projetos').innerHTML = `<p class="psec__intro">Mude a fase, envie provas e responda aos clientes. O cliente vê tudo isto na área dele.</p>
  ${state.projects.map(projectCard).join('') || '<p class="empty">Sem projetos.</p>'}`;
  sec('projetos').querySelectorAll('.thread').forEach((t) => (t.scrollTop = t.scrollHeight));
}

const projectCard = (p) => `<details class="pcard pproj" id="p-${p.id}" data-project="${p.id}"${state.open.has(p.id) ? ' open' : ''}>
  <summary class="pcard__head"><div><p class="pcard__ref">${chip(p.service)} · ${esc(p.client?.company || p.client?.name || '')} · ${esc(p.lead)}</p><h3>${esc(p.title)}</h3></div><p class="pproj__flags"><span class="badge">${esc(PHASE[p.phase])}</span>${p.pendingProofs ? `<span class="badge badge--pendente">${p.pendingProofs} prova(s) à espera</span>` : ''}${p.unread ? `<span class="badge badge--alteracoes">${p.unread} mensagem(ns) nova(s)</span>` : ''}</p></summary>
  <div class="pproj__body">
    <form class="pform" data-phase="${p.id}" novalidate>
      <div class="pform__row"><div class="field"><label for="ph-${p.id}">Fase atual</label><select class="select" id="ph-${p.id}" name="phase">${options(state.opts.phases, p.phase, (k) => PHASE[k])}</select></div><button class="btn btn--sm" type="submit">Mudar fase</button></div>
      <ol class="mini-track">${p.phases.map((ph) => `<li class="mini-track__s mini-track__s--${ph.state}"><b>${esc(ph.label)}</b><small>${ph.state === 'feita' ? 'feita' : day(ph.due)}</small></li>`).join('')}</ol>
    </form>
    <div class="pproj__grid">
      <section aria-label="Provas de ${esc(p.title)}">
        <h4 class="area-h">Provas</h4>
        <ul class="plist">${p.proofs.map((pr) => `<li class="plist__item">${img(pr.image, `${pr.title} v${pr.version}`, '120px')}<div><b>${esc(pr.title)} v${pr.version}</b> ${badge(pr.status)}${pr.clientComment ? `<p class="pcard__quote">“${esc(pr.clientComment)}”</p>` : ''}</div></li>`).join('') || '<li class="empty">Sem provas.</li>'}</ul>
        <details class="accept"><summary>Enviar nova prova</summary>
          <form class="pform" data-proof="${p.id}" novalidate>
            <div class="notice notice--error" role="alert" tabindex="-1" hidden></div>
            <div class="field"><label for="pt-${p.id}">Título</label><input class="input" id="pt-${p.id}" name="title" maxlength="80" placeholder="Página inicial"><p class="error-text" data-error="title"></p></div>
            <div class="field"><label for="pi-${p.id}">Imagem da biblioteca</label><select class="select" id="pi-${p.id}" name="image">${state.opts.proofImages.map((i) => `<option value="${esc(i.path)}">${esc(i.label)}</option>`).join('')}</select></div>
            <div class="field"><label for="pn-${p.id}">Nota para o cliente</label><textarea class="textarea" id="pn-${p.id}" name="note" maxlength="600"></textarea></div>
            <button class="btn btn--sm btn--ink" type="submit">Enviar prova</button>
          </form>
        </details>
      </section>
      <section aria-label="Mensagens de ${esc(p.title)}">
        <h4 class="area-h">Mensagens com ${esc(p.client?.name ?? 'o cliente')}</h4>
        <ol class="thread">${p.messages.map((m) => `<li class="msg ${m.fromStudio ? 'msg--me' : 'msg--studio'}"><p class="msg__who">${esc(m.authorName)} <time datetime="${m.createdAt}">${dayTime(m.createdAt)}</time></p>${paragraphs(m.body)}</li>`).join('') || '<li class="empty">Sem mensagens.</li>'}</ol>
        <form class="pform reply" data-message="${p.id}" novalidate>
          <label for="pm-${p.id}">Responder</label>
          <textarea class="textarea" id="pm-${p.id}" name="body" maxlength="2000"></textarea>
          <p class="error-text" data-error="body"></p>
          <button class="btn btn--sm btn--ink" type="submit">Enviar</button>
        </form>
      </section>
    </div>
  </div>
</details>`;

// ---------- Trabalhos e diário (lista + editor) ----------
const yesNo = (v) => (v ? '<span class="badge badge--aprovada">Publicado</span>' : '<span class="badge">Rascunho</span>');

function renderWorks(editing = null) {
  sec('trabalhos').innerHTML = `<div class="psec__bar"><p class="psec__intro">Os trabalhos publicados aparecem em /trabalhos e no bloco “?” da pilha.</p><button class="btn btn--sm btn--ink" type="button" data-new="work">Novo trabalho</button></div>
  ${editing ? workForm(editing) : ''}
  <ul class="rows">${state.works.map((w) => `<li class="row">${img(w.cover, '', '96px')}<div class="row__txt"><b>${esc(w.title)}</b><small>${esc(w.client)} · ${esc(SERVICE[w.category])} · ${w.year}</small></div>${yesNo(w.published)}${w.featured ? '<span class="badge badge--pendente">Destaque</span>' : ''}<div class="row__acts">${w.published ? `<a class="btn btn--sm" href="/trabalhos/${esc(w.slug)}" target="_blank" rel="noopener">Ver</a>` : ''}<button class="btn btn--sm" type="button" data-edit-work="${w.id}">Editar</button><button class="btn btn--sm" type="button" data-del-work="${w.id}">Apagar</button></div></li>`).join('')}</ul>`;
  sec('trabalhos').querySelector('.editor input')?.focus();
}

const workForm = (w) => `<form class="pform editor" data-work="${w.id ?? ''}" novalidate>
  <h3>${w.id ? 'Editar trabalho' : 'Novo trabalho'}</h3>
  <div class="notice notice--error" role="alert" tabindex="-1" hidden></div>
  <div class="pform__grid">
    <div class="field pform__wide"><label for="w-title">Título</label><input class="input" id="w-title" name="title" maxlength="120" value="${esc(w.title ?? '')}"><p class="error-text" data-error="title"></p></div>
    <div class="field"><label for="w-client">Cliente</label><input class="input" id="w-client" name="client" maxlength="80" value="${esc(w.client ?? '')}"><p class="error-text" data-error="client"></p></div>
    <div class="field"><label for="w-place">Localidade</label><input class="input" id="w-place" name="place" maxlength="60" value="${esc(w.place ?? '')}"><p class="error-text" data-error="place"></p></div>
    <div class="field"><label for="w-cat">Serviço</label><select class="select" id="w-cat" name="category">${options(state.opts.services, w.category, (s) => SERVICE[s])}</select></div>
    <div class="field"><label for="w-year">Ano</label><input class="input" id="w-year" name="year" type="number" min="2000" max="2100" value="${w.year ?? new Date().getFullYear()}"><p class="error-text" data-error="year"></p></div>
    <div class="field"><label for="w-cover">Capa</label><select class="select" id="w-cover" name="cover">${state.opts.workImages.map((i) => `<option value="${esc(i.path)}"${i.path === w.cover ? ' selected' : ''}>${esc(i.label)}</option>`).join('')}</select></div>
    <div class="field pform__wide"><label for="w-sum">Resumo</label><input class="input" id="w-sum" name="summary" maxlength="300" value="${esc(w.summary ?? '')}"><p class="error-text" data-error="summary"></p></div>
    <div class="field pform__wide"><label for="w-body">Texto (parágrafos separados por uma linha em branco)</label><textarea class="textarea" id="w-body" name="body" maxlength="6000" rows="8">${esc(w.body ?? '')}</textarea><p class="error-text" data-error="body"></p></div>
    <label class="check"><input type="checkbox" name="published"${w.published ? ' checked' : ''}><span>Publicado</span></label>
    <label class="check"><input type="checkbox" name="featured"${w.featured ? ' checked' : ''}><span>Destaque na página inicial</span></label>
  </div>
  <div class="pform__row"><button class="btn btn--ink btn--sm" type="submit">Guardar</button><button class="btn btn--sm" type="button" data-cancel="work">Cancelar</button></div>
</form>`;

function renderEntries(editing = null) {
  sec('diario').innerHTML = `<div class="psec__bar"><p class="psec__intro">Entradas do diário. Os rascunhos não aparecem no site.</p><button class="btn btn--sm btn--ink" type="button" data-new="entry">Nova entrada</button></div>
  ${editing ? entryForm(editing) : ''}
  <ul class="rows">${state.entries.map((e) => `<li class="row"><div class="row__txt"><b>${esc(e.title)}</b><small>${esc(e.tag)} · ${esc(e.author)} · ${day(e.publishedAt)}</small></div>${yesNo(e.published)}<div class="row__acts">${e.published ? `<a class="btn btn--sm" href="/diario/${esc(e.slug)}" target="_blank" rel="noopener">Ver</a>` : ''}<button class="btn btn--sm" type="button" data-edit-entry="${e.id}">Editar</button><button class="btn btn--sm" type="button" data-del-entry="${e.id}">Apagar</button></div></li>`).join('')}</ul>`;
  sec('diario').querySelector('.editor input')?.focus();
}

const entryForm = (e) => `<form class="pform editor" data-entry="${e.id ?? ''}" novalidate>
  <h3>${e.id ? 'Editar entrada' : 'Nova entrada'}</h3>
  <div class="notice notice--error" role="alert" tabindex="-1" hidden></div>
  <div class="pform__grid">
    <div class="field pform__wide"><label for="e-title">Título</label><input class="input" id="e-title" name="title" maxlength="120" value="${esc(e.title ?? '')}"><p class="error-text" data-error="title"></p></div>
    <div class="field"><label for="e-tag">Etiqueta</label><input class="input" id="e-tag" name="tag" maxlength="30" value="${esc(e.tag ?? '')}"><p class="error-text" data-error="tag"></p></div>
    <div class="field"><label for="e-author">Quem assina</label><select class="select" id="e-author" name="author">${options(state.opts.leads, e.author)}</select></div>
    <div class="field pform__wide"><label for="e-ex">Resumo</label><input class="input" id="e-ex" name="excerpt" maxlength="300" value="${esc(e.excerpt ?? '')}"><p class="error-text" data-error="excerpt"></p></div>
    <div class="field pform__wide"><label for="e-body">Texto</label><textarea class="textarea" id="e-body" name="body" maxlength="8000" rows="8">${esc(e.body ?? '')}</textarea><p class="error-text" data-error="body"></p></div>
    <label class="check"><input type="checkbox" name="published"${e.published ? ' checked' : ''}><span>Publicado</span></label>
  </div>
  <div class="pform__row"><button class="btn btn--ink btn--sm" type="submit">Guardar</button><button class="btn btn--sm" type="button" data-cancel="entry">Cancelar</button></div>
</form>`;

// ---------- Ações ----------
async function loadAll() {
  const [b, p, w, e] = await Promise.all([api('/estudio/pedidos', { auth: true }), api('/estudio/projetos', { auth: true }), api('/estudio/trabalhos', { auth: true }), api('/estudio/diario', { auth: true })]);
  state.briefs = b.briefs;
  state.projects = p.projects;
  state.works = w.works;
  state.entries = e.entries;
  renderBriefs();
  renderProjects();
  renderWorks();
  renderEntries();
  counts();
}

const formJson = (form) => Object.fromEntries([...new FormData(form)].map(([k, v]) => [k, v]));

document.querySelector('.panel').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const box = form.querySelector('.notice');
  clearErrors(form, box);
  const button = form.querySelector('[type=submit]');
  button.disabled = true;
  try {
    const d = form.dataset;
    if (d.brief) {
      await api(`/estudio/pedidos/${d.brief}`, { method: 'PATCH', auth: true, body: formJson(form) });
      announce('Pedido atualizado.');
    } else if (d.accept) {
      const r = await api(`/estudio/pedidos/${d.accept}/aceitar`, { method: 'POST', auth: true, body: formJson(form) });
      state.open.add(r.project.id);
      await loadAll();
      const msg = r.temporaryPassword
        ? `Projeto criado e conta nova para ${r.client.email}. Palavra-passe provisória (só aparece agora): ${r.temporaryPassword}`
        : `Projeto criado para ${r.client.email}, que já tinha conta.`;
      sec('pedidos').insertAdjacentHTML('afterbegin', `<div class="notice notice--ok" role="status" tabindex="-1">${esc(msg)}</div>`);
      sec('pedidos').querySelector('.notice--ok').focus();
      return;
    } else if (d.phase) {
      await api(`/estudio/projetos/${d.phase}/fase`, { method: 'PATCH', auth: true, body: formJson(form) });
      announce('Fase mudada.');
    } else if (d.proof) {
      await api(`/estudio/projetos/${d.proof}/provas`, { method: 'POST', auth: true, body: formJson(form) });
      announce('Prova enviada ao cliente.');
    } else if (d.message) {
      await api(`/estudio/projetos/${d.message}/mensagens`, { method: 'POST', auth: true, body: formJson(form) });
      announce('Mensagem enviada.');
    } else if (d.work !== undefined) {
      const body = { ...formJson(form), published: form.published.checked, featured: form.featured.checked };
      await api(d.work ? `/estudio/trabalhos/${d.work}` : '/estudio/trabalhos', { method: d.work ? 'PUT' : 'POST', auth: true, body });
      announce('Trabalho guardado.');
    } else if (d.entry !== undefined) {
      const body = { ...formJson(form), published: form.published.checked };
      await api(d.entry ? `/estudio/diario/${d.entry}` : '/estudio/diario', { method: d.entry ? 'PUT' : 'POST', auth: true, body });
      announce('Entrada guardada.');
    }
    await loadAll();
  } catch (err) {
    showErrors(form, box, err);
  } finally {
    button.disabled = false;
  }
});

document.querySelector('.panel').addEventListener('click', async (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  const d = t.dataset;
  if (d.goto) selectTab(d.goto, true);
  if (d.new === 'work') renderWorks({});
  if (d.new === 'entry') renderEntries({ author: state.opts.leads[0] });
  if (d.cancel === 'work') renderWorks();
  if (d.cancel === 'entry') renderEntries();
  if (d.editWork) renderWorks(state.works.find((w) => w.id === d.editWork));
  if (d.editEntry) renderEntries(state.entries.find((x) => x.id === d.editEntry));
  if (d.delWork || d.delEntry) {
    if (!confirm('Apagar mesmo? Não dá para desfazer.')) return;
    await api(d.delWork ? `/estudio/trabalhos/${d.delWork}` : `/estudio/diario/${d.delEntry}`, { method: 'DELETE', auth: true });
    announce('Apagado.');
    await loadAll();
  }
});

// Abrir um projeto marca as mensagens dele como lidas
document.querySelector('.panel').addEventListener(
  'toggle',
  (e) => {
    const el = e.target;
    if (!el.dataset?.project) return;
    if (el.open) {
      state.open.add(el.dataset.project);
      const p = state.projects.find((x) => x.id === el.dataset.project);
      if (p?.unread) api(`/estudio/projetos/${p.id}/lidas`, { method: 'POST', auth: true }).then(() => ((p.unread = 0), counts())).catch(() => {});
    } else state.open.delete(el.dataset.project);
  },
  true,
);

const user = await requireRole('estudio');
if (user) {
  document.getElementById('area-title').textContent = `Olá, ${user.name.split(' ')[0]}`;
  state.opts = await api('/estudio/opcoes', { auth: true });
  await loadAll();
  const start = location.hash.slice(1);
  if (['pedidos', 'projetos', 'trabalhos', 'diario'].includes(start)) selectTab(start);
  document.querySelector('.panel').setAttribute('aria-busy', 'false');
}
