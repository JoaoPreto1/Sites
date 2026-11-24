import { api, updateStoredUser } from '../api.js';
import { bytes, dateLong, dateShort, dateTime, esc, euros, toCents } from '../format.js';
import { logout, requireUser } from '../session.js';
import { formValues, showFieldErrors, submitting, toast } from '../utils.js';

const STATUS = { em_analise: 'Em análise', alteracoes: 'Alterações pedidas', ativo: 'Ativo', recusado: 'Recusado', suspenso: 'Suspenso', concluido: 'Concluído' };
const CONV = { pendente: 'Por responder', aberta: 'Aberta', recusada: 'Recusada', fechada: 'Fechada' };
const PUBLIC = { privado: 'Só a moderação vê', pedido: 'Partilha pedida, à espera da moderação', aprovado: 'Imagem visível no pedido', recusado: 'A moderação não aprovou a partilha' };
const PAY = { simulado: 'Simulada', pago: 'Paga', falhado: 'Não concluída', reembolsado: 'Reembolsada' };

const $ = (sel, root = document) => root.querySelector(sel);
const user = await requireUser();
let state = { ads: [], conversations: [], donations: [] };
let currentThread = null;

if (user) init();

function init() {
  $('[data-hello]').textContent = `Olá, ${user.name.split(' ')[0]}`;
  $('#profile').name.value = user.name;
  $('#profile').email.value = user.email;

  const tabs = [...document.querySelectorAll('[role=tab]')];
  const select = (id, push = true) => {
    tabs.forEach((t) => {
      const on = t.getAttribute('aria-controls') === id;
      t.setAttribute('aria-selected', String(on));
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (push) history.replaceState(null, '', id === 'novo' ? '/conta/novo-pedido' : `/conta#${id}`);
  };
  tabs.forEach((t) => t.addEventListener('click', () => select(t.getAttribute('aria-controls'))));
  const initial = location.pathname.endsWith('/novo-pedido') ? 'novo' : location.hash.slice(1);
  select(tabs.some((t) => t.getAttribute('aria-controls') === initial) ? initial : 'pedidos', false);
  window.selectTab = select;

  setupAdForm(select);
  setupUpload();
  setupData();
  load();
}

async function load() {
  try {
    state = await api('/conta/resumo', { auth: true });
    renderAds();
    renderConversations();
    renderDonations();
    $('[data-deletion-pending]').hidden = !state.deletionPending;
    $('#delete').hidden = state.deletionPending;
  } catch (err) {
    toast(err.message, { type: 'error' });
  }
}

/* Os meus pedidos */
function renderAds() {
  const box = $('[data-ads]');
  if (!state.ads.length) {
    box.innerHTML = '<div class="empty"><p>Ainda não criou nenhum pedido.</p><button class="btn btn--ink" type="button" data-go="novo">Criar o primeiro pedido</button></div>';
    $('[data-go]', box).addEventListener('click', () => window.selectTab('novo'));
    return;
  }
  box.innerHTML = state.ads.map(adCard).join('');
  box.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => adAction(b.dataset.act, b.dataset.id, b)));
}

