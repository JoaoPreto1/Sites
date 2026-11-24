import { AULAS, PROFESSORAS, proximas, diaCurto, dataLonga } from '../dados.js';

const filtros = document.getElementById('filtros');
const dias = document.getElementById('dias');
const contagem = document.getElementById('contagem');
const lista = proximas(7);
const params = new URLSearchParams(location.search);
let tipo = AULAS[params.get('tipo')] ? params.get('tipo') : 'todas';

filtros.innerHTML = [['todas', 'Todas'], ...Object.entries(AULAS).map(([id, a]) => [id, a.nome])]
  .map(([id, nome]) => `<button type="button" data-tipo="${id}" aria-pressed="${id === tipo}">${nome}</button>`).join('');

const hora = (h) => h.replace(/^0/, '');
const agora = new Date();

function mostrar() {
  const vistas = lista.filter((a) => tipo === 'todas' || a.aula === tipo);
  const porDia = new Map();
  vistas.forEach((a) => {
    const k = a.quando.toDateString();
    if (!porDia.has(k)) porDia.set(k, []);
    porDia.get(k).push(a);
  });
  if (!vistas.length) {
    dias.innerHTML = '<p class="vazio">Não há aulas deste tipo nos próximos sete dias.</p>';
  } else {
    dias.innerHTML = [...porDia.values()].map((aulas) => {
      const d = aulas[0].quando, curto = diaCurto(d);
      return `<section class="dia"><h2>${curto === 'hoje' || curto === 'amanhã' ? curto[0].toUpperCase() + curto.slice(1) : dataLonga(d)}<small>${curto === 'hoje' || curto === 'amanhã' ? dataLonga(d) : ''}</small></h2>
        <ul class="aulas">${aulas.map((a) => {
          const em = (a.quando - agora) / 6e4;
          const cheia = a.livres === 0;
          return `<li class="aula vidro">
            <time datetime="${a.quando.toISOString()}">${hora(a.hora)}</time>
            <div><h3>${AULAS[a.aula].nome}${em < 120 ? '<span class="agora">daqui a pouco</span>' : ''}</h3><p>${PROFESSORAS[a.prof].nome} · ${a.sala} · ${a.nivel}</p></div>
            <p class="livres"><b>${cheia ? "Cheia" : a.livres}</b> ${cheia ? 'lista de espera' : a.livres === 1 ? 'lugar livre' : 'lugares livres'}</p>
            <a class="btn ${cheia ? 'btn--vidro' : ''}" href="/marcar?aula=${a.id}">${cheia ? 'Ficar em espera' : 'Marcar'}<span class="sr"> ${AULAS[a.aula].nome}, ${dataLonga(a.quando)} às ${hora(a.hora)}</span></a>
          </li>`;
        }).join('')}</ul></section>`;
    }).join('');
  }
  contagem.textContent = `${vistas.length} ${vistas.length === 1 ? 'aula' : 'aulas'} nos próximos sete dias.`;
}

filtros.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  tipo = b.dataset.tipo;
  filtros.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  const url = new URL(location.href);
  if (tipo === 'todas') url.searchParams.delete('tipo'); else url.searchParams.set('tipo', tipo);
  history.replaceState(null, '', url);
  mostrar();
});
mostrar();
