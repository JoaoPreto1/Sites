import { escapeHtml, longDate } from '../../../public/js/shared/format.js';

const tilt = (i) => [-3, 2.5, -1.5, 3, -2, 1.5, -2.5, 2][i % 8];

export function wantCard(w, i = 0) {
  const found = w.status === 'encontrado';
  return `
    <article class="card-note${found ? ' card-note--found' : ''}" style="--r:${tilt(i)}deg">
      <span class="card-note__head">${found ? 'Encontrado ✓' : 'Procura-se'}</span>
      <p>${escapeHtml(w.artist)} — ${escapeHtml(w.title)}</p>
      <small>— ${escapeHtml(w.name)} · ${w.minGrade} ou melhor · até ${w.maxPrice}&nbsp;€${w.note ? `<br>${escapeHtml(w.note)}` : ''}${found && w.holdUntil ? `<br>guardado até ${longDate(w.holdUntil)}` : ''}</small>
    </article>`;
}

export function wantsPage({ wants, grades }) {
  const found = wants.filter((w) => w.status === 'encontrado').length;
  return `
  <section class="wall wrap">
    <header class="page-head wall__head">
      <div>
        <p class="kicker">Lista de procura · ${wants.length} discos na parede${found ? ` · ${found} já ${found === 1 ? 'apareceu' : 'apareceram'}` : ''}</p>
        <h1 class="display">Procura-se.</h1>
      </div>
      <p>Há discos que não aparecem por mais que se escave. Pendura o teu: sempre que entra uma coleção na loja, a primeira coisa que fazemos é ver a parede. Se aparecer, guardamo-lo 48 horas com o teu nome.</p>
    </header>

    <div class="wall__grid">
      <div class="cork wall__cork" data-wall>${wants.map(wantCard).join('')}</div>

      <aside class="pin-form box">
        <h2>Pendura o teu</h2>
        <p>Sem custos e sem compromisso. Avisamos por email quando entrar.</p>
        <form data-want novalidate>
          <label class="field"><span>Artista</span><input class="input" name="artist" maxlength="80" required placeholder="Sérgio Godinho"></label>
          <label class="field"><span>Disco</span><input class="input" name="title" maxlength="100" required placeholder="Pré-Histórias"></label>
          <fieldset class="field grade-pick">
            <span>Estado mínimo</span>
            <div>${grades.map((g) => `<label><input type="radio" name="minGrade" value="${g.code}"${g.code === 'VG' ? ' checked' : ''}><b>${g.code}</b></label>`).join('')}</div>
          </fieldset>
          <label class="field"><span>Pago até (€)</span><input class="input" name="maxPrice" type="number" min="1" max="1000" value="40" inputmode="numeric" required></label>
          <label class="field"><span>Nota (opcional)</span><input class="input" name="note" maxlength="140" placeholder="1.ª edição, capa aberta…"></label>
          <p class="form-error" data-error hidden></p>
          <button class="btn btn--yellow" type="submit">Pendurar na parede</button>
          <p class="pin-form__login" data-login-hint hidden>Precisas de <a href="/entrar?next=/procura">entrar na tua conta</a> para pendurar um disco — é para te podermos avisar.</p>
        </form>
      </aside>
    </div>
  </section>`;
}
