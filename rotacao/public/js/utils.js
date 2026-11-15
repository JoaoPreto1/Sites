// Dados que o servidor deixa na página para evitar um pedido à API
export function initialData() {
  try {
    return JSON.parse(document.getElementById('initial-data')?.textContent ?? 'null');
  } catch {
    return null;
  }
}

export const params = () => Object.fromEntries(new URLSearchParams(window.location.search));

export function toast(message, { type = 'info', link } = {}) {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    stack.setAttribute('role', 'status');
    document.body.append(stack);
  }

  const item = document.createElement('div');
  item.className = `toast${type === 'error' ? ' toast--error' : ''}`;
  item.textContent = message;
  if (link) {
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.label;
    item.append(a);
  }
  stack.append(item);
  setTimeout(() => item.remove(), 4500);
}

export function showFieldErrors(form, details = []) {
  form.querySelectorAll('.field-error').forEach((el) => el.remove());
  form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));

  for (const { field, message } of details) {
    const input = form.elements[field] ?? form.elements[field.split('.').pop()];
    const target = input?.closest ? input : input?.[0];
    if (!target || target.closest('.field')?.querySelector('.field-error')) continue;
    target.setAttribute('aria-invalid', 'true');
    const error = document.createElement('span');
    error.className = 'field-error';
    error.textContent = message;
    target.closest('.field, .check')?.append(error);
  }
  form.querySelector('[aria-invalid]')?.focus();
}

export const formValues = (form) => Object.fromEntries(new FormData(form));

export async function submitting(button, task) {
  button.disabled = true;
  try {
    return await task();
  } finally {
    button.disabled = false;
  }
}
