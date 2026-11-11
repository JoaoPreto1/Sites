import { img } from './utils.js';

// Abre uma lista de fotografias em ecrã inteiro, com setas e teclado
export function createLightbox(dialog, photos, { onChange } = {}) {
  const image = dialog.querySelector('img');
  const counter = dialog.querySelector('[data-lightbox-count]');
  let index = 0;

  function show(i) {
    index = (i + photos.length) % photos.length;
    const photo = photos[index];
    image.src = img(photo.url ?? photo, 1800);
    image.alt = photo.name ?? `Fotografia ${index + 1}`;
    counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}${photo.name ? ` — ${photo.name}` : ''}`;
    onChange?.(photo, index);
  }

  dialog.addEventListener('click', (event) => {
    if (event.target.closest('[data-close]')) dialog.close();
    const step = event.target.closest('[data-step]');
    if (step) show(index + Number(step.dataset.step));
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') show(index + 1);
    if (event.key === 'ArrowLeft') show(index - 1);
  });

  return {
    open(i = 0) {
      show(i);
      dialog.showModal();
    },
    current: () => photos[index],
  };
}
