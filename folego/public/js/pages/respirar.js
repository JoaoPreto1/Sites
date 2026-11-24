// Exercício guiado: cada ritmo é uma lista de fases [nome, segundos, tamanho da bola].
const RITMOS = {
  caixa: { nome: 'Caixa', diz: '4 · 4 · 4 · 4', para: 'Quatro tempos iguais. Acalma antes de uma conversa difícil.', fases: [['inspira', 4, 1], ['segura', 4, 1], ['expira', 4, 0], ['espera', 4, 0]] },
  coerencia: { nome: 'Coerência', diz: '5 · 5', para: 'Seis respirações por minuto. O coração abranda com elas.', fases: [['inspira', 5, 1], ['expira', 5, 0]] },
  calma: { nome: 'Calma', diz: '4 · 6', para: 'Expirar mais do que inspiras diz ao corpo que pode descansar.', fases: [['inspira', 4, 1], ['expira', 6, 0]] },
  dormir: { nome: '4-7-8', diz: 'para dormir', para: 'Inspira em 4, segura 7, expira devagar em 8. Faz na cama, de luz apagada.', fases: [['inspira', 4, 1], ['segura', 7, 1], ['expira', 8, 0]] },
};
const TEMPOS = [1, 3, 5];

const $ = (id) => document.getElementById(id);
const bola = $('bola'), fase = $('fase'), conta = $('conta'), botao = $('comecar'), feito = $('feito'), explica = $('explica');
let ritmo = 'caixa', minutos = 3, timer = null, fim = 0, idx = 0, faseFim = 0, ciclos = 0, raf = 0;

const grupo = (el, itens, atual, txt) => (el.innerHTML = itens.map(([id, html]) => `<button type="button" data-v="${id}" aria-pressed="${id === atual}">${html}</button>`).join(''));
grupo($('ritmos'), Object.entries(RITMOS).map(([id, r]) => [id, `${r.nome}<small>${r.diz}</small>`]), ritmo);
grupo($('tempos'), TEMPOS.map((m) => [String(m), `${m} min`]), String(minutos));

function escolher(el, valor) { el.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === valor))); }
$('ritmos').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b || timer) return; ritmo = b.dataset.v; escolher($('ritmos'), ritmo); explica.textContent = RITMOS[ritmo].para; });
$('tempos').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b || timer) return; minutos = +b.dataset.v; escolher($('tempos'), b.dataset.v); conta.textContent = `${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`; });

const tamanho = (alvo) => bola.style.setProperty('--s', alvo ? 1 : .62);
tamanho(0);

// a luz de fundo segue a bola: manda o valor de 0 a 1 a cada imagem
function luz() {
  const [, seg, alvo] = RITMOS[ritmo].fases[idx];
  const falta = Math.max(0, faseFim - performance.now()) / (seg * 1000);
  const antes = RITMOS[ritmo].fases[(idx + RITMOS[ritmo].fases.length - 1) % RITMOS[ritmo].fases.length][2];
  const v = alvo === antes ? alvo : alvo ? 1 - falta : falta;
  dispatchEvent(new CustomEvent('folego:respira', { detail: v }));
  raf = requestAnimationFrame(luz);
}

function proximaFase() {
  const fases = RITMOS[ritmo].fases;
  const [nome, seg, alvo] = fases[idx];
  fase.textContent = nome;
  bola.style.setProperty('--dur', `${seg}s`);
  tamanho(alvo);
  faseFim = performance.now() + seg * 1000;
  let s = seg;
  conta.textContent = s;
  clearInterval(timer);
  timer = setInterval(() => {
    s -= 1;
    if (s > 0) { conta.textContent = s; return; }
    idx = (idx + 1) % fases.length;
    if (idx === 0) ciclos += 1;
    if (Date.now() >= fim && idx === 0) return parar(true);
    proximaFase();
  }, 1000);
}

function comecar() {
  fim = Date.now() + minutos * 60e3; idx = 0; ciclos = 0;
  feito.textContent = '';
  botao.textContent = 'Parar';
  document.body.classList.add('a-respirar');
  proximaFase();
  cancelAnimationFrame(raf); luz();
}

function parar(acabou) {
  clearInterval(timer); timer = null; cancelAnimationFrame(raf);
  dispatchEvent(new CustomEvent('folego:respira', { detail: null }));
  bola.style.setProperty('--dur', '1.5s'); tamanho(0);
  fase.textContent = acabou ? 'pronto' : 'pronto?';
  conta.textContent = `${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
  botao.textContent = acabou ? 'Outra vez' : 'Começar';
  document.body.classList.remove('a-respirar');
  if (acabou) {
    feito.textContent = `Fizeste ${ciclos} ${ciclos === 1 ? 'ciclo' : 'ciclos'} de ${RITMOS[ritmo].nome.toLowerCase()}. Bem feito.`;
    try { const n = Number(localStorage.getItem('folego.respiracoes') || 0) + 1; localStorage.setItem('folego.respiracoes', String(n)); } catch {}
  }
}

botao.addEventListener('click', () => (timer ? parar(false) : comecar()));
addEventListener('keydown', (e) => { if (e.key === ' ' && e.target === document.body) { e.preventDefault(); botao.click(); } });
