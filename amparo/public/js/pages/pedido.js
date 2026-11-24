import { api } from '../api.js';
import { currentUser } from '../session.js';
import { showFieldErrors, submitting, toast } from '../utils.js';

// Valores rápidos: preenchem o campo do valor
document.querySelectorAll('.preset').forEach((b) =>
  b.addEventListener('click', () => {
    const input = document.getElementById('valor');
    input.value = (Number(b.dataset.cents) / 100).toFixed(2).replace('.', ',').replace(',00', '');
    document.querySelectorAll('.preset').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    input.focus();
  }),
);

const opened = new Date();

document.querySelectorAll('[data-open]').forEach((b) =>
  b.addEventListener('click', () => {
    const dialog = document.getElementById(b.dataset.open);
    if (dialog.id === 'ask' && !currentUser()) {
      dialog.querySelector('.ask-login').hidden = false;
      dialog.querySelector('textarea').disabled = true;
      dialog.querySelector('[type=submit]').hidden = true;
    }
    dialog.showModal();
  }),
);
document.querySelectorAll('dialog [data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));

const askForm = document.querySelector('[data-ask]');
askForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const button = askForm.querySelector('[type=submit]');
  await submitting(button, async () => {
    try {
      const res = await api(`/anuncios/${askForm.dataset.ask}/pedidos-info`, { method: 'POST', auth: true, body: { question: askForm.question.value } });
      askForm.closest('dialog').close();
      askForm.reset();
      toast(res.masked ? 'Pergunta enviada. Retirámos um contacto que estava no texto.' : 'Pergunta enviada. A resposta aparece na sua conta.', { link: { href: '/conta#mensagens', label: 'Ver mensagens' } });
    } catch (err) {
      if (err.status === 401) return (window.location.href = `/entrar?next=${encodeURIComponent(location.pathname)}`);
      showFieldErrors(askForm, err.details);
      if (!err.details?.length) toast(err.message, { type: 'error' });
    }
  });
});

const reportForm = document.querySelector('[data-report]');
reportForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const button = reportForm.querySelector('[type=submit]');
  await submitting(button, async () => {
    try {
      const res = await api(`/anuncios/${reportForm.dataset.report}/denuncias`, {
        method: 'POST',
        auth: Boolean(currentUser()),
        body: { reason: reportForm.reason.value, details: reportForm.details.value, startedAt: opened.getTime() },
      });
      reportForm.closest('dialog').close();
      reportForm.reset();
      toast(res.message);
    } catch (err) {
      toast(err.message, { type: 'error' });
    }
  });
});
