import { api } from '../api.js';
import { formValues, showFieldErrors, submitting, toast } from '../utils.js';
import { escapeHtml } from '../shared/format.js';

// Bloco de notas da página inicial: um pedido de orçamento curto, sem escolher serviços
export function mount(win) {
  const form = win.querySelector('form');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('[type="submit"]');
    await submitting(button, async () => {
      try {
        const { request } = await api('/pedidos', { method: 'POST', body: { ...formValues(form), services: [], extras: [] }, auth: true });
        form.outerHTML = `<div class="note-done lined" role="status"><b>Guardado.</b><br>Pedido n.º ${request.number} enviado, ${escapeHtml(
          request.name.split(' ')[0],
        )}.<br>Respondemos até amanhã ao fim do dia.<br><a class="link" href="/entrar">Criar conta para acompanhar</a></div>`;
      } catch (error) {
        if (error.details?.length) showFieldErrors(form, error.details);
        else toast(error.message, { type: 'error' });
      }
    });
  });
}
