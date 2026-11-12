import { api } from '../api.js';
import { icon } from '../icons.js';
import { escapeHtml, FEATURED_SIZES, initialData, money, workCard } from '../utils.js';

const featured = document.querySelector('[data-featured]');
const services = document.querySelector('[data-services]');

const serviceIcons = { Fotografia: 'camera', Vídeo: 'video', 'Direção de arte': 'palette', Retoque: 'brush' };

function renderProjects(projects) {
  const highlights = projects.filter((p) => p.featured).slice(0, 4);
  featured.innerHTML = highlights.map((project) => workCard(project, undefined, { sizes: FEATURED_SIZES })).join('');
}

function renderServices(list) {
  services.innerHTML = list
    .map(
      (s) => `
      <a class="service" href="/servicos">
        ${icon(serviceIcons[s.name], 30)}
        <h3>${escapeHtml(s.name)}</h3>
        <p>${escapeHtml(s.summary)}</p>
        <span class="service__from">Desde ${money(s.from)} ${s.unit} ${icon('arrowUp', 18)}</span>
      </a>`,
    )
    .join('');
}

async function init() {
  try {
    const data = initialData() ?? { ...(await api('/projects')), ...(await api('/services')) };
    renderProjects(data.projects);
    renderServices(data.services);
  } catch {
    featured.innerHTML = '<p class="empty">Não foi possível carregar os projetos.</p>';
  }
}

init();
