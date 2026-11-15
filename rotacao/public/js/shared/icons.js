// Ícones usados no servidor e no browser
const svg = (path, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;

export const icons = {
  play: svg('<path d="M7 4.5v15l13-7.5z" fill="currentColor"/>', 'icon-play'),
  pause: svg('<path d="M6 4.5h4.5v15H6zM13.5 4.5H18v15h-4.5z" fill="currentColor"/>', 'icon-pause'),
  prev: svg('<path d="M6 5h2.5v14H6zM20 5v14L9.5 12z" fill="currentColor"/>'),
  next: svg('<path d="M15.5 5H18v14h-2.5zM4 5v14l10.5-7z" fill="currentColor"/>'),
  left: svg('<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'),
  right: svg('<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'),
  volume: svg('<path d="M4 9.5h4L13 5v14l-5-4.5H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
  bag: svg('<path d="M5 8h14l-1.2 12H6.2zM9 8V6.5a3 3 0 0 1 6 0V8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>'),
  close: svg('<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'),
};
