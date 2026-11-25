import { clearErrors, showErrors } from '../forms.js';
import { currentUser, homeFor, login, safeNext } from '../session.js';

const form = document.getElementById('login');
const box = document.getElementById('login-erro');

// Quem já tem sessão vai direto para a sua área
const existing = currentUser();
if (existing) window.location.replace(safeNext(homeFor(existing)));

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors(form, box);
  const button = form.querySelector('[type=submit]');
  button.disabled = true;
  try {
    const user = await login({ email: form.email.value, password: form.password.value });
    window.location.href = safeNext(homeFor(user));
  } catch (err) {
    showErrors(form, box, err);
    button.disabled = false;
  }
});

// O "Criar conta" leva o mesmo destino (por exemplo, voltar à reserva)
const next = new URLSearchParams(window.location.search).get('next');
if (next) document.querySelectorAll('[data-manter-next]').forEach((a) => (a.href += `?next=${encodeURIComponent(next)}`));