function adCard(ad) {
  const review = ad.lastReview && ['alteracoes', 'recusado', 'suspenso'].includes(ad.status) && ad.lastReview.note
    ? `<p class="notice notice--warn"><b>Nota da moderação (${dateShort(ad.lastReview.at)}):</b> ${esc(ad.lastReview.note)}</p>` : '';
  const flags = ad.flags?.length && ad.status === 'em_analise' ? '<p class="notice notice--warn">O texto parece ter contactos ou dados pessoais. A moderação vai pedir para os retirar.</p>' : '';
  const editable = ['em_analise', 'alteracoes', 'ativo'].includes(ad.status);
  const open = !['concluido', 'recusado'].includes(ad.status);
  const docs = ad.documents
    .map(
      (d) => `<li><span><b>${esc(d.description)}</b><small>${esc(d.mime === 'application/pdf' ? 'PDF' : 'Imagem')} · ${bytes(d.size || 40000)} · ${d.verified ? 'verificada' : 'por verificar'} · ${PUBLIC[d.publicStatus]}${d.metadataRemoved ? '' : ' · metadados do PDF podem não ter sido retirados'}</small></span>
      <span class="doc-acts"><a class="linkbtn linkbtn--ink" href="#" data-act="view-doc" data-id="${d.id}">Ver</a>${d.mime.startsWith('image/') ? `<button class="linkbtn linkbtn--ink" type="button" data-act="${d.shareRequested ? 'unshare' : 'share'}" data-id="${d.id}">${d.shareRequested ? 'Deixar de partilhar' : 'Autorizar imagem pública'}</button>` : ''}<button class="linkbtn" type="button" data-act="del-doc" data-id="${d.id}">Apagar</button></span></li>`,
    )
    .join('');

  return `<article class="mycard">
    <header><div><span class="status status--${ad.status}">${STATUS[ad.status]}</span><h2>${esc(ad.title)}</h2><p class="hint">Criado a ${dateLong(ad.createdAt)}${ad.publishedAt ? ` · publicado a ${dateLong(ad.publishedAt)}` : ''}</p></div>
    <dl class="mycard__nums mono"><div><dt>Pedido</dt><dd>${euros(ad.amountCents)}</dd></div><div><dt>Recebido</dt><dd>${euros(ad.raisedCents)}</dd></div><div><dt>Falta</dt><dd>${euros(ad.remainingCents)}</dd></div></dl></header>
    <div class="meter"><span style="width:${ad.percent}%"></span></div>
    ${review}${flags}
    <div class="mycard__acts">
      ${ad.status === 'ativo' || ad.status === 'concluido' ? `<a class="btn btn--sm" href="/pedidos/${esc(ad.slug)}">Ver pedido público</a>` : ''}
      ${editable ? `<button class="btn btn--sm" type="button" data-act="edit" data-id="${ad.id}">Editar</button>` : ''}
      ${ad.status === 'ativo' ? `<button class="btn btn--sm" type="button" data-act="update" data-id="${ad.id}">Publicar atualização</button>` : ''}
      ${open ? `<button class="btn btn--sm btn--ghost" type="button" data-act="close" data-id="${ad.id}">Fechar pedido</button>` : ''}
    </div>
    <div class="mycard__docs"><h3>Provas <small>privadas, só a moderação vê</small></h3>
      ${docs ? `<ul class="docs">${docs}</ul>` : '<p class="hint">Sem provas. São opcionais, mas ajudam a moderação e quem doa.</p>'}
      ${open && ad.documents.length < 4 ? `<button class="btn btn--sm btn--ghost" type="button" data-act="upload" data-id="${ad.id}">+ Juntar prova</button>` : ''}
    </div>
  </article>`;
}

async function adAction(act, id, button) {
  const ad = state.ads.find((a) => a.id === id);
  try {
    if (act === 'edit') return fillAdForm(ad);
    if (act === 'upload') {
      const dialog = $('#upload');
      dialog.dataset.ad = id;
      dialog.querySelector('form').reset();
      return dialog.showModal();
    }
    if (act === 'close') {
      if (!confirm('Fechar este pedido? Deixa de receber doações e não pode ser reaberto.')) return;
      await api(`/conta/anuncios/${id}/fechar`, { method: 'POST', auth: true });
      toast('Pedido fechado.');
    }
    if (act === 'update') {
      const text = prompt('Escreva a atualização (10 a 600 caracteres). Fica visível no pedido.');
      if (!text) return;
      const res = await api(`/conta/anuncios/${id}/atualizacoes`, { method: 'POST', auth: true, body: { text } });
      toast(res.masked ? 'Atualização publicada. Retirámos um contacto que estava no texto.' : 'Atualização publicada.');
    }
    if (act === 'view-doc') return openDoc(`/conta/provas/${id}`);
    if (act === 'share' || act === 'unshare') {
      await api(`/conta/provas/${id}`, { method: 'PATCH', auth: true, body: { shareRequested: act === 'share' } });
      toast(act === 'share' ? 'Autorização registada. A moderação vai confirmar a imagem.' : 'A imagem deixou de estar pública.');
    }
    if (act === 'del-doc') {
      if (!confirm('Apagar esta prova? O ficheiro é apagado de imediato.')) return;
      await api(`/conta/provas/${id}`, { method: 'DELETE', auth: true });
      toast('Prova apagada.');
    }
    await load();
  } catch (err) {
    toast(err.details?.[0]?.message ?? err.message, { type: 'error' });
  }
}

