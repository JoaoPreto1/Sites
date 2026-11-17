import { estimate } from '../shared/estimate.js';
import { euros, weeksLabel } from '../shared/format.js';

const checked = (form, name) => [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);

// Folha de preços: a conta é feita aqui com a mesma tabela que o servidor usa
export function mount(win) {
  const form = win.querySelector('[data-sheet-form]');
  const total = win.querySelector('[data-total]');
  const weeks = win.querySelector('[data-weeks]');
  const discount = win.querySelector('[data-discount]');
  const formula = win.querySelector('[data-formula]');
  const link = win.querySelector('[data-to-quote]');

  const update = () => {
    const services = checked(form, 'services');
    const extras = checked(form, 'extras');
    const result = estimate(services, extras);

    if (!services.length) {
      total.textContent = '—';
      weeks.textContent = '—';
      discount.textContent = 'Escolha pelo menos um serviço';
      formula.textContent = '=SOMA(C2:D8)';
      link.href = '/orcamento';
      return;
    }

    total.textContent = `${euros(result.min)} a ${euros(result.max)}`;
    weeks.textContent = weeksLabel(result.weeks);
    discount.textContent = result.discount ? 'Com 10% de desconto por juntar serviços' : 'Sem IVA';
    formula.textContent = `=ESTIMATIVA(${[...services, ...extras].join('; ')})`;
    const params = new URLSearchParams({ servicos: services.join(',') });
    if (extras.length) params.set('extras', extras.join(','));
    link.href = `/orcamento?${params}`;
  };

  form.addEventListener('change', update);
  update();

  const tabs = [...win.querySelectorAll('[data-tab]')];
  tabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
      win.querySelectorAll('[data-sheet]').forEach((panel) => (panel.hidden = panel.dataset.sheet !== tab.dataset.tab));
    }),
  );
}
