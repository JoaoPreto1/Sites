import { api } from '../api.js';
import { escapeHtml, img, money } from '../utils.js';

const grid = document.querySelector('[data-experiences]');
const filters = document.querySelector('[data-filters]');
let experiences = [];

function render(category = '') {
  const list = experiences.filter((e) => !category || e.category === category);
  grid.innerHTML = list
    .map(
      (e) => `
      <article class="exp-card">
        <div class="exp-card__media">
          <img src="${img(e.image, 800, 600)}" alt="${escapeHtml(e.name)}" loading="lazy">
          <span class="tag">${escapeHtml(e.category)}</span>
        </div>
        <div class="exp-card__body">
          <h3>${escapeHtml(e.name)}</h3>
          <p>${escapeHtml(e.summary)}</p>
          <div class="exp-card__footer"><span>${e.duration}</span><span><strong>${money(e.price)}</strong> / pessoa</span></div>
        </div>
      </article>`,
    )
    .join('');
}

filters.addEventListener('click', (event) => {
  const chip = event.target.closest('[data-category]');
  if (!chip) return;
  filters.querySelectorAll('.chip').forEach((el) => el.classList.toggle('is-active', el === chip));
  render(chip.dataset.category);
});

try {
  ({ experiences } = await api('/experiences'));
  render();
} catch {
  grid.innerHTML = '<p class="empty">Não foi possível carregar as experiências.</p>';
}
