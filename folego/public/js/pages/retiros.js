import { retiros, dataCurta } from '../dados.js';

const PROGRAMA = {
  sintra: ['Sexta: chegada, chá e yin ao fim da tarde', 'Sábado: caminhada no nevoeiro, almoço na horta, respiração à noite', 'Domingo: hatha ao nascer do sol e regresso depois do almoço'],
  alentejo: ['Sexta: chegada e piscina antes do jantar', 'Sábado: respiração ao nascer do sol e vinyasa à sombra', 'Domingo: dia em silêncio, só com práticas lentas', 'Segunda: última prática e regresso'],
  geres: ['Sexta: chegada, lareira e yin', 'Sábado: banho de rio, vinyasa na eira', 'Domingo: caminhada até à cascata e regresso'],
};

const lista = document.getElementById('lista');
lista.innerHTML = retiros().map((r) => {
  const restam = Math.max(2, r.lugares - ((r.inicio.getDate() * 3) % 9));
  return `<article class="ret vidro" id="${r.id}">
    <p class="quando">${dataCurta(r.inicio)}<small>até ${dataCurta(r.fim)} · ${r.dias} dias</small></p>
    <div><h2>${r.nome}</h2><p>${r.onde}. ${r.tom}</p><ol>${PROGRAMA[r.id].map((d) => `<li>${d}</li>`).join('')}</ol></div>
    <div class="preco"><b>${r.preco} €</b><span>${restam} de ${r.lugares} lugares por ocupar</span><a class="btn" href="/marcar?retiro=${r.id}">Quero ir<span class="sr"> ao retiro ${r.nome}</span></a></div>
  </article>`;
}).join('');
