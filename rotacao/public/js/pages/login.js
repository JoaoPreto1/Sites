import { currentUser, isStaff, login, register } from '../session.js';
import { formValues, params, showFieldErrors, submitting } from '../utils.js';

// Só deixa voltar para páginas deste site
const next = () => {
  const target = params().next;
  return target && target.startsWith('/') && !target.startsWith('//') ? target : null;
};

const go = (user) => location.replace(next() ?? (isStaff(user) ? '/painel' : '/conta'));

if (currentUser()) go(currentUser());

function bind(form, action) {
  const error = form.querySelector('[data-error]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.hidden = true;
    const values = Object.fromEntries(Object.entries(formValues(form)).filter(([, v]) => v !== ''));
    await submitting(form.querySelector('[type="submit"]'), async () => {
      try {
        go(await action(values));
      } catch (err) {
        showFieldErrors(form, err.details);
        if (!err.details?.length) {
          error.textContent = err.message;
          error.hidden = false;
        }
      }
    });
  });
}

const loginForm = document.querySelector('[data-login]');
bind(loginForm, login);
bind(document.querySelector('[data-register]'), register);

for (const button of document.querySelectorAll('[data-demo]')) {
  button.addEventListener('click', () => {
    loginForm.email.value = button.dataset.demo;
    loginForm.password.value = 'rotacao1';
    loginForm.requestSubmit();
  });
}
