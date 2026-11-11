import { currentUser, isAdmin, login } from '../session.js';
import { params, showFieldErrors } from '../utils.js';

const form = document.querySelector('[data-login]');
const error = form.querySelector('[data-error]');

// Só aceita caminhos do próprio site para evitar redirecionamentos para fora
function destination(user) {
  const { next } = params();
  if (next && next.startsWith('/') && !next.startsWith('//')) return next;
  return isAdmin(user) ? '/painel' : '/galerias';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('[type="submit"]');
  error.hidden = true;
  showFieldErrors(form);
  button.disabled = true;

  try {
    const user = await login({ email: form.email.value, password: form.password.value });
    window.location.href = destination(user);
  } catch (err) {
    showFieldErrors(form, err.details);
    if (!err.details?.length) {
      error.textContent = err.message;
      error.hidden = false;
    }
    button.disabled = false;
  }
});

form.querySelectorAll('[data-demo]').forEach((button) =>
  button.addEventListener('click', () => {
    form.email.value = button.dataset.demo;
    form.password.value = 'lente1234';
    form.password.focus();
  }),
);

const user = currentUser();
if (user) window.location.replace(destination(user));
