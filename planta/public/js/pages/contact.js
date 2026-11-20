import { ApiError, api } from '../api.js';
import { formValues, showFieldErrors, submitting, toast } from '../utils.js';

const form = document.querySelector('[data-request]');
const receipt = form.querySelector('[data-receipt]');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await submitting(form.querySelector('[type="submit"]'), async () => {
    try {
      const values = formValues(form);
      const { request } = await api('/pedidos', { method: 'POST', body: values });
      showFieldErrors(form, []);
      receipt.querySelector('[data-receipt-name]').textContent = request.name.split(' ')[0];
      receipt.querySelector('[data-receipt-number]').textContent = request.number;
      receipt.hidden = false;
      receipt.focus();
    } catch (err) {
      if (err instanceof ApiError) {
        showFieldErrors(form, err.details);
        toast(err.message, { type: 'error' });
      } else toast('Sem ligação. Tente outra vez.', { type: 'error' });
    }
  });
});

receipt.querySelector('[data-receipt-again]').addEventListener('click', () => {
  form.reset();
  receipt.hidden = true;
  form.elements.name.focus();
});
