const VIEW_KEY = 'bairro.vista';

// Explorador de projetos: procurar pelo nome e trocar entre ícones e lista
export function mount(win) {
  const list = win.querySelector('[data-files]');
  const files = [...list.querySelectorAll('.file')];
  const empty = win.querySelector('[data-empty]');
  const count = win.querySelector('[data-count]');
  const buttons = [...win.querySelectorAll('[data-view]')];

  const setView = (view) => {
    list.classList.toggle('is-list', view === 'lista');
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {}
  };

  let saved = null;
  try {
    saved = localStorage.getItem(VIEW_KEY);
  } catch {}
  if (saved) setView(saved);
  buttons.forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));

  win.querySelector('[data-search-input]').addEventListener('input', (event) => {
    const term = event.target.value.trim().toLowerCase();
    let visible = 0;
    for (const file of files) {
      const match = !term || file.dataset.search.includes(term);
      file.hidden = !match;
      if (match) visible += 1;
    }
    empty.hidden = visible > 0;
    count.textContent = `${visible} ${visible === 1 ? 'objeto' : 'objetos'}`;
  });
}
