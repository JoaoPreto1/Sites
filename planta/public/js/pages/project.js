// Pinos na planta: cada número mostra a nota e a fotografia desse sítio
const reading = document.querySelector('[data-reading]');
if (reading) {
  const pins = [...reading.querySelectorAll('[data-pin]')];
  const notes = [...reading.querySelectorAll('[data-note]')];
  const figure = reading.querySelector('[data-pin-photo]');
  const img = figure?.querySelector('img');
  const photos = JSON.parse(document.getElementById('pin-photos')?.textContent ?? '[]');

  const select = (index) => {
    pins.forEach((pin, i) => {
      pin.classList.toggle('is-on', i === index);
      pin.setAttribute('aria-pressed', String(i === index));
    });
    notes.forEach((note, i) => note.classList.toggle('is-on', i === index));
    const next = photos[index];
    if (!img || !next || img.getAttribute('src') === next.src) return;
    figure.classList.add('is-changing');
    setTimeout(() => {
      img.removeAttribute('srcset');
      img.src = next.src;
      img.alt = next.alt;
      img.onload = () => figure.classList.remove('is-changing');
    }, 150);
  };

  pins.forEach((pin, i) => pin.addEventListener('click', () => select(i)));
  notes.forEach((note, i) => {
    note.addEventListener('pointerenter', () => select(i));
  });
}

// Galeria: clicar amplia a fotografia
const lightbox = document.querySelector('[data-lightbox]');
const big = lightbox?.querySelector('img');
document.querySelectorAll('[data-full]').forEach((item) =>
  item.addEventListener('click', () => {
    big.src = item.dataset.full;
    big.alt = item.dataset.alt;
    lightbox.showModal();
  }),
);
lightbox?.querySelector('.lightbox__close').addEventListener('click', () => lightbox.close());
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});

// N e P passam para o projeto seguinte ou anterior
document.addEventListener('keydown', (event) => {
  if (event.target.closest?.('input, textarea, select') || event.metaKey || event.ctrlKey || event.altKey || lightbox?.open) return;
  const key = event.key.toLowerCase();
  const link = key === 'n' ? document.querySelector('a[rel="next"]') : key === 'p' ? document.querySelector('a[rel="prev"]') : null;
  if (link) window.location.href = link.href;
});
