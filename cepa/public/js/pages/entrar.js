import { isAdmin, login, register } from '../session.js';
import { formValues, params, showFieldErrors, submitting } from '../utils.js';

// Só aceita caminhos internos para o regresso depois de entrar
function destination(user) {
  const next = params().next;
  if (next?.startsWith('/') && !next.startsWith('//')) return next;
  return isAdmin(user) ? '/painel' : '/conta';
}

function setup(form, action) {
  const errorBox = form.querySelector('[data-error]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.hidden = true;
    showFieldErrors(form);

    const values = formValues(form);
    if (!values.phone) delete values.phone;

    await submitting(form.querySelector('[type="submit"]'), async () => {
      try {
        const user = await action(values);
        window.location.href = destination(user);
      } catch (error) {
        showFieldErrors(form, error.details);
        if (!error.details?.length) {
          errorBox.textContent = error.message;
          errorBox.hidden = false;
        }
      }
    });
  });
}

const loginForm = document.querySelector('[data-login]');
setup(loginForm, login);
setup(document.querySelector('[data-register]'), register);

for (const button of document.querySelectorAll('[data-demo]')) {
  button.addEventListener('click', () => {
    loginForm.email.value = button.dataset.demo;
    loginForm.password.value = 'cepa1234';
    loginForm.requestSubmit();
  });
}
