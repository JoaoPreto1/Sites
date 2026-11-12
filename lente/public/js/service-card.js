import { icon } from './icons.js';
import { escapeHtml, money } from './utils.js';

// Usado pelo servidor (HTML inicial) e pelo browser, para os dois desenharem o mesmo cartão
const serviceIcons = { Fotografia: 'camera', Vídeo: 'video', 'Direção de arte': 'palette', Retoque: 'brush' };

export function serviceCard(s) {
  return `
      <article class="service-card">
        <div class="service-card__head">
          <span class="service-card__icon">${icon(serviceIcons[s.name], 26)}</span>
          <p class="service-card__price">desde<strong>${money(s.from)}</strong>${escapeHtml(s.unit)}</p>
        </div>
        <h2>${escapeHtml(s.name)}</h2>
        <p>${escapeHtml(s.summary)}</p>
        <ul>${s.includes.map((item) => `<li>${icon('check', 16)} ${escapeHtml(item)}</li>`).join('')}</ul>
        <a class="btn btn--line" href="/orcamento?servico=${encodeURIComponent(s.name)}">Pedir proposta</a>
      </article>`;
}
