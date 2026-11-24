import { login, register, safeNext } from '../session.js';
import { formValues, showFieldErrors, submitting, toast } from '../utils.js';

const startedAt = Date.now();
const next = safeNext();

// Os links entre entrar e registar mantêm o destino
document.querySelectorAll('[data-keep-next]').forEach((a) => {
  if (next !== '/conta') a.href += `?next=${encodeURIComponent(next)}`;
});

async function handle(form, action) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitting(form.querySelector('[type=submit]'), async () => {
      try {
        await action(form);
        window.location.href = next;
      } catch (err) {
        showFieldErrors(form, err.details);
        if (!err.details?.length) toast(err.message, { type: 'error' });
      }
    });
  });
}

const loginForm = document.getElementById('login');
if (loginForm) handle(loginForm, (f) => login(formValues(f)));

const registerForm = document.getElementById('register');
if (registerForm) {
  handle(registerForm, (f) => {
    const data = formValues(f);
    return register({ ...data, accept: f.accept.checked, startedAt });
  });
}
