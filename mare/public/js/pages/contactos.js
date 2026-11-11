import { api } from '../api.js';
import { icon } from '../icons.js';
import { currentUser } from '../session.js';
import { showFieldErrors } from '../utils.js';

const form = document.querySelector('[data-contact]');
const error = form.querySelector('[data-error]');
const sent = document.querySelector('[data-sent]');

document.querySelectorAll('[data-icon]').forEach((el) => el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon, 24)));

const user = currentUser();
if (user) {
  form.name.value = user.name;
  form.email.value = user.email;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('[type="submit"]');
  error.hidden = true;
  showFieldErrors(form);
  button.disabled = true;

  try {
    const { message } = await api('/contact', { method: 'POST', body: Object.fromEntries(new FormData(form)) });
    sent.querySelector('[data-sent-text]').textContent = message;
    form.hidden = true;
    sent.hidden = false;
  } catch (err) {
    showFieldErrors(form, err.details);
    if (!err.details?.length) {
      error.textContent = err.message;
      error.hidden = false;
    }
    button.disabled = false;
  }
});
