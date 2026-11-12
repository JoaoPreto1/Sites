import { api } from '../api.js';
import { icon } from '../icons.js';
import { escapeHtml, initialData, money } from '../utils.js';

const root = document.querySelector('[data-services]');
const serviceIcons = { Fotografia: 'camera', Vídeo: 'video', 'Direção de arte': 'palette', Retoque: 'brush' };

try {
  const { services } = initialData() ?? (await api('/services'));
  root.innerHTML = services
    .map(
      (s) => `
      <article class="service-card">
        <div class="service-card__head">
          <span class="service-card__icon">${icon(serviceIcons[s.name], 26)}</span>
          <p class="service-card__price">desde<strong>${money(s.from)}</strong>${escapeHtml(s.unit)}</p>
        </div>
        <h2>${escapeHtml(s.name)}</h2>
        <p>${escapeHtml(s.summary)}</p>
        <ul>${s.includes.map((item) => `<li>${icon('check', 16)} ${escapeHtml(item)}</li>`).join('')}</ul>
        <a class="btn btn--line" href="/orcamento?servico=${encodeURIComponent(s.name)}">Pedir proposta</a>
      </article>`,
    )
    .join('');
} catch {
  root.innerHTML = '<p class="empty">Não foi possível carregar os serviços.</p>';
}
