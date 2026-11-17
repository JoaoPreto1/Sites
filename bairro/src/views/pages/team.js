import { STUDIO } from '../../config/studio.js';
import { esc, photo, win } from '../components.js';

function person(p) {
  return `<li class="card">
    ${photo({ id: p.photo, alt: `Retrato de ${p.name}`, widths: [240, 360, 480], sizes: '180px', ratio: 1.15, cls: 'card__photo' })}
    <div class="card__text">
      <h2 class="card__name">${esc(p.name)}</h2>
      <p class="card__role">${esc(p.role)}</p>
      <p>${esc(p.bio)}</p>
      <p class="small mute"><b>Gosta de:</b> ${esc(p.likes)}</p>
    </div>
  </li>`;
}

const cat = `<li class="card card--cat">
  <pre class="card__ascii" aria-hidden="true">
 /\\_/\\
( o.o )
 > ^ <</pre>
  <div class="card__text">
    <h2 class="card__name">Pixel</h2>
    <p class="card__role">Gato do estúdio</p>
    <p>Chegou numa caixa de papel de uma gráfica em 2022 e nunca mais saiu. Dorme em cima das provas impressas e aparece em todas as videochamadas.</p>
    <p class="small mute"><b>Gosta de:</b> caixas de cartão, teclados quentes, o sol das 16h</p>
  </div>
</li>`;

function calendar(months) {
  return `<section class="cal" aria-labelledby="cal-title">
    <h2 id="cal-title" class="cal__title">Vagas para começar um projeto</h2>
    <p class="mute small">Fazemos no máximo três projetos novos por mês, para cada um ter atenção a sério.</p>
    <ol class="cal__months">
      ${months
        .map(
          (m) => `<li class="cal__month${m.free ? '' : ' is-full'}">
            <span class="cal__name">${m.name} <span class="mute">${m.year}</span></span>
            <span class="cal__slots" aria-hidden="true">${Array.from({ length: m.slots }, (_, i) => `<i class="${i < m.taken ? 'is-taken' : ''}"></i>`).join('')}</span>
            <span class="cal__free">${m.free ? `${m.free} ${m.free === 1 ? 'vaga' : 'vagas'}` : 'cheio'}</span>
          </li>`,
        )
        .join('')}
    </ol>
    <a class="btn btn--primary" href="/orcamento">Reservar uma vaga</a>
  </section>`;
}

export function teamWindows({ team, months }) {
  const body = `<div class="team">
    <div class="team__intro">
      <h1>Equipa</h1>
      <p>Somos três, trabalhamos numa sala do segundo andar da Rua do Almada e fazemos tudo dentro de casa: não passamos trabalho a outros estúdios. Quem fala consigo na primeira reunião é quem desenha.</p>
    </div>
    <ul class="cards">
      ${team.map(person).join('')}
      ${cat}
    </ul>
    <div class="team__bottom">
      ${calendar(months)}
      <section class="visit" aria-labelledby="visit-title">
        ${photo({ id: '1599420186946-7b6fb4e297f0', alt: 'Mesa de trabalho com desenhos e marcadores', widths: [400, 600], sizes: '(min-width: 900px) 360px, 100vw', ratio: 0.6, cls: 'visit__photo' })}
        <h2 id="visit-title" class="cal__title">Venha conhecer o estúdio</h2>
        <p>${STUDIO.street}, ${STUDIO.postalCode} ${STUDIO.city}<br>${STUDIO.hours}</p>
        <p><a class="link" href="mailto:${STUDIO.email}">${STUDIO.email}</a> · <a class="link" href="tel:${STUDIO.phone.replace(/\s/g, '')}">${STUDIO.phoneLabel}</a></p>
        <p class="small mute">O café é de saco e o gato não morde.</p>
      </section>
    </div>
  </div>`;

  return [
    {
      id: 'equipa',
      label: 'Equipa',
      ico: 'folder',
      html: win({
        id: 'equipa',
        url: '/equipa',
        title: 'equipa',
        label: 'Equipa',
        ico: 'folder',
        primary: true,
        x: 50,
        y: 30,
        w: 1080,
        cls: 'team-win',
        body,
        status: `<span>${team.length + 1} contactos</span><span>${STUDIO.street}, ${STUDIO.city}</span>`,
      }),
    },
  ];
}
