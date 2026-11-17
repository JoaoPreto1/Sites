const EXCUSES = [
  'O Hugo ainda gosta do logótipo em Comic Sans.',
  'A Marta diz que a embalagem que não fecha "tem potencial".',
  'O Pixel está a dormir em cima do caixote.',
  'A Leonor quer guardar a paleta de 17 cores para o Carnaval.',
];

// Brincadeira do lixo: restaurar risca a linha e esvaziar nunca funciona
export function mount(win) {
  win.querySelectorAll('[data-restore]').forEach((button) =>
    button.addEventListener('click', () => {
      const row = button.closest('tr');
      row.classList.add('is-restored');
      button.textContent = 'Arrependido';
      button.disabled = true;
    }),
  );

  const dialog = win.querySelector('[data-trash-dialog]');
  const text = win.querySelector('[data-trash-text]');
  let tries = 0;

  win.querySelector('[data-empty-trash]').addEventListener('click', () => {
    text.textContent = EXCUSES[tries % EXCUSES.length];
    tries += 1;
    dialog.hidden = false;
    win.querySelector('[data-trash-ok]').focus();
  });

  win.querySelector('[data-trash-ok]').addEventListener('click', () => {
    dialog.hidden = true;
    win.querySelector('[data-empty-trash]').focus();
  });
}
