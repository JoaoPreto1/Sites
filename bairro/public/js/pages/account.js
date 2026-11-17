import { api, updateStoredUser } from '../api.js';
import { logout, requireUser } from '../session.js';
import { dateLabel, escapeHtml as esc, euros, photoUrl, timeLabel } from '../shared/format.js';
import { formValues, showFieldErrors, submitting, toast } from '../utils.js';

const TABS = [
  ['projeto', 'Projeto'],
  ['provas', 'Provas'],
  ['mensagens', 'Mensagens'],
  ['pedidos', 'Pedidos'],
  ['faturas', 'Faturas'],
  ['perfil', 'Perfil'],
];

const badge = (status, label) => `<span class="badge badge--${esc(status.replace(/\s/g, '-'))}">${esc(label)}</span>`;

function phases(job) {
  return `<div class="copy">
    <p class="copy__line">A copiar <b>${esc(job.title)}</b> para o mundo real…</p>
    <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${job.progress}" aria-label="Progresso do projeto"><span style="--value:${job.progress}%"></span></div>
    <p class="small mute">Fase atual: <b>${esc(job.phaseName)}</b> · entrega prevista a ${dateLabel(job.dueDate)}</p>
    <ol class="phases">
      ${job.phases
        .map((name, i) => `<li class="${i < job.phase ? 'is-done' : i === job.phase ? 'is-now' : ''}"><span class="phases__box" aria-hidden="true"></span>${esc(name)}${i === job.phase ? ' <span class="small mute">(agora)</span>' : ''}</li>`)
        .join('')}
    </ol>
  </div>`;
}

function projectPanel(job, user) {
  if (!job) {
    return `<div class="empty">Ainda não há nenhum projeto em curso.<br>Quando um pedido seu for aceite, aparece aqui.<br><br><a class="btn btn--primary" href="/orcamento">Pedir orçamento</a></div>`;
  }
  return `<div class="overview">
    ${phases(job)}
    <div class="overview__side">
      <p class="legend">O que precisa de si</p>
      ${
        job.pending
          ? `<p>${job.pending} ${job.pending === 1 ? 'prova à espera' : 'provas à espera'} da sua opinião.</p><button class="btn btn--primary btn--small" type="button" data-go="provas">Ver provas</button>`
          : '<p>Nada, por agora. Avisamos por email quando houver provas novas.</p>'
      }
      <p class="legend">Contacto</p>
      <p class="small">${esc(user.company || user.name)} · desde ${dateLabel(job.startedAt)}</p>
    </div>
  </div>`;
}

function proofsPanel(job) {
  if (!job?.proofs.length) return '<p class="empty">Ainda não há provas. Aparecem aqui quando houver esboços para ver.</p>';
  return `<ul class="proofs">
    ${[...job.proofs]
      .reverse()
      .map(
        (p) => `<li class="proof" data-proof="${p.id}">
        <a class="proof__img" href="${photoUrl(p.photo, 1400)}" target="_blank" rel="noopener"><img src="${photoUrl(p.photo, 500, 0.7)}" width="500" height="350" alt="Prova ${esc(p.name)}" loading="lazy"></a>
        <div class="proof__body">
          <p class="proof__name">${esc(p.name)}</p>
          <p>${badge(p.status, p.statusName)} <span class="small mute">${timeLabel(p.at)}</span></p>
          ${p.comment ? `<p class="small proof__comment">“${esc(p.comment)}”</p>` : ''}
          ${
            p.status === 'pendente'
              ? `<form class="proof__form" novalidate>
                  <label class="field"><span>Comentário <span class="mute">(obrigatório para pedir alterações)</span></span><textarea name="comment" rows="2"></textarea></label>
                  <div class="proof__actions"><button class="btn btn--primary btn--small" type="submit" value="aprovado">Aprovar</button><button class="btn btn--small" type="submit" value="alteracoes">Pedir alterações</button></div>
                </form>`
              : ''
          }
        </div>
      </li>`,
      )
      .join('')}
  </ul>`;
}

function messagesPanel(job) {
  if (!job) return '<p class="empty">As mensagens aparecem quando houver um projeto em curso.</p>';
  return `<div class="chat">
    <ol class="chat__list" data-chat>
      ${job.messages
        .map((m) => `<li class="msg msg--${m.from}"><p class="msg__meta small">${esc(m.author)} · ${timeLabel(m.at)}</p><p>${esc(m.text)}</p></li>`)
        .join('')}
    </ol>
    <form class="chat__form" data-message-form novalidate>
      <label class="field"><span class="sr-only">Mensagem</span><textarea name="text" rows="2" placeholder="Escreva à equipa…" required></textarea></label>
      <button class="btn btn--primary" type="submit">Enviar</button>
    </form>
  </div>`;
}

function requestsPanel(requests) {
  if (!requests.length) return '<p class="empty">Ainda não fez pedidos de orçamento com este email.</p>';
  return `<div class="table-wrap"><table class="table">
    <thead><tr><th>N.º</th><th>Data</th><th>Serviços</th><th>Valor</th><th>Estado</th></tr></thead>
    <tbody>${requests
      .map(
        (r) => `<tr><td>${r.number}</td><td>${dateLabel(r.createdAt)}</td><td>${esc(r.serviceNames.join(', ') || 'A definir')}</td><td>${esc(r.budgetName)}</td><td>${badge(r.status, r.statusName)}</td></tr>`,
      )
      .join('')}</tbody>
  </table></div>`;
}

