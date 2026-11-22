import { api } from '../api.js';
import { showFieldErrors, submitting, toast } from '../utils.js';

// Formulários públicos que falam com a API: contacto, investir, ocorrências e newsletter
for (const form of document.querySelectorAll('form[data-api]')) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form));
    if (data.extra) {
      data.text = `${data.text}\n\n${data.extra}`;
      delete data.extra;
    }

    await submitting(form.querySelector('[type="submit"]'), async () => {
      try {
        const result = await api(form.dataset.api, { method: 'POST', body: data, auth: true });
        showFieldErrors(form, []);
        form.reset();
        const ok = form.querySelector('.ok');
        if (result?.issue) ok.textContent = `Ocorrência ${result.issue.number} registada. Guarde este número para acompanhar o pedido.`;
        ok.style.display = 'block';
        ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (err) {
        showFieldErrors(form, err.details);
        toast(err.message, { type: 'error' });
      }
    });
  });
}
