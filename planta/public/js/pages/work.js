import { ApiError, api } from '../api.js';
import { logout, requireUser } from '../session.js';
import { toast } from '../utils.js';

const root = document.querySelector('[data-work]');

const esc = (v = '') => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const day = (iso) => new Date(iso).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });
const short = (iso) => new Date(iso).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
const time = (iso) => new Date(iso).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
const STATE = { feita: 'feita', agora: 'em curso', depois: 'por fazer' };

function render(work) {
  document.querySelector('[data-work-title]').innerHTML = `${esc(work.title.split(',')[0])}<em>${work.title.includes(',') ? `,${esc(work.title.split(',').slice(1).join(','))}` : ''}</em>`;
  document.querySelector('[data-work-summary]').textContent = work.summary;
  const next = work.meetings.filter((m) => !m.past);

  root.innerHTML = `<div>
    <h2 class="display display--sm">O caderno do projeto</h2>
    <ol class="phases">
      ${work.phases
        .map(
          (p) => `<li class="phase phase--${p.status}"${p.status === 'agora' ? ' aria-current="step"' : ''}>
        <span class="phase__code">${p.code}</span>
        <div><h3>${esc(p.label)}</h3><p>${esc(p.detail)}</p></div>
        <span class="phase__state">${STATE[p.status]}${p.start && p.status !== 'depois' ? ` · ${short(p.start)}` : ''}</span>
      </li>`,
        )
        .join('')}
    </ol>
    <div class="docs">
      <h2 class="display display--sm" style="margin:26px 0 8px">Desenhos entregues</h2>
      ${work.documents.length ? work.documents.map((d) => `<div class="doc"><b>${esc(d.code)}</b><span>${esc(d.name)}</span><small>${short(d.at)} · ${esc(d.size)}</small></div>`).join('') : '<p class="empty">Ainda não há desenhos entregues.</p>'}
    </div>
  </div>
  <aside class="side">
    <div class="box">
      <h2>Reuniões</h2>
      ${
        next.length
          ? next
              .map(
                (m) => `<div class="meeting"><b>${esc(day(m.at))}, ${time(m.at)}</b><p>${esc(m.topic)}</p><p class="muted">${esc(m.where)}</p>${m.confirmed ? '<span class="meeting__ok">✓ confirmada</span>' : `<button class="btn btn--small" type="button" data-confirm="${m.id}">Confirmar presença</button>`}</div>`,
              )
              .join('')
          : '<p class="empty" style="padding:0">Sem reuniões marcadas.</p>'
      }
    </div>
    <div class="box">
      <h2>Mensagens</h2>
      <div class="thread" data-thread>${work.messages.map((m) => `<div class="msg msg--${m.from}">${esc(m.text)}<small>${m.from === 'cliente' ? 'eu' : 'Leonor'} · ${short(m.at)}, ${time(m.at)}</small></div>`).join('')}</div>
      <form class="reply" data-reply>
        <label class="field"><span class="sr" style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--mute)">Escrever à arquiteta</span><textarea class="input input--box" name="text" maxlength="1000" required></textarea></label>
        <button class="btn btn--small" type="submit">Enviar</button>
      </form>
    </div>
  </aside>`;
  root.removeAttribute('aria-busy');
  const thread = root.querySelector('[data-thread]');
  thread.scrollTop = thread.scrollHeight;
}

async function act(task) {
  try {
    render((await task()).work);
  } catch (err) {
    toast(err instanceof ApiError ? err.message : 'Sem ligação. Tente outra vez.', { type: 'error' });
  }
}

root.addEventListener('click', (event) => {
  const button = event.target.closest('[data-confirm]');
  if (!button) return;
  button.disabled = true;
  act(() => api(`/conta/obra/reunioes/${button.dataset.confirm}/confirmar`, { method: 'POST', auth: true })).then(() => toast('Presença confirmada'));
});

root.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-reply]');
  if (!form) return;
  event.preventDefault();
  const text = form.elements.text.value.trim();
  if (!text) return;
  form.querySelector('button').disabled = true;
  act(() => api('/conta/obra/mensagens', { method: 'POST', body: { text }, auth: true }));
});

document.querySelectorAll('[data-logout]').forEach((b) => b.addEventListener('click', logout));

const user = await requireUser();
if (user) {
  document.querySelector('[data-user-name]').textContent = user.name;
  if (user.role === 'admin') window.location.replace('/painel');
  try {
    render((await api('/conta/obra', { auth: true })).work);
  } catch (err) {
    root.removeAttribute('aria-busy');
    root.innerHTML = `<div class="box" style="grid-column:1/-1"><h2>Ainda não há obra nesta conta</h2><p>${esc(err.message)}. Quando a primeira reunião estiver marcada, o caderno do projeto aparece aqui.</p><p style="margin-top:16px"><a class="btn" href="/contactos">Pedir uma reunião</a></p></div>`;
  }
}
