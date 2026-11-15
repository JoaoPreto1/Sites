import { cover, coverSrcset, escapeHtml, grade, price } from '../../public/js/shared/format.js';
import { icons } from '../../public/js/shared/icons.js';

export { escapeHtml };

const TAGS = ['', 'tag--pink', 'tag--mint', 'tag--orange'];

// Capa com o vinil a espreitar, o preço escrito à mão e o botão de ouvir
export function recordCard(record, { index = 0, eager = false, sizes = '(max-width: 600px) 45vw, 240px', reveal = true } = {}) {
  const name = `${record.artist} — ${record.title}`;
  const loading = eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
  return `
    <article class="record-card${reveal ? ' reveal' : ''}" style="--d:${(index % 5) * 0.06}s">
      <div class="sleeve" data-sleeve="${record.id}" style="--label:${record.color}">
        <span class="sleeve__vinyl" aria-hidden="true"></span>
        <img class="sleeve__cover" src="${cover(record, 300)}" srcset="${coverSrcset(record)}" sizes="${sizes}" width="600" height="600" alt="Capa de ${escapeHtml(name)}" ${loading}>
        <span class="tag ${TAGS[index % TAGS.length]}">${price(record.price)}</span>
        <button class="record-card__play" type="button" data-play="${record.id}" aria-pressed="false" aria-label="Ouvir ${escapeHtml(name)}">${icons.play}${icons.pause}</button>
      </div>
      <h3><a href="/discos/${record.id}">${escapeHtml(record.artist)}</a></h3>
      <p>${escapeHtml(record.title)}</p>
      <div class="record-card__meta"><span>${record.year} · ${escapeHtml(record.label)}</span><span class="chip">${grade(record)}</span></div>
    </article>`;
}

export const gradeLegend = (grades) => `
  <dl class="grades">
    ${grades.map((g) => `<div><dt>${g.code}</dt><dd>${g.note}</dd></div>`).join('')}
  </dl>`;
