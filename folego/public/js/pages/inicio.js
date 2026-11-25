import { AULAS, proximas, diaCurto, retiros, dataCurta } from '../dados.js';

const quieto = matchMedia('(prefers-reduced-motion: reduce)');

// a palavra e o anel acompanham a luz: 4 s a inspirar, 4 s a expirar
const palavra = document.querySelector('.respira .palavra');
const anel = document.querySelector('.anel');
let fase = 0;
function respirar() {
  if (quieto.matches) return;
  fase = 1 - fase;
  palavra.style.opacity = 0;
  setTimeout(() => {
    palavra.textContent = fase ? 'expira' : 'inspira';
    palavra.style.opacity = 1;
    palavra.style.transform = `scale(${fase ? .92 : 1.06})`;
    anel.style.setProperty('--s', fase ? .8 : 1.12);
  }, 300);
}
if (!quieto.matches) { anel.style.setProperty('--s', 1.12); palavra.style.transform = 'scale(1.06)'; setInterval(respirar, 4000); }

// as próximas quatro aulas, de tipos diferentes
const prox = document.getElementById('proximas');
const vistas = new Set();
const escolhidas = proximas(7).filter((a) => !vistas.has(a.aula) && vistas.add(a.aula)).slice(0, 4);
prox.innerHTML = escolhidas.map((a) => `<a class="chip" href="/marcar?aula=${a.id}"><b>${AULAS[a.aula].nome}</b> · ${diaCurto(a.quando)} ${a.hora.replace(':', 'h').replace(/^0/, '')}</a>`).join('');

// cada tipo de aula com a linha do seu ritmo
const linha = (ritmo) => {
  const amp = [0, 6, 12, 18][ritmo], ondas = [1, 2, 3, 5][ritmo];
  let d = 'M2 23';
  for (let x = 2; x <= 298; x += 4) d += ` L${x} ${(23 - Math.sin((x / 296) * Math.PI * 2 * ondas) * amp * (ritmo === 3 ? Math.abs(Math.sin(x / 20)) : 1)).toFixed(1)}`;
  return `<svg viewBox="0 0 300 46" preserveAspectRatio="none" aria-hidden="true"><path d="${d}"/></svg>`;
};
const nomeRitmo = ['quieto', 'lento', 'contínuo', 'que aquece'];
document.getElementById('tipos').innerHTML = Object.entries(AULAS).map(([id, a]) => `
  <a class="tipo vidro" href="/aulas?tipo=${id}">${linha(a.ritmo)}<small>ritmo ${nomeRitmo[a.ritmo]}</small><h3>${a.nome}</h3><p>${a.resumo}</p></a>`).join('');

const [r] = retiros();
document.getElementById('retiro-data').textContent = `${dataCurta(r.inicio)} – ${dataCurta(r.fim)}`;
document.getElementById('retiro-nome').textContent = `${r.nome} · ${r.onde}. ${r.tom}`;

