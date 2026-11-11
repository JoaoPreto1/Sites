import { currentUser, isOwner, login, register } from '../session.js';
import { params, showFieldErrors } from '../utils.js';

const forms = {
  login: document.querySelector('[data-form="login"]'),
  register: document.querySelector('[data-form="register"]'),
};
const tabs = document.querySelectorAll('[data-tab]');

// Só aceita caminhos do próprio site para evitar redirecionamentos para fora
function destination(user) {
  const { next } = params();
  if (next && next.startsWith('/') && !next.startsWith('//')) return next;
  return isOwner(user) ? '/painel' : '/conta';
}

function showTab(name) {
  tabs.forEach((tab) => {
    const active = tab.dataset.tab === name;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', active);
  });
  Object.entries(forms).forEach(([key, form]) => (form.hidden = key !== name));
}

async function handleSubmit(form, action) {
  const error = form.querySelector('[data-error]');
  const button = form.querySelector('[type="submit"]');
  const data = Object.fromEntries(new FormData(form));
  if (!data.phone) delete data.phone;

  error.hidden = true;
  showFieldErrors(form);
  button.disabled = true;

  try {
    const user = await action(data);
    window.location.href = destination(user);
  } catch (err) {
    showFieldErrors(form, err.details);
    if (!err.details?.length) {
      error.textContent = err.message;
      error.hidden = false;
    }
    button.disabled = false;
  }
}

tabs.forEach((tab) => tab.addEventListener('click', () => showTab(tab.dataset.tab)));

forms.login.addEventListener('submit', (event) => {
  event.preventDefault();
  handleSubmit(forms.login, login);
});

forms.register.addEventListener('submit', (event) => {
  event.preventDefault();
  handleSubmit(forms.register, register);
});

document.querySelectorAll('[data-demo]').forEach((button) =>
  button.addEventListener('click', () => {
    showTab('login');
    forms.login.email.value = button.dataset.demo;
    forms.login.password.value = 'mare1234';
    forms.login.password.focus();
  }),
);

if (params().tab === 'registo') showTab('register');

const user = currentUser();
if (user) window.location.replace(destination(user));
