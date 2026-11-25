import { api } from '../api.js';
import { clearErrors, showErrors } from '../forms.js';

const form = document.getElementById('briefing');
const done = document.getElementById('brief-done');
const errorBox = document.getElementById('brief-error');
const startedAt = Date.now();

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors(form, errorBox);
  const data = new FormData(form);
  const services = data.getAll('services');
  const unsure = data.get('unsure');
  const body = {
    name: data.get('name'),
    email: data.get('email'),
    company: data.get('company'),
    services,
    unsure: !!unsure,
    budget: data.get('budget'),
    deadline: data.get('deadline'),
    message: data.get('message'),
    consent: data.get('consent') === 'true' ? 'true' : 'false',
    website: data.get('website'),
    startedAt,
  };
  const button = form.querySelector('[type=submit]');
  button.disabled = true;
  button.textContent = 'A atirar…';
  try {
    const { ref } = await api('/briefing', { method: 'POST', body });
    form.hidden = true;
    document.getElementById('brief-ref').textContent = ref;
    done.hidden = false;
    done.focus();
  } catch (err) {
    showErrors(form, errorBox, err);
  } finally {
    button.disabled = false;
    button.textContent = 'Atirar o problema';
  }
});
