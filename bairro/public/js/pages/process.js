// Assistente "Seguinte ›": mostra um passo de cada vez (sem JavaScript aparecem todos)
export function mount(win) {
  const wizard = win.querySelector('[data-wizard]');
  const steps = [...wizard.querySelectorAll('[data-step]')];
  const dots = [...wizard.querySelectorAll('[data-dot]')];
  const prev = wizard.querySelector('[data-prev]');
  const next = wizard.querySelector('[data-next]');
  const finish = wizard.querySelector('[data-finish]');
  const progress = wizard.querySelector('[data-progress]');
  let current = 0;

  const show = (index) => {
    current = Math.max(0, Math.min(steps.length - 1, index));
    steps.forEach((s, i) => s.classList.toggle('is-current', i === current));
    dots.forEach((d, i) => {
      d.classList.toggle('is-current', i === current);
      d.classList.toggle('is-done', i < current);
    });
    prev.disabled = current === 0;
    const last = current === steps.length - 1;
    next.hidden = last;
    finish.hidden = !last;
    progress.style.setProperty('--value', `${((current + 1) / steps.length) * 100}%`);
  };

  wizard.classList.add('is-ready');
  prev.addEventListener('click', () => {
    show(current - 1);
    (prev.disabled ? next : prev).focus();
  });
  next.addEventListener('click', () => {
    show(current + 1);
    (next.hidden ? finish : next).focus();
  });
  show(0);
}
