import { EQUIPAMENTOS } from '../../config/municipio.js';
import { esc, icon, pageHero } from '../html.js';

const GROUPS = [
  ['cultura', 'Cultura', 'Museus, biblioteca, auditório e arquivo.'],
  ['desporto', 'Desporto', 'Piscinas, pavilhão e estádio.'],
  ['servicos', 'Serviços', 'Turismo, ecocentro e mercado.'],
];

const card = (e, i) => `<article class="info equip" id="${e.id}" data-reveal style="--d:${(i % 3) * 60}ms">
  <h3>${esc(e.name)}</h3>
  <p>${esc(e.text)}</p>
  <ul class="equip__meta">
    <li>${icon.pin}<span>${esc(e.place)}</span></li>
    ${e.hours ? `<li>${icon.clock}<span>${esc(e.hours)}</span></li>` : ''}
    ${e.phone ? `<li>${icon.phone}<a href="tel:+351${e.phone.replace(/\s/g, '')}">${esc(e.phone)}</a></li>` : ''}
  </ul>
</article>`;

export const equipamentosBody = () => `${pageHero({ photoKey: 'matriz', crumbs: [['Viver', '/viver'], ['Equipamentos']], title: 'Equipamentos <i>municipais</i>', lead: 'Onde ficam, o que se faz em cada um e como contactar: museus, biblioteca, piscinas, pavilhão, turismo e ecocentro.' })}

<section class="sec wrap">
  <div class="filters" data-filter="#equipamentos" role="group" aria-label="Filtrar equipamentos">
    <button type="button" class="on" data-cat="todos" aria-pressed="true">Todos</button>${GROUPS.map(([v, l]) => `<button type="button" data-cat="${v}" aria-pressed="false">${l}</button>`).join('')}
  </div>
  <div id="equipamentos">
    ${GROUPS.map(
      ([v, label, text]) => `<section class="equip-group" id="${v}" data-cat="${v}">
      <div class="h"><div><p class="k">${label}</p><h2>${text}</h2></div></div>
      <div class="grid3">${EQUIPAMENTOS.filter((e) => e.type === v).map(card).join('')}</div>
    </section>`,
    ).join('\n    ')}
  </div>
  <p class="muted" style="margin-top:28px">Os horários dos museus, da biblioteca e das piscinas mudam ao longo do ano: antes de ir, confirme pelo telefone de cada equipamento.</p>
</section>`;
