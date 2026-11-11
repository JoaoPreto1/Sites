import { api } from '../api.js';
import { icon } from '../icons.js';
import { escapeHtml, img, money, pad, workCard } from '../utils.js';

const featured = document.querySelector('[data-featured]');
const index = document.querySelector('[data-index]');
const preview = document.querySelector('[data-preview]');
const services = document.querySelector('[data-services]');

const serviceIcons = { Fotografia: 'camera', Vídeo: 'video', 'Direção de arte': 'palette', Retoque: 'brush' };

document.querySelectorAll('[data-icon]').forEach((el) => el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon, 18)));

async function loadProjects() {
  try {
    const { projects } = await api('/projects');
    const highlights = projects.filter((p) => p.featured).slice(0, 4);
    featured.innerHTML = highlights.map((project) => workCard(project)).join('');

    index.innerHTML = projects
      .map(
        (p, i) => `
        <a class="index__row" href="/trabalho/${p.slug}" data-cover="${img(p.cover, 520, 650)}">
          <span class="mono">${pad(i + 1)}</span>
          <strong>${escapeHtml(p.title)}</strong>
          <span class="mono">${escapeHtml(p.category)} · ${escapeHtml(p.client)}</span>
          <span class="mono">${escapeHtml(p.location)}</span>
          <span class="mono">${p.year} ↗</span>
        </a>`,
      )
      .join('');
  } catch {
    featured.innerHTML = '<p class="empty">Não foi possível carregar os projetos.</p>';
  }
}

async function loadServices() {
  try {
    const { services: list } = await api('/services');
    services.innerHTML = list
      .map(
        (s, i) => `
        <a class="service" href="/servicos">
          <span class="mono">(${pad(i + 1, 2)})</span>
          ${icon(serviceIcons[s.name], 28)}
          <h3>${escapeHtml(s.name)}</h3>
          <p>${escapeHtml(s.summary)}</p>
          <span class="service__from mono">Desde ${money(s.from)} ${s.unit} ${icon('arrowUp', 18)}</span>
        </a>`,
      )
      .join('');
  } catch {
    services.remove();
  }
}

// Mostra a capa do projeto a seguir o rato na lista
function setupPreview() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  index.addEventListener('mouseover', (event) => {
    const row = event.target.closest('[data-cover]');
    if (!row) return;
    preview.src = row.dataset.cover;
    preview.hidden = false;
  });
  index.addEventListener('mouseleave', () => (preview.hidden = true));
  index.addEventListener('mousemove', (event) => {
    preview.style.left = `${event.clientX + 160}px`;
    preview.style.top = `${event.clientY}px`;
  });
}

loadProjects();
loadServices();
setupPreview();
