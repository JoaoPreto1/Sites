import { api } from '../api.js';
import { createLightbox } from '../lightbox.js';
import { escapeHtml, img } from '../utils.js';

const root = document.querySelector('[data-project]');
const slug = decodeURIComponent(window.location.pathname.split('/')[2] ?? '');

function render(project, next) {
  document.title = `${project.title} · Lente Studio`;
  const photos = [project.cover, ...project.gallery];

  root.innerHTML = `
    <section class="project-head">
      <nav class="crumbs mono"><a href="/trabalho">Trabalho</a> / <a href="/trabalho?categoria=${encodeURIComponent(project.category)}">${escapeHtml(project.category)}</a> / ${escapeHtml(project.title)}</nav>
      <h1>${escapeHtml(project.title)}<span class="red">.</span></h1>
      <div class="project-meta">
        <div><span class="mono">Cliente</span>${escapeHtml(project.client)}</div>
        <div><span class="mono">Ano</span>${project.year}</div>
        <div><span class="mono">Local</span>${escapeHtml(project.location)}</div>
        <div><span class="mono">Serviços</span>${project.services.map(escapeHtml).join(', ')}</div>
      </div>
    </section>

    <div class="project-cover">
      <button type="button" data-photo="0"><img src="${img(project.cover, 2000, 1300)}" alt="${escapeHtml(project.title)}"></button>
    </div>

    <section class="project-body">
      <span class="mono red">(Sobre o projeto)</span>
      <div class="form-grid">
        <p class="project-body__lead">${escapeHtml(project.summary)}</p>
        <p class="project-body__text">${escapeHtml(project.description)}</p>
      </div>
      <div>
        <span class="mono">Equipa</span>
        <ul>${project.team.map((member) => `<li>${escapeHtml(member)}</li>`).join('')}</ul>
      </div>
    </section>

    <section class="project-gallery">
      ${project.gallery
        .map((url, i) => `<button type="button" data-photo="${i + 1}"><img src="${img(url, 1400)}" alt="${escapeHtml(project.title)}, imagem ${i + 2}" loading="lazy"></button>`)
        .join('')}
    </section>

    <a class="next-project" href="/trabalho/${next.slug}">
      <img src="${img(next.cover, 2000, 900)}" alt="" loading="lazy">
      <div class="next-project__inner">
        <span class="mono">Próximo projeto — ${escapeHtml(next.category)}</span>
        <h2>${escapeHtml(next.title)} →</h2>
      </div>
    </a>`;

  const lightbox = createLightbox(document.querySelector('[data-lightbox]'), photos);
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-photo]');
    if (button) lightbox.open(Number(button.dataset.photo));
  });
}

try {
  const { project, next } = await api(`/projects/${encodeURIComponent(slug)}`);
  render(project, next);
} catch (error) {
  root.innerHTML = `
    <section class="page-head">
      <span class="mono red">Erro ${error.status ?? ''}</span>
      <h1>Projeto não encontrado.</h1>
      <p><a class="link" href="/trabalho">Ver todo o trabalho</a></p>
    </section>`;
}
