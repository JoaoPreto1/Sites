import { api } from '../api.js';
import { currentUser } from '../session.js';
import { escapeHtml } from '../shared/format.js';
import { formValues, showFieldErrors, submitting, toast } from '../utils.js';

const form = document.querySelector('[data-want]');
const wall = document.querySelector('[data-wall]');
const error = form.querySelector('[data-error]');

if (!currentUser()) form.querySelector('[data-login-hint]').hidden = false;

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  error.hidden = true;
  if (!currentUser()) {
    location.href = '/entrar?next=/procura';
    return;
  }
  const values = formValues(form);
  const button = form.querySelector('[type="submit"]');

  await submitting(button, async () => {
    try {
      const { want } = await api('/procura', { method: 'POST', auth: true, body: { ...values, maxPrice: Number(values.maxPrice) } });
      // O cartão novo cai na parede, à frente de todos
      wall.insertAdjacentHTML(
        'afterbegin',
        `<article class="card-note" style="--r:-2deg"><span class="card-note__head">Procura-se</span><p>${escapeHtml(want.artist)} — ${escapeHtml(want.title)}</p><small>— ${escapeHtml(want.name)} · ${want.minGrade} ou melhor · até ${want.maxPrice}&nbsp;€</small></article>`,
      );
      wall.scrollIntoView({ behavior: 'smooth', block: 'start' });
      form.reset();
      showFieldErrors(form, []);
      toast('Pendurado. Avisamos quando entrar.', { link: { href: '/conta#procura', label: 'Ver na conta' } });
    } catch (err) {
      showFieldErrors(form, err.details);
      if (!err.details?.length) {
        error.textContent = err.message;
        error.hidden = false;
      }
    }
  });
});