// Ficheiros privados: pedidos com o token e abertos a partir de um blob, nunca por um link público
async function openDoc(path) {
  const win = window.open('', '_blank');
  const get = () => fetch(`/api${path}`, { headers: { Authorization: `Bearer ${localStorage.getItem('amparo.token')}` } });
  let res = await get();
  if (res.status === 401) {
    await api('/auth/me', { auth: true });
    res = await get();
  }
  if (!res.ok) {
    win?.close();
    return toast('Não foi possível abrir a prova.', { type: 'error' });
  }
  const url = URL.createObjectURL(await res.blob());
  if (win) win.location.href = url;
  else window.location.href = url;
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/* Formulário do pedido */
function setupAdForm(select) {
  const form = $('#ad-form');
  const count = $('[data-count]', form);
  const sens = $('[data-sensitive]', form);
  const today = new Date().toISOString().slice(0, 10);
  form.deadline.min = today;
  let timer;

  const check = () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        const { flags } = await api('/anuncios/verificar-texto', { method: 'POST', body: { title: form.title.value, story: form.story.value, alias: form.alias.value } });
        const LABEL = { email: 'um email', iban: 'um IBAN', telefone: 'um telefone', identificacao: 'um número de identificação', morada: 'uma morada', codigo_postal: 'um código postal' };
        sens.hidden = !flags.length;
        sens.textContent = flags.length ? `Parece que escreveu ${flags.map((f) => LABEL[f]).join(', ')}. Retire-o antes de enviar: o pedido é público.` : '';
      } catch {}
    }, 500);
  };
  form.story.addEventListener('input', () => {
    count.textContent = form.story.value.length;
    check();
  });
  form.title.addEventListener('input', check);
  form.alias.addEventListener('input', check);

  $('[data-cancel-edit]', form).addEventListener('click', () => {
    resetAdForm();
    select('pedidos');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = formValues(form);
    const body = {
      title: v.title,
      story: v.story,
      category: v.category,
      amount: toCents(v.amount) / 100,
      deadline: v.deadline || undefined,
      alias: v.alias,
      district: v.district,
      privateNote: v.privateNote,
      visibility: Object.fromEntries(['alias', 'district', 'deadline', 'proofs', 'donors'].map((k) => [k, form[`vis-${k}`].checked])),
      confirm: form.confirm.checked,
    };
    await submitting(form.querySelector('[type=submit]'), async () => {
      try {
        const id = form.adId.value;
        const res = await api(id ? `/conta/anuncios/${id}` : '/conta/anuncios', { method: id ? 'PUT' : 'POST', auth: true, body });
        toast(res.flags?.length ? 'Enviado. O texto parece ter dados pessoais: a moderação vai pedir para os retirar.' : 'Pedido enviado para moderação. Pode juntar provas na lista dos seus pedidos.');
        resetAdForm();
        await load();
        select('pedidos');
        window.scrollTo({ top: 0 });
      } catch (err) {
        showFieldErrors(form, err.details);
        if (!err.details?.length) toast(err.message, { type: 'error' });
      }
    });
  });
}

function resetAdForm() {
  const form = $('#ad-form');
  form.reset();
  form.adId.value = '';
  $('[data-count]', form).textContent = '0';
  $('[data-sensitive]', form).hidden = true;
  $('[data-edit-warning]', form).hidden = true;
  $('[data-cancel-edit]', form).hidden = true;
  $('#tab-novo').textContent = 'Novo pedido';
}

function fillAdForm(ad) {
  const form = $('#ad-form');
  resetAdForm();
  form.adId.value = ad.id;
  form.title.value = ad.title;
  form.story.value = ad.story;
  form.category.value = ad.category;
  form.amount.value = (ad.amountCents / 100).toFixed(2).replace('.', ',');
  form.deadline.value = ad.deadline ?? '';
  form.alias.value = ad.alias ?? '';
  form.district.value = ad.district;
  form.privateNote.value = ad.privateNote ?? '';
  Object.entries(ad.visibility).forEach(([k, v]) => (form[`vis-${k}`].checked = v));
  $('[data-count]', form).textContent = ad.story.length;
  $('[data-edit-warning]', form).hidden = ad.status !== 'ativo';
  $('[data-cancel-edit]', form).hidden = false;
  $('#tab-novo').textContent = 'Editar pedido';
  window.selectTab('novo');
  form.title.focus();
}

