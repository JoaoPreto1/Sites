import { api, saveSession } from '../api.js';
import { clearErrors, showErrors } from '../forms.js';
import { safeNext } from '../session.js';

const form = document.getElementById('registo');
const box = document.getElementById('registo-erro');
const startedAt = Date.now();

const next = new URLSearchParams(window.location.search).get('next');
if (next) document.querySelectorAll('[data-manter-next]').forEach((a) => (a.href += `?next=${encodeURIComponent(next)}`));

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors(form, box);
  const button = form.querySelector('[type=submit]');
  button.disabled = true;
  try {
    const session = await api('/auth/registar', {
      method: 'POST',
      body: { name: form.name.value, email: form.email.value, phone: form.phone.value, password: form.password.value, website: form.website.value, startedAt },
    });
    saveSession(session);
    window.location.href = safeNext('/hospede');
  } catch (err) {
    showErrors(form, box, err);
    button.disabled = false;
  }
});
