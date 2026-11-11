import { api } from '../api.js';
import { linkDateInputs } from '../date-range.js';
import { icon } from '../icons.js';
import { escapeHtml, img, money, propertyCard } from '../utils.js';

const grid = document.querySelector('[data-properties]');
const filters = document.querySelector('[data-filters]');
const search = document.querySelector('.search');

linkDateInputs(search.checkIn, search.checkOut);

document.querySelectorAll('[data-icon]').forEach((el) => el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon, el.closest('.trust') ? 24 : 15)));
document.querySelectorAll('[data-stars]').forEach((el) => (el.innerHTML = icon('star', 16).repeat(5)));

async function loadProperties(tag = '') {
  grid.setAttribute('aria-busy', 'true');
  try {
    const { properties } = await api(`/properties${tag ? `?tag=${tag}` : ''}`);
    grid.innerHTML = properties.map((property) => propertyCard(property)).join('');
  } catch {
    grid.innerHTML = '<p class="empty">Não foi possível carregar as casas. Tente recarregar a página.</p>';
  } finally {
    grid.removeAttribute('aria-busy');
  }
}

async function loadExperiences() {
  const row = document.querySelector('[data-experiences]');
  try {
    const { experiences } = await api('/experiences');
    row.innerHTML = experiences
      .slice(0, 4)
      .map(
        (e) => `
        <a class="exp-tile" href="/experiencias">
          <img src="${img(e.image, 600, 760)}" alt="${escapeHtml(e.name)}" loading="lazy">
          <div class="exp-tile__body">
            <span class="exp-tile__meta">${icon('clock', 14)} ${e.duration} · ${escapeHtml(e.category)}</span>
            <h3>${escapeHtml(e.name)}</h3>
            <span class="exp-tile__price">${money(e.price)} / pessoa</span>
          </div>
        </a>`,
      )
      .join('');
  } catch {
    row.remove();
  }
}

filters.addEventListener('click', (event) => {
  const chip = event.target.closest('[data-tag]');
  if (!chip) return;
  filters.querySelectorAll('.chip').forEach((el) => el.classList.toggle('is-active', el === chip));
  loadProperties(chip.dataset.tag);
});

loadProperties();
loadExperiences();
