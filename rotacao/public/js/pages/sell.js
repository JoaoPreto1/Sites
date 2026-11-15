import { api } from '../api.js';
import { currentUser } from '../session.js';
import { formValues, showFieldErrors, submitting } from '../utils.js';

const form = document.querySelector('[data-sell]');
const error = form.querySelector('[data-error]');
const done = form.querySelector('[data-done]');

// Quem tem sessão já tem o nome e o email preenchidos
const user = currentUser();
if (user) {
  form.name.value = user.name;
  form.email.value = user.email;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  error.hidden = true;
  const values = Object.fromEntries(Object.entries(formValues(form)).filter(([, v]) => v !== ''));

  await submitting(form.querySelector('[type="submit"]'), async () => {
    try {
      const { message } = await api('/compramos', { method: 'POST', body: values });
      showFieldErrors(form, []);
      done.textContent = message;
      done.hidden = false;
      form.querySelectorAll('input:not([type="radio"]), textarea').forEach((el) => (el.value = ''));
    } catch (err) {
      showFieldErrors(form, err.details);
      if (!err.details?.length) {
        error.textContent = err.message;
        error.hidden = false;
      }
    }
  });
});
