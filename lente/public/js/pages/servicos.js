import { api } from '../api.js';
import { icon } from '../icons.js';
import { escapeHtml, money, pad } from '../utils.js';

const root = document.querySelector('[data-services]');
const serviceIcons = { Fotografia: 'camera', Vídeo: 'video', 'Direção de arte': 'palette', Retoque: 'brush' };

try {
  const { services } = await api('/services');
  root.innerHTML = services
    .map(
      (s, i) => `
      <article class="service-row">
        <span class="mono">(${pad(i + 1, 2)})</span>
        <div>
          <h2>${icon(serviceIcons[s.name], 36)} ${escapeHtml(s.name)}</h2>
          <p class="service-row__summary">${escapeHtml(s.summary)}</p>
        </div>
        <ul>${s.includes.map((item) => `<li>${icon('check', 16)} ${escapeHtml(item)}</li>`).join('')}</ul>
        <div class="service-row__price">
          <div><span class="mono">Desde</span><strong>${money(s.from)}</strong><span class="mono muted">${escapeHtml(s.unit)}</span></div>
          <a class="btn btn--line" href="/orcamento?servico=${encodeURIComponent(s.name)}">Pedir proposta ↗</a>
        </div>
      </article>`,
    )
    .join('');
} catch {
  root.innerHTML = '<p class="empty">Não foi possível carregar os serviços.</p>';
}
