// Mostra os erros da API junto de cada campo e um resumo no topo do formulário
export function clearErrors(form, box) {
  if (box) {
    box.hidden = true;
    box.textContent = '';
  }
  form.querySelectorAll('[data-error]').forEach((el) => (el.textContent = ''));
  form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
}

export function showErrors(form, box, err) {
  const details = err.details ?? [];
  let first = null;
  for (const { field, message } of details) {
    const key = field.replace(/\[\d+\]$/, '');
    const slot = form.querySelector(`[data-error="${key}"]`);
    if (slot && !slot.textContent) slot.textContent = message;
    const input = form.querySelector(`[name="${key}"]`);
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      first ??= input;
    }
  }
  if (box) {
    box.textContent = details.length ? `${err.message}: ${details.map((d) => d.message).join('; ')}.` : err.message;
    box.hidden = false;
  }
  (first ?? box)?.focus?.();
}