function setupUpload() {
  const dialog = $('#upload');
  const form = $('form', dialog);
  $('[data-close]', dialog).addEventListener('click', () => dialog.close());
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = form.file.files[0];
    if (!file) return toast('Escolha um ficheiro.', { type: 'error' });
    if (file.size > 5 * 1024 * 1024) return toast('O ficheiro tem mais de 5 MB.', { type: 'error' });
    const data = new FormData();
    data.append('description', form.description.value);
    data.append('shareRequested', String(form.shareRequested.checked));
    data.append('file', file);

    await submitting(form.querySelector('[type=submit]'), async () => {
      const send = () => fetch(`/api/conta/anuncios/${dialog.dataset.ad}/provas`, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('amparo.token')}` }, body: data });
      let res = await send();
      if (res.status === 401) {
        await api('/auth/me', { auth: true }).catch(() => {});
        res = await send();
      }
      const out = await res.json().catch(() => ({}));
      if (!res.ok) return toast(out.details?.[0]?.message ?? out.error ?? 'Não foi possível enviar.', { type: 'error' });
      dialog.close();
      toast(out.document.metadataRemoved ? 'Prova guardada. Retirámos os metadados da fotografia.' : 'Prova guardada. Nos PDF os metadados podem não ser retirados.');
      load();
    });
  });
}

/* Mensagens */
function renderConversations() {
  const list = $('[data-convs]');
  const pending = state.conversations.filter((c) => c.role === 'dono' && c.status === 'pendente').length;
  const badge = $('[data-unread]');
  badge.hidden = !pending;
  badge.textContent = pending;

  if (!state.conversations.length) {
    list.innerHTML = '<li class="empty">Ainda não há conversas. Quando alguém pedir informação sobre um pedido seu, aparece aqui.</li>';
    return;
  }
  list.innerHTML = state.conversations
    .map(
      (c) => `<li><button type="button" data-conv="${c.id}"${currentThread === c.id ? ' aria-current="true"' : ''}>
      <span class="status status--${c.status}">${CONV[c.status]}</span>
      <b>${esc(c.ad.title)}</b>
      <small>${c.role === 'dono' ? `Pergunta de ${esc(c.other)}` : `Pergunta sua a ${esc(c.other)}`} · ${dateShort(c.updatedAt)}</small>
    </button></li>`,
    )
    .join('');
  list.querySelectorAll('[data-conv]').forEach((b) => b.addEventListener('click', () => openThread(b.dataset.conv)));
  if (currentThread) openThread(currentThread);
}

function openThread(id) {
  currentThread = id;
  document.querySelectorAll('[data-conv]').forEach((b) => b.toggleAttribute('aria-current', b.dataset.conv === id));
  const c = state.conversations.find((x) => x.id === id);
  if (!c) return;
  const box = $('[data-thread]');
  const ad = state.ads.find((a) => a.id === c.ad.id);
  const closed = ['recusada', 'fechada'].includes(c.status);
  const canWrite = !closed && !(c.status === 'pendente' && c.role === 'doador');

  box.innerHTML = `<header class="thread__head"><div><a href="/pedidos/${esc(c.ad.slug)}">${esc(c.ad.title)}</a><p class="hint">${c.role === 'dono' ? `Conversa com ${esc(c.other)}. Não vê o email dessa pessoa, e ela não vê o seu.` : `Conversa com ${esc(c.other)}, que decide o que partilha.`}</p></div><span class="status status--${c.status}">${CONV[c.status]}</span></header>
  <ol class="msgs">${c.messages.map((m) => `<li class="msg${m.mine ? ' msg--mine' : ''}${m.system ? ' msg--system' : ''}">
    ${m.document ? `<button class="msg__doc" type="button" data-doc="${m.document.id}">📎 Prova partilhada: ${esc(m.document.description)}</button>` : `<p>${esc(m.text)}</p>`}
    ${m.masked ? '<small>Retirámos um contacto desta mensagem.</small>' : ''}<time>${dateTime(m.createdAt)}</time></li>`).join('')}</ol>
  ${c.status === 'pendente' && c.role === 'doador' ? '<p class="notice">À espera de que quem criou o pedido aceite responder.</p>' : ''}
  ${canWrite ? `<form class="reply" novalidate><label class="visually-hidden" for="reply-t">Mensagem</label><textarea id="reply-t" name="text" rows="3" maxlength="1000" placeholder="Escreva uma mensagem. Não partilhe contactos: são retirados." required></textarea><div class="reply__acts"><button class="btn btn--ink btn--sm" type="submit">Enviar</button>
    ${c.role === 'dono' && ad?.documents.length ? `<select name="doc" aria-label="Partilhar uma prova"><option value="">Partilhar uma prova só com esta pessoa…</option>${ad.documents.map((d) => `<option value="${d.id}">${esc(d.description)}</option>`).join('')}</select><button class="btn btn--sm" type="button" data-share>Partilhar</button>` : ''}
    ${c.role === 'dono' && c.status === 'pendente' ? '<button class="btn btn--sm btn--ghost" type="button" data-decline>Recusar</button>' : ''}
    <button class="linkbtn linkbtn--ink" type="button" data-closeconv>Fechar conversa</button></div></form>` : ''}`;

  box.querySelectorAll('[data-doc]').forEach((b) => b.addEventListener('click', () => openDoc(`/conta/conversas/${id}/provas/${b.dataset.doc}`)));
  const form = $('.reply', box);
  if (!form) return;
  const run = async (path, body) => {
    try {
      const res = await api(`/conta/conversas/${id}/${path}`, { method: 'POST', auth: true, body });
      if (res.masked) toast('Retirámos um contacto da mensagem.');
      await load();
    } catch (err) {
      toast(err.details?.[0]?.message ?? err.message, { type: 'error' });
    }
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (form.text.value.trim()) run('mensagens', { text: form.text.value });
  });
  $('[data-share]', form)?.addEventListener('click', () => form.doc.value && run('partilhar', { documentId: form.doc.value }));
  $('[data-decline]', form)?.addEventListener('click', () => {
    if (confirm('Recusar este pedido de informação? Pode juntar uma mensagem simpática na caixa antes de recusar.')) run('recusar', { text: form.text.value || undefined });
  });
  $('[data-closeconv]', form).addEventListener('click', () => confirm('Fechar esta conversa?') && run('fechar'));
}

/* Doações */
function renderDonations() {
  const box = $('[data-donations]');
  if (!state.donations.length) {
    box.innerHTML = '<div class="empty"><p>Ainda não fez nenhuma doação.</p><a class="btn btn--green" href="/pedidos">Ver pedidos</a></div>';
    return;
  }
  const total = state.donations.filter((d) => ['simulado', 'pago'].includes(d.status)).reduce((s, d) => s + (d.chargedCents ?? d.amountCents), 0);
  box.innerHTML = `<p class="hint">Total: ${euros(total)}. As doações marcadas “simulada” são de demonstração: nenhum dinheiro foi movimentado.</p>
  <div class="table-wrap"><table class="data"><thead><tr><th>Data</th><th>Para</th><th>Nome público</th><th>Estado</th><th class="num">Valor</th><th></th></tr></thead><tbody>
  ${state.donations
    .map(
      (d) => `<tr><td>${dateShort(d.createdAt)}</td><td>${d.kind === 'doacao' ? (d.ad ? `<a href="/pedidos/${esc(d.ad.slug)}">${esc(d.ad.title)}</a>` : 'Pedido retirado') : 'Manter a plataforma'}</td><td>${d.showName ? esc(d.publicName) : 'Anónimo'}</td><td><span class="status status--${d.status}">${PAY[d.status] ?? d.status}</span></td><td class="num">${euros(d.chargedCents ?? d.amountCents)}</td><td><a href="/recibo/${d.kind}/${d.id}">Comprovativo</a></td></tr>`,
    )
    .join('')}</tbody></table></div>`;
}

/* Dados */
function setupData() {
  const profile = $('#profile');
  profile.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitting(profile.querySelector('[type=submit]'), async () => {
      try {
        const { user: u } = await api('/auth/me', { method: 'PATCH', auth: true, body: formValues(profile) });
        updateStoredUser(u);
        toast('Dados guardados.');
      } catch (err) {
        showFieldErrors(profile, err.details);
        if (!err.details?.length) toast(err.message, { type: 'error' });
      }
    });
  });

  const pass = $('#password');
  pass.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitting(pass.querySelector('[type=submit]'), async () => {
      try {
        const res = await api('/auth/me/password', { method: 'PATCH', auth: true, body: formValues(pass) });
        pass.reset();
        toast(res.message);
      } catch (err) {
        showFieldErrors(pass, err.details);
        if (!err.details?.length) toast(err.message, { type: 'error' });
      }
    });
  });

  $('[data-export]').addEventListener('click', async () => {
    try {
      const data = await api('/conta/dados', { auth: true });
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: 'os-meus-dados-amparo.json' });
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      toast(err.message, { type: 'error' });
    }
  });

  const del = $('#delete');
  del.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!del.confirm.checked) return toast('Confirme que percebe que não se pode desfazer.', { type: 'error' });
    try {
      const res = await api('/conta/dados/eliminacao', { method: 'POST', auth: true, body: { reason: del.reason.value, confirm: true } });
      toast(res.message);
      load();
    } catch (err) {
      toast(err.message, { type: 'error' });
    }
  });

  $('[data-logout]').addEventListener('click', logout);
}
