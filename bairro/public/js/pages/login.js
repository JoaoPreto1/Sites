import { login, register } from '../session.js';
import { formValues, params, showFieldErrors, submitting, toast } from '../utils.js';

const destination = (user) => {
  const next = params().next;
  if (next?.startsWith('/') && !next.startsWith('//')) return next;
  return user.role === 'admin' ? '/painel' : '/conta';
};

export function mount(win) {
  const tabs = [...win.querySelectorAll('[data-tab]')];
  const panels = [...win.querySelectorAll('[data-panel]')];

  tabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
      panels.forEach((p) => (p.hidden = p.dataset.panel !== tab.dataset.tab));
      win.querySelector(`[data-panel="${tab.dataset.tab}"] input`)?.focus();
    }),
  );

  const handle = (form, action) =>
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      await submitting(form.querySelector('[type="submit"]'), async () => {
        try {
          const user = await action(formValues(form));
          // Recarrega a página para a barra de menus e as janelas saberem quem entrou
          window.location.href = destination(user);
        } catch (error) {
          if (error.details?.length) showFieldErrors(form, error.details);
          else toast(error.message, { type: 'error' });
        }
      });
    });

  handle(win.querySelector('[data-panel="entrar"]'), login);
  handle(win.querySelector('[data-panel="registar"]'), register);
}
