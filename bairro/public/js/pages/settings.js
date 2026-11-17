const DESK_KEY = 'bairro.desk';
const DEFAULT = { color: '#3b6e8f', pattern: 'pontos' };

function read() {
  try {
    return { ...DEFAULT, ...JSON.parse(localStorage.getItem(DESK_KEY)) };
  } catch {
    return { ...DEFAULT };
  }
}

function apply({ color, pattern }) {
  document.body.style.setProperty('--desk', color);
  document.body.dataset.pattern = pattern;
  try {
    localStorage.setItem(DESK_KEY, JSON.stringify({ color, pattern }));
  } catch {}
}

export function mount(win) {
  const form = win.querySelector('[data-settings]');
  const current = read();
  form.elements.color.value = current.color;
  form.elements.pattern.value = current.pattern;

  form.addEventListener('change', () => apply({ color: form.elements.color.value, pattern: form.elements.pattern.value }));

  win.querySelector('[data-reset]').addEventListener('click', () => {
    form.elements.color.value = DEFAULT.color;
    form.elements.pattern.value = DEFAULT.pattern;
    apply(DEFAULT);
  });
}
