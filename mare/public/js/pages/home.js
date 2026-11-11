import { api } from '../api.js';
import { linkDateInputs } from '../date-range.js';
import { escapeHtml, money, propertyCard } from '../utils.js';

const grid = document.querySelector('[data-properties]');
const filters = document.querySelector('[data-filters]');
const search = document.querySelector('.search');

linkDateInputs(search.checkIn, search.checkOut);

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
  const list = document.querySelector('[data-experiences]');
  try {
    const { experiences } = await api('/experiences');
    list.innerHTML = experiences
      .slice(0, 4)
      .map((experience) => `<li>${escapeHtml(experience.name)} <span>${money(experience.price)}</span></li>`)
      .join('');
  } catch {
    list.remove();
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
