import { api } from '../api.js';
import { currentUser } from '../session.js';
import { escapeHtml, params, showFieldErrors } from '../utils.js';

const form = document.querySelector('[data-quote]');
const error = form.querySelector('[data-error]');
const sent = document.querySelector('[data-sent]');
const preselected = params().servico;

const option = (type, name, value, checked) => `
  <label class="option">
    <input type="${type}" name="${name}" value="${escapeHtml(value)}" ${checked ? 'checked' : ''}>
    <span>${escapeHtml(value)}</span>
  </label>`;

function fillForm({ services, budgets }) {
  form.querySelector('[data-services]').innerHTML = services.map((s) => option('checkbox', 'services', s, s === preselected)).join('');
  form.querySelector('[data-budgets]').innerHTML = budgets.map((b) => option('radio', 'budget', b, false)).join('');
  form.date.min = new Date().toISOString().slice(0, 10);

  const user = currentUser();
  if (user) {
    form.name.value = user.name;
    form.email.value = user.email;
    form.company.value = user.company ?? '';
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('[type="submit"]');
  const data = new FormData(form);

  const body = {
    name: data.get('name'),
    email: data.get('email'),
    company: data.get('company') || undefined,
    services: data.getAll('services'),
    budget: data.get('budget') ?? '',
    date: data.get('date') || undefined,
    message: data.get('message'),
  };

  error.hidden = true;
  showFieldErrors(form);
  button.disabled = true;

  try {
    const { message } = await api('/quotes', { method: 'POST', body });
    sent.querySelector('[data-sent-text]').textContent = message;
    form.hidden = true;
    sent.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    showFieldErrors(form, err.details);
    error.textContent = err.details?.length ? 'Faltam alguns campos — estão assinalados a vermelho.' : err.message;
    error.hidden = false;
    button.disabled = false;
  }
});

try {
  fillForm(await api('/quotes/options'));
} catch {
  error.textContent = 'Não foi possível carregar o formulário. Envie-nos um email para ola@lente.studio.';
  error.hidden = false;
}
