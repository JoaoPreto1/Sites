import { toast } from '../utils.js';

// Filtro das notícias por tema
for (const group of document.querySelectorAll('[data-filter]')) {
  const list = document.querySelector(group.dataset.filter);
  const buttons = [...group.querySelectorAll('button')];
  for (const button of buttons) {
    button.addEventListener('click', () => {
      buttons.forEach((b) => {
        b.classList.toggle('on', b === button);
        b.setAttribute('aria-pressed', String(b === button));
      });
      list.querySelectorAll('[data-cat]').forEach((item) => {
        item.hidden = button.dataset.cat !== 'todos' && item.dataset.cat !== button.dataset.cat;
      });
    });
  }
}

// Partilhar uma notícia: usa o menu do sistema quando existe, senão copia a ligação
document.querySelector('[data-share]')?.addEventListener('click', async () => {
  const data = { title: document.title, url: location.href };
  try {
    if (navigator.share) await navigator.share(data);
    else {
      await navigator.clipboard.writeText(location.href);
      toast('Ligação copiada');
    }
  } catch {}
});
