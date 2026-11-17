import { api, storedUser } from '../api.js';
import { estimate } from '../shared/estimate.js';
import { escapeHtml, euros, weeksLabel } from '../shared/format.js';
import { formValues, showFieldErrors, submitting, toast } from '../utils.js';

const checked = (form, name) => [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);

export function mount(win) {
  const form = win.querySelector('[data-quote-form]');
  const screen = win.querySelector('[data-estimate]');
  const note = win.querySelector('[data-estimate-note]');

  // Quem tem sessão não precisa de escrever outra vez o nome e o email
  const user = storedUser();
  if (user) {
    form.elements.name.value ||= user.name;
    form.elements.email.value ||= user.email;
    form.elements.company.value ||= user.company ?? '';
  }

  const update = () => {
    const result = estimate(checked(form, 'services'), checked(form, 'extras'));
    if (!result.items.length) {
      screen.textContent = '0 €';
      note.textContent = 'Marque os serviços para ver uma estimativa.';
      return;
    }
    screen.textContent = `${euros(result.min)}–${euros(result.max)}`;
    note.textContent = `${weeksLabel(result.weeks)} de trabalho${result.discount ? ', já com 10% de desconto' : ''}. Valores sem IVA.`;
  };
  form.addEventListener('change', update);
  update();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('[type="submit"]');
    const values = formValues(form);
    const body = {
      ...values,
      services: checked(form, 'services'),
      extras: checked(form, 'extras'),
      deadline: values.deadline || undefined,
    };

    await submitting(button, async () => {
      try {
        const { request } = await api('/pedidos', { method: 'POST', body, auth: true });
        const first = escapeHtml(request.name.split(' ')[0]);
        const next = user
          ? '<a class="btn" href="/conta">Ver na minha conta</a>'
          : `<a class="btn" href="/entrar?registar=1&amp;email=${encodeURIComponent(request.email)}">Criar conta para acompanhar</a>`;
        form.outerHTML = `<div class="quote-done" role="status">
          <h2>Pedido n.º ${request.number} recebido</h2>
          <p>Obrigado, ${first}. Lemos tudo e respondemos para <b>${escapeHtml(request.email)}</b> em menos de dois dias úteis.</p>
          ${request.services.length ? `<p>Pelo que escolheu, a estimativa anda entre ${euros(request.estimate.min)} e ${euros(request.estimate.max)} (sem IVA).</p>` : ''}
          <p>Se criar conta com o mesmo email, o pedido aparece lá e, quando o projeto começar, é lá que aprova as provas.</p>
          ${next}
        </div>`;
        win.querySelector('.quote-done h2')?.focus?.();
      } catch (error) {
        if (error.details?.length) showFieldErrors(form, error.details);
        else toast(error.message, { type: 'error' });
      }
    });
  });
}
