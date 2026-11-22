// Catálogo de serviços: pesquisa e categorias, com o estado guardado no endereço
const catalog = document.querySelector('[data-catalog]');
const input = catalog.querySelector('input');
const items = [...catalog.querySelectorAll('details.svc')];
const buttons = [...document.querySelectorAll('.cats button')];
const empty = catalog.querySelector('.empty');
const counter = catalog.querySelector('[data-count]');

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const texts = new Map(items.map((d) => [d, norm(d.textContent)]));
let cat = buttons.find((b) => b.classList.contains('on'))?.dataset.cat ?? 'todos';

function apply({ push = false } = {}) {
  const q = norm(input.value.trim());
  const words = q.split(/\s+/).filter(Boolean);
  let shown = 0;
  for (const d of items) {
    const show = (cat === 'todos' || d.dataset.cat === cat) && words.every((w) => texts.get(d).includes(w));
    d.hidden = !show;
    if (show) shown++;
  }
  empty.style.display = shown ? 'none' : 'block';
  counter.textContent = q || cat !== 'todos' ? `${shown} ${shown === 1 ? 'serviço' : 'serviços'}` : '';

  if (push) {
    const params = new URLSearchParams();
    if (cat !== 'todos') params.set('categoria', cat);
    if (input.value.trim()) params.set('q', input.value.trim());
    history.replaceState(null, '', `${location.pathname}${params.size ? `?${params}` : ''}${location.hash}`);
  }
}

buttons.forEach((b) =>
  b.addEventListener('click', () => {
    buttons.forEach((x) => x.classList.toggle('on', x === b));
    cat = b.dataset.cat;
    apply({ push: true });
  }),
);
input.addEventListener('input', () => apply({ push: true }));

// Um endereço com #servico abre esse serviço
function openFromHash() {
  const target = location.hash && document.getElementById(location.hash.slice(1));
  if (target?.tagName === 'DETAILS') {
    target.hidden = false;
    target.open = true;
    target.scrollIntoView({ block: 'center' });
  }
}

apply();
openFromHash();
window.addEventListener('hashchange', openFromHash);
