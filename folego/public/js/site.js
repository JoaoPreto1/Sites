// Comum a todas as páginas: menu do telemóvel e a luz de fundo.
const botao = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');
if (botao && menu) {
  const fechar = () => { botao.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-aberto'); };
  botao.addEventListener('click', () => {
    const aberto = botao.getAttribute('aria-expanded') === 'true';
    botao.setAttribute('aria-expanded', String(!aberto));
    document.body.classList.toggle('menu-aberto', !aberto);
  });
  addEventListener('keydown', (e) => e.key === 'Escape' && fechar());
  menu.addEventListener('click', (e) => e.target.closest('a') && fechar());
}

// a luz só arranca depois de a página estar pronta, para não atrasar o conteúdo
const tela = document.querySelector('canvas.luz');
if (tela) {
  const acender = () => import('./luz.js').then(({ iniciarLuz }) => iniciarLuz(tela));
  // até lá fica o gradiente do CSS; a luz entra devagar uns segundos depois, ou logo ao primeiro toque
  let feito = false;
  const uma = () => { if (!feito) { feito = true; acender(); } };
  const depois = () => setTimeout(uma, 2500);
  if (document.readyState === 'complete') depois(); else addEventListener('load', depois);
  ['pointerdown', 'keydown', 'scroll'].forEach((ev) => addEventListener(ev, uma, { once: true, passive: true }));
}

document.querySelectorAll('[data-ano]').forEach((el) => (el.textContent = new Date().getFullYear()));

const topo = document.querySelector('.topo');
if (topo) addEventListener('scroll', () => topo.classList.toggle('colado', scrollY > 40), { passive: true });
