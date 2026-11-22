import { ApiError } from '../api.js';
import { currentUser, homeFor, login, register } from '../session.js';
import { formValues, params, showFieldErrors, submitting, toast } from '../utils.js';

const card = document.querySelector('[data-access]');
const tabs = [...card.querySelectorAll('[data-tab]')];
const next = params().next;

const go = (user) => {
  const safe = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
  window.location.href = safe ?? homeFor(user);
};

const existing = currentUser();
if (existing) go(existing);

function select(name) {
  tabs.forEach((tab) => {
    const on = tab.dataset.tab === name;
    tab.setAttribute('aria-selected', String(on));
    tab.tabIndex = on ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !on;
  });
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => select(tab.dataset.tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    const other = tabs.find((t) => t !== tab);
    select(other.dataset.tab);
    other.focus();
  });
});

if (params().modo === 'criar') select('register');

card.querySelectorAll('form').forEach((form) =>
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await submitting(form.querySelector('[type="submit"]'), async () => {
      try {
        const user = form.dataset.form === 'login' ? await login(formValues(form)) : await register(formValues(form));
        go(user);
      } catch (err) {
        if (err instanceof ApiError) {
          showFieldErrors(form, err.details);
          toast(err.message, { type: 'error' });
        } else toast('Sem ligação. Tente outra vez.', { type: 'error' });
      }
    });
  }),
);
