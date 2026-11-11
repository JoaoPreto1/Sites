import { api } from '../api.js';
import { icon } from '../icons.js';
import { escapeHtml, img, money } from '../utils.js';

const grid = document.querySelector('[data-experiences]');
const featured = document.querySelector('[data-featured]');
const filters = document.querySelector('[data-filters]');
let experiences = [];

document.querySelectorAll('[data-icon]').forEach((el) => el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon, 24)));

function featuredMarkup(e) {
  return `
    <article class="featured">
      <img src="${img(e.image, 1200, 800)}" alt="${escapeHtml(e.name)}">
      <div class="featured__body">
        <span class="tag">A mais procurada</span>
        <h3>${escapeHtml(e.name)}</h3>
        <p>${escapeHtml(e.summary)}</p>
        <div class="featured__meta">
          <span>${icon('clock', 15)} ${e.duration}</span>
          <span>${icon('users', 15)} Até 8 pessoas</span>
          <span>${icon('boat', 15)} ${escapeHtml(e.category)}</span>
        </div>
        <div class="featured__price">
          <span><strong>${money(e.price)}</strong> / pessoa</span>
          <a class="btn btn--sea" href="/alojamentos">Juntar à estadia</a>
        </div>
      </div>
    </article>`;
}

function card(e) {
  return `
    <article class="exp-card">
      <div class="exp-card__media">
        <img src="${img(e.image, 800, 600)}" alt="${escapeHtml(e.name)}" loading="lazy">
        <span class="tag">${escapeHtml(e.category)}</span>
      </div>
      <div class="exp-card__body">
        <h3>${escapeHtml(e.name)}</h3>
        <p>${escapeHtml(e.summary)}</p>
        <div class="exp-card__footer"><span>${icon('clock', 15)} ${e.duration}</span><span><strong>${money(e.price)}</strong> / pessoa</span></div>
      </div>
    </article>`;
}

function render(category = '') {
  const list = experiences.filter((e) => !category || e.category === category);
  const [first, ...rest] = list;
  featured.innerHTML = first ? featuredMarkup(first) : '';
  const custom = `
    <a class="exp-custom" href="/contactos">
      ${icon('sparkle', 28)}
      <h3>Quer algo à medida?</h3>
      <p>Pedidos de casamento, aniversários, passeios privados de barco. Diga-nos o que imagina.</p>
      <span class="link">Falar connosco</span>
    </a>`;
  grid.innerHTML = rest.map(card).join('') + (rest.length % 3 ? custom : '');
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