function invoicesPanel(job) {
  if (!job?.invoices.length) return '<p class="empty">Ainda não há faturas.</p>';
  return `<div class="table-wrap"><table class="table">
    <thead><tr><th>Fatura</th><th>Descrição</th><th>Data</th><th class="num">Valor</th><th>Estado</th></tr></thead>
    <tbody>${job.invoices
      .map((f) => `<tr><td>${esc(f.id)}</td><td>${esc(f.label)}</td><td>${dateLabel(f.date)}</td><td class="num">${euros(f.amount)}</td><td>${badge(f.status, f.status)}</td></tr>`)
      .join('')}</tbody>
  </table></div>`;
}

function profilePanel(user) {
  return `<div class="profile">
    <form data-profile-form novalidate>
      <p class="legend">Dados</p>
      <label class="field"><span>Nome</span><input name="name" value="${esc(user.name)}" autocomplete="name"></label>
      <label class="field"><span>Negócio</span><input name="company" value="${esc(user.company ?? '')}" autocomplete="organization"></label>
      <label class="field"><span>Telefone</span><input name="phone" value="${esc(user.phone ?? '')}" autocomplete="tel"></label>
      <p class="small mute">Email: ${esc(user.email)}</p>
      <button class="btn btn--small" type="submit">Guardar</button>
    </form>
    <form data-password-form novalidate>
      <p class="legend">Palavra-passe</p>
      <label class="field"><span>Atual</span><input name="currentPassword" type="password" autocomplete="current-password"></label>
      <label class="field"><span>Nova</span><input name="newPassword" type="password" autocomplete="new-password"></label>
      <button class="btn btn--small" type="submit">Mudar palavra-passe</button>
    </form>
  </div>`;
}

export async function mount(win) {
  const root = win.querySelector('[data-account]');
  win.querySelector('[data-logout]').addEventListener('click', logout);

  const user = await requireUser();
  if (!user) return;
  if (user.role === 'admin') {
    window.location.replace('/painel');
    return;
  }

  let [{ jobs }, { requests }] = await Promise.all([api('/trabalhos', { auth: true }), api('/pedidos/meus', { auth: true })]);
  let job = jobs[0] ?? null;
  let tab = 'projeto';

  root.querySelector('.account__title').textContent = `Olá, ${user.name.split(' ')[0]}`;

  const render = () => {
    const panels = {
      projeto: projectPanel(job, user),
      provas: proofsPanel(job),
      mensagens: messagesPanel(job),
      pedidos: requestsPanel(requests),
      faturas: invoicesPanel(job),
      perfil: profilePanel(user),
    };
    root.querySelector('[data-loading]')?.remove();
    root.querySelector('.account__body')?.remove();
    root.insertAdjacentHTML(
      'beforeend',
      `<div class="account__body">
        ${jobs.length > 1 ? `<label class="field account__job"><span>Projeto</span><select data-job>${jobs.map((j) => `<option value="${j.id}"${j.id === job.id ? ' selected' : ''}>${esc(j.title)}</option>`).join('')}</select></label>` : ''}
        ${job ? `<p class="account__job-title">${esc(job.title)}</p>` : ''}
        <div class="tabs" role="tablist">
          ${TABS.map(
            ([id, label]) =>
              `<button type="button" role="tab" aria-selected="${id === tab}" data-tab="${id}">${label}${id === 'provas' && job?.pending ? `<span class="count">${job.pending}</span>` : ''}</button>`,
          ).join('')}
        </div>
        <div class="panel" role="tabpanel">${panels[tab]}</div>
      </div>`,
    );
    const chat = root.querySelector('[data-chat]');
    if (chat) chat.scrollTop = chat.scrollHeight;
  };

  const replaceJob = (updated) => {
    jobs = jobs.map((j) => (j.id === updated.id ? updated : j));
    job = updated;
  };

  root.addEventListener('click', (event) => {
    const target = event.target.closest('[data-tab], [data-go]');
    if (!target) return;
    tab = target.dataset.tab ?? target.dataset.go;
    render();
    root.querySelector(`[data-tab="${tab}"]`)?.focus();
  });

  root.addEventListener('change', (event) => {
    if (!event.target.matches('[data-job]')) return;
    job = jobs.find((j) => j.id === event.target.value);
    render();
  });

  root.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const button = event.submitter ?? form.querySelector('[type="submit"]');

    await submitting(button, async () => {
      try {
        if (form.matches('.proof__form')) {
          const proofId = form.closest('[data-proof]').dataset.proof;
          const { job: updated } = await api(`/trabalhos/${job.id}/provas/${proofId}`, {
            method: 'PATCH',
            auth: true,
            body: { decision: button.value, comment: form.elements.comment.value.trim() || undefined },
          });
          replaceJob(updated);
          toast(button.value === 'aprovado' ? 'Prova aprovada. Obrigado!' : 'Pedido de alterações enviado à equipa.');
          render();
        } else if (form.matches('[data-message-form]')) {
          const { job: updated } = await api(`/trabalhos/${job.id}/mensagens`, { method: 'POST', auth: true, body: formValues(form) });
          replaceJob(updated);
          render();
          root.querySelector('[data-message-form] textarea')?.focus();
        } else if (form.matches('[data-profile-form]')) {
          const { user: updated } = await api('/auth/me', { method: 'PATCH', auth: true, body: formValues(form) });
          Object.assign(user, updated);
          updateStoredUser(updated);
          toast('Dados guardados.');
        } else if (form.matches('[data-password-form]')) {
          await api('/auth/me/password', { method: 'PATCH', auth: true, body: formValues(form) });
          form.reset();
          toast('Palavra-passe alterada.');
        }
      } catch (error) {
        if (error.details?.length) showFieldErrors(form, error.details);
        else toast(error.message, { type: 'error' });
      }
    });
  });

  render();
}
