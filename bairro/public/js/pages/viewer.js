import { photoSrcset, photoUrl } from '../shared/format.js';

// Visualizador de imagens: as miniaturas trocam a fotografia grande; setas do teclado também
export function mount(win) {
  const img = win.querySelector('.viewer__img');
  const thumbs = [...win.querySelectorAll('.thumb')];
  const caption = win.querySelector('[data-caption]');
  const counter = win.querySelector('[data-counter]');
  if (!img || !thumbs.length) return;

  const ratio = Number(img.getAttribute('height')) / Number(img.getAttribute('width'));
  const widths = img.srcset.split(',').map((part) => Number(part.trim().split(' ')[1].replace('w', '')));

  const show = (index) => {
    const thumb = thumbs[(index + thumbs.length) % thumbs.length];
    const { photo, alt } = thumb.dataset;
    img.src = photoUrl(photo, widths[1] ?? widths[0], ratio);
    img.srcset = photoSrcset(photo, widths, ratio);
    img.alt = alt;
    thumbs.forEach((t) => t.setAttribute('aria-pressed', String(t === thumb)));
    if (caption) caption.textContent = thumb.dataset.caption ?? '';
    if (counter) counter.textContent = `${thumbs.indexOf(thumb) + 1} de ${thumbs.length}`;
  };

  thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => show(i)));

  win.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || event.target.closest('input, textarea, select')) return;
    const current = thumbs.findIndex((t) => t.getAttribute('aria-pressed') === 'true');
    show(current + (event.key === 'ArrowRight' ? 1 : -1));
    thumbs.find((t) => t.getAttribute('aria-pressed') === 'true')?.focus();
  });

  win.querySelector('[data-prev]')?.addEventListener('click', () => show(thumbs.findIndex((t) => t.getAttribute('aria-pressed') === 'true') - 1));
  win.querySelector('[data-next]')?.addEventListener('click', () => show(thumbs.findIndex((t) => t.getAttribute('aria-pressed') === 'true') + 1));
}
