import { api } from '../api.js';
import { logout, requireRole } from '../session.js';
import { announce, badge, chip, day, dayTime, esc, img, paragraphs } from '../utils.js';

const root = document.getElementById('project');
const tabs = document.getElementById('project-tabs');
let projects = [];
let currentId = null;

document.querySelector('[data-logout]').addEventListener('click', logout);

const phaseTrack = (p) => `<ol class="track" aria-label="Fases do projeto">${p.phases
  .map((ph, i) => `<li class="track__step track__step--${ph.state} track__step--${i}"${ph.state === 'agora' ? ' aria-current="step"' : ''}><span class="track__blk" aria-hidden="true">${ph.state === 'feita' ? '✓' : i + 1}</span><b>${esc(ph.label)}</b><small>${ph.state === 'feita' ? `feita${ph.doneAt ? ` a ${day(ph.doneAt)}` : ''}` : `até ${day(ph.due)}`}</small><span class="sr-only">${ph.state === 'feita' ? 'concluída' : ph.state === 'agora' ? 'fase atual' : 'por fazer'}</span></li>`)
  .join('')}</ol>`;

const proofCard = (pr) => `<article class="proof proof--${pr.status}" data-proof="${pr.id}">
  <a class="proof__img" href="${esc(pr.image)}-1200.webp" target="_blank" rel="noopener">${img(pr.image, `${pr.title}, versão ${pr.version}`)}<span class="sr-only"> (abrir em tamanho grande)</span></a>
  <div class="proof__txt">
    <p class="proof__meta">${badge(pr.status)}<span>enviada a ${dayTime(pr.createdAt)}</span></p>
    <h3>${esc(pr.title)} <span>v${pr.version}</span></h3>
    ${pr.note ? `<p>${esc(pr.note)}</p>` : ''}
    ${pr.clientComment ? `<blockquote class="proof__comment"><b>O seu comentário${pr.decidedAt ? ` · ${dayTime(pr.decidedAt)}` : ''}</b>${esc(pr.clientComment)}</blockquote>` : ''}
    ${
      pr.status === 'pendente'
        ? `<form class="proof__form" data-decide="${pr.id}" novalidate>
      <label class="sr-only" for="c-${pr.id}">Comentário sobre ${esc(pr.title)} v${pr.version}</label>
      <textarea class="textarea" id="c-${pr.id}" name="comment" maxlength="1000" placeholder="Comentário (obrigatório para pedir alterações)"></textarea>
      <p class="error-text" data-error="comment"></p>
      <div class="proof__acts"><button class="btn btn--sm proof__ok" type="submit" value="aprovada">Aprovar</button><button class="btn btn--sm btn--yellow" type="submit" value="alteracoes">Pedir alterações</button></div>
    </form>`
        : ''
    }
  </div>
</article>`;

const messageList = (p) =>
  p.messages.length
    ? p.messages.map((m) => `<li class="msg ${m.fromStudio ? 'msg--studio' : 'msg--me'}"><p class="msg__who">${esc(m.authorName)}${m.fromStudio ? ' · Pilha' : ''} <time datetime="${m.createdAt}">${dayTime(m.createdAt)}</time></p>${paragraphs(m.body)}</li>`).join('')
    : '<li class="empty">Ainda não há mensagens.</li>';

function render() {
  const p = projects.find((x) => x.id === currentId);
  tabs.innerHTML = projects.length > 1 ? projects.map((x) => `<a href="#${x.id}" class="ptab${x.id === currentId ? ' is-on' : ''}"${x.id === currentId ? ' aria-current="true"' : ''}>${esc(x.title)}${x.pendingProofs + x.unread ? ` <span>${x.pendingProofs + x.unread}</span>` : ''}</a>`).join('') : '';
  if (!p) {
    root.innerHTML = '<p class="empty">Ainda não tem projetos connosco. <a href="/contacto">Atire-nos um problema</a>.</p>';
    return;
  }
  const pending = p.proofs.filter((x) => x.status === 'pendente').length;
  root.innerHTML = `<div class="proj-head">
    <div><p>${chip(p.service)} · Responsável: <b>${esc(p.lead)}</b></p><h2 class="display">${esc(p.title)}</h2><p class="proj-head__sum">${esc(p.summary)}</p></div>
    <p class="proj-head__now"><b>Agora</b>${esc(p.phases.find((x) => x.state === 'agora')?.label ?? '')}<small>entrega prevista a ${day(p.phases.at(-1).due)}</small></p>
  </div>
  ${phaseTrack(p)}
  <div class="proj-grid">
    <section aria-labelledby="provas-t" class="proj-proofs">
      <h2 class="area-h" id="provas-t">Provas ${pending ? `<span class="count">${pending} por responder</span>` : ''}</h2>
      ${p.proofs.length ? p.proofs.map(proofCard).join('') : '<p class="empty">Ainda não há provas para ver.</p>'}
    </section>
    <section aria-labelledby="msg-t" class="proj-msgs">
      <h2 class="area-h" id="msg-t">Mensagens</h2>
      <ol class="thread">${messageList(p)}</ol>
      <form class="reply" id="reply" novalidate>
        <label for="reply-body">Escrever ao estúdio</label>
        <textarea class="textarea" id="reply-body" name="body" maxlength="2000" required></textarea>
        <p class="error-text" data-error="body"></p>
        <button class="btn btn--ink btn--sm" type="submit">Enviar mensagem</button>
      </form>
    </section>
  </div>`;
  const thread = root.querySelector('.thread');
  thread.scrollTop = thread.scrollHeight;
  if (p.unread) api(`/cliente/projetos/${p.id}/lidas`, { method: 'POST', auth: true }).then(() => (p.unread = 0)).catch(() => {});
}

async function load() {
  ({ projects } = await api('/cliente/projetos', { auth: true }));
  const fromHash = location.hash.slice(1);
  currentId = projects.some((p) => p.id === fromHash) ? fromHash : (currentId ?? projects[0]?.id);
  render();
  document.querySelector('.area').setAttribute('aria-busy', 'false');
}

root.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const button = e.submitter;
  form.querySelectorAll('[data-error]').forEach((el) => (el.textContent = ''));
  try {
    if (form.dataset.decide) {
      const decision = button?.value ?? 'aprovada';
      const comment = form.comment.value.trim();
      if (decision === 'alteracoes' && !comment) {
        form.querySelector('[data-error=comment]').textContent = 'Diga-nos o que quer mudar.';
        form.comment.setAttribute('aria-invalid', 'true');
        form.comment.focus();
        return;
      }
      await api(`/cliente/provas/${form.dataset.decide}/decisao`, { method: 'POST', auth: true, body: { decision, comment } });
      announce(decision === 'aprovada' ? 'Prova aprovada. Obrigado!' : 'Pedido de alterações enviado ao estúdio.');
    } else if (form.id === 'reply') {
      await api(`/cliente/projetos/${currentId}/mensagens`, { method: 'POST', auth: true, body: { body: form.body.value } });
      announce('Mensagem enviada.');
    }
    await load();
    if (form.id === 'reply') document.getElementById('reply-body')?.focus();
  } catch (err) {
    const slot = form.querySelector('[data-error]');
    if (slot) slot.textContent = err.details?.[0]?.message ?? err.message;
  }
});

addEventListener('hashchange', () => {
  const id = location.hash.slice(1);
  if (projects.some((p) => p.id === id)) {
    currentId = id;
    render();
  }
});

const user = await requireRole('cliente');
if (user) {
  document.getElementById('area-title').textContent = `Olá, ${user.name.split(' ')[0]}`;
  await load();
}
